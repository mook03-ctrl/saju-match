import urllib.request
import urllib.parse

prompt = "High fashion photorealistic portrait of a young Korean man, thin and tall body, long straight face, pure natural innocent vibe, distinctive facial bone structure, confident self-assertive look, intense alluring gaze, fatal attractive charm, sexy stage presence, Seoul street style, k-pop idol, highly detailed, 8k resolution, cinematic lighting"
url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=600&height=750&nologo=true&seed=42"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=30) as response:
        print("Status:", response.status)
        print("Headers:", response.headers)
except Exception as e:
    print("Error:", e)
