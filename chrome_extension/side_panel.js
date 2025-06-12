// sidepanel.js (Script for the side panel's HTML page)

document.addEventListener('DOMContentLoaded', () => {
  console.log("Sidepanel script loaded. DOMContentLoaded.");

  // Get the HTML element where the URL will be displayed
  const urlDisplay = document.getElementById('currentUrl');
  // Get the new HTML elements for the special message
  const specialMessageContainer = document.getElementById('specialMessageContainer');
  const specialMessageText = document.getElementById('specialMessageText');

  /**
   * Listens for messages sent from the background script.
   * This is how the URL and potential special message information is received.
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Sidepanel received message:", message, "from sender:", sender);

    // Check if the received message is of the expected type "urlInfo"
    if (message.type === "urlInfo") {
      // Always update the URL display
      if (message.url) {
        urlDisplay.textContent = message.url;
        console.log("Sidepanel updated URL display to:", message.url);
      } else {
        urlDisplay.textContent = "URL Not Available";
        console.log("Sidepanel: No URL received in message.");
      }


      // Check if a special message should be displayed
      if (message.isTargetUrl && message.pageSpecificMessage) {
        // Remove the 'hidden' class to make the container visible
        specialMessageContainer.classList.remove('hidden');
        // Set the text content of the special message
        specialMessageText.textContent = message.pageSpecificMessage;
        console.log("Sidepanel displayed special message:", message.pageSpecificMessage);
      } else {
        // If not a target URL or no message, hide the container and clear its text
        specialMessageContainer.classList.add('hidden');
        specialMessageText.textContent = '';
        console.log("Sidepanel hid special message container.");
      }
    } else {
      console.log("Sidepanel received unknown message type:", message.type);
    }
  });

});




(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Sidebar: Active tab found:", tab);
    if (tab && tab.url) {
      document.getElementById('url').textContent = tab.url;
    } else {
      document.getElementById('url').textContent = "No active tab or URL found.";
    }
  } catch (error) {
    console.error("Sidebar: Error fetching active tab:", error);
    document.getElementById('url').textContent = "Error fetching URL.";
  }
})();
