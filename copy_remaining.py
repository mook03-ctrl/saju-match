import os
import shutil

source_dir = r"C:\Users\mooga\.gemini\antigravity\brain\80a8f0c4-64f5-4b53-a805-6b573f18789a"
dest_dir = r"c:\Users\mooga\OneDrive\바탕 화면\Antigravity_Test\ConversationAssistant\SajuCharacterMaker\assets\appearance_types"

files_to_copy = {
    "m_wood_siksang_charm_1778418177774.png": r"남성\목_식상_charm\face.jpg",
    "m_wood_insung_noble_1778418194563.png": r"남성\목_인성_noble\face.jpg",
    "m_fire_bigub_noble_1778418207991.png": r"남성\화_비겁_noble\face.jpg",
    "m_fire_gwansung_charm_1778418221681.png": r"남성\화_관성_charm\face.jpg",
}

for src_name, dest_rel in files_to_copy.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_rel)
    
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(src_path, dest_path)
        print(f"Copied to {dest_rel}")
    else:
        print(f"Missing source: {src_path}")
