var makeApiCall = (boardId) => {
    fetch(`https://offerup.com/webapi/offer_boards/v1/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then(res => res.json()).then(console.log)
}

var isItemLink = (elem) => {
    return elem.href
        ? (function () {
            const urlParts = elem.href.split("/").filter(x => x !== "");
            const lastIndex = urlParts.length - 1;
            const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(urlParts[lastIndex]);
            return isGuid && urlParts[lastIndex - 1] === "board";
        })()
        : false;
}

var extractId = (elem) => {
    const urlParts = elem.href.split("/").filter(x => x !== "");
    const lastPartIndex = urlParts.length - 1;
    return urlParts[lastPartIndex];
}

var onDeleteItemClick = (e, boardId) => {
    e.preventDefault();
    makeApiCall(boardId);
    location.reload();
}

var addDeleteIcon = (elem, boardId) => {
    const deleteIcon = document.createElement("a");
    deleteIcon.innerText = "❌";
    deleteIcon.title = "Remove board";
    deleteIcon.style.cssText = `
        position: absolute;
        font-size: 20px;
        right: 15px;
        z-index: 999
    `;
    deleteIcon.addEventListener('click', e => onDeleteItemClick(e, boardId));
    elem.appendChild(deleteIcon);
}

[...document.getElementsByTagName("a")].forEach(el => {
    if (isItemLink(el)) {
        const elem = el.firstChild.lastChild.getElementsByTagName("div")[0];
        const id = extractId(el);
        addDeleteIcon(elem, id);
    }
});