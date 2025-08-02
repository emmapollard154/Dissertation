// sidepanel.js: script for side panel html

const A_FRONTEND = 5173;
const EMAIL_PORT = 5174;

const EMAIL_ANNOUNCEMENT = 'Do you trust the sender?\n\nAre you being asked to give away personal information?\n\nUnsure? Ask User B (click below)';

const CHOICE_SPEECH = new Map([
    ['1', 'You chose to click on an email link without informing User B.'],
    ['2', 'You chose to click on an email link. User B will be able to see the link you clicked.'],
    ['3', 'Waiting for User B to accept or reject clicking on this link. If User B rejects the action, you can try again.\n\nWould it help to message User B with more detail?'],
    ['4', 'Waiting for User B to accept or reject clicking on this link. If User B rejects the action, the action will be blocked.\n\nWould it help to message User B with more detail?'],
    ['5', 'You chose to block this action independently.'],
]);


// Function to set 'update' in button
function setUpdate(btn) {
    const button = document.getElementById(btn);
    if (button) {
        button.classList.add('update');
        console.log(`side_panel.js: added update class for ${btn}.`)
    } else {
        console.error(`side_panel.js: ${btn} not found.`)
    }
}

// Function to reset 'update' in button
function removeUpdate(btn) {
    const button = document.getElementById(btn);
    if (button && button.classList.contains('update')) {
        button.classList.remove('update');
        console.log(`side_panel.js: removed update class for ${btn}.`)
    } else if (!button.classList.contains('update')) {
        console.log(`side_panel.js: ${btn} does not contain 'update' class.`)
    } else {
        console.error(`side_panel.js: ${btn} not found.`)
    }
}

// Function to alert user of new update
function statusAlert() {
    document.getElementById('speechContent').innerText = 'You have an update!';
    setUpdate('statBtn');
}

// Function to alert user of new message
function messageAlert() {
    document.getElementById('speechContent').innerText = 'You have a new message!';
    setUpdate('statBtn');
}

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

// Function to get email settings
async function getEmailSettings() {
    try {
        const result = await getStorageData(['EMAIL_SETTINGS']);
        const emailSettings = result.EMAIL_SETTINGS;
        console.log('getEmailSettings: ', emailSettings);
        return emailSettings;
    } catch (error) {
        console.error('content_email.js: error retrieving EMAIL_SETTINGS: ', error);
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
        console.log('side_panel.js: setting NUM_PENDING to ', newPending);
        });
    }

    chrome.storage.local.set({ 'NUM_UPDATES': newUpdate }, function() {
    console.log('side_panel.js: setting NUM_UPDATES to ', newUpdate);
    });
}

// Function to update the number of pending requests and modify number of updates
async function updateNumPending(newPending) {

    try {
        const oldPending = await getNumPending();
        const oldUpdates = await getNumUpdates();

        if (oldPending > newPending) { // a request has been resolved
            setNums(newPending, oldUpdates + 1);
            statusAlert(); // send alert to User A
        } else {
            setNums(newPending, oldUpdates);
        }

    } catch (error) {
        console.error('side_panel.js: error extracting values for pending/updates: ', error);
    }
}

// Function to add an update
async function addUpdate() {
    console.log('side_panel.js: adding an update.')
    try {
        const oldUpdates = await getNumUpdates();
        const newUpdates = oldUpdates + 1;
        setNums(-1, newUpdates);
    } catch (error) {
        console.error('side_panel.js: error extracting values for pending/updates: ', error);
    }
}

// Function to send message to email content script
async function sendToEmail(message) {
    const url = `http://localhost:${EMAIL_PORT}/`
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            console.log(url);
            console.log(tab.url);
            if (tab.url && tab.url === url) {
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, {
                        action: 'emailSettings', 
                        message: message
                }); 
                    console.log('side_panel.js: received response from email content script: ', response);
                } catch (error) {
                    console.error(`side_panel.js: error sending message to tab ${tab.id}: `, error);
                }
            }
        }
    } catch (error) {
        console.error('side_panel.js: error querying tabs: ', error);
    }
}

// Create listener for tab events
chrome.tabs.onActivated.addListener(active => {

    const id = active.tabId;

    chrome.tabs.get(id, (tab) => {
        if (chrome.runtime.lastError) {
        console.error("side_panel.js: error getting tab info - ", chrome.runtime.lastError.message);
        return;
        }

        // Refresh tabs for specific URLs to correctly configure content
        if (tab.url) {

            if (tab.url.startsWith(`http://localhost:${EMAIL_PORT}/`)) {
                // send message to the content script in the active tab
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionLoaded',
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.error("side_panel.js: ", chrome.runtime.lastError.message);
                    }
                });
            }

        }
    });
});

// Create listener for events on side panel
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    if (message.action === 'updateNumPending') {
        console.log('side_panel.js: updateNumPending received.')
        addUpdate();
        statusAlert();
    }

    if (message.action === 'updateNumUpdates') {
        console.log('side_panel.js: updateNumUpdates received.')
        addUpdate();
        messageAlert();
    }

    if (message.action === 'setEmailSettings') {
        console.log('side_panel.js: setEmailSettings received.')
        chrome.storage.local.set({ 'EMAIL_SETTINGS' : message.settings }, function() {
            console.log('content_email.js: setting EMAIL_SETTINGS to ', message.settings );
        });
        const emailSettings = getEmailSettings();
        emailSettings.then(function(result) {
            console.log(result);
        })
        .catch(function(error) {
            console.error('side_panel.js: request to get EMAIL_SETTINGS rejected: ', error);
        });
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
                            console.error("side_panel.js: ", chrome.runtime.lastError.message);
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

            if (urlReceived === `http://localhost:${EMAIL_PORT}/`) { // on email webpage

                document.getElementById('speechContent').innerText = EMAIL_ANNOUNCEMENT;

                chrome.tabs.query({ url: `http://localhost:${EMAIL_PORT}/*` }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        const activeTab = tabs[0];

                        // send message to the content script in the active tab
                        chrome.tabs.sendMessage(activeTab.id, {
                            action: 'onEmailPage',
                        }, function() {
                            if (chrome.runtime.lastError) {
                                console.error("side_panel.js: ", chrome.runtime.lastError.message);
                            }
                        });
                    } else {
                        alert("Please open dashboard");
                        console.warn('side_panel.js: no active tab found to send message to.');
                        sendResponse({ status: 'failed', error: 'No active tab found' });
                    }
                });
            } else {
                document.getElementById('speechContent').innerText = '';
            }
            return true;
        } else {
            document.getElementById('speechContent').innerText = 'Press ? in the top right corner of the dashboard for help';
            setNums(-1, 0); // clear updates
            removeUpdate('statBtn');
        }
    }

    if (message.action === 'sendChoiceToDashboardA') {

        const id = message.id;
        const choice = message.choice;
        const time = message.time;
        const url = message.url;

        chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];

                // send message to the content script in the active tab
                chrome.tabs.sendMessage(activeTab.id, {
                    action: 'emailAChoice',
                    id: id,
                    choice: choice,
                    time: time,
                    url: url
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("side_panel.js: ", chrome.runtime.lastError.message);
                        sendResponse({ status: 'failed', error: chrome.runtime.lastError.message });
                    } else {
                        sendResponse({ status: 'success', contentScriptResponse: response });
                    }
                });
            } else {
                alert("Please open dashboard");
                console.warn('side_panel.js: no active tab found to send message to.');
                sendResponse({ status: 'failed', error: 'No active tab found' });
            }
        });
    }    

    if (message.action === 'displaySpeechContent') {
        const choice = message.choice;
        console.log('side_panel.js: updating speech bubble content (chosen ' , choice, ').');
        document.getElementById('speechContent').innerText = CHOICE_SPEECH.get(choice);
    }

    if (message.action === 'displaySpeechResponse') {
        const choice = message.choice;
        const outcome = message.outcome;
        const url = message.url;

        console.log('side_panel.js: updating speech bubble content (chosen ' , choice, ' outcome ', outcome, ').');

        if (choice === '3') {
            if (outcome === 'Y') {

                document.getElementById('speechContent').innerText = 'User B accepted request to click on link: ';
                const link = document.createElement('a'); // create clickable link in side panel
                link.href = url;
                link.textContent = url;
                link.target = '_blank';
                speechContent.appendChild(link);

            }
            if (outcome === 'N') {
                document.getElementById('speechContent').innerText = 'User B rejected request to click on link: ' + url + '. You can ask again if you want to.';
            }
        }
        if (choice === '4') {
            if (outcome === 'Y') {

                document.getElementById('speechContent').innerText = 'User B accepted request to click on link: ';
                const link = document.createElement('a'); // create clickable link in side panel
                link.href = url;
                link.textContent = url;
                link.target = '_blank';
                speechContent.appendChild(link);

            }
            if (outcome === 'N') {
                document.getElementById('speechContent').innerText = 'User B rejected request to click on link: ' + url + '. This link will stay blocked.';
            }
        }
    }

    if (message.action === 'userBResponse') {
        console.log('side_panel.js: sending response to email webpage - ', message);

        const url = message.url;
        const outcome = message.outcome;

        console.log('side_panel.js: updating speech bubble content (action ' , url, ' outcome ', outcome, ').');

        chrome.tabs.query({ url: `http://localhost:${EMAIL_PORT}/*` }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];

                // send message to the content script in the active tab
                chrome.tabs.sendMessage(activeTab.id, {
                    action: 'userBResponse',
                    outcome: message.outcome,
                    url: message.url
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.error("side_panel.js: ", chrome.runtime.lastError.message);
                    }
                });
            } else {
                alert("Please open dashboard");
                console.warn('side_panel.js: no active tab found to send message to.');
                sendResponse({ status: 'failed', error: 'No active tab found' });
            }
        });
    }

});

// Clear updates when dashboard accessed
document.getElementById('dashBtn').addEventListener('click', async function() {
    setNums(-1, 0);
    removeUpdate('statBtn');
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

document.getElementById('statBtn').addEventListener('click', async function() {
    setNums(-1, 0);
    removeUpdate('statBtn');
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

document.getElementById('msgBtn').addEventListener('click', async function() {
    // TO DO: send generic message to user b
    chrome.runtime.sendMessage({ action: "sendHelpMessage"});
});


