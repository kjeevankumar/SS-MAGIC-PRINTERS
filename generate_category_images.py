#!/usr/bin/env python3
"""
Generate category-wise product images for SS Magic Printers website.
Creates a representative image for each product category.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create category_images folder if it doesn't exist
output_dir = "category_images"
os.makedirs(output_dir, exist_ok=True)

# Category definitions with colors and icons (using Unicode symbols)
categories = [
    {
        "name": "Mug Items",
        "filename": "mugs.png",
        "color": "#E8D4B8",  # Warm tan (mug color)
        "accent": "#8B4513",  # Brown
        "icon": "☕",
        "description": "Custom Mugs"
    },
    {
        "name": "Wooden Lamps & Frames",
        "filename": "wooden_lamps_frames.png",
        "color": "#D4A574",  # Light wood
        "accent": "#5D4E37",  # Dark brown
        "icon": "🕯️",
        "description": "Decor & Frames"
    },
    {
        "name": "Pillows",
        "filename": "pillows.png",
        "color": "#F5D5D5",  # Soft pink
        "accent": "#D4A5A5",  # Rose
        "icon": "🛏️",
        "description": "Soft Pillows"
    },
    {
        "name": "Key Chains & Magnets",
        "filename": "keychains_magnets.png",
        "color": "#FFD700",  # Gold
        "accent": "#FFA500",  # Orange
        "icon": "🔑",
        "description": "Portable Gifts"
    },
    {
        "name": "Glass Items",
        "filename": "glass_items.png",
        "color": "#E0F2F7",  # Light cyan
        "accent": "#4DB8E8",  # Sky blue
        "icon": "✨",
        "description": "Glass & Mirror"
    },
    {
        "name": "T-Shirts & Wearables",
        "filename": "tshirts_wearables.png",
        "color": "#E8D4F8",  # Light purple
        "accent": "#9C27B0",  # Deep purple
        "icon": "👕",
        "description": "Apparel"
    },
    {
        "name": "Wall Frames",
        "filename": "wall_frames.png",
        "color": "#D4E8F8",  # Light blue
        "accent": "#1E3A8A",  # Deep blue
        "icon": "🖼️",
        "description": "Wall Frames"
    }
]

def create_category_image(category, size=(400, 300)):
    """Create a visually appealing category image."""
    img = Image.new('RGB', size, color=category['color'])
    draw = ImageDraw.Draw(img)
    
    # Try to load a nice font, fall back to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 32)
        desc_font = ImageFont.truetype("arial.ttf", 18)
        icon_font = ImageFont.truetype("arial.ttf", 80)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
        icon_font = ImageFont.load_default()
    
    # Draw accent bar at top
    draw.rectangle([(0, 0), (size[0], 60)], fill=category['accent'])
    
    # Draw icon in center (large)
    icon_bbox = draw.textbbox((0, 0), category['icon'], font=icon_font)
    icon_width = icon_bbox[2] - icon_bbox[0]
    icon_height = icon_bbox[3] - icon_bbox[1]
    icon_x = (size[0] - icon_width) // 2
    icon_y = (size[1] - icon_height) // 2 - 30
    draw.text((icon_x, icon_y), category['icon'], fill=category['accent'], font=icon_font)
    
    # Draw category title
    title_bbox = draw.textbbox((0, 0), category['name'], font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (size[0] - title_width) // 2
    draw.text((title_x, 15), category['name'], fill='white', font=title_font)
    
    # Draw description at bottom
    desc_bbox = draw.textbbox((0, 0), category['description'], font=desc_font)
    desc_width = desc_bbox[2] - desc_bbox[0]
    desc_x = (size[0] - desc_width) // 2
    draw.text((desc_x, size[1] - 50), category['description'], fill=category['accent'], font=desc_font)
    
    # Add decorative corner elements
    corner_size = 15
    draw.rectangle([(5, 5), (5 + corner_size, 5 + corner_size)], outline=category['accent'], width=3)
    draw.rectangle([(size[0] - 5 - corner_size, size[1] - 5 - corner_size), 
                    (size[0] - 5, size[1] - 5)], outline=category['accent'], width=3)
    
    return img

# Generate images for all categories
print("🎨 Generating category-wise images...")
for category in categories:
    try:
        img = create_category_image(category)
        filepath = os.path.join(output_dir, category['filename'])
        img.save(filepath, 'PNG')
        print(f"✓ Created: {filepath}")
    except Exception as e:
        print(f"✗ Error creating {category['filename']}: {e}")

print(f"\n✅ All {len(categories)} category images generated successfully!")
print(f"📁 Images saved in: {output_dir}/")
print("\nImage filenames for HTML integration:")
for category in categories:
    print(f"  - category_images/{category['filename']}")
