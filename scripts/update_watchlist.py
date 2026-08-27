media = data.get("media", {})
title = media.get("title")

if title:
    series_key = title.lower().strip().replace(" ", "_").replace("'", "")
    season = media.get("season")
    episode = media.get("episode")
    
    state_text = f"S{season} E{episode}" if season is not None else "Visto"
    
    hass.states.set(
        f"sensor.watchlist_{series_key}",
        state_text,
        attributes={
            "friendly_name": title,
            "season": season,
            "episode": episode,
            "raw_description": media.get("rawDescription"),
            "last_updated": media.get("lastUpdated"),
            "icon": "mdi:television-classic" if season is not None else "mdi:movie-open-play"
        }
    )