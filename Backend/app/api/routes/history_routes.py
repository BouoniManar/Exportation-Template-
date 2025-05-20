# Backend/app/api/routes/history_routes.py
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import json as py_json # Pour parser le JSON
from typing import List

# Adaptez les imports à votre structure
from Backend.app.dependencies import get_db
from Backend.app.models import models # Importez tous vos modèles
from Backend.app.schemas import schemas # Importez tous vos schémas
from Backend.app.Auth.auth import get_current_user # Votre fonction d'authentification

# Importez vos fonctions CRUD (ou définissez-les ici si elles ne sont pas dans un module séparé)
from Backend.app.services.crud import ( # Supposons que vous avez un crud.py
    create_user_json_config, get_user_json_configs, get_json_config,
    get_user_generated_templates, get_generated_template, create_history_log
)

router = APIRouter(
    prefix="/api/v1/history",
    tags=["History & Saved Items"],
    dependencies=[Depends(get_current_user)] # Sécurise toutes les routes ici
)

# --- Endpoints pour les Configurations JSON Sauvegardées ---

@router.post("/json-configs/", response_model=schemas.JsonFileResponse, status_code=201)
def save_json_configuration(
    *,
    db: Session = Depends(get_db),
    config_in: schemas.JsonFileCreate, # Frontend enverra { "config_name": "...", "json_content": { ... } }
    current_user: models.User = Depends(get_current_user)
):
    """
    Sauvegarde une configuration JSON fournie par l'utilisateur.
    """
    saved_config = create_user_json_config(db=db, config_in=config_in, user_id=current_user.id)
    # Log l'action (optionnel mais bien)
    create_history_log(db, schemas.HistoryCreate(
        action="JSON Configuration Saved",
        user_id=current_user.id,
        json_file_id=saved_config.id
    ))
    return saved_config

@router.get("/json-configs/", response_model=List[schemas.JsonFileResponse])
def list_saved_json_configurations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """
    Liste les configurations JSON sauvegardées par l'utilisateur courant.
    """
    configs = get_user_json_configs(db, user_id=current_user.id, skip=skip, limit=limit)
    # Convertir le json_content string en dict pour la réponse si nécessaire
    for config in configs:
        try:
            config.json_content = py_json.loads(config.json_content)
        except py_json.JSONDecodeError:
            config.json_content = {"error": "Invalid JSON content in DB"} # Ou gérer autrement
    return configs


@router.get("/json-configs/{config_id}", response_model=schemas.JsonFileResponse)
def get_specific_json_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Récupère une configuration JSON spécifique par son ID.
    """
    config = get_json_config(db, config_id=config_id, user_id=current_user.id)
    if not config:
        raise HTTPException(status_code=404, detail="JSON Configuration not found or not owned by user")
    try:
        config.json_content = py_json.loads(config.json_content)
    except py_json.JSONDecodeError:
        config.json_content = {"error": "Invalid JSON content in DB"}
    return config


# --- Endpoints pour les Templates Générés (qui sont des 'Project' dans votre modèle) ---

@router.get("/generated-templates/", response_model=List[schemas.ProjectResponse])
def list_generated_templates_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """
    Liste l'historique des templates générés par l'utilisateur courant.
    """
    templates = get_user_generated_templates(db, user_id=current_user.id, skip=skip, limit=limit)
    return templates

@router.get("/generated-templates/{template_id}/download")
async def download_generated_template_from_history(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Permet de re-télécharger un template généré à partir de l'historique.
    """
    template_entry = get_generated_template(db, template_id=template_id, user_id=current_user.id)
    if not template_entry:
        raise HTTPException(status_code=404, detail="Template not found or not owned by user")
    
    if not template_entry.file_path or not os.path.exists(template_entry.file_path):
        raise HTTPException(status_code=404, detail=f"Template file not found on server. Expected at: {template_entry.file_path}")

    return FileResponse(
        path=template_entry.file_path,
        media_type='application/zip',
        filename=os.path.basename(template_entry.file_path) # ou template_entry.name
    )

# N'oubliez pas d'inclure ce routeur dans votre main.py:
# from Backend.app.api.routes.history_routes import router as history_router
# app.include_router(history_router)