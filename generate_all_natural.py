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
        time.sleep(5) # 5초 대기
        return f"Downloaded: {filename}"
    except Exception as e:
        time.sleep(10)
        return f"Failed: {filename} - {e}"

# Elements: 체형과 기본적인 이목구비 (부드럽고 자연스럽게 완화)
elements = {
    "목": "slender and tall body, slightly long natural face shape, pure and innocent vibe",
    "화": "fit and healthy body, slim V-line face, bright eyes, glamorous yet casual vibe",
    "토": "well-balanced sturdy body, round and soft friendly face, reliable and comfortable vibe",
    "금": "slim body, clear and neat facial features, chic and clean vibe",
    "수": "soft and slightly curvy body, round face with big dewy eyes, cute and emotional vibe"
}

# Ten Gods: 표정과 인상 (인상 쓰지 않게, 부드러운 미소)
tengods = {
    "비겁": "confident but friendly look, natural facial lines, soft smile",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression, soft smile",
    "관성": "straight tidy facial lines, trustworthy and classic handsome/beautiful look, gentle smile",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

# Vibes: 분위기와 구도 (일부 무릎 위 전신샷 적용)
vibes = {
    "charm": ("waist-up portrait", "attractive charm, casual everyday clothes, bright daylight, outdoor cafe background"),
    "noble": ("knee-up full body shot", "elegant vibe, stylish everyday fashion, bright daylight, beautiful street background"),
    "unique": ("waist-up portrait", "unique and creative casual style, bright daylight, cozy indoor background"),
    "strong": ("knee-up full body shot", "confident stance, modern casual street fashion, bright daylight, city street background")
}

os.makedirs('assets', exist_ok=True)

tasks = []
# 200 combinations
for e_key, e_desc in elements.items():
    for t_key, t_desc in tengods.items():
        for v_key, (camera_shot, v_desc) in vibes.items():
            base_prompt = "Casual natural photorealistic snapshot, bright soft natural lighting, no prominent cheekbones, not a fashion model"
            
            prompt_m = f"{camera_shot} of a young 20s handsome Korean man, {base_prompt}, {e_desc}, {t_desc}, {v_desc}, highly detailed, 8k resolution"
            tasks.append((f"assets/m_{e_key}_{t_key}_{v_key}.png", prompt_m))
            
            prompt_f = f"{camera_shot} of a young 20s beautiful Korean woman, {base_prompt}, {e_desc}, {t_desc}, {v_desc}, highly detailed, 8k resolution"
            tasks.append((f"assets/f_{e_key}_{t_key}_{v_key}.png", prompt_f))

# 10 Fallbacks
fallback_tengods = {
    "비겁": "confident but friendly look, natural facial lines, soft smile",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression",
    "관성": "trustworthy and classic look, gentle smile",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

for t_key, t_desc in fallback_tengods.items():
    base_prompt = "Casual natural photorealistic waist-up snapshot, bright soft natural lighting, no prominent cheekbones, not a fashion model"
    
    prompt_m = f"{base_prompt} of a young 20s handsome Korean man, {t_desc}, casual everyday clothes, bright daylight, outdoor background, highly detailed, 8k resolution"
    tasks.append((f"assets/m_face_{t_key}.jpg", prompt_m))
    
    prompt_f = f"{base_prompt} of a young 20s beautiful Korean woman, {t_desc}, casual everyday clothes, bright daylight, outdoor background, highly detailed, 8k resolution"
    tasks.append((f"assets/f_face_{t_key}.jpg", prompt_f))

print(f"Starting generation of {len(tasks)} images with natural style...", flush=True)

success_count = 0
for i, (fname, prompt) in enumerate(tasks):
    res = download_pollinations(fname, prompt)
    print(f"[{i+1}/{len(tasks)}] {res}", flush=True)
    if "Downloaded" in res:
        success_count += 1

print(f"Finished generating {success_count} images!", flush=True)
