// content script for email browser

let infoPopup = null; // reference to information popup

// function to fetch and inject HTML and attach event listeners
async function injectInfoHtml() {

    infoPopup = document.getElementById('infoPopup');
    if (infoPopup) {
        console.log("infoPopup already exists");
        infoPopup.style.display = 'block'; // show infoPopup
        return;
    }

    try {
        // Construct the full URL to your popup.html within the extension
        const popupHtml = chrome.runtime.getURL('information_popup.html');
        console.log("Fetching popup HTML from:", popupHtml);

        const response = await fetch(popupHtml);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let popupHtmlContent = await response.text();

        // Replace the CSS link placeholder with the actual extension URL
        const cssUrl = chrome.runtime.getURL('information_popup.css');
        popupHtmlContent = popupHtmlContent.replace('${chrome.runtime.getURL(\'information_popup.css\')}', cssUrl);
        console.log("Injected popup HTML content prepared.");

        // Create a temporary div to parse the HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = popupHtmlContent;

        while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild);
        }

        infoPopup = document.getElementById('infoPopup');
        
        if (infoPopup) {
            // document.body.appendChild(infoPopup);
            console.log("Popup HTML injected into the page body.");

            // Now that it's in the DOM, attach event listeners
            // attachPopupEventListeners(infoPopup);

            // Show the popup (it's initially hidden by CSS)
            infoPopup.style.display = 'block';
        } else {
            console.error("Failed to find #infoPopup within the fetched HTML content.");
        }

    } catch (error) {
        console.error("Error injecting popup HTML:", error);
    }
}

// // Function to attach event listeners to the buttons within the popup
// function attachPopupEventListeners(popupEl) {
//     if (!popupEl) return;

//     const okayButton = popupEl.querySelector('.btn-okay');
//     const cancelButton = popupEl.querySelector('.btn-cancel');

//     if (okayButton) {
//         okayButton.addEventListener('click', function(event) {
//             event.preventDefault(); // Prevent form submission
//             console.log("Okay button clicked!");
//             popupEl.style.display = 'none'; // Hide the popup
//             // Optionally, send a message back to the background script
//             chrome.runtime.sendMessage({ action: "popupAction", status: "okay" });
//         });
//     } else {
//         console.warn("Okay button not found in popup.");
//     }

//     if (cancelButton) {
//         cancelButton.addEventListener('click', function(event) {
//             event.preventDefault(); // Prevent default button behavior
//             console.log("Cancel button clicked!");
//             popupEl.style.display = 'none'; // Hide the popup
//             // Optionally, send a message back to the background script
//             chrome.runtime.sendMessage({ action: "popupAction", status: "cancel" });
//         });
//     } else {
//         console.warn("Cancel button not found in popup.");
//     }
// }









chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 

        const eventDetected = "onEmailPage"

        document.addEventListener('click', function(event) {
            console.log('Mouse down detected in email browser', event.target);

            if (event.target.matches("button")) {
                const eventDetected = "button pressed";
                console.log("BUTTON PRESSED IN EMAIL BROWSER");
                event.preventDefault();
                injectInfoHtml();
            }

            if (event.target.matches("a")) {
                const eventDetected = "link pressed";
                console.log("LINK PRESSED IN EMAIL BROWSER");
                event.preventDefault();
                injectInfoHtml();
            }

        }, true); // capturing listener

        sendResponse({ status: 'content_script_received_and_processed', eventDetected: eventDetected});
    }
});

console.log("Email content script loaded and listening for messages");