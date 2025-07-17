// content_email.js: content script for email browser

const EMAIL_PORT = 5174;
let EXTENSION_LOADED =  false;
let LINK = '';
let CURRENT_PARENT = ''; // variable to store click event target
let MODIFIED_HTML = new Map(); // map to store modified html for pages containing pending links

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
        const infoText = document.getElementById('infoText');

        if (infoText) {
            address = document.getElementById('infoTextURL');
            if (address) {
                if (link) {
                    address.innerHTML = link.href;
                }
            }
        }

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
        address = document.getElementById('infoTextURL');
        if (address) {
            if (link) {
                address.innerHTML = link.href;
            }
        }
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

            if (choice === '3' || choice === '4' || choice === '5') { // store modified html with url as key
                console.log('content_email.js: storing html');

                MODIFIED_HTML.set(CURRENT_PARENT,  document.documentElement.innerHTML);

            }
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

    console.log(link);

    if (choice === '3') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        // setPendingElems(link);
        setPendingLinks(link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
    }

    if (choice === '4') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        // setPendingElems(link);
        setPendingLinks(link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
    }

    if (choice === '5') {
        link.classList.add('disabled'); // set disabled attribute for CSS
        link.setAttribute('disabled', 'disabled');
        link.classList.add('name'); // store href in name attribute
        link.setAttribute('name', link.href);
        // setPendingElems(link);
        setPendingLinks(link.href);
        link.innerHTML = link.href; // display link target
        link.href = ''; // remove clickable link
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

// Function to retrieve pending links
async function getPendingLinks() {
    try {
        const result = await getStorageData(['PENDING_ACTIONS']);
        const ids = result.PENDING_ACTIONS;
        if (!ids) {
            console.log('PENDING_ACTIONS does not exist.');
            return [];
        }
        return ids;
    } catch (error) {
        console.error('content_email.js: error retrieving PENDING_ACTIONS: ', error);
        return [];
    }
}

// Function to store IDs of pending requests
function setPendingLinks(url) {

    console.log("setPendingLinks");
    console.log("url trying to add: ", url);

    let current = getPendingLinks(); // get current pending actions

    current.then(function(result) { // add to pending actions
        console.log("current pending actions: ", result);
        if (!result.includes(url)) { // avoid double entries
            result.push(url);  
            chrome.storage.local.set({ 'PENDING_ACTIONS': result }, function() {
            console.log('content_email.js: setting PENDING_ACTIONS to ', result);
            })
        }
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

    let currentLinks = getPendingLinks(); // get current pending actions

    currentLinks.then(async function(result) { 

        if (EXTENSION_LOADED) {

            document.addEventListener('click', async function(event) {

                console.log('content_email.js: click detected.');

                console.log("MODIFIED_HTML: ", MODIFIED_HTML);
                let entries = MODIFIED_HTML.entries();
                console.log("MODIFIED_HTML entries: ", entries);

                console.log(MODIFIED_HTML.size);

                for (const [key, value] of MODIFIED_HTML.entries()) { // Explicitly calling .entries()
                    console.log(`Key: ${key}, Value: ${value}`);
                }


                if (event.target.matches('a')) { // link pressed

                    event.preventDefault();

                    LINK = event.target;

                    console.log("link pressed");
                    console.log(LINK);
                    

                    if (LINK.href === `http://localhost:${EMAIL_PORT}/`) { // clicked link to own page
                        console.log('content_email.js: link to own page clicked.');
                        if (LINK.name) {
                            if (result.includes(LINK.name)) { // clicked on disabled link
                                console.log("link in PENDING_ACTIONS clicked, DO SOMETHING");
                            }
                        }
                        console.log("TRYING TO RETURN");
                        return;
                    }

                    await injectInfoHtml(LINK);
                    await injectMenuHtml(LINK);
                    
                    if (infoBackground) {
                        infoBackground.style.display = 'block'; // show popup
                    } else {
                        console.warn('content_email.js: infoBackground not found.');
                    }

                }
                else {
                    console.log("link not pressed")
                    console.log(event.target);

                    let eventID = event.target.id;

                    if (!eventID.includes('menu') && !eventID.includes('info') && !eventID.includes('Menu') && !eventID.includes('Info')) { // ignore popup content
                        console.log("event id doesn't contain info or menu");

                        for (const className of event.target.classList) {
                            console.log(className);
                            console.log("className includes info: ", className.includes('info'));
                            if (!className.includes('menu') && !className.includes('info')) {
                                console.log("info and menu not in class name")

                                console.log("Storing temporary parent element");
                                CURRENT_PARENT = event.target.outerHTML;
                                console.log("CURRENT_PARENT: ", CURRENT_PARENT);

                                for (const key of MODIFIED_HTML.keys()) {
                                    if (key.includes(CURRENT_PARENT)) {
                                        console.log('content_email.js: manually overriding html.');
                                        document.documentElement.innerHTML = MODIFIED_HTML.get(key);

                                    }
                                }


                                break;
                            }
                            else {
                                console.log("element contains info or menu in classlist");
                            }
                        }

                    }
                    else {
                        console.log("element contains info or menu in id");
                    }
                    
                }

            }, true);

            return;
        }
        else {
            console.log("extension not loaded");
        }
    });

}

// Create listener for actions on email page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log('content_email.js received message from: ', sender.id, 'with data:', request);

    if (request.action === 'onEmailPage') { 

        EXTENSION_LOADED = true;
        if (EXTENSION_LOADED) {
            console.log('content_email.js: extension loaded.');
        }

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

    }
});

console.log("content_email.js: email content script loaded and listening for messages");

// TEMP: clear PENDING_ACTIONS

// chrome.storage.local.set({ 'PENDING_ACTIONS': [] }, function() {
// console.log('content_email.js: cleared PENDING_ACTIONS.');
// })


let initial = getPendingLinks(); // get current pending actions
initial.then(function(result) {
    console.log('PENDING_ACTIONS: ', result);
});

if (!EXTENSION_LOADED) {
    console.log('Extension not loaded.');
}
