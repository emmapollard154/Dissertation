document.getElementById('buttonToDashboard').addEventListener('click', function() {
    // chrome.runtime.sendMessage({ action: "openDashboard", url: "http://localhost:5173/" });
    chrome.runtime.sendMessage({ action: "openDashboard"});
});