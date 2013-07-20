// http://stackoverflow.com/questions/3907804/how-to-detect-when-action-popup-gets-closed
// unload events don't work for popups.
function ping() {
    chrome.extension.getBackgroundPage().PopupCloseMonitor.popupPing();
    setTimeout(ping, 500);
}
ping();

function init(card){
  $('#front').val(card.front);
  $('#back').val(card.back);

  $('#front,#back').change(function(){
    card.front = $('#front').val();
    card.back = $('#back').val()
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: card
    });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('popup got message', request, sender);

  if (request.origin === 'background'){
    var card = request.content;
    console.log(card);
    init(card);
  }
});

// Set everything in motion via the content script
chrome.tabs.getSelected(null, function(tab) {
  chrome.tabs.executeScript(null, {file: 'inject.js'});
});