

var Templates = {
  addCard: $('#add-card').html(),
  authenticate: $('#authenticate').html()
}

function addCard(card){
  $('#content').html(Templates.addCard);
  $('#front').val(card.front);
  $('#back').val(card.back);

  function update(){
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: card
    });
  }

  $('#front,#back').keypress(function(){
    card.front = $('#front').val();
    card.back = $('#back').val();
    update();
  });
  $('#back').focus(function(){
    $(this).css({height: '150px'});
  })
  $('#back').blur(function(){
    $(this).css({height: '40px'});
  })
  $('#cancel').click(function(){
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: null
    });
    window.close();
  });

  $(".taginput").tagsInput({
    onChange: function(){
      card.tags = $('#tags').val().split(',');
      update();
    }
  });
}

function authenticate(){
  $('#content').html(Templates.authenticate);
  $('#login').click(function(){
    chrome.tabs.create({'url': "http://khan-ssrs.appspot.com/login"});
  })
}

/*
addCard({
  front: 'Hello, world!',
  back: '',
  info: '',
  tags: [],
  source_url: ''
})
*/


// http://stackoverflow.com/questions/3907804/how-to-detect-when-action-popup-gets-closed
// unload events don't work for popups.
function ping() {
    chrome.extension.getBackgroundPage().PopupCloseMonitor.popupPing();
    setTimeout(ping, 500);
}
ping();

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
