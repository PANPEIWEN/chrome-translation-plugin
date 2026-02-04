from PIL import Image
import os

def crop_and_resize_icon():
    source = 'icon_1024x1024.png'
    if not os.path.exists(source):
        print(f"Error: {source} not found.")
        return

    img = Image.open(source)
    
    # Analyze the image to see if it has transparent borders
    bbox = img.getbbox()
    
    if bbox:
        # Calculate original area vs crop area to see if it's significant
        original_area = img.width * img.height
        crop_width = bbox[2] - bbox[0]
        crop_height = bbox[3] - bbox[1]
        crop_area = crop_width * crop_height
        
        print(f"Original size: {img.size}")
        print(f"Content bbox: {bbox}")
        
        # If we are cropping significantly, it means there was a lot of whitespace
        if crop_area < original_area * 0.9: # arbitrary threshold, if < 90% content
            print("Detected significant whitespace. Cropping...")
            img = img.crop(bbox)
            
            # Optional: Add a very small padding (e.g., 5%) so it doesn't touch the absolute edge
            # But for toolbar icons, full bleed is usually best to maximize visibility.
            # Let's keep it tight or add extremely minimal padding.
            # Create a new square container to center it
            max_dim = max(img.width, img.height)
            new_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
            offset_x = (max_dim - img.width) // 2
            offset_y = (max_dim - img.height) // 2
            new_img.paste(img, (offset_x, offset_y))
            img = new_img
        else:
             print("Icon content is already mostly filling the space.")
    
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        # Resize with high quality
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        filename = f"icon{size}.png"
        resized.save(filename)
        print(f"Regenerated {filename}")

if __name__ == "__main__":
    crop_and_resize_icon()
