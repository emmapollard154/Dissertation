// background.js

console.log("Starting service worker");

// set side panel behaviour
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .then(() => console.log("Opening side panel"))
  .catch((error) => console.error("Error opening side panel:", error));

// change to URL of fake email and banking environments
const TARGET_URL = "https://www.google.com/";

// function to get URL of active tab
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0) {
			var activeTab = tabs[0];
			if (activeTab.url === undefined) {
				console.log("Active tab URL is undefined");
			} else if (activeTab.url === "chrome://newtab/") {
				console.log("Active tab URL is chrome://newtab/");
			} else {
				var url = new URL(activeTab.url);
				var hostname = url.hostname;
				console.log("New tab URL: " + activeTab.url);

				// send current url to side panel
				console.log("Sending URL background -> side_panel")
                chrome.runtime.sendMessage({ newUrlMessage: [url,  Date.now()] });
			}
		}
	});
}











// Event listener for when a tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === "complete") {
		console.log("Tab updated")
		getActiveTabUrl();
	}
});
