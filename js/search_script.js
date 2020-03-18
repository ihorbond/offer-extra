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

    [...document.getElementsByTagName("a")].forEach(el => {
        if (isItemLink(el)) {
            const query = searchInput.value.trim();

            if(query === "") {
                el.parentElement.hidden = false;
            }
            else {
                const description = [...el.firstChild.lastChild.getElementsByTagName("span")]
                    .map(x => x.innerText)
                    .join('')
                    .toLowerCase();
                el.parentElement.hidden = description.indexOf(query) === -1;
            }
        }
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