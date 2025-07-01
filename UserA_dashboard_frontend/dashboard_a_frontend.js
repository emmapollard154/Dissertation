// script running on dashboard page (e.g., http://localhost:5173)

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
        // throw error; // Re-throw to allow further handling if needed
    }
}



// function to send message between endpoints via hub
async function sendMessageToBackend(data) {
    try {
        const response = await fetch('http://localhost:5000/api/message-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('Data sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}


window.addEventListener('message', function(event) {

    if (event.origin !== 'http://localhost:5173') {
        console.warn('Dashboard: Message received from untrusted origin:', event.origin);
        return;
    }

    if (event.data && event.data.type === 'BROWSING_DATA') {
        const receivedData = event.data.payload;
        console.log('Dashboard: Received data from Chrome extension:', receivedData.data);

        const data = {
            data: receivedData.data,
            target: 'BROWSING_DATA'
        }

        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'USER_A_CHOICE') {

        const receivedData = event.data.payload;

        console.log('Dashboard: Received choice data from Chrome extension:', receivedData);

        const data = {
            data: receivedData,
            target: 'USER_A_CHOICE'
        }

        sendDataToBackend(data);
    }

    if (event.data && event.data.type === 'USER_A_MESSAGE') {

        const msgContent = event.data.payload;

        console.log('Dashboard A: Received message data from user A:', msgContent);

        const data = {
            data: msgContent,
            target: 'USER_A_MESSAGE'
        }

        // sendMessageToBackend(data);
        sendDataToBackend(data);
    }

});

console.log('Dashboard script (dashboard_a_frontend) loaded and listening for messages.');