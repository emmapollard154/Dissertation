// background.js

console.log('Starting service worker');

const A_FRONTEND = 5173;
const EMAIL_ENV = 'http://localhost:5174';
// const BANKING_ENV = "https://www.google.com/";

// Function to initialise the number of pending requests and updates
function setNums(pending, updates) {

	if (pending >= 0) { // update pending only if valid number given
		chrome.storage.local.set({ 'NUM_PENDING': pending }, function() {
		console.log('background.js: initialising NUM_PENDING to ', pending);
		});
	}

    chrome.storage.local.set({ 'NUM_UPDATES': updates }, function() {
    console.log('background.js: initialising NUM_UPDATES to ', updates);
    });
}

// Set side panel behaviour
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .then(() => console.log('background.js: side panel behaviour set.'))
  .catch((error) => console.error('background.js: error setting side panel behaviour: ', error));

// Open dashboard in a new tab when extension icon clicked
chrome.action.onClicked.addListener((tab) => {
	console.log(`background.js: extension clicked. Opening dashboard in new tab.`);
	setNums(0,0); // initialise variables, updated by side panel

	chrome.sidePanel.open({ tabId: tab.id }) // open side panel	
		.then(() => { console.log('Side panel opened successfully for tab ID:', tab.id); })
		.catch((error) => { console.error('Error opening side panel:', error); });

	chrome.tabs.create({ url: `http://localhost:${A_FRONTEND}` })
		.then((newTab) => { console.log('New tab opened successfully:', newTab.url); })
		.catch((error) => { console.error('Error opening new tab:', error); });
});

// Function to get current time in sqlite datetime format
// function timeToDatetime() {
//     const now = new Date();
//     const nowStr = now.toISOString();
//     const [date, rawTime] = nowStr.split('T');
//     const time = rawTime.split('.')[0];
//     return `${date} ${time}`;
// }

// Function to get URL of active tab
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0) {
			var activeTab = tabs[0];
			if (activeTab.url === undefined) {
				console.warn('Active tab URL is undefined');
			} else if (activeTab.url === 'chrome://newtab/') {
				// pass
			} else {
				var url = new URL(activeTab.url);
				timestamp = new Date().toISOString(); //timeToDatetime();
				console.log('background.js: sending url to dashboard.');
                chrome.runtime.sendMessage({ action: 'sendUrlToDashboard', newUrlMessage: [url,  timestamp] });
			}
		}
	});
}

// Create event listener for when a tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete') {
		getActiveTabUrl();
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'openDashboard') {
		chrome.tabs.create({ url: `http://localhost:${A_FRONTEND}` });
		setNums(-1, 0); // leave number pending unchanged, reset number of updates
	}
});

// Create listener for messages from external web pages
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    const allowedOrigins = [`http://localhost:${A_FRONTEND}`];

    if (!allowedOrigins.includes(new URL(sender.url).origin)) {
      console.warn('Blocked message from unauthorized origin:' , sender.url);
      return false;
    }

    if (request.type === 'NUM_PENDING') {
		chrome.runtime.sendMessage({ action: 'updateNumPending', numPending: request.payload });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'USER_B_MESSAGE') {
		chrome.runtime.sendMessage({ action: 'updateNumUpdates' });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
  }
);


// // TO DO  open settings page on installation
// chrome.runtime.onInstalled.addListener(({reason}) => {
//   if (reason === 'install') {
//     chrome.tabs.create({
//       url: "onboarding.html"
//     });
//   }
// });