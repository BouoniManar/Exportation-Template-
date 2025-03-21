import smtplib

SMTP_SERVER = "smtp-relay.brevo.com"
SMTP_PORT = 587
SMTP_EMAIL = "manar.bouoni@etudiant-isi.utm.tn"
SMTP_PASSWORD = "CZAFRPTDhr1VmJU9"

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()  # Sécurise la connexion
    server.login(SMTP_EMAIL, SMTP_PASSWORD)  # Authentification
    print("✅ Connexion SMTP réussie !")
    server.quit()
except Exception as e:
    print(f"❌ Erreur SMTP : {e}")
