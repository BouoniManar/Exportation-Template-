# backend/Exportation/e-commerce/generate_amazon.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback

# --- Configuration (Utiliser des slashes '/' pour la portabilité) ---
TEMPLATE_DIR = "backend/Exportation/e-commerce/templates"
CSS_SOURCE_PATH = "backend/Exportation/e-commerce/styles/amazon_style.css" # Le CSS spécifique
JSON_CONFIG_PATH = "backend/data/amazon.json"               # Le JSON restructuré
OUTPUT_ZIP_PATH = "File_Zip_Exported/amazon.zip"            
# --- Fonctions Utilitaires ---

def add_file_to_zip(zipf, filepath, archive_path):
    """Ajoute un fichier au ZIP, gérant les erreurs et normalisant les chemins."""
    normalized_filepath = os.path.normpath(filepath)
    archive_path_normalized = archive_path.replace("\\", "/") # Assure des slashes dans l'archive
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
            # print(f"  -> Added: '{normalized_filepath}' as '{archive_path_normalized}'") # Décommenter pour debug
        else:
            print(f"  -> Warning: Source file not found, skipping: {normalized_filepath}")
    except Exception as e:
        print(f"  -> Error adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")

# Dans generate_amazon.py

# === VERSION add_images QUI GÈRE CHEMINS COMPLETS ET NOMS SIMPLES ===
def add_images(zipf, config):
    """Trouve et ajoute toutes les images référencées dans le JSON au ZIP,
       en plaçant les images dans une structure relative (sans 'backend/') dans l'archive."""
    print("Adding images...")
    added_images = set()
    # Chemin SOURCE de base des images (relatif au script, AVEC backend/)
    source_base_dir = config.get("site", {}).get("image_source_base", "").replace("\\", "/")
    if not source_base_dir:
        print("  -> Warning: 'image_source_base' not defined. Cannot add relative images.")
        # On pourrait quand même traiter les chemins absolus s'il y en avait
    if source_base_dir and not source_base_dir.endswith('/'):
        source_base_dir += '/'

    # Chemin de base DANS L'ARCHIVE (SANS 'backend/')
    archive_base_dir = source_base_dir
    if archive_base_dir.startswith('backend/'):
        archive_base_dir = archive_base_dir[len('backend/'):] # Enlève 'backend/'

    def find_and_add(data):
        """Fonction récursive pour trouver les chemins/noms d'images."""
        if isinstance(data, dict):
            for key, value in data.items():
                if key in ["logo_url", "icon", "image", "src", "backgroundImage", "button_icon"] and isinstance(value, str):
                    if value and value not in added_images and not value.startswith("http"):
                        # --- Logique de Détermination des Chemins ---
                        source_path = ""
                        archive_path_relative_name = "" # Nom/chemin relatif à la base d'archive

                        # 1. Si 'value' est un chemin complet (commence par backend/ ou assets/)
                        if value.startswith(('backend/', 'assets/')):
                            source_path = value # Chemin source complet
                            # Détermine le nom relatif à la base SOURCE pour obtenir le nom simple
                            relative_name_from_source = ""
                            if value.startswith(source_base_dir):
                                relative_name_from_source = value[len(source_base_dir):]
                            else:
                                # Si le chemin ne commence pas par la base attendue, on prend juste le nom du fichier
                                relative_name_from_source = os.path.basename(value)
                                print(f"  -> Warning: Image path '{value}' doesn't start with expected base '{source_base_dir}'. Using basename '{relative_name_from_source}'.")
                            archive_path_relative_name = relative_name_from_source

                        # 2. Sinon (c'est un nom de fichier simple comme 'icon.png')
                        elif source_base_dir: # Il faut une base source pour le trouver
                            source_path = os.path.join(source_base_dir, value) # Chemin source complet
                            archive_path_relative_name = value # Le nom simple est le chemin relatif à la base d'archive
                        else:
                            # Cas peu probable : nom simple sans base source définie
                            source_path = value
                            archive_path_relative_name = value
                            print(f"  -> Warning: Adding image '{value}' without a defined base source directory.")

                        # --- Ajout au ZIP ---
                        if source_path:
                             # Construit le chemin final DANS l'archive (base sans backend/ + nom relatif)
                             full_archive_path = archive_base_dir + archive_path_relative_name
                             add_file_to_zip(zipf, source_path, full_archive_path)
                             added_images.add(value) # Ajoute la valeur originale pour éviter doublons
                else:
                    # Appel récursif pour chercher plus loin
                    find_and_add(value)
        elif isinstance(data, list):
            for item in data:
                find_and_add(item)

    find_and_add(config)

    if not added_images:
        print("  -> No local image references found or processed.")
    else:
         print(f"  -> Processed {len(added_images)} unique image references.")
# === FIN VERSION add_images ===

# ... (le reste du script generate_amazon.py reste identique) ...

    def find_and_add(data):
        """Fonction récursive pour trouver les URLs d'images."""
        if isinstance(data, dict):
            for key, value in data.items():
                # Clés typiques contenant des NOMS de fichiers images pour Amazon
                if key in ["logo_url", "icon", "image", "backgroundImage", "button_icon", "src"] and isinstance(value, str): # Ajout de 'src'
                     if value and value not in added_images:
                         # Détermine le chemin source et le chemin archive
                         source_path = ""
                         archive_path = ""
                         # Gère les chemins absolus (commençant par / ou backend/ etc.) et relatifs
                         if os.path.isabs(value) or value.startswith(('backend/', 'assets/')):
                              source_path = value
                              archive_path = value # Conserve le chemin relatif au projet dans l'archive
                         elif value.startswith("http"):
                              source_path = None # On n'ajoute pas les URL externes
                         elif base_image_dir:
                              # Si c'est un nom de fichier simple, préfixe avec la base
                              source_path = os.path.join(base_image_dir, value)
                              archive_path = base_image_dir + value # Chemin dans l'archive avec base
                         else:
                              # Si pas de base, considère comme relatif à la racine (moins probable)
                              source_path = value
                              archive_path = value

                         if source_path:
                              add_file_to_zip(zipf, source_path, archive_path.replace("\\", "/"))
                              added_images.add(value) # Ajoute la valeur originale pour éviter doublons
                else:
                    find_and_add(value) # Appel récursif
        elif isinstance(data, list):
            for item in data:
                find_and_add(item) # Appel récursif

    find_and_add(config) # Commence la recherche depuis la racine

    if not added_images:
        print("  -> No image URLs found or processed in the configuration.")
    else:
         print(f"  -> Processed {len(added_images)} unique image references.")


# --- Fonction Principale ---

def generate_page_from_json(json_path, css_path, base_template_name, components_template_name, output_zip_path):
    """Génère une page web à partir de JSON/Templates et la package en ZIP."""

    print(f"--- Starting Amazon-Inspired Page Generation ---")
    normalized_json_path = os.path.normpath(json_path)
    print(f"Using JSON config: {normalized_json_path}")

    # 1. Charger Configuration JSON
    try:
        with open(normalized_json_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("  -> JSON config loaded.")
    except FileNotFoundError:
        print(f"❌ Error: JSON configuration file not found at '{normalized_json_path}'")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Could not decode JSON from '{normalized_json_path}'. Invalid JSON format. Details: {e}")
        return
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")
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
        if components_template_name:
            env.get_template(components_template_name) # Vérifie l'existence
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
            # Assurer que css_path est défini avant cette ligne
            if not os.path.exists(css_path):
                 print(f"❌ Error: CSS source file not found at '{os.path.normpath(css_path)}'. Skipping CSS addition.")
            else:
                 css_archive_filename = os.path.basename(css_path).replace("\\", "/")
                 add_file_to_zip(zipf, css_path, css_archive_filename)

            # Ajouter les images trouvées dans le JSON
            add_images(zipf, config) # Utilise la fonction récursive

        print(f"✅ Page generated and compressed successfully into: '{normalized_output_zip}'")

    except FileNotFoundError: # Peut encore arriver si add_file_to_zip échoue malgré la vérif
         print(f"❌ Error: A file was unexpectedly not found during ZIP creation.")
    except Exception as e:
        print(f"❌ Error during ZIP file creation: {e}")

# --- Point d'Exécution ---
if __name__ == "__main__":
    # Appelle la fonction principale avec les configurations spécifiques à Amazon
    # CORRECTION: Utilisation du nom de fonction correct
    generate_page_from_json(
        json_path=JSON_CONFIG_PATH,
        css_path=CSS_SOURCE_PATH,
        base_template_name="amazon_base.html",
        components_template_name="amazon_components.html", # Nécessaire car importé
        output_zip_path=OUTPUT_ZIP_PATH
    )
    print("--- Amazon-Inspired Page Generation Script Finished ---")