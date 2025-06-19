// content script for email browser

// references to html elements
let infoBackground = null;
let infoPopup = null;
let okayInfo = null;
let cancelInfo = null;

// function to fetch and inject HTML and attach event listeners
async function injectInfoHtml() {

    infoBackground = document.getElementById('infoBackground');
    infoPopup = document.getElementById('infoPopup');
    okayInfo = document.getElementById('okayInfo');
    cancelInfo = document.getElementById('cancelInfo');

    if (infoBackground && infoPopup && okayInfo && cancelInfo) {
        console.log("All information html elements already exist");
        infoBackground.style.display = 'block'; // show popup
        return;
    }

    try {
        const infoHtml = chrome.runtime.getURL('information_popup.html');
        console.log("Fetching popup HTML from:", infoHtml);

        const response = await fetch(infoHtml);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let infoHtmlContent = await response.text();

        // Replace the CSS link placeholder with the actual extension URL
        const cssUrl = chrome.runtime.getURL('information_popup.css');
        infoHtmlContent = infoHtmlContent.replace('${chrome.runtime.getURL(\'information_popup.css\')}', cssUrl);
        console.log("Injected popup HTML content prepared.");

        // Create a temporary div to parse the HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = infoHtmlContent;

        while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild);
        }
        infoBackground = document.getElementById('infoBackground');

        
        if (infoBackground) {
            console.log("Popup HTML injected into the page body.");
            attachPopupEventListeners(infoBackground);
            infoBackground.style.display = 'block'; // show popup, initially hidden
        } else {
            console.error("Failed to find #infoPopup within the fetched HTML content.");
        }

    } catch (error) {
        console.error("Error injecting popup HTML:", error);
    }
}

// Function to attach event listeners to the buttons within the popup
function attachPopupEventListeners(informationPopup) {
    if (!informationPopup) return;

    const okayInfo = document.getElementById('okayInfo');
    const cancelInfo = document.getElementById('cancelInfo');

    if (okayInfo) {
        okayInfo.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Okay button clicked!");
            informationPopup.style.display = 'none';
        });
    } else {
        console.warn("Okay button not found in popup.");
    }

    if (cancelInfo) {
        cancelInfo.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Cancel button clicked!");
            informationPopup.style.display = 'none';
        });
    } else {
        console.warn("Cancel button not found in popup.");
    }
}









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