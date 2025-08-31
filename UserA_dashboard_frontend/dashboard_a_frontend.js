/**
 * @fileoverview Content script for User A dashboard (port 5173).
 * @file dashboard_a_frontend.js
 * @author Emma Pollard
 * @version 1.0
 */

/**
 * Port on which the User A dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_BACKEND = 5000;
/**
 * Port on which User A dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_FRONTEND = 5173;

/**
 * Send data from frontend to backend.
 * @param {Object} data The data to send to the backend.
 * @returns {Object} The result of the fetch.
 * @throws {Error} If the fetch request fails.
 */
async function sendDataToBackend(data) {
    try {
        const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`dashboard_a_frontend.js ERROR. Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }
        const result = await response.json(); // parse the JSON response from the backend
        return result;
    } catch (error) {
        console.error('dashboard_a_frontend.js: error sending data to backend: ', error);
    }
}

window.addEventListener('message', function(event) { // event listener for message from dashboard frontend
    if (event.origin !== `http://localhost:${A_FRONTEND}`) {
        console.warn('dashboard_a_frontend.js: message received from untrusted origin: ', event.origin);
        return;
    }
    if (event.data && event.data.type === 'BROWSING_DATA') { // User A adds to browsing history
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData.data);
        const data = {
            data: receivedData.data,
            target: 'BROWSING_DATA'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'USER_A_CHOICE') { // User A makes a choice on the email webpage
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);
        const data = {
            data: receivedData,
            target: 'USER_A_CHOICE'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'USER_A_MESSAGE') { // User A sends a message
        const msgContent = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', msgContent);
        const data = {
            data: msgContent,
            target: 'USER_A_MESSAGE'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'SET_EMAIL_SETTINGS') { // email settings are configured
        const settings = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', settings);
        const data = {
            data: settings,
            target: 'SET_EMAIL_SETTINGS'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'UPDATE_REQUEST') { // user requests to update settings
        const user = event.data.payload.user;
        const context = event.data.payload.context;
        console.log('dashboard_a_frontend.js: User ' + user + ' requested to update settings (' + context + ').');
        const data = {
            data: event.data,
            target: 'UPDATE_REQUEST'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'AUTO_MESSAGE') { // User A sends an automatic message to User B
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);
        const data = {
            data: receivedData,
            target: 'AUTO_MESSAGE'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'EMAIL_CONTENT') { // User A forwards email content
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);
        const data = {
            data: receivedData.content,
            target: 'EMAIL_CONTENT'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'ADD_TRUSTED') { // add a trusted contact
        const address = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', address);
        const data = {
            data: address,
            target: 'ADD_TRUSTED'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'REMOVE_TRUSTED') { // remove a trusted contact
        const address = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', address);
        const data = {
            data: address,
            target: 'REMOVE_TRUSTED'
        }
        sendDataToBackend(data);
    }
});
    
console.log('dashboard_a_frontend.js loaded and listening for messages.');