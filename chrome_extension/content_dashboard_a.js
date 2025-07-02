// content_dashboard_a.js: content script for dashboard A from chrome extension

// Create event listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_dashboard_a.js: received message from ', sender.id, 'with data: ', request);

    if (request.action === 'browsingHistoryUpdate') { 
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);

        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        }, 'http://localhost:5173'); // dashboard origin

        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }

    if (request.action === 'emailAChoice') {

        const id = request.id
        const choice = request.choice;
        const time = request.time

        const payload = {
            id: id,
            choice: choice,
            time: time,
            context: "Email"
        }

        window.postMessage({
            type: 'USER_A_CHOICE',
            payload: payload
        }, 'http://localhost:5173');

        sendResponse({ status: 'content_processed', dataProcessed: choice });
    }

});

console.log('content_dashboard_a.js: loaded and listening for messages.');
