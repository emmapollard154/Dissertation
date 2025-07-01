// sidepanel.js (script for side panel html)

const DASHBOARD_A_LOCATION = "http://localhost:5173/";
const EMAIL_ENV = "http://localhost:5174/";
const EMAIL_ANNOUNCEMENT = "You are on the email webpage";

function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function(result) {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(result);
        });
    });
}

async function getNumPending() {
    try {
        const result = await getStorageData(['NUM_PENDING']);
        const numPending = result.NUM_PENDING;
        return numPending;
    } catch (error) {
        console.error('Error retrieving NUM_PENDING:', error);
        throw error;
    }
}

async function getNumUpdates() {
    try {
        const result = await getStorageData(['NUM_UPDATES']);
        const numUpdates = result.NUM_UPDATES;
        return numUpdates;
    } catch (error) {
        console.error('Error retrieving NUM_UPDATES:', error);
        throw error;
    }
}

// Function to set the number of pending requests and updates
function setNums(newPending, newUpdate) {

    if (newPending >= 0) {
        chrome.storage.local.set({ 'NUM_PENDING': newPending }, function() {
        console.log('Setting NUM_PENDING to ', newPending);
        });
    }

    chrome.storage.local.set({ 'NUM_UPDATES': newUpdate }, function() {
    console.log('Setting NUM_UPDATES to ', newUpdate);
    });
}

// function updateAlert() {

// }

async function updateNumPending(newPending) {

    try {
        const oldPending = await getNumPending();
        const oldUpdates = await getNumUpdates();

        console.log("side_panel.js: received number pending: ", newPending);
        document.getElementById("numPending").innerHTML = newPending + " Pending Requests";

        if (oldPending > newPending) { // a request has been resolved
            setNums(newPending, oldUpdates + 1);
            updateAlert(); // send alert to User A
            try {
                const newUpdates = await getNumUpdates();
                document.getElementById("numUpdates").innerHTML = newUpdates + " Updates";
            } catch (error) {
                console.error('Error extracting value for new updates:', error);
            }
        } else {
            document.getElementById("numUpdates").innerHTML = oldUpdates + " Updates";
            setNums(newPending, oldUpdates);
        }

    } catch (error) {
        console.error('Error extracting values for pending/updates:', error);
    }
}

document.getElementById('dashBtn').addEventListener('click', async function() {
    setNums(-1, 0);
});

document.getElementById('numUpdates').addEventListener('click', async function() {
    setNums(-1, 0);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("side_panel received message type:", message.action);

    if (message.action === 'updateNumPending') {
        updateNumPending(message.numPending);
    }

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
            return true;
        } else {
            console.log(`On dashboard A at ${DASHBOARD_A_LOCATION}`);
            setNums(-1, 0);
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

