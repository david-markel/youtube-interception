chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchCaptions") {
    const videoId = message.videoId;
    const serverUrl = "http://localhost:3000/captions"; // Assuming your Express server is running on port 3000

    // Fetch the caption content from our server
    fetch(`${serverUrl}?videoId=${videoId}`)
      .then((response) => response.json()) // Assuming your server returns JSON formatted data
      .then((data) => {
        console.log("Received captions:", data);

        // Send data back to content script
        sendResponse({ success: true, captions: data });
      })
      .catch((error) => {
        console.error("Error fetching captions:", error);
        sendResponse({ success: false, errorMessage: error.message });
      });

    // Indicate that the response will be sent asynchronously
    return true;
  }
});
