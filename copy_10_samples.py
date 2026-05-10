import os
import shutil

source_dir = r"C:\Users\mooga\.gemini\antigravity\brain\80a8f0c4-64f5-4b53-a805-6b573f18789a"
dest_dir = r"c:\Users\mooga\OneDrive\바탕 화면\Antigravity_Test\ConversationAssistant\SajuCharacterMaker\assets\appearance_types"

files_to_copy = {
    "m_wood_bigub_charm_1778417901015.png": r"남성\목_비겁_charm\face.jpg",
    "m_wood_bigub_noble_1778417916901.png": r"남성\목_비겁_noble\face.jpg",
    "m_fire_siksang_charm_1778417934229.png": r"남성\화_식상_charm\face.jpg",
    "m_earth_jaesung_noble_1778417948739.png": r"남성\토_재성_noble\face.jpg",
    "m_metal_gwansung_noble_1778417964895.png": r"남성\금_관성_noble\face.jpg",
    "f_water_insung_charm_1778417978215.png": r"여성\수_인성_charm\face.jpg",
    "f_wood_bigub_noble_1778417994848.png": r"여성\목_비겁_noble\face.jpg",
    "f_fire_siksang_charm_1778418010850.png": r"여성\화_식상_charm\face.jpg",
    "f_earth_jaesung_noble_1778418031319.png": r"여성\토_재성_noble\face.jpg",
    "f_metal_gwansung_noble_1778418047390.png": r"여성\금_관성_noble\face.jpg"
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
