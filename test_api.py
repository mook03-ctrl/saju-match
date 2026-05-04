import urllib.request
import urllib.parse
import json

def test_hercai():
    url = f"https://hercai.onrender.com/v3/text2image?prompt=A+cute+cat"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read())
            print("Success Hercai!", data)
    except Exception as e:
        print("Failed Hercai:", e)

test_hercai()
