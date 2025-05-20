from fastapi import APIRouter, Depends, HTTPException, Request
import requests
from sqlalchemy.orm import Session
from Backend.app.Auth.auth import create_access_token
from Backend.app.dependencies import get_db
from Backend.app.models.models import User
from Backend.app.core.config import FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

router = APIRouter()

GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/callback/google"
FACEBOOK_REDIRECT_URI = "http://localhost:3000/auth/callback/facebook"



@router.get("/auth/google")
async def get_google_auth_url():
    """Génère l'URL d'authentification Google."""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
    )
    return {"auth_url": google_auth_url}


@router.get("/auth/callback/google")
async def google_auth_callback(request: Request, db: Session = Depends(get_db)):
    """Gestion du callback OAuth2 de Google."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code d'autorisation Google manquant")

    # Échange du code contre un access_token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()

    if "access_token" not in token_json:
        raise HTTPException(status_code=400, detail="Échec de l'échange du code Google")

    access_token = token_json["access_token"]

    # Récupération des informations utilisateur
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    user_info_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
    user_info = user_info_response.json()

    if "email" not in user_info:
        raise HTTPException(status_code=400, detail="Impossible de récupérer l'email Google")

    # Vérifier si l'utilisateur existe déjà dans la base de données
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(name=user_info["name"], email=user_info["email"], hashed_password="google_auth")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Générer un token d'accès pour l'utilisateur
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/auth/facebook")
async def get_facebook_auth_url():
    """Génère l'URL d'authentification Facebook."""
    facebook_auth_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth"
        f"?client_id={FACEBOOK_CLIENT_ID}"
        f"&redirect_uri={FACEBOOK_REDIRECT_URI}"
        f"&scope=email"
        f"&response_type=code"
    )
    return {"auth_url": facebook_auth_url}
@router.get("/auth/callback/facebook")
async def facebook_auth_callback(request: Request, db: Session = Depends(get_db)):
    """Gestion du callback OAuth2 de Facebook."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code d'autorisation Facebook manquant")

    # Échanger le code contre un access_token
    token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
    token_data = {
        "client_id": FACEBOOK_CLIENT_ID,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }

    token_response = requests.get(token_url, params=token_data)
    token_json = token_response.json()

    if "access_token" not in token_json:
        raise HTTPException(status_code=400, detail="Échec de l'échange du code Facebook")

    access_token = token_json["access_token"]

    # Récupération des informations utilisateur
    user_info_url = "https://graph.facebook.com/me?fields=id,name,email"
    user_info_response = requests.get(user_info_url, params={"access_token": access_token})
    user_info = user_info_response.json()

    if "email" not in user_info:
        raise HTTPException(status_code=400, detail="Impossible de récupérer l'email Facebook")

    # Vérifier si l'utilisateur existe déjà en base de données
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(name=user_info["name"], email=user_info["email"], hashed_password="facebook_auth")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Générer un token JWT pour l'utilisateur
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}