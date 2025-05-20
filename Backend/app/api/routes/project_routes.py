# Backend/app/api/routes/project_routes.py
# (Le code que vous avez fourni pour ce fichier est déjà bon si les imports sont corrigés
# et si schemas.ProjectMetadataSaveRequest et schemas.ProjectCreateInternal sont définis)

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import json as py_json
from datetime import datetime
from typing import List, Optional
import logging

# CORRIGER LES IMPORTS SI NÉCESSAIRE (basé sur votre structure de projet)
from Backend.app.models import models as db_models
from Backend.app.schemas import schemas
from Backend.app.dependencies import get_db
from Backend.app.Auth.auth import get_current_user # Ou get_current_active_user
from Backend.app.services import crud

router = APIRouter( # <--- Le nom de la variable est 'router'
    prefix="/api/projects", 
    tags=["User Projects (Generated Templates)"],
    dependencies=[Depends(get_current_user)]
)
logger = logging.getLogger(__name__)

@router.post("/save-metadata", response_model=schemas.ProjectResponse)
async def save_project_metadata(
    payload: schemas.ProjectMetadataSaveRequest, # Ce schéma doit exister et correspondre
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    logger.info(f"User {current_user.email} saving metadata for project: {payload.name}")
    logger.info(f"Payload received: {payload.model_dump_json(indent=2)}")

    # Le frontend envoie le server_file_path qu'il a reçu du header
    if not payload.server_file_path or not os.path.exists(payload.server_file_path):
        logger.error(f"Server file path from payload does not exist: {payload.server_file_path}")
        raise HTTPException(status_code=400, detail=f"Le chemin du fichier ZIP sur le serveur est invalide ou le fichier n'existe pas: {payload.server_file_path}")

    source_json_id_to_link = payload.source_json_file_id
    if payload.json_config_snapshot and not source_json_id_to_link:
        try:
            json_content_dict = py_json.loads(payload.json_config_snapshot)
            json_file_create_schema = schemas.JsonFileCreate(
                config_name=f"{payload.name}_source_json_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                json_content=json_content_dict
            )
            db_json_file = crud.create_user_json_config(db=db, config_in=json_file_create_schema, user_id=current_user.id)
            source_json_id_to_link = db_json_file.id
        except Exception as e_json_save:
            logger.error(f"Could not save source JSON snapshot for '{payload.name}': {e_json_save}")

    project_create_data = schemas.ProjectCreateInternal(
        name=payload.name,
        user_id=current_user.id,
        file_path=payload.server_file_path, # Chemin du fichier permanent
        source_json_file_id=source_json_id_to_link,
        description=payload.description,
        json_content_snapshot=payload.json_config_snapshot
    )
    
    try:
        db_project = crud.create_generated_template_entry(db=db, template_data=project_create_data)
        logger.info(f"Saved project entry to DB with ID: {db_project.id}")
        # Log d'historique optionnel
        crud.create_history_log(db, schemas.HistoryCreate(action=f"Template sauvegardé: {db_project.name}", user_id=current_user.id, project_id=db_project.id, json_file_id=source_json_id_to_link))
        return db_project
    except Exception as e:
        logger.error(f"Error saving project to DB: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Impossible de sauvegarder les informations du template.")

# ... (vos endpoints GET /my-saved-templates, GET /{project_id}/download, DELETE /{project_id} restent les mêmes) ...
@router.get("/my-saved-templates", response_model=List[schemas.ProjectResponse])
def read_my_saved_templates(
    skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: db_models.User = Depends(get_current_user)
):
    templates = crud.get_user_generated_templates(db, user_id=current_user.id, skip=skip, limit=limit)
    return templates

@router.get("/{project_id}/download", response_class=FileResponse)
async def download_saved_project_zip(
    project_id: int, db: Session = Depends(get_db), current_user: db_models.User = Depends(get_current_user)
):
    db_project = crud.get_generated_template_by_id_and_user(db, template_id=project_id, user_id=current_user.id)
    if not db_project or not db_project.file_path or not os.path.exists(db_project.file_path):
        raise HTTPException(status_code=404, detail="Template ZIP non trouvé ou accès refusé.")
    download_filename = f"{db_project.name}.zip" if not db_project.name.lower().endswith(".zip") else db_project.name
    return FileResponse(path=db_project.file_path, filename=download_filename, media_type='application/zip')

@router.delete("/{project_id}", status_code=204)
def delete_saved_project(
    project_id: int, db: Session = Depends(get_db), current_user: db_models.User = Depends(get_current_user)
):
    success = crud.delete_generated_template_entry(db, template_id=project_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Template non trouvé ou non possédé par l'utilisateur")
    return Response(status_code=204)