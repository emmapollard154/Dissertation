/**
 * @fileoverview Service worker for chrome extension.
 * @file background.js
 * @author Emma Pollard
 * @version 1.0
 */

/**
 * Port on which User A dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_FRONTEND = 5173;
/**
 * Chrome extension ID.
 * @global
 * @type {String}
 * @deprecated since version 1.0. Must be updated.
 */
const EXTENSION_ID = 'bcdjfglkdcfeeekbkhbambhhjgdllcom'; // TEMPORARY

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }) // Set side panel behaviour
  .then(() => console.log('background.js: side panel behaviour set.'))
  .catch((error) => console.error('background.js: error setting side panel behaviour: ', error));

chrome.action.onClicked.addListener( async (tab) => { // Open dashboard when extension opened
	console.log(`background.js: extension clicked. Opening dashboard in new tab.`);
	setNums(0,0); // initialise number of pending actions and updates
	chrome.sidePanel.open({ tabId: tab.id }) // open side panel	
		.then(() => { console.log('background.js: side panel opened successfully for tab ID:', tab.id); })
		.catch((error) => { console.error('Error opening side panel:', error); });
	chrome.tabs.create({ url: `http://localhost:${A_FRONTEND}` })
		.then((newTab) => { console.log('background.js: new tab opened successfully:', newTab.url); })
		.catch((error) => { console.error('background.js: error opening new tab:', error); });
});

/**
 * Get URL of the active tab and send to dashboard.
 */
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0) {
			var activeTab = tabs[0]; // current tab
			if (activeTab.url === undefined) {
				console.warn('background.js: active tab URL is undefined');
			} else if (activeTab.url === 'chrome://newtab/') { // pass
			} else {
				var url = new URL(activeTab.url);
				timestamp = new Date().toISOString();
				console.log('background.js: sending url to dashboard.');
                chrome.runtime.sendMessage({ action: 'sendUrlToDashboard', newUrlMessage: [url,  timestamp] }); // send data to User A dashboard
			}
		}
	});
}

/**
 * Switch to or create dashboard tab.
 */
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

/**
 * Set the number of pending requests and updates.
 * @param {Number} pending The number of unresolved actions.
 * @param {Number} updates The number of updates for User A.
 */
function setNums(pending, updates) {
	if (pending >= 0) {
		chrome.storage.local.set({ 'NUM_PENDING': pending }, function() {
		console.log('background.js: initialising NUM_PENDING to ', pending);
		});
	}
    chrome.storage.local.set({ 'NUM_UPDATES': updates }, function() {
    console.log('background.js: initialising NUM_UPDATES to ', updates);
    });
}

chrome.runtime.onMessage.addListener( // listener for messages from external web pages
  function(request, sender, sendResponse) {
	if (sender.id === EXTENSION_ID) { // message from side panel
		console.log('background.js: request receieved from side panel.');
		if (request.action === 'sendHelpMessage') { // automatic message to User B
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
	else if (request.action === 'sendEmailContent') { // forward email content to User B
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
	else { // unexpected message
    	console.warn('background.js: request receieved from external source - ', request, sender);
	}
  });


chrome.tabs.onUpdated.addListener(function (changeInfo) { // event listener for tab updates
	if (changeInfo.status === 'complete') {
		getActiveTabUrl();
	}
});

chrome.runtime.onMessage.addListener(function(request) { // event listener to open dashboard
    if (request.action === 'openDashboard') {
		openDashboard();
	}
});

chrome.runtime.onMessageExternal.addListener( // listener for messages from User A dashboard
  function(request, sender, sendResponse) {
    const allowedOrigins = [`http://localhost:${A_FRONTEND}`];
    if (!allowedOrigins.includes(new URL(sender.url).origin)) {
      console.warn('background.js: blocked message from unauthorized origin:' , sender.url);
      return false;
    }
    if (request.type === 'NUM_PENDING') { // update number of pending requests
		chrome.runtime.sendMessage({ action: 'updateNumPending' });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
    if (request.type === 'ADD_TRUSTED') { // add a trusted contact
		chrome.runtime.sendMessage({ action: 'addTrustedContact' , address: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}

    if (request.type === 'REMOVE_TRUSTED') { // remove a trusted contact
		chrome.runtime.sendMessage({ action: 'removeTrustedContact' , address: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
    if (request.type === 'USER_B_MESSAGE') { // message from User B
		chrome.runtime.sendMessage({ action: 'updateNumUpdates' });
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
    if (request.type === 'EMAIL_SETTINGS') { // set email settings
		chrome.runtime.sendMessage({ action: 'setEmailSettings' , settings: request.payload});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
    if (request.type === 'USER_B_RESPONSE') { // request response from User B
		chrome.runtime.sendMessage({ action: 'userBResponse' , outcome: request.payload.outcome , url: request.payload.url});
		sendResponse({ status: 'success', message: 'background.js: data receieved by extension.' });
		return true;
	}
  }
);

console.log('background.js: starting service worker');