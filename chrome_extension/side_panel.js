// sidepanel.js (script for side panel html)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("side_panel received message:", message);
    document.getElementById('currentURL').innerText = message.newUrlMessage[0];
    document.getElementById('currentTimestamp').innerText = message.newUrlMessage[1];


    // TO DO: send url to node.js to store in database

});
