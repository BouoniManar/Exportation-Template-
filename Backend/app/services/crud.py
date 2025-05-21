# Dans un fichier crud.py ou services.py (ou directement dans les routes au début)
import os
from typing import List, Optional
from fastapi import logger
from sqlalchemy import func
from sqlalchemy.orm import Session
import json as py_json
 # Adaptez les imports
from datetime import datetime

from Backend.app.models import models
from Backend.app.schemas import schemas

# --- CRUD pour JsonFile (Configurations JSON) ---
def create_user_json_config(db: Session, config_in: schemas.JsonFileCreate, user_id: int) -> models.JsonFile:
    db_config = models.JsonFile(
        config_name=config_in.config_name or f"Config_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        json_content=py_json.dumps(config_in.json_content), # Stocker comme string JSON
        owner_id=user_id
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config
def get_user_by_email(db: Session, email: str) -> Optional[models.User]: # Nom plus explicite
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()
def get_user_json_configs(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.JsonFile]:
    return db.query(models.JsonFile).filter(models.JsonFile.owner_id == user_id)\
        .order_by(models.JsonFile.created_at.desc()).offset(skip).limit(limit).all()

def get_json_config(db: Session, config_id: int, user_id: int) -> Optional[models.JsonFile]:
    return db.query(models.JsonFile)\
        .filter(models.JsonFile.id == config_id, models.JsonFile.owner_id == user_id).first()

# --- CRUD pour Project (Templates Générés) ---
def create_generated_template_entry(db: Session, template_data: schemas.ProjectCreate) -> models.Project:
    db_template = models.Project(
        name=template_data.name,
        user_id=template_data.user_id,
        file_path=template_data.file_path,
        source_json_file_id=template_data.source_json_file_id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_user_generated_templates(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Project]:
    return db.query(models.Project).filter(models.Project.user_id == user_id)\
        .order_by(models.Project.created_at.desc()).offset(skip).limit(limit).all()

def get_generated_template(db: Session, template_id: int, user_id: int) -> Optional[models.Project]:
    return db.query(models.Project)\
        .filter(models.Project.id == template_id, models.Project.user_id == user_id).first()

# --- CRUD pour History ---
def create_history_log(db: Session, log_data: schemas.HistoryCreate) -> models.History:
    db_log = models.History(**log_data.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_user_project_count(db: Session, user_id: int) -> int:
    """Compte le nombre de projets pour un utilisateur donné."""
    count = db.query(models.Project).filter(models.Project.user_id == user_id).count()
    return count

def get_user_last_activity_timestamp(db: Session, user_id: int) -> Optional[datetime]:
    """Récupère le timestamp de la dernière activité (projet créé/modifié) pour un utilisateur."""
    # Exemple : dernière date de création d'un projet
    # Vous pourriez avoir une table 'activity_log' ou regarder 'updated_at' sur plusieurs tables
    latest_project_activity = db.query(func.max(models.Project.created_at)).filter(models.Project.user_id == user_id).scalar()

    # Si vous avez d'autres types d'activités, combinez les requêtes ou choisissez la plus pertinente
    # Pour cet exemple, nous ne considérons que la création de projet
    return latest_project_activity



def create_generated_template_entry(db: Session, template_data: schemas.ProjectCreateInternal) -> models.Project:
    db_template = models.Project(
        name=template_data.name,
        user_id=template_data.user_id,
        file_path=template_data.file_path,
        source_json_file_id=template_data.source_json_file_id,
        # Assurez-vous que votre modèle Project a une colonne pour cela si vous l'ajoutez :
        # json_content_snapshot = template_data.json_content_snapshot 
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    # Log d'historique ici si nécessaire
    # create_history_log(db, schemas.HistoryCreate(action=f"Template généré et sauvegardé: {db_template.name}", user_id=template_data.user_id, project_id=db_template.id))
    return db_template

# ... (get_user_generated_templates et get_generated_template restent les mêmes,
#      mais assurez-vous que get_generated_template est bien get_generated_template_by_id_and_user
#      pour vérifier la propriété de l'utilisateur)

def get_generated_template_by_id_and_user(db: Session, template_id: int, user_id: int) -> Optional[models.Project]:
    return db.query(models.Project)\
        .filter(models.Project.id == template_id, models.Project.user_id == user_id).first()

def delete_generated_template_entry(db: Session, template_id: int, user_id: int) -> bool:
    db_template = get_generated_template_by_id_and_user(db, template_id, user_id)
    if db_template:
        if db_template.file_path and os.path.exists(db_template.file_path):
            try:
                os.remove(db_template.file_path)
                logger.info(f"Successfully deleted ZIP file: {db_template.file_path}") # Utilisez logger
            except OSError as e:
                logger.error(f"Error deleting ZIP file {db_template.file_path}: {e}")
        db.delete(db_template)
        db.commit()
        # Log d'historique
        # create_history_log(db, schemas.HistoryCreate(action=f"Template supprimé: {db_template.name}", user_id=user_id, project_id=template_id))
        return True
    return False