chrome.runtime.sendMessage(
	{
		origin: 'content-script',
		content:  {
			front: window.getSelection().toString(),
			back: '',
			info: '',
			tags: [],
			source_url: window.location.toString()
		}
	},
	function(response) {
  		console.log(response);
	}
);

console.log('Grabbed selection!', window.getSelection())