console.log('Background page!')

function uploadCard(card, callback){
	var req = new XMLHttpRequest();
	req.open('POST', 'http://localhost:8080/api/card');
	var postdata = JSON.stringify(card);
	req.setRequestHeader("Content-type", "application/json");
	req.onload = callback;
	req.onerror = console.error;
	req.send(postdata);
	return req;
}

var currentCard = null;
function onPopupClosed() {
    console.log('Popup closed! Current card:', currentCard);
    uploadCard(request.content, console.log);
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background got message', request);

	if (request.origin === 'content-script'){
		sendResponse('ok');

		currentCard = request.content;

		chrome.runtime.sendMessage({
			origin: 'background',
			content: request.content
		});
	}else if (request.origin === 'popup'){
		console.log('got card from popup', request.content);
		currentCard = request.content;
	}
});