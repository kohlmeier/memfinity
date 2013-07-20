console.log('Background page!')

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('got message', request, sender);
	console.log(request.content);
	sendResponse('ok');
});