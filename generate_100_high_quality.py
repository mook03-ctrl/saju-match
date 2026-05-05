import os
import json

# This script is a placeholder structure for generating the 100 high-quality static images
# using a premium AI API (like Google Vertex AI Imagen 3) once the quota resets.

PROMPT_ELEMENTS = {
    "목": "slender and tall body, slightly long natural face shape, pure and innocent vibe",
    "화": "fit and healthy body, slim V-line face, bright eyes, glamorous yet casual vibe",
    "토": "well-balanced sturdy body, round and soft friendly face, reliable and comfortable vibe",
    "금": "slim body, clear and neat facial features, chic and clean vibe",
    "수": "soft and slightly curvy body, round face with big dewy eyes, cute and emotional vibe"
}

PROMPT_TENGODS = {
    "비겁": "confident but friendly look, natural facial lines, soft smile",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression, soft smile",
    "관성": "straight tidy facial lines, trustworthy and classic handsome/beautiful look, gentle smile",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

PROMPT_VIBES = {
    "charm": { "shot": "Medium full shot, thigh-up portrait, slightly zoomed in", "desc": "sophisticated light spring fashion, elegant and stylish, not tacky, bright daylight, cozy stylish cafe background" },
    "noble": { "shot": "Medium full shot, thigh-up portrait, slightly zoomed in", "desc": "sophisticated trendy spring fashion, elegant and stylish, not tacky, bright daylight, beautiful natural street background" }
}

tasks = []

# Generate 100 combinations
for gender, isMale in [("m", True), ("f", False)]:
    genderNoun = "handsome Korean man" if isMale else "beautiful Korean woman"
    accessoryRule = "clean look, no necklace, no jewelry, minimal accessories, " if isMale else ""
    basePrompt = "photorealistic snapshot, bright soft natural lighting, no prominent cheekbones, not a fashion model, character taking up most of the frame"
    
    for element_k, element_v in PROMPT_ELEMENTS.items():
        for tengod_k, tengod_v in PROMPT_TENGODS.items():
            for vibe_k, vibe_v in PROMPT_VIBES.items():
                
                shot = vibe_v["shot"]
                desc = vibe_v["desc"]
                
                prompt = f"{shot} of an early 30s mature and {genderNoun}, {accessoryRule}{basePrompt}, {element_v}, {tengod_v}, {desc}, highly detailed, 2k resolution"
                filename = f"assets/{gender}_{element_k}_{tengod_k}_{vibe_k}.jpg"
                
                tasks.append({"filename": filename, "prompt": prompt})

os.makedirs('assets', exist_ok=True)

print(f"Total images to generate: {len(tasks)}")

# Pseudo-code for execution when quota resets:
# for task in tasks:
#     print(f"Generating {task['filename']}...")
#     # Call premium API here
#     # save to task['filename']

with open('generation_tasks.json', 'w', encoding='utf-8') as f:
    json.dump(tasks, f, ensure_ascii=False, indent=4)

print("Tasks saved to generation_tasks.json. Run API generation loop when ready.")
