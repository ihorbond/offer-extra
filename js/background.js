  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'offerup.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
    if(tab.url && tab.url.indexOf('offerup.com/board/') > -1 && changeInfo.url === undefined) {
        //we have a refresh
        console.log("remove enableBoardItemSelectionMode storage data");
        chrome.storage.sync.remove('enableBoardItemSelectionMode', _ => {});
    }
  });