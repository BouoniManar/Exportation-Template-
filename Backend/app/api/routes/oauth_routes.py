from fastapi import APIRouter, Depends, HTTPException
import requests
from Backend.app.Auth.auth import create_access_token
from Backend.app.database import get_db
from Backend.app.models.models import User
from sqlalchemy.orm import Session
from Backend.app.core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET

router = APIRouter()

@router.get("/auth/google")
def google_auth(code: str, db: Session = Depends(get_db)):
    """Authentification avec Google OAuth 2.0"""
    google_token_url = "https://oauth2.googleapis.com/token"
    google_user_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": "http://localhost:3000/auth/callback/google",
        "grant_type": "authorization_code",
    }
    
    token_response = requests.post(google_token_url, data=token_data).json()
    if "access_token" not in token_response:
        raise HTTPException(status_code=400, detail="Échec de l'authentification Google")
    
    user_info = requests.get(google_user_url, headers={"Authorization": f"Bearer {token_response['access_token']}"}).json()
    
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(name=user_info["name"], email=user_info["email"], hashed_password="google_auth")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/facebook")
def facebook_auth(access_token: str, db: Session = Depends(get_db)):
    """Authentification avec Facebook OAuth 2.0"""
    facebook_user_url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + access_token
    
    user_info = requests.get(facebook_user_url).json()
    if "email" not in user_info:
        raise HTTPException(status_code=400, detail="Échec de l'authentification Facebook")
    
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(name=user_info["name"], email=user_info["email"], hashed_password="facebook_auth")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
