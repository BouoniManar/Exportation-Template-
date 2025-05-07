# backend/Exportation/e-commerce/generate_cosmetic.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback 

# --- Configuration ---
TEMPLATE_DIR = "backend/Exportation/e-commerce/templates"   
CSS_SOURCE_PATH = "backend/Exportation/e-commerce/styles/style_cosmetic.css" 
JSON_CONFIG_PATH = "backend/data/cosmetique.json" 
OUTPUT_ZIP_PATH = "File_Zip_Exported/cosmetic.zip"

# ---

def add_file_to_zip(zipf, filepath, archive_path):
    """
    Ajoute un fichier au ZIP avec gestion d'erreur.
    Crucial : 'archive_path' doit correspondre au chemin utilisé dans le HTML (src, href).
    """
    normalized_filepath = os.path.normpath(filepath)
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path)
            print(f"  -> Added: '{normalized_filepath}' as '{archive_path}'")
        else:
            print(f"  -> File not found, skipping: {normalized_filepath}")
    except Exception as e:
        print(f"  -> Error adding '{normalized_filepath}': {e}")

def add_cosmetic_images_to_zip(zipf, config):
    """
    Ajoute les images spécifiques au site cosmétique référencées dans le config au ZIP.
    Préserve la structure des dossiers des images DANS le ZIP.
    """
    print("Adding cosmetic images...")
    added_images = set() # Pour éviter d'ajouter la même image plusieurs fois

    # Fonction interne pour ajouter une image si elle existe et n'a pas déjà été ajoutée
    def add_image_if_valid(image_path):
        if image_path and image_path not in added_images:
            # Le chemin dans l'archive doit utiliser '/'
            archive_image_path = image_path.replace("\\", "/")
            # Le chemin source doit être adapté au système d'exploitation
            full_source_path = os.path.normpath(image_path) # Normalise pour l'OS
            add_file_to_zip(zipf, full_source_path, archive_image_path)
            added_images.add(image_path) # Garde la trace de l'original

    # 1. Logo du site
    try:
        logo_path = config.get("site", {}).get("logo_url")
        add_image_if_valid(logo_path)
    except Exception as e:
        print(f"  -> Warning: Could not process site logo: {e}")

    # 2. Bannière
    try:
        banner_path = config.get("banner", {}).get("image_url")
        add_image_if_valid(banner_path)
    except Exception as e:
        print(f"  -> Warning: Could not process banner image: {e}")

    # 3. Produits
    try:
        products = config.get("products_section", {}).get("products", [])
        if isinstance(products, list):
            for product in products:
                if isinstance(product, dict):
                    product_image_path = product.get("image_url")
                    add_image_if_valid(product_image_path)
        else:
             print("  -> Warning: 'products' is not a list in products_section.")
    except Exception as e:
        print(f"  -> Warning: Could not process product images: {e}")

    if not added_images:
        print("  -> No images found or added from the configuration.")


def generate_cosmetic_page_from_json(json_file, output_zip):
    """
    Génère une page web e-commerce (cosmétique) à partir d'un fichier JSON
    et la package dans un fichier ZIP avec CSS et images.
    """
    print(f"--- Starting Cosmetic E-commerce Page Generation ---")
    # CORRIGÉ : Normalise le chemin JSON pour l'ouverture du fichier
    normalized_json_path = os.path.normpath(json_file)
    print(f"Using JSON config: {normalized_json_path}")

    # --- 1. Load JSON Configuration ---
    try:
        with open(normalized_json_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("  -> JSON config loaded successfully.")
    except FileNotFoundError:
        print(f"❌ Error: JSON configuration file not found at '{normalized_json_path}'")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Could not decode JSON from '{normalized_json_path}'. Invalid JSON format. Details: {e}")
        return
    except Exception as e:
        print(f"❌ Error: An unexpected error occurred while loading JSON: {e}")
        return

    # --- 2. Configure Jinja2 Environment ---
    try:
        # Utilise TEMPLATE_DIR (avec '/') pour Jinja Loader
        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
        print(f"  -> Jinja2 environment configured for template directory: '{TEMPLATE_DIR}'")
    except Exception as e:
        print(f"❌ Error: Failed to configure Jinja2 environment: {e}")
        return

    # --- 3. Load Jinja2 Templates ---
    try:
        base_template = env.get_template("cosmetique_base.html")
        env.get_template("cosmetique_components.html")
        print(f"  -> Jinja2 templates loaded: 'cosmetique_base.html', 'cosmetique_components.html'")
    except Exception as e:
        # L'ERREUR PRINCIPALE EST ICI : le fichier n'est pas trouvé
        print(f"❌ Error: Failed to load Jinja2 templates from '{TEMPLATE_DIR}'. Check filenames. Details: {e}")
        print(f"❗ Please ensure 'cosmetique_base.html' exists EXACTLY at this location: {os.path.abspath(TEMPLATE_DIR)}")
        return

    # --- 4. Render HTML Content ---
    try:
        final_html = base_template.render(data=config)
        print("  -> Cosmetic page HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error: Failed during Jinja2 template rendering: {e}")
        print("--- Jinja Rendering Traceback ---")
        traceback.print_exc()
        return

    # --- 5. Create ZIP Archive ---
    normalized_output_zip = os.path.normpath(output_zip)
    print(f"Creating output ZIP file: '{normalized_output_zip}'")
    try:
        output_dir = os.path.dirname(normalized_output_zip)
        if output_dir:
             os.makedirs(output_dir, exist_ok=True)

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("index.html", final_html)
            print("  -> Added: 'index.html'")

            # Utilise le chemin d'archive avec '/'
            css_archive_path = os.path.basename(CSS_SOURCE_PATH) # Juste le nom du fichier
            add_file_to_zip(zipf, CSS_SOURCE_PATH, css_archive_path) # Utilise css_archive_path

            add_cosmetic_images_to_zip(zipf, config)

        print(f"✅ Cosmetic page generated and compressed successfully into: '{normalized_output_zip}'")

    except FileNotFoundError:
        print(f"❌ Error: A required file or directory was not found during ZIP creation. Check paths like CSS_SOURCE_PATH.")
    except Exception as e:
        print(f"❌ Error: An unexpected error occurred during ZIP file creation: {e}")

# --- Execution Entry Point ---
if __name__ == "__main__":
    generate_cosmetic_page_from_json(JSON_CONFIG_PATH, OUTPUT_ZIP_PATH)
    print("--- Cosmetic Page Generation Script Finished ---")