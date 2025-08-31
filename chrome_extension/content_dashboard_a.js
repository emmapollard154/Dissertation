/**
 * @fileoverview Content script for User A dashboard.
 * @file content_dashboard_a.js
 * @author Emma Pollard
 * @version 1.0
 */

/**
 * Port on which User A dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_FRONTEND = 5173;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { // create event listener for messages from side panel
    console.log('content_dashboard_a.js: received message from ', sender.id, 'with data: ', request);
    if (request.action === 'browsingHistoryUpdate') { // update User A browsing history
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);
        window.postMessage({ // post message accessible by User A dashboard (dashboard_a_frontend.js)
            type: 'BROWSING_DATA',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`); // dashboard origin
        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }
    if (request.action === 'emailAChoice') { // User A choice in email environment
        const id = request.id
        const choice = request.choice;
        const time = request.time;
        const url = request.url;
        const payload = {
            id: id,
            choice: choice,
            time: time,
            url: url,
            context: "Email"
        }
        window.postMessage({
            type: 'USER_A_CHOICE',
            payload: payload
        }, `http://localhost:${A_FRONTEND}`);
        sendResponse({ status: 'content_processed', dataProcessed: choice });
    }
    if (request.action === 'sendHelpMessage') { // automatic help message to User B
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);
        window.postMessage({
            type: 'AUTO_MESSAGE',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`);
        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }
    if (request.action === 'sendEmailContent') { // email content corresponding to a request
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);
        window.postMessage({
            type: 'EMAIL_CONTENT',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`);
        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }
});

console.log('content_dashboard_a.js: loaded and listening for messages.');