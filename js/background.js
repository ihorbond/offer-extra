  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'offerup.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  //remove key on page load to reset the selector 
  chrome.webNavigation.onCompleted.addListener(function() {
    chrome.storage.sync.remove('enableBoardItemSelectionMode', _ => {});
}, {url: [{urlPrefix : 'https://offerup.com/board/'}]});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.showSimilarCars) {
      chrome.tabs.create({url: chrome.extension.getURL('pages/similar_cars.html')});
    }
  });
