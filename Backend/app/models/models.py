from sqlalchemy import Column, Integer, String, ForeignKey, DateTime ,Text
from sqlalchemy.orm import relationship
from datetime import datetime
from Backend.app.base import Base 
from datetime import datetime, timedelta

# Modèle Utilisateur
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False) 
    avatar_url = Column(String(512), nullable=True)
    projects = relationship("Project", back_populates="user")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete")
    saved_json_configs = relationship("JsonFile", back_populates="owner")
    # NOUVEAU: Entrées d'historique liées à cet utilisateur
    user_history_entries = relationship("History", back_populates="user_action_by")


# Modèle Projet
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String(512), nullable=True)
    description = Column(Text, nullable=True) # Assurez-vous que ce champ existe en BDD
    json_content_snapshot = Column(Text, nullable=True) # Assurez-vous que ce champ existe en BDD
    source_json_file_id = Column(Integer, ForeignKey("json_files.id"), nullable=True)
    
    source_json_config = relationship(
        "JsonFile",
        foreign_keys=[source_json_file_id], 
        back_populates="generated_projects" # Ce nom doit correspondre à l'attribut dans JsonFile
    )
    user = relationship("User", back_populates="projects")
    history = relationship("History", back_populates="project")

# Modèle Fichier JSON
class JsonFile(Base):
    __tablename__ = "json_files"

    id = Column(Integer, primary_key=True, index=True)
    config_name = Column(String(255), nullable=True, default=f"Configuration_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}")
    json_content = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) # C'est la clé étrangère vers User
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="saved_json_configs")
    
    # UNE SEULE DÉFINITION POUR generated_projects est nécessaire
    generated_projects = relationship(
        "Project", # Nom de la classe modèle cible (Project)
        # foreign_keys n'est PAS nécessaire ici car SQLAlchemy le déduit
        # de la clé étrangère source_json_file_id définie dans le modèle Project.
        # Il est nécessaire du côté où la clé étrangère est définie (Project.source_json_config).
        back_populates="source_json_config" # Doit correspondre à l'attribut dans Project
    )

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255)) # Ex: "JSON config saved", "Template generated"
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Qui a fait l'action
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # NOUVEAU ou à renommer/vérifier
    user_action_by = relationship("User", back_populates="user_history_entries")

    # Lié à quel template généré (si applicable)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    project = relationship("Project", back_populates="history")

    # Lié à quelle configuration JSON (si applicable)
    json_file_id = Column(Integer, ForeignKey("json_files.id"), nullable=True)
    json_config_entry = relationship("JsonFile") # Simple relation, pas de back_populates nécessaire ici peut-être




class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # ✅ Ajout du champ

    user = relationship("User", back_populates="reset_tokens")
