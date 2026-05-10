import os

tengods_data = {
    "비겁": {
        "title": "비겁 (자기 주장 있는 얼굴)",
        "desc": "존재감이 있고 선이 강하거나 눈에 띄는 자기 주장이 담긴 얼굴. 자신감 넘치고 자연스러운 선을 가졌습니다.",
        "male_prompt": "confident but friendly look, natural facial lines, soft smile, masculine",
        "female_prompt": "confident but friendly look, natural facial lines, soft smile, feminine"
    },
    "식상": {
        "title": "식상 (연예인 느낌의 포인트)",
        "desc": "표정이 풍부하고 입과 턱 쪽이 발달하여 귀여움과 끼가 넘치는 얼굴. 동안이며 밝은 미소를 지녔습니다.",
        "male_prompt": "youthful and cute face, highly expressive, bright natural smile, masculine",
        "female_prompt": "youthful and cute face, highly expressive, bright natural smile, feminine"
    },
    "재성": {
        "title": "재성 (호감형, 깔끔형)",
        "desc": "현실적이고 단정하며 이목구비의 균형이 아주 좋은 깔끔한 인상. 누구에게나 호감을 주는 얼굴입니다.",
        "male_prompt": "neat and symmetrical face, highly likable and gentle impression, soft smile, masculine",
        "female_prompt": "neat and symmetrical face, highly likable and gentle impression, soft smile, feminine"
    },
    "관성": {
        "title": "관성 (공무원/아나운서상)",
        "desc": "선이 단정하고 반듯하게 정리되어 있어 신뢰감을 주는 정석 미남/미녀의 느낌. 클래식하고 신뢰감 있는 얼굴입니다.",
        "male_prompt": "straight tidy facial lines, trustworthy and classic handsome look, gentle smile, masculine",
        "female_prompt": "straight tidy facial lines, trustworthy and classic beautiful look, gentle smile, feminine"
    },
    "인성": {
        "title": "인성 (동안과 청순)",
        "desc": "부드럽고 어려 보이며 사람들의 보호본능을 자극하는 순한 눈빛. 청순하고 순수한 인상입니다.",
        "male_prompt": "soft innocent eyes, pure and gentle look, very friendly expression, masculine",
        "female_prompt": "soft innocent eyes, pure and gentle look, very friendly expression, feminine"
    }
}

base_dir = "assets/appearance_types"

for gender, g_prefix, g_label in [("male", "m", "남성"), ("female", "f", "여성")]:
    for ten_god, data in tengods_data.items():
        # Create folder
        folder_path = os.path.join(base_dir, g_label, ten_god)
        os.makedirs(folder_path, exist_ok=True)
        
        # Write text file
        txt_path = os.path.join(folder_path, "외모설명.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(f"=== {data['title']} ({g_label}) ===\n\n")
            f.write(f"외모 특징: {data['desc']}\n\n")
            f.write("AI 이미지 생성 프롬프트 예시:\n")
            if gender == "male":
                f.write(data['male_prompt'] + "\n\n")
            else:
                f.write(data['female_prompt'] + "\n\n")
            f.write(f"사용법: 이 폴더에 새로운 사진을 넣으실 때는 이름을 반드시 'face.jpg'로 변경해 주세요.\n")
            f.write(f"그러면 웹사이트에서 자동으로 이 사진을 불러옵니다.\n")
        
print("Folders and text files created successfully.")
