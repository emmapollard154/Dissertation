// sidepanel.js: script for side panel html

const A_FRONTEND = 5173;
const EMAIL_PORT = 5174;
const EMAIL_ANNOUNCEMENT = 'You are on the email webpage';

// Function to get stored data (updates and pending requests)
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

// Function to get the number of pending requests
async function getNumPending() {
    try {
        const result = await getStorageData(['NUM_PENDING']);
        const numPending = result.NUM_PENDING;
        return numPending;
    } catch (error) {
        console.error('side_panel.js: error retrieving NUM_PENDING: ', error);
        throw error;
    }
}

// Function to get the number of updates
async function getNumUpdates() {
    try {
        const result = await getStorageData(['NUM_UPDATES']);
        const numUpdates = result.NUM_UPDATES;
        return numUpdates;
    } catch (error) {
        console.error('side_panel.js: error retrieving NUM_UPDATES: ', error);
        throw error;
    }
}

// Function to set the number of pending requests and updates
function setNums(newPending, newUpdate) {

    if (newPending >= 0) { // leave unchanged if negative input supplied
        chrome.storage.local.set({ 'NUM_PENDING': newPending }, function() {
        console.log('Setting NUM_PENDING to ', newPending);
        });
    }

    chrome.storage.local.set({ 'NUM_UPDATES': newUpdate }, function() {
    console.log('Setting NUM_UPDATES to ', newUpdate);
    });
}

// Function to update the number of pending requests and modify number of updates
async function updateNumPending(newPending) {

    try {
        const oldPending = await getNumPending();
        const oldUpdates = await getNumUpdates();

        document.getElementById('numPending').innerHTML = newPending + ' Pending Request(s)';

        if (oldPending > newPending) { // a request has been resolved
            setNums(newPending, oldUpdates + 1);
            alertUser(); // send alert to User A
            try {
                const newUpdates = await getNumUpdates();
                document.getElementById('numUpdates').innerHTML = newUpdates + ' Updates';
            } catch (error) {
                console.error('side_panel.js: error extracting value for new updates: ', error);
            }
        } else {
            document.getElementById('numUpdates').innerHTML = oldUpdates + ' Updates';
            setNums(newPending, oldUpdates);
        }

    } catch (error) {
        console.error('side_panel.js: error extracting values for pending/updates: ', error);
    }
}

// Clear updates when dashboard accessed
document.getElementById('dashBtn').addEventListener('click', async function() {
    setNums(-1, 0);
});
document.getElementById('numUpdates').addEventListener('click', async function() {
    setNums(-1, 0);
});

// Function to add an update
async function addUpdate() {
    console.log('side_panel.js: adding an update.')
    try {
        const oldUpdates = await getNumUpdates();
        const newUpdates = oldUpdates + 1;
        setNums(-1, newUpdates);
        document.getElementById('numUpdates').innerHTML = newUpdates + ' Updates';
    } catch (error) {
        console.error('side_panel.js: error extracting values for pending/updates: ', error);
    }
}

// Function to alert user of new update
function alertUser() {
    console.log("placeholder alertUser")
}

// Create listener for events on side panel
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    if (message.action === 'updateNumPending') {
        updateNumPending(message.numPending);
    }

    if (message.action === 'updateNumUpdates') {
        console.log('side_panel.js: updateNumUpdates recieved.')
        addUpdate();
        alertUser();
    }

    if (message.action === 'sendUrlToDashboard') {

        const urlReceived =  message.newUrlMessage[0];
        const timeReceived =  message.newUrlMessage[1];

        if (urlReceived != `http://localhost:${A_FRONTEND}/`) { // ignore dashboard in browsing history

            const browserData = {
                newUrl:  urlReceived,
                newTime: timeReceived,
            };

            chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];

                    // send message to the content script in the active tab
                    chrome.tabs.sendMessage(activeTab.id, { 
                        action: 'browsingHistoryUpdate',
                        data: browserData
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error('side_panel.js: error sending message to content script: ', chrome.runtime.lastError.message);
                            sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ status: 'success', contentScriptResponse: response });
                        }
                    });
                } else {
                    console.warn('side_panel.js : no active tab found to send message to.');
                    sendResponse({ status: 'failed', error: 'No active tab found' });
                }
            });

            if (urlReceived === `http://localhost:${EMAIL_PORT}/`) { // on email webpage

                document.getElementById('speechContent').innerText = EMAIL_ANNOUNCEMENT;

                chrome.tabs.query({ url: `http://localhost:${EMAIL_PORT}/*` }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        const activeTab = tabs[0];

                        // send message to the content script in the active tab
                        chrome.tabs.sendMessage(activeTab.id, {
                            action: 'onEmailPage',
                        }, function(response) {
                            if (chrome.runtime.lastError) {
                                console.error('side_panel.js: error sending message to content script: ', chrome.runtime.lastError.message);
                                sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                            } else {
                                sendResponse({ status: 'success', contentScriptResponse: response });
                            }
                        });
                    } else {
                        console.warn('side_panel.js: no active tab found to send message to.');
                        sendResponse({ status: 'failed', error: 'No active tab found' });
                    }
                });
            } else {
                document.getElementById('speechContent').innerText = "";
            }
            return true;
        } else {
            setNums(-1, 0); // clear updates
        }
    }

    if (message.action === 'sendChoiceToDashboardA') {

        const id = message.id;
        const choice = message.choice;
        const time = message.time;

        chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];

                // send message to the content script in the active tab
                chrome.tabs.sendMessage(activeTab.id, {
                    action: 'emailAChoice',
                    id: id,
                    choice: choice,
                    time: time
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('side_panel.js: error sending message to content script: ', chrome.runtime.lastError.message);
                        sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                    } else {
                        sendResponse({ status: 'success', contentScriptResponse: response });
                    }
                });
            } else {
                console.warn('side_panel.js: no active tab found to send message to.');
                sendResponse({ status: 'failed', error: 'No active tab found' });
            }
        });
    }    
});

