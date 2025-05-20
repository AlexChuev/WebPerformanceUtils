document.addEventListener('DOMContentLoaded', () => {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("message received");
        if (message.type === 'LAST_MUTATION') {
            document.getElementById('result').textContent = `${message.time.toFixed(2)} ms`;
        } else if (message.type === 'ACTION_TIME') {
            console.log("action message received");
            const resultElement = document.getElementById('result');
            resultElement.textContent = `${message.action}: ${message.time.toFixed(2)} ms`;
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getLastMutationTime
        }, (result) => {
            if (result[0].result) {
                document.getElementById('result').textContent = `${result[0].result.toFixed(2)} ms`;
            }
        });
    });

    chrome.storage.sync.get(['measureActions', 'keyDown', 'keyUp', 'mouseDown', 'mouseUp'], (result) => {
        keyDownCheckBox.checked = result.keyDown || false;
        keyUpCheckBox.checked = result.keyUp || false;
        mouseDownCheckBox.checked = result.mouseDown || false;
        mouseUpCheckBox.checked = result.mouseUp || false;

        const radioButton = document.querySelector(`input[name="measureActions"][value="${result.measureActions}"]`);
        if (radioButton) {
            radioButton.checked = true;
            radioButton.dispatchEvent(new Event('change'));
        }
    });

    measureActionsRadios.forEach(radio => {
        radio.addEventListener('change', radioSelectionChanged);
    });
    checkboxes.forEach(checkBox => {
        checkBox.addEventListener('change', checkBoxSelectionChanged);
    });

    updateCheckboxDisabledState();
});

const measureActionsRadios = document.querySelectorAll('input[name="measureActions"]');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const keyDownCheckBox = document.getElementById('keydown');
const keyUpCheckBox = document.getElementById('keyup');
const mouseDownCheckBox = document.getElementById('mousedown');
const mouseUpCheckBox = document.getElementById('mouseup');
function getLastMutationTime() {
    return lastMutationTime - startTime;
}

function updateCheckboxDisabledState() {
    const selectedValue = document.querySelector('input[name="measureActions"]:checked').value;
    const enableCheckboxes = (selectedValue === 'once' || selectedValue === 'always');

    checkboxes.forEach(checkbox => {
        checkbox.disabled = !enableCheckboxes;
    });
}

function radioSelectionChanged() {
    updateCheckboxDisabledState();
    const selectedValue = document.querySelector('input[name="measureActions"]:checked').value;
    chrome.storage.sync.set({ measureActions: selectedValue }, () => {
        // Notify content script of the change
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'UPDATE_TRACKING',
                measureActions: selectedValue
            });
        });
    });
}

function checkBoxSelectionChanged() {
    const events = {
        keyDown: keyDownCheckBox.checked,
        keyUp: keyUpCheckBox.checked,
        mouseDown: mouseDownCheckBox.checked,
        mouseUp: mouseUpCheckBox.checked
    };

    chrome.storage.sync.set(events);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'UPDATE_EVENTS',
            events: events
        });
    });
}