// sidepanel.js (script for side panel html)

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("side_panel received message type:", message.action);


    if (message.action === 'sendUrlToDashboard') {

        // document.getElementById('currentURL').innerText = message.newUrlMessage[0];
        // document.getElementById('currentTimestamp').innerText = message.newUrlMessage[1];

        const urlReceived =  message.newUrlMessage[0];
        const timeReceived =  message.newUrlMessage[1];

        document.getElementById('currentURL').innerText = urlReceived;
        document.getElementById('currentTimestamp').innerText = timeReceived;

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

        if (urlReceived === "http://localhost:5174/") { // email environment
            console.log("ON EMAIL WEBPAGE")
            document.getElementById('emailPageAnnouncement').innerText = "ON EMAIL WEBPAGE"

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
            document.getElementById('emailPageAnnouncement').innerText = ""
        }

        return true; // sendResponse is called asynchronously
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

