from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json

# --- Configuration ---
TEMPLATE_DIR = "backend/Exportation/e-commerce/templates"
CSS_SOURCE_PATH = "backend/Exportation/e-commerce/styles/style.css"
JSON_CONFIG_PATH = "backend/data/signup.json"
OUTPUT_ZIP_PATH = "File_Zip_Exported/signup.zip"
# ---

def add_file_to_zip(zipf, filepath, archive_path):
    try:
        if os.path.exists(filepath):
            zipf.write(filepath, archive_path)
            print(f"  -> Added: '{filepath}' as '{archive_path}'")
        else:
            print(f"  -> File not found, skipping: {filepath}")
    except Exception as e:
        print(f"  -> Error adding '{filepath}': {e}")

def add_images_to_zip(zipf, config):
    """Ajoute les images référencées dans le config au fichier ZIP."""
    print("Adding images...")
    # Example: Add cross icon if defined
    if config.get("cross_icon") and config["cross_icon"].get("src"):
        image_path = config["cross_icon"]["src"]
        full_source_path = image_path # Adjust if path is not relative to script execution dir
        add_file_to_zip(zipf, full_source_path, image_path) # Keep same path in zip
    else:
        print("  -> No cross_icon src defined in JSON.")
    # Add other images here if needed

def generate_website_from_json(json_file, output_zip="signup.zip"):
    """Génère une page d'inscription à partir d'un fichier JSON et crée un fichier ZIP."""
    print(f"Starting website generation from: {json_file}")

    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("  -> JSON config loaded successfully.")
    except FileNotFoundError:
        print(f"Error: JSON file not found at {json_file}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from {json_file}. Details: {e}")
        return
    except Exception as e:
        print(f"An unexpected error occurred loading JSON: {e}")
        return

    # --- Configure Jinja2 ---
    try:
        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
        print(f"  -> Jinja2 environment configured for directory: {TEMPLATE_DIR}")
    except Exception as e:
        print(f"Error configuring Jinja2 environment: {e}")
        return

    # --- Load Templates ---
    try:
        base_template = env.get_template("signup_base.html")
        # Use a consistent variable name matching the file being loaded
        form_template = env.get_template("signup_form.html")
        print("  -> Jinja2 templates loaded: signup_base.html, signup_form.html")
    except Exception as e:
        print(f"Error loading Jinja2 templates from {TEMPLATE_DIR}. Check filenames. Details: {e}")
        return

    # --- Render Templates ---
    try:
        # 1. Render the form content first using the correct variable
        rendered_form_content = form_template.render(data=config) # Use form_template here
        print("  -> Form template rendered.")

        # 2. Render the base template, injecting the form content
        # Passing 'signup_form_content' which signup_base.html needs to use
        final_html = base_template.render(data=config, signup_form_content=rendered_form_content)
        print("  -> Base template rendered with form content.")

    except Exception as e:
        print(f"Error rendering Jinja2 templates: {e}")
    
        return

    # --- Create ZIP File ---
    print(f"Creating ZIP file: {output_zip}")
    os.makedirs(os.path.dirname(output_zip), exist_ok=True)

    try:
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("index.html", final_html)
            print("  -> Added: index.html")
            add_file_to_zip(zipf, CSS_SOURCE_PATH, "style.css")
            add_images_to_zip(zipf, config)

        print(f"✅ Website generated and compressed successfully into: {output_zip}")

    except FileNotFoundError:
        print(f"Error: Could not create ZIP file. Check path: {output_zip}")
    except Exception as e:
        print(f"An error occurred during ZIP file creation: {e}")

# --- Execution ---
if __name__ == "__main__":
    generate_website_from_json(JSON_CONFIG_PATH, OUTPUT_ZIP_PATH)