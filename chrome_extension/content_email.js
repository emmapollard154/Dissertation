// content script for email browser

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 
        const receivedData = request;
        console.log('Content Script: Processing data from side_panel:', receivedData);

        window.postMessage({
            type: 'EMAIL_CLICK',
            payload: receivedData
        }, 'http://localhost:5174'); // email browser origin

        // send response to side_panel
        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
    }
});

console.log("Email content script loaded and listening for messages");