// http://stackoverflow.com/questions/3907804/how-to-detect-when-action-popup-gets-closed
// unload events don't work for popups.
function ping() {
    chrome.extension.getBackgroundPage().PopupCloseMonitor.popupPing();
    setTimeout(ping, 500);
}
ping();

var Templates = {
  addCard: $('#add-card').html(),
  authenticate: $('#authenticate').html()
}

function addCard(card){
  $('#content').html(Templates.addCard);
  $('#front').val(card.front);
  $('#back').val(card.back);

  $('#front,#back').keypress(function(){
    card.front = $('#front').val();
    card.back = $('#back').val()
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: card
    });
  });
}

function authenticate(){
  $('#content').html(Templates.authenticate);
  $('#login').click(function(){
    chrome.tabs.create({'url': "http://khan-ssrs.appspot.com"});
  })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('popup got message', request, sender);

  if (request.origin === 'background'){
    window[request.content.initialize](request.content.data)
  }
});

// Set everything in motion via the content script
chrome.tabs.getSelected(null, function(tab) {
  chrome.tabs.executeScript(null, {file: 'inject.js'});
});