# Backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, Security, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
# from sqlalchemy import Engine # Non nécessaire d'importer Engine ici si déjà utilisé dans database.py
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import logging
from pathlib import Path
from .api.routes.dashboard_routes import router as dashboard_router

# --- Importer les dépendances, modèles, schémas nécessaires ---
# Utilisation d'imports relatifs car main.py est dans le package 'app'
from .database import Base, engine, SessionLocal # Importer ce qui est nécessaire de database.py
from .dependencies import get_db                  # Importer get_db de dependencies.py

from .models.models import User # Assurez-vous que models.py est bien dans app/models/
from .schemas.schemas import (
    UserCreate, UserResponse, UserProfileResponse, UserUpdateName, UserUpdatePassword
    # Ajoutez ici d'autres schémas Pydantic que vous utilisez directement dans main.py si besoin
)
from .Auth.auth import (
    get_password_hash, get_current_user, verify_password # get_current_user est la dépendance clé
)

# --- Importer les routeurs externes ---
from .api.routes.auth_routes import router as auth_router
from .api.routes import reset_password # reset_password est un module, on accède à .router plus bas
from .api.routes.oauth_routes import router as oauth_router
from .api.routes.email_routes import router as email_router
from .api.routes.template_routes import router as template_generation_router # Pour la génération de ZIP
from .api.routes.project_routes import router as projects_crud_router     # Pour le CRUD des projets/templates sauvegardés
from .api.routes.history_routes import router as history_router
from .generation_json.uploads import router as generator_uploads_router # Pour l'upload d'images du générateur JSON

# --- Configuration des Chemins Globaux (exécutée une seule fois à l'import) ---
APP_DIR_MAIN = Path(__file__).resolve().parent 
BACKEND_DIR_MAIN = APP_DIR_MAIN.parent
PROJECT_ROOT_MAIN = BACKEND_DIR_MAIN.parent 

# 1. Pour les AVATARS des utilisateurs
PHYSICAL_STATIC_ROOT_DIR_AVATARS = APP_DIR_MAIN / "public"
AVATAR_SUBDIR_PHYSICAL = "avatars"
PHYSICAL_AVATAR_UPLOAD_DIR = PHYSICAL_STATIC_ROOT_DIR_AVATARS / AVATAR_SUBDIR_PHYSICAL
os.makedirs(PHYSICAL_AVATAR_UPLOAD_DIR, exist_ok=True)
STATIC_URL_BASE_PATH_AVATARS = "/static"

# 2. Pour les IMAGES DU GÉNÉRATEUR DE TEMPLATES (celles uploadées par l'utilisateur pour son JSON)
GENERATOR_USER_UPLOADS_DIR = PROJECT_ROOT_MAIN / "user_uploads" # Ex: D:\Page-User\user_uploads
os.makedirs(GENERATOR_USER_UPLOADS_DIR, exist_ok=True) 
print(f"INFO (main.py): User uploaded images (for JSON generator) directory: {GENERATOR_USER_UPLOADS_DIR}")

# Création des tables si elles n'existent pas
Base.metadata.create_all(bind=engine) # Utilise 'engine' importé de .database

# --- Initialisation de l'application FastAPI ---
app = FastAPI(title="JsonToUI Backend API")

logging.basicConfig(level=logging.INFO)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # URL de votre frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MONTAGE DES DOSSIERS STATIQUES ---

# 1. Pour les AVATARS des utilisateurs
app.mount(
    STATIC_URL_BASE_PATH_AVATARS,
    StaticFiles(directory=str(PHYSICAL_STATIC_ROOT_DIR_AVATARS)),
    name="static_avatars"
)
print(f"INFO: Mounting AVATAR static files from '{PHYSICAL_STATIC_ROOT_DIR_AVATARS}' at URL '{STATIC_URL_BASE_PATH_AVATARS}'")

# 2. Pour les IMAGES TÉLÉVERSÉES PAR L'UTILISATEUR POUR LE GÉNÉRATEUR JSON
# Ces images sont servies pour que l'utilisateur puisse les voir dans son interface de création JSON.
# Le chemin dans le JSON sera relatif à la racine du projet (ex: "user_uploads/category/image.png")
# Nous montons donc le dossier "user_uploads" à la racine de l'URL.
if os.path.exists(GENERATOR_USER_UPLOADS_DIR):
    mount_url_prefix_for_generator_uploads = f"/{GENERATOR_USER_UPLOADS_DIR.name}" # Devrait être "/user_uploads"
    app.mount(
        mount_url_prefix_for_generator_uploads, 
        StaticFiles(directory=str(GENERATOR_USER_UPLOADS_DIR)), # Sert le contenu de D:\Page-User\user_uploads
        name="generator_user_uploads_static"
    )
    print(f"INFO (main.py): Mounting GENERATOR USER UPLOADS from '{GENERATOR_USER_UPLOADS_DIR}' at URL '{mount_url_prefix_for_generator_uploads}'")
else:
    print(f"AVERTISSEMENT (main.py): Dossier GENERATOR_USER_UPLOADS_DIR non trouvé: '{GENERATOR_USER_UPLOADS_DIR}'")

# --- Inclusion des routeurs externes ---
app.include_router(auth_router, tags=["Authentication"]) # auth_router a probablement son propre préfixe
app.include_router(oauth_router, tags=["OAuth"])         # oauth_router a probablement son propre préfixe
app.include_router(reset_password.router, tags=["Password Reset"]) # reset_password.router a probablement son propre préfixe
app.include_router(email_router, prefix="/api", tags=["Email"])
app.include_router(dashboard_router, tags=["Dashboard"])
# Routeur pour la génération de template (celui qui génère le ZIP et le retourne)
app.include_router(template_generation_router, prefix="/api/v1/templates", tags=["Templates Generation Service"])

# Routeur pour le CRUD des projets/templates sauvegardés
app.include_router(projects_crud_router) # Son préfixe "/api/projects" est défini dans project_routes.py

app.include_router(history_router) # history_router a probablement son propre préfixe

# Routeur pour l'upload d'images utilisées dans le générateur de JSON
app.include_router(
    generator_uploads_router, 
    prefix="/api/v1", # URL comme /api/v1/upload_image/{category}
    tags=["Generator JSON Image Uploads"]
)

# --- Endpoints définis directement dans main.py (si vous en avez encore) ---
@app.get("/")
def read_root():
    return {"message": "Bienvenue sur mon API Backend JsonToUI 🚀"}

@app.post("/users/", response_model=UserResponse, tags=["Users (Legacy - Consider Moving to Routes)"])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=List[UserResponse], tags=["Users (Legacy - Consider Moving to Routes)"])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # TODO: Sécuriser cet endpoint (admin uniquement)
    users = db.query(User).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users (Legacy - Consider Moving to Routes)"])
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # TODO: Sécuriser (admin ou l'utilisateur lui-même)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/users/me", response_model=UserProfileResponse, tags=["User Profile"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=UserProfileResponse, tags=["User Profile"])
async def update_user_me(
    user_update: UserUpdateName,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.name = user_update.name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.put("/api/users/me/password", status_code=status.HTTP_204_NO_CONTENT, tags=["User Profile"])
async def update_password_me(
    password_update: UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(password_update.currentPassword, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    current_user.hashed_password = get_password_hash(password_update.newPassword)
    db.add(current_user)
    db.commit()
    return # Pas de contenu

@app.post("/api/users/me/avatar", response_model=UserProfileResponse, tags=["User Profile"])
async def upload_avatar_me(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if avatar.content_type not in ["image/png", "image/jpeg", "image/gif"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type.")
    
    file_extension = os.path.splitext(avatar.filename)[1].lower() if avatar.filename else '.png'
    safe_extensions = ['.png', '.jpg', '.jpeg', '.gif']
    if file_extension not in safe_extensions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file extension.")

    base_filename = f"user_{current_user.id}"
    filename = base_filename + file_extension 
    file_path_on_disk = PHYSICAL_AVATAR_UPLOAD_DIR / filename
    
    avatar_url_for_db = f"{STATIC_URL_BASE_PATH_AVATARS}/{AVATAR_SUBDIR_PHYSICAL}/{filename}"

    try:
        with open(file_path_on_disk, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
    except Exception as e:
        logging.error(f"Erreur sauvegarde avatar {file_path_on_disk}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not save avatar file.")
    finally:
        await avatar.close()

    if hasattr(current_user, 'avatar_url'):
        current_user.avatar_url = avatar_url_for_db
        db.add(current_user)
        try:
            db.commit()
            db.refresh(current_user)
        except Exception as e_db:
            db.rollback()
            logging.error(f"Erreur DB màj avatar_url pour user {current_user.id}: {e_db}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating database.")
    else:
        logging.warning(f"User model n'a pas d'attribut 'avatar_url' pour user {current_user.id}")
    
    return current_user