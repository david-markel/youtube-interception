console.log("Content script initiated.");

// Extract video ID from YouTube video URL
function extractVideoId(url) {
  const videoIdPattern = /[?&]v=([^&#]*)/;
  const match = url.match(videoIdPattern);
  return match && match[1];
}

const videoId = extractVideoId(window.location.href);
let overlay; // Moved the overlay definition outside to make it globally accessible in the script.
let captionsArray = [];

if (videoId) {
  console.log(`Detected YouTube video ID: ${videoId}`);

  // Find the video element
  const video = document.querySelector("video");
  if (!video) {
    console.error("Could not find video element on the page.");
  } else {
    // Create a new div element to contain the "hello world" text.
    overlay = document.createElement("div");
    overlay.id = "captionOverlay"; // Assigning an ID
    overlay.textContent = "hello world";

    // Style the div.
    overlay.style.position = "absolute";
    overlay.style.top = video.getBoundingClientRect().top + "px";
    overlay.style.left = video.getBoundingClientRect().left + "px";
    overlay.style.color = "white";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
    overlay.style.padding = "10px";
    overlay.style.borderRadius = "5px";
    overlay.style.zIndex = 1000; // Some large value to ensure it's on top

    // Append it to the DOM.
    document.body.appendChild(overlay);

    // Notify background script to fetch captions
    chrome.runtime.sendMessage(
      { action: "fetchCaptions", videoId: videoId },
      (response) => {
        if (response.success) {
          console.log("Successfully fetched captions:", response.captions);
          captionsArray = response.captions;
          updateCaption(); // Start the caption updater
        } else {
          console.error("Error fetching captions:", response.errorMessage);
        }
      }
    );
  }
} else {
  console.error("Could not extract video ID from URL.");
}

function updateCaption() {
  const video = document.querySelector("video");
  if (video && captionsArray.length > 0) {
    const currentTime = video.currentTime;

    for (const caption of captionsArray) {
      if (
        currentTime >= parseFloat(caption.start) &&
        currentTime <= parseFloat(caption.start) + parseFloat(caption.dur)
      ) {
        overlay.textContent = caption.text;
        break;
      }
    }

    requestAnimationFrame(updateCaption);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleCaptions") {
    if (overlay) {
      if (overlay.style.display !== "none") {
        overlay.style.display = "none";
      } else {
        overlay.style.display = "block";
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Overlay not found" });
    }
  }
});
