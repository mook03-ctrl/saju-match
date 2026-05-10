import urllib.request
import urllib.parse
import os
import time
import random

def download_pollinations(filename, prompt):
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1280&nologo=true&seed={random.randint(1, 100000)}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=40) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        time.sleep(3) # Be nice to the API
        return f"Downloaded: {filename}"
    except Exception as e:
        time.sleep(10)
        return f"Failed: {filename} - {e}"

elements = {
    "목": "slender and well-proportioned body, slightly long natural face shape",
    "화": "fit and healthy body with nice shoulders, natural V-line face shape, bright eyes",
    "토": "balanced and sturdy body, round and soft friendly face shape",
    "금": "slim body, clear and neat facial features",
    "수": "soft and slightly curvy body, round face with big dewy eyes"
}

tengods = {
    "비겁": "confident but very friendly look with soft natural facial lines",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression",
    "관성": "straight tidy facial lines, trustworthy and classic look",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

vibes = {
    "charm": "subtle attractive charm, slightly alluring but friendly aura",
    "noble": "luxurious noble aura, high-class elegant vibe, clean impression"
}

backgrounds = [
    "a bright cozy stylish cafe during daylight",
    "a beautiful sunny outdoor park with green trees",
    "a modern clean bookstore interior",
    "a vibrant and clean city street during daytime",
    "a peaceful outdoor botanical garden",
    "a bright and airy modern studio space",
    "a trendy outdoor terrace cafe"
]

genders = [("male", "남성", "young Korean man in his late 20s to early 30s"), 
           ("female", "여성", "young Korean woman in her late 20s to early 30s")]

base_dir = "assets/appearance_types"

tasks = []

# To avoid regenerating if the script stops and resumes, we check file size.
# The placeholder images we copied earlier are around 50KB to 800KB, 
# but pollinations images might be different. 
# Wait, let's just forcefully regenerate them all, it takes ~8 mins.
# I will use a simple counter to track progress.

for gender_eng, gender_kr, gender_desc in genders:
    for e_key, e_desc in elements.items():
        for t_key, t_desc in tengods.items():
            for v_key, v_desc in vibes.items():
                folder_name = f"{e_key}_{t_key}_{v_key}"
                folder_path = os.path.join(base_dir, gender_kr, folder_name)
                os.makedirs(folder_path, exist_ok=True)
                dest = os.path.join(folder_path, "face.jpg")
                
                bg = random.choice(backgrounds)
                
                base_prompt = f"A highly realistic, photorealistic portrait of a {gender_desc}. She/He has a {e_desc}. She/He exhibits a {t_desc} and a {v_desc}. She/He is wearing stylish but comfortable daily spring clothing (casual wear). The setting is {bg}. Shot type: Medium full shot, thigh-up portrait, slightly zoomed in. IMPORTANT: Do NOT use cold high-fashion model expressions. NO harsh cheekbones, NO angry or stern looks. The vibe must be pure, natural, friendly, and highly approachable. 2k resolution, photorealistic, cinematic lighting, highly detailed."
                
                if gender_eng == "male":
                    # Enforce no accessories for men
                    base_prompt += " ABSOLUTELY NO earrings, NO necklaces, NO accessories on the man."
                
                tasks.append((dest, base_prompt))

print(f"Total tasks: {len(tasks)}")

success = 0
completed_folders = []

for i, (fname, prompt) in enumerate(tasks):
    if success >= 10:
        break
        
    print(f"[{i+1}/{len(tasks)}] Generating {fname}...", flush=True)
    res = download_pollinations(fname, prompt)
    print(res, flush=True)
    
    if "Downloaded" in res:
        success += 1
        completed_folders.append(os.path.dirname(fname))
        time.sleep(10) # 10초 대기

print(f"\nFinished generating {success} out of 10 requested images!", flush=True)
print("Completed Folders:")
for folder in completed_folders:
    print(folder)
