from PIL import Image
import os

def resize_icon():
    source = 'icon_1024x1024.png'
    if not os.path.exists(source):
        print(f"Error: {source} not found.")
        return

    img = Image.open(source)
    
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        filename = f"icon{size}.png"
        resized.save(filename)
        print(f"Generated {filename}")

if __name__ == "__main__":
    resize_icon()
