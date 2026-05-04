import urllib.request
import urllib.parse
import os
import time

def download_image(filename, prompt, retries=5):
    if os.path.exists(filename):
        return f"Skipped {filename} (Exists)"

    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=750&nologo=true&seed=42"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response, open(filename, 'wb') as out_file:
                data = response.read()
                out_file.write(data)
            time.sleep(3) # 3초 대기 (유저 요청)
            return f"Success: {filename}"
        except Exception as e:
            print(f"Retry {attempt+1} for {filename} due to {e}", flush=True)
            time.sleep(5) # 실패 시 5초 대기 후 재시도
            if attempt == retries - 1:
                return f"Failed: {filename} - {e}"

    return f"Failed: {filename}"

elements = {
    "목": "thin and tall body, long straight face, pure natural innocent vibe",
    "화": "fit body with strong shoulders, V-line sharp face, intense eyes, glamorous sexy vibe",
    "토": "balanced sturdy body, round soft face, reliable comfortable vibe",
    "금": "skinny bony body, sharp clear facial features, cold chic city vibe",
    "수": "soft curvy body, round face with big dewy eyes, cute emotional vibe"
}

tengods = {
    "비겁": "distinctive facial bone structure, confident self-assertive look",
    "식상": "youthful cute face, highly expressive, celebrity-like",
    "재성": "perfectly symmetrical balanced face, neat likable impression",
    "관성": "straight tidy facial lines, trustworthy handsome/beautiful classic look",
    "인성": "soft innocent eyes, pure look that stimulates protective instinct"
}

vibes = {
    "charm": "intense alluring gaze, fatal attractive charm, sexy stage presence",
    "noble": "luxurious noble aura, high-class elegant vibe, clean impression",
    "unique": "exotic unique vibe, unconventional creative aura, mysterious",
    "strong": "overwhelming charisma, powerful intense stance, strong bold aura"
}

os.makedirs('assets', exist_ok=True)

tasks = []
for e_key, e_desc in elements.items():
    for t_key, t_desc in tengods.items():
        for v_key, v_desc in vibes.items():
            prompt_m = f"High fashion photorealistic portrait of a young Korean man, {e_desc}, {t_desc}, {v_desc}, Seoul street style, k-pop idol, highly detailed, 8k resolution, cinematic lighting"
            tasks.append((f"assets/m_{e_key}_{t_key}_{v_key}.png", prompt_m))
            
            prompt_f = f"High fashion photorealistic portrait of a young Korean woman, {e_desc}, {t_desc}, {v_desc}, Seoul street style, k-pop idol, highly detailed, 8k resolution, cinematic lighting"
            tasks.append((f"assets/f_{e_key}_{t_key}_{v_key}.png", prompt_f))

print(f"Starting generation of {len(tasks)} images with 3-second delay...", flush=True)

for i, (fname, prompt) in enumerate(tasks):
    res = download_image(fname, prompt)
    print(f"[{i+1}/{len(tasks)}] {res}", flush=True)

print("Finished generating all images!", flush=True)
