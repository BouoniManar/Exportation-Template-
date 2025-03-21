from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from Backend.app.services.email_service import send_email  # Import de la fonction d'envoi d'email

router = APIRouter()

class EmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str

@router.post("/send-email")
async def send_email_route(email_data: EmailRequest):
    try:
        send_email(email_data.to_email, email_data.subject, email_data.body)
        return {"message": "✅ Email envoyé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Erreur : {str(e)}")
