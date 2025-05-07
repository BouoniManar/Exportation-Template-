# PAGE-USER/Backend/app/api/routes/template_routes.py
from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from fastapi.responses import FileResponse
import os
import json
import traceback
import logging

# --- IMPORTE LA FONCTION WRAPPER ---
from Backend.app.generation_template.Exportation.generate_test import run_generation_for_fastapi

# --- Autres imports (Tes imports) ---
from Backend.app.models.models import User # type: ignore
from Backend.app.schemas.schemas import TemplateGenerationRequest # type: ignore

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate-template")
async def generate_template_endpoint(
    *,
    request_data: TemplateGenerationRequest = Body(...),
    background_tasks: BackgroundTasks
):
    logger.info(f"Received generation request (using original logic wrapper)")
    zip_file_path_on_disk = None # Pour le finally potentiel

    try:
        # 1. Parser JSON
        try:
            config_dict = json.loads(request_data.json_config)
            if not isinstance(config_dict, dict) or not config_dict:
                 raise ValueError("Le JSON fourni est vide ou invalide.")
            site_key = list(config_dict.keys())[0]
            logger.info(f"Successfully parsed JSON for key: {site_key}")
        except Exception as e:
            logger.error(f"JSON Parsing error: {e}", exc_info=True)
            raise HTTPException(status_code=422, detail=f"JSON invalide: {e}")

        # 2. Appeler la fonction wrapper
        logger.info(f"Calling generator wrapper function for key: {site_key}")
        try:
            zip_file_path_on_disk = run_generation_for_fastapi(config_dict)
            logger.info(f"Generator wrapper returned path: {zip_file_path_on_disk}")
            if not zip_file_path_on_disk or not isinstance(zip_file_path_on_disk, str) or not os.path.exists(zip_file_path_on_disk):
                 logger.error(f"Wrapper function finished but ZIP file is missing or path invalid. Path: {zip_file_path_on_disk}")
                 raise RuntimeError("Generator did not produce a valid and existing ZIP file path.")

        # Gestion des erreurs venant du wrapper/générateur
        except FileNotFoundError as e:
             logger.error(f"Asset file not found during generation:", exc_info=True)
             # Renvoyer un message d'erreur plus spécifique si possible
             raise HTTPException(status_code=500, detail=f"Erreur serveur: Fichier nécessaire introuvable: {e.filename}")
        except ValueError as e:
             logger.error(f"Input validation error for generator:", exc_info=True)
             raise HTTPException(status_code=400, detail=str(e))
        except Exception as e: # Attrape les RuntimeError et autres
            logger.error(f"Exception caught during call to run_generation_for_fastapi:", exc_info=True)
            # --- AJOUT POUR VOIR L'ERREUR DANS LA CONSOLE ---
            print("\n--- TRACEBACK FROM template_routes.py (Exception during generator call) ---")
            traceback.print_exc()
            print("------------------------------------------------------------------------\n")
            # --------------------------------------------
            raise HTTPException(status_code=500, detail="Erreur interne lors de la génération.")

        # 3. Renvoyer le fichier
        logger.info(f"Generation successful, attempting to send file: {zip_file_path_on_disk}")
        zip_filename = os.path.basename(zip_file_path_on_disk)
        background_tasks.add_task(os.remove, zip_file_path_on_disk)
        logger.info(f"Scheduled background task to remove: {zip_file_path_on_disk}")
        return FileResponse(
            path=zip_file_path_on_disk,
            media_type="application/zip",
            filename=zip_filename
        )

    except HTTPException:
        raise
    except Exception as e:
        # --- AJOUT POUR VOIR L'ERREUR DANS LA CONSOLE ---
        print("\n--- TRACEBACK FROM template_routes.py (Unexpected endpoint error) ---")
        traceback.print_exc()
        print("-------------------------------------------------------------------\n")
        # --------------------------------------------
        logger.error(f"Unexpected error in endpoint logic:", exc_info=True)
        raise HTTPException(status_code=500, detail="Erreur serveur inattendue.")