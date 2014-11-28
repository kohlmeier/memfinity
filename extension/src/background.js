console.log('Background page!')

var Login = {
	loggedIn: null,
	username: null,
	checkLogin: function(callback, ecallback){
		var req = new XMLHttpRequest();
		var self = this;
		req.open('GET', 'http://www.memfinity.org/api/user');
		req.onload = function(e){
			var user = JSON.parse(this.responseText);
			console.log("Login result:", user)
			if (user === null){
				self.loggedIn = false;
				if (callback){ callback(false); }
				return;
			}
			self.loggedIn = true;
			self.username = user;
			if (callback){ callback(user); }
		};
		req.onerror = function(){
			console.error(arguments);
			if (ecallback) {ecallback.apply(this, arguments);}
		};
		req.send();
		return req;
	}
}

Login.checkLogin();

function uploadCard(card, callback){
	var req = new XMLHttpRequest();
	req.open('POST', 'http://www.memfinity.org/api/card');
	var postdata = JSON.stringify(card);
	req.setRequestHeader("Content-type", "application/json");
	req.onload = callback;
	req.onerror = function(){console.error(arguments);};
	req.send(postdata);
	return req;
}

var currentCard = null;
function onPopupClosed() {
    console.log('Popup closed! Current card:', currentCard);
    if (currentCard !== null){
    	uploadCard(currentCard, function(e){console.log(e, this.responseText)});
    }
}

var PopupCloseMonitor = {
	timeoutId: 0,
	popupPing: function() {
		if(this.timeoutId != 0) {
	        clearTimeout(this.timeoutId);
	    }

	    var self = this;
	    this.timeoutId = setTimeout(function() {
	        onPopupClosed();
	        self.timeoutId = 0;
	    }, 1000);
	}
}

function gotCardFromContent(card){
	if (Login.loggedIn){
		// need some way of invalidating if the request comes
		// back bad!
		console.log('sending card to popup')
		currentCard = card;
		chrome.runtime.sendMessage({
			origin: 'background',
			content: {
				initialize: 'addCard',
				data: {card: card, user: Login.username}
			}
		});
		return;
	}
	function handleLoginResult(){
		if (Login.loggedIn){
			gotCardFromContent(card);
			return;
		}
		currentCard = null;
		chrome.runtime.sendMessage({
			origin: 'background',
			content: {
				initialize: 'authenticate',
				data: null
			}
		});
	}
	Login.checkLogin(handleLoginResult, handleLoginResult);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background got message', request);
	if (request.origin === 'content-script'){
		sendResponse('ok');
		gotCardFromContent(request.content);
	}else if (request.origin === 'popup'){
		//console.log('Got updated card from popup', request.content);
		currentCard = request.content;
	}
});
