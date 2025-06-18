// content script for email browser

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 

        // const receivedData = request;

        document.addEventListener('click', function(event) {
            console.log('Click detected!', event.target);
            // You can get details like event.clientX, event.clientY, event.button, etc.
        });
        // sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
        sendResponse({ status: 'content_script_received_and_processed'});
    }
});

console.log("Email content script loaded and listening for messages");