(function () {
  
  if (!window.location.hostname.includes('vixcloud') && !window.location.hostname.includes('streamingcommunity')) {
    return;
  }

  const isTargetFrame = window.location.href.includes("vixcloud");
  const isTopWindow = window === window.top;

  if (!isTopWindow && !isTargetFrame) {
    return;
  }

  let observer = null;
  let lastSentData = null;

  function extractAndSave() {
    const titleEl = document.getElementsByClassName('video-title')[0];
    const descEl = document.getElementsByClassName('video-description')[0];

    const title = titleEl ? (titleEl.innerText || titleEl.textContent || '').trim() : null;
    const description = descEl ? (descEl.innerText || descEl.textContent || '').trim() : null;

    if (!title) {
      return;
    }

    let season = null;
    let episode = null;

    if (description) {
      const match = description.match(/S(\d+):E(\d+)/i);
      if (match) {
        season = parseInt(match[1], 10);
        episode = parseInt(match[2], 10);
      }
    }

    const mediaData = {
      title: title,
      season: season,
      episode: episode,
      rawDescription: description || null,
      frameUrl: window.location.href
    };

    const dataString = JSON.stringify(mediaData);

    if (dataString !== lastSentData) {
      lastSentData = dataString;

      chrome.runtime.sendMessage({
        action: 'MEDIA_FOUND',
        payload: mediaData
      });
    }
  }

  function initObserver() {
    const targetNode = document.body || document.documentElement;
    if (!targetNode) return;

    observer = new MutationObserver(() => {
      extractAndSave();
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });

    extractAndSave();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
  } else {
    initObserver();
  }
})();