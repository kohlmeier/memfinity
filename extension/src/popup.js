Mousetrap._stopCallback = Mousetrap.stopCallback;
Mousetrap.stopCallback = function(e, element, combo){

  if (element.id === 'tags_tag'){
    return false;
  }

  return Mousetrap._stopCallback(e, element, combo);
};

var Templates = {
  addCard: $('#add-card').html(),
  authenticate: $('#authenticate').html()
};

function addCard(data){
  var card = data.card;
  $('#content').html(Templates.addCard);
  $('#front').val(card.front);
  $('#back').val(card.back);
  $('#who').attr({src: getGravatar(data.user + '@gmail.com')});

  function update(){
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: card
    });
  }

  function nullOut(){
    chrome.runtime.sendMessage({
      origin: 'popup',
      content: null
    });
  }

  $('#front,#back').keypress(function() {
    card.front = $('#front').val();
    card.back = $('#back').val();
    update();
  });
  $('#back').focus(function() {
    $(this).css({height: '150px'});
  });
  $('#back').blur(function() {
    if (this.value === ''){
      $(this).css({height: '40px'});
    }
  });
  $('#cancel').click(function() {
    nullOut();
    window.close();
  });
  $('#save').click(function(){
    update();
    window.close();
  });

  Mousetrap.bind(['ctrl+s', 'command+s'], function(e) {
    e.preventDefault();
    update();
    window.close();
  });

  Mousetrap.bind('esc', function(e) {
    e.preventDefault();
    nullOut();
    window.close();
  });

  Mousetrap.bind('up up down down', function(e) {
    var front = $('#front').val();
    var back = $('#back').val();
    $('#front').val(back);
    $('#back').val(front);

    if (front !== ''){
      $('#back').css({height: '150px'});
    }
  });

  $(".taginput").tagsInput({
    onChange: function(){
      card.tags = $('#tags').val().split(',');
      update();
    }
  });

  $('#front').focus();
  $('#front')[0].selectionStart = card.front.length;
  $('#front')[0].selectionEnd = card.front.length;
}

function authenticate(){
  $('#content').html(Templates.authenticate);
  $('#login').click(function(){
    chrome.tabs.create({'url': "http://www.memfinity.org/login"});
  });
}

function flash(){
  $('#flash').fadeOut(250, function(){
        $(this).css({display: 'none'});
      });
}

if (window.location.protocol == 'file:'){
  addCard({
    card: {
      front: 'Hello, world!',
      back: '',
      info: '',
      tags: [],
      source_url: ''
    },
    user: 'sam.m.birch'
  });
  flash();
} else {
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
      window[request.content.initialize](request.content.data);
      flash();
    }
  });

  // Set everything in motion via the content script
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(null, {file: 'inject.js'});
  });
}
