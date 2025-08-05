// background.js

console.log('Starting service worker');

const A_FRONTEND = 5173;
const EMAIL_ENV = 'http://localhost:5174';
const EXTENSION_ID = 'bcdjfglkdcfeeekbkhbambhhjgdllcom'; // TEMPORARY

// Set side panel behaviour
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .then(() => console.log('background.js: side panel behaviour set.'))
  .catch((error) => console.error('background.js: error setting side panel behaviour: ', error));

// Open dashboard in a new tab when extension icon clicked
chrome.action.onClicked.addListener( async (tab) => {

	console.log(`background.js: extension clicked. Opening dashboard in new tab.`);
	setNums(0,0); // initialise variables, updated by side panel

	chrome.sidePanel.open({ tabId: tab.id }) // open side panel	
		.then(() => { console.log('background.js: side panel opened successfully for tab ID:', tab.id); })
		.catch((error) => { console.error('Error opening side panel:', error); });

	chrome.tabs.create({ url: `http://localhost:${A_FRONTEND}` })
		.then((newTab) => { console.log('background.js: new tab opened successfully:', newTab.url); })
		.catch((error) => { console.error('background.js: error opening new tab:', error); });

});

// Function to get URL of active tab
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0) {
			var activeTab = tabs[0];
			if (activeTab.url === undefined) {
				console.warn('background.js: active tab URL is undefined');
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

async function openDashboard() {
	const tabs = await chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/` });

	if (tabs.length > 0) {
		const dash = tabs[0];
		await chrome.tabs.update(dash.id, { active: true, highlighted: true });
		if (dash.windowId) { // dashboard tab already exists
			await chrome.windows.update(dash.windowId, { focused: true });
		}
		console.log(`background.js: switched to existing tab: ${dash.url}.`);
	} else { // create dashboard tab
		const newDash = await chrome.tabs.create({ url: `http://localhost:${A_FRONTEND}/`, active: true });
		console.log(`background.js: opened new tab: ${newDash.url}.`);
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'openDashboard') {
		openDashboard();
	}
});

// Create listener for messages from external web pages
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    const allowedOrigins = [`http://localhost:${A_FRONTEND}`];

    if (!allowedOrigins.includes(new URL(sender.url).origin)) {
      console.warn('background.js: blocked message from unauthorized origin:' , sender.url);
      return false;
    }

    if (request.type === 'NUM_PENDING') {
		chrome.runtime.sendMessage({ action: 'updateNumPending' });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

	// if (request.type === 'SET_TRUSTED') {
	// 	chrome.runtime.sendMessage({ action: 'setTrustedContacts' , addresses: request.payload});
	// 	sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
	// 	return true;
	// }

    if (request.type === 'ADD_TRUSTED') {
		chrome.runtime.sendMessage({ action: 'addTrustedContact' , address: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'REMOVE_TRUSTED') {
		chrome.runtime.sendMessage({ action: 'removeTrustedContact' , address: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'USER_B_MESSAGE') {
		chrome.runtime.sendMessage({ action: 'updateNumUpdates' });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'EMAIL_SETTINGS') {
		chrome.runtime.sendMessage({ action: 'setEmailSettings' , settings: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'USER_B_RESPONSE') {
		chrome.runtime.sendMessage({ action: 'userBResponse' , outcome: request.payload.outcome , url: request.payload.url});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

  }
);

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

// Create listener for messages from external web pages
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if (sender.id === EXTENSION_ID) {
		console.log('background.js: request receieved from side panel.');
		if (request.action === 'sendHelpMessage') {
			console.log('background.js: sendHelpMessage request receieved.')

            chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];

                    chrome.tabs.sendMessage(activeTab.id, { 
                        action: 'sendHelpMessage'
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error("background.js: ", chrome.runtime.lastError.message);
                            sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ status: 'success', contentScriptResponse: response });
                        }
                    });
                } else {
                    alert("Please open dashboard");
                    console.warn('side_panel.js : no active tab found to send message to.');
                    sendResponse({ status: 'failed', error: 'No active tab found' });
                }
            });
		}
	else if (request.action === 'sendEmailContent') {
			console.log('background.js: sendEmailContent request receieved.')

            chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];

                    chrome.tabs.sendMessage(activeTab.id, { 
                        action: 'sendEmailContent',
						content: request.content
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error("background.js: ", chrome.runtime.lastError.message);
                            sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ status: 'success', contentScriptResponse: response });
                        }
                    });
                } else {
                    alert("Please open dashboard");
                    console.warn('side_panel.js : no active tab found to send message to.');
                    sendResponse({ status: 'failed', error: 'No active tab found' });
                }
            });

		}
	}
	else {
    	console.warn('background.js: request receieved from external source - ', request, sender);
	}
  });
