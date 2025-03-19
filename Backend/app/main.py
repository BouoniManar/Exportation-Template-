from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware  
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from Backend.app.api.routes.auth_routes import router as auth_router  
from Backend.app.database import get_db, Base, engine
from Backend.app.models.models import User
from Backend.app.Auth.auth import get_password_hash
from Backend.app.schemas.schemas import UserCreate, UserResponse
from Backend.app.api.routes import reset_password
from Backend.app.api.routes.oauth_routes import router as oauth_router

# Création des tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

# ✅ Ajout du middleware CORS pour autoriser les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ⚠️ Mets l'URL de ton frontend en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(reset_password.router)
app.include_router(auth_router)
app.include_router(oauth_router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur mon API 🚀"}

@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)  # 💡 Hash du mot de passe
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), token: str = Security(oauth2_scheme)):
    return db.query(User).all()

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), token: str = Security(oauth2_scheme)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user