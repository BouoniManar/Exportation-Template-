# Backend/app/api/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Body # Body pour forgot-password
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import smtplib
from pydantic import BaseModel
from Backend.app.dependencies import get_db
from Backend.app.models.models import User # PasswordResetToken n'est pas directement utilisé ici
from Backend.app.schemas.schemas import Token, UserCreate, UserResponse, ResetPasswordRequest # Ajouter ResetPasswordRequest
from Backend.app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD
# IMPORTER LES FONCTIONS UTILITAIRES DE auth.py
from Backend.app.Auth.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_otp_util,
    create_password_reset_entry, # Nouvelle fonction utilitaire
    verify_otp_and_get_user    # Nouvelle fonction utilitaire
)
from Backend.app.services import crud # Pour get_user_by_email

router = APIRouter(
    prefix="/auth", 
    tags=["Authentication"]
)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username) # Utiliser la fonction CRUD
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_payload = {"sub": user.email, "id": user.id, "name": user.name}
    access_token = create_access_token(
        data=access_token_payload, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# Le corps de la requête attend maintenant un objet JSON
class ForgotPasswordPayload(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password_route(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=payload.email) # Utiliser la fonction CRUD
    if not user:
        # Pour la sécurité, ne pas révéler si l'email existe.
        # Ou, si vous préférez être explicite pour le débogage/tests :
        # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé.")
        print(f"Tentative de réinitialisation pour email non trouvé: {payload.email}")
        return {"message": "Si un compte avec cet email existe, un code de réinitialisation a été envoyé."}

    otp_code = generate_otp_util()
    create_password_reset_entry(db=db, user=user, otp_code=otp_code) # Utilise la nouvelle fonction utilitaire

    try:
        message_body = f"Subject: Votre code de réinitialisation de mot de passe\n\nVotre code de réinitialisation est : {otp_code}"
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, payload.email, message_body.encode('utf-8'))
        print(f"Email de réinitialisation envoyé à {payload.email} avec le code {otp_code}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email de réinitialisation: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email de réinitialisation.")
    return {"message": "Un code de réinitialisation a été envoyé à votre adresse email."}

# Le corps de la requête attend un objet JSON
class ResetPasswordPayload(BaseModel):
    email: str
    code: str
    new_password: str

@router.post("/reset-password")
async def reset_password_route(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    user = verify_otp_and_get_user(db=db, email=payload.email, otp_code=payload.code)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code invalide, expiré ou l'email ne correspond pas.")

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit() # Le token est déjà supprimé dans verify_otp_and_get_user
    return {"message": "Mot de passe mis à jour avec succès."}

# Si vous avez un endpoint pour enregistrer un nouvel utilisateur, il serait aussi ici
@router.post("/register", response_model=UserResponse) # Exemple d'endpoint register
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user_data.password)
    # Le modèle User doit accepter hashed_password
    new_user = User(name=user_data.name, email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user