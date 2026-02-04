from PIL import Image, ImageDraw
import math

def create_logo():
    # Dimensions
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background: Blue Gradient Squircle
    # Create mask for squircle
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    # Squircle logic (approximated with rounded rect for simplicity but high radius)
    radius = 120
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)

    # Create Gradient
    gradient = Image.new('RGBA', (size, size), (0,0,0,0))
    # Gradient colors: #1A73E8 (26, 115, 232) to #4285F4 (66, 133, 244) -> Let's go deeper to lighter
    c1 = (26, 115, 232) # Deep Google Blue
    c2 = (66, 200, 255) # Lighter Cyan/Blue
    
    for y in range(size):
        r = int(c1[0] + (c2[0] - c1[0]) * y / size)
        g = int(c1[1] + (c2[1] - c1[1]) * y / size)
        b = int(c1[2] + (c2[2] - c1[2]) * y / size)
        # Horizontal line
        ImageDraw.Draw(gradient).line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Apply mask to gradient
    img.paste(gradient, (0, 0), mask)

    # 2. Symbol: "Aetherial Bridge" (Abstract Exchange)
    # Drawing two interlocking bubble-like shapes or arrows
    
    # Symbol Layer
    symbol_layer = Image.new('RGBA', (size, size), (0,0,0,0))
    sym_draw = ImageDraw.Draw(symbol_layer)
    
    white = (255, 255, 255, 255)
    soft_white = (255, 255, 255, 200)

    # Bubble 1 (Top Left)
    b1_rect = [100, 100, 320, 320] # x0, y0, x1, y1
    # Draw a chat bubble shape
    sym_draw.rounded_rectangle(b1_rect, radius=60, fill=white)
    # Tail 1
    sym_draw.polygon([(160, 320), (200, 320), (160, 360)], fill=white)

    # Bubble 2 (Bottom Right) - slightly offset and smaller/different to show translation
    b2_rect = [192, 192, 412, 412]
    # We want a "cutout" effect where they overlap? Or just overlay?
    # Let's draw the second one.
    
    # To simulate the "A" and "文" abstractly:
    # Let's draw lines inside Bubble 1
    # Abstract "A"
    line_w = 20
    # sym_draw.line([(210, 150), (160, 270)], fill=(26, 115, 232, 255), width=line_w)
    # sym_draw.line([(210, 150), (260, 270)], fill=(26, 115, 232, 255), width=line_w)
    # sym_draw.line([(180, 220), (240, 220)], fill=(26, 115, 232, 255), width=line_w)
    
    # Actually, simpler is better.
    # Let's just do the "G" Translate icon style but simplified. 
    # Two arrows?
    # Let's do a bold, abstract "Switch" icon.
    
    # Clear previous symbol plan.
    symbol_layer = Image.new('RGBA', (size, size), (0,0,0,0))
    sym_draw = ImageDraw.Draw(symbol_layer)

    # Arrow Left-Right / A-文 Concept
    # Let's draw a stylized 'A'
    font_size = 280
    # Since we can't guarantee fonts, we draw it manually or use a standard sans if loading works.
    # We'll draw a geometric "A" and a geometric "Han" character.
    
    # "A"
    # Apex at (180, 120), Left foot (110, 300), Right foot (250, 300)
    # Color: White
    # We use a path
    a_path = [
        (180, 120), # Top
        (110, 300), # Bottom Left
        (140, 300), # Thickness adjustment
        (180, 180), # Inner Top
        (220, 300), # Inner Right leg start
        (250, 300)  # Bottom Right
    ]
    # Simple Triangle A
    sym_draw.polygon([(180, 120), (110, 300), (250, 300)], fill=white)
    # Cutout center
    sym_draw.polygon([(180, 170), (150, 260), (210, 260)], fill=(26, 115, 232, 0), outline=None) # This doesn't work on layer.
    
    # Better: Draw lines.
    sym_draw.line([(180, 130), (110, 310)], fill=white, width=35)
    sym_draw.line([(180, 130), (250, 310)], fill=white, width=35)
    sym_draw.line([(135, 240), (225, 240)], fill=white, width=35)
    
    # "文" (Wen) - Abstract
    # Top dot: (360, 180)
    # Horizontal: (300, 220) to (420, 220)
    # Left sweep: (360, 220) to (300, 350)
    # Right sweep: (360, 220) to (420, 350)
    
    offset_x = 40
    offset_y = 40
    
    sym_draw.line([(360+offset_x, 150+offset_y), (360+offset_x, 180+offset_y)], fill=soft_white, width=30) # Dot
    sym_draw.line([(310+offset_x, 190+offset_y), (410+offset_x, 190+offset_y)], fill=soft_white, width=30) # Horiz
    sym_draw.line([(360+offset_x, 190+offset_y), (300+offset_x, 340+offset_y)], fill=soft_white, width=30) # Left leg
    sym_draw.line([(360+offset_x, 190+offset_y), (420+offset_x, 340+offset_y)], fill=soft_white, width=30) # Right leg

    # Compose
    img = Image.alpha_composite(img, symbol_layer)
    
    # Resize to standard sizes? 128 is good.
    img = img.resize((128, 128), Image.Resampling.LANCZOS)
    img.save('icon.png')
    print("Icon generated successfully.")

create_logo()
