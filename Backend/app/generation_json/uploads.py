# PAGE-USER/Backend/app/api/v1/endpoints/uploads.py
from fastapi import APIRouter, File, UploadFile, HTTPException
import shutil
import os
import uuid
from pathlib import Path
import re
import mimetypes

# --- Configuration des Chemins ---
# Suppose que ce fichier (uploads.py) est dans Backend/app/api/v1/endpoints/
CURRENT_FILE_DIR = Path(__file__).resolve()
# Remonter pour trouver le dossier 'Backend' et 'PROJECT_ROOT'
# endpoints -> v1 -> api -> app -> Backend (5 parents)
BACKEND_DIR = CURRENT_FILE_DIR.parent.parent.parent.parent.parent # CORRECTED
PROJECT_ROOT = BACKEND_DIR.parent # Le dossier PAGE-USER (ex: D:/Page-User)

# Dossier physique à la racine du projet où les images seront sauvegardées
# Ex: D:/Page-User/user_uploads/
ABSOLUTE_USER_UPLOADS_DIR = PROJECT_ROOT / "user_uploads" 
# Test print to confirm during startup (will print when module is imported)
print(f"DEBUG (uploads.py): CURRENT_FILE_DIR = {CURRENT_FILE_DIR}")
print(f"DEBUG (uploads.py): BACKEND_DIR = {BACKEND_DIR}")
print(f"DEBUG (uploads.py): PROJECT_ROOT = {PROJECT_ROOT}")
print(f"DEBUG (uploads.py): ABSOLUTE_USER_UPLOADS_DIR = {ABSOLUTE_USER_UPLOADS_DIR}")


router = APIRouter()

def sanitize_uploaded_filename(filename: str, default_name: str = "image") -> str:
    if not filename:
        return f"{default_name}_{uuid.uuid4().hex[:6]}" 

    base_name = os.path.basename(filename) 
    if not base_name.strip() or base_name in [".", ".."]:
        base_name = default_name
    
    name_part, ext_part = os.path.splitext(base_name)
    
    name_part = re.sub(r'[^\w\-_.]', '_', name_part)
    name_part = name_part.strip('._') 
    if not name_part:
        name_part = default_name
    
    max_name_len = 40 
    name_part = name_part[:max_name_len]

    return f"{name_part}{ext_part}"


@router.post("/upload_image/{category}")
async def upload_image_endpoint(
    category: str, 
    imageFile: UploadFile = File(...)
):
    if not imageFile or not imageFile.filename:
        raise HTTPException(status_code=400, detail="Fichier image invalide ou nom de fichier manquant.")

    print(f"INFO (uploads.py): Réception téléversement pour catégorie='{category}', fichier='{imageFile.filename}', type='{imageFile.content_type}'")

    allowed_mime_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if imageFile.content_type not in allowed_mime_types:
        print(f"ERREUR (uploads.py): Type de fichier non supporté: {imageFile.content_type}")
        raise HTTPException(status_code=400, detail=f"Type de fichier non supporté: {imageFile.content_type}. Supportés: {', '.join(allowed_mime_types)}")

    destination_folder_on_disk = ABSOLUTE_USER_UPLOADS_DIR / category
    try:
        os.makedirs(destination_folder_on_disk, exist_ok=True)
        print(f"INFO (uploads.py): Dossier de destination créé/vérifié: {destination_folder_on_disk}") # This should now be correct
    except OSError as e:
        print(f"ERREUR (uploads.py): Création dossier {destination_folder_on_disk}: {e}")
        raise HTTPException(status_code=500, detail=f"Impossible de créer le dossier de sauvegarde sur le serveur: {e}")

    sanitized_base_name_with_ext = sanitize_uploaded_filename(imageFile.filename)
    name_part, ext_part = os.path.splitext(sanitized_base_name_with_ext)
    
    safe_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    guessed_ext = mimetypes.guess_extension(imageFile.content_type)

    if guessed_ext and guessed_ext.lower() in safe_extensions:
        final_ext = guessed_ext.lower()
    elif ext_part.lower() in safe_extensions:
        final_ext = ext_part.lower()
    else:
        print(f"AVERTISSEMENT (uploads.py): Extension non sûre ou inconnue pour '{imageFile.filename}' (mimetype: {imageFile.content_type}, ext originale: {ext_part}).")
        raise HTTPException(status_code=400, detail=f"Type de fichier ou extension non supporté après vérification : {imageFile.content_type} / {ext_part}")

    unique_id = uuid.uuid4().hex[:8]
    if not name_part: name_part = "image"

    unique_filename = f"{name_part}_{unique_id}{final_ext}"
    file_location_on_disk = destination_folder_on_disk / unique_filename

    try:
        print(f"INFO (uploads.py): Tentative de sauvegarde du fichier sur disque sous: {file_location_on_disk}") # This should now be correct
        with open(file_location_on_disk, "wb+") as file_object:
            shutil.copyfileobj(imageFile.file, file_object)
        print(f"INFO (uploads.py): Fichier sauvegardé avec succès: {file_location_on_disk}")
    except Exception as e:
        print(f"ERREUR (uploads.py): Sauvegarde du fichier {unique_filename} sur disque: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur lors de la sauvegarde du fichier: {e}")
    finally:
        await imageFile.close()

    # This part should remain the same, as ABSOLUTE_USER_UPLOADS_DIR.name will be "user_uploads"
    file_path_for_json = str(Path(ABSOLUTE_USER_UPLOADS_DIR.name) / category / unique_filename).replace("\\", "/")

    print(f"INFO (uploads.py): Chemin filePath retourné au client (pour JSON): {file_path_for_json}")
    
    return {"filePath": file_path_for_json, "filename": unique_filename}