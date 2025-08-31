/**
 * @fileoverview Content script for User B dashboard (port 8080).
 * @file dashboard_b_frontend.js
 * @author Emma Pollard
 * @version 1.0
 */

/**
 * Port on which the User B dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const B_BACKEND = 8080;
/**
 * Port on which User B dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const B_FRONTEND = 6173;

/**
 * Send data from frontend to backend.
 * @param {Object} data The data to send to the backend.
 * @returns {Object} The result of the fetch.
 * @throws {Error} If the fetch request fails.
 */
async function sendDataToBackend(data) {
    try {
        const response = await fetch(`http://localhost:${B_BACKEND}/api/data-b-frontend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`dashboard_b_frontend.js ERROR. Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }
        console.log('dashboard_b_frontned.js: sent data from frontend to backend.');
        const result = await response.json(); // parse the JSON response from the backend
        return result;
    } catch (error) {
        console.error('dashboard_b_frontned.js: error sending data to backend: ', error);
    }
}

window.addEventListener('message', function(event) { // event listener for message from dashboard frontend
    if (event.origin !== `http://localhost:${B_FRONTEND}`) {
        console.warn('dashboard_b_frontend.js: message received from untrusted origin: ', event.origin);
        return;
    }
    if (event.data && event.data.type === 'USER_B_RESPONSE') { // User B responds to a request
        console.log("dashboard_b_frontend.js: ", event.data);
        const actionID = event.data.data.actionID;
        const outcome = event.data.outcome;
        console.log("dashboard_b_frontend.js: received outcome " + outcome + " for event " + actionID);
        const data = {
            data: event.data,
            target: 'USER_B_RESPONSE'
        }
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'USER_B_MESSAGE') { // User B sends a message
        const message = event.data.payload.message;
        const time = event.data.payload.time;
        console.log("dashboard_b_frontend.js: received message " + message + " at time " + time);
        const data = {
            data: event.data,
            target: 'USER_B_MESSAGE'
        }
        console.log('dashboard_b_frontned.js: attempting to send data to backend.');
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'UPDATE_REQUEST') { // request to update settings
        const user = event.data.payload.user;
        const context = event.data.payload.context;
        console.log('dashboard_b_frontend.js: User ' + user + ' requested to update settings (' + context + ').');
        const data = {
            data: event.data,
            target: 'UPDATE_REQUEST'
        }
        console.log('dashboard_b_frontned.js: attempting to send data to backend.');
        sendDataToBackend(data);
    }
    if (event.data && event.data.type === 'USER_B_VIEW') { // User B views browsing history
        console.log('dashboard_b_frontend.js: received message USER_B_VIEW.');
        const data = {
            data: event.data,
            target: 'USER_B_VIEW'
        }
        console.log('dashboard_b_frontned.js: attempting to send data to backend.');
        sendDataToBackend(data);
    }
});

console.log('dashboard_b_frontend.js loaded and listening for messages.');