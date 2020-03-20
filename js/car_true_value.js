const productCatMetaTagContent = (document.head.querySelector("meta[property='product:category']").getAttribute("content") || '').toLowerCase();
const isCarDetailPage = productCatMetaTagContent.indexOf("car") > -1 || productCatMetaTagContent.indexOf("truck") > -1;

const keywords = {
    "FORSALE": "for sale",
    "OUTOFSTOCK": "out of stock",
    "IN": "in",
    "DASH": "-"
};

const conditions = {
    "USED": "used",
    "DAMAGED": "damaged"
};

if(isCarDetailPage) {
    console.info("We are on car listing page");
    const pageTitle = document.title.toLowerCase();
    const year = getYear(pageTitle);
    const makeAndModel = getMakeAndModel(pageTitle);
    const isSold = checkSold();
    const mileage = getMileage();
    const condition = getCondition();
    getZipCodeAsync(getZipCodeApiUrl(pageTitle)).then(zipCode => {
        if(zipCode){
            console.log(`Year: ${year}`, `MakeModel: ${makeAndModel}`, isSold, condition, mileage, zipCode);
        }else {
            getZipCodeAsyncGoogle(getGoogleMapUrl()).then(zipCode => {
                console.log(`Year: ${year}`, `MakeModel: ${makeAndModel}`, isSold, condition, mileage, zipCode);
            });
        }
    })
}

function getYear(s) {
    return s.match(/\d{4}/)[0];
}

function getMakeAndModel(s) {
    const forSaleIndex = s.indexOf(keywords.FORSALE);
    return s.substring(4, forSaleIndex).trim();
}

function checkSold() {
    return (document.head.querySelector("meta[property='product:availability']").getAttribute("content") || '').toLowerCase() === keywords.OUTOFSTOCK;
}

function getCondition() {
    return (document.head.querySelector("meta[property='product:condition']").getAttribute("content") || '').toLowerCase();
}

function getMileage() {
    const matches = document.body.innerText.match(/\d+\sMiles/);
    return matches.length > 0 
        ? matches[0].split(' ')[0] 
        : null;
}

function getZipCodeApiUrl(s) {
    let inIndex = s.indexOf(keywords.IN);
    inIndex += keywords.IN.length;
    const dashIndex = s.indexOf(keywords.DASH);
    const location = s.substring(inIndex, dashIndex).trim().split(', ');
    const city = location[0];
    const state = location[1];
    const key = atob('anMtSWhPRjJDZklHRzU1czZBajJhcjdHZkZYRjgxOWN0TlU4YkpMd0tRdDhCaE1zTjQ1TEpQMGFsd29sMVoyRjR4TA==');
    return `https://www.zipcodeapi.com/rest/${key}/city-zips.json/${city}/${state}`;
}

function getGoogleMapUrl() {
    const lat = document.head.querySelector("meta[property='place:location:latitude']").getAttribute("content");
    const lon = document.head.querySelector("meta[property='place:location:longitude']").getAttribute("content");
    const scriptScr = [...document.scripts].find(s => s.src.startsWith('https://maps.googleapis.com/maps/api/js')).src;
    const query = scriptScr.split('?')[1];
    const urlParams = new URLSearchParams(query);
    const key = urlParams.get('key');
    return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}&result_type=postal_code`;
}

async function getZipCodeAsync(url) {
    const res = await fetch(url);
    console.log(res);
    if(!res.ok || res.status === 429) {
        //429 means exceeded quota
        return null;
    }
    const json = await res.json();
    return json.zip_codes[0];
}

async function getZipCodeAsyncGoogle(url) {
    const res = await fetch(url);
    console.log(res);
    if(!res.ok) {
        return null;
    }
    const json = await res.json();
    return json.results[0].address_components.find(x => x.types.includes("postal_code")).short_name;
}
