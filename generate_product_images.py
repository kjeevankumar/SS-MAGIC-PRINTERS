import os
from PIL import Image, ImageDraw, ImageFont
import random

def create_realistic_product_image(product_name, category, filename, image_number):
    """Generate realistic product mockups with printed photos"""
    
    width, height = 400, 400
    image = Image.new('RGB', (width, height), '#FFFFFF')
    draw = ImageDraw.Draw(image)
    
    # Create category-specific product mockups
    
    if category == 'mugs':
        # Mug mockup with photo
        mug_color = ['#E8D4B8', '#D4AF37', '#C9A961'][image_number % 3]
        
        # Draw mug body
        draw.ellipse([(80, 80), (320, 280)], fill=mug_color, outline='#8B7355', width=3)
        
        # Draw photo area on mug
        photo_x1, photo_y1 = 120, 120
        photo_x2, photo_y2 = 280, 240
        
        # Gradient-like printed photo area
        for i in range(photo_y2 - photo_y1):
            shade = int(200 - (i * 30) / (photo_y2 - photo_y1))
            draw.line([(photo_x1, photo_y1 + i), (photo_x2, photo_y1 + i)], 
                     fill=(shade, shade + 20, shade + 40), width=1)
        
        # Add text
        draw.text((width//2 - 40, 30), product_name, fill='#1F1F1F')
        draw.text((width//2 - 60, 320), "Custom Printed", fill='#666666')
        
    elif category == 'pillows':
        # Heart-shaped or square pillow with photo
        pillow_color = ['#FF69B4', '#FFB6D9', '#FFC0CB'][image_number % 3]
        
        # Draw heart shape pillow
        draw.ellipse([(80, 120), (180, 220)], fill=pillow_color, outline='#FF1493', width=3)
        draw.ellipse([(220, 120), (320, 220)], fill=pillow_color, outline='#FF1493', width=3)
        draw.polygon([(150, 220), (250, 220), (200, 320)], fill=pillow_color, outline='#FF1493')
        
        # Photo area on pillow
        draw.rectangle([(120, 140), (280, 280)], fill='#E6D7C4', outline='#C19A6B', width=2)
        
        # Sample photo pattern (checkered effect)
        for x in range(120, 280, 20):
            for y in range(140, 280, 20):
                if (x + y) % 40 == 0:
                    draw.rectangle([(x, y), (x+20, y+20)], fill='#B0C4DE')
        
        draw.text((width//2 - 50, 30), product_name, fill='#FF1493')
        draw.text((width//2 - 70, 320), "Photo Pillow", fill='#666666')
        
    elif category == 'tshirts_wearables':
        # T-shirt with printed design
        shirt_colors = ['#000000', '#1F1F1F', '#FF0000', '#0066CC'][image_number % 4]
        
        # Draw t-shirt
        draw.polygon([(60, 100), (340, 100), (320, 220), (80, 220)], fill=shirt_colors, outline='#333333', width=2)
        draw.polygon([(100, 100), (300, 100), (290, 200)], fill=shirt_colors, outline='#333333', width=2)
        
        # Sleeves
        draw.ellipse([(40, 110), (70, 170)], fill=shirt_colors, outline='#333333', width=2)
        draw.ellipse([(330, 110), (360, 170)], fill=shirt_colors, outline='#333333', width=2)
        
        # Printed design area
        design_x1, design_y1 = 140, 130
        design_x2, design_y2 = 260, 200
        
        for i in range(design_x2 - design_x1):
            shade = int(100 + (i * 100) / (design_x2 - design_x1))
            draw.line([(design_x1 + i, design_y1), (design_x1 + i, design_y2)],
                     fill=(shade, shade, shade), width=1)
        
        draw.text((width//2 - 60, 240), product_name, fill='#1F1F1F')
        draw.text((width//2 - 70, 320), "Custom Print", fill='#666666')
        
    elif category == 'wall_frames':
        # Photo frame
        frame_color = ['#8B4513', '#D4A574', '#C19A6B'][image_number % 3]
        
        # Frame border
        draw.rectangle([(50, 50), (350, 350)], fill=frame_color, outline='#654321', width=3)
        
        # Glass/Photo area inside frame
        draw.rectangle([(70, 70), (330, 330)], fill='#F5F5F5', outline='#999999', width=2)
        
        # Sample photo (gradient)
        for i in range(330 - 70):
            shade = int(200 - (i * 100) / (330 - 70))
            draw.line([(70, 70 + i), (330, 70 + i)], fill=(shade, shade + 20, shade + 40), width=1)
        
        draw.text((width//2 - 40, 25), product_name, fill='#1F1F1F')
        draw.text((width//2 - 60, 360), "Photo Frame", fill='#666666')
        
    elif category == 'keychains_magnets':
        # Keychain/Magnet with photo
        keychain_color = ['#C0C0C0', '#FFD700', '#A0522D'][image_number % 3]
        
        # Shape (rounded square)
        draw.rounded_rectangle([(100, 100), (300, 300)], radius=30, fill=keychain_color, outline='#666666', width=2)
        
        # Photo area
        draw.rectangle([(130, 130), (270, 270)], fill='#E6D7C4', outline='#999999', width=1)
        
        # Photo pattern
        for x in range(130, 270, 15):
            for y in range(130, 270, 15):
                if (x + y) % 30 == 0:
                    draw.rectangle([(x, y), (x+15, y+15)], fill='#C0C0C0')
        
        draw.text((width//2 - 60, 30), product_name, fill='#1F1F1F')
        draw.text((width//2 - 70, 320), "Mini Prints", fill='#666666')
        
    elif category == 'glass_items':
        # Glass trophy/mug with etched photo
        glass_color = '#E6F3FF'
        
        # Glass shape (tall cylinder)
        draw.ellipse([(120, 80), (280, 120)], fill='#87CEEB', outline='#4682B4', width=2)
        draw.rectangle([(120, 120), (280, 300)], fill=glass_color, outline='#4682B4', width=2)
        draw.ellipse([(120, 300), (280, 340)], fill='#B0C4DE', outline='#4682B4', width=2)
        
        # Etched photo area
        draw.rectangle([(140, 140), (260, 280)], fill='#D0D0D0', outline='#808080', width=1)
        
        # Photo pattern (vertical lines for etched effect)
        for x in range(140, 260, 8):
            draw.line([(x, 140), (x, 280)], fill='#A9A9A9', width=1)
        
        draw.text((width//2 - 60, 30), product_name, fill='#1F1F1F')
        draw.text((width//2 - 70, 360), "Glass Etching", fill='#666666')
        
    elif category == 'wooden_lamps_frames':
        # Wooden item with photo/design
        wood_color = '#8B4513'
        
        # Wooden frame/item
        draw.rectangle([(60, 80), (340, 320)], fill=wood_color, outline='#654321', width=3)
        
        # Wood grain effect
        for i in range(60, 340, 3):
            shade = random.randint(100, 140)
            draw.line([(i, 80), (i, 320)], fill=(shade, int(shade*0.8), int(shade*0.6)), width=1)
        
        # Photo/display area
        draw.rectangle([(90, 110), (310, 290)], fill='#F5E6D3', outline='#999999', width=2)
        
        # Sample display
        for i in range(90, 310, 15):
            for j in range(110, 290, 15):
                if (i + j) % 30 == 0:
                    draw.rectangle([(i, j), (i+15, j+15)], fill='#D4AF37')
        
        draw.text((width//2 - 60, 30), product_name, fill='#1F1F1F')
        draw.text((width//2 - 70, 340), "Wood Printed", fill='#666666')
    
    # Add branding at bottom
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
    
    draw.text((10, 375), "© SS Magic Printers - Kurnool", fill='#CCCCCC', font=font)
    
    # Save image
    image.save(filename)

def main():
    print("🖼️ Generating realistic product mockups with photo printing...\n")
    
    products_by_category = {
        'mugs': ['Plain Mug', 'Printed Mug', 'Photo Mug'],
        'pillows': ['Heart Pillow', 'Square Pillow', 'Rectangular Pillow'],
        'tshirts_wearables': ['Men T-Shirt', 'Women T-Shirt', 'Kids T-Shirt', 'Polo Shirt'],
        'wall_frames': ['6x8 Frame', '8x10 Frame', '12x16 Frame', 'Canvas Frame'],
        'keychains_magnets': ['Metal Keychain', 'Square Magnet', 'Round Magnet'],
        'glass_items': ['Glass Mug', 'Glass Trophy', 'Glass Award'],
        'wooden_lamps_frames': ['Wooden Frame', 'Table Lamp', 'Wooden Decor'],
    }
    
    for category, products in products_by_category.items():
        # Create category folder
        category_folder = f'product_images/{category}'
        os.makedirs(category_folder, exist_ok=True)
        
        print(f"📁 {category}/")
        for idx, product in enumerate(products):
            filename = f'{category_folder}/{idx + 1}_{product.replace(" ", "_").lower()}.png'
            create_realistic_product_image(product, category, filename, idx)
            print(f"   ✓ {product}")
        print()
    
    print("✅ All realistic product mockups generated successfully!")
    print("📁 Images in: product_images/{category}/*.png")

if __name__ == "__main__":
    main()
