const dealDescriptions = {
    "NO_ANALYSIS_AVAILABLE": "NO PRICE ANALYSIS",
    "BETTER_DEAL":"BETTER DEAL",
    "WORSE_DEAL": "WORSE DEAL"
};

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
    const container = document.getElementById('container');
    listings.forEach(x => {
        let imgSrc = chrome.runtime.getURL('../images/no_img.png');
        if (x.media && x.media.photo_links.length > 0) {
            imgSrc = x.media.photo_links[0];
        }
        const dealDesc = getDealDesc(cc.price, cc.mileage, x.price, x.miles);
        const dealDescCss = getDealDescCss(dealDesc);
        const cardContainer = document.createElement("div");
        cardContainer.id = x.id;
        cardContainer.classList.add('card', 'mt-3', 'mb-3');
        cardContainer.style.width = '18rem';
        cardContainer.innerHTML = `
        <div class="${dealDescCss} text-white text-center" title="Compared to the listing on OfferUp">
            <h6 class="card-header-text">${dealDesc}</h6> 
        </div>
        <img src="${imgSrc}" class="card-img-top" alt="${x.heading}">
        <div class="card-body">
          <h5 class="card-title text-center">${x.heading}</h5>
          <h6 class="card-subtitle mb-2 text-muted text-center">${x.price ? usdFormatter.format(x.price) : ''}${x.miles ? ' | ' + milesFormatter.format(x.miles) : ''}</h6>
          <ul id="car-details">
            <li>Inventory type: ${x.inventory_type || 'N/A'}</li>
            <li>Seller type: ${x.seller_type || 'N/A'}</li>
            <li>1 owner: ${x.carfax_1_owner === undefined ? 'N/A' : x.carfax_1_owner ? 'Yes':'No'}</li>
            <li>Clean title: ${x.carfax_clean_title === undefined ? 'N/A' : x.carfax_clean_title ? 'Yes':'No'}</li>
            <li>Ext Color: ${x.exterior_color || 'N/A'}</li>
            <li>Interior color: ${x.interior_color || 'N/A'}</li>
          </ul>
          <div class="text-center"> 
            <a target="_blank" href="${x.vdp_url}">Visit website</a>
          </div>
        </div>
        <div class="card-footer text-muted" title="Days on market">
            ${x.dom} days
        </div>`
        container.appendChild(cardContainer);
    });
}

function getDealDesc(originalPrice, originalMileage, listingPrice, listingMileage) {
    if (!originalPrice || !listingPrice || !originalMileage || !listingMileage)
        return dealDescriptions.NO_ANALYSIS_AVAILABLE;
    if (listingPrice < originalPrice && listingMileage < originalMileage)
        return dealDescriptions.BETTER_DEAL;
    else
        return dealDescriptions.WORSE_DEAL;
}

function getDealDescCss(dealDesc) {
    switch (dealDesc) {
        case dealDescriptions.BETTER_DEAL: return 'bg-success';
        case dealDescriptions.WORSE_DEAL: return 'bg-danger';
        default: return 'bg-light'
    }
}