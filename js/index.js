document.getElementById("test").addEventListener('click', e => {
    e.target.innerText = "TEST";
    chrome.storage.sync.set({'enableBoardItemSelectionMode': true}, _ => {});
});

var options = [...document.getElementsByName("options")];

options[0].addEventListener('click', e => {
    chrome.storage.sync.set({'enableBoardItemSelectionMode': true}, _ => {});
});

options[1].addEventListener('click', e => {
    chrome.storage.sync.set({'enableBoardItemSelectionMode': false}, _ => {});
});