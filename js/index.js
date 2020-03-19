const state = {
    ON: 1,
    OFF: 0
};

var selectionModeSlider = document.getElementById("boardItemSelectionModeSlider");

chrome.storage.sync.get('enableBoardItemSelectionMode', data => {
    if(Object.keys(data).length !== 0){
        selectionModeSlider.value = data.enableBoardItemSelectionMode || 0;
        selectionModeSlider.oninput();
    }
});

selectionModeSlider.oninput = function() {
    if(this.value == state.ON) {
        turnOn.bind(this)();
        sendMessageToBoardItemSelectorScript(state.ON);
        chrome.storage.sync.set({'enableBoardItemSelectionMode': state.ON}, _ => {});
    }
    else {
        turnOff.bind(this)();
        sendMessageToBoardItemSelectorScript(state.OFF);
        chrome.storage.sync.set({'enableBoardItemSelectionMode': state.OFF}, _ => {});
    }
}

function sendMessageToBoardItemSelectorScript(state) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {'enableBoardItemSelectionMode': state}, function(response) {
          console.log(response.ack);
        });
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

//var searchModeSlider = document.getElementById("boardItemSearchModeSlider");

// searchModeSlider.oninput = function() {
//     if(this.value == 0) {
//         turnOff.bind(this)();
//         chrome.storage.sync.set({'enableBoardItemSearchMode': 0}, _ => {});
//     }
//     else {
//         turnOn.bind(this)();
//         chrome.storage.sync.set({'enableBoardItemSearchMode': 1}, _ => {});
//     }
// }
