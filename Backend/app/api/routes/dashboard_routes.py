# Backend/app/api/routes/dashboard_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional # Ajouté pour last_activity_ts
from datetime import datetime # Ajouté pour last_activity_ts

# Vos imports (adaptez les chemins si nécessaire)
from Backend.app.dependencies import get_db
from Backend.app.services import crud # Assurez-vous d'avoir les fonctions CRUD
from Backend.app.schemas.schemas import UserDashboardStatsResponse # Créez ce schéma Pydantic
from Backend.app.models.models import User as UserModel # Alias pour éviter conflit avec schéma User
from Backend.app.Auth.auth import get_current_user 
router = APIRouter(
    prefix="/api/dashboard", # Préfixe pour toutes les routes de ce fichier
    tags=["Dashboard"]       # Tag pour Swagger UI
)

@router.get("/stats", response_model=UserDashboardStatsResponse)
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends( get_current_user ) # Utilise UserModel
):
    """
    Récupère les statistiques agrégées pour le dashboard de l'utilisateur connecté.
    """
    try:
        # Remplacez ces appels par vos vraies fonctions CRUD
        project_count = crud.get_user_project_count(db, user_id=current_user.id)
        # Supposons que templatesGenerated est le même que project_count pour l'instant
        templates_generated = project_count
        last_activity_ts_obj: Optional[datetime] = crud.get_user_last_activity_timestamp(db, user_id=current_user.id)

        # Exemples pour les autres stats, à adapter
        active_incidents = 0 # Placeholder, à remplacer par une vraie logique si besoin
        paused_items = 0   # Placeholder

        return UserDashboardStatsResponse(
            projectCount=project_count,
            templatesGenerated=templates_generated,
            # Convertir datetime en string ISO si non nul
            lastActivityTimestamp=last_activity_ts_obj.isoformat() if last_activity_ts_obj else None,
            activeIncidents=active_incidents,
            pausedItems=paused_items
        )
    except Exception as e:
        print(f"Error fetching dashboard stats for user {current_user.id}: {e}") # Log pour le debug
        # Vous pourriez vouloir logger l'erreur avec plus de détails (traceback)
        # import traceback
        # print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Erreur interne du serveur lors de la récupération des statistiques du dashboard."
        )