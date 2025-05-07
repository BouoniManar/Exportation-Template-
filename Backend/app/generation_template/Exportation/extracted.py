import json
import os
import zipfile
from pathlib import Path
import requests
from PIL import Image, ImageDraw, ImageFont
import random
from datetime import datetime
import re # Import regular expressions for safe filenames

# === CONFIGURATION ===
json_path = "./extracted_template.json" # Make sure this file exists in the same directory
output_dir = "exported_templates"
os.makedirs(output_dir, exist_ok=True)
DEFAULT_IMAGE_WIDTH = 800
DEFAULT_IMAGE_HEIGHT = 600
COMPONENT_SPACING = "20px" # Default margin-bottom for components

# Services d'images de remplacement thématiques
PLACEHOLDER_SERVICES = {
    'default': 'https://picsum.photos/{w}/{h}',
    'product': 'https://picsum.photos/{w}/{h}?random&category=objects',
    'person': 'https://picsum.photos/{w}/{h}?random&category=people', # thispersondoesnotexist can be unreliable
    'nature': 'https://picsum.photos/{w}/{h}?random&category=nature',
    'tech': 'https://picsum.photos/{w}/{h}?random&category=technology',
    'logo': 'https://picsum.photos/{w}/{h}?random&category=abstract',
    'icon': 'https://picsum.photos/50/50?random&category=icons',
    'hero': 'https://picsum.photos/{w}/{h}?random&category=landscape',
    'gallery': 'https://picsum.photos/{w}/{h}?random&category=art',
    'banner': 'https://picsum.photos/{w}/{h}?random&category=business',
}

# === HELPER FUNCTIONS ===

def sanitize_filename(name):
    """Removes invalid characters for filenames."""
    # Remove invalid characters
    s = re.sub(r'[\\/*?:"<>|]', "", name)
    # Replace spaces with underscores
    s = s.replace(" ", "_")
    # Trim leading/trailing underscores/periods
    s = s.strip('_.')
    # Limit length (optional)
    return s[:100] # Limit to 100 chars

def generate_colorful_placeholder(width, height, text="Placeholder"):
    """Crée une image colorée de remplacement"""
    bg_color = (random.randint(200, 255), random.randint(200, 255), random.randint(200, 255))
    img = Image.new('RGB', (width, height), color=bg_color)
    d = ImageDraw.Draw(img)

    try:
        # Try loading a common font, adjust path if needed
        font_path = "arial.ttf" if os.path.exists("arial.ttf") else None # Or specify full path
        if font_path:
             # Calculate font size dynamically, ensure it's at least 10
            font_size = max(10, min(width // 10, height // 5, 30))
            font = ImageFont.truetype(font_path, font_size)
        else:
             font = ImageFont.load_default()
    except IOError:
        print("⚠️ Arial font not found, using default.")
        font = ImageFont.load_default()

    # Simple contrast: Use dark text on light background
    text_color = (50, 50, 50)
    # Calculate text bounding box using textbbox
    try:
         # Use textbbox for better positioning in newer Pillow versions
        text_bbox = d.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        # Center text
        text_x = (width - text_width) // 2
        text_y = (height - text_height) // 2
        d.text((text_x, text_y), text, fill=text_color, font=font)
    except AttributeError:
         # Fallback for older Pillow versions
         text_width, text_height = d.textsize(text, font=font)
         text_x = (width - text_width) // 2
         text_y = (height - text_height) // 2
         d.text((text_x, text_y), text, fill=text_color, font=font)


    return img

def get_dimensions_from_style(style, default_width=DEFAULT_IMAGE_WIDTH, default_height=DEFAULT_IMAGE_HEIGHT):
    """Extracts width and height from style dict, handling units."""
    width = default_width
    height = default_height
    try:
        w_str = str(style.get('width', '')).lower().replace('px', '').replace('%', '')
        if w_str and w_str != 'auto':
             width = int(float(w_str)) # Use float for potential decimals then int
    except ValueError:
        pass # Keep default if conversion fails

    try:
        h_str = str(style.get('height', '')).lower().replace('px', '').replace('%', '')
        if h_str and h_str != 'auto':
            height = int(float(h_str))
    except ValueError:
        pass # Keep default

    # Ensure minimum dimensions for placeholder generation
    return max(width, 50), max(height, 50)


def handle_image_component(src, save_path, component_type="default", style={}):
    """Handles downloading or creating placeholder images."""
    width, height = get_dimensions_from_style(style)
    generated_placeholder = False

    # 1. Try downloading if it's a full URL
    if isinstance(src, str) and src.startswith(("http:", "https:")):
        try:
            response = requests.get(src, stream=True, timeout=15) # Increased timeout
            response.raise_for_status() # Check for HTTP errors (4xx, 5xx)
            # Check content type - very basic check
            content_type = response.headers.get('Content-Type', '').lower()
            if 'image' not in content_type:
                 print(f"⚠️ URL {src} did not return an image content type ({content_type}). Generating placeholder.")
                 generated_placeholder = True
            else:
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(8192): # Increased chunk size
                        f.write(chunk)
                print(f"🖼️ Downloaded image: {src} -> {save_path.name}")
                return True # Success
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Network/HTTP Error downloading {src}: {e}. Generating placeholder.")
            generated_placeholder = True
        except Exception as e:
            print(f"⚠️ Other error downloading {src}: {e}. Generating placeholder.")
            generated_placeholder = True

    # 2. If not a URL or download failed, generate placeholder
    if not isinstance(src, str) or not src.startswith(("http:", "https:")) or generated_placeholder:
        print(f"🖼️ Generating placeholder for '{src if isinstance(src, str) else component_type}' -> {save_path.name}")
        try:
            # Try themed placeholder service first
            theme = component_type if component_type in PLACEHOLDER_SERVICES else 'default'
            placeholder_url = PLACEHOLDER_SERVICES[theme].format(w=width, h=height)
            try:
                response = requests.get(placeholder_url, stream=True, timeout=10)
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(8192):
                        f.write(chunk)
                print(f"  -> Used Picsum placeholder ({theme})")
                return True
            except requests.exceptions.RequestException as e:
                print(f"  -> Picsum request failed: {e}. Falling back to colorful.")
                img = generate_colorful_placeholder(width, height, f"{component_type} ({width}x{height})")
                img.save(save_path)
                return True

        except Exception as e:
            print(f"  -> Error during placeholder generation: {e}. Creating basic.")
            # Fallback to basic colorful placeholder if service fails
            img = generate_colorful_placeholder(width, height, f"{component_type} ({width}x{height})")
            img.save(save_path)
            return True

    return False # Should not happen if logic is correct


def create_zip_from_directory(source_dir, output_zip):
    """Crée un fichier ZIP à partir d'un répertoire"""
    try:
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(source_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, start=source_dir)
                    zipf.write(file_path, arcname)
        return True
    except Exception as e:
        print(f"❌ Error creating ZIP {output_zip}: {e}")
        return False

def style_to_css(style_dict):
    """Converts a style dictionary to a CSS string."""
    if not isinstance(style_dict, dict):
        return ""

    css_rules = []
    dimensional_props = ['width', 'height', 'font-size', 'padding', 'margin', 'border-radius',
                         'top', 'left', 'right', 'bottom', 'margin-top', 'margin-bottom',
                         'margin-left', 'margin-right', 'padding-top', 'padding-bottom',
                         'padding-left', 'padding-right', 'gap']

    for prop, value in style_dict.items():
        prop_str = str(prop).strip()
        value_str = str(value).strip()

        # Basic validation: skip empty props or values
        if not prop_str or not value_str:
            continue

        # Auto-append 'px' to numeric values for dimensional properties
        is_dimensional = prop_str.lower() in dimensional_props
        is_numeric = False
        try:
            # Check if it can be converted to a number
            float(value_str)
            is_numeric = True
        except ValueError:
            is_numeric = False

        if is_dimensional and is_numeric and not any(unit in value_str for unit in ['%', 'em', 'rem', 'vw', 'vh', 'auto']):
            value_str += 'px'

        css_rules.append(f"{prop_str}: {value_str};")

    return " ".join(css_rules)

def create_global_css(template_data):
    """Generates the base CSS rules."""
    primary_color = template_data.get("primary_color", "#3f062a")
    font_family = template_data.get('typography', {}).get('font', 'Arial, sans-serif')
    text_size = template_data.get('typography', {}).get('text_size', '16px') # Slightly larger default

    css = [
        "/* Global Styles */",
        ":root {",
        f"  --primary-color: {primary_color};",
        f"  --global-font-family: '{font_family}', sans-serif;", # Add fallback
        f"  --global-text-size: {text_size};",
        f"  --component-spacing: {COMPONENT_SPACING};",
        "}",
        "body {",
        "  font-family: var(--global-font-family);",
        "  font-size: var(--global-text-size);",
        f"  color: #333; /* Default text color */",
        "  margin: 0;",
        "  padding: 0;",
        "  background-color: #f4f4f4;",
        "  line-height: 1.6;",
        "}",
        ".container {",
        "  max-width: 1200px;",
        "  margin: 20px auto;", # Add top/bottom margin
        "  padding: 0 20px;", # Add side padding
        "  box-sizing: border-box;",
        "}",
        ".page-content {", # Renamed from .page for clarity
        "  background: #fff;",
        "  padding: 30px;", # More padding
        "  border-radius: 8px;",
        "  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);",
        "  margin-top: var(--component-spacing);", # Space below header
        "}",
        "/* Component Base Spacing */",
        ".component {",
        "   margin-bottom: var(--component-spacing);", # Ensures spacing
        "   word-wrap: break-word;", # Prevent long text overflow
        "}",
        ".component:last-child {", # No margin for the last element in a container
        "   margin-bottom: 0;",
        "}",

        "/* Component Specific Defaults */",
        "h1, h2, h3, h4, h5, h6 { margin-top: 0; margin-bottom: 0.8em; color: var(--primary-color); }", # Added margin-bottom
        "p { margin-top: 0; margin-bottom: 1em; }", # Added margin-bottom
        "a { color: var(--primary-color); text-decoration: none; }",
        "a:hover { text-decoration: underline; }",
        "img { max-width: 100%; height: auto; display: block; border-radius: 4px; }", # Added radius

        "/* Header & Footer Defaults */",
         ".header { /* Default if no style provided */",
        f"  padding: 15px 0;",
        f"  background-color: {primary_color};",
        f"  color: #fff;",
        "}",
        ".header .container, .footer .container {", # Apply container logic within header/footer
        "   display: flex;",
        "   justify-content: space-between;",
        "   align-items: center;",
        "   padding: 0 20px;", # Override container padding if needed
        "}",
        ".header .logo img { max-height: 50px; width: auto; }", # Logo size limit
        ".header .logo h1 { margin: 0; font-size: 1.8em; color: #fff; }",
        ".header nav ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 25px; }",
        ".header nav a { color: #fff; font-weight: bold; }",
        ".footer { /* Default if no style provided */",
        "  padding: 30px 0;",
        "  background-color: #333;",
        "  color: #ccc;",
        "  text-align: center;",
        "  margin-top: 40px;", # More space above footer
        "}",
         ".footer p { margin-bottom: 10px; }",
        ".footer .footer-links a { color: #eee; margin: 0 10px; }",

        "/* Form Defaults */",
        "form { display: flex; flex-direction: column; gap: 15px; }",
        ".form-group { display: flex; flex-direction: column; }",
        ".form-group label { margin-bottom: 5px; font-weight: bold; }",
        "input[type='text'], input[type='email'], input[type='password'], input[type='number'], input[type='tel'], textarea {",
        "  padding: 12px;",
        "  border: 1px solid #ccc;",
        "  border-radius: 4px;",
        "  font-size: 1em;",
        "}",
        "textarea { min-height: 100px; resize: vertical; }",
        "button, input[type='submit'], .button-link {", # Style buttons and links acting as buttons
        "  padding: 12px 25px;",
        "  border: none;",
        "  border-radius: 4px;",
        "  cursor: pointer;",
        f"  background-color: var(--primary-color);",
        f"  color: #fff;",
        "  font-size: 1em;",
        "  font-weight: bold;",
        "  text-align: center;",
        "  transition: background-color 0.3s ease;",
        "}",
        "button:hover, input[type='submit']:hover, .button-link:hover {",
        f"  background-color: #555; /* Darker shade on hover */",
        "}",
        ".button-link { display: inline-block; }", # For <a> styled as button

        "/* Review Defaults */",
        ".review .rating { color: #f39c12; font-size: 1.2em; margin-bottom: 10px; }",
        ".review h3 { margin-bottom: 5px; }",

        "/* Product Defaults */",
        ".product .price, .featured_products .price, .product_grid .price {",
        "  font-weight: bold;",
        "  font-size: 1.2em;",
        "  color: #27ae60; /* Green price */",
        "  margin: 10px 0;",
        "}",
        ".product_grid {",
        "  display: grid;",
        "  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
        "  gap: 20px;",
        "}",
        ".product_grid .product-item {", # Style for items within grid
        "  border: 1px solid #eee;",
        "  padding: 15px;",
        "  text-align: center;",
        "  border-radius: 5px;",
        "}",
         ".product_grid .product-item img { margin-bottom: 10px; }",

        "/* Social Login/Links Defaults */",
        ".social-login, .social-links { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }",
        ".social-login button, .social-links a { /* Style both */",
        "  display: inline-flex;", # Align icon and text
        "  align-items: center;",
        "  padding: 8px 15px;",
        "  border: 1px solid #ccc;",
        "  border-radius: 4px;",
        "  background-color: #f9f9f9;",
        "  color: #555;",
        "  font-size: 0.9em;",
        "}",
        ".social-login img, .social-links img { height: 20px; width: auto; margin-right: 8px; }",

        "/* Gallery & Carousel Defaults */",
        ".gallery {", # Default gallery styling
        "  display: grid;",
        "  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));",
        "  gap: 10px;",
        "}",
        ".carousel {", # Basic carousel styling
        "  display: flex;",
        "  overflow-x: auto;",
        "  gap: 15px;",
        "  padding-bottom: 10px;", # Space for scrollbar if needed
        "}",
        ".carousel img {",
        "  max-width: 80%;", # Prevent images being too large in carousel
        "  flex-shrink: 0;", # Prevent shrinking
        "}",

         "/* Pricing Table Defaults */",
        ".pricing_table { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }",
        ".pricing-plan { border: 1px solid #eee; padding: 25px; border-radius: 5px; text-align: center; flex: 1; min-width: 250px; }",
        ".pricing-plan h3 { margin-bottom: 15px; }",
        ".pricing-plan .price { font-size: 1.8em; font-weight: bold; margin-bottom: 20px; color: var(--primary-color); }",
        ".pricing-plan ul { list-style: none; padding: 0; margin-bottom: 25px; }",
        ".pricing-plan li { margin-bottom: 10px; }",

        "/* Chart Placeholder */",
        ".chart-placeholder { border: 1px dashed #ccc; padding: 20px; text-align: center; color: #888; }",

        "/* File Upload Placeholder */",
        ".file-upload-placeholder { border: 2px dashed var(--primary-color); padding: 30px; text-align: center; border-radius: 5px; background-color: #fdfdfd; }",
        ".file-upload-placeholder p { margin-bottom: 15px; color: #555; }",

         "/* Shopping Cart Placeholder */",
        ".shopping-cart-placeholder { border: 1px solid #eee; padding: 20px; }",
        ".shopping-cart-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }",
        ".shopping-cart-item:last-child { border-bottom: none; }",
        ".shopping-cart-total { text-align: right; font-weight: bold; font-size: 1.2em; margin-top: 20px; }",

    ]
    return "\n".join(css)


# === MAIN PROCESSING LOGIC ===

def process_component(component, comp_idx, page_idx, images_dir, safe_template_name):
    """Processes a single component and returns its HTML."""
    comp_type = component.get("type", "unknown")
    style = component.get("style", {})
    html_parts = []
    class_name = f"component {comp_type} component-{page_idx}-{comp_idx}" # Unique class per component instance

    # Apply default spacing via CSS class '.component', but allow override
    component_style_str = style_to_css(style)

    # --- Handle each component type ---
    if comp_type == "review":
        author = component.get("author", "Anonymous")
        rating = component.get("rating", 0)
        comment = component.get("comment", "").replace("\n", "<br>")
        html_parts.append(f'<div class="{class_name} review" style="{component_style_str}">')
        html_parts.append(f'<h3>Review by: {author}</h3>')
        html_parts.append(f'<div class="rating">{"★" * rating}{"☆" * (5 - rating)}</div>')
        html_parts.append(f'<p>{comment}</p>')
        html_parts.append('</div>')

    elif comp_type == "image":
        src = component.get("src", "")
        alt_text = component.get("alt_text", f"{safe_template_name} image {comp_idx}")
        img_filename = sanitize_filename(f"img_{page_idx}_{comp_idx}_{Path(src).stem if isinstance(src, str) and src else 'placeholder'}.jpg")
        img_path = images_dir / img_filename
        handle_image_component(src, img_path, "image", style)
        html_parts.append(f'<img class="{class_name}" src="images/{img_filename}" alt="{alt_text}" style="{component_style_str}">')

    elif comp_type in ["contact_form", "form"]:
        fields = component.get("fields", [])
        button_label = "Sign Up" if comp_type == "form" and "signup" in component.get('action', '') else "Submit" # Guess button label
        button_label = component.get("button_label", button_label) # Allow override
        action = component.get("action", "#")
        html_parts.append(f'<form class="{class_name}" action="{action}" method="post" style="{component_style_str}">')
        for field in fields:
            label = field.replace("_", " ").title()
            field_type = "email" if "email" in field else \
                         "password" if "password" in field else \
                         "tel" if "phone" in field else \
                         "number" if "number" in field or "quantity" in field else \
                         "text"
            input_tag = f'<input type="{field_type}" id="form_{page_idx}_{comp_idx}_{field}" name="{field}" required>'
            if field == "message" or field == "comment":
                input_tag = f'<textarea id="form_{page_idx}_{comp_idx}_{field}" name="{field}" required></textarea>'

            html_parts.append('<div class="form-group">')
            html_parts.append(f'  <label for="form_{page_idx}_{comp_idx}_{field}">{label}:</label>')
            html_parts.append(f'  {input_tag}')
            html_parts.append('</div>')

        button_style_str = style_to_css(component.get("button_style", {}))
        html_parts.append(f'<button type="submit" style="{button_style_str}">{button_label}</button>')
        html_parts.append('</form>')

    elif comp_type == "button":
        label = component.get("label", "Click Me")
        link = component.get("link", "#")
        # Apply style to the link acting as a button container if display block/inline-block
        display_type = style.get("display", "inline")
        if display_type in ["block", "inline-block", "flex", "grid"]:
             html_parts.append(f'<a href="{link}" class="{class_name} button-link" style="{component_style_str}">')
             html_parts.append(f'  {label}')
             html_parts.append(f'</a>')
        else: # Otherwise style the button inside a simple div wrapper
             html_parts.append(f'<div class="{class_name}" style="display: {display_type};">') # Basic wrapper
             html_parts.append(f'  <a href="{link}"><button style="{component_style_str}">{label}</button></a>')
             html_parts.append(f'</div>')


    elif comp_type == "post":
        title = component.get("title", "Post Title")
        content = component.get("content", "").replace("\n", "<br>")
        author = component.get("author", "Anonymous")
        html_parts.append(f'<article class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<h2>{title}</h2>')
        if author != "Anonymous":
            html_parts.append(f'<p><small>By {author}</small></p>')
        html_parts.append(f'<div>{content}</div>')
        html_parts.append('</article>')

    elif comp_type == "product":
        title = component.get("title", "Product Name")
        description = component.get("description", "").replace("\n", "<br>")
        price = component.get("price", "$0.00")
        image_src = component.get("image", "")
        img_filename = sanitize_filename(f"product_{page_idx}_{comp_idx}_{Path(image_src).stem if isinstance(image_src, str) and image_src else 'placeholder'}.jpg")
        img_path = images_dir / img_filename

        html_parts.append(f'<div class="{class_name} product" style="{component_style_str}">')
        html_parts.append(f'<h3>{title}</h3>')
        if image_src:
            handle_image_component(image_src, img_path, "product", style) # Use component style for dims
            html_parts.append(f'<img src="images/{img_filename}" alt="{title}">')
        html_parts.append(f'<p>{description}</p>')
        html_parts.append(f'<p class="price">{price}</p>')
        # Could add an "Add to Cart" button here if needed
        html_parts.append('</div>')

    elif comp_type == "gallery":
        images = component.get("images", [])
        html_parts.append(f'<div class="{class_name} gallery" style="{component_style_str}">')
        for i, img_src in enumerate(images):
            img_filename = sanitize_filename(f"gallery_{page_idx}_{comp_idx}_{i}_{Path(img_src).stem if isinstance(img_src, str) and img_src else 'placeholder'}.jpg")
            img_path = images_dir / img_filename
            # Use specific item style if available, else gallery style for dimensions
            item_style = component.get("item_style", style)
            handle_image_component(img_src, img_path, "gallery", item_style)
            html_parts.append(f'<img src="images/{img_filename}" alt="Gallery image {i+1}">')
        html_parts.append('</div>')

    elif comp_type == "carousel":
        images = component.get("images", [])
        html_parts.append(f'<div class="{class_name} carousel" style="{component_style_str}">')
        for i, img_src in enumerate(images):
            img_filename = sanitize_filename(f"carousel_{page_idx}_{comp_idx}_{i}_{Path(img_src).stem if isinstance(img_src, str) and img_src else 'placeholder'}.jpg")
            img_path = images_dir / img_filename
            item_style = component.get("item_style", style)
            handle_image_component(img_src, img_path, "carousel", item_style)
            html_parts.append(f'<img src="images/{img_filename}" alt="Carousel image {i+1}">')
        html_parts.append('</div>')

    elif comp_type == "chart":
        chart_type = component.get("type_of_chart", "bar")
        data = component.get("data", [])
        # Generating actual charts requires JS libraries (Chart.js, D3, etc.)
        # For static export, we just show a placeholder.
        html_parts.append(f'<div class="{class_name} chart-placeholder" style="{component_style_str}">')
        html_parts.append(f'<h4>Chart Placeholder</h4>')
        html_parts.append(f'<p>Type: {chart_type}</p>')
        html_parts.append(f'<p>Data: {", ".join(map(str, data))}</p>')
        html_parts.append(f'<p>(Chart rendering requires JavaScript)</p>')
        html_parts.append('</div>')

    elif comp_type == "testimonial":
        author = component.get("author", "Satisfied Customer")
        content = component.get("content", "").replace("\n", "<br>")
        html_parts.append(f'<blockquote class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<p>"{content}"</p>')
        html_parts.append(f'<footer>- {author}</footer>')
        html_parts.append('</blockquote>')

    elif comp_type == "pricing_table":
        plans = component.get("plans", [])
        html_parts.append(f'<div class="{class_name} pricing_table" style="{component_style_str}">')
        for plan in plans:
            name = plan.get("name", "Standard")
            price = plan.get("price", "$?")
            features = plan.get("features", [])
            plan_style_str = style_to_css(plan.get("style", {})) # Allow style per plan
            html_parts.append(f'<div class="pricing-plan" style="{plan_style_str}">')
            html_parts.append(f'<h3>{name}</h3>')
            html_parts.append(f'<p class="price">{price}</p>')
            html_parts.append('<ul>')
            for feature in features:
                html_parts.append(f'<li>{feature}</li>')
            html_parts.append('</ul>')
            html_parts.append('<button>Choose Plan</button>')
            html_parts.append('</div>')
        html_parts.append('</div>')

    elif comp_type == "service":
        title = component.get("title", "Our Service")
        description = component.get("description", "").replace("\n", "<br>")
        # Could add an icon here based on title/type
        html_parts.append(f'<div class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<h3>{title}</h3>')
        html_parts.append(f'<p>{description}</p>')
        html_parts.append('</div>')

    elif comp_type == "video":
        src = component.get("src", "")
        # Basic video embedding - might need refinement for specific hosts (YouTube, Vimeo)
        html_parts.append(f'<div class="{class_name}" style="{component_style_str}">')
        if "youtube.com" in src or "youtu.be" in src:
            # Extract video ID (simple extraction)
            video_id = None
            if "v=" in src:
                video_id = src.split("v=")[1].split('&')[0]
            elif "youtu.be/" in src:
                video_id = src.split("youtu.be/")[1].split('?')[0]
            if video_id:
                embed_url = f"https://www.youtube.com/embed/{video_id}"
                html_parts.append(f'<iframe width="560" height="315" src="{embed_url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
            else:
                html_parts.append('<p>Could not embed YouTube video. Invalid URL?</p>')
        elif src:
            # Assume direct video link
             html_parts.append(f'<video controls width="100%">') # Added controls and width
             html_parts.append(f'  <source src="{src}" type="video/mp4">') # Assume mp4, might need type detection
             html_parts.append(f'  Your browser does not support the video tag.')
             html_parts.append(f'</video>')
        else:
            html_parts.append('<p>Video source missing.</p>')
        html_parts.append('</div>')

    elif comp_type == "logo":
        src = component.get("image", "")
        alt_text = component.get("alt_text", f"{safe_template_name} Logo")
        img_filename = sanitize_filename(f"logo_{page_idx}_{comp_idx}_{Path(src).stem if isinstance(src, str) and src else 'placeholder'}.png") # Prefer PNG for logos
        img_path = images_dir / img_filename
        handle_image_component(src, img_path, "logo", style)
        # Often logos are wrapped in links to the homepage
        html_parts.append(f'<a href="index.html" class="{class_name}" style="display:inline-block; {component_style_str}">') # Wrapper link
        html_parts.append(f' <img src="images/{img_filename}" alt="{alt_text}" style="display:block;">') # Inner image style might be needed from logo_style
        html_parts.append(f'</a>')

    elif comp_type == "social-login":
        options = component.get("options", [])
        button_style = component.get("button_style", {})
        button_style_str = style_to_css(button_style)
        icons = component.get("icons", {})

        html_parts.append(f'<div class="{class_name} social-login" style="{component_style_str}">')
        for option in options:
            icon_src = icons.get(option, "")
            html_parts.append(f'<button class="social-btn {option.lower()}" style="{button_style_str}">')
            if icon_src:
                icon_filename = sanitize_filename(f"icon_{option.lower()}_{page_idx}_{comp_idx}.png")
                icon_path = images_dir / icon_filename
                # Use small fixed size for icons
                handle_image_component(icon_src, icon_path, "icon", {'width': 20, 'height': 20})
                html_parts.append(f'<img src="images/{icon_filename}" alt="{option} icon">')
            html_parts.append(f'{option}')
            html_parts.append('</button>')
        html_parts.append('</div>')

    elif comp_type == "hero":
        title = component.get("title", "Welcome")
        subtitle = component.get("subtitle", "")
        button_label = component.get("button_label")
        button_action = component.get("button_action", "#")
        image_src = component.get("image", "")
        alt_text = component.get("alt_text", "Hero image")
        img_filename = sanitize_filename(f"hero_{page_idx}_{comp_idx}_{Path(image_src).stem if isinstance(image_src, str) and image_src else 'placeholder'}.jpg")
        img_path = images_dir / img_filename

        # Hero often uses background image style
        hero_style = style.copy()
        if image_src:
             handle_image_component(image_src, img_path, "hero", style)
             hero_style['background-image'] = f'url(images/{img_filename})'
             hero_style['background-size'] = 'cover'
             hero_style['background-position'] = 'center center'
             hero_style['padding'] = hero_style.get('padding', '100px 20px') # Default padding if background image
             hero_style['color'] = hero_style.get('color', '#ffffff') # Default text color for dark bg
             hero_style['text-align'] = hero_style.get('text-align', 'center')

        hero_style_str = style_to_css(hero_style)
        html_parts.append(f'<div class="{class_name} hero" style="{hero_style_str}">')
        html_parts.append(f'<h1>{title}</h1>')
        if subtitle:
            html_parts.append(f'<p>{subtitle}</p>')
        if button_label:
            button_style_str = style_to_css(component.get("button_style", {}))
            html_parts.append(f'<a href="{button_action}" class="button-link" style="{button_style_str}">{button_label}</a>')
        html_parts.append('</div>')


    elif comp_type == "featured_products":
        products = component.get("products", [])
        product_style = component.get("product_style", {}) # Style for individual product divs
        product_style_str = style_to_css(product_style)
        html_parts.append(f'<div class="{class_name} featured_products" style="{component_style_str}">') # Main container style
        for i, product in enumerate(products):
            name = product.get("name", "Product")
            price = product.get("price", "$?")
            description = product.get("description", "")
            link = product.get("link", "#")
            image_src = product.get("image", "")
            img_filename = sanitize_filename(f"featured_{page_idx}_{comp_idx}_{i}_{Path(image_src).stem if isinstance(image_src, str) and image_src else 'placeholder'}.jpg")
            img_path = images_dir / img_filename

            html_parts.append(f'<div class="product" style="{product_style_str}">') # Individual product style
            if image_src:
                handle_image_component(image_src, img_path, "product", product_style) # Use product style for dims
                html_parts.append(f'<img src="images/{img_filename}" alt="{name}">')
            html_parts.append(f'<h3>{name}</h3>')
            html_parts.append(f'<p class="price">{price}</p>')
            if description:
                 html_parts.append(f'<p>{description}</p>')
            html_parts.append(f'<a href="{link}" class="button-link">View Details</a>') # Simple button
            html_parts.append('</div>')
        html_parts.append('</div>')

    elif comp_type == "newsletter_signup":
        title = component.get("title", "Stay Updated")
        description = component.get("description", "Sign up for our newsletter!")
        input_style_str = style_to_css(component.get("input_style", {}))
        button_style_str = style_to_css(component.get("button_style", {}))
        html_parts.append(f'<div class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<h3>{title}</h3>')
        html_parts.append(f'<p>{description}</p>')
        html_parts.append('<form action="#" method="post" style="display:flex; gap: 10px; align-items: center;">') # Inline form
        html_parts.append(' <input type="email" name="email" placeholder="Enter your email" required style="flex-grow: 1; {input_style_str}">')
        html_parts.append(' <button type="submit" style="{button_style_str}">Subscribe</button>')
        html_parts.append('</form>')
        html_parts.append('</div>')

    elif comp_type == "text":
         content = component.get("content", "").replace("\n", "<br>")
         html_parts.append(f'<div class="{class_name}" style="{component_style_str}">{content}</div>')

    elif comp_type == "link":
         label = component.get("label", "Learn More")
         url = component.get("url", "#")
         html_parts.append(f'<a href="{url}" class="{class_name}" style="{component_style_str}">{label}</a>')

    elif comp_type == "product_grid":
        products = component.get("products", [])
        product_item_style = component.get("product_style", {}) # Style for individual items
        product_item_style_str = style_to_css(product_item_style)

        html_parts.append(f'<div class="{class_name} product_grid" style="{component_style_str}">') # Grid container style
        for i, product in enumerate(products):
            name = product.get("name", "Product")
            price = product.get("price", "$?")
            description = product.get("description", "")
            category = product.get("category", "")
            image_src = product.get("image", "")
            img_filename = sanitize_filename(f"grid_{page_idx}_{comp_idx}_{i}_{Path(image_src).stem if isinstance(image_src, str) and image_src else 'placeholder'}.jpg")
            img_path = images_dir / img_filename

            # Combine default item style with specific style from product data if exists
            specific_style = product.get("style", {})
            combined_style = {**product_item_style, **specific_style} # specific overrides default
            combined_style_str = style_to_css(combined_style)

            html_parts.append(f'<div class="product-item" style="{combined_style_str}">')
            if image_src:
                handle_image_component(image_src, img_path, "product", combined_style)
                html_parts.append(f'<img src="images/{img_filename}" alt="{name}">')
            if category:
                 html_parts.append(f'<p><small>Category: {category}</small></p>')
            html_parts.append(f'<h3>{name}</h3>')
            html_parts.append(f'<p class="price">{price}</p>')
            if description:
                html_parts.append(f'<p>{description}</p>')
            html_parts.append('<button>View</button>') # Simple button
            html_parts.append('</div>')
        html_parts.append('</div>')

    elif comp_type == "pagination":
         current_page = component.get("current_page", 1)
         total_pages = component.get("total_pages", 1)
         button_style_str = style_to_css(component.get("button_style", {}))

         html_parts.append(f'<nav class="{class_name} pagination" aria-label="Page navigation" style="{component_style_str}">')
         html_parts.append('<ul style="list-style: none; padding: 0; display: flex; gap: 5px; justify-content: center;">')

         # Previous Button
         if current_page > 1:
             html_parts.append(f'<li><a href="#" style="{button_style_str}">« Prev</a></li>')
         else:
             html_parts.append(f'<li style="opacity: 0.5;"><span style="{button_style_str}">« Prev</span></li>') # Disabled look

         # Page Numbers (simplified)
         for i in range(1, total_pages + 1):
             is_current = 'font-weight: bold; background-color: #eee;' if i == current_page else ''
             html_parts.append(f'<li><a href="#" style="{button_style_str} {is_current}">{i}</a></li>')

         # Next Button
         if current_page < total_pages:
             html_parts.append(f'<li><a href="#" style="{button_style_str}">Next »</a></li>')
         else:
              html_parts.append(f'<li style="opacity: 0.5;"><span style="{button_style_str}">Next »</span></li>') # Disabled look

         html_parts.append('</ul>')
         html_parts.append('</nav>')

    elif comp_type == "social-links":
         links = component.get("links", [])
         icon_style_str = style_to_css(component.get("icon_style", {'width': 30, 'height': 30})) # Use provided or default

         html_parts.append(f'<div class="{class_name} social-links" style="{component_style_str}">')
         for link_info in links:
             platform = link_info.get("platform", "Website")
             url = link_info.get("url", "#")
             # Simple: just use text links for now. Adding icons requires mapping platform names to icon files.
             # Could extend handle_image_component or have a dedicated icon finder if needed.
             html_parts.append(f'<a href="{url}" title="{platform}" target="_blank" rel="noopener noreferrer" style="/* Maybe add specific link style here */">')
             # Placeholder for icon image if available later
             # img_filename = sanitize_filename(f"social_{platform.lower()}_{page_idx}_{comp_idx}.svg")
             # html_parts.append(f'<img src="images/{img_filename}" alt="{platform}" style="{icon_style_str}">')
             html_parts.append(f'{platform}') # Display platform name as link text
             html_parts.append(f'</a>')
         html_parts.append('</div>')

    elif comp_type == "file_upload":
        label = component.get("label", "Upload File")
        accepted_types = component.get("accepted_types", ["image/*"]) # Default to images
        max_size = component.get("max_size", "5MB")
        button_style_str = style_to_css(component.get("button_style", {}))

        html_parts.append(f'<div class="{class_name} file-upload-placeholder" style="{component_style_str}">')
        html_parts.append(f'<p>{label} (Max: {max_size})</p>')
        html_parts.append(f'<input type="file" id="file_{page_idx}_{comp_idx}" name="file_upload" accept="{",".join(accepted_types)}">')
        # The button here is usually styled differently or part of the input styling
        html_parts.append(f'<label for="file_{page_idx}_{comp_idx}" style="{button_style_str} cursor:pointer;">Choose File</label>')
        html_parts.append(f'<p><small>Accepted types: {", ".join(accepted_types)}</small></p>')
        html_parts.append('</div>')

    elif comp_type == "shopping_cart":
         # This needs dynamic data. We'll create a static placeholder structure.
         item_style_str = style_to_css(component.get("item_style", {}))
         total_style_str = style_to_css(component.get("total_style", {}))

         html_parts.append(f'<div class="{class_name} shopping-cart-placeholder" style="{component_style_str}">')
         html_parts.append('<h4>Shopping Cart</h4>')
         # Example Items
         for i in range(1, 3): # Add 2 example items
             html_parts.append(f'<div class="shopping-cart-item" style="{item_style_str}">')
             html_parts.append(f' <span>Product Name {i}</span>')
             html_parts.append(f' <span>$ {(i * 10 + 5):.2f}</span>')
             html_parts.append(f'</div>')
         # Total
         html_parts.append(f'<div class="shopping-cart-total" style="{total_style_str}">')
         html_parts.append('  <span>Total:</span> $XX.XX')
         html_parts.append('</div>')
         html_parts.append('<p>(Cart content is dynamic)</p>')
         html_parts.append('</div>')

    # --- Header and Footer are special cases handled in process_page ---
    elif comp_type == "header" or comp_type == "footer":
        pass # Processed separately

    # --- Less common / Simple types ---
    elif comp_type == "greeting":
         message = component.get("message", "Welcome!")
         html_parts.append(f'<h1 class="{class_name}" style="{component_style_str}">{message}</h1>')

    elif comp_type == "discount_banner":
        text = component.get("text", "Special Offer!")
        image_src = component.get("image", "")
        alt_text = component.get("alt_text", "Discount Banner")
        img_filename = sanitize_filename(f"banner_{page_idx}_{comp_idx}_{Path(image_src).stem if isinstance(image_src, str) and image_src else 'placeholder'}.jpg")
        img_path = images_dir / img_filename

        banner_style = style.copy()
        if image_src:
             handle_image_component(image_src, img_path, "banner", style)
             banner_style['background-image'] = f'url(images/{img_filename})'
             banner_style['background-size'] = 'cover'
             banner_style['padding'] = banner_style.get('padding', '50px 20px')
             banner_style['color'] = banner_style.get('color', '#ffffff')
             banner_style['text-align'] = banner_style.get('text-align', 'center')
        banner_style_str = style_to_css(banner_style)

        html_parts.append(f'<div class="{class_name}" style="{banner_style_str}">')
        html_parts.append(f'<p style="font-size: 1.5em; font-weight: bold; margin: 0;">{text}</p>') # Style text inside
        html_parts.append('</div>')

    elif comp_type == "tutorial_video":
        video_url = component.get("video_url", "")
        description = component.get("description", "Watch this tutorial:")
         # Reuse video logic
        html_parts.append(f'<div class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<p>{description}</p>')
        if "youtube.com" in video_url or "youtu.be" in video_url:
            video_id = None
            if "v=" in video_url: video_id = video_url.split("v=")[1].split('&')[0]
            elif "youtu.be/" in video_url: video_id = video_url.split("youtu.be/")[1].split('?')[0]
            if video_id:
                 embed_url = f"https://www.youtube.com/embed/{video_id}"
                 html_parts.append(f'<iframe width="560" height="315" src="{embed_url}" ...></iframe>')
            else: html_parts.append('<p>Invalid YouTube URL</p>')
        elif video_url:
             html_parts.append(f'<video controls width="100%"><source src="{video_url}" type="video/mp4">...</video>')
        else: html_parts.append('<p>Video URL missing.</p>')
        html_parts.append('</div>')

    else:
        # Fallback for unknown component types
        html_parts.append(f'<div class="{class_name}" style="{component_style_str}">')
        html_parts.append(f'<!-- Unknown component type: {comp_type} -->')
        html_parts.append(f'<pre>{json.dumps(component, indent=2)}</pre>')
        html_parts.append('</div>')

    return "\n".join(html_parts)


def process_page(page_data, page_identifier, output_dir, safe_template_name, layout_parts, global_css, template_name):
    """Processes a single page definition and generates its files."""
    try:
        page_name = page_data.get("page_name", f"Page_{page_identifier}")
        safe_page_name = sanitize_filename(page_name)
        print(f"\nProcessing Page: '{page_name}' (ID: {page_identifier})")

        # Create directories for the page
        page_dir = Path(output_dir) / f"{safe_template_name}_{safe_page_name}_{page_identifier}"
        images_dir = page_dir / "images"
        os.makedirs(images_dir, exist_ok=True)

        html_content = []
        page_components = page_data.get("components", [])

        # --- Find Header/Footer Components for this page ---
        header_comp = next((comp for comp in page_components if comp.get("type") == "header"), None)
        footer_comp = next((comp for comp in page_components if comp.get("type") == "footer"), None)

        # --- Start HTML Document ---
        html_content.extend([
            '<!DOCTYPE html>',
            '<html lang="en">', # Changed lang to 'en', adjust if needed
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            f' <title>{template_name} - {page_name}</title>',
            '  <link rel="stylesheet" href="style.css">',
            '</head>',
            '<body>'
        ])

        # --- Add Header ---
        if "header" in layout_parts:
            if header_comp:
                 header_style = header_comp.get("style", {})
                 logo_src = header_comp.get("logo", "")
                 logo_style = header_comp.get("logo_style", {})
                 nav_links = header_comp.get("nav_links", [])
                 nav_style = header_comp.get("nav_style", {})
                 link_style = header_comp.get("link_style", {})
                 header_style_str = style_to_css(header_style)
                 nav_style_str = style_to_css(nav_style)
                 link_style_str = style_to_css(link_style)
                 logo_style_str = style_to_css(logo_style)

                 html_content.append(f'<header class="header" style="{header_style_str}">')
                 html_content.append('<div class="container">') # Wrap header content in container
                 html_content.append('<div class="logo">')
                 if logo_src:
                     img_filename = sanitize_filename(f"logo_{page_identifier}.png")
                     img_path = images_dir / img_filename
                     handle_image_component(logo_src, img_path, "logo", logo_style)
                     html_content.append(f'<a href="index.html"><img src="images/{img_filename}" alt="{template_name} Logo" style="{logo_style_str}"></a>')
                 else:
                     html_content.append(f'<h1><a href="index.html" style="color:inherit; text-decoration:none;">{template_name}</a></h1>')
                 html_content.append('</div>') # End logo

                 if nav_links:
                     html_content.append(f'<nav style="{nav_style_str}"><ul>')
                     for link_text in nav_links:
                         # Simple link creation, assumes '#' for now
                         html_content.append(f'<li><a href="#" style="{link_style_str}">{link_text}</a></li>')
                     html_content.append('</ul></nav>') # End nav
                 html_content.append('</div>') # End container
                 html_content.append('</header>')
            else:
                 # Add a very basic default header if layout requires it but no component found
                 html_content.append('<header class="header"><div class="container">')
                 html_content.append(f'<h1><a href="index.html" style="color:inherit; text-decoration:none;">{template_name}</a></h1>')
                 html_content.append('</div></header>')


        # --- Add Main Content Area ---
        html_content.append('<main class="container">') # Main content wrapped in container
        html_content.append('<div class="page-content">') # Inner div for background/padding

        # Page Title (optional, can be redundant if hero exists)
        # html_content.append(f'<h1>{page_name}</h1>')

        # Sections (often just descriptive text)
        for section_text in page_data.get("sections", []):
             # Treat sections as simple paragraphs or headings
             html_content.append(f'<p class="component section-description">{section_text}</p>')

        # Process regular components
        for comp_idx, component in enumerate(page_components):
            # Skip header/footer as they are handled separately
            if component.get("type") not in ["header", "footer"]:
                 component_html = process_component(component, comp_idx, page_identifier, images_dir, safe_template_name)
                 html_content.append(component_html)

        html_content.append('</div>') # End page-content
        html_content.append('</main>') # End main container

        # --- Add Footer ---
        if "footer" in layout_parts:
            if footer_comp:
                 footer_style = footer_comp.get("style", {})
                 footer_text = footer_comp.get("text", f"© {datetime.now().year} {template_name}. All rights reserved.")
                 footer_links = footer_comp.get("links", [])
                 link_style = footer_comp.get("link_style", {})
                 footer_style_str = style_to_css(footer_style)
                 link_style_str = style_to_css(link_style)

                 html_content.append(f'<footer class="footer" style="{footer_style_str}">')
                 html_content.append('<div class="container">') # Wrap footer content in container
                 html_content.append(f'<p>{footer_text}</p>')
                 if footer_links:
                      html_content.append('<div class="footer-links">')
                      for link_text in footer_links:
                           html_content.append(f'<a href="#" style="{link_style_str}">{link_text}</a>')
                      html_content.append('</div>') # End footer-links
                 html_content.append('</div>') # End container
                 html_content.append('</footer>')
            else:
                 # Add a very basic default footer
                 html_content.append('<footer class="footer"><div class="container">')
                 html_content.append(f'<p>© {datetime.now().year} {template_name}. All rights reserved.</p>')
                 html_content.append('</div></footer>')


        # --- End HTML Document ---
        html_content.append('</body></html>')

        # --- Save Files ---
        html_file_path = page_dir / "index.html"
        css_file_path = page_dir / "style.css"
        zip_file_path = Path(output_dir) / f"{safe_template_name}_{safe_page_name}_{page_identifier}.zip"

        with open(html_file_path, "w", encoding="utf-8") as f:
            f.write("\n".join(html_content))

        with open(css_file_path, "w", encoding="utf-8") as f:
            f.write(global_css)

        # --- Create ZIP ---
        if create_zip_from_directory(page_dir, zip_file_path):
            print(f"✅ Page '{page_name}' exported successfully. ZIP: {zip_file_path.name}")
        else:
            print(f"⚠️ Failed to create ZIP for page '{page_name}'.")

    except Exception as e:
        print(f"❌❌❌ CRITICAL ERROR processing page ID {page_identifier} ('{page_name}'): {e}")
        import traceback
        traceback.print_exc() # Print detailed traceback for critical errors


# === SCRIPT EXECUTION ===

if __name__ == "__main__":
    try:
        print("Starting template export process...")
        # Load the template JSON
        if not os.path.exists(json_path):
             print(f"❌ Error: JSON file not found at '{json_path}'")
             exit()

        with open(json_path, "r", encoding="utf-8") as f:
            template_data = json.load(f)

        template_name = template_data.get("template_name", "Untitled_Template")
        safe_template_name = sanitize_filename(template_name)
        layout = template_data.get("layout", "header, main, footer")
        layout_parts = [part.strip() for part in layout.split(",")]
        pages_list = template_data.get("pages", [])

        # Generate global CSS
        global_css_rules = create_global_css(template_data)

        if not pages_list:
            print("⚠️ No pages found in the template JSON.")
            exit()

        # Process each item in the 'pages' list
        page_counter = 0
        for item in pages_list:
            if isinstance(item, dict) and "page_name" in item:
                # This is a standard page definition
                process_page(item, page_counter, output_dir, safe_template_name, layout_parts, global_css_rules, template_name)
                page_counter += 1
            elif isinstance(item, dict) and "type" in item:
                # This looks like a component outside a page structure (e.g., file_upload)
                # Create a minimal page for it
                print(f"⚠️ Found component '{item.get('type')}' outside a page structure. Creating minimal page.")
                minimal_page_data = {
                    "page_name": f"Component_{item.get('type', 'Unknown')}_{page_counter}",
                    "sections": [f"Standalone Component: {item.get('type', 'Unknown')}"],
                    "components": [item]
                }
                process_page(minimal_page_data, page_counter, output_dir, safe_template_name, ["main"], global_css_rules, template_name) # Use minimal layout
                page_counter += 1
            elif isinstance(item, list):
                 print(f"⚠️ Found a list item at index {page_counter} within the 'pages' array. Skipping this item as its structure is unexpected.")
                 # Optionally, you could loop through the inner list if it contains page/component dicts
                 page_counter += 1 # Increment counter even if skipped
            else:
                print(f"⚠️ Skipping unrecognized item at index {page_counter} in 'pages' array: {type(item)}")
                page_counter += 1


        print("\nTemplate export process finished.")

    except FileNotFoundError:
        print(f"❌ Error: The template file '{json_path}' was not found.")
    except json.JSONDecodeError:
        print(f"❌ Error: The template file '{json_path}' contains invalid JSON.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()