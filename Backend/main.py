from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from Backend.routes.auth_routes import router as auth_router  
from Backend.database import get_db, Base, engine
from Backend.models import User
from Backend.auth import get_password_hash
from Backend.schemas import UserCreate, UserResponse
from fastapi import Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
# Création des tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Inclure les routes d'authentification
app.include_router(auth_router)

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