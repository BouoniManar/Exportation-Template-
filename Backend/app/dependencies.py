# Backend/app/dependencies.py
from sqlalchemy.orm import Session # Importez Session directement de sqlalchemy.orm
from Backend.app.database import SessionLocal # Importez SessionLocal de votre fichier database.py

def get_db() -> Session: # type: ignore # Ajoutez un type hint pour la clarté
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# La fonction get_user ne devrait PAS être ici.
# Elle est spécifique à la logique métier des utilisateurs et devrait
# être dans un module de services/CRUD pour les utilisateurs, ou dans Auth/auth.py
# si elle est étroitement liée à l'authentification.