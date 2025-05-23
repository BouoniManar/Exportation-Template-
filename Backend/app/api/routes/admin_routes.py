# Backend/app/api/routes/admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional

# Ajustez ces imports en fonction de votre structure de projet exacte
# Il est crucial que ces chemins soient corrects pour que Python trouve les modules.
# Si admin_routes.py est dans Backend/app/api/routes/
# et que les autres modules sont dans Backend/app/
try:
    from ...Auth.auth import get_current_admin_user, get_password_hash
    from ...dependencies import get_db
    from ...models.models import User
    from ...schemas.schemas import UserCreate, UserResponse
except ImportError:
    # Fallback pour un test local si la structure relative pose problème
    # Cela suppose que vous exécutez depuis le dossier Backend/app/
    # ou que Backend/app est dans PYTHONPATH
    from Backend.app.Auth.auth import get_current_admin_user, get_password_hash
    from Backend.app.dependencies import get_db
    from Backend.app.models.models import User
    from Backend.app.schemas.schemas import UserCreate, UserResponse


router = APIRouter(
    prefix="/admin",
    tags=["Admin - User Management"],
    dependencies=[Depends(get_current_admin_user)] # Sécurité admin pour toutes les routes
)

# --- Schémas Pydantic Spécifiques à l'Admin ---

class AdminUserCreatePayload(UserCreate): # UserCreate a déjà name, email, password
    role: str = "user" # L'admin peut spécifier le rôle, par défaut 'user'
    is_active: bool = True # L'admin peut spécifier si le compte est actif

class AdminUserUpdatePayload(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    # Ne pas permettre de changer le mot de passe directement ici,
    # utiliser un flux de réinitialisation de mot de passe si nécessaire.

class UserStatusUpdate(BaseModel):
    is_active: bool


# --- Routes CRUD pour la Gestion des Utilisateurs ---

@router.get("/users", response_model=List[UserResponse])
def admin_read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if is_active is not None:
        if hasattr(User, 'is_active'):
            query = query.filter(User.is_active == is_active)
    if role:
        if hasattr(User, 'role'):
            query = query.filter(User.role == role)
    if search:
        search_term = f"%{search}%"
        if hasattr(User, 'name') and hasattr(User, 'email'):
            query = query.filter(
                (User.name.ilike(search_term)) | (User.email.ilike(search_term))
            )
        elif hasattr(User, 'email'):
             query = query.filter(User.email.ilike(search_term))

    if hasattr(User, 'id'):
        query = query.order_by(User.id)
    else:
        # Fallback si User.id n'existe pas (ce qui serait étrange)
        # Vous pourriez vouloir lever une erreur ici si l'ID est crucial pour l'ordre
        # Pour MSSQL, un ORDER BY est nécessaire pour OFFSET/LIMIT
        # Si vous n'avez pas d'ID, triez par une autre colonne disponible et stable.
        if hasattr(User, 'email'): # Exemple de fallback
            query = query.order_by(User.email)
        else:
            # Si aucun champ stable pour trier, cela posera problème avec MSSQL & pagination
            print("AVERTISSEMENT: Aucun champ stable trouvé pour ORDER BY avec pagination MSSQL.")


    users = query.offset(skip).limit(limit).all()

    # --- AJOUTER CES LIGNES POUR LE DÉBOGAGE ---
    if users:
        print(f"Premier utilisateur récupéré (avant sérialisation Pydantic): {users[0].__dict__}")
        if hasattr(users[0], 'created_at'):
            print(f"Valeur de users[0].created_at: {users[0].created_at}, Type: {type(users[0].created_at)}")
        else:
            print("Attribut 'created_at' NON TROUVÉ sur l'objet User de SQLAlchemy.")
        if hasattr(users[0], 'is_active'):
            print(f"Valeur de users[0].is_active: {users[0].is_active}, Type: {type(users[0].is_active)}")
        else:
            print("Attribut 'is_active' NON TROUVÉ sur l'objet User de SQLAlchemy.")
    else:
        print("Aucun utilisateur récupéré de la base de données.")
    # --- FIN DES LIGNES DE DÉBOGAGE ---

    return users

# La deuxième définition de admin_read_users a été supprimée.

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    user_data: AdminUserCreatePayload,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": user_data.role
    }
    if hasattr(User, 'is_active'):
        user_dict["is_active"] = user_data.is_active

    new_user = User(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    user_update_data: AdminUserUpdatePayload,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == current_admin.id:
        if user_update_data.role is not None and user_update_data.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot demote themselves.")
        if hasattr(user, 'is_active') and user_update_data.is_active is not None and not user_update_data.is_active:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot deactivate themselves via this endpoint.")

    update_data = user_update_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
        else:
            print(f"Avertissement: L'attribut '{key}' n'existe pas sur le modèle User. Mise à jour ignorée pour cet attribut.")


    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot delete themselves.")

    db.delete(user)
    db.commit()
    return

@router.patch("/users/{user_id}/status", response_model=UserResponse)
def admin_toggle_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not hasattr(user, 'is_active'):
        raise HTTPException(status_code=500, detail="User model does not have 'is_active' attribute.")

    if user.id == current_admin.id and not status_update.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot deactivate themselves.")

    user.is_active = status_update.is_active
    db.commit()
    db.refresh(user)
    return user