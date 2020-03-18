var onDeleteItemsClick = () => {
    const boardId = extractId(document.location);
    itemIdsToDelete.forEach(id => makeApiCall(boardId, id));
    chrome.storage.sync.set({'enableBoardItemSelectionMode': false}, _ => {});
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

var onSelectionModeInputChange = (on) => {
    console.log("%cToggle checkbox event", consoleCssText, on);
    if (on) {
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
        console.info("%cFound <a> tag", consoleCssText, aTag);
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
            padding:12px`;
        removeItemsBtn.addEventListener("click", onDeleteItemsClick);
        //const plusButton = document.getElementById("db-add-collaborator-btn");
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

// var createSelectionModeInputElem = () => {
//     const selectionModeCheckbox = document.createElement("input");
//     selectionModeCheckbox.type = "checkbox";
//     selectionModeCheckbox.checked = false;
//     selectionModeCheckbox.title = "Selection mode on/off";
//     selectionModeCheckbox.id = "selection-mode-checkbox";
//     selectionModeCheckbox.style.cssText = "width:2.5em;height:2.5em;"
//     selectionModeCheckbox.addEventListener("change", onSelectionModeInputChange);
//     return selectionModeCheckbox;
// }

chrome.storage.sync.get('enableBoardItemSelectionMode', data => {
    console.log(data);
    if(Object.keys(data).length !== 0) {
        onSelectionModeInputChange(!!data.enableBoardItemSelectionMode);
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if(key === 'enableBoardItemSelectionMode') {
            var storageChange = changes[key];
            onSelectionModeInputChange(storageChange.newValue);
            console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
            break;
          }
    }
  });


let itemIdsToDelete = [];
const removeBtnId = "remove-items-btn";
const consoleCssText = "background: #00ab80; color: white; font-weight:bold";
//const plusButton = document.getElementById("db-add-collaborator-btn");
//const selectionModeCheckbox = createSelectionModeInputElem();
//plusButton.parentElement.insertBefore(selectionModeCheckbox, plusButton);