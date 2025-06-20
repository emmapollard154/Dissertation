// content script for email browser

// references to html elements
let infoBackground = null;
let infoPopup = null;
let okayInfo = null;
let cancelInfo = null;

let menuBackground = null;
let menuPopup = null;
let menuChoice = null; // radio
let okayMenu = null;
let backMenu = null;

// function to fetch and inject HTML and attach listeners for information popup
async function injectInfoHtml() {

    infoBackground = document.getElementById('infoBackground');
    infoPopup = document.getElementById('infoPopup');
    okayInfo = document.getElementById('okayInfo');
    cancelInfo = document.getElementById('cancelInfo');

    if (infoBackground && infoPopup && okayInfo && cancelInfo) {
        console.log("All information html elements already exist");
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
        const cssUrl = chrome.runtime.getURL('information_popup.css'); // replace the CSS link placeholder with the actual extension URL
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
            attachInfoListeners(infoBackground);
        } else {
            console.error("Failed to find infoBackground within the fetched HTML content.");
        }

    } catch (error) {
        console.error("Error injecting popup HTML:", error);
    }
}


// function to fetch and inject HTML and attach listeners for menu popup
async function injectMenuHtml() {

    menuBackground = document.getElementById('menuBackground');
    menuPopup = document.getElementById('menuPopup');
    menuChoice = document.getElementById('user_a_choice');
    okayMenu = document.getElementById('okayMenu');
    backMenu = document.getElementById('backMenu');

    if (menuBackground && menuPopup && okayMenu && backMenu) {
        console.log("All menu html elements already exist");
        return;
    }

    try {
        const menuHtml = chrome.runtime.getURL('menu_popup.html');
        console.log("Fetching popup HTML from:", menuHtml);

        const response = await fetch(menuHtml);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let menuHtmlContent = await response.text();
        const cssUrl = chrome.runtime.getURL('menu_popup.css'); // replace the CSS link placeholder with the actual extension URL
        menuHtmlContent = menuHtmlContent.replace('${chrome.runtime.getURL(\'menu_popup.css\')}', cssUrl);
        console.log("Injected popup HTML content prepared.");

        // Create a temporary div to parse the HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = menuHtmlContent;

        while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild);
        }

        menuBackground = document.getElementById('menuBackground');

        if (menuBackground) {
            console.log("Popup HTML injected into the page body.");
            attachMenuListeners(menuBackground);
        } else {
            console.error("Failed to find menuBackground within the fetched HTML content.");
        }

    } catch (error) {
        console.error("Error injecting popup HTML:", error);
    }
}


// Function to attach event listeners to the information popup buttons
function attachInfoListeners(informationPopup) {
    if (!informationPopup) return;

    const okayInfo = document.getElementById('okayInfo');
    const cancelInfo = document.getElementById('cancelInfo');

    if (okayInfo) {
        okayInfo.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Okay button clicked in info popup");
            if (menuBackground) {
                informationPopup.style.display = 'none'; // hide info popup
                menuBackground.style.display = 'block'; // show menu popup
            } else {
                console.warn("Cannot find menu popup");
            }
        });
    } else {
        console.warn("Okay button not found in popup.");
    }

    if (cancelInfo) {
        cancelInfo.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Cancel button clicked in info popup");
            informationPopup.style.display = 'none';
        });
    } else {
        console.warn("Cancel button not found in popup.");
    }
}

// function to get current time in sqlite datetime format
function timeToDatetime() {
    const now = new Date().toISOString();

    const [date, rawTime] = now.split('T');
    const time = rawTime.split('.')[0];
    return `${date} ${time}`;
}

// function to get unique ID for email actions
function emailID() {
    const now = new Date().toISOString();
    var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
    return `e${id}`;
}

// Function to send user selected choice in menu popup to background script
function sendChoice(choice) {
    const time =  timeToDatetime();
    const id = emailID();
    chrome.runtime.sendMessage({ action: "sendChoiceToDashboardA", id: id, choice: choice, time: time });
}

// Function to attach event listeners to the menu popup buttons
function attachMenuListeners(menuPopup) {
    if (!menuPopup) return;

    const menuChoice = document.getElementById('user_a_choice');
    const okayMenu = document.getElementById('okayMenu');
    const backMenu = document.getElementById('backMenu');

    if (!menuChoice) {
        console.warn("Form not found in menu popup.");
    }

    if (okayMenu) {
        okayMenu.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Okay button clicked in menu");
            const choice = menuChoice.elements["user_a_choices"].value;
            if (choice) {
                console.log("User A selected: ", choice);
                sendChoice(choice);
            } else {
                console.warn("No choice made")
            }
            menuPopup.style.display = 'none';
        });
    } else {
        console.warn("Okay button not found in popup.");
    }

    if (backMenu) {
        backMenu.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Back button clicked in menu");
            if (infoBackground) {
                menuBackground.style.display = 'none'; // hide menu popup
                infoBackground.style.display = 'block'; // show info popup
            }
        });
    } else {
        console.warn("Back button not found in popup.");
    }
}






chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_email.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'clickedOnEmail') { 

        const eventDetected = "onEmailPage"

        injectInfoHtml();
        injectMenuHtml();

        document.addEventListener('click', function(event) {

            if (event.target.matches("button")) {
                const eventDetected = "button pressed";
                const btnText = event.target.innerText;
                console.log("BUTTON PRESSED IN EMAIL BROWSER");
                console.log("button text: ", btnText)

                if (btnText.includes("Reply") || btnText.includes("Forward")) {
                    console.log("'Forward' or 'Reply' pressed");
                    event.preventDefault();
                    if (infoBackground) {
                        infoBackground.style.display = 'block'; // show popup
                    } else {
                        console.warn("infoBackground not found");
                    }
                } else {
                    console.log("Safe button pressed");
                }
            }

            if (event.target.matches("a")) {
                const eventDetected = "link pressed";
                console.log("LINK PRESSED IN EMAIL BROWSER");
                event.preventDefault();
                if (infoBackground) {
                    infoBackground.style.display = 'block'; // show popup
                } else {
                    console.warn("infoBackground not found");
                }
            }

        }, true); // capturing listener

        sendResponse({ status: 'content_script_received_and_processed', eventDetected: eventDetected});
    }
});

console.log("Email content script loaded and listening for messages");