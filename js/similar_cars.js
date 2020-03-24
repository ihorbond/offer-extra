const dealDescriptions = {
    "NO_ANALYSIS_AVAILABLE": "NO ANALYSIS",
    "BETTER_DEAL":"BETTER DEAL",
    "WORSE_DEAL": "WORSE DEAL"
};

const greenTriangle = `
<svg class="bi bi-triangle-fill triangle-green text-success" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 011.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z" clip-rule="evenodd"></path>
</svg>`;

const redTriangle = `
<svg class="bi bi-triangle-fill triangle-red text-danger" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 011.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z" clip-rule="evenodd"></path>
</svg>`;

chrome.storage.local.get('similarCars', data => {
    console.log(data);
    if (Object.keys(data.similarCars).length > 0) {
        printCards(data.similarCars.current_car, data.similarCars.listings);
    }
});

function printCards(cc, listings) {
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
    listings.forEach(lst => container.appendChild(createCard(lst, cc, defImgSrc, usdFormatter, milesFormatter)));
}

function createCard(lst, cc, defImgSrc, usdFormatter, milesFormatter) {
        const imgSrc = lst.media && lst.media.photo_links.length > 0 
            ? lst.media.photo_links[0] 
            : defImgSrc;

        let price = '';
        let isLowerPrice = null;

        if(lst.price > 0) 
            price = usdFormatter.format(lst.price);
        if(cc.price && lst.price && lst.price >= cc.price) {
            price += redTriangle;
            isLowerMiles = false;
        }
        else if(cc.price && lst.price && lst.price < cc.price) {
            price += greenTriangle;
            isLowerPrice = true;
        }

        let miles = '';
        let isLowerMiles = null;
        if(lst.miles > 0)
            miles = milesFormatter.format(lst.miles);
        if(cc.mileage && lst.miles && lst.miles >= cc.mileage) {
            miles += redTriangle;
            isLowerMiles = false;
        }
        else if(cc.mileage && lst.miles && lst.miles < cc.mileage) {
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
            <span class="${isLowerPrice !== null && isLowerPrice ? 'text-success': 'text-danger'}">${price}</span>
            <span class="${isLowerMiles !== null && isLowerMiles ? 'text-success':'text-danger'}">${miles}</span>
          </h6>
          <ul id="car-details">
            <li>Inventory type: ${lst.inventory_type || 'N/A'}</li>
            <li>Seller type: ${lst.seller_type || 'N/A'}</li>
            <li>1 owner: ${lst.carfax_1_owner === undefined ? 'N/A' : lst.carfax_1_owner ? '✅':'❌'}</li>
            <li>Clean title: ${lst.carfax_clean_title === undefined ? 'N/A' : lst.carfax_clean_title ? '✅':'❌'}</li>
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
        return dealDescriptions.NO_ANALYSIS_AVAILABLE;
    if (listingPrice < originalPrice && listingMileage < originalMileage)
        return dealDescriptions.BETTER_DEAL;
    if (listingPrice > originalPrice && listingMileage > originalMileage)
        return dealDescriptions.WORSE_DEAL;

    return dealDescriptions.NO_ANALYSIS_AVAILABLE;
}

function getDealDescCss(dealDesc) {
    switch (dealDesc) {
        case dealDescriptions.BETTER_DEAL: return 'bg-success';
        case dealDescriptions.WORSE_DEAL: return 'bg-danger';
        default: return 'bg-dark'
    }
}