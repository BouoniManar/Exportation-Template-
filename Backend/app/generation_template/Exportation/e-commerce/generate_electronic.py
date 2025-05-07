# backend/Exportation/e-commerce/generate_electronic.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback

TEMPLATE_DIR = "backend/Exportation/e-commerce/templates"
CSS_SOURCE_PATH = "backend/Exportation/e-commerce/styles/electronic_style.css" 
JSON_CONFIG_PATH = "backend/data/electronic.json"              
OUTPUT_ZIP_PATH = "File_Zip_Exported/electronic.zip"            

# --- Fonctions Utilitaires ---

def add_file_to_zip(zipf, filepath, archive_path):
    """Ajoute un fichier au ZIP, gérant les erreurs et normalisant les chemins."""
    # Normalise le chemin source pour le système d'exploitation local
    normalized_filepath = os.path.normpath(filepath)
    # S'assure que le chemin dans l'archive utilise '/'
    archive_path_normalized = archive_path.replace("\\", "/")
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
            # print(f"  -> Added: '{normalized_filepath}' as '{archive_path_normalized}'") # Décommenter pour debug
        else:
            print(f"  -> Warning: File not found, skipping: {normalized_filepath}")
    except Exception as e:
        print(f"  -> Error adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")

def add_images(zipf, config):
    """Trouve et ajoute toutes les images référencées dans le JSON au ZIP."""
    print("Adding images...")
    added_images = set()

    def find_and_add(data):
        """Fonction récursive pour trouver les URLs d'images dans les données."""
        if isinstance(data, dict):
            for key, value in data.items():
                # Clés typiques contenant des URLs d'images
                if key in ["logo_url", "icon_url", "backgroundImage", "image_url", "brand_logo_url"] and isinstance(value, str):
                     if value and value not in added_images:
                         add_file_to_zip(zipf, value, value.replace("\\", "/")) # Utilise l'URL comme source et chemin d'archive
                         added_images.add(value)
                else:
                    # Appel récursif pour les dictionnaires ou listes imbriqués
                    find_and_add(value)
        elif isinstance(data, list):
            for item in data:
                find_and_add(item)

    find_and_add(config) # Commence la recherche depuis la racine du config

    if not added_images:
        print("  -> No image URLs found or processed in the configuration.")
    else:
         print(f"  -> Processed {len(added_images)} unique image paths.")


# --- Fonction Principale ---

def generate_page_from_json(json_path, css_path, base_template_name, components_template_name, output_zip_path):
    """Génère une page web à partir de JSON/Templates et la package en ZIP."""

    print(f"--- Starting Page Generation ---")
    normalized_json_path = os.path.normpath(json_path)
    print(f"Using JSON config: {normalized_json_path}")

    # 1. Charger Configuration JSON
    try:
        with open(normalized_json_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("  -> JSON config loaded.")
    except Exception as e:
        print(f"❌ Error loading JSON '{normalized_json_path}': {e}")
        return

    # 2. Configurer Jinja2
    try:
        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
        print(f"  -> Jinja2 configured for: '{TEMPLATE_DIR}'")
    except Exception as e:
        print(f"❌ Error configuring Jinja2: {e}")
        return

    # 3. Charger Templates
    try:
        base_template = env.get_template(base_template_name)
        # Vérifie si le fichier components existe (important car importé par base)
        if components_template_name:
            env.get_template(components_template_name)
        print(f"  -> Templates loaded: '{base_template_name}'" + (f", '{components_template_name}'" if components_template_name else ""))
    except Exception as e:
        print(f"❌ Error loading templates from '{TEMPLATE_DIR}'. Check names/existence. Details: {e}")
        return

    # 4. Rendre HTML
    try:
        final_html = base_template.render(data=config)
        print("  -> HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error during template rendering: {e}")
        print("--- Rendering Traceback ---")
        traceback.print_exc()
        return

    # 5. Créer Archive ZIP
    normalized_output_zip = os.path.normpath(output_zip_path)
    print(f"Creating ZIP file: '{normalized_output_zip}'")
    try:
        output_dir = os.path.dirname(normalized_output_zip)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Ajouter index.html
            zipf.writestr("index.html", final_html)
            print("  -> Added: 'index.html'")

            # Ajouter le fichier CSS (nommé comme dans base template href)
            css_archive_filename = os.path.basename(css_path).replace("\\", "/")
            add_file_to_zip(zipf, css_path, css_archive_filename)

            # Ajouter les images trouvées dans le JSON
            add_images(zipf, config) # Utilise la fonction récursive

        print(f"✅ Page generated and compressed successfully into: '{normalized_output_zip}'")

    except Exception as e:
        print(f"❌ Error during ZIP file creation: {e}")

# --- Point d'Exécution ---
if __name__ == "__main__":
    # Appelle la fonction principale avec les configurations spécifiques à l'électronique
    generate_page_from_json(
        json_path=JSON_CONFIG_PATH,
        css_path=CSS_SOURCE_PATH,
        base_template_name="electronic_base.html",
        components_template_name="electronic_components.html", # Nécessaire car importé
        output_zip_path=OUTPUT_ZIP_PATH
    )
    print("--- Electronic Page Generation Script Finished ---")