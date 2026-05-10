import os
import shutil

elements = {
    "목": "키가 크고 길게 뻗은 느낌, 청순하고 자연스러운 분위기",
    "화": "상체가 발달하고 이목구비가 뚜렷하며 화려하고 섹시한 분위기",
    "토": "균형잡힌 체형에 둥글고 부드러운 호감형 얼굴, 편안한 분위기",
    "금": "직선적이고 마른 체형, 입체적이고 차가운 도시적인 분위기",
    "수": "유연하고 부드러운 몸선, 큰 눈과 도톰한 입술, 귀여운 분위기"
}

tengods = {
    "비겁": "선이 강하고 자기주장이 뚜렷한 자신감 넘치는 인상",
    "식상": "표정이 풍부하고 동안이며 연예인 같은 끼가 넘치는 인상",
    "재성": "이목구비 균형이 완벽하고 누구에게나 호감을 주는 깔끔한 인상",
    "관성": "단정하고 반듯하며 신뢰감을 주는 클래식한 미남/미녀 인상",
    "인성": "보호본능을 자극하는 순하고 부드러운 청순한 인상"
}

vibes = {
    "charm": "치명적이고 매혹적인 시선, 섹시하고 눈길을 끄는 매력",
    "noble": "고급스럽고 우아하며 귀티가 흐르는 깨끗한 인상"
}

genders = [("male", "남성"), ("female", "여성")]

base_dir = "assets/appearance_types_50"

os.makedirs(base_dir, exist_ok=True)

for gender_eng, gender_kr in genders:
    for e_key, e_desc in elements.items():
        for t_key, t_desc in tengods.items():
            for v_key, v_desc in vibes.items():
                
                # 폴더명 예시: 목_비겁_charm
                folder_name = f"{e_key}_{t_key}_{v_key}"
                folder_path = os.path.join(base_dir, gender_kr, folder_name)
                os.makedirs(folder_path, exist_ok=True)
                
                txt_path = os.path.join(folder_path, "외모설명.txt")
                
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(f"=== {gender_kr} / {e_key} / {t_key} / {v_key} ===\n\n")
                    f.write(f"[오행 특징 - {e_key}]\n{e_desc}\n\n")
                    f.write(f"[십성 특징 - {t_key}]\n{t_desc}\n\n")
                    f.write(f"[분위기 특징 - {v_key}]\n{v_desc}\n\n")
                    f.write("사용법: 이 폴더에 새로운 사진을 넣으실 때는 이름을 'face.jpg'로 변경해 주세요.\n")

print("Created 50 folders for men and 50 folders for women successfully.")
