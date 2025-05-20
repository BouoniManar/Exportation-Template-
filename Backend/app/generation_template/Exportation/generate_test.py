# PAGE-USER/Backend/app/generation_template/Exportation/generate_test.py

from jinja2 import Environment, FileSystemLoader
import os
import zipfile
import traceback
import time
import json
import requests
import mimetypes
import copy
import re
from urllib.parse import urlparse, unquote
import uuid
from pathlib import Path

# --- Configuration des Chemins Basée sur l'Emplacement du Script ---
CURRENT_SCRIPT_PATH = Path(__file__).resolve()

EXPORTATION_DIR = CURRENT_SCRIPT_PATH.parent
GENERATION_TEMPLATE_DIR = EXPORTATION_DIR.parent
APP_DIR_GEN_TEST = GENERATION_TEMPLATE_DIR.parent
BACKEND_DIR_GEN_TEST = APP_DIR_GEN_TEST.parent
PROJECT_ROOT_GEN_TEST = BACKEND_DIR_GEN_TEST.parent 

TEMPLATE_DIR_ABS = str(PROJECT_ROOT_GEN_TEST / "Backend/app/generation_template/Exportation/templates")
CSS_TEST_PATH_ABS = str(PROJECT_ROOT_GEN_TEST / "Backend/app/generation_template/Exportation/test_style.css")
OUTPUT_DIR_ABS = str(PROJECT_ROOT_GEN_TEST / "Backend/app/generation_template/File_Zip_Exported")
IMAGE_ZIP_DIR = "img"

print(f"INFO (generate_test.py): PROJECT_ROOT_GEN_TEST = {PROJECT_ROOT_GEN_TEST}")
print(f"INFO (generate_test.py): TEMPLATE_DIR_ABS = {TEMPLATE_DIR_ABS}")
print(f"INFO (generate_test.py): CSS_TEST_PATH_ABS = {CSS_TEST_PATH_ABS}")
print(f"INFO (generate_test.py): OUTPUT_DIR_ABS = {OUTPUT_DIR_ABS}")

def add_file_to_zip(zipf, filepath, archive_path):
    normalized_filepath = os.path.normpath(filepath)
    archive_path_normalized = archive_path.replace("\\", "/").lstrip('/')
    try:
        if os.path.exists(normalized_filepath):
            zipf.write(normalized_filepath, archive_path_normalized)
        else:
            print(f"    -> ERROR (add_file_to_zip): Source file NOT FOUND: {normalized_filepath}")
            raise FileNotFoundError(f"Required file not found during ZIP add: {normalized_filepath}")
    except Exception as e:
        print(f"    -> ERROR (add_file_to_zip) adding '{normalized_filepath}' as '{archive_path_normalized}': {e}")
        raise

def sanitize_filename(filename_str, default_name="image"):
    # ... (code de sanitize_filename - inchangé, il est correct)
    decoded_filename = unquote(filename_str)
    name_without_query = decoded_filename.split('?')[0].split('#')[0]
    base_name = os.path.basename(name_without_query)
    if not base_name.strip() or base_name in [".", ".."]: base_name = default_name
    sanitized = re.sub(r'[^\w.\-_]', '_', base_name)
    sanitized = sanitized.strip('._')
    if not sanitized: sanitized = default_name
    max_len = 60 
    if len(sanitized) > max_len:
        name_part, ext_part = os.path.splitext(sanitized)
        ext_part = ext_part[:10] 
        name_part = name_part[:max_len - len(ext_part) - (1 if ext_part else 0)]
        sanitized = name_part + ext_part
    if sanitized.startswith('.') and len(sanitized) > 1: sanitized = default_name + sanitized
    elif sanitized == ".": sanitized = default_name + "_dot"
    return sanitized if sanitized else f"{default_name}_{uuid.uuid4().hex[:8]}.img"


def get_unique_filename_in_zip(base_filename, existing_filenames_in_zip_set):
    # ... (code de get_unique_filename_in_zip - inchangé, il est correct)
    name, ext = os.path.splitext(base_filename)
    if not name: name = "image"
    final_filename = base_filename
    counter = 1
    while final_filename in existing_filenames_in_zip_set:
        final_filename = f"{name}_{counter}{ext}"
        counter += 1
    existing_filenames_in_zip_set.add(final_filename)
    return final_filename

def process_and_relocate_images(current_config_node, zipf_obj, image_dir_in_zip, 
                                processed_images_map, existing_filenames_in_zip_set, 
                                project_root_path: Path):
    added_this_call, errors_this_call, duplicates_this_call = 0, 0, 0
    if isinstance(current_config_node, dict):
        for key in list(current_config_node.keys()):
            value = current_config_node[key]
            original_src_path, is_image_field = None, False
            if key in ['logo_url', 'src'] and isinstance(value, str) and value.strip():
                original_src_path, is_image_field = value.strip(), True
            elif key == 'image':
                if isinstance(value, str) and value.strip():
                    original_src_path, is_image_field = value.strip(), True
                elif isinstance(value, dict) and 'src' in value and isinstance(value['src'], str) and value['src'].strip():
                    original_src_path, is_image_field = value['src'].strip(), True
            
            if is_image_field and original_src_path:
                print(f"  -> Processing image field: Key='{key}', Original Src='{original_src_path[:100]}'")
                if original_src_path in processed_images_map:
                    new_filename = processed_images_map[original_src_path]
                    if key == 'image' and isinstance(current_config_node[key], dict): current_config_node[key]['src'] = new_filename
                    else: current_config_node[key] = new_filename
                    print(f"    -> Reusing (already processed): '{original_src_path[:70]}' -> '{new_filename}'")
                    duplicates_this_call += 1
                    continue
                
                new_image_filename_in_zip = None # Sera le nom simple du fichier (ex: image.png ou placeholder.txt)
                
                if original_src_path.startswith(('http://', 'https://')):
                    try:
                        print(f"    -> Downloading URL: {original_src_path[:100]}")
                        headers = {'User-Agent': 'PFE-TemplateGenerator/1.0'}
                        response = requests.get(original_src_path, stream=True, timeout=20, headers=headers, allow_redirects=True)
                        response.raise_for_status()
                        content_type = response.headers.get('content-type', '').split(';')[0]
                        guessed_extension = mimetypes.guess_extension(content_type) or '.img'
                        if 'image' not in content_type.lower() and 'html' in content_type.lower():
                            print(f"      -> WARNING: Content-Type '{content_type}' is HTML for URL. Skipping actual image content.")
                            errors_this_call +=1
                            base_err_name = sanitize_filename(os.path.basename(urlparse(original_src_path).path) or uuid.uuid4().hex[:4])
                            new_image_filename_in_zip = f"ERROR_NON_IMAGE_URL_{base_err_name}.txt"
                            # new_image_filename_in_zip est maintenant juste le nom du fichier .txt
                            zipf_obj.writestr(f"{image_dir_in_zip}/{new_image_filename_in_zip}", f"Failed to download image content from: {original_src_path}\nReceived Content-Type: {content_type}")
                        else:
                            url_path_basename = os.path.basename(urlparse(original_src_path).path)
                            base_name_for_file = sanitize_filename(url_path_basename if url_path_basename else "downloaded_image")
                            name_part, ext_part = os.path.splitext(base_name_for_file)
                            if not ext_part or ext_part == '.': base_name_for_file = name_part + guessed_extension
                            elif ext_part.lower() not in ['.jpg','.jpeg','.png','.gif','.webp','.svg'] and guessed_extension != '.img': base_name_for_file = name_part + guessed_extension
                            
                            # new_image_filename_in_zip sera le nom de fichier nettoyé et unique pour le zip
                            new_image_filename_in_zip = get_unique_filename_in_zip(base_name_for_file, existing_filenames_in_zip_set)
                            archive_path_in_zip = f"{image_dir_in_zip}/{new_image_filename_in_zip}" # Chemin complet DANS le zip
                            zipf_obj.writestr(archive_path_in_zip, response.content)
                            added_this_call += 1
                            print(f"      -> Downloaded and added to ZIP as '{archive_path_in_zip}'")
                    except requests.exceptions.RequestException as e:
                        print(f"    -> ERROR downloading '{original_src_path[:70]}': {e}"); errors_this_call += 1
                        base_err_name = sanitize_filename(os.path.basename(urlparse(original_src_path).path) or uuid.uuid4().hex[:4])
                        new_image_filename_in_zip = f"ERROR_DOWNLOAD_{base_err_name}.txt"
                        zipf_obj.writestr(f"{image_dir_in_zip}/{new_image_filename_in_zip}", f"Failed to download: {original_src_path}\nError: {e}")
                    except Exception as e:
                        print(f"    -> UNEXPECTED ERROR processing URL '{original_src_path[:70]}': {e}"); traceback.print_exc(); errors_this_call += 1
                        base_err_name = sanitize_filename(os.path.basename(urlparse(original_src_path).path) or uuid.uuid4().hex[:4])
                        new_image_filename_in_zip = f"ERROR_UNEXPECTED_{base_err_name}.txt"
                        zipf_obj.writestr(f"{image_dir_in_zip}/{new_image_filename_in_zip}", f"Unexpected error processing: {original_src_path}\nError: {e}")

                # --- CHEMINS LOCAUX (relatifs à project_root_path) ---
                elif not original_src_path.startswith(('http://', 'https://')):
                    # original_src_path est par ex. "user_uploads/logo/image.png" (PAS "Backend/user_uploads/...")
                    absolute_local_path = project_root_path / original_src_path # Ex: D:/Page-User/user_uploads/logo/image.png
                    
                    print(f"    [LOCAL PATH DEBUG] original_src_path from JSON: '{original_src_path}'")
                    print(f"    [LOCAL PATH DEBUG] project_root_path: '{project_root_path}'")
                    print(f"    [LOCAL PATH DEBUG] Constructed absolute_local_path: '{absolute_local_path}'")
                    
                    if absolute_local_path.exists() and absolute_local_path.is_file():
                        print(f"    [LOCAL PATH DEBUG] SUCCESS: File exists at '{absolute_local_path}'")
                        
                        # Le nom du fichier dans le ZIP sera basé sur le nom du fichier source
                        base_name_from_disk = sanitize_filename(absolute_local_path.name) 
                        new_image_filename_in_zip = get_unique_filename_in_zip(base_name_from_disk, existing_filenames_in_zip_set)
                        archive_path_in_zip = f"{image_dir_in_zip}/{new_image_filename_in_zip}"
                        
                        print(f"    [LOCAL PATH DEBUG] base_name_from_disk: '{base_name_from_disk}'")
                        print(f"    [LOCAL PATH DEBUG] new_image_filename_in_zip (for config update & as name in zip): '{new_image_filename_in_zip}'")
                        print(f"    [LOCAL PATH DEBUG] archive_path_in_zip (full path inside zip): '{archive_path_in_zip}'")
                        try:
                            zipf_obj.write(str(absolute_local_path), archive_path_in_zip)
                            added_this_call += 1
                            print(f"      -> Copied local file '{absolute_local_path}' to ZIP as '{archive_path_in_zip}'")
                        except Exception as e:
                            print(f"    -> ERROR copying local file '{absolute_local_path}' to zip: {e}"); errors_this_call +=1
                            new_image_filename_in_zip = f"ERROR_COPYING_{sanitize_filename(Path(original_src_path).name)}.txt"
                            zipf_obj.writestr(f"{image_dir_in_zip}/{new_image_filename_in_zip}", f"Error copying: {original_src_path}\nAbs path: {absolute_local_path}\n{e}")
                    else:
                        print(f"    -> WARNING: Local image NOT FOUND at '{absolute_local_path}' (original JSON path: '{original_src_path}')")
                        errors_this_call += 1 
                        new_image_filename_in_zip = f"NOT_FOUND_{sanitize_filename(Path(original_src_path).name)}.txt"
                        zipf_obj.writestr(f"{image_dir_in_zip}/{new_image_filename_in_zip}", f"Not found: {original_src_path}\nAbs path: {absolute_local_path}")
                
                if new_image_filename_in_zip: # Si un nom a été déterminé (fichier image ou .txt d'erreur)
                    processed_images_map[original_src_path] = new_image_filename_in_zip
                    # Mettre à jour la config avec le NOM SIMPLE du fichier (ex: "image.png" ou "ERROR_....txt")
                    if key == 'image' and isinstance(current_config_node[key], dict): 
                        current_config_node[key]['src'] = new_image_filename_in_zip 
                    else: 
                        current_config_node[key] = new_image_filename_in_zip
                    print(f"    -> Updated config: Key='{key}', New Src value in config object = '{new_image_filename_in_zip}'")
            
            elif isinstance(value, (dict, list)):
                added, errors, duplicates = process_and_relocate_images(value, zipf_obj, image_dir_in_zip, processed_images_map, existing_filenames_in_zip_set, project_root_path)
                added_this_call += added; errors_this_call += errors; duplicates_this_call += duplicates
    elif isinstance(current_config_node, list):
        for item in current_config_node:
            if isinstance(item, (dict, list)):
                added, errors, duplicates = process_and_relocate_images(item, zipf_obj, image_dir_in_zip, processed_images_map, existing_filenames_in_zip_set, project_root_path)
                added_this_call += added; errors_this_call += errors; duplicates_this_call += duplicates
    return added_this_call, errors_this_call, duplicates_this_call

def _original_generate_and_save_zip(config_data_to_render, css_path_abs, template_dir_abs, 
                                    base_template_name, components_template_name, 
                                    output_dir_abs, output_filename, config_key_name, 
                                    project_root_for_images: Path):
    print(f"\n--- Calling _original_generate_and_save_zip for Key: {config_key_name} ---")
    if not os.path.isdir(template_dir_abs): raise FileNotFoundError(f"Template directory not found: '{template_dir_abs}'")
    
    output_zip_path = os.path.join(output_dir_abs, output_filename)
    normalized_output_zip = os.path.normpath(output_zip_path)
    print(f"  Target disk path: '{normalized_output_zip}'")

    try:
        env = Environment(loader=FileSystemLoader(template_dir_abs), autoescape=True)
        env.filters['basename'] = os.path.basename
        print(f"  -> Jinja environment configured from: {template_dir_abs}. Filters: {list(env.filters.keys())}")
    except Exception as e: raise RuntimeError(f"Jinja configuration failed: {e}") from e
    try:
        base_template = env.get_template(base_template_name)
        if components_template_name: env.get_template(components_template_name)
        print(f"  -> Templates loaded: '{base_template_name}', '{components_template_name or '(none)'}'")
    except Exception as e: raise RuntimeError(f"Template loading failed from '{template_dir_abs}': {e}") from e

    try:
        os.makedirs(output_dir_abs, exist_ok=True)
        print(f"  Creating ZIP file: '{normalized_output_zip}'")
        config_copy_for_processing = copy.deepcopy(config_data_to_render)
        processed_images_map, existing_filenames_in_zip_set = {}, set()

        with zipfile.ZipFile(normalized_output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            print("  Processing images (downloading/copying and updating config)...")
            img_added, img_errors, img_duplicates = process_and_relocate_images(
                config_copy_for_processing, zipf, IMAGE_ZIP_DIR, 
                processed_images_map, existing_filenames_in_zip_set,
                project_root_for_images 
            )
            print(f"  Image processing summary: Added to ZIP={img_added}, Errors/Skipped={img_errors}, Reused (duplicate src)={img_duplicates}")
            if img_errors > 0: print(f"  WARNING: {img_errors} image(s) could not be processed. Check '{IMAGE_ZIP_DIR}/' in ZIP for .txt error files.")
            
            try:
                final_html = base_template.render(data=config_copy_for_processing)
                print("  -> HTML rendered successfully with updated image paths.")
            except Exception as e:
                print(f"❌ Error during template rendering: {e}"); traceback.print_exc()
                raise RuntimeError("Template rendering failed") from e
            
            zipf.writestr("index.html", final_html)
            print(f"    -> Added: index.html ({len(final_html)} bytes)")

            if os.path.isfile(css_path_abs):
                 add_file_to_zip(zipf, css_path_abs, os.path.basename(css_path_abs))
            else: print(f"    -> WARNING: CSS file not found at '{css_path_abs}', skipping.")
            
        print(f"✅ Template ZIP generated successfully on disk: '{normalized_output_zip}'")
        return normalized_output_zip
    except FileNotFoundError as e: print(f"❌ Error (FileNotFound during ZIP): {e}"); raise
    except Exception as e: print(f"❌ Error during ZIP creation: {e}"); traceback.print_exc(); raise RuntimeError("ZIP creation failed") from e

def run_generation_for_fastapi(full_config_dict: dict) -> str:
    print("\n--- ENTERING run_generation_for_fastapi ---")
    try:
        if not full_config_dict: raise ValueError("Received empty configuration dictionary.")
        config_key_name = list(full_config_dict.keys())[0] 
        config_data_for_site = full_config_dict[config_key_name]
        if not config_data_for_site: raise ValueError(f"No data under key '{config_key_name}'.")
        print(f"-> Wrapper: Using config key: '{config_key_name}'.")
        print(f"-> Wrapper: Using PROJECT_ROOT_GEN_TEST: '{PROJECT_ROOT_GEN_TEST}' for resolving local image paths.")

        timestamp = int(time.time())
        output_zip_filename = f"{config_key_name.lower().replace(' ', '_')}_template_{timestamp}.zip"

        generated_zip_path = _original_generate_and_save_zip(
            config_data_to_render=config_data_for_site,
            css_path_abs=CSS_TEST_PATH_ABS,
            template_dir_abs=TEMPLATE_DIR_ABS,
            base_template_name="test_base.html",
            components_template_name="test_components.html",
            output_dir_abs=OUTPUT_DIR_ABS,
            output_filename=output_zip_filename,
            config_key_name=config_key_name,
            project_root_for_images=PROJECT_ROOT_GEN_TEST
        )
        if generated_zip_path and os.path.exists(generated_zip_path):
            print(f"--- EXITING run_generation_for_fastapi (SUCCESS) ---")
            return generated_zip_path
        else: raise RuntimeError(f"Generation failed or ZIP not found. Path: {generated_zip_path}")
    except Exception as e:
        print(f"--- EXITING run_generation_for_fastapi (EXCEPTION) ---")
        print(f"❌ EXCEPTION in run_generation_for_fastapi: {type(e).__name__}: {e}"); traceback.print_exc()
        raise

if __name__ == "__main__":
    print("Running generate_test.py directly for testing...")
    # Créer un fichier JSON d'exemple dans le même dossier que ce script pour le test direct
    # ou ajuster le chemin.
    example_json_path = EXPORTATION_DIR / "your_sample_config_MODIFIED.json" # Utilise le JSON modifié
    print(f"Attempting to load example JSON from: {example_json_path}")

    try:
        with open(example_json_path, "r", encoding="utf-8") as f:
            sample_json_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ ERROR: Example JSON file NOT FOUND: {example_json_path}")
        print("   Please create it with image paths like 'user_uploads/category/image.png' (relative to project root).")
        exit(1)
    except json.JSONDecodeError as e: print(f"❌ ERROR: Could not decode JSON: {e}"); exit(1)
    if not sample_json_data: print("❌ ERROR: Sample JSON data is empty."); exit(1)
        
    print("Simulating FastAPI call with sample data...")
    try:
        if not os.path.exists(TEMPLATE_DIR_ABS): print(f"ERROR: TEMPLATE_DIR_ABS does not exist: {TEMPLATE_DIR_ABS}"); exit(1)
        if not os.path.exists(CSS_TEST_PATH_ABS): print(f"ERROR: CSS_TEST_PATH_ABS does not exist: {CSS_TEST_PATH_ABS}"); exit(1)
        os.makedirs(OUTPUT_DIR_ABS, exist_ok=True)

        zip_file_path = run_generation_for_fastapi(sample_json_data)
        print(f"\n🎉 Successfully generated ZIP (direct test): {zip_file_path}")
        print(f"   Inspect the contents of this ZIP file, especially the '{IMAGE_ZIP_DIR}/' folder and 'index.html'.")
        print(f"   Look for any .txt files in '{IMAGE_ZIP_DIR}/' which indicate errors with specific images.")
    except Exception as e:
        print(f"\n❌ Test run failed: {e}"); traceback.print_exc()




