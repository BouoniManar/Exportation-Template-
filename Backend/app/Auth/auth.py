from datetime import datetime, timedelta
import random
import secrets
import smtplib
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from Backend.app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from Backend.app.database import get_db
from sqlalchemy.orm import Session
from Backend.app.models.models import User
from Backend.app.models.models import User, PasswordResetToken
from Backend.app.core.config import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD
from passlib.context import CryptContext
from jose import JWTError, jwt
from Backend.app.schemas.schemas import TokenData






router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Générer un code à 6 chiffres
def generate_otp():
    return str(random.randint(100000, 999999))


@router.post("/auth/forgot-password")
async def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    otp_code = generate_otp()
    expiration_time = datetime.utcnow() + timedelta(hours=1)

    reset_entry = PasswordResetToken(email=email, code=otp_code, expires_at=expiration_time)
    db.add(reset_entry)
    db.commit()

    # Envoi de l'email avec le code
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            message = f"Votre code de réinitialisation est : {otp_code}"
            server.sendmail(SMTP_EMAIL, email, message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email.")

    return {"message": "Code envoyé par email."}




@router.post("/auth/reset-password")
async def reset_password(email: str, code: str, new_password: str, db: Session = Depends(get_db)):
    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.code == code,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_entry:
        raise HTTPException(status_code=400, detail="Code invalide ou expiré.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    
    # Hacher le nouveau mot de passe
    user.hashed_password = pwd_context.hash(new_password)
    db.commit()

    # Supprimer le code après utilisation
    db.delete(reset_entry)
    db.commit()

    return {"message": "Mot de passe mis à jour avec succès."}






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
    

def create_password_reset_token(db: Session, user_id: int):
    db.query(PasswordResetToken).filter_by(user_id=user_id).delete()  
    db.commit()

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = PasswordResetToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    
    return reset_token.token