# Write a python script that will convert the image into the format Resize the images in the following formats
# #     "default_icon": {
#       "16": "icons/icon16.png",
#       "48": "icons/icon48.png",
#       "128": "icons/icon128.png"
#     }\

import os
import sys
from PIL import Image
from pathlib import Path

def convert_image(input_path, output_path, size):
    try:
        with Image.open(input_path) as img:
            img = img.resize(size)
            img.save(output_path, format='PNG')
            print(f"Converted {input_path} to {output_path}")
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

def main():
    image_path = "icons/icon.png"
    sizes = {
        "16": (16, 16),
        "48": (48, 48),
        "128": (128, 128)
    }
    output_dir = "icons"
    os.makedirs(output_dir, exist_ok=True)
    for size_key, size in sizes.items():
        output_path = os.path.join(output_dir, f"icon{size_key}.png")
        convert_image(image_path, output_path, size)
if __name__ == "__main__":
    main()
    print("Image conversion completed successfully.")