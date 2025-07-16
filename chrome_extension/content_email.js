// content_email.js: content script for email browser

const EMAIL_PORT = 5174;

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
async function injectInfoHtml(link) {

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
            attachInfoListeners(infoBackground, link);
        } else {
            console.error('content_email.js: failed to find infoBackground within the fetched HTML content.');
        }

    } catch (error) {
        console.error('content_email.js: error injecting information HTML: ', error);
    }
    return;
}


// Function to fetch and inject HTML and attach listeners for menu popup
async function injectMenuHtml(link) {

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
            attachMenuListeners(menuBackground, link);
        } else {
            console.error('content_email.js: failed to find menuBackground within the fetched HTML content.');
        }

    } catch (error) {
        console.error('content_email.js: error injecting menu HTML: ', error);
    }
    return;
}


// Function to attach event listeners to the information popup buttons
function attachInfoListeners(informationPopup, link) {
    if (!informationPopup) return;

    const infoText = document.getElementById('infoText');
    const okayInfo = document.getElementById('okayInfo');
    const cancelInfo = document.getElementById('cancelInfo');

    if (infoText) {
        address = document.createElement('p');
        address.innerHTML = link.href;
        infoText.append(address);
    }

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
function attachMenuListeners(menuPopup, link) {
    if (!menuPopup) return;

    const menuChoice = document.getElementById('user_a_choice');
    const okayMenu = document.getElementById('okayMenu');
    const backMenu = document.getElementById('backMenu');

    if (!menuChoice) {
        console.warn('content_email.js: cannot find form in menu popup.');
    }

    if (okayMenu) {
        okayMenu.addEventListener('click', function(event) {
            const choice = menuChoice.elements['user_a_choices'].value;
            event.preventDefault();
            if (choice) {
                processChoice(choice, link);
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

// Function to get unique ID for email actions
function emailID() {
    const now = new Date().toISOString(); // timestamp (unique)
    var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
    return `e${id}`; // e signifies email action
}

// Function to send user selected choice to background script and process choice on page
function processChoice(choice, link) {
    const time = new Date().toISOString();
    const id = emailID();
    chrome.runtime.sendMessage({ action: "sendChoiceToDashboardA", id: id, choice: choice, time: time });

    if (choice === '3') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
        link.id = id; // add ID to link corresponding to actionID
    }

    if (choice === '4') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
        link.id = id; // add ID to link corresponding to actionID
    }

    if (choice === '5') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
        link.id = id; // add ID to link corresponding to actionID
    }

}

// Function to get stored data
function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function(result) {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(result);
        });
    });
}

// Function to get email settings
async function getEmailSettings() {
    try {
        const result = await getStorageData(['EMAIL_SETTINGS']);
        const emailSettings = result.EMAIL_SETTINGS;
        return emailSettings;
    } catch (error) {
        console.error('content_email.js: error retrieving EMAIL_SETTINGS: ', error);
        throw error;
    }
}

// Function to inject html and add listeners
function loadAll() {

    let link = '';

    document.addEventListener('click', async function(event) {

        if (event.target.matches('a')) { // link pressed
            event.preventDefault();

            link = event.target;

            if (link.href === `http://localhost:${EMAIL_PORT}/`) {
                console.log('content_email.js: link to own page clicked.');
                return; // do nothing
            }

            await injectInfoHtml(link);
            await injectMenuHtml(link);
            
            if (infoBackground) {
                infoBackground.style.display = 'block'; // show popup
            } else {
                console.warn('content_email.js: infoBackground not found.');
            }
        }

    }, true);

    return;
}


// Create listener for actions on email page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log('content_email.js received message from: ', sender.id, 'with data:', request);

    if (request.action === 'onEmailPage') { 

        loadAll();

            const emailSettings = getEmailSettings();

            emailSettings.then(function(result) {

                console.log('content_email.js: current settings: ', result);

                const option1 = document.getElementById('option1');
                const option2 = document.getElementById('option2');
                const option3 = document.getElementById('option3');
                const option4 = document.getElementById('option4');
                const option5 = document.getElementById('option5');

                if (option1 && option2 && option3 && option4) {

                    const option1cont = option1.closest('.options_container');
                    const option2cont = option2.closest('.options_container');
                    const option3cont = option3.closest('.options_container');
                    const option4cont = option4.closest('.options_container');
                    const option5cont = option5.closest('.options_container');

                    // Disable blocked options
                    if (result[0] === 'N') {
                        option1.disabled = true;
                        option1.checked = false; // deselect
                        option2.checked = true; // autoselect next option
                        option1cont.classList.add('disabled-option');
                    } else {
                        option1.disabled = false;
                        option1cont.classList.remove('disabled-option');
                    }

                    if (result[1] === 'N') {
                        option2.disabled = true;
                        option2.checked = false;
                        option3.checked = true;
                        option2cont.classList.add('disabled-option');
                    } else {
                        option2.disabled = false;
                        option2cont.classList.remove('disabled-option');
                    }

                    if (result[2] === 'N') {
                        option3.disabled = true;
                        option3.checked = false;
                        option4.checked = true;
                        option3cont.classList.add('disabled-option');
                    } else {
                        option3.disabled = false;
                        option3cont.classList.remove('disabled-option');
                    }

                    if (result[3] === 'N') {
                        option4.disabled = true;
                        option4.checked = false;
                        option5.checked = true;
                        option4cont.classList.add('disabled-option');
                    } else {
                        option4.disabled = false;
                        option4cont.classList.remove('disabled-option');
                    }

                    if (result[4] === 'N') {
                        option5.disabled = true;
                        option5.checked = false;
                        option5cont.classList.add('disabled-option');
                    } else {
                        option5.disabled = false;
                        option5cont.classList.remove('disabled-option');
                    }

                }
                else {
                    console.error('content_email.js: radio option not found');
                }

            })
            .catch(function(error) {
                console.error('content_email.js: request to get EMAIL_SETTINGS rejected: ', error);
            });

        // })
        // .catch(error => {
        //     console.error('content_email: error during loadAll(): ', error);
        // });

    }
});

console.log("content_email.js: email content script loaded and listening for messages");