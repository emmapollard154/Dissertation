/**
 * @fileoverview Content script for User B dashboard (port 8080).
 * @file dashboard_b_frontend.js
 * @author Emma Pollard
 * @version 1.0
 */

const B_BACKEND = 8080;
const B_FRONTEND = 6173;
const A_BACKEND = 5000;

// Function to send data from frontend to backend
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

// Create event listeners
window.addEventListener('message', function(event) {

    if (event.origin !== `http://localhost:${B_FRONTEND}`) {
        console.warn('dashboard_b_frontend.js: message received from untrusted origin: ', event.origin);
        return;
    }

    if (event.data && event.data.type === 'USER_B_RESPONSE') {

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

    if (event.data && event.data.type === 'USER_B_MESSAGE') {

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

    if (event.data && event.data.type === 'UPDATE_REQUEST') {

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

    if (event.data && event.data.type === 'USER_B_VIEW') {

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