chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LAST_MUTATION') {
        console.log(`Last mutation time received: ${message.time.toFixed(2)}ms`);
        chrome.storage.local.set({ lastMutationTime: message.time });
    } else if (message.type === 'ACTION_TIME') {
        console.log(`${message.action} time: ${message.time.toFixed(2)}ms`);
        chrome.storage.local.set({ [`last${message.action}Time`]: message.time });
        chrome.runtime.sendMessage({
            type: 'UPDATE_ACTION_TIME',
            action: message.action,
            time: message.time
        });
    }
});

// This could also handle other events, like extension installation, tab updates, etc.
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed and background script running');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        console.log('Tab updated and loaded:', tab.url);

        // You could also do something here, like inject scripts or log data
    }
});