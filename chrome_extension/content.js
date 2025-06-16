
// function sendUrlToDashboard(data) {
//     if (typeof data !== 'object' || data === null) {
//         data = { value: data };
//     }

//     const browserData = {
//         type: 'URL_TO_DASHBOARD',
//         payload: data
//     };

//     window.postMessage(browserData, 'http://localhost.5173');
//     console.log('Extension (side_panel): Sent data to dashboard', browserData);

// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log("side_panel received request:", request);

//     if (request.action === 'sendUrlToDashboard') {
//         const urlToSend = request.data || { default: "No url data to send to dashboard"}
//         sendUrlToDashboard(urlToSend)
//     }
// });








chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content Script: Received message from:', sender.id, 'with data:', request);

    // Check for the action that popup.js will send
    if (request.action === 'messageForContentScript') {
        const receivedData = request.newUrlMessage;
        console.log('Content Script: Processing data from popup:', receivedData);

        // Perform actions with the data (e.g., interact with the page, send to dashboard)
        // Example: If you want to post this data to your dashboard's global window
        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        // }, window.location.origin); // Ensure you specify the correct origin for your dashboard
        }, 'http://localhost:5173'); // Ensure you specify the correct origin for your dashboard

        // Send a response back to the popup
        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
    }
});

console.log('Content script loaded and listening for messages.');
