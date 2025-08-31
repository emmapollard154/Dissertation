/**
 * @fileoverview Content script for email webpage.
 * @file content_email.js
 * @author Emma Pollard
 * @version 1.0
 */

/*
Code adapted from:
Undoing PreventDefault in JavaScript; 
Google Gemini; 
2025;  
Available from: https://gemini.google.com/share/a2f728f3c341; 
Accessed 19 July 2025.
*/  

/**
 * Port on which email environment runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const EMAIL_PORT = 5174;

/**
 * Boolean to track if system is activated.
 * @global
 * @type {Boolean}
 */
let EXTENSION_LOADED =  false;

/**
 * Variable to store link HTML element.
 * @global
 * @type {String}
 */
let LINK = '';
/**
 * Variable to store HTML element that opens current email.
 * @global
 * @type {String}
 */
let CURRENT_PARENT = '';

/**
 * Array to store unresolved actions.
 * @global
 * @type {Array}
 */
let PENDING_ACTIONS = [];
/**
 * Array to store previously visited CURRENT_PARENT elements.
 * @global
 * @type {Array}
 */
let CLICKED_BEFORE = [];
/**
 * Array to store trusted contacts.
 * @global
 * @type {Array}
 */
let TRUSTED_CONTACTS = [];

/**
 * Map to store HTML elements and corresponding links.
 * @global
 * @type {Map}
 */
let PARENT_LINKS = new Map();
/**
 * Map to store current pending links and corresponding choices.
 * @global
 * @type {Map}
 */
let CHOICES = new Map();
/**
 * Map to store modified HTML for a CURRENT_PARENT element.
 * @global
 * @type {Map}
 */
let MODIFIED_HTML = new Map();
/**
 * Map to store original HTML for a CURRENT_PARENT element.
 * @global
 * @type {Map}
 */
let ORIGINAL_HTML = new Map();
/**
 * Map to store original links for pending actions.
 * @global
 * @type {Map}
 */
let ORIGINAL_LINKS = new Map();


// References to HTML elements
let infoBackground = null;
let infoPopup = null;
let okayInfo = null;
let cancelInfo = null;
let menuBackground = null;
let menuPopup = null;
let menuChoice = null; // radio
let okayMenu = null;
let backMenu = null;

/**
 * Strip tags for email preview.
 * @param {String} email The HTML of the email content.
 */
function stripTags(email) {
  const tags = /(<([^>]+)>)/gi;
  return email.replace(tags, "");
}

/**
 * Strip tags from email sender.
 * @param {String} from The HTML of the email sender.
 */
function stripSender(from) {
    const stripped = from.replaceAll('&lt;', '').replaceAll('&gt;', '');
    return stripped;
}

/**
 * Process User B response.
 * @param {String} url The URL corresponding to the action.
 * @param {String} outcome The response from User B.
 */
function processOutcome(url, outcome) {
    if (!url || !outcome) {
        console.error('content_email.js: error reading url or outcome for User B response.')
    }
    const elem = [...PARENT_LINKS].find(([key, val]) => val == url)[0]; // corresponding HTML element
    const choice = CHOICES.get(url); // choice made by User A
    chrome.runtime.sendMessage({ // send message to side panel to confirm status
        action: "displaySpeechResponse", 
        choice: choice,
        outcome: outcome,
        url: url
    });
    if (choice === '3') { // reinstate original HTML regardless of outcome
        console.log('content_email.js: removing from pending actions.');
        MODIFIED_HTML.delete(elem);
        CHOICES.delete(url);
        PARENT_LINKS.delete(elem);
        const i = CLICKED_BEFORE.indexOf(elem);
        const j = PENDING_ACTIONS.indexOf(url);
        if (i > -1) { // element found
            CLICKED_BEFORE.splice(i, 1);
        }
        if (j > -1) { // element found
            PENDING_ACTIONS.splice(j, 1);
        }
        document.documentElement.innerHTML = ORIGINAL_HTML.get(url); // switch to original link
    }
    else if (choice === '4') { // only unblock if positive response received
        if (outcome === 'Y') {
            console.log('content_email.js: removing from pending actions.');
            MODIFIED_HTML.delete(elem);
            CHOICES.delete(url);
            PARENT_LINKS.delete(elem);
            const i = CLICKED_BEFORE.indexOf(elem);
            const j = PENDING_ACTIONS.indexOf(url);
            if (i > -1) { // element found
                CLICKED_BEFORE.splice(i, 1);
            }
            if (j > -1) { // element found
                PENDING_ACTIONS.splice(j, 1);
            }
            document.documentElement.innerHTML = ORIGINAL_HTML.get(url); // switch to original link
        }
    }
    else {
        console.warn('content_email.js: received response from User B for unexpected choice - ', choice);
    }
}

/**
 * Process User A choice.
 * @param {String} elem The parent element corresponding to the email.
 * @param {String} choice Choice made by User A.
 */
function completeAction(elem, choice) {
    const url = PARENT_LINKS.get(elem);
    if (!url) {
        console.error('content_email.js: no link found for element.');
    }
    if (choice === '1') { // click on link
        console.log('content_email.js: opening link (', url, ') in new tab.');
        window.open(url, '_blank');
    }
    if (choice === '2') { // click on link
        console.log('content_email.js: opening link (', url, ') in new tab.');
        window.open(url, '_blank');
    }
    if (choice === '3') { // block temporarily, wait for B response
        console.log('content_email.js: blocking link (', url, '). Waiting for User B response.');
    }
    if (choice === '4') { // block permanently if rejected, wait for B response
        console.log('content_email.js: blocking link (', url, '). Waiting for User B response.');
    }
    if (choice === '5') { // block immediately, permanently
        console.log('content_email.js: blocking link (', url, ') permanently.');
    }
}

/*
Code adapted from:
JavaScript Manipulating HTML Divs; 
Google Gemini; 
2025;  
Available from: https://g.co/gemini/share/f4c5d9a272b9; 
Accessed 18 June 2025.
*/  
/**
 * Fetch and inject HTML for information popup.
 * @param {String} link The HTML corresponding to the current email.
 */
async function injectInfoHtml(link) {
    infoBackground = document.getElementById('infoBackground');
    infoPopup = document.getElementById('infoPopup');
    okayInfo = document.getElementById('okayInfo');
    cancelInfo = document.getElementById('cancelInfo');
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

/*
Code adapted from:
JavaScript Manipulating HTML Divs; 
Google Gemini; 
2025;  
Available from: https://g.co/gemini/share/f4c5d9a272b9; 
Accessed 18 June 2025.
*/   
/**
 * Fetch and inject HTML for menu popup.
 * @param {String} link The HTML corresponding to the current email.
 */
async function injectMenuHtml(link) {
    menuBackground = document.getElementById('menuBackground');
    menuPopup = document.getElementById('menuPopup');
    menuChoice = document.getElementById('user_a_choice');
    okayMenu = document.getElementById('okayMenu');
    backMenu = document.getElementById('backMenu');
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

/*
Code adapted from:
JavaScript Manipulating HTML Divs; 
Google Gemini; 
2025;  
Available from: https://g.co/gemini/share/f4c5d9a272b9; 
Accessed 18 June 2025.
*/  
/**
 * Attach event listeners to the information popup buttons.
 * @param {String} informationPopup The HTML element corresponding to the information popup.
 * @param {String} link The HTML corresponding to the current email.
 */
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
                document.getElementById('captureTrigger').disabled = false;
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

/*
Code adapted from:
JavaScript Manipulating HTML Divs; 
Google Gemini; 
2025;  
Available from: https://g.co/gemini/share/f4c5d9a272b9; 
Accessed 18 June 2025.
*/  
/**
 * Attach event listeners to the menu popup buttons.
 * @param {String} informationPopup The HTML element corresponding to the menu popup.
 * @param {String} link The HTML corresponding to the current email.
 */
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
            if (link) {
                if (choice) {
                    processChoice(choice, link);
                } else {
                    console.warn('content_email.js: no choice made.');
                }
                menuPopup.style.display = 'none';
                chrome.runtime.sendMessage({ // send message to side panel to confirm choice
                    action: "displaySpeechContent", 
                    choice: choice
                });
                console.log(CURRENT_PARENT);
                completeAction(CURRENT_PARENT, choice);
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

/**
 * Get unique ID for email actions.
 * @returns {String} A unique identifier for the action.
 */
function emailID() {
    const now = new Date().toISOString(); // timestamp (unique)
    var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
    return `e${id}`; // e signifies email action
}

/**
 * Process User A choice and send to background script.
 * @param {String} choice Choice made by User A.
 * @param {String} link link The HTML corresponding to the current email.
 */
function processChoice(choice, link) {
    PARENT_LINKS.set(CURRENT_PARENT, link.href);
    if (choice === '3' || choice === '4' || choice === '5') { // store modified HTML with url as key
        console.log('content_email.js: storing modified html');
        MODIFIED_HTML.set(CURRENT_PARENT,  document.documentElement.innerHTML);
    }
    let modHtml = MODIFIED_HTML.get(CURRENT_PARENT);
    if (modHtml) {
        if (link.href) {
            if (modHtml.includes(link.href)) {
                const time = new Date().toISOString();
                const id = emailID();
                chrome.runtime.sendMessage({ 
                    action: "sendChoiceToDashboardA", 
                    id: id, 
                    choice: choice, 
                    time: time, 
                    url: link.href 
                });
                if (choice === '3') {
                    link.classList.add('disabled'); // set disabled attribute for CSS
                    link.setAttribute('disabled', 'disabled');
                    link.classList.add('name'); // store href in name attribute
                    link.setAttribute('name', link.href);
                    PENDING_ACTIONS.push(link.href);
                    CHOICES.set(link.href, choice);
                    link.innerHTML = link.href; // display link target
                    link.href = ''; // remove clickable link
                }
                if (choice === '4') {
                    link.classList.add('disabled'); // set disabled attribute for CSS
                    link.setAttribute('disabled', 'disabled');
                    link.classList.add('name'); // store href in name attribute
                    link.setAttribute('name', link.href);
                    PENDING_ACTIONS.push(link.href);
                    CHOICES.set(link.href, choice);
                    link.innerHTML = link.href; // display link target
                    link.href = ''; // remove clickable link
                }
                if (choice === '5') {
                    link.classList.add('disabled'); // set disabled attribute for CSS
                    link.setAttribute('disabled', 'disabled');
                    link.classList.add('name'); // store href in name attribute
                    link.setAttribute('name', link.href);
                    PENDING_ACTIONS.push(link.href);
                    CHOICES.set(link.href, choice);
                    link.innerHTML = link.href; // display link target
                    link.href = ''; // remove clickable link
                }
            }
        }
    }
    else {
        console.log('content_email.js: no modified HTML found for ', CURRENT_PARENT);
    }
}

/*
Code adapted from:
Chrome Extension Data Persistence Methods; 
Google Gemini; 
2025;  
Available from: https://gemini.google.com/share/00bac19789a3; 
Accessed 2 August 2025.
*/  
/**
 * Get data from local chrome storage.
 * @param {String} keys Key to identify targeted data.
 * @returns {Promise<result>} A promise that resolves with successful collection.
 */
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

/**
 * Get email settings.
 * @returns {Array} The allowed and blocked email settings.
 * @throws {Error} If the email settings cannot be retrieved.
 */
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

/**
 * Get trusted contacts.
 * @returns {Array} The trusted email addresses.
 * @throws {Error} If the trusted contacts cannot be retrieved.
 */
async function getTrustedContacts() {
    try {
        const result = await getStorageData(['TRUSTED_CONTACTS']);
        const trustedContacts = result.TRUSTED_CONTACTS;
        TRUSTED_CONTACTS = trustedContacts;
        return trustedContacts;
    } catch (error) {
        console.error('content_email.js: error retrieving TRUSTED_CONTACTS: ', error);
        throw error;
    }
}

/**
 * Inject HTML and add listeners for system intervention on email webpage.
 */
function loadAll() {

    if (EXTENSION_LOADED) {
        let flagged = false;
        let clickedBefore = false;
        let popupElement = false;
        document.addEventListener('click', async function(event) { // monitor all clicks
            if (event.target.id !== 'captureTrigger') { // 'Forward' button not clicked
                if (!clickedBefore && !flagged && !popupElement) { // not previously clicked
                    console.log('content_email.js: storing original html.');
                    if (event.target.matches('a')) { // link pressed
                        const dest = event.target.href;
                        if (!dest.includes(`localhost:${EMAIL_PORT}`)) {
                            console.log('content_email.js: setting original html for link: ', event.target.href);
                            ORIGINAL_HTML.set(event.target.href, document.documentElement.innerHTML);
                        }
                    }
                }
                flagged = false;
                clickedBefore = false;
                popupElement = false;
                if (event.target.matches('a')) { // link pressed
                    var trusted = false;
                    const from = document.getElementById('captureFrom').innerHTML; // email sender
                    for (const contact of TRUSTED_CONTACTS) { // check if sender is trusted
                        if (from.includes(contact)) {
                            console.log('content_email.js: trusted contact detected.');
                            chrome.runtime.sendMessage({ // send message to side panel to confirm choice
                                action: "displayIfTrusted", 
                                trusted: true
                            });
                            trusted = true;
                            break;
                        }
                    }
                    if (!trusted) { // system intervention required
                        console.log('content_email.js: non-trusted contact detected.');
                        chrome.runtime.sendMessage({ // send message to side panel to confirm choice
                            action: "displayIfTrusted", 
                            trusted: false
                        });
                        event.preventDefault();
                        LINK = event.target;
                        console.log('content_email.js: link element pressed - ', LINK);
                        if (LINK.href === `http://localhost:${EMAIL_PORT}/`) { // clicked link to own page
                            console.log('content_email.js: link to own page clicked.');
                            if (PENDING_ACTIONS.includes(LINK.name)) { // clicked on blocked link
                                console.log('content_email.js: pending link clicked. Updating side panel.');
                                chrome.runtime.sendMessage({ // send message to side panel to remind user of choice
                                    action: "displaySpeechContent", 
                                    choice: CHOICES.get(LINK.name)
                                });
                            }
                            return;
                        }
                        else {
                            ORIGINAL_LINKS.set(LINK.href, LINK.outerHTML);
                        }
                        await injectInfoHtml(LINK);
                        await injectMenuHtml(LINK);
                        if (infoBackground) {
                            infoBackground.style.display = 'block'; // show popup
                        } else {
                            console.warn('content_email.js: infoBackground not found.');
                        }
                    } 
                }
                else { // link not clicked
                    console.log('content_email.js: non-link element pressed - ', event.target);
                    let eventID = event.target.id;
                    if (!eventID.includes('menu') && !eventID.includes('info') && !eventID.includes('Menu') && !eventID.includes('Info') && !eventID.includes('option')) { // ignore popup content
                        for (const className of event.target.classList) {
                            if (!className.includes('menu') && !className.includes('info') && !className.includes('checkmark') && !className.includes('option')) {
                                // pass
                            }
                            else {
                                console.log('content_email.js: popup element pressed.');
                                popupElement = true;
                            }
                        }
                    }
                    else {
                        console.log('content_email.js: popup element pressed.');
                        popupElement = true;
                    }
                    if (!popupElement) {
                        console.log('content_email.js: non-popup element pressed.');
                        CURRENT_PARENT = event.target.outerHTML; // HTML of event target
                        if (CLICKED_BEFORE.includes(CURRENT_PARENT)) {
                            console.log('content_email.js: element has been clicked before.');
                            for (const key of MODIFIED_HTML.keys()) { // check if already parent to a pending link
                                if (key.includes(CURRENT_PARENT)) {
                                    console.log('content_email.js: manually overriding html.');
                                    document.documentElement.innerHTML = MODIFIED_HTML.get(key);
                                    flagged = true;
                                    return;
                                }
                            }
                            if(!flagged) { // load original HTML
                                console.log('content_email.js: fresh parent clicked.');
                                for (const key of ORIGINAL_HTML.keys()) {
                                    if (key.includes(CURRENT_PARENT)) {
                                        console.log('content_email.js: loading original html.');
                                        document.documentElement.innerHTML = ORIGINAL_HTML.get(key);
                                        clickedBefore = true;
                                        return;
                                    }
                                }
                            }
                        } else {
                            console.log('content_email.js: current parent has not been clicked before');
                            CLICKED_BEFORE.push(CURRENT_PARENT); // log as previously visited
                        }
                    }
                }
            }
            else { // capture email content ('Forward' clicked)
                console.log('content_email.js: capture trigger clicked');
                document.getElementById('captureTrigger').addEventListener('click', function() {
                    try {
                        const subject = document.getElementById('captureSubject').innerHTML;
                        const from = document.getElementById('captureFrom').innerHTML;
                        const strippedFrom = stripSender(from);
                        const date = document.getElementById('captureDate').innerHTML;
                        const body = document.getElementById('captureBody').innerHTML;
                        const strippedBody = stripTags(body);
                        const emailContent = {
                            'subject': subject,
                            'from': strippedFrom,
                            'date': date,
                            'body': strippedBody,
                            'link': LINK.href
                        }
                        chrome.runtime.sendMessage({
                            action: "sendEmailContent",
                            content: emailContent
                        });
                        document.getElementById('captureTrigger').disabled = true;
                    }
                    catch(err) {
                        console.error(err);
                    }
                });
            }
        }, true);
        return;
    }
    else {
        console.log('content_email.js: extension not loaded.');
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { // listener for actions on email webpage
    console.log('content_email.js received message from: ', sender.id, 'with data:', request);
    if (request.action === 'extensionLoaded') {
        if (!EXTENSION_LOADED) { // reload the page when the extension is activated
            alert('Extension loaded, please refresh the page.');
            location.reload();
        }
    }
    if (request.action === 'onEmailPage') { 
        EXTENSION_LOADED = true;
        if (EXTENSION_LOADED) {
            console.log('content_email.js: extension loaded.');
        }
        loadAll(); // activate system on email webpage
        injectInfoHtml(null).then(function() {
            injectMenuHtml(null).then(function() {
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
                        if (result[0] === 'N') { // disable blocked options
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
                        console.warn('content_email.js: radio option not found');
                    }
                })
                .catch(function(error) {
                    console.error('content_email.js: request to get EMAIL_SETTINGS rejected: ', error);
                });
            });
        });
        const trustedContacts = getTrustedContacts();
        trustedContacts.then(function(result) {
            console.log('content_email.js: TRUSTED_CONTACTS - ', result)
        })
        .catch(function(error) {
            console.error('content_email.js: request to get TRUSTED_CONTACTS rejected: ', error);
        });
    }
    if (request.action === 'userBResponse') {
        console.log('content_email.js: User B sent a response for ', request.url, ' (', request.outcome, ').');
        processOutcome(request.url, request.outcome);
    }
    sendResponse({ status: 'content_processed', dataProcessed: request });
});


console.log('content_email.js: email content script loaded and listening for messages.');

if (!EXTENSION_LOADED) {
    console.log('Extension not loaded.');
}
