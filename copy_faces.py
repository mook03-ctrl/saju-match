import os
import shutil

genders = [("m", "남성"), ("f", "여성")]
tengods = ["비겁", "식상", "재성", "관성", "인성"]

for g_prefix, g_label in genders:
    for tg in tengods:
        src = f"assets/{g_prefix}_face_{tg}.jpg"
        dest_dir = f"assets/appearance_types/{g_label}/{tg}"
        dest = f"{dest_dir}/face.jpg"
        
        if os.path.exists(src):
            os.makedirs(dest_dir, exist_ok=True)
            shutil.copy2(src, dest)
            print(f"Copied {src} to {dest}")
        else:
            print(f"Warning: {src} not found!")
