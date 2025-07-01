// content script for dashboard A from chrome extension

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content_dashboard_a.js received message from:', sender.id, 'with data:', request);

    if (request.action === 'browsingHistoryUpdate') { 
        const receivedData = request;
        console.log('Content Script (Dashboard A): Processing data from side_panel:', receivedData);

        window.postMessage({
            type: 'BROWSING_DATA',
            payload: receivedData
        }, 'http://localhost:5173'); // dashboard origin

        // send response to side_panel
        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: receivedData });
    }

    if (request.action === "emailAChoice") {

        const id = request.id
        const choice = request.choice;
        const time = request.time

        const payload = {
            id: id,
            choice: choice,
            time: time,
            context: "Email"
        }


		console.log('Content Script (Dashboard A): choice received - ', choice)
		console.log("Sending choice to dashboard A");

        window.postMessage({
            type: 'USER_A_CHOICE',
            payload: payload
        }, 'http://localhost:5173');

        sendResponse({ status: 'content_script_received_and_processed', dataProcessed: choice });
        // location.reload();
    }


    // if (request.action === "userAMessage") {

    //     const message = request.message;
    //     const time = request.time;

    //     const payload = {
    //         message: message,
    //         time: time,
    //     }


	// 	console.log('Content Script (Dashboard A): message received - ', payload);
	// 	console.log("Sending choice to dashboard A");

    //     window.postMessage({
    //         type: 'USER_A_MESSAGE',
    //         payload: payload
    //     }, 'http://localhost:5173');

    //     sendResponse({ status: 'content_script_received_and_processed', dataProcessed: payload });
    //     // location.reload();
    // }


});

console.log('Content script (dashboard) loaded and listening for messages.');
