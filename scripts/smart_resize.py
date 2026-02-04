from PIL import Image, ImageChops
import os

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def smart_crop_and_resize():
    source = 'icon_1024x1024.png'
    if not os.path.exists(source):
        print("Source not found.")
        return

    img = Image.open(source)
    
    # 1. Try generic bbox (alpha channel transparency)
    bbox = img.getbbox()
    if bbox and bbox != (0, 0, img.width, img.height):
        print(f"Trimming transparent borders: {bbox}")
        img = img.crop(bbox)
    else:
        # 2. If fully opaque (or full size), check if it has a solid background color to trim
        # Check top-left pixel
        corner_pixel = img.getpixel((0, 0))
        # Simple heuristic: trim based on corner color
        print(f"Attempting to trim based on corner color: {corner_pixel}")
        try:
            cropped = trim(img)
            if cropped.size != img.size:
                print(f"Trimmed background. New size: {cropped.size}")
                img = cropped
            else:
                print("No solid background border detected to trim.")
        except Exception as e:
            print(f"Could not trim background: {e}")

    # 3. Resize to standard sizes
    # To maximize size in toolbar, we want the content to touch the edges (16x16, 32x32)
    sizes = [16, 32, 48, 128]
    for size in sizes:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(f"icon{size}.png")
        print(f"Saved icon{size}.png")

if __name__ == "__main__":
    smart_crop_and_resize()
