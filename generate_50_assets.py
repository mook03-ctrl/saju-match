import urllib.request
import urllib.parse
import os
import time

def download_image(filename, prompt):
    print(f"Downloading {filename}...")
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=750&nologo=true"
    
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
    time.sleep(1) # Be gentle

tengods = {
    "비겁": "strong facial features, distinctive presence",
    "식상": "highly expressive face, youthful, cute",
    "재성": "balanced symmetrical face, neat, likeable",
    "관성": "beautiful, straight tidy facial lines, trustworthy",
    "인성": "soft eyes, pure, innocent look"
}

sinsals = {
    "도화살": "intense gaze, fatal attractive charm, alluring vibe",
    "홍염살": "glamorous, sexy, stage presence, eye-catching",
    "화개살": "deep soulful eyes, philosophical, mysterious aura",
    "귀문관살": "sharp intuitive look, unconventional, creative aura",
    "백호대살": "overwhelming charisma, powerful stance, strong aura"
}

os.makedirs('assets', exist_ok=True)

for tg_key, tg_desc in tengods.items():
    for ss_key, ss_desc in sinsals.items():
        # Male
        prompt_m = f"High fashion full body portrait of a Korean young man, {tg_desc}, {ss_desc}, highly detailed, photorealistic, studio lighting"
        download_image(f"assets/m_{tg_key}_{ss_key}.png", prompt_m)
        
        # Female
        prompt_f = f"High fashion full body portrait of a Korean young woman, {tg_desc}, {ss_desc}, highly detailed, photorealistic, studio lighting"
        download_image(f"assets/f_{tg_key}_{ss_key}.png", prompt_f)

print("Finished generating 50 combinations!")
