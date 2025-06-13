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
				var path = url.pathname;
				console.log("New tab URL: " + activeTab.url);
				chrome.storage.local.get(['urlList'], function (result) {
					var urlList = result.urlList;
					if (urlList === undefined) {
						urlList = [];
					}
					var index = urlList.findIndex(function (e) { return e.hostname == hostname; });
					if (index === -1) { // not found
						console.log("Saving new url");
						urlList.push({
							url: url,
							hostname: hostname,
							path: path,
							timestamp: Date.now(),
						});
						chrome.storage.local.set({ 'urlList': urlList }, function () {
						});
					}
                // send current url to side panel
                chrome.runtime.sendMessage({ newUrlMessage: url });
				});
			}
		}
	});
}











// Event listener for when a tab is updated (e.g., when it's refreshed)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === "complete") {
		// Tab has finished loading (including refresh)
		getActiveTabUrl();
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("message: " + message.type);
	console.log("current url" + message.url);

	if (message.type === "checkVisited") {
		const urlToCheck = message.url;
		var visited = true;
		chrome.storage.local.get(["urlList"], (result) => {
			var urlList = result.urlList;
			if (urlList === undefined) {
				urlList = [];
			}

			var index = urlList.findIndex(function (e) {
				return e.hostname == urlToCheck;
			});

			if (index === -1) {
				visited = false;
			}
			sendResponse({ visited });

			console.log("visited: " + visited);
		});
		return true;
	}
});
