# Backend/app/api/routes/template_routes.py
from fastapi import APIRouter, Depends, HTTPException, Body, Response
from fastapi.responses import FileResponse # Décommenté et utilisé
import os
import json # Utiliser json standard pour loads
import traceback
import logging
import shutil # Pour copier/déplacer le fichier
from datetime import datetime # Pour nom de fichier unique
import uuid # Pour nom de fichier unique

from Backend.app.generation_template.Exportation.generate_test import run_generation_for_fastapi
from Backend.app.models.models import User as db_User # Renommer pour éviter conflit avec User de Pydantic
from Backend.app.schemas.schemas import TemplateGenerationRequest
# from Backend.app.dependencies import get_db # get_db n'est pas directement utilisé ici, mais par get_current_user
from Backend.app.Auth.auth import get_current_user # Votre fonction d'authentification

router = APIRouter(
    # Si vous voulez que cet endpoint soit sous /api/v1/templates/generate-template
    # et que vous incluez ce routeur dans main.py avec app.include_router(template_router, prefix="/api/v1/templates")
    # alors vous n'avez pas besoin de préfixe ici.
    # Si vous voulez le préfixe ici, alors ne le mettez pas dans main.py lors de l'inclusion.
    # prefix="/api/v1/templates", # Optionnel, dépend de comment vous l'incluez dans main.py
    # tags=["Templates Generation Service"] # Optionnel
)
logger = logging.getLogger(__name__)

# Chemin où les ZIPs générés seront stockés DE MANIÈRE PERMANENTE
PERMANENT_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "generated_zips_permanent"))
os.makedirs(PERMANENT_STORAGE_DIR, exist_ok=True)
print(f"INFO (template_routes.py): Permanent ZIP storage directory: {PERMANENT_STORAGE_DIR}")


@router.post("/generate-template") # Le chemin final sera combinaison du préfixe du routeur et de ce chemin
async def generate_template_and_prepare_for_save(
    *,
    request_data: TemplateGenerationRequest = Body(...),
    current_user: db_User = Depends(get_current_user)
):
    logger.info(f"User {current_user.email} requested template generation with save intention.")
    path_of_zip_generated_by_script = None
    permanent_zip_file_path_on_server = None

    try:
        # 1. Parser JSON (si request_data.json_config est une chaîne)
        # Si TemplateGenerationRequest définit json_config comme Dict[str, Any],
        # alors FastAPI/Pydantic l'aura déjà parsé.
        if isinstance(request_data.json_config, str):
            try:
                config_dict = json.loads(request_data.json_config)
            except json.JSONDecodeError as e:
                logger.error(f"JSON Parsing error for string input: {e}", exc_info=True)
                raise HTTPException(status_code=422, detail=f"JSON string invalide: {str(e)}")
        elif isinstance(request_data.json_config, dict):
            config_dict = request_data.json_config # Déjà un dictionnaire
        else:
            raise HTTPException(status_code=422, detail="Format de json_config inattendu.")

        if not config_dict:
            raise ValueError("Le JSON fourni est vide ou invalide après parsing.")
        
        site_key_list = list(config_dict.keys())
        site_key = site_key_list[0] if site_key_list else "untitled_template"
        logger.info(f"Successfully processed JSON config for key: {site_key}")

        # 2. Appeler la fonction wrapper de génération
        logger.info(f"Calling generator wrapper function for key: {site_key}")
        try:
            path_of_zip_generated_by_script = run_generation_for_fastapi(config_dict)
            logger.info(f"Generator wrapper returned temporary path: {path_of_zip_generated_by_script}")

            if not path_of_zip_generated_by_script or not os.path.exists(path_of_zip_generated_by_script):
                 logger.error(f"Wrapper function finished but ZIP file is missing. Path: {path_of_zip_generated_by_script}")
                 raise RuntimeError("Generator did not produce a valid and existing ZIP file path.")
        except Exception as e_gen:
            logger.error(f"Exception during generation call:", exc_info=True)
            traceback.print_exc() # Pour le débogage
            raise HTTPException(status_code=500, detail=f"Erreur interne lors de la génération: {str(e_gen)}")

        # 3. Copier/Déplacer le fichier ZIP vers le stockage permanent
        original_zip_filename = os.path.basename(path_of_zip_generated_by_script)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
        permanent_filename = f"{current_user.id}_{site_key.lower().replace(' ', '_')}_{timestamp}_{uuid.uuid4().hex[:6]}.zip"
        permanent_zip_file_path_on_server = os.path.join(PERMANENT_STORAGE_DIR, permanent_filename)

        try:
            shutil.copy(path_of_zip_generated_by_script, permanent_zip_file_path_on_server)
            logger.info(f"Copied generated ZIP to permanent storage: {permanent_zip_file_path_on_server}")
        except Exception as e_copy:
            logger.error(f"Failed to copy generated ZIP to permanent storage: {e_copy}", exc_info=True)
            raise HTTPException(status_code=500, detail="Erreur lors de la finalisation du stockage du template.")
        finally:
            if path_of_zip_generated_by_script and os.path.exists(path_of_zip_generated_by_script):
                try:
                    os.remove(path_of_zip_generated_by_script)
                    logger.info(f"Cleaned up temporary ZIP from generator: {path_of_zip_generated_by_script}")
                except Exception as e_clean:
                    logger.error(f"Error cleaning up temporary ZIP: {e_clean}")

        # 4. Renvoyer le fichier ZIP et le chemin du serveur dans un header
        response_headers = {
            "X-Template-Server-Path": str(permanent_zip_file_path_on_server),
            "Access-Control-Expose-Headers": "X-Template-Server-Path, Content-Disposition"
        }
        
        logger.info(f"Sending file: {permanent_zip_file_path_on_server} with download name: {original_zip_filename}")
        return FileResponse(
            path=permanent_zip_file_path_on_server,
            media_type="application/zip",
            filename=original_zip_filename,
            headers=response_headers
        )

    except ValueError as ve: # Pour les erreurs de validation de config_dict
        logger.error(f"Input validation error: {ve}", exc_info=True)
        raise HTTPException(status_code=422, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in /generate-template endpoint:", exc_info=True)
        traceback.print_exc() # Pour le débogage
        # Nettoyage si une erreur survient avant que le fichier permanent ne soit référencé
        if path_of_zip_generated_by_script and os.path.exists(path_of_zip_generated_by_script):
            if not permanent_zip_file_path_on_server or not os.path.exists(permanent_zip_file_path_on_server):
                try: os.remove(path_of_zip_generated_by_script)
                except Exception: pass
        raise HTTPException(status_code=500, detail=f"Erreur serveur inattendue: {str(e)}")