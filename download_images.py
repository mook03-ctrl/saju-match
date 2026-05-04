import urllib.request
import urllib.parse
import os
import time

def download_image(filename, prompt):
    print(f"Downloading {filename}...")
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=400&height=400&nologo=true"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Successfully downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
    time.sleep(1) # Be gentle to the server

archetypes = [
    ("type1", "innocent, pure, soft casual pastel clothing, clear bright environment, youthful first-love vibe"),
    ("type2", "sexy, glamorous, alluring outfit, dark mood, dramatic stage lighting, idol vibe"),
    ("type3", "stable, likable, perfectly tailored neat suit, trustworthy and confident pose, clean studio background"),
    ("type4", "urban chic, minimalist avant-garde black fashion, sharp angular pose, cold model vibe, white studio"),
    ("type5", "cute, emotional, oversized cozy sweater, friendly playful pose, soft warm lighting"),
    ("type6", "charismatic, strong, sharp leather jacket, powerful wide stance, intimidating presence, dramatic shadows"),
    ("type7", "exotic, unique, unconventional artistic outfit, asymmetrical design, mysterious model pose, editorial photography")
]

os.makedirs('assets', exist_ok=True)

for type_id, desc in archetypes:
    # Male Styles
    prompt_m_style = f"High fashion full body portrait of a Korean young man, {desc}, highly detailed, photorealistic"
    download_image(f"assets/m_{type_id}_style.png", prompt_m_style)
    
    # Female Faces
    prompt_f_face = f"High fashion close-up face portrait of a Korean young woman, {desc}, highly detailed, photorealistic"
    download_image(f"assets/f_{type_id}_face.png", prompt_f_face)
    
    # Female Styles
    prompt_f_style = f"High fashion full body portrait of a Korean young woman, {desc}, highly detailed, photorealistic"
    download_image(f"assets/f_{type_id}_style.png", prompt_f_style)

print("Done downloading all remaining images!")
