import sys
import json
import os
import base64

file_path = "/config/www/sc-ha-series/watchlist.json"

try:
    if len(sys.argv) < 2:
        sys.exit(0)

    encoded_title = sys.argv[1]
    series_title = base64.b64decode(encoded_title).decode('utf-8').lower().strip()

    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, "r", encoding="utf-8") as f:
            watchlist = json.load(f)

        if series_title in watchlist:
            del watchlist[series_title]

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(watchlist, f, indent=2, ensure_ascii=False)

    print("DELETED")
except Exception as e:
    print(f"ERROR: {e}")