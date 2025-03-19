from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException
from Backend.app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from Backend.app.schemas.schemas import TokenData
from sqlalchemy.orm import Session
import secrets
from Backend.app.models.models import PasswordResetToken
from Backend.app.models.models import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_password_reset_token(db: Session, user_id: int):
    """Supprime les anciens tokens et génère un nouveau token de réinitialisation."""
    db.query(PasswordResetToken).filter_by(user_id=user_id).delete()  
    db.commit()

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = PasswordResetToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    
    return reset_token.token

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(email=email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    

def verify_reset_token(db: Session, token: str):
    """Vérifie si un token de réinitialisation est valide."""
    reset_token = db.query(PasswordResetToken).filter_by(token=token).first()

    if not reset_token or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    return reset_token.user_id  # Retourne l'ID de l'utilisateur si valide


def reset_password(db: Session, token: str, new_password: str):
    """Réinitialise le mot de passe d'un utilisateur après validation du token."""
    user_id = verify_reset_token(db, token)  # Vérifie que le token est valide

    # Trouver l'utilisateur
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Hacher le nouveau mot de passe et l'enregistrer
    user.hashed_password = get_password_hash(new_password)
    db.commit()

    # Supprimer le token après utilisation
    db.query(PasswordResetToken).filter_by(token=token).delete()
    db.commit()

    return {"message": "Mot de passe mis à jour avec succès"}