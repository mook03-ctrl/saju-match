import os

base_dir = "assets/appearance_types"

elements_desc = {
    "목": "slender and well-proportioned body, slightly long natural face shape",
    "화": "fit and healthy body with nice shoulders, natural V-line face shape, bright eyes",
    "토": "balanced and sturdy body, round and soft friendly face shape",
    "금": "slim body, clear and neat facial features",
    "수": "soft and slightly curvy body, round face with big dewy eyes"
}

tengods_desc = {
    "비겁": "confident but very friendly look with soft natural facial lines",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression",
    "관성": "straight tidy facial lines, trustworthy and classic look",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
}

vibes_desc = {
    "charm": "subtle attractive charm, slightly alluring but friendly aura",
    "noble": "luxurious noble aura, high-class elegant vibe, clean impression"
}

genders = [("male", "남성", "young Korean man in his late 20s to early 30s"), 
           ("female", "여성", "young Korean woman in her late 20s to early 30s")]

for gender_eng, gender_kr, gender_desc in genders:
    gender_path = os.path.join(base_dir, gender_kr)
    if not os.path.exists(gender_path):
        continue
        
    for folder_name in os.listdir(gender_path):
        folder_path = os.path.join(gender_path, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        parts = folder_name.split("_")
        if len(parts) != 3:
            continue
            
        e_key, t_key, v_key = parts
        
        e_text = elements_desc.get(e_key, "")
        t_text = tengods_desc.get(t_key, "")
        v_text = vibes_desc.get(v_key, "")
        
        # Build prompt
        prompt = f"A highly realistic, photorealistic portrait of a {gender_desc}. "
        if gender_eng == "female":
            prompt += f"She has a {e_text}. She exhibits a {t_text} and a {v_text}. She is wearing stylish but comfortable daily spring clothing (casual wear). "
        else:
            prompt += f"He has a {e_text}. He exhibits a {t_text} and a {v_text}. He is wearing stylish but comfortable daily spring clothing (casual wear). "
            
        prompt += "The setting is a bright cozy stylish cafe OR beautiful sunny outdoor park. Shot type: Medium full shot, thigh-up portrait, slightly zoomed in. "
        prompt += "IMPORTANT: Do NOT use cold high-fashion model expressions. NO harsh cheekbones, NO angry or stern looks. The vibe must be pure, natural, friendly, and highly approachable. "
        
        prompt += "ABSOLUTELY NO earrings, NO necklaces, NO accessories on the man. "
            
        prompt += "2k resolution, photorealistic, cinematic lighting, highly detailed. --ar 4:5. Ensure final output format is JPG."
        
        txt_path = os.path.join(folder_path, "외모설명.txt")
        
        content = f"""[{e_key} + {t_key} + {v_key}] 외모 특징 및 생성 프롬프트

1. 체형/얼굴형 (오행 - {e_key}): {e_text}
2. 이목구비/표정 (십성 - {t_key}): {t_text}
3. 전체적인 분위기 ({v_key}): {v_text}

=======================================================
[ 미드저니 / ChatGPT 등 AI 이미지 생성용 복사/붙여넣기 프롬프트 ]
=======================================================

{prompt}

=======================================================
* 사용 팁: 
- 이 텍스트를 복사해서 AI에 붙여넣기만 하면 지금까지 만든 샘플과 동일한 2K 화질, 
  동일한 비율(4:5), 동일한 분위기(자연스럽고 부드러운 일상 컷)로 사진을 생성할 수 있습니다.
- 배경(The setting is ~) 부분을 원하시는 장소(예: modern office, beautiful beach 등)로 
  자유롭게 수정하셔도 좋습니다.
- 🚨 중요: 생성된 이미지를 다운로드 받아 폴더에 넣으실 때 파일명을 반드시 `face1.jpg` (또는 `face.jpg`)로, 파일 포맷(확장자)을 **JPG**로 맞추어 저장해주세요!
"""
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Updated all 100 외모설명.txt files with exact English prompts.")
