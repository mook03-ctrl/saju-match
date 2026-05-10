import urllib.request
import urllib.parse
import json

prompt = "A cute cat"
url = f"https://api.airforce/v1/imagine2?prompt={urllib.parse.quote(prompt)}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req, timeout=15) as response:
        print("Status:", response.status)
        data = response.read()
        print("Response length:", len(data))
except Exception as e:
    print("Error:", e)
