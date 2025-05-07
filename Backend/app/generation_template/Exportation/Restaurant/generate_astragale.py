# backend/Exportation/restaurant/generate_astragale.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback

# --- Configuration Spécifique à Astragale ---
# Adaptez ces chemins si votre structure de dossiers est différente

# Répertoire contenant les templates (peut être partagé ou spécifique)
TEMPLATE_DIR = "backend/Exportation/Restaurant/templates" # Ou ex: "backend/Exportation/restaurant/templates"
# Chemin vers le fichier CSS source pour Astragale
CSS_ASTRAGALE_PATH = "backend/Exportation/Restaurant/styles/astragale_style.css"

# Chemin vers le fichier de configuration JSON pour Astragale
JSON_ASTRAGALE_PATH = "backend/data/astragale.json"
# Chemin et nom du fichier ZIP de sortie pour Astragale
OUTPUT_ASTRAGALE_ZIP = "File_Zip_Exported/astragale.zip"

# --- Fonctions Utilitaires (INCHANGÉES par rapport à generate_amazon.py) ---

def add_file_to_zip(zipf, filepath, archive_path):
    """Ajoute un fichier au ZIP, gérant les erreurs et normalisant les chemins."""
    normalized_filepath = os.path.normpath(filepath)
    # Assure des slashes '/' dans l'archive pour la compatibilité web/zip
    archive_path_normalized = archive_path.replace("\\", "/")
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
            # print(f"  -> Added: '{normalized_filepath}' as '{archive_path_normalized}'") # Décommenter pour debug
        else:
            print(f"  -> Warning: Source file not found, skipping: {normalized_filepath}")
    except Exception as e:
        print(f"  -> Error adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")
        traceback.print_exc() # Imprime plus de détails en cas d'erreur ici

# Fonction pour ajouter les images référencées dans le JSON au ZIP
# Cette version gère les chemins complets et les noms simples,
# et place les images dans une structure relative (sans 'backend/') dans l'archive.
def add_images(zipf, config):
    """Trouve et ajoute toutes les images référencées dans le JSON au ZIP."""
    print("Adding images...")
    added_images = set()
    # Chemin SOURCE de base des images (relatif au script, AVEC backend/)
    source_base_dir = config.get("site", {}).get("image_source_base", "").replace("\\", "/")
    if not source_base_dir:
        print("  -> Warning: 'site.image_source_base' not defined in JSON. Cannot add relative images.")
        # On pourrait quand même essayer de traiter les chemins complets s'il y en avait

    # Assurer que le chemin source se termine par un slash si non vide
    if source_base_dir and not source_base_dir.endswith('/'):
        source_base_dir += '/'

    # Chemin de base DANS L'ARCHIVE (SANS 'backend/')
    archive_base_dir = source_base_dir
    if archive_base_dir.startswith('backend/'):
        # Enlève 'backend/' du début pour le chemin dans l'archive
        archive_base_dir = archive_base_dir[len('backend/'):]

    def find_and_add(data):
        """Fonction récursive pour trouver les chemins/noms d'images."""
        if isinstance(data, dict):
            for key, value in data.items():
                # Clés typiques contenant des chemins/noms d'images
                # (logo_url, icon, image, src, backgroundImage, button_icon, etc.)
                if key in ["logo_url", "icon", "image", "src", "backgroundImage", "button_icon"] and isinstance(value, str):
                    if value and value not in added_images and not value.startswith(("http:", "https:", "//")): # Ignore URLs externes
                        source_path = ""
                        archive_path_relative_name = "" # Nom/chemin relatif à la base d'archive

                        # 1. Si 'value' est un chemin complet (commence par backend/ ou assets/)
                        if value.startswith(('backend/', 'assets/')):
                            source_path = value.replace("\\", "/") # Chemin source complet
                            # Détermine le nom relatif à la base SOURCE
                            if source_base_dir and value.startswith(source_base_dir):
                                archive_path_relative_name = value[len(source_base_dir):]
                            else:
                                # Si le chemin ne commence pas par la base attendue, essaie de deviner
                                # en enlevant 'backend/' s'il existe, sinon prend le basename.
                                if value.startswith('backend/'):
                                    archive_path_relative_name = value[len('backend/'):]
                                    print(f"  -> Info: Image path '{value}' doesn't start with expected base '{source_base_dir}'. Using relative path '{archive_path_relative_name}'.")
                                else:
                                     archive_path_relative_name = os.path.basename(value)
                                     print(f"  -> Warning: Image path '{value}' doesn't start with expected base '{source_base_dir}' or 'backend/'. Using basename '{archive_path_relative_name}'.")

                        # 2. Sinon (c'est un nom de fichier simple comme 'icon.png' ou relatif sans 'backend/')
                        elif source_base_dir: # Il faut une base source pour le trouver
                             # Assure qu'on ne double pas les slashes
                             source_path = os.path.join(source_base_dir, value.lstrip('/')).replace("\\", "/")
                             archive_path_relative_name = value.lstrip('/') # Le nom simple est le chemin relatif
                        else:
                            # Cas peu probable : nom simple sans base source définie
                            source_path = value.replace("\\", "/")
                            archive_path_relative_name = value.lstrip('/')
                            print(f"  -> Warning: Adding image '{value}' without a defined base source directory. Assuming relative to project root.")

                        # --- Ajout au ZIP ---
                        if source_path:
                             # Construit le chemin final DANS l'archive (base sans backend/ + nom relatif)
                             # Assure qu'il n'y a pas de double slash
                             full_archive_path = (archive_base_dir.rstrip('/') + '/' + archive_path_relative_name.lstrip('/')).lstrip('/')
                             add_file_to_zip(zipf, source_path, full_archive_path)
                             added_images.add(value) # Ajoute la valeur originale pour éviter doublons

                # Appel récursif pour les valeurs de dictionnaire ou les éléments de liste
                elif isinstance(value, (dict, list)):
                    find_and_add(value)
        elif isinstance(data, list):
            for item in data:
                find_and_add(item)

    find_and_add(config) # Commence la recherche depuis la racine du JSON

    if not added_images:
        print("  -> No local image references found or processed.")
    else:
         print(f"  -> Processed {len(added_images)} unique image references.")


# --- Fonction Principale Générique (INCHANGÉE) ---

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
    except FileNotFoundError:
        print(f"❌ Error: JSON configuration file not found at '{normalized_json_path}'")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Could not decode JSON from '{normalized_json_path}'. Invalid JSON format. Details: {e}")
        return
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")
        traceback.print_exc()
        return

    # 2. Configurer Jinja2
    try:
        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
        print(f"  -> Jinja2 configured for: '{TEMPLATE_DIR}'")
    except Exception as e:
        print(f"❌ Error configuring Jinja2: {e}")
        traceback.print_exc()
        return

    # 3. Charger Templates
    try:
        base_template = env.get_template(base_template_name)
        if components_template_name:
            # Charger explicitement le template de composants pour vérifier son existence
            # et permettre à Jinja de le trouver lors de l'import dans le base_template
            env.get_template(components_template_name)
        print(f"  -> Templates loaded: '{base_template_name}'" + (f", '{components_template_name}'" if components_template_name else ""))
    except Exception as e:
        print(f"❌ Error loading templates from '{TEMPLATE_DIR}'. Check names/existence. Details: {e}")
        traceback.print_exc()
        return

    # 4. Rendre HTML
    try:
        # Passe les données JSON complètes au template sous la clé 'data'
        final_html = base_template.render(data=config)
        print("  -> HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error during template rendering: {e}")
        print("--- Rendering Traceback ---")
        traceback.print_exc() # Affiche la trace complète de l'erreur Jinja
        return

    # 5. Créer Archive ZIP
    normalized_output_zip = os.path.normpath(output_zip_path)
    print(f"Creating ZIP file: '{normalized_output_zip}'")
    try:
        output_dir = os.path.dirname(normalized_output_zip)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True) # Crée le dossier de sortie si besoin

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Ajouter index.html (ou nom de base du template) à la racine du zip
            html_filename = os.path.splitext(base_template_name)[0] + ".html" # ex: "astragale_base.html" -> "astragale_base.html"
            # On le renomme en index.html pour la simplicité
            zipf.writestr("index.html", final_html)
            print(f"  -> Added: 'index.html'")

            # Ajouter le fichier CSS (nommé comme dans base template href)
            normalized_css_path = os.path.normpath(css_path)
            if not os.path.exists(normalized_css_path):
                 print(f"❌ Error: CSS source file not found at '{normalized_css_path}'. Skipping CSS addition.")
            else:
                 # Utilise le nom de base du fichier CSS pour le chemin dans l'archive
                 css_archive_filename = os.path.basename(normalized_css_path)
                 add_file_to_zip(zipf, normalized_css_path, css_archive_filename)

            # Ajouter les images trouvées dans le JSON en utilisant la fonction récursive
            add_images(zipf, config)

        print(f"✅ Page generated and compressed successfully into: '{normalized_output_zip}'")

    except FileNotFoundError as e: # Peut arriver si add_file_to_zip échoue malgré la vérif initiale
         print(f"❌ Error: A file was unexpectedly not found during ZIP creation: {e}")
         traceback.print_exc()
    except Exception as e:
        print(f"❌ Error during ZIP file creation: {e}")
        traceback.print_exc()

# --- Point d'Exécution ---
if __name__ == "__main__":
    print("--- Running Astragale Restaurant Page Generation Script ---")
    # Appelle la fonction principale avec les configurations spécifiques à Astragale
    generate_page_from_json(
        json_path=JSON_ASTRAGALE_PATH,
        css_path=CSS_ASTRAGALE_PATH,
        base_template_name="astragale_base.html",        # Nom du template de base
        components_template_name="astragale_components.html", # Nom du template de composants importé
        output_zip_path=OUTPUT_ASTRAGALE_ZIP
    )
    print("--- Astragale Page Generation Script Finished ---")