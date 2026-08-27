const HA_URL = "http://192.168.178.136:8123"; 

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "MEDIA_FOUND") {
    handleMediaUpdate(message.payload);
  }
});

async function handleMediaUpdate(media) {
  const { title, season, episode, rawDescription } = media;
  
  if (!title) return;

  const { mediaHistory = {} } = await chrome.storage.local.get("mediaHistory");
  const seriesKey = title.toLowerCase().trim();
  const currentSaved = mediaHistory[seriesKey];

  const isNewItem = !currentSaved;
  const isDataMoreComplete = currentSaved && (currentSaved.season === null && season !== null);
  const isEpisodeChanged = currentSaved && (currentSaved.season !== season || currentSaved.episode !== episode);

  if (isNewItem || isDataMoreComplete || isEpisodeChanged) {
    const updatedData = {
      title,
      season: season ?? null,
      episode: episode ?? null,
      rawDescription: rawDescription ?? null,
      lastUpdated: new Date().toISOString()
    };

    mediaHistory[seriesKey] = updatedData;
    await chrome.storage.local.set({ mediaHistory });

    console.log(`[Background] Sending to HA for ${title}:`, updatedData);
    await sendToHomeAssistant(updatedData);
  } else {
    console.log(`[Background] No change detected for "${title}" (already up-to-date).`);
  }
}

async function sendToHomeAssistant(media) {
  const baseUrl = HA_URL.replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/webhook/update_watchlist_json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(media)
    });

    if (response.ok) {
      console.log(`[HA OK] Series "${media.title}" saved to watchlist.json and updated!`);
    } else {
      console.error(`[HA Error ${response.status}] Webhook failed.`);
    }
  } catch (err) {
    console.error("[HA Network Error]:", err);
  }
}