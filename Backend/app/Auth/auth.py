# Backend/app/Auth/auth.py
from datetime import datetime, timedelta
from typing import Optional
import random
import secrets
import traceback # Pour le débogage avancé si besoin

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from Backend.app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from Backend.app.dependencies import get_db
from Backend.app.models.models import User, PasswordResetToken # PasswordResetToken nécessaire ici
# from Backend.app.schemas.schemas import TokenData # Si vous l'utilisez pour decode_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token") # Doit correspondre à votre route de login dans auth_routes.py

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    # IMPORTANT: Assurez-vous que "id" et "sub" (email) sont dans "data" lors de l'appel
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email_from_token: Optional[str] = payload.get("sub")
        user_id_from_token = payload.get("id")

        if email_from_token is None and user_id_from_token is None:
            raise credentials_exception
        
        user: Optional[User] = None
        if user_id_from_token is not None:
            try:
                user_id = int(user_id_from_token)
                user = db.query(User).filter(User.id == user_id).first()
            except (ValueError, TypeError):
                pass 
        
        if user is None and email_from_token:
            user = db.query(User).filter(User.email == email_from_token).first()

        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise credentials_exception

# --- Fonctions Utilitaires pour la réinitialisation de mot de passe ---
def generate_otp_util() -> str:
    return str(random.randint(100000, 999999))

def create_password_reset_entry(db: Session, user: User, otp_code: str) -> PasswordResetToken:
    """Crée et sauvegarde une entrée PasswordResetToken pour un OTP."""
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete() # Supprimer les anciens
    expiration_time = datetime.utcnow() + timedelta(hours=1)
    # Votre modèle PasswordResetToken doit avoir une colonne 'token' (ou 'code') pour stocker l'OTP
    # et 'user_id'.
    reset_entry = PasswordResetToken(user_id=user.id, token=otp_code, expires_at=expiration_time)
    db.add(reset_entry)
    db.commit()
    db.refresh(reset_entry)
    return reset_entry

def verify_otp_and_get_user(db: Session, email: str, otp_code: str) -> Optional[User]:
    """Vérifie l'OTP et retourne l'utilisateur si valide."""
    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == otp_code, # Ou .code == otp_code
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_entry:
        return None

    user = db.query(User).filter(User.id == reset_entry.user_id, User.email == email).first()
    if user:
        db.delete(reset_entry) # Supprimer le token après vérification réussie
        db.commit()
    return user