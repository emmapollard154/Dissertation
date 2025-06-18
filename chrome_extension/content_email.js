// content script for email browser

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 

        const eventDetected = "onEmailPage"

        document.addEventListener('mousedown', function(event) {
            console.log('Mouse down detected in email browser', event.target);

            if (event.target.matches("button")) {
                const eventDetected = "button pressed"
                console.log("BUTTON PRESSED IN EMAIL BROWSER")
            }

            if (event.target.matches("a")) {
                const eventDetected = "link pressed"
                console.log("LINK PRESSED IN EMAIL BROWSER")
            }

        });


        document.addEventListener('mouseup', function(event) {
            console.log('Mouse up detected in email browser', event.target);

            if (event.target.matches("button")) {
                const eventDetected = "button released"
                console.log("BUTTON RELEASED IN EMAIL BROWSER")
            }

            if (event.target.matches("a")) {
                const eventDetected = "link released"
                console.log("LINK RELEASED IN EMAIL BROWSER")
            }

        });



        sendResponse({ status: 'content_script_received_and_processed', eventDetected: eventDetected});
    }
});

console.log("Email content script loaded and listening for messages");