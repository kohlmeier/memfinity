
chrome.tabs.getSelected(null, function(tab) {
  //tab.url, tab.title
  chrome.tabs.executeScript(null, {file: 'inject.js'});
});

