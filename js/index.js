const state = {
    ON: 1,
    OFF: 0
};

const selectionModeSlider = document.getElementById("boardItemSelectionModeSlider");

chrome.storage.sync.get('enableBoardItemSelectionMode', data => {
    if (Object.keys(data).length !== 0) {
        selectionModeSlider.value = data.enableBoardItemSelectionMode || state.OFF;
        selectionModeSlider.oninput();
    }
});

selectionModeSlider.oninput = function() {
    this.value == state.ON
        ? turnOn.bind(this)()
        : turnOff.bind(this)();

    sendMessageToBoardItemSelectorScript(+this.value);
    chrome.storage.sync.set({ 'enableBoardItemSelectionMode': +this.value });
}

function sendMessageToBoardItemSelectorScript(state) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 'enableBoardItemSelectionMode': state }, console.log);
    });
}

function turnOn() {
    this.classList.add('slider-on');
    this.classList.remove('slider-off');
}

function turnOff() {
    this.classList.remove('slider-on');
    this.classList.add('slider-off');
}
