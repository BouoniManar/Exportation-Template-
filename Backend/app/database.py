from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from Backend.app.base import Base
from Backend.app.models.models import User 
# Configuration de la base de données
DATABASE_URL = "mssql+pyodbc://DESKTOP-LAJVAAS/Exportation_Application?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dépendance pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fonction pour récupérer un utilisateur
def get_user(email: str, db: Session):
    return db.query(User).filter(User.email == email).first()
