from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from Backend.base import Base 

# Modèle Utilisateur
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False) 

    projects = relationship("Project", back_populates="user")

# Modèle Projet
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    json_files = relationship("JsonFile", back_populates="project")
    history = relationship("History", back_populates="project")

# Modèle Fichier JSON
class JsonFile(Base):
    __tablename__ = "json_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="json_files")

# Modèle Historique
class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="history")
