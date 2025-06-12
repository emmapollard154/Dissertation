// background.js

console.log("Starting service worker");

// set side panel behaviour
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .then(() => console.log("Opening side panel"))
  .catch((error) => console.error("Error opening side panel:", error));

// change to URL of fake email and banking environments
const TARGET_URL = "https://www.google.com/";


// Listener for when a tab becomes active (user switches tabs)
chrome.tabs.onActivated.addListener(activeInfo => {
  console.log("Tab activated:", activeInfo.tabId);
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (chrome.runtime.lastError) {
      console.error("Error getting tab info onActivated:", chrome.runtime.lastError.message);
      return;
    }
    console.log("Tab info received onActivated:", tab);
    if (tab && tab.url) {
      processAndSendUrl(tab.url);
    }
  });
});

// Listener for when a tab is updated (e.g., navigates to a new URL within the same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process if the tab is active and the URL has changed or is loading (e.g., initial load)
  if (tab.active && changeInfo.url) {
    console.log("Tab updated:", tabId, "URL changed to:", changeInfo.url);
    processAndSendUrl(changeInfo.url);
  }
});

// // Listener for when the side panel is opened (e.g., first time, or manually opened)
// chrome.sidePanel.onOpen.addListener(async (panel) => {
//   console.log("Background: Side panel opened.");
//   try {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     console.log("Background: Active tab found on sidePanel.onOpen:", tab);
//     if (tab && tab.url) {
//       processAndSendUrl(tab.url);
//     } else {
//         console.warn("Background: No active tab or URL found when side panel opened.");
//     }
//   } catch (error) {
//     // THIS IS THE CRUCIAL PART: Catching potential errors from chrome.tabs.query
//     console.error("Background: Error in chrome.sidePanel.onOpen.addListener:", error);
//   }
// });

/**
 * Processes the URL, determines if a special message is needed,
 * and then sends the structured information to the side panel.
 * @param {string} url - The current tab's URL.
 */
function processAndSendUrl(url) {
  let isTargetUrl = false;
  let pageSpecificMessage = null;

  // Ensure url is a string to prevent errors
  if (typeof url !== 'string') {
    console.warn("Received non-string URL:", url);
    url = String(url); // Attempt to convert to string
  }

  // Check if the current URL matches the target URL
  if (url.startsWith(TARGET_URL)) {
    isTargetUrl = true;
    pageSpecificMessage = "You're on Google! This is a special page!";
  }

  const messageToSend = {
    type: "urlInfo", // Renamed message type for clarity
    url: url,
    isTargetUrl: isTargetUrl,
    pageSpecificMessage: pageSpecificMessage
  };
  console.log("Sending message to side panel:", messageToSend);

  // Send a structured message to the side panel
  chrome.runtime.sendMessage(messageToSend, response => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message via chrome.runtime.sendMessage:", chrome.runtime.lastError.message);
    } else {
      console.log("Message sent successfully, response (if any):", response);
    }
  });
}

// Listener for "requestUrl" messages from sidepanel.js, prompting an update.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "requestUrl") {
    console.log("Received 'requestUrl' message from sidepanel. Sender:", sender);
    // Always query the active tab in the current window to ensure we get the correct URL
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs on 'requestUrl':", chrome.runtime.lastError.message);
        return;
      }
      if (tabs[0] && tabs[0].url) {
        processAndSendUrl(tabs[0].url);
      } else {
        console.warn("No active tab with URL found for 'requestUrl' processing.");
      }
    });
  }
  // No explicit sendResponse needed as processAndSendUrl sends another message.
});