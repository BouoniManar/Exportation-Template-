# backend/Exportation/e-commerce/generate_signin.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import json
import traceback 

# --- Configuration ---
# Use forward slashes for better cross-platform compatibility
TEMPLATE_DIR = "backend/Exportation/e-commerce/templates"
CSS_SOURCE_PATH = "backend/Exportation/e-commerce/styles/style.css"
# Use the JSON configuration file specific to the sign-in page
JSON_CONFIG_PATH = "backend/data/signin.json"
# Define the output ZIP file name for the sign-in page
OUTPUT_ZIP_PATH = "File_Zip_Exported/signin.zip"
# ---

def add_file_to_zip(zipf, filepath, archive_path):
    """
    Adds a file to the ZIP archive with error handling.

    Args:
        zipf: The ZipFile object.
        filepath: The path to the file on the local system.
        archive_path: The desired path of the file within the ZIP archive.
    """
    try:
        # Check if the source file exists before trying to add it
        if os.path.exists(filepath):
            zipf.write(filepath, archive_path)
            print(f"  -> Added: '{filepath}' as '{archive_path}'")
        else:
            # Log a warning if the file is not found but continue the process
            print(f"  -> File not found, skipping: {filepath}")
    except Exception as e:
        # Log any other error that occurs during file addition
        print(f"  -> Error adding '{filepath}': {e}")

def add_images_to_zip(zipf, config):
    """
    Adds images referenced in the configuration JSON to the ZIP archive.

    Args:
        zipf: The ZipFile object.
        config: The dictionary loaded from the JSON configuration file.
    """
    print("Adding images...")
    # Example: Add cross icon if defined in JSON
    if config.get("cross_icon") and isinstance(config["cross_icon"], dict) and config["cross_icon"].get("src"):
        image_path = config["cross_icon"]["src"]
        # Assume image paths in JSON are relative to where the script runs or project root
        # Adjust full_source_path logic if images are elsewhere
        full_source_path = image_path
        # Add the image to the ZIP, keeping the same relative path
        add_file_to_zip(zipf, full_source_path, image_path)
    else:
        print("  -> No cross_icon src defined or valid in JSON.")

    # Example: Add Facebook icon if defined in JSON
    if config.get("form", {}).get("facebook_login") and isinstance(config["form"]["facebook_login"], dict) and config["form"]["facebook_login"].get("icon_src"):
        fb_icon_path = config["form"]["facebook_login"]["icon_src"]
        full_fb_icon_path = fb_icon_path
        add_file_to_zip(zipf, full_fb_icon_path, fb_icon_path)
    else:
         print("  -> No facebook_login icon_src defined or valid in JSON.")

    # Add logic here to add other images referenced in the config if needed

def generate_signin_page_from_json(json_file, output_zip):
    """
    Generates a sign-in web page from a JSON configuration file,
    using Jinja2 templates, and packages it into a ZIP archive.

    Args:
        json_file: Path to the JSON configuration file (e.g., "signin.json").
        output_zip: Path where the output ZIP file should be created (e.g., "signin.zip").
    """
    print(f"--- Starting Sign-In Page Generation ---")
    print(f"Using JSON config: {json_file}")

    # --- 1. Load JSON Configuration ---
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("  -> JSON config loaded successfully.")
    except FileNotFoundError:
        print(f"❌ Error: JSON configuration file not found at '{json_file}'")
        return # Stop execution if config is missing
    except json.JSONDecodeError as e:
        print(f"❌ Error: Could not decode JSON from '{json_file}'. Invalid JSON format. Details: {e}")
        return # Stop execution if JSON is invalid
    except Exception as e:
        print(f"❌ Error: An unexpected error occurred while loading JSON: {e}")
        return # Stop for any other loading errors

    # --- 2. Configure Jinja2 Environment ---
    try:
        # Create a Jinja2 environment, specifying the directory containing the templates
        # FileSystemLoader looks for templates in the given directory path
        # autoescape=True automatically escapes variables to prevent XSS vulnerabilities
        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
        print(f"  -> Jinja2 environment configured for template directory: '{TEMPLATE_DIR}'")
    except Exception as e:
        print(f"❌ Error: Failed to configure Jinja2 environment: {e}")
        return # Stop if Jinja2 can't be set up

    # --- 3. Load Jinja2 Templates ---
    try:
        # Load the base structure template (reused from sign-up)
        base_template = env.get_template("signup_base.html")
        # Load the template containing the specific sign-in form content
        form_template = env.get_template("signin_form.html")
        print(f"  -> Jinja2 templates loaded: 'signup_base.html', 'signin_form.html'")
    except Exception as e:
        # Error likely means template files are missing or named incorrectly
        print(f"❌ Error: Failed to load Jinja2 templates from '{TEMPLATE_DIR}'. Check filenames. Details: {e}")
        return # Stop if templates can't be loaded

    # --- 4. Render HTML Content ---
    try:
        # Step 1: Render the specific form content template first
        # Pass the loaded 'config' dictionary as 'data' to the template
        rendered_form_content = form_template.render(data=config)
        print("  -> Sign-in form content rendered successfully.")

        # Step 2: Render the base template, injecting the rendered form content
        # Pass the general 'config' (for page title etc.) AND the rendered form HTML
        # The variable name 'signup_form_content' matches what signup_base.html expects
        final_html = base_template.render(data=config, signup_form_content=rendered_form_content)
        print("  -> Base template rendered with sign-in content.")

    except Exception as e:
        # Errors here could be due to missing variables in JSON or syntax errors in templates
        print(f"❌ Error: Failed during Jinja2 template rendering: {e}")
        # Uncomment the next two lines for a detailed traceback of the Jinja error
        # print("--- Jinja Rendering Traceback ---")
        # traceback.print_exc()
        return # Stop if rendering fails

    # --- 5. Create ZIP Archive ---
    print(f"Creating output ZIP file: '{output_zip}'")
    try:
        # Ensure the output directory exists, create it if necessary
        output_dir = os.path.dirname(output_zip)
        if output_dir: # Avoid error if output_zip is in the current directory
             os.makedirs(output_dir, exist_ok=True)

        # Open the ZIP file in write mode ('w') with compression
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add the final generated HTML as 'index.html' to the root of the ZIP
            zipf.writestr("index.html", final_html)
            print("  -> Added: 'index.html'")

            # Add the CSS file to the root of the ZIP
            add_file_to_zip(zipf, CSS_SOURCE_PATH, "style.css")

            # Add images specified in the JSON configuration
            add_images_to_zip(zipf, config)

        print(f"✅ Sign-in page generated and compressed successfully into: '{output_zip}'")

    except FileNotFoundError:
         # This specific error might occur if the CSS_SOURCE_PATH is wrong during add_file_to_zip
         # or potentially if the output_zip path is fundamentally invalid (less likely with makedirs)
        print(f"❌ Error: A required file or directory was not found during ZIP creation. Check paths like CSS_SOURCE_PATH.")
    except Exception as e:
        print(f"❌ Error: An unexpected error occurred during ZIP file creation: {e}")

# --- Execution Entry Point ---
# This block ensures the code runs only when the script is executed directly
if __name__ == "__main__":
    # Call the main function with the configured JSON and output paths
    generate_signin_page_from_json(JSON_CONFIG_PATH, OUTPUT_ZIP_PATH)
    print("--- Sign-In Page Generation Script Finished ---")