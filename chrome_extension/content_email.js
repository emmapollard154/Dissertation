// content script for email browser

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 

        // const receivedData = request;

        document.addEventListener('mousedown', function(event) {
            console.log('Mouse down detected in email browser', event.target);

            if (event.target.matches("button")) {
                console.log("BUTTON PRESSED IN EMAIL BROWSER")
            }

            if (event.target.matches("a")) {
                console.log("LINK PRESSED IN EMAIL BROWSER")
            }

        });
        // sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
        sendResponse({ status: 'content_script_received_and_processed'});
    }
});

console.log("Email content script loaded and listening for messages");