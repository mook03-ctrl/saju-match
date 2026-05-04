import urllib.request
import urllib.parse
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

os.makedirs('assets', exist_ok=True)

prompts = {
    # MALE FACES
    "m_face_비겁": "high quality realistic portrait photography of a Korean man, confident, portrait, model, bright sophisticated background",
    "m_face_식상": "high quality realistic portrait photography of a Korean man, smiling, expressive, portrait, bright sophisticated background",
    "m_face_재성": "high quality realistic portrait photography of a Korean man, sharp, business, portrait, bright sophisticated background",
    "m_face_관성": "high quality realistic portrait photography of a Korean man, serious, intense, portrait, bright sophisticated background",
    "m_face_인성": "high quality realistic portrait photography of a Korean man, calm, gentle, portrait, bright sophisticated background",
    
    # FEMALE FACES
    "f_face_비겁": "high quality realistic portrait photography of a Korean woman, confident, portrait, model, bright sophisticated background",
    "f_face_식상": "high quality realistic portrait photography of a Korean woman, smiling, expressive, portrait, bright sophisticated background",
    "f_face_재성": "high quality realistic portrait photography of a Korean woman, sharp, business, portrait, bright sophisticated background",
    "f_face_관성": "high quality realistic portrait photography of a Korean woman, serious, intense, portrait, bright sophisticated background",
    "f_face_인성": "high quality realistic portrait photography of a Korean woman, calm, gentle, portrait, bright sophisticated background",

    # MALE STYLES
    "m_style_도화살": "high quality realistic fashion photography of a Korean man, beautiful, elegant, outfit, mid body shot, bright sophisticated background",
    "m_style_홍염살": "high quality realistic fashion photography of a Korean man, sexy, alluring, fashion, night, mid body shot, bright sophisticated background",
    "m_style_화개살": "high quality realistic fashion photography of a Korean man, artistic, vintage, fashion, moody, mid body shot, bright sophisticated background",
    "m_style_귀문관살": "high quality realistic fashion photography of a Korean man, mystical, dark, fashion, avant-garde, mid body shot, bright sophisticated background",
    "m_style_백호대살": "high quality realistic fashion photography of a Korean man, fierce, leather, fashion, strong, mid body shot, bright sophisticated background",

    # FEMALE STYLES
    "f_style_도화살": "high quality realistic fashion photography of a Korean woman, beautiful, elegant, outfit, mid body shot, bright sophisticated background",
    "f_style_홍염살": "high quality realistic fashion photography of a Korean woman, sexy, alluring, fashion, night, mid body shot, bright sophisticated background",
    "f_style_화개살": "high quality realistic fashion photography of a Korean woman, artistic, vintage, fashion, moody, mid body shot, bright sophisticated background",
    "f_style_귀문관살": "high quality realistic fashion photography of a Korean woman, mystical, dark, fashion, avant-garde, mid body shot, bright sophisticated background",
    "f_style_백호대살": "high quality realistic fashion photography of a Korean woman, fierce, leather, fashion, strong, mid body shot, bright sophisticated background",
}

print("Starting to download 20 Korean AI character assets...")
for name, prompt in prompts.items():
    file_path = f"assets/{name}.jpg"
    if not os.path.exists(file_path):
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=400&height=400&nologo=true&seed=12345"
        try:
            print(f"Downloading {name}...")
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req) as response, open(file_path, 'wb') as out_file:
                out_file.write(response.read())
        except Exception as e:
            print(f"Failed to download {name}: {e}")
    else:
        print(f"Skipping {name}, already exists.")
print("All downloads finished!")
