from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password_to_hash = "admin*123" # Votre mot de passe souhaité
hashed_password = pwd_context.hash(password_to_hash)

print(f"Le mot de passe '{password_to_hash}' haché (bcrypt) est :")
print(hashed_password)