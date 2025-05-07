# backend/Exportation/Patisserie/generate_patisserie.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback

# --- Configuration Spécifique à la Patisserie ---
# Adaptez ces chemins si nécessaire

# Répertoire contenant les templates spécifiques à la patisserie
TEMPLATE_DIR = "backend/Exportation/Restaurant/templates"

# Chemin vers le fichier CSS source
CSS_PATISSERIE_PATH = "backend/Exportation/Restaurant/styles/patisserie_style.css"

# Chemin vers le fichier de configuration JSON
# (Attend un fichier contenant une clé principale, ex: "masmoudi")
JSON_PATISSERIE_PATH = "backend/data/patisserie.json"
# Clé principale à utiliser dans le fichier JSON
PATISSERIE_KEY = "masmoudi"

# Répertoire de sortie pour le fichier ZIP
OUTPUT_DIR = "File_Zip_Exported"
# Nom du fichier ZIP de sortie
OUTPUT_PATISSERIE_ZIP_FILENAME = f"{PATISSERIE_KEY}.zip"


# --- Fonctions Utilitaires (Identiques à generate_resto.py) ---

def add_file_to_zip(zipf, filepath, archive_path):
    """Ajoute un fichier au ZIP, gérant les erreurs et normalisant les chemins."""
    normalized_filepath = os.path.normpath(filepath)
    archive_path_normalized = archive_path.replace("\\", "/") # Slashes pour ZIP/Web
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
            # print(f"    -> Added: '{normalized_filepath}' as '{archive_path_normalized}'") # Debug
        else:
            print(f"    -> Warning: Source file not found, skipping: {normalized_filepath}")
    except Exception as e:
        print(f"    -> Error adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")
        traceback.print_exc()

def add_images(zipf, config):
    """Trouve et ajoute toutes les images référencées dans la config au ZIP."""
    print("  Adding images...")
    added_images = set()
    source_base_dir = config.get("site", {}).get("image_source_base", "").replace("\\", "/")
    if not source_base_dir:
        print("    -> Warning: 'site.image_source_base' not defined. Cannot add relative local images.")

    if source_base_dir and not source_base_dir.endswith('/'):
        source_base_dir += '/'

    archive_base_dir = source_base_dir
    if archive_base_dir.startswith('backend/'):
        archive_base_dir = archive_base_dir[len('backend/'):]

    def find_and_add(data):
        if isinstance(data, dict):
            for key, value in data.items():
                 # Clés typiques
                if key in ["logo_url", "image", "src", "icon_url"] and isinstance(value, str):
                    # Vérifie si ce n'est pas une URL externe et si elle n'a pas déjà été ajoutée
                    if value and value not in added_images and not value.startswith(("http:", "https:", "//")):
                        source_path = ""
                        archive_path_relative_name = ""

                        # Si chemin complet (avec backend/ ou assets/)
                        if value.startswith(('backend/', 'assets/')):
                            source_path = value.replace("\\", "/")
                            if source_base_dir and value.startswith(source_base_dir):
                                archive_path_relative_name = value[len(source_base_dir):]
                            else:
                                if value.startswith('backend/'):
                                     archive_path_relative_name = value[len('backend/'):]
                                else: # Si commence par assets/ mais pas dans base_dir attendu
                                     archive_path_relative_name = value # Garde le chemin relatif assets/...
                                     print(f"      -> Info: Image path '{value}' seems relative to project root.")

                        # Si nom de fichier simple (ou chemin relatif sans backend/) ET une base est définie
                        elif source_base_dir:
                             source_path = os.path.join(source_base_dir, value.lstrip('/')).replace("\\", "/")
                             archive_path_relative_name = value.lstrip('/')
                        # Si nom simple et PAS de base définie (peu probable, mais on essaie)
                        else:
                            source_path = value.replace("\\", "/")
                            archive_path_relative_name = value.lstrip('/')
                            print(f"      -> Warning: Adding image '{value}' without base dir.")

                        # Ajout au ZIP si on a trouvé un chemin source
                        if source_path:
                             full_archive_path = (archive_base_dir.rstrip('/') + '/' + archive_path_relative_name.lstrip('/')).lstrip('/')
                             # DEBUG PRINT (copié de generate_resto)
                             # print(f"      Attempting to add image:")
                             # print(f"        - Source on disk: '{os.path.normpath(source_path)}'")
                             # print(f"        - Destination in ZIP: '{full_archive_path}'")
                             add_file_to_zip(zipf, source_path, full_archive_path)
                             added_images.add(value)

                # Appel récursif
                elif isinstance(value, (dict, list)):
                    find_and_add(value)
        elif isinstance(data, list):
            for item in data:
                find_and_add(item)

    find_and_add(config) # Commence à la racine de la config du resto
    if not added_images:
        print("    -> No local image references found or processed.")
    else:
         print(f"    -> Processed {len(added_images)} unique local image references.")


# --- Fonction Principale pour Générer le ZIP de la Patisserie ---

def generate_patisserie_zip(patisserie_key, patisserie_config, css_path, template_dir, base_template_name, components_template_name, output_dir, output_filename):
    """Génère la page et le ZIP pour la patisserie."""

    print(f"\n--- Generating Page for: {patisserie_key} ---")

    output_zip_path = os.path.join(output_dir, output_filename)
    normalized_output_zip = os.path.normpath(output_zip_path)

    # 1. Configurer Jinja2
    try:
        env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
    except Exception as e:
        print(f"❌ Error configuring Jinja2: {e}")
        traceback.print_exc()
        return False

    # 2. Charger Templates
    try:
        base_template = env.get_template(base_template_name)
        if components_template_name:
            env.get_template(components_template_name) # Vérifie existence
        print(f"  -> Templates loaded: '{base_template_name}', '{components_template_name}'")
    except Exception as e:
        print(f"❌ Error loading templates from '{template_dir}'. Details: {e}")
        traceback.print_exc()
        return False

    # 3. Rendre HTML
    try:
        final_html = base_template.render(data=patisserie_config) # Passe la config spécifique
        print("  -> HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error during template rendering: {e}")
        print("--- Rendering Traceback ---")
        traceback.print_exc()
        return False

    # 4. Créer Archive ZIP
    print(f"  Creating ZIP file: '{normalized_output_zip}'")
    try:
        os.makedirs(output_dir, exist_ok=True)

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Ajouter index.html
            zipf.writestr("index.html", final_html)
            print(f"    -> Added: 'index.html'")

            # Ajouter le fichier CSS
            normalized_css_path = os.path.normpath(css_path)
            css_archive_filename = os.path.basename(normalized_css_path)
            if not os.path.exists(normalized_css_path):
                 print(f"❌ Error: CSS file not found at '{normalized_css_path}'. Skipping CSS.")
            else:
                 add_file_to_zip(zipf, normalized_css_path, css_archive_filename)

            # Ajouter les images locales (ignore les URLs externes comme le logo Masmoudi)
            add_images(zipf, patisserie_config)

        print(f"✅ Page for {patisserie_key} generated successfully into: '{normalized_output_zip}'")
        return True

    except FileNotFoundError as e:
         print(f"❌ Error: A file was unexpectedly not found during ZIP creation: {e}")
         traceback.print_exc()
         return False
    except Exception as e:
        print(f"❌ Error during ZIP file creation: {e}")
        traceback.print_exc()
        return False

# --- Point d'Exécution ---
if __name__ == "__main__":
    print("--- Running Patisserie Page Generation Script ---")

    # 1. Charger le JSON principal
    normalized_json_path = os.path.normpath(JSON_PATISSERIE_PATH)
    full_config = {}
    try:
        with open(normalized_json_path, 'r', encoding='utf-8') as f:
            full_config = json.load(f)
        print(f"-> Patisserie JSON config loaded from: {normalized_json_path}")
    except FileNotFoundError:
        print(f"❌ FATAL ERROR: JSON configuration file not found at '{normalized_json_path}'")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ FATAL ERROR: Could not decode JSON from '{normalized_json_path}'. Invalid JSON format. Details: {e}")
        exit(1)
    except Exception as e:
        print(f"❌ FATAL ERROR: Error loading JSON: {e}")
        traceback.print_exc()
        exit(1)

    # 2. Extraire la configuration spécifique à la patisserie
    if PATISSERIE_KEY not in full_config:
        print(f"❌ FATAL ERROR: Key '{PATISSERIE_KEY}' not found in the JSON file '{JSON_PATISSERIE_PATH}'.")
        exit(1)

    patisserie_data = full_config[PATISSERIE_KEY]
    print(f"-> Using configuration for '{PATISSERIE_KEY}'.")

    # 3. Appeler la fonction de génération
    success = generate_patisserie_zip(
        patisserie_key=PATISSERIE_KEY,
        patisserie_config=patisserie_data,
        css_path=CSS_PATISSERIE_PATH,
        template_dir=TEMPLATE_DIR,
        base_template_name="patisserie_base.html",
        components_template_name="patisserie_components.html",
        output_dir=OUTPUT_DIR,
        output_filename=OUTPUT_PATISSERIE_ZIP_FILENAME
    )

    # 4. Résumé final
    print("\n--- Patisserie Page Generation Script Finished ---")
    if success:
        print("Result: Generation successful.")
    else:
        print("Result: Generation failed.")