// sidepanel.js (Script for the side panel's HTML page)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in popup:", message);
    document.getElementById('messageDisplay').innerText = message.newUrlMessage;

    // sendResponse({ status: "Message received by side panel" });
});