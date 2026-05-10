import urllib.request

url = "https://image.pollinations.ai/prompt/Casual%20natural?width=600&height=750&nologo=true&seed=42"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
except Exception as e:
    print("Error:", e)
