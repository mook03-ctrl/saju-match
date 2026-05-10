import urllib.request
import urllib.parse
import os
import time

def download_pollinations(filename, prompt):
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=750&nologo=true&seed=42"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        time.sleep(5)
        return f"Downloaded: {filename}"
    except Exception as e:
        time.sleep(10)
        return f"Failed: {filename} - {e}"

PROMPT_TENGODS = {
    "비겁": "confident but friendly look, natural facial lines, soft smile",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression, soft smile",
    "관성": "straight tidy facial lines, trustworthy and classic handsome/beautiful look, gentle smile",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

tasks = []
os.makedirs('assets', exist_ok=True)

for tengod_key, tengod_desc in PROMPT_TENGODS.items():
    # Male
    m_prompt = f"Medium full shot, thigh-up portrait, slightly zoomed in of an early 30s mature and handsome Korean man, clean look, no necklace, no jewelry, minimal accessories, photorealistic snapshot, bright soft natural lighting, no prominent cheekbones, not a fashion model, character taking up most of the frame, {tengod_desc}, sophisticated light spring fashion, trendy spring jacket or light knitwear, elegant and stylish, not tacky, bright daylight, beautiful natural street background, highly detailed, 2k resolution"
    tasks.append((f"assets/m_face_{tengod_key}.jpg", m_prompt))
    
    # Female
    f_prompt = f"Medium full shot, thigh-up portrait, slightly zoomed in of an early 30s mature and beautiful Korean woman, photorealistic snapshot, bright soft natural lighting, no prominent cheekbones, not a fashion model, character taking up most of the frame, {tengod_desc}, sophisticated light spring fashion, elegant and stylish, not tacky, bright daylight, cozy stylish cafe background, highly detailed, 2k resolution"
    tasks.append((f"assets/f_face_{tengod_key}.jpg", f_prompt))

print(f"Starting generation of 10 fallback images using Pollinations API...")
for i, (fname, prompt) in enumerate(tasks):
    res = download_pollinations(fname, prompt)
    print(f"[{i+1}/10] {res}", flush=True)

print("Done generating 10 fallbacks!")
