// content script for chrome extension

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_dashboard_a.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'browsingHistoryUpdate') { 
        const receivedData = request;
        console.log('Content Script (Dashboard A): Processing data from side_panel:', receivedData);

        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        }, 'http://localhost:5173'); // dashboard origin

        // send response to side_panel
        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
    }
});

console.log('Content script (dashboard) loaded and listening for messages.');
