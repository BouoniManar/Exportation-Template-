# Backend/app/api/routes/users.py

# --- Imports ---
import shutil
import os # <<< Ajouté
from typing import List, Optional # <<< Ajouté List (pour /users/) et Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File # <<< Ajouté status
from sqlalchemy.orm import Session
import os;
# --- Vos Imports ---
from Backend.app.database import get_db
from Backend.app.models.models import User
# Importer tous les schémas nécessaires
from Backend.app.schemas.schemas import (
    UserCreate, UserResponse, UserProfileResponse, UserUpdateName, UserUpdatePassword
)
# Importer les dépendances et fonctions d'auth
from Backend.app.Auth.auth import (
    get_current_admin_user, get_current_user, get_password_hash, verify_password
)
# ----------------

router = APIRouter(
    prefix="/users", # <<< Préfixe pour toutes les routes de ce fichier
    tags=["Users"]   # <<< Tag pour Swagger UI
)

# --- Configuration et création du dossier Avatar ---
AVATAR_UPLOAD_DIR = "uploads/avatars"
# Créer le dossier au démarrage si besoin (peut aussi être dans main.py)
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
# ---------------------------------------------------


# --- Endpoint POST /users/register (anciennement /register) ---
# Note: Normalement, le register ne devrait pas être sous /users préfix
# mais plutôt à la racine ou sous /auth. Gardez-le ici si c'est votre structure.
@router.post("/register", response_model=UserResponse, summary="Register a new user")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# --- Endpoint GET /users/ (anciennement /users/) ---
# ATTENTION: Probablement besoin de sécurité admin ici
@router.get("/", response_model=List[UserResponse], summary="Get a list of users (Admin Only?)")
def get_users(
    db: Session = Depends(get_db),
    # current_admin: User = Depends(get_current_admin_user) # <<< Exemple de protection admin
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieves a list of users. Add proper authorization for admin roles.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# --- Endpoint 1: GET /users/me ---
@router.get("/me", response_model=UserProfileResponse, summary="Get current user profile")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Retrieves the profile information of the currently authenticated user.
    """
    print(f"GET /users/me: Retourne profil pour user ID {current_user.id}") # DEBUG
    return current_user


# --- Endpoint 2: PUT /users/me ---
@router.put("/me", response_model=UserProfileResponse, summary="Update current user profile (name)")
async def update_user_me(
    user_update: UserUpdateName,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the name of the currently authenticated user.
    """
    print(f"PUT /users/me: Mise à jour nom pour ID {current_user.id} vers '{user_update.name}'") # DEBUG
    current_user.name = user_update.name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    print(f"PUT /users/me: Nom mis à jour pour ID {current_user.id}") # DEBUG
    return current_user


# --- Endpoint 3: PUT /users/me/password ---
@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT, summary="Update current user password")
async def update_password_me(
    password_update: UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the password of the currently authenticated user after verifying the current password.
    """
    print(f"PUT /users/me/password: MàJ mot de passe pour ID {current_user.id}") # DEBUG
    if not verify_password(password_update.currentPassword, current_user.hashed_password):
        print(f"ERROR: Mot de passe actuel incorrect pour ID {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    current_user.hashed_password = get_password_hash(password_update.newPassword)
    db.add(current_user)
    db.commit()
    print(f"PUT /users/me/password: Mot de passe mis à jour pour ID {current_user.id}") # DEBUG
    # Retourne 204 No Content implicitement

@router.get("/", response_model=List[UserResponse], summary="Get a list of users (Admin Only)")
def get_users_admin( # Renommé pour clarté
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user), # <<< UTILISATION DE LA NOUVELLE DÉPENDANCE
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieves a list of users. Requires administrator privileges.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users
# --- Endpoint 4: POST /users/me/avatar ---
@router.post("/me/avatar", response_model=UserProfileResponse, summary="Upload/Update current user avatar")
async def upload_avatar_me(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads and sets the avatar for the currently authenticated user.
    """
    print(f"POST /users/me/avatar: Réception fichier '{avatar.filename}' pour ID {current_user.id}") # DEBUG
    if avatar.content_type not in ["image/png", "image/jpeg", "image/gif"]:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type.")

    file_extension = os.path.splitext(avatar.filename)[1].lower()
    safe_extensions = ['.png', '.jpg', '.jpeg', '.gif']
    if file_extension not in safe_extensions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file extension.")

    # Utiliser seulement l'ID utilisateur pour le nom du fichier de base
    base_filename = f"user_{current_user.id}"
    filename = base_filename + file_extension # Ex: user_123.png
    file_path = os.path.join(AVATAR_UPLOAD_DIR, filename)
    # URL relative qui sera utilisée par le frontend pour accéder via les fichiers statiques
    avatar_url_to_save_in_db = f"/static/avatars/{filename}"
    base_filename = f"user_{current_user.id}"
    filename = base_filename + file_extension
    print(f"POST /users/me/avatar: Sauvegarde vers '{file_path}', URL DB sera '{avatar_url_to_save_in_db}'") # DEBUG
    print(f"--- AVATAR UPLOAD DEBUG (User ID: {current_user.id}) ---")
    print(f"AVATAR_UPLOAD_DIR (utilisé pour file_path): {AVATAR_UPLOAD_DIR}")
    print(f"Filename to save: {filename}")
    print(f"Full file_path for saving on server: {file_path}")
    print(f"Avatar URL to save in DB: {avatar_url_to_save_in_db}")
    # Supprimer l'ancien fichier avatar s'il existe et a une extension différente
    # (Optionnel mais propre)
    if hasattr(current_user, 'avatar_url') and current_user.avatar_url:
        try:
            old_filename_match = os.path.basename(current_user.avatar_url)
            if old_filename_match.startswith(base_filename) and old_filename_match != filename :
                 old_file_path = os.path.join(AVATAR_UPLOAD_DIR, old_filename_match)
                 if os.path.exists(old_file_path):
                     os.remove(old_file_path)
                     print(f"POST /users/me/avatar: Ancien fichier '{old_file_path}' supprimé.")
        except Exception as e:
             print(f"WARN: Échec suppression ancien avatar: {e}")


    # Sauvegarder le nouveau fichier
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
    except Exception as e:
        print(f"ERROR: Échec sauvegarde fichier avatar: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save avatar file.")
    finally:
        await avatar.close()

    # Mettre à jour le champ dans la DB (vérifier si le modèle User a bien 'avatar_url')
    if hasattr(current_user, 'avatar_url'):
         current_user.avatar_url = avatar_url_to_save_in_db
         db.add(current_user)
         db.commit()
         db.refresh(current_user)
         print(f"POST /users/me/avatar: DB mise à jour pour ID {current_user.id}") # DEBUG
    else:
         print(f"WARN: Modèle User n'a pas 'avatar_url'. URL non sauvée en DB.")
         # Assigner temporairement pour la réponse Pydantic
         setattr(current_user, 'avatarUrl', avatar_url_to_save_in_db)

    return current_user

# --- Endpoint GET /users/{user_id} (Peut rester si besoin pour admin, mais nécessite auth) ---
@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID (Admin Only?)")
def get_user_by_id( # Renommé pour clarté
    user_id: int,
    db: Session = Depends(get_db),
    # Protéger cet endpoint aussi, ex: admin ou l'utilisateur lui-même
    # current_user: User = Depends(get_current_user) # Exemple de protection de base
):
    """
    Retrieves a specific user by ID. Needs proper authorization.
    """
    # Exemple: Autorisation simple - Seul l'utilisateur lui-même ou un admin peut voir
    # if current_user.id != user_id and not current_user.is_admin: # Supposant un champ is_admin
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user