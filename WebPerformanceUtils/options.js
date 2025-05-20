document.addEventListener('DOMContentLoaded', () => {
    const timeoutInput = document.getElementById('timeoutInput');
    const selectorInput = document.getElementById('selectorInput');
    const loggingCheckbox = document.getElementById('loggingCheckbox');
    const saveButton = document.getElementById('saveButton');

    // Load existing settings
    chrome.storage.sync.get(['mutationTimeout', 'cssSelector', 'extendedLogging'], (result) => {
        if (result.mutationTimeout) {
            timeoutInput.value = result.mutationTimeout;
        }
        if (result.cssSelector) {
            selectorInput.value = result.cssSelector;
        }
        loggingCheckbox.checked = result.extendedLogging || false;
    });

    // Save settings
    saveButton.addEventListener('click', () => {
        const timeoutValue = parseInt(timeoutInput.value, 10) || 500;
        const selectorValue = selectorInput.value || 'body'; // Default to 'body'
        const loggingValue = loggingCheckbox.checked;

        chrome.storage.sync.set({ mutationTimeout: timeoutValue, cssSelector: selectorValue, extendedLogging: loggingValue }, () => {
            alert('Settings saved!');
        });
    });
});