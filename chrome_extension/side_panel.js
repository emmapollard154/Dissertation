// sidepanel.js (script for side panel html)

const DASHBOARD_A_LOCATION = "http://localhost:5173/";
const EMAIL_ENV = "http://localhost:5174/";
const EMAIL_ANNOUNCEMENT = "You are on the email webpage";

document.getElementById('dashBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("side_panel received message type:", message.action);


    if (message.action === 'sendUrlToDashboard') {

        const urlReceived =  message.newUrlMessage[0];
        const timeReceived =  message.newUrlMessage[1];

        if (urlReceived != DASHBOARD_A_LOCATION) {

            const browserData = {
                newUrl:  urlReceived,
                newTime: timeReceived,
            };

            chrome.tabs.query({ url: "http://localhost:5173/*" }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];
                    console.log('side_panel: Sending message to content script in tab:', activeTab.id);

                    // send message to the content script in the active tab
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'browsingHistoryUpdate',
                        data: browserData
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error('side_panel: Error sending message to content script:', chrome.runtime.lastError.message);
                            sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                        } else {
                            console.log('side_panel: Content script responded:', response);
                            sendResponse({ status: 'success', contentScriptResponse: response });
                        }
                    });
                } else {
                    console.warn('side_panel: No active tab found to send message to.');
                    sendResponse({ status: 'failed', error: 'No active tab found' });
                }
            });

            if (urlReceived === EMAIL_ENV) {
                console.log("On email webpage");
                document.getElementById('speechContent').innerText = EMAIL_ANNOUNCEMENT;

                chrome.tabs.query({ url: "http://localhost:5174/*" }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        const activeTab = tabs[0];
                        console.log('side_panel: Sending message to content script in tab:', activeTab.id);

                        // send message to the content script in the active tab
                        chrome.tabs.sendMessage(activeTab.id, {
                            action: 'clickedOnEmail',
                            // data: browserData
                        }, function(response) {
                            if (chrome.runtime.lastError) {
                                console.error('side_panel: Error sending message to content script:', chrome.runtime.lastError.message);
                                sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                            } else {
                                console.log('side_panel: Content script responded:', response);
                                sendResponse({ status: 'success', contentScriptResponse: response });
                            }
                        });
                    } else {
                        console.warn('side_panel: No active tab found to send message to.');
                        sendResponse({ status: 'failed', error: 'No active tab found' });
                    }
                });
            } else {
                document.getElementById('speechContent').innerText = "";
            }

            return true; // sendResponse is called asynchronously
        } else {
            console.log(`On dashboard A at ${EMAIL_ENV}`)
        }
    }


    if (message.action === 'sendChoiceToDashboardA') {

        const id = message.id;
        const choice = message.choice;
        const time = message.time;

        chrome.tabs.query({ url: "http://localhost:5173/*" }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                console.log('side_panel: Sending message to content script in tab:', activeTab.id);

                // send message to the content script in the active tab
                chrome.tabs.sendMessage(activeTab.id, {
                    action: 'emailAChoice',
                    id: id,
                    // data: choice
                    choice: choice,
                    time: time
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('side_panel: Error sending message to content script:', chrome.runtime.lastError.message);
                        sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                    } else {
                        console.log('side_panel: Content script responded:', response);
                        sendResponse({ status: 'success', contentScriptResponse: response });
                    }
                });
            } else {
                console.warn('side_panel: No active tab found to send message to.');
                sendResponse({ status: 'failed', error: 'No active tab found' });
            }
        });
    }    
});

