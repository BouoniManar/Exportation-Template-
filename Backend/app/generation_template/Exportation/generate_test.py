# PAGE-USER/Backend/app/generation_template/Exportation/generate_test.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import traceback
import time
import json # Keep json import if needed elsewhere, though not directly used in this snippet


# --- Configuration ---
# Paths relative to the directory where the server is launched (e.g., D:\Page-User)
TEMPLATE_DIR = "Backend/app/generation_template/Exportation/templates"
CSS_TEST_PATH = "Backend/app/generation_template/Exportation/test_style.css"
OUTPUT_DIR = "Backend/app/generation_template/File_Zip_Exported" # Must exist or be created
IMAGE_ZIP_DIR = "img" # Directory name for images INSIDE the zip file


# --- Utility Functions ---

def add_file_to_zip(zipf, filepath, archive_path):
    """Adds a single file to the zip archive."""
    normalized_filepath = os.path.normpath(filepath)
    # Ensure archive path uses forward slashes and doesn't start with one
    archive_path_normalized = archive_path.replace("\\", "/").lstrip('/')
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
            # print(f"      -> Successfully added '{normalized_filepath}' as '{archive_path_normalized}'") # Verbose
        else:
            print(f"    -> ERROR (add_file_to_zip): Source file NOT FOUND: {normalized_filepath}")
            # Raise error if a required file is missing
            raise FileNotFoundError(f"Required file not found during ZIP add: {normalized_filepath}")
    except Exception as e:
        print(f"    -> ERROR (add_file_to_zip) adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")
        raise # Re-raise exception


def find_image_paths(data):
    """ Recursively finds all image paths within the configuration data. """
    paths = set() # Use a set to avoid duplicates
    if isinstance(data, dict):
        for key, value in data.items():
            # Check common keys for image URLs
            if key in ['logo_url', 'src'] and isinstance(value, str) and value:
                 # Basic check if it looks like a path
                 if '/' in value or '\\' in value:
                    paths.add(value)
            # Check for image objects like {'src': '...', 'alt': '...'}
            elif key == 'image' and isinstance(value, dict) and 'src' in value and value['src']:
                 if '/' in value['src'] or '\\' in value['src']:
                     paths.add(value['src'])
            # Check for product image which might be directly the path string
            elif key == 'image' and isinstance(value, str) and value:
                 if '/' in value or '\\' in value:
                    paths.add(value)
            # Recurse into nested dictionaries or lists
            elif isinstance(value, (dict, list)):
                paths.update(find_image_paths(value))
    elif isinstance(data, list):
        for item in data:
            paths.update(find_image_paths(item))
    return list(paths) # Return as a list


def add_images(zipf, config):
    """
    Finds all image paths in the config, copies them from their source location
    on disk into the specified IMAGE_ZIP_DIR folder within the ZIP archive,
    using only the filename as the destination name inside that folder.
    """
    print(f"  Adding images to ZIP directory '{IMAGE_ZIP_DIR}/'...")
    image_source_paths = find_image_paths(config) # Get all unique image paths from JSON data

    if not image_source_paths:
        print("    -> No image paths found in config.")
        return

    added_count = 0
    skipped_count = 0
    error_count = 0

    # Optional: Create the image directory entry explicitly in the ZIP
    # zipf.writestr(IMAGE_ZIP_DIR + "/", "")

    for source_path_from_json in image_source_paths:
        # Normalize the path found in the JSON (relative to script execution dir)
        normalized_source_path_on_disk = os.path.normpath(source_path_from_json)

        # *** CRITICAL CHECK: Verify the source image exists on disk ***
        if not os.path.exists(normalized_source_path_on_disk):
            print(f"    -> WARNING: Source image NOT FOUND on disk, skipping: {normalized_source_path_on_disk}")
            skipped_count += 1
            continue # Skip this image

        try:
            # Extract just the filename from the disk path
            filename = os.path.basename(normalized_source_path_on_disk)
            if not filename:
                print(f"    -> WARNING: Could not extract filename from path, skipping: {normalized_source_path_on_disk}")
                skipped_count += 1
                continue

            # Construct the path *inside* the ZIP archive (e.g., "img/logo.png")
            archive_path = f"{IMAGE_ZIP_DIR}/{filename}"

            print(f"    -> Adding: '{normalized_source_path_on_disk}' as '{archive_path}'")
            # Call the utility function to add the file
            add_file_to_zip(zipf, normalized_source_path_on_disk, archive_path)
            added_count += 1

        except FileNotFoundError as e: # Catch error from add_file_to_zip
             print(f"    -> ERROR (FileNotFound reported by add_file_to_zip): {e}")
             error_count +=1
             # Depending on requirements, re-raise to stop the process
             # raise
        except Exception as e:
            print(f"    -> UNEXPECTED ERROR adding image '{normalized_source_path_on_disk}': {e}")
            error_count += 1
            # Optionally re-raise for critical errors
            # raise

    print(f"  Image summary: Added={added_count}, Skipped(Not Found/Bad Path)={skipped_count}, Errors={error_count}")
    if error_count > 0:
         # Consider raising an error if any image addition failed critically
         # raise RuntimeError(f"{error_count} critical errors occurred during image processing.")
         pass # Or just log and continue


# --- Core Generation Function (Writes to Disk) ---
def _original_generate_and_save_zip(config_data_to_render, css_path, template_dir, base_template_name, components_template_name, output_dir, output_filename, config_key_name):
    """Generates the HTML, CSS, images and saves them into a ZIP file on disk."""
    print(f"\n--- Calling _original_generate_and_save_zip for Key: {config_key_name} ---")

    # --- 1. Check Paths ---
    if not os.path.isdir(template_dir):
        print(f"❌ FATAL: Template directory not found: '{template_dir}'")
        raise FileNotFoundError(f"Template directory not found: '{template_dir}'")
    base_template_path = os.path.join(template_dir, base_template_name)
    if not os.path.isfile(base_template_path):
        print(f"❌ FATAL: Base template not found: '{base_template_path}'")
        raise FileNotFoundError(f"Base template '{base_template_name}' not found in '{template_dir}'")
    components_template_path = os.path.join(template_dir, components_template_name)
    if components_template_name and not os.path.isfile(components_template_path):
         print(f"❌ FATAL: Components template not found: '{components_template_path}'")
         raise FileNotFoundError(f"Components template '{components_template_name}' not found in '{template_dir}'")


    output_zip_path = os.path.join(output_dir, output_filename)
    normalized_output_zip = os.path.normpath(output_zip_path)
    print(f"  Target disk path: '{normalized_output_zip}'")


    # --- 2. Configure Jinja2 Environment ---
    try:
        env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=True # Enable autoescaping for security
        )
        # ===>>> CRITICAL: ADD THE BASENAME FILTER <<<===
        env.filters['basename'] = os.path.basename
        print(f"  -> Jinja environment configured. Filters: {list(env.filters.keys())}")

    except Exception as e:
        print(f"❌ Error configuring Jinja2: {e}")
        raise RuntimeError("Jinja configuration failed") from e

    # --- 3. Load Templates ---
    try:
        base_template = env.get_template(base_template_name)
        # Components template is usually loaded via {% import %} in base, but check existence
        if components_template_name:
            env.get_template(components_template_name)
        print(f"  -> Templates loaded: '{base_template_name}', '{components_template_name}'")
    except Exception as e:
        print(f"❌ Error loading templates from '{template_dir}': {e}")
        raise RuntimeError("Template loading failed") from e

    # --- 4. Render HTML ---
    try:
        # Pass the full config data under the 'data' key
        final_html = base_template.render(data=config_data_to_render)
        print("  -> HTML rendered successfully.")
    except Exception as e:
        print(f"❌ Error during template rendering: {e}")
        traceback.print_exc() # Print detailed traceback for Jinja errors
        raise RuntimeError("Template rendering failed") from e

    # --- 5. Create ZIP Archive ---
    try:
        os.makedirs(output_dir, exist_ok=True) # Ensure output directory exists
        print(f"  Creating ZIP file: '{normalized_output_zip}'")
        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add HTML file
            print(f"    -> Adding: index.html ({len(final_html)} bytes)")
            zipf.writestr("index.html", final_html)

            # Add CSS file (if it exists)
            if os.path.isfile(css_path):
                 css_archive_filename = os.path.basename(css_path) # e.g., "test_style.css"
                 print(f"    -> Adding CSS: '{css_path}' as '{css_archive_filename}'")
                 add_file_to_zip(zipf, css_path, css_archive_filename)
            else:
                print(f"    -> WARNING: CSS file not found at '{css_path}', skipping.")

            # Add all images found in the config
            add_images(zipf, config_data_to_render)

        print(f"✅ Template ZIP generated successfully on disk: '{normalized_output_zip}'")
        return normalized_output_zip # Return the full path to the created ZIP

    except FileNotFoundError as e: # Specifically catch file not found during zipping
        print(f"❌ Error (FileNotFound during ZIP): Asset file not found: {e}")
        raise
    except Exception as e:
        print(f"❌ Error during ZIP file creation: {e}")
        traceback.print_exc()
        raise RuntimeError("ZIP creation failed") from e


# --- FastAPI Wrapper Function ---
def run_generation_for_fastapi(full_config_dict: dict) -> str:
    """
    Wrapper function called by the FastAPI endpoint.
    It extracts config, calls the main generation logic, and returns the path.
    """
    print("\n--- ENTERING run_generation_for_fastapi ---")
    try:
        # 1. Extract data (assuming top-level key is the site name)
        if not full_config_dict:
             raise ValueError("Received empty configuration dictionary.")
        config_key_name = list(full_config_dict.keys())[0]
        config_data_to_render = full_config_dict[config_key_name]
        if not config_data_to_render:
             raise ValueError(f"No configuration data found under key '{config_key_name}'.")
        print(f"-> Wrapper: Using config key: '{config_key_name}'.")

        # 2. Define output filename
        timestamp = int(time.time())
        output_zip_filename = f"{config_key_name.lower().replace(' ', '_')}_template_{timestamp}.zip"

        # 3. Call the core generation function (which writes the ZIP to disk)
        # Using constants defined at the top of the file
        generated_zip_path = _original_generate_and_save_zip(
            config_data_to_render=config_data_to_render,
            css_path=CSS_TEST_PATH,
            template_dir=TEMPLATE_DIR,
            base_template_name="test_base.html",           # Standard base template name
            components_template_name="test_components.html", # Standard components template name
            output_dir=OUTPUT_DIR,
            output_filename=output_zip_filename,
            config_key_name=config_key_name               # Pass the key name for logging
        )

        # 4. Verify and return the path
        if generated_zip_path and os.path.exists(generated_zip_path):
            print(f"--- EXITING run_generation_for_fastapi (SUCCESS) ---")
            return generated_zip_path # Return the path for FastAPI to serve
        else:
            # This case should ideally be caught by exceptions in the core function
            print(f"❌ ERROR: Generation function finished but ZIP file not found at expected path: {generated_zip_path}")
            raise RuntimeError(f"Generation failed or ZIP file not found. Path: {generated_zip_path}")

    except Exception as e:
        # Catch any exception raised during the process
        print(f"--- EXITING run_generation_for_fastapi (EXCEPTION) ---")
        print(f"❌ EXCEPTION in run_generation_for_fastapi wrapper: {type(e).__name__}: {e}")
        # Optionally print traceback here if not already done in lower functions
        # traceback.print_exc()
        raise # Re-raise the exception for the FastAPI endpoint to handle (e.g., return 500)

# Note: No `if __name__ == "__main__":` block as this is intended to be called by FastAPI