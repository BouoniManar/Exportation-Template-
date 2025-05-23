# schemas.py
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Any, Dict, Optional, List # Assurez-vous que List est importé
# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None 
    role: str# Assurez-vous que cela correspond à votre modèle User
    is_active: bool          # AJOUTÉ
    created_at: datetime
    

    class Config:
        from_attributes = True

class UserDashboardStatsResponse(BaseModel):
    projectCount: int
    templatesGenerated: int
    lastActivityTimestamp: Optional[str] # Sera une string ISO ou None
    activeIncidents: int
    pausedItems: int

    class Config:
        orm_mode = True

        
class UserProfileResponse(BaseModel): # Gardé votre UserProfileResponse
    id: int
    name: str
    email: EmailStr
    avatar_db_field: Optional[str] = Field(None, alias="avatarUrl", validation_alias="avatar_url")
    role: str
    class Config:
        from_attributes = True
        populate_by_name = True

class UserUpdateName(BaseModel):
    name: str = Field(..., min_length=1)

class UserUpdatePassword(BaseModel):
    currentPassword: str = Field(..., min_length=6)
    newPassword: str = Field(..., min_length=6)

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Password Reset Schemas ---
class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str

# --- JSON File (User Saved Configurations) Schemas ---
class JsonFileBase(BaseModel):
    config_name: Optional[str] = Field(None, min_length=1, max_length=255)
    json_content: Dict[str, Any] # Reçoit comme dictionnaire du frontend

class JsonFileCreate(JsonFileBase):
    pass

class JsonFileResponse(JsonFileBase):
    id: int
    owner_id: int
    created_at: datetime
    # json_content est hérité de JsonFileBase et reste Dict[str, Any]

    class Config:
        from_attributes = True

# --- Project (Generated Template) Schemas ---
# Définir ProjectBase en premier
class ProjectBase(BaseModel):
    name: str = Field(..., max_length=255) # Nom du template/fichier ZIP (sans .zip)
    description: Optional[str] = None     # Description optionnelle
    # file_path n'est généralement pas dans la base, car il est géré par le stockage.
    # Il sera dans ProjectCreateInternal pour que le CRUD sache où il est sur le serveur.

# Ce schéma est pour la création interne par le backend après la génération du ZIP
class ProjectCreateInternal(ProjectBase): # Hérite de ProjectBase
    user_id: int
    file_path: str                      # Chemin absolu du fichier ZIP sur le serveur
    source_json_file_id: Optional[int] = None
    json_content_snapshot: str          # Le JSON (en string) utilisé pour cette génération

# Ce schéma est ce que vous utilisiez pour créer un "Project" directement (gardé pour compatibilité si besoin)
class ProjectCreate(ProjectBase):
    user_id: int
    file_path: str # Ce file_path doit être le chemin sur le serveur
    source_json_file_id: Optional[int] = None

# Ce que l'API retourne quand on liste ou récupère un projet/template sauvegardé
class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    source_json_file_id: Optional[int] = None
    # file_path est intentionnellement omis ici pour la réponse au client.
    # L'accès au fichier se fait via un endpoint de téléchargement dédié.
    # Si vous le voulez absolument ici (par exemple pour admin), ajoutez-le :
    # file_path: str

    class Config:
        from_attributes = True

# --- Template Generation Schemas (Requêtes du Client vers le Backend) ---

# Ce que le client envoie pour demander la génération d'un template ZIP
class TemplateGenerationRequest(BaseModel):
    json_config: str 
    source_json_config_id: Optional[int] = None
    # Le JSON de configuration en string
    # source_json_config_id: Optional[int] = None # Optionnel: si le JSON vient d'un JsonFile existant

# Ce que le client envoie pour sauvegarder les METADONNEES d'un template déjà généré et stocké
class ProjectMetadataSaveRequest(BaseModel):
    name: str = Field(..., max_length=255)
    server_file_path: str        # Chemin du ZIP sur le serveur (retourné par l'endpoint de génération)
    json_config_snapshot: str    # Le JSON (string) utilisé pour cette génération
    source_json_file_id: Optional[int] = None
    description: Optional[str] = None


# --- History Schemas ---
class HistoryBase(BaseModel):
    action: str
    user_id: int
    project_id: Optional[int] = None
    json_file_id: Optional[int] = None

class HistoryCreate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Vous aviez un SaveTemplateRequest, il est maintenant remplacé par ProjectMetadataSaveRequest
# et TemplateGenerationRequest. Supprimez l'ancien SaveTemplateRequest s'il est différent.
# class SaveTemplateRequest(BaseModel):
#     template_name: str
#     json_config: str
#     description: Optional[str] = None