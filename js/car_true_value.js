const keywords = {
    "OUTOFSTOCK": "out of stock"
};

const conditions = {
    "USED": "used",
    "DAMAGED": "damaged",
    "REFURBISHED": "refurbished"
};

const productCatMetaTagContent = (document.head.querySelector("meta[property='product:category']").getAttribute("content") || '').toLowerCase();
const isCarDetailPage = productCatMetaTagContent.indexOf("car") > -1 || productCatMetaTagContent.indexOf("truck") > -1;
const isDamaged = (document.head.querySelector("meta[property='product:condition']").getAttribute("content") || '').toLowerCase() === conditions.DAMAGED;
const currentCar = {};

if (isCarDetailPage && !isDamaged) {
    //console.info("We are on car listing page");
    const pageTitle = document.title.toLowerCase().replace(/\W+/gi, '');
    const forSaleIndex = pageTitle.indexOf('forsale');
    currentCar.description = pageTitle.substring(0, forSaleIndex).trim();
    currentCar.year = getYear(pageTitle);
    currentCar.lat = document.head.querySelector("meta[property='place:location:latitude']").getAttribute("content");
    currentCar.lng = document.head.querySelector("meta[property='place:location:longitude']").getAttribute("content");
    currentCar.mileage = getMileage();
    currentCar.price = getPrice();

    if (currentCar.year && currentCar.mileage && currentCar.lat && currentCar.lng) {
        //showAlternatives(); - Marketcheck API is not free anymore so this won't work 
    }
}

function showAlternatives() {
    chrome.storage.local.set({ 'currentCar': currentCar });
    const xpath = "//div[@data-test='price-label']";
    const priceLabelDiv = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const parent = priceLabelDiv.parentElement;
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="spinner" class="spinner-grow spinner-grow-md text-success" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        <a id="show-deals" class="text-success font-weight-bold text-md">Loading similar offers nearby...</a>
        <hr>
    `;
    parent.insertBefore(container, priceLabelDiv.nextSibling);
    setTimeout(_ => {
        document.getElementById("spinner").hidden = true;
        const link = document.getElementById("show-deals");
        link.innerHTML = "💰 See cheaper vehicles with similar mileage nearby";
        link.addEventListener('click', () => chrome.runtime.sendMessage({ showSimilarCars: true }));
    }, 2500)

}

function getYear(s) {
    const matches = s.match(/\d{4}/);
    return matches ? matches[0] : null;
}

function checkSold() {
    return (document.head.querySelector("meta[property='product:availability']").getAttribute("content") || '').toLowerCase() === keywords.OUTOFSTOCK;
}

function getPrice() {
    return (document.head.querySelector("meta[property='product:price:amount']").getAttribute("content") || null);
}

function getMileage() {
    const matches = document.body.innerText.match(/\d+\sMiles/);
    return matches && matches.length > 0
        ? matches[0].split(' ')[0]
        : null;
}

// function getZipCodeApiUrl(s) {
//     let inIndex = s.indexOf(keywords.IN);
//     inIndex += keywords.IN.length;
//     const dashIndex = s.indexOf(keywords.DASH);
//     const location = s.substring(inIndex, dashIndex).trim().split(', ');
//     const city = location[0];
//     const state = location[1];

//     return `https://www.zipcodeapi.com/rest/${key}/city-zips.json/${city}/${state}`;
// }

// function getGoogleMapUrl() {
//     const lat = document.head.querySelector("meta[property='place:location:latitude']").getAttribute("content");
//     const lon = document.head.querySelector("meta[property='place:location:longitude']").getAttribute("content");
//     const scriptScr = [...document.scripts].find(s => s.src.startsWith('https://maps.googleapis.com/maps/api/js')).src;
//     const query = scriptScr.split('?')[1];
//     const urlParams = new URLSearchParams(query);
//     const key = urlParams.get('key');
//     return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}&result_type=postal_code`;
// }

// async function getZipCodeAsync(url) {
//     const res = await fetch(url);
//     console.log(res);
//     if(!res.ok || res.status === 429) {
//         //429 means exceeded quota
//         return null;
//     }
//     const json = await res.json();
//     return json.zip_codes[0];
// }

// async function getZipCodeAsyncGoogle(url) {
//     const res = await fetch(url);
//     console.log(res);
//     if(!res.ok) {
//         return null;
//     }
//     const json = await res.json();
//     return json.results[0].address_components.find(x => x.types.includes("postal_code")).short_name;
// }
