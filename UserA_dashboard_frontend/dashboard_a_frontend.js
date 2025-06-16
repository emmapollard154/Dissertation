// This script runs on your dashboard page (e.g., http://localhost:5173)

window.addEventListener('message', function(event) {
    // 1. IMPORTANT SECURITY CHECK: Verify the origin of the message
    // This ensures you only process messages from trusted sources.
    if (event.origin !== 'http://localhost:5173') { // Or your specific domain, e.g., 'https://yourdashboard.com'
        console.warn('Dashboard: Message received from untrusted origin:', event.origin);
        return; // Ignore messages from other origins
    }

    // 2. Check if the message has the expected type from your extension
    if (event.data && event.data.type === 'BROWSING_DATA') {
        const receivedData = event.data.newUrlMessage;
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

console.log('Dashboard script loaded and listening for messages.');