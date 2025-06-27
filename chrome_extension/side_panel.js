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
        console.log('NUM_PENDING retrieved: ' + numPending);
        return numPending; // This will now return the value directly
    } catch (error) {
        console.error('Error retrieving NUM_PENDING:', error);
        throw error; // Re-throw or handle the error as appropriate
    }
}

async function getNumUpdates() {
    try {
        const result = await getStorageData(['NUM_UPDATES']);
        const numUpdates = result.NUM_UPDATES;
        console.log('NUM_UPDATES retrieved: ' + numUpdates);
        return numUpdates; // This will now return the value directly
    } catch (error) {
        console.error('Error retrieving NUM_UPDATES:', error);
        throw error; // Re-throw or handle the error as appropriate
    }
}



async function updateNumPending(newPending) {

    try {
        const oldPending = await getNumPending();
        const oldUpdates = await getNumUpdates();
        console.log('Old number pending:', oldPending);
        console.log('Old number updates:', oldUpdates);

        console.log("side_panel.js: received number pending: ", newPending);
        document.getElementById("numPending").innerHTML = newPending + " Pending Requests";

        if (oldPending < newPending) { // a request has been resolved
            console.log("Number of pending requests has reduced")
            setNums(newPending, oldUpdates + 1);

            try {
                const newUpdates = await getNumUpdates();
                console.log('New number updates:', newUpdates);
                document.getElementById("numUpdates").innerHTML = newUpdates + " Updates";
            } catch (error) {
                console.error('Error extracting value for new updates:', error);
            }

        }

    } catch (error) {
        console.error('Error extracting values for pending/updates:', error);
    }
}





// Function to set the number of pending requests and updates
function setNums(newPending, newUpdate) {

    chrome.storage.local.set({ 'NUM_PENDING': newPending }, function() {
    console.log('Setting NUM_PENDING to ', newPending);
    });

    chrome.storage.local.set({ 'NUM_UPDATES': newUpdate }, function() {
    console.log('Setting NUM_UPDATES to ', newUpdate);
    });
}

// // Function to retrieve the number of pending requests
// function getNumPending() {
//     chrome.storage.local.get(['NUM_PENDING'], function(result) {
//     console.log('NUM_PENDING retrieved: ' + result.NUM_PENDING);
//     return result.NUM_PENDING;
//     });
// }

// // Function to retrieve the number of updates
// function getNumUpdates() {
//     chrome.storage.local.get(['NUM_UPDATES'], function(result) {
//     console.log('NUM_UPDATES retrieved: ' + result.NUM_UPDATES);
//     return result.NUM_UPDATES;
//     });
// }


document.getElementById('dashBtn').addEventListener('click', function() {
    NUM_UPDATES = 0; // clear updates
    chrome.runtime.sendMessage({ action: "openDashboard"});
});

document.getElementById('numUpdates').addEventListener('click', function() {
    NUM_UPDATES = 0; // clear updates
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

    if (message.action === 'updateNumPending') {

        updateNumPending(message.numPending);

        // const currUpdates = getNumUpdates();
        // const oldPending = getNumPending();
        // const newPending =  message.numPending;
        // console.log("side_panel.js: received number pending: ", newPending);
        // document.getElementById("numPending").innerHTML = newPending + " Pending Requests";
        // console.log("Number of updates before: ", currUpdates);
        // console.log("Number of pending before: ", oldPending);
        // if (oldPending !== newPending) {
        //     console.log("Number of pending requests has changed")
        //     setNums(newPending, currUpdates + 1);
        // }
        // const newUpdates = getNumUpdates();
        // console.log("Number of updates after: ", newUpdates);
        // document.getElementById("numUpdates").innerHTML = newUpdates + " Updates";
    }



});

