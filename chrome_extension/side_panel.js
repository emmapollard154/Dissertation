// sidepanel.js (script for side panel html)

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("side_panel received message:", message);
    document.getElementById('currentURL').innerText = message.newUrlMessage[0];
    document.getElementById('currentTimestamp').innerText = message.newUrlMessage[1];


    if (message.action === 'sendUrlToDashboard') {
        const browserData = {
            newUrl:  message.newUrlMessage[0],
            newTime: message.newUrlMessage[1],
        };


        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                console.log('Popup: Sending message to content script in tab ID:', activeTab.id);

                // 3. Send message to the content script in the active tab
                chrome.tabs.sendMessage(activeTab.id, {
                    action: 'messageForContentScript',
                    data: browserData
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('side_panel: Error sending message to content script:', chrome.runtime.lastError.message);
                        // Handle cases where content script might not be injected or responsive
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
        // Indicate that sendResponse will be called asynchronously
        return true;
    }
});

// function insertBrowsingHistory(db, url, time) {
//     const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
//     stmt.run(url, time);
//     stmt.finalize(() => {
//         console.log('Additional data inserted from side_panel.js.');
//     });
// }

// module.exports = {
//     insertBrowsingHistory
// };

