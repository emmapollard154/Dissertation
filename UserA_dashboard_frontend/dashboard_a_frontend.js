// script running on dashboard page (e.g., http://localhost:5173)

window.addEventListener('message', function(event) {

    if (event.origin !== 'http://localhost:5173') {
        console.warn('Dashboard: Message received from untrusted origin:', event.origin);
        return;
    }

    if (event.data && event.data.type === 'BROWSING_DATA') {
        const receivedData = event.data.payload;
        console.log('Dashboard: Received data from Chrome extension:', receivedData);

        // Now you have the `receivedData` object.
        // You can use it to update your UI, send to your backend, etc.

        // Example: Update the display on the dashboard
        // const dataDisplay = document.getElementById('receivedDataJson');
        // if (dataDisplay) {
        //     dataDisplay.textContent = JSON.stringify(receivedData, null, 2);
        // }

        // Example: If you want to send this data to your database:
        // You would typically make an AJAX/fetch request to your backend here.
        /*
        fetch('/api/saveExtensionData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receivedData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dashboard: Data successfully sent to backend:', data);
        })
        .catch(error => {
            console.error('Dashboard: Error sending data to backend:', error);
        });
        */

    }
});

console.log('Dashboard script (dashboard_a_frontend) loaded and listening for messages.');