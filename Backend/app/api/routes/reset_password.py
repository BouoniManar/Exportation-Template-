from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from Backend.app.dependencies import get_db
from Backend.app.models.models import User, PasswordResetToken
from Backend.app.Auth.auth import get_password_hash, verify_password
from Backend.app.schemas.schemas import ResetPasswordRequest, ResetPasswordConfirm
from Backend.app.utils import send_reset_email

router = APIRouter()

# Génération du token et envoi de l'email de réinitialisation
@router.post("/forgot-password")
def forgot_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Génération d'un token unique
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Enregistrer le token dans la base de données
    reset_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at)
    db.add(reset_token)
    db.commit()

    # Envoyer l'email avec le lien de réinitialisation
    reset_link = f"http://localhost:8000/reset-password?token={token}"
    send_reset_email("manarbouoni762@gmail.com", reset_link)


    return {"message": "Password reset link sent to your email."}

# Réinitialisation du mot de passe
@router.post("/reset-password")
def reset_password(request: ResetPasswordConfirm, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == request.token).first()

    if not reset_token or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hacher le nouveau mot de passe
    user.hashed_password = get_password_hash(request.new_password)
    
    # Supprimer le token utilisé
    db.delete(reset_token)
    db.commit()

    return {"message": "Password has been reset successfully."}
