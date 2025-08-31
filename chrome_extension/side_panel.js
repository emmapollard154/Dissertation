/**
 * @fileoverview Script to manage chrome extension side panel.
 * @file side_panel.js
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
 * Port on which email webpage frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const EMAIL_PORT = 5174;

/**
 * Mapping between chosen option and side panel speech content.
 * @global
 * @type {Map}
 */
const CHOICE_SPEECH = new Map([
    ['1', 'You chose to click on an email link without informing User B.'],
    ['2', 'You chose to click on an email link. User B will be able to see the link you clicked.'],
    ['3', 'User B needs to accept this request in order to proceed. If User B rejects the action, you can try again.\n\nWould it help to message User B with more detail?'],
    ['4', 'User B needs to accept this request in order to proceed.\n\nWould it help to message User B with more detail?'],
    ['5', 'You chose to block this action independently.'],
]);

/**
 * Set an update for a side panel button.
 * @param {String} btn ID for button element.
 */
function setUpdate(btn) {
    const button = document.getElementById(btn);
    if (button) {
        button.classList.add('update');
        console.log(`side_panel.js: added update class for ${btn}.`)
    } else {
        console.error(`side_panel.js: ${btn} not found.`)
    }
}

/**
 * Reset updates to zero for a side panel button.
 * @param {String} btn ID for button element.
 */
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

/*
Code adapted from:
Chrome Extension Data Persistence Methods; 
Google Gemini; 
2025;  
Available from: https://gemini.google.com/share/00bac19789a3; 
Accessed 2 August 2025.
*/  
/**
 * Get data from local chrome storage.
 * @param {String} keys Key to identify targeted data.
 * @returns {Promise<result>} A promise that resolves with successful collection.
 */
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

/**
 * Get number of pending requests.
 * @returns {Number} The number of pending requests.
 * @throws {Error} If the number of pending requests cannot be retrieved.
 */
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

/**
 * Get email settings.
 * @returns {Array} The allowed and blocked email settings.
 * @throws {Error} If the email settings cannot be retrieved.
 */
async function getEmailSettings() {
    try {
        const result = await getStorageData(['EMAIL_SETTINGS']);
        const emailSettings = result.EMAIL_SETTINGS;
        return emailSettings;
    } catch (error) {
        console.error('content_email.js: error retrieving EMAIL_SETTINGS: ', error);
        throw error;
    }
}

/**
 * Get trusted contacts.
 * @returns {Array} The trusted email addresses.
 * @throws {Error} If the trusted contacts cannot be retrieved.
 */
async function getTrustedContacts() {
    try {
        const result = await getStorageData(['TRUSTED_CONTACTS']);
        const trustedContacts = result.TRUSTED_CONTACTS;
        return trustedContacts;
    } catch (error) {
        console.error('content_email.js: error retrieving TRUSTED_CONTACTS: ', error);
        throw error;
    }
}

/**
 * Get number of updates.
 * @returns {Number} The number of updates.
 * @throws {Error} If the number of updates cannot be retrieved.
 */
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

/**
 * Set the number of pending requests and updates.
 * @param {Number} newPending The number of unresolved actions.
 * @param {Number} newUpdate The number of updates for User A.
 */
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

/**
 * Update the number of pending requests and modify number of updates.
 * @param {Number} newPending The number of unresolved actions.
 */
async function updateNumPending(newPending) {
    try {
        const oldPending = await getNumPending();
        const oldUpdates = await getNumUpdates();
        if (oldPending > newPending) { // a request has been resolved
            setNums(newPending, oldUpdates + 1);
            setUpdate('statBtn'); // send alert to User A
        } else {
            setNums(newPending, oldUpdates);
        }
    } catch (error) {
        console.error('side_panel.js: error extracting values for pending/updates: ', error);
    }
}

/**
 * Add an update.
 */
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

chrome.tabs.onActivated.addListener(active => { // listener for tab events
    const id = active.tabId;
    chrome.tabs.get(id, (tab) => {
        if (chrome.runtime.lastError) {
        console.error("side_panel.js: error getting tab info - ", chrome.runtime.lastError.message);
        return;
        }
        if (tab.url) { // refresh tabs for specific URLs
            if (tab.url.startsWith(`http://localhost:${EMAIL_PORT}/`)) { // send message to the content script in the active tab
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionLoaded',
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('side_panel.js: ', chrome.runtime.lastError.message);
                    }
                });
            }
        }
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { // listener for events on side panel
    if (message.action === 'updateNumPending') { // update number of pending requests
        console.log('side_panel.js: updateNumPending received.')
        addUpdate();
        setUpdate('statBtn');
    }
    if (message.action === 'updateNumUpdates') { // update number of updates
        console.log('side_panel.js: updateNumUpdates received.')
        addUpdate();
        setUpdate('statBtn');
    }
    if (message.action === 'setEmailSettings') { // set email settings
        console.log('side_panel.js: setEmailSettings received.')
        chrome.storage.local.set({ 'EMAIL_SETTINGS' : message.settings }, function() {
            console.log('content_email.js: setting EMAIL_SETTINGS to ', message.settings );
        });
        const emailSettings = getEmailSettings();
        emailSettings.then(function(result) {
            console.log('side_panel.js: email settings retrieved ', result);
        })
        .catch(function(error) {
            console.error('side_panel.js: request to get EMAIL_SETTINGS rejected: ', error);
        });
    }
    if (message.action === 'addTrustedContact') { // add a trusted contact
        console.log('side_panel.js: addTrustedContact received: ', message.address);
        let trustedContacts = getTrustedContacts();
        trustedContacts.then(function(result) {
            console.log('side_panel.js: trusted contacts retrieved ', result);
            if (!result.includes(message.address)) {
                result.push(message.address);
                chrome.storage.local.set({ 'TRUSTED_CONTACTS' : result }, function() {
                    console.log('side_panel.js: setting TRUSTED_CONTACTS to ', result );
                });
            }
            else {
                console.log('side_panel.js: trusted contacts already includes address', message.address);
            }
        })
        .catch(function(error) {
            console.error('side_panel.js: request to get EMAIL_SETTINGS rejected: ', error);
        });
    }
    if (message.action === 'removeTrustedContact') { // remove a trusted contact
        console.log('side_panel.js: removeTrustedContact received: ', message.address);
        let trustedContacts = getTrustedContacts();
        trustedContacts.then(function(result) {
            console.log('side_panel.js: trusted contacts retrieved ', result);
            if (result.includes(message.address)) {
                removed = result.filter(address => address !== message.address);
                chrome.storage.local.set({ 'TRUSTED_CONTACTS' : removed }, function() {
                    console.log('side_panel.js: setting TRUSTED_CONTACTS to ', removed );
                });
            } else {
                console.log('side_panel.js: removing address that does not exist', message.address);
            }
        })
        .catch(function(error) {
            console.error('side_panel.js: request to get EMAIL_SETTINGS rejected: ', error);
        });
    }
    if (message.action === 'sendUrlToDashboard') { // update User A browsing history
        const urlReceived =  message.newUrlMessage[0];
        const timeReceived =  message.newUrlMessage[1];
        if (urlReceived != `http://localhost:${A_FRONTEND}/`) { // ignore dashboard
            const browserData = {
                newUrl:  urlReceived,
                newTime: timeReceived,
            };
            chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, { // send message to the content script in the active tab
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
                document.getElementById('speechContent').innerText = 'Do you trust the sender?\n\nAre you being asked to give away personal information?\n\nUnsure? Ask User B (click below)';
                chrome.tabs.query({ url: `http://localhost:${EMAIL_PORT}/*` }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        const activeTab = tabs[0];
                        chrome.tabs.sendMessage(activeTab.id, { // send message to the content script in the active tab
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
    if (message.action === 'sendChoiceToDashboardA') { // send User A choice to dashboard
        const id = message.id;
        const choice = message.choice;
        const time = message.time;
        const url = message.url;
        chrome.tabs.query({ url: `http://localhost:${A_FRONTEND}/*` }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, { // send message to the content script in the active tab
                    action: 'emailAChoice',
                    id: id,
                    choice: choice,
                    time: time,
                    url: url
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('side_panel.js: ', chrome.runtime.lastError.message);
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
    if (message.action === 'displaySpeechContent') { // update side panel speech bubble
        const choice = message.choice;
        console.log('side_panel.js: updating speech bubble content (chosen ' , choice, ').');
        document.getElementById('speechContent').innerText = CHOICE_SPEECH.get(choice);
    }
    if (message.action === 'displayIfTrusted') { // display if email is from a trusted contact
        console.log('side_panel.js: updating speech bubble content (trusted contact).');
        const trusted = message.trusted;
        if (trusted) {
            document.getElementById('speechContent').innerText = 'This email is from someone in your trusted contacts.';
        }
        else {
            document.getElementById('speechContent').innerText = 'This email is not from someone in your trusted contacts.';
        }
    }
    if (message.action === 'displaySpeechResponse') { // update speech bubble when User B responds
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
    if (message.action === 'userBResponse') { // response received from User B
        console.log('side_panel.js: sending response to email webpage - ', message);
        const url = message.url;
        const outcome = message.outcome;
        console.log('side_panel.js: updating speech bubble content (action ' , url, ' outcome ', outcome, ').');
        chrome.tabs.query({ url: `http://localhost:${EMAIL_PORT}/*` }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, { // send message to the content script in the active tab
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

document.getElementById('dashBtn').addEventListener('click', async function() { // clear updates when dashboard opened
    setNums(-1, 0);
    removeUpdate('statBtn');
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

document.getElementById('statBtn').addEventListener('click', async function() { // clear updates when dashboard accessed
    setNums(-1, 0);
    removeUpdate('statBtn');
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

document.getElementById('msgBtn').addEventListener('click', async function() { // send automatic message to User B
    chrome.runtime.sendMessage({ action: "sendHelpMessage"});
});
