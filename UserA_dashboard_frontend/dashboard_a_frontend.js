// dashboard_a_frontend.js: script running on dashboard page (port 5173)

const A_BACKEND = 5000;
const A_FRONTEND = 5173;

// Function to send data from frontend to backend
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

// Create event listeners
window.addEventListener('message', function(event) {

    if (event.origin !== `http://localhost:${A_FRONTEND}`) {
        console.warn('dashboard_a_frontend.js: message received from untrusted origin: ', event.origin);
        return;
    }

    if (event.data && event.data.type === 'BROWSING_DATA') {
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData.data);

        const data = {
            data: receivedData.data,
            target: 'BROWSING_DATA'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'USER_A_CHOICE') {
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);

        const data = {
            data: receivedData,
            target: 'USER_A_CHOICE'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'USER_A_MESSAGE') {
        const msgContent = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', msgContent);

        const data = {
            data: msgContent,
            target: 'USER_A_MESSAGE'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'SET_EMAIL_SETTINGS') {
        const settings = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', settings);

        const data = {
            data: settings,
            target: 'SET_EMAIL_SETTINGS'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'UPDATE_REQUEST') {
        const user = event.data.payload.user;
        const context = event.data.payload.context;

        console.log('dashboard_a_frontend.js: User ' + user + ' requested to update settings (' + context + ').');

        const data = {
            data: event.data,
            target: 'UPDATE_REQUEST'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'AUTO_MESSAGE') {
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);

        const data = {
            data: receivedData,
            target: 'AUTO_MESSAGE'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'EMAIL_CONTENT') {
        const receivedData = event.data.payload;
        console.log('dashboard_a_frontend.js: received data from Chrome extension: ', receivedData);

        const data = {
            data: receivedData.content,
            target: 'EMAIL_CONTENT'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'ADD_TRUSTED') {
        const address = event.data.payload;
        console.log('dashboard_a_frontend.js: received message data from User A: ', address);

        const data = {
            data: address,
            target: 'ADD_TRUSTED'
        }
        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'REMOVE_TRUSTED') {
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