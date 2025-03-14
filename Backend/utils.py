import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Valeur par défaut = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg["Subject"] = "Password Reset Request"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.set_content(f"Click the link below to reset your password:\n{reset_link}")

    # Configurer le serveur SMTP
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)

    print(f"Email envoyé à {to_email}")
