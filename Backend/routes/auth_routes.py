from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from Backend.auth import verify_password, create_access_token
from Backend.config import ACCESS_TOKEN_EXPIRE_MINUTES
from Backend.database import get_db
from Backend.models import User
from Backend.schemas import ResetPasswordRequest, ResetPasswordConfirm
from Backend.auth import create_password_reset_token, reset_password


router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}



@router.post("/forgot-password")
async def forgot_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):

    """Génère un token de réinitialisation et simule l'envoi par email."""
    user = db.query(User).filter_by(email=request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    token = create_password_reset_token(db, user.id)

    # Simuler l'envoi d'email (à remplacer par un vrai envoi)
    return {"message": "Un email de réinitialisation a été envoyé", "token": token}

@router.post("/reset-password")
async def reset_password_route(request: ResetPasswordRequest, db: Session = Depends(get_db)):

    """Réinitialise le mot de passe après validation du token."""
    return reset_password(db, request.token, request.new_password)
