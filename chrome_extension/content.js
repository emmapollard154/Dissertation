// content script for chrome extension

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'browsingHistoryUpdate') { 
        const receivedData = request;
        console.log('Content Script: Processing data from side_panel:', receivedData);

        // Perform actions with the data (e.g., interact with the page, send to dashboard)
        // Example: If you want to post this data to your dashboard's global window
        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        }, 'http://localhost:5173'); // Ensure you specify the correct origin for your dashboard eg. window.location.origin

        // Send a response back to the popup
        console.log("TESTING LOG")
        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
    }
});

console.log('Content script loaded and listening for messages.');
