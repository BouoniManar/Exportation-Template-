# backend/Exportation/Restaurant/generate_resto.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback

# --- Configuration Générale ---
# Répertoire contenant les templates (communs pour les deux restos)
TEMPLATE_DIR = "backend/Exportation/Restaurant/templates"

# Chemin vers le fichier CSS source (commun pour les deux restos)
CSS_SHARED_PATH = "backend/Exportation/Restaurant/styles/resto_style.css"

# Chemin vers le fichier de configuration JSON (contenant les deux restos)
JSON_MULTI_RESTO_PATH = "backend/data/resto.json"

# Répertoire de sortie pour les fichiers ZIP
OUTPUT_DIR = "File_Zip_Exported"

# --- Fonctions Utilitaires (INCHANGÉES) ---

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
    """Trouve et ajoute toutes les images référencées dans la config *spécifique* d'un restaurant au ZIP."""
    print("  Adding images...")
    added_images = set()
    source_base_dir = config.get("site", {}).get("image_source_base", "").replace("\\", "/")
    if not source_base_dir:
        print("    -> Warning: 'site.image_source_base' not defined. Cannot add relative images.")

    if source_base_dir and not source_base_dir.endswith('/'):
        source_base_dir += '/'

    archive_base_dir = source_base_dir
    if archive_base_dir.startswith('backend/'):
        archive_base_dir = archive_base_dir[len('backend/'):]

    def find_and_add(data):
        if isinstance(data, dict):
            for key, value in data.items():
                # Clés typiques + icon_url ajouté pour Chaneb
                if key in ["logo_url", "restaurant_logo_url", "icon_url", "icon", "image", "src", "backgroundImage", "button_icon"] and isinstance(value, str):
                    if value and value not in added_images and not value.startswith(("http:", "https:", "//")):
                        source_path = ""
                        archive_path_relative_name = ""

                        if value.startswith(('backend/', 'assets/')):
                            source_path = value.replace("\\", "/")
                            if source_base_dir and value.startswith(source_base_dir):
                                archive_path_relative_name = value[len(source_base_dir):]
                            else:
                                if value.startswith('backend/'):
                                    archive_path_relative_name = value[len('backend/'):]
                                    # print(f"      -> Info: Image path '{value}' uses relative path '{archive_path_relative_name}'.") # Debug
                                else:
                                     archive_path_relative_name = os.path.basename(value)
                                     print(f"      -> Warning: Image path '{value}' doesn't start with expected base or 'backend/'. Using basename '{archive_path_relative_name}'.")
                        elif source_base_dir:
                             source_path = os.path.join(source_base_dir, value.lstrip('/')).replace("\\", "/")
                             archive_path_relative_name = value.lstrip('/')
                        else:
                            source_path = value.replace("\\", "/")
                            archive_path_relative_name = value.lstrip('/')
                            print(f"      -> Warning: Adding image '{value}' without base dir. Assuming relative to project root.")

                        if source_path:
                             full_archive_path = (archive_base_dir.rstrip('/') + '/' + archive_path_relative_name.lstrip('/')).lstrip('/')
                             add_file_to_zip(zipf, source_path, full_archive_path)
                             added_images.add(value)
                elif isinstance(value, (dict, list)):
                    find_and_add(value)
        elif isinstance(data, list):
            for item in data:
                find_and_add(item)

    find_and_add(config)
    if not added_images:
        print("    -> No local image references found or processed for this restaurant.")
    else:
         print(f"    -> Processed {len(added_images)} unique image references for this restaurant.")


# --- Fonction Principale pour Générer UN Restaurant ---

def generate_single_restaurant_zip(restaurant_key, restaurant_config, css_shared_path, template_dir, base_template_name, components_template_name, output_dir):
    """Génère la page et le ZIP pour un seul restaurant."""

    print(f"\n--- Generating Page for: {restaurant_key} ---")

    # Détermine le chemin de sortie du ZIP
    output_zip_filename = f"{restaurant_key}.zip"
    output_zip_path = os.path.join(output_dir, output_zip_filename)
    normalized_output_zip = os.path.normpath(output_zip_path)

    # 1. Configurer Jinja2
    try:
        env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
        # print(f"  -> Jinja2 configured for: '{template_dir}'") # Moins verbeux
    except Exception as e:
        print(f"❌ Error configuring Jinja2 for {restaurant_key}: {e}")
        traceback.print_exc()
        return False # Indique un échec

    # 2. Charger Templates
    try:
        base_template = env.get_template(base_template_name)
        if components_template_name:
            env.get_template(components_template_name) # Vérifie existence
        # print(f"  -> Templates loaded: '{base_template_name}', '{components_template_name}'")
    except Exception as e:
        print(f"❌ Error loading templates from '{template_dir}' for {restaurant_key}. Details: {e}")
        traceback.print_exc()
        return False

    # 3. Rendre HTML
    try:
        # Important: Passe la config *spécifique* du restaurant au template
        final_html = base_template.render(data=restaurant_config)
        print("  -> HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error during template rendering for {restaurant_key}: {e}")
        print("--- Rendering Traceback ---")
        traceback.print_exc()
        return False

    # 4. Créer Archive ZIP
    print(f"  Creating ZIP file: '{normalized_output_zip}'")
    try:
        os.makedirs(output_dir, exist_ok=True) # Crée le dossier de sortie si besoin

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Ajouter index.html
            zipf.writestr("index.html", final_html)
            print(f"    -> Added: 'index.html'")

            # Ajouter le fichier CSS partagé
            normalized_css_path = os.path.normpath(css_shared_path)
            css_archive_filename = os.path.basename(normalized_css_path) # Nom dans l'archive: resto_style.css
            if not os.path.exists(normalized_css_path):
                 print(f"❌ Error: Shared CSS file not found at '{normalized_css_path}'. Skipping CSS addition.")
            else:
                 add_file_to_zip(zipf, normalized_css_path, css_archive_filename)

            # Ajouter les images spécifiques à ce restaurant
            add_images(zipf, restaurant_config) # Passe la config du resto

        print(f"✅ Page for {restaurant_key} generated successfully into: '{normalized_output_zip}'")
        return True # Indique un succès

    except FileNotFoundError as e:
         print(f"❌ Error: A file was unexpectedly not found during ZIP creation for {restaurant_key}: {e}")
         traceback.print_exc()
         return False
    except Exception as e:
        print(f"❌ Error during ZIP file creation for {restaurant_key}: {e}")
        traceback.print_exc()
        return False

# --- Point d'Exécution ---
if __name__ == "__main__":
    print("--- Running Multi-Restaurant Page Generation Script ---")

    # 1. Charger le JSON principal contenant tous les restaurants
    normalized_json_path = os.path.normpath(JSON_MULTI_RESTO_PATH)
    all_configs = {}
    try:
        with open(normalized_json_path, 'r', encoding='utf-8') as f:
            all_configs = json.load(f)
        print(f"-> Multi-restaurant JSON config loaded from: {normalized_json_path}")
    except FileNotFoundError:
        print(f"❌ FATAL ERROR: Main JSON configuration file not found at '{normalized_json_path}'")
        exit(1) # Quitte le script si le JSON principal manque
    except json.JSONDecodeError as e:
        print(f"❌ FATAL ERROR: Could not decode JSON from '{normalized_json_path}'. Invalid JSON format. Details: {e}")
        exit(1)
    except Exception as e:
        print(f"❌ FATAL ERROR: Error loading main JSON: {e}")
        traceback.print_exc()
        exit(1)

    # 2. Itérer sur chaque restaurant défini dans le JSON et générer sa page/ZIP
    success_count = 0
    fail_count = 0
    # Les clés du JSON principal sont les identifiants des restaurants
    restaurant_keys = list(all_configs.keys())

    if not restaurant_keys:
        print("❌ No restaurant configurations found in the JSON file.")
        exit(1)

    print(f"-> Found configurations for: {', '.join(restaurant_keys)}")

    for key in restaurant_keys:
        config = all_configs[key]
        # Appelle la fonction pour générer le ZIP de ce restaurant
        if generate_single_restaurant_zip(
            restaurant_key=key,
            restaurant_config=config,
            css_shared_path=CSS_SHARED_PATH,
            template_dir=TEMPLATE_DIR,
            base_template_name="resto_base.html",        # Template de base commun
            components_template_name="resto_components.html", # Composants communs
            output_dir=OUTPUT_DIR
        ):
            success_count += 1
        else:
            fail_count += 1

    # 3. Résumé final
    print("\n--- Multi-Restaurant Page Generation Script Finished ---")
    print(f"Summary: {success_count} generated successfully, {fail_count} failed.")