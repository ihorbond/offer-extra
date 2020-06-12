const dealDescriptions = {
    "NO_ANALYSIS": "NO ANALYSIS",
    "BETTER_DEAL": "BETTER DEAL",
    "WORSE_DEAL": "WORSE DEAL"
};

const conditions = {
    "USED": "used",
    "DAMAGED": "damaged",
    "REFURBISHED": "refurbished"
};

const greenTriangle = `
<svg class="bi bi-triangle-fill triangle-green text-success" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 011.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z" clip-rule="evenodd"></path>
</svg>`;

const redTriangle = `
<svg class="bi bi-triangle-fill triangle-red text-danger" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 011.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z" clip-rule="evenodd"></path>
</svg>`;

const key = atob('TDNsNng3aUpBY1h3Y0tGUFFqdkRWNEdlYkVPYUlDUWs=');
let currentCar = {};

chrome.storage.local.get('currentCar', data => {
    //console.log(data);
    currentCar = data.currentCar;
    getMakeModelTrim();
});

function hideLoading(hidden) {
    document.getElementById("loading-desc").hidden = hidden;
}

function printCards(json) {
    hideLoading(true);

    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    const milesFormatter = new Intl.NumberFormat('en-US', {
        style: 'unit',
        unit: 'mile',
    });
    const defImgSrc = chrome.runtime.getURL('../images/no_img.png');
    const container = document.getElementById('container');
    json.listings.forEach(lst => container.appendChild(createCard(lst, currentCar, defImgSrc, usdFormatter, milesFormatter)));
}

function createCard(lst, cc, defImgSrc, usdFormatter, milesFormatter) {
    const imgSrc = lst.media && lst.media.photo_links.length > 0
        ? lst.media.photo_links[0]
        : defImgSrc;

    let price = '';
    let isLowerPrice = null;

    if (lst.price > 0)
        price = usdFormatter.format(lst.price);
    if (cc.price && lst.price && lst.price > cc.price) {
        price += redTriangle;
        isLowerPrice = false;
    }
    else if (cc.price && lst.price && lst.price < cc.price) {
        price += greenTriangle;
        isLowerPrice = true;
    }

    let miles = '';
    let isLowerMiles = null;

    if (lst.miles > 0)
        miles = milesFormatter.format(lst.miles);
    if (cc.mileage && lst.miles && lst.miles > cc.mileage) {
        miles += redTriangle;
        isLowerMiles = false;
    }
    else if (cc.mileage && lst.miles && lst.miles < cc.mileage) {
        miles += greenTriangle;
        isLowerMiles = true;
    }

    const dealDesc = getDealDesc(cc.price, cc.mileage, lst.price, lst.miles);
    const dealDescCss = getDealDescCss(dealDesc);
    const cardContainer = document.createElement("div");
    cardContainer.id = lst.id;
    cardContainer.classList.add('card', 'mt-3', 'mb-3');
    cardContainer.style.width = '18rem';
    cardContainer.innerHTML = `
        <div class="${dealDescCss} text-white text-center" title="Compared to the listing on OfferUp">
            <h6 class="card-header-text">${dealDesc}</h6> 
        </div>
        <img src="${imgSrc}" class="card-img-top" alt="${lst.heading}">
        <div class="card-body">
          <h5 class="card-title text-center">${lst.heading}</h5>
          <h6 class="card-subtitle mb-2 text-muted text-center">
            <span class="${isLowerPrice !== null && isLowerPrice ? 'text-success' : 'text-danger'}">${price}</span>
            <span class="${isLowerMiles !== null && isLowerMiles ? 'text-success' : 'text-danger'}">${miles}</span>
          </h6>
          <ul id="car-details">
            <li>Inventory type: ${lst.inventory_type || 'N/A'}</li>
            <li>Seller type: ${lst.seller_type || 'N/A'}</li>
            <li>1 owner: ${lst.carfax_1_owner === undefined ? 'N/A' : lst.carfax_1_owner ? '✅' : '❌'}</li>
            <li>Clean title: ${lst.carfax_clean_title === undefined ? 'N/A' : lst.carfax_clean_title ? '✅' : '❌'}</li>
            <li>Ext Color: ${lst.exterior_color || 'N/A'}</li>
            <li>Interior color: ${lst.interior_color || 'N/A'}</li>
          </ul>
          <div class="text-center"> 
            <a target="_blank" href="${lst.vdp_url}">Visit website</a>
          </div>
        </div>
        <div class="card-footer text-muted" title="Days on market">
            ${lst.dom} days
        </div>`;

    return cardContainer;
}

function getDealDesc(originalPrice, originalMileage, listingPrice, listingMileage) {
    if (!originalPrice || !listingPrice || !originalMileage || !listingMileage)
        return dealDescriptions.NO_ANALYSIS;
    if (listingPrice < originalPrice && listingMileage < originalMileage)
        return dealDescriptions.BETTER_DEAL;
    if (listingPrice > originalPrice && listingMileage > originalMileage)
        return dealDescriptions.WORSE_DEAL;

    return dealDescriptions.NO_ANALYSIS;
}

function getDealDescCss(dealDesc) {
    switch (dealDesc) {
        case dealDescriptions.BETTER_DEAL: return 'bg-success';
        case dealDescriptions.WORSE_DEAL: return 'bg-danger';
        default: return 'bg-dark'
    }
}

function showManualEntry() {
    hideLoading(true);
    const container = document.getElementById("container");
    container.innerHTML = `<div class="text-center">There was an error loading similar listings</div>`;
}

async function getMakeModelTrim() {
    const url = `https://marketcheck-prod.apigee.net/v2/search/car/active?api_key=${key}&rows=0&facets=make|0|200`;
    const radius = 50; //mi

    await fetch(url)
        .then(getMake)
        .then(getModel)
        .then(getTrim)
        .then(_ => getSimilarListings(radius, conditions.USED, 'price', 'asc', false))
        .then(printCards)
        .catch(err => {
            //console.error(err);
            showManualEntry();
        });
}

async function getMake(res) {
    if (res.ok) {
        const json = await res.json();
        const match = json.facets.make.find(x => currentCar.description.indexOf(x.item.toLowerCase()) > -1);

        //need 1s delay between api calls to stay within the rate limit
        return new Promise((resolve, reject) => {
            match ? setTimeout(_ => resolve(match.item), 1000) : reject("Make not found");
        });
    }

    return Promise.reject(res);
}

async function getModel(make) {
    currentCar.make = make;
    const url = `https://marketcheck-prod.apigee.net/v2/search/car/active?api_key=${key}&rows=0&make=${currentCar.make}&facets=model|0|30`
    const res = await fetch(url);
    if (res.ok) {
        const json = await res.json();
        const match = json.facets.model.find(x => currentCar.description.indexOf(x.item.toLowerCase()) > -1);

        return new Promise((resolve, reject) => {
            match ? setTimeout(_ => resolve(match.item), 1000) : reject("Model not found");
        });
    }

    return Promise.reject(res);
}

async function getTrim(model) {
    currentCar.model = model;
    const startPos = currentCar.year.length + currentCar.make.length + currentCar.model.length;
    const trim = currentCar.description.substring(startPos);
    if (trim.length > 0) {
        const url = `https://marketcheck-prod.apigee.net/v2/search/car/active?api_key=${key}&rows=0&make=${currentCar.make}&model=${currentCar.model}&year=${currentCar.year}&facets=trim`;
        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            const match = json.facets.trim.find(x => trim === x.item.toLowerCase());
            if (match) {
                currentCar.trim = match.item;
                return Promise.resolve(currentCar.trim);
            }
        }
    }

    return Promise.resolve(null);
}

async function getSimilarListings(radius, condition, sortBy, sortOrder, includeStats) {
    let url = [
        `https://marketcheck-prod.apigee.net/v2/search/car/active`,
        `?api_key=${key}`,
        `&make=${currentCar.make}`,
        `&model=${currentCar.model}`,
        `&year=${currentCar.year}`,
        `&car_type=${condition}`,
        `&start=0`,
        `&rows=50`,
        `&latitude=${currentCar.lat}`,
        `&longitude=${currentCar.lng}`,
        `&radius=${radius}`,
        `&sort_by=${sortBy}`,
        `&sort_order=${sortOrder}`
    ].join('');
    
    if (currentCar.trim) url += `&trim=${currentCar.trim}`;
    if (includeStats) url += `&stats=miles,price,dom`;

    const res = await fetch(url);
    if (res.ok) {
        const json = await res.json();
        return Promise.resolve(json);
    }

    return Promise.reject(res);
}