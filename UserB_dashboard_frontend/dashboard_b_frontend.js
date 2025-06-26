// script running on dashboard page (e.g., http://localhost:6173)

// function to send data from frontend to backend
async function sendDataToBackend(data) {
    try {
        const response = await fetch('http://localhost:5000/api/dashboard-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) // Convert the JavaScript object to a JSON string
        });

        if (!response.ok) {
            const errorData = await response.json(); // Try to parse error message from backend
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json(); // Parse the JSON response from the backend
        console.log('Data sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}


window.addEventListener('message', function(event) {

    if (event.origin !== 'http://localhost:6173') {
        console.warn('Dashboard: Message received from untrusted origin:', event.origin);
        return;
    }

    if (event.data && event.data.type === 'USER_B_RESPONSE') {

        const actionID = event.data.id;
        const outcome = event.data.outcome;
        console.log("dashboard_b_frontend.js: received outcome " + outcome + " for event " + actionID);

        const data = {
            actionID: actionID,
            outcome: outcome,
            target: 'USER_B_RESPONSE'
        }

        console.log('dashboard_b_frontend.js: sending user B response to backend:', data);
        sendDataToBackend(data);
    }

});

console.log('Dashboard script (dashboard_b_frontend) loaded and listening for messages.');