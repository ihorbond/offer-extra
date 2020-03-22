const productCatMetaTagContent = (document.head.querySelector("meta[property='product:category']").getAttribute("content") || '').toLowerCase();
const isCarDetailPage = productCatMetaTagContent.indexOf("car") > -1 || productCatMetaTagContent.indexOf("truck") > -1;

const keywords = {
    "OUTOFSTOCK": "out of stock",
    "IN": "in",
    "DASH": "-"
};

const conditions = {
    "USED": "used",
    "DAMAGED": "damaged"
};

const key = atob('TDNsNng3aUpBY1h3Y0tGUFFqdkRWNEdlYkVPYUlDUWs=');
let make = null;
let model = null;
let year = null;
let trim = null;
let lat = null;
let lng = null;
let mileage = null;

if(isCarDetailPage) {
    console.info("We are on car listing page");
    const condition = getCondition();

    if(condition === conditions.USED) {
        const pageTitle = document.title.toLowerCase().replace(/\W+/gi, '');
        const forSaleIndex = pageTitle.indexOf('forsale');
        const desc = pageTitle.substring(0, forSaleIndex).trim();
        year = getYear(pageTitle);
        lat = document.head.querySelector("meta[property='place:location:latitude']").getAttribute("content");
        lng = document.head.querySelector("meta[property='place:location:longitude']").getAttribute("content");
        mileage = getMileage();
        
        //showAlternatives({a:1, b:2});
        getMakeModelTrim(desc);
    }

    // const isSold = checkSold();
    // const similarItems = getSimilarItemsJson();

    // getZipCodeAsync(getZipCodeApiUrl(pageTitle)).then(zipCode => {
    //     if(zipCode){
    //         console.log(`Year: ${year}`, `MakeModel: ${makeAndModel}`, isSold, condition, mileage, zipCode);
    //     }else {
    //         getZipCodeAsyncGoogle(getGoogleMapUrl()).then(zipCode => {
    //             console.log(`Year: ${year}`, `MakeModel: ${makeAndModel}`, isSold, condition, mileage, zipCode);
    //         });
    //     }
    // })
}

async function getMakeModelTrim(desc) {
    const url = `https://marketcheck-prod.apigee.net/v1/search?api_key=${key}&rows=0&facets=make|0|200`;

    await fetch(url)
        .then(makesResponse => getMake(makesResponse, desc))
        .then(make => getModel(make, desc))
        .then(model => getTrim(make, model, year, desc))
        .then(_ => getSimilarListings(50, conditions.USED, 'price', 'asc', true))
        .then(json => showAlternatives(json))
        .catch(err => console.error(err));
}

function showAlternatives(json) {
    console.log(json);
    chrome.storage.local.set({'similarCars': json});

    const xpath = "//div[@data-test='price-label']";
    const priceLabelDiv = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const parent = priceLabelDiv.parentElement;
    const myHr = document.createElement('hr');
    const myLink = document.createElement('a');
    myLink.innerText = "See cheaper vehicles with similar mileage nearby";
    myLink.addEventListener('click', () => chrome.runtime.sendMessage({showSimilarCars: true}));
    parent.insertBefore(myHr, priceLabelDiv.nextSibling);
    parent.insertBefore(myLink, myHr);
}

async function getMake(res, desc) {
    if(res.ok) {
        const json = await res.json();
        const match = json.facets.make.find(x => desc.indexOf(x.item.toLowerCase()) > -1);
        if(match){
            make = match.item;
            return Promise.resolve(make);
        }
        else {
            return Promise.reject("Make not found");
        }
    }

    return Promise.reject(res);
}

async function getModel(make, desc) {
    const url = `https://marketcheck-prod.apigee.net/v1/search?api_key=${key}&rows=0&make=${make}&facets=model|0|30`
    const res = await fetch(url);
    if(res.ok) {
        const json = await res.json();
        const match = json.facets.model.find(x => desc.indexOf(x.item.toLowerCase()) > -1);
        if(match) {
            model = match.item;
            return Promise.resolve(model);
        }
        else {
            return Promise.reject("Model not found");
        }
    }

    return Promise.reject(res);
}

async function getTrim(make, model, year, desc) {
    const url = `https://marketcheck-prod.apigee.net/v1/search?api_key=${key}&rows=0&car_type=used&make=${make}&model=${model}&year=${year}&facets=trim`;
    const res = await fetch(url);
    if(res.ok) {
        const json = await res.json();
        const match = json.facets.trim.find(x => desc.indexOf(x.item.toLowerCase()) > -1);
        if(match) {
            trim = match.item;
            return Promise.resolve(trim);
        }
    }

    return Promise.resolve(null);
}

async function getSimilarListings(radius, condition, sortBy, sortOrder, includeStats) {
    let url = [`https://marketcheck-prod.apigee.net/v2/search/car/active`,
                `?api_key=${key}`,
                `&make=${make}`,
                `&model=${model}`,
                `&year=${year}`,
                `&car_type=${condition}`,
                `&start=0`,
                `&rows=50`,
                `&latitude=${lat}`,
                `&longitude=${lng}`,
                `&radius=${radius}`,
                `&sort_by=${sortBy}`,
                `&sort_order=${sortOrder}`]
                .join('');
    if(trim) url += `&trim=${trim}`;
    if(includeStats) url += `&stats=miles,price,dom`;

    const res = await fetch(url);
    if(res.ok) {
        const json = await res.json();
        return Promise.resolve(json);
    }

    return Promise.reject(res);
}

function getSimilarItemsJson() {
    try {
        let scriptText = [...document.scripts].find(s => s.text.trim().startsWith("window.__OU_PROPS")).text;
        const startIndex = text.text.indexOf('{');
        scriptText = scriptText.substring(startIndex) + '\"}}}]}]}';
        return JSON.parse(scriptText);
    }
    catch (r) {
        return null;
    }
}

function getYear(s) {
    return s.match(/\d{4}/)[0];
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

// function getZipCodeApiUrl(s) {
//     let inIndex = s.indexOf(keywords.IN);
//     inIndex += keywords.IN.length;
//     const dashIndex = s.indexOf(keywords.DASH);
//     const location = s.substring(inIndex, dashIndex).trim().split(', ');
//     const city = location[0];
//     const state = location[1];
//     const key = atob('anMtSWhPRjJDZklHRzU1czZBajJhcjdHZkZYRjgxOWN0TlU4YkpMd0tRdDhCaE1zTjQ1TEpQMGFsd29sMVoyRjR4TA==');
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
