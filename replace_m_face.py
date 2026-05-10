import urllib.request
import urllib.parse
import os
import time

def download_image(filename, prompt):
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://api.airforce/v1/imagine2?prompt={encoded_prompt}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        time.sleep(1) # Be nice to the API
        return f"Downloaded: {filename}"
    except Exception as e:
        return f"Failed: {filename} - {e}"

tengods = {
    "비겁": "confident self-assertive look, sharp jawline, intense gaze",
    "식상": "youthful cute face, highly expressive, celebrity-like, smiling lightly",
    "재성": "perfectly symmetrical balanced face, neat likable impression",
    "관성": "straight tidy facial lines, trustworthy handsome classic look",
    "인성": "soft innocent eyes, pure look that stimulates protective instinct, gentle"
}

for t_key, t_desc in tengods.items():
    prompt = f"High fashion photorealistic portrait of a young 20s handsome Korean man, {t_desc}, k-pop idol, very bright white background, clean and youthful look, highly detailed, 8k resolution"
    # Overwrite the old .jpg files
    fname = f"assets/m_face_{t_key}.jpg"
    res = download_image(fname, prompt)
    print(res, flush=True)

print("Finished replacing m_face fallback images!", flush=True)
