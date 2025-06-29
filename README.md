🧩 Exportation-Template
Projet de Fin d'Études – Génération automatique de templates web à partir de fichiers JSON

Ce projet propose une solution innovante qui automatise la création de sites web fonctionnels à partir de fichiers JSON décrivant des composants. Il vise à simplifier la tâche des développeurs et designers web en offrant une plateforme intuitive, personnalisable et prête à l'emploi.


Objectifs du projet
Automatiser la génération de sites web fonctionnels à partir de fichiers JSON.

Permettre aux utilisateurs de personnaliser leurs templates avec des thèmes et structures de pages prédéfinies.

Simplifier la création de pages web pour développeurs et non-développeurs.

Fournir une interface utilisateur moderne avec :

Génération de fichiers JSON

Création de composants via formulaire

Export de template HTML/CSS

Tableau de bord, profil, statistiques et historique

Fournir une interface administrateur pour :

Gestion des utilisateurs

Modération et configuration de la plateforme

Intégration de tests fonctionnels et techniques avec Pytest, JMeter, ZAP Proxy.

Technologies utilisées

Frontend:	React, TypeScript, TailwindCSS
Backend:	Python, FastAPI, Jinja2
Base de données:	SQL Server (via SQLAlchemy)
Tests:	Pytest, JMeter, ZAP Proxy
Outils:	Git, GitHub, Swagger, VS Code


Fonctionnalités principales
👤 Utilisateur
Créer des composants via formulaire React

Générer et prévisualiser un fichier JSON

Exporter le projet en archive ZIP

Tableau de bord : statistiques & historique

Gestion de profil et paramètres

🛡️ Administrateur
Gestion des utilisateurs

Statistiques générales

Modération des contenus

⚙️ Installation & Lancement
Backend (FastAPI)
git clone https://github.com/BouoniManar/Exportation-Template-WithIA.git
cd backend
python -m venv myenv
.\myenv\Scripts\activate
pip install -r requirements.txt
uvicorn Backend.app.main:app --reload --port 8001

Frontend (React)
cd frontend
npm install
npm start

🧪 Tests
pytest


Tests avancés :
Performance : Apache JMeter

Sécurité : OWASP ZAP Proxy

Documentation API : Swagger

🧠 A propos

Ce projet a été réalisé dans le cadre d’un PFE d’ingénieur en Génie Logiciel à TEK-UP.
Entreprise d’accueil : Triweb
Développé par : Manar Bouoni
Année universitaire : 2024–2025


