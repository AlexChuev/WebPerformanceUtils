let lastMutationTime = null;
let startTime = null;
let actionTracking = 'off';  // can be 'off', 'once', 'always'
let trackedEvents = {
    keyDown: false,
    keyUp: false,
    mouseDown: false,
    mouseUp: false
};

chrome.storage.sync.get(['mutationTimeout', 'cssSelector', 'extendedLogging', 'measureActions', 'keyDown', 'keyUp', 'mouseDown', 'mouseUp'], (result) => {
    const TIMEOUT_PERIOD = result.mutationTimeout || 500;
    const SELECTOR = result.cssSelector || 'body';
    const LOGGING_ENABLED = result.extendedLogging || false;

    let mutationTimeout = null;

    actionTracking = result.measureActions || 'off';
    trackedEvents = {
        keyDown: result.keyDown || false,
        keyUp: result.keyUp || false,
        mouseDown: result.mouseDown || false,
        mouseUp: result.mouseUp || false
    };

    function trackMutations() {
        const targetNode = document.querySelector(SELECTOR);

        const observerCallback = (mutationsList, observer) => {
            lastMutationTime = performance.now();
            if (LOGGING_ENABLED) {
                console.log(`Mutation observed at: ${lastMutationTime.toFixed(2)}ms`);
            }
            if (mutationTimeout) {
                clearTimeout(mutationTimeout);
            }

            mutationTimeout = setTimeout(() => {
                const result = `Last change detected after: ${(lastMutationTime - startTime).toFixed(2)}ms`;
                console.log(result);
                chrome.runtime.sendMessage({ type: 'LAST_MUTATION', time: lastMutationTime });
                observer.disconnect();
            }, TIMEOUT_PERIOD);
        };

        const observer = new MutationObserver(observerCallback);
        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        };

        startTime = performance.now();
        observer.observe(targetNode, config);
    }

    function onKeyUp(event) {
        if (!trackedEvents.keyUp || actionTracking === 'off') return;
        trackMutations();
        //const time = performance.now();
        //chrome.runtime.sendMessage({ type: 'ACTION_TIME', action: 'keyUp', time });
        if (actionTracking === 'once') trackedEvents.keyUp = false;
    }

    function onKeyDown(event) {
        if (!trackedEvents.keyDown || actionTracking === 'off') return;
        trackMutations();
        //const time = performance.now();
        //chrome.runtime.sendMessage({ type: 'ACTION_TIME', action: 'keyDown', time });
        if (actionTracking === 'once') trackedEvents.keyDown = false;
    }

    function onMouseDown(event) {
        if (!trackedEvents.mouseDown || actionTracking === 'off') return;
        trackMutations();
        //const time = performance.now();
        //chrome.runtime.sendMessage({ type: 'ACTION_TIME', action: 'mouseDown', time });
        if (actionTracking === 'once') trackedEvents.mouseDown = false;
    }

    function onMouseUp(event) {
        if (!trackedEvents.mouseUp || actionTracking === 'off') return;
        trackMutations();
        //const time = performance.now();
        //chrome.runtime.sendMessage({ type: 'ACTION_TIME', action: 'mouseUp', time });
        if (actionTracking === 'once') trackedEvents.mouseUp = false;
    }

    trackMutations();
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('mouseup', onMouseUp, true);
    window.addEventListener('mousedown', onMouseDown, true);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'UPDATE_TRACKING') {
            actionTracking = message.measureActions;
        } else if (message.type === 'UPDATE_EVENTS') {
            trackedEvents = { ...trackedEvents, ...message.events };
        }
    });
});