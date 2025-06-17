// script running on dashboard page (e.g., http://localhost:5173)

// function to send data from frontend to backend
async function sendHistoryToBackend(data) {
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
        // Handle network errors or other exceptions
        // You can update your UI to show an error message
        throw error; // Re-throw to allow further handling if needed
    }
}


window.addEventListener('message', function(event) {

    if (event.origin !== 'http://localhost:5173') {
        console.warn('Dashboard: Message received from untrusted origin:', event.origin);
        return;
    }

    if (event.data && event.data.type === 'BROWSING_DATA') {
        const receivedData = event.data.payload;
        console.log('Dashboard: Received data from Chrome extension:', receivedData);

        sendHistoryToBackend(receivedData)


    }
});

console.log('Dashboard script (dashboard_a_frontend) loaded and listening for messages.');