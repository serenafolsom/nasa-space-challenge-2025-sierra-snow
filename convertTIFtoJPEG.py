from PIL import Image
import os

folder = 'EarthEngineExports'

for filename in os.listdir(folder):
    if filename.lower().endswith('.tif') or filename.lower().endswith('.tiff'):
        tif_path = os.path.join(folder, filename)
        img = Image.open(tif_path)
        rgb_img = img.convert('RGB')
        new_filename = os.path.splitext(filename)[0] + '.jpg'
        jpg_path = os.path.join(folder, new_filename)
        rgb_img.save(jpg_path, 'JPEG')
        print(f'Converted {filename} to {new_filename}')
