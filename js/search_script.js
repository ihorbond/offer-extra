var isItemLink = (elem) => {
    return elem.href
        ? (function () {
            const urlParts = elem.href.split("/").filter(x => x !== "");
            const lastIndex = urlParts.length - 1;
            return !isNaN(urlParts[lastIndex]) && urlParts[lastIndex - 1] === "detail";
        })()
        : false;
}

var onSearch = (e) => {
    e.preventDefault();

    const query = searchInput.value.trim();
    let newCount = 0;

    if(query === '') {
        boardItems.forEach(x => x.parentElement.hidden = false);
        newCount = boardItems.length;
    }
    else {
        boardItems.forEach(el => {
            const description = [...el.firstChild.lastChild.getElementsByTagName("span")]
                .map(x => x.innerText)
                .join('')
                .toLowerCase();
    
            console.log(description, el.parentElement.hidden);
            if(description.indexOf(query) === -1) {
                el.parentElement.hidden = true;
            }
            else{
                el.parentElement.hidden = false;
                newCount++;
            }
        });
    }
    
    itemCount.innerText = `${newCount} item${newCount === 1 ? '':'s'}`;
    console.log("=================================================================");
}

const itemCount = [...document.getElementsByTagName('span')].filter(x => /\d+\s[A-Za-z]+/.test(x.innerText))[0];
console.log(itemCount);

var boardItems = [];
const boardItemsContainer = document.getElementById("board-items");
if(boardItemsContainer) {
    boardItemsContainer.style.flexWrap = 'wrap';
    boardItems = [...boardItemsContainer.getElementsByTagName("a")];
    boardItemsContainer.innerHTML = '';
    boardItems.forEach(x => {
        var div = document.createElement("div");
        div.appendChild(x);
        boardItemsContainer.appendChild(div);
    });
}

const form = document.getElementsByTagName("form")[0];
const nearbyInputContainer = form.childNodes[2];
form.removeChild(nearbyInputContainer);

const searchInput = document.getElementsByName("q")[0];
searchInput.placeholder = "Search current board";
searchInput.addEventListener("keyup", onSearch);

const goButton = form.lastChild.firstChild;
goButton.addEventListener('click', onSearch);