// background.js

console.log("Starting service worker");

const DASHBOARD_A_LOCATION = "http://localhost:5173";
const EMAIL_ENV = "http://localhost:5174";
// const BANKING_ENV = "https://www.google.com/";

// set side panel behaviour
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .then(() => console.log("Side panel behaviour set: do not open by default"))
  .catch((error) => console.error("Error setting side panel behaviour:", error));



// open dashboard in a new tab when extension icon clicked
chrome.action.onClicked.addListener((tab) => {

  console.log(`Extension clicked. Opening dashboard in new tab.`);

	// open side panel	
	chrome.sidePanel.open({ tabId: tab.id })
		.then(() => {
			console.log('Side panel opened successfully for tab ID:', tab.id);
		})
		.catch((error) => {
			console.error('Error opening side panel:', error);
	});

	chrome.tabs.create({ url: DASHBOARD_A_LOCATION })
		.then((newTab) => {
			console.log('New tab opened successfully:', newTab.url);
		})
		.catch((error) => {
			console.error('Error opening new tab:', error);
	});
});

// function to get current time in sqlite datetime format
function timeToDatetime() {
    const now = new Date();
    const nowStr = now.toISOString();

    const [date, rawTime] = nowStr.split('T');
    const time = rawTime.split('.')[0];
    return `${date} ${time}`;
}

// function to get URL of active tab
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0) {
			var activeTab = tabs[0];
			if (activeTab.url === undefined) {
				console.log("Active tab URL is undefined");
			} else if (activeTab.url === "chrome://newtab/") {
				console.log("Active tab is new tab");
			} else {
				var url = new URL(activeTab.url);
				console.log("New tab: " + activeTab.url);

				// send current url to side panel
				console.log("Sending URL background -> side_panel")
				timestamp = timeToDatetime();
                chrome.runtime.sendMessage({ action: 'sendUrlToDashboard', newUrlMessage: [url,  timestamp] });
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "openDashboard") {
		console.log("Opening dashboard in new tab");
        // chrome.tabs.create({ url: request.url });
		chrome.tabs.create({ url: DASHBOARD_A_LOCATION });
	}
});



// // TO DO  open settings page on installation
// chrome.runtime.onInstalled.addListener(({reason}) => {
//   if (reason === 'install') {
//     chrome.tabs.create({
//       url: "onboarding.html"
//     });
//   }
// });