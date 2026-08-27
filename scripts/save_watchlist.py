import sys
import json
import os
import base64

file_path = "/config/www/sc-ha-series/watchlist.json"

try:
    if len(sys.argv) < 2:
        sys.exit(0)

    encoded_data = sys.argv[1]
    raw_json = base64.b64decode(encoded_data).decode('utf-8')
    media = json.loads(raw_json)

    title = media.get("title")
    if not title:
        sys.exit(0)

    watchlist = {}
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                watchlist = json.load(f)
        except Exception:
            watchlist = {}

    series_key = title.lower().strip()
    watchlist[series_key] = media

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(watchlist, f, indent=2, ensure_ascii=False)

    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")