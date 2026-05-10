import urllib.request
import urllib.parse

# Test both the new 200 images and the old fallback images
urls = [
    f"https://mook03-ctrl.github.io/saju-match/assets/m_{urllib.parse.quote('목')}_{urllib.parse.quote('비겁')}_charm.png",
    f"https://mook03-ctrl.github.io/saju-match/assets/m_face_{urllib.parse.quote('비겁')}.jpg"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            print(f"Status for {url}: {response.status}")
    except Exception as e:
        print(f"Error for {url}: {e}")
