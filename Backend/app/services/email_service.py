import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from Backend.app.core.config import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD

def send_email(to_email: str, subject: str, body: str):
    try:
        # Création du message
        msg = MIMEMultipart()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        # Connexion au serveur SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Sécurisation de la connexion
        server.login(SMTP_EMAIL, SMTP_PASSWORD)  # Authentification
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())  # Envoi du mail
        server.quit()

        print(f"✅ Email envoyé à {to_email}")
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de l'email : {e}")
