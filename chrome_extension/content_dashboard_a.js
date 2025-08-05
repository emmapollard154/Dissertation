// content_dashboard_a.js: content script for dashboard A from chrome extension

const A_FRONTEND = 5173;

// Create event listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_dashboard_a.js: received message from ', sender.id, 'with data: ', request);

    if (request.action === 'browsingHistoryUpdate') { 
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);

        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`); // dashboard origin

        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }

    if (request.action === 'emailAChoice') {

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

    if (request.action === 'welcomeToDashboard') { 

        console.log('content_dashboard_a.js: processing data from side_panel: welcomeToDashboard');

        window.postMessage({
            type: 'WELCOME',
            payload: null
        }, `http://localhost:${A_FRONTEND}`); // dashboard origin

        sendResponse({ status: 'content_processed' });
    }

    if (request.action === 'sendHelpMessage') { 
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);

        window.postMessage({
            type: 'AUTO_MESSAGE',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`); // dashboard origin

        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }

    if (request.action === 'sendEmailContent') { 
        const receivedData = request;
        console.log('content_dashboard_a.js: processing data from side_panel: ', receivedData);

        window.postMessage({
            type: 'EMAIL_CONTENT',
            payload: receivedData
        }, `http://localhost:${A_FRONTEND}`); // dashboard origin

        sendResponse({ status: 'content_processed', dataProcessed: receivedData });
    }

});

console.log('content_dashboard_a.js: loaded and listening for messages.');