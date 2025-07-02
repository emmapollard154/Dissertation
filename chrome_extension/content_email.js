// content_email.js: content script for email browser

// References to html elements
let infoBackground = null;
let infoPopup = null;
let okayInfo = null;
let cancelInfo = null;
let menuBackground = null;
let menuPopup = null;
let menuChoice = null; // radio
let okayMenu = null;
let backMenu = null;

// Function to fetch and inject HTML and attach listeners for information popup
async function injectInfoHtml() {

    infoBackground = document.getElementById('infoBackground');
    infoPopup = document.getElementById('infoPopup');
    okayInfo = document.getElementById('okayInfo');
    cancelInfo = document.getElementById('cancelInfo');

    if (infoBackground && infoPopup && okayInfo && cancelInfo) {
        console.log('content_email.js: information html elements already exist.');
        return;
    }

    try {
        const infoHtml = chrome.runtime.getURL('information_popup.html');
        const response = await fetch(infoHtml);

        if (!response.ok) {
            throw new Error(`content_email.js ERROR: ${response.status}`);
        }

        let infoHtmlContent = await response.text();
        const cssSource = chrome.runtime.getURL('information_popup.css');
        infoHtmlContent = infoHtmlContent.replace('${chrome.runtime.getURL(\'information_popup.css\')}', cssSource);
        console.log('content_email.js: information HTML content prepared.');

        const tempDiv = document.createElement('div'); // temporary div to parse the HTML string
        tempDiv.innerHTML = infoHtmlContent;

        while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild);
        }

        infoBackground = document.getElementById('infoBackground');

        if (infoBackground) {
            console.log('content_email.js: information HTML injected into the page body.');
            attachInfoListeners(infoBackground);
        } else {
            console.error('content_email.js: failed to find infoBackground within the fetched HTML content.');
        }

    } catch (error) {
        console.error('content_email.js: error injecting information HTML: ', error);
    }
}


// Function to fetch and inject HTML and attach listeners for menu popup
async function injectMenuHtml() {

    menuBackground = document.getElementById('menuBackground');
    menuPopup = document.getElementById('menuPopup');
    menuChoice = document.getElementById('user_a_choice');
    okayMenu = document.getElementById('okayMenu');
    backMenu = document.getElementById('backMenu');

    if (menuBackground && menuPopup && okayMenu && backMenu) {
        console.log('content_email.js: menu html elements already exist.');
        return;
    }

    try {
        const menuHtml = chrome.runtime.getURL('menu_popup.html');
        const response = await fetch(menuHtml);

        if (!response.ok) {
            throw new Error(`content_email.js ERROR: ${response.status}`);
        }

        let menuHtmlContent = await response.text();
        const cssSource = chrome.runtime.getURL('menu_popup.css');
        menuHtmlContent = menuHtmlContent.replace('${chrome.runtime.getURL(\'menu_popup.css\')}', cssSource);
        console.log('content_email.js: menu HTML content prepared.');

        const tempDiv = document.createElement('div'); // temporary div to parse the HTML string
        tempDiv.innerHTML = menuHtmlContent;

        while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild);
        }

        menuBackground = document.getElementById('menuBackground');

        if (menuBackground) {
            console.log('content_email.js: menu HTML injected into the page body.');
            attachMenuListeners(menuBackground);
        } else {
            console.error('content_email.js: failed to find menuBackground within the fetched HTML content.');
        }

    } catch (error) {
        console.error('content_email.js: error injecting menu HTML: ', error);
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
            if (menuBackground) {
                informationPopup.style.display = 'none'; // hide info popup
                menuBackground.style.display = 'block'; // show menu popup
            } else {
                console.warn('content_email.js: cannot find menu popup.');
            }
        });
    } else {
        console.warn('content_email.js: "Okay" button not found in popup.');
    }

    if (cancelInfo) {
        cancelInfo.addEventListener('click', function(event) {
            event.preventDefault();
            informationPopup.style.display = 'none';
        });
    } else {
        console.warn('content_email.js: "Cancel" button not found in popup.');
    }
}

// Function to attach event listeners to the menu popup buttons
function attachMenuListeners(menuPopup) {
    if (!menuPopup) return;

    const menuChoice = document.getElementById('user_a_choice');
    const okayMenu = document.getElementById('okayMenu');
    const backMenu = document.getElementById('backMenu');

    if (!menuChoice) {
        console.warn('content_email.js: cannot find form in menu popup.');
    }

    if (okayMenu) {
        okayMenu.addEventListener('click', function(event) {
            event.preventDefault();
            const choice = menuChoice.elements['user_a_choices'].value;
            if (choice) {
                sendChoice(choice);
            } else {
                console.warn('content_email.js: no choice made.');
            }
            menuPopup.style.display = 'none';
        });
    } else {
        console.warn('content_email.js: "Okay" button not found in popup.');
    }

    if (backMenu) {
        backMenu.addEventListener('click', function(event) {
            event.preventDefault();
            if (infoBackground) {
                menuBackground.style.display = 'none'; // hide menu popup
                infoBackground.style.display = 'block'; // show info popup
            }
        });
    } else {
        console.warn('content_email.js: "Back" button not found in popup.');
    }
}

// Function to get current time in sqlite datetime format
function timeToDatetime() {
    const now = new Date().toISOString();
    const [date, rawTime] = now.split('T');
    const time = rawTime.split('.')[0];
    return `${date} ${time}`;
}

// Function to get unique ID for email actions
function emailID() {
    const now = new Date().toISOString(); // timestamp (unique)
    var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
    return `e${id}`; // e signifies email action
}

// Function to send user selected choice in menu popup to background script
function sendChoice(choice) {
    const time =  timeToDatetime();
    const id = emailID();
    chrome.runtime.sendMessage({ action: "sendChoiceToDashboardA", id: id, choice: choice, time: time });
}

// Create listener for actions on email page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log('content_email.js received message from: ', sender.id, 'with data:', request);

    if (request.action === 'onEmailPage') { 
        const eventDetected = 'onEmailPage';
        injectInfoHtml();
        injectMenuHtml();
        document.addEventListener('click', function(event) {

            if (event.target.matches('button')) {
                const btnText = event.target.innerText;
                if (btnText.includes('Reply') || btnText.includes('Forward')) { // risky button clicked
                    event.preventDefault();
                    if (infoBackground) {
                        infoBackground.style.display = 'block'; // show popup
                    } else {
                        console.warn('content_email.js: infoBackground not found.');
                    }
                } else {
                    // safe button clicked
                }
            }

            if (event.target.matches('a')) { // link pressed
                event.preventDefault();
                if (infoBackground) {
                    infoBackground.style.display = 'block'; // show popup
                } else {
                    console.warn('content_email.js: infoBackground not found.');
                }
            }

        }, true);

        sendResponse({ status: 'content_processed', eventDetected: eventDetected});
    }
});

console.log("content_email.js: email content script loaded and listening for messages");