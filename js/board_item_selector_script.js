let itemIdsToDelete = [];
const removeBtnId = "remove-items-btn";
const consoleCssText = "background: #00ab80; color: white; font-weight:bold";

const state = {
    ON: 1,
    OFF: 0
};

var onDeleteItemsClick = () => {
    const boardId = extractId(document.location);
    itemIdsToDelete.forEach(id => makeApiCall(boardId, id));
    location.reload();
}

var makeApiCall = (boardId, itemId) => {
    fetch(`https://offerup.com/webapi/offer_boards/v1/boards/${boardId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then(res => res.json()).then(console.log)
}

var onSelectionModeStateChange = (currState) => {
    //console.debug("%cSelection mode: ", consoleCssText, currState);
    if (currState === state.ON) {
        addGlobalClickEventListener();
    } else {
        removeGlobalClickEventListener();
        deselectAllItems();
        addRemoveDeleteItemsBtn();
    }
}

var hideRemoveItemsBtn = () => {
    document.getElementById(removeBtnId).hidden = true;
}

var deselectAllItems = () => {
    [...document.getElementsByTagName("a")].forEach(el => {
        if (isItemLink(el)) {
            const container = el.firstChild;
            const checkMarkDiv = [...container.children].find(x => x.innerText === "✅");
            if (checkMarkDiv) {
                checkMarkDiv.hidden = true;
            }
        }
    });

    itemIdsToDelete = [];
}

var addGlobalClickEventListener = () => {
    document.addEventListener("click", onGlobalClickEvent);
}

var removeGlobalClickEventListener = () => {
    document.removeEventListener('click', onGlobalClickEvent);
}

var onGlobalClickEvent = (e) => {
    const aTag = e.path.find(isItemLink);
    if (aTag) {
        e.preventDefault();
        //console.info("%cFound <a> tag", consoleCssText, aTag);
        addRemoveSelectionModeInputElem(aTag);
    }
}

var isItemLink = (elem) => {
    return elem.href
        ? (function () {
            const urlParts = elem.href.split("/").filter(x => x !== "");
            const lastIndex = urlParts.length - 1;
            return !isNaN(urlParts[lastIndex]) && urlParts[lastIndex - 1] === "detail";
        })()
        : false;
}

var addRemoveDeleteItemsBtn = () => {
    let removeItemsBtn = document.getElementById(removeBtnId);
    if (!removeItemsBtn) {
        removeItemsBtn = document.createElement("button");
        removeItemsBtn.id = removeBtnId;
        removeItemsBtn.innerText = "Remove";
        removeItemsBtn.style.cssText = `
            cursor:pointer;
            background-color:#00ab80;
            border-color:#00ab80;
            border-radius:8px;
            border-style:none;
            font-weight:bold;
            color:white;
            padding:12px;
            margin-right:5px`;
        removeItemsBtn.addEventListener("click", onDeleteItemsClick);
        const container = document.getElementById("db-add-collaborator-btn").parentElement;
        container.insertBefore(removeItemsBtn, container.children[0]);
    }

    removeItemsBtn.hidden = itemIdsToDelete.length === 0;
}

var addRemoveSelectionModeInputElem = (aTag) => {
    const container = aTag.firstChild;
    let checkMarkDiv = [...container.children].find(x => x.innerText === "✅");

    if (checkMarkDiv) {
        checkMarkDiv.hidden = !checkMarkDiv.hidden;
    } else {
        checkMarkDiv = document.createElement("div");
        checkMarkDiv.innerText = "✅";
        checkMarkDiv.style.cssText = "position:absolute; z-index:999; right:0; top:10px; font-size:30px";
        container.insertBefore(checkMarkDiv, container.childNodes[0]);
    }

    const itemId = extractId(aTag);
    checkMarkDiv.hidden
        ? itemIdsToDelete = itemIdsToDelete.filter(x => x !== itemId)
        : itemIdsToDelete.push(itemId);

    console.info("%cIDs to delete", consoleCssText, itemIdsToDelete);
    addRemoveDeleteItemsBtn();
}

var extractId = (elem) => {
    const urlParts = elem.href.split("/").filter(x => x !== "");
    const lastPartIndex = urlParts.length - 1;
    return urlParts[lastPartIndex];
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        onSelectionModeStateChange(request.enableBoardItemSelectionMode || state.OFF);
        sendResponse({ack: "10-4"});
    });

var onSelectSold = (soldItems) => {
    soldItems.forEach(addRemoveSelectionModeInputElem);
}

var createSelectSoldBtn = (soldItems) => {
    const selectSoldBtn = document.createElement("button");
    selectSoldBtn.innerText = "Select SOLD";
    selectSoldBtn.style.cssText = `
        cursor:pointer;
        background-color:#00ab80;
        border-color:#00ab80;
        border-radius:8px;
        border-style:none;
        font-weight:bold;
        color:white;
        padding:12px`;
    selectSoldBtn.addEventListener("click", e => onSelectSold(soldItems));
    return selectSoldBtn;
}

const soldItems = [...document.getElementsByTagName('a')]
        .filter(aTag => isItemLink(aTag) && aTag.innerText.indexOf('SOLD') !== -1);

if(soldItems.length > 0) {
    const plusButton = document.getElementById("db-add-collaborator-btn");
    const selectSoldBtn = createSelectSoldBtn(soldItems);
    plusButton.parentElement.insertBefore(selectSoldBtn, plusButton);
}
