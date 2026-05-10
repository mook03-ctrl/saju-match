import os
import shutil

base_dir = "assets/appearance_types"
genders = [("m", "남성"), ("f", "여성")]
tengods = ["비겁", "식상", "재성", "관성", "인성"]

for g_prefix, g_label in genders:
    for tg in tengods:
        src = f"assets/{g_prefix}_face_{tg}.jpg"
        if not os.path.exists(src):
            print(f"Missing source: {src}")
            continue
            
        # Find all folders that match this tengod
        for root, dirs, files in os.walk(os.path.join(base_dir, g_label)):
            for d in dirs:
                if f"_{tg}_" in d:
                    dest = os.path.join(root, d, "face.jpg")
                    shutil.copy2(src, dest)
                    print(f"Copied {src} to {dest}")

print("Populated all 50 folders with fallback images.")
