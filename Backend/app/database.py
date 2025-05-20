# Backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from Backend.app.base import Base # Assurez-vous que ce chemin est correct si Base est dans un autre fichier
                                 # Si Base est défini ici, alors pas besoin de l'importer.

# Configuration de la base de données
DATABASE_URL = "mssql+pyodbc://DESKTOP-LAJVAAS/Exportation_Application?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base est généralement défini ici ou dans un fichier base.py et importé
# Si vous avez base.py comme ceci :
# from sqlalchemy.orm import declarative_base
# Base = declarative_base()
# Alors l'import ci-dessus `from Backend.app.base import Base` est correct.

# SUPPRIMEZ les fonctions get_db() et get_user() de ce fichier.