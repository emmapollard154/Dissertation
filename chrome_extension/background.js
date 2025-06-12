
chrome.action.onClicked.addListener((tab) => {
    // open side panel when extension icon clicked
    chrome.sidePanel.open({ tabId: tab.id }, () => {
        console.log("Side Panel Opened");
    });
});