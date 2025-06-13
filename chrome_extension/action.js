console.log("action.js running");

document.addEventListener('DOMContentLoaded', function () {
	var history = document.getElementById('urlList');
	var exportCsvBtn = document.getElementById('exportCsvBtn');

	chrome.storage.local.get(['urlList'], function (result) {
		var urlList = result.urlList;
		if (urlList === undefined) {
			urlList = [];
		}
		if (urlList.length == 0) {
			var span = document.createElement('span');
			span.classList.add('no-history');
			span.appendChild(document.createTextNode('No history'));
			history.appendChild(span);
			exportCsvBtn.disabled = true;
			exportCsvBtn.classList.add('disabled');
		} else {
			// sort by timestamp
			var sortedUrlList = urlList.sort(function (a, b) {
				return b.timestamp - a.timestamp;
			});
			if (sortedUrlList.length > 50) {
				sortedUrlList = sortedUrlList.slice(0, 50);
			}

			exportCsvBtn.addEventListener('click', function (e) {
				e.preventDefault();
				chrome.storage.local.get(['urlList'], function (result) {
					var urlList = result.urlList;
					if (urlList === undefined) {
						urlList = [];
					}
					var text = '';
					urlList.forEach(function (url) {
						text += url.hostname + ',' + url.timestamp + ',' + url.path + '\n';
					});
					var blob = new Blob([text], { type: 'text/csv' });
					var blobURL = URL.createObjectURL(blob);
					// chrome.downloads.download({
					// 	url: url,
					// 	filename: 'history.csv'
					// });

					// Create an anchor element to trigger the download
					const anchor = document.createElement('a');
					anchor.href = blobURL;
					anchor.download = 'history.csv'; // Set the desired file name

					// Programmatically click the anchor element to initiate the download
					anchor.click();

					// Clean up by revoking the object URL
					URL.revokeObjectURL(blobURL);
				});
			});

			// var start = (page - 1) * perPage;
			// var end = start + perPage;
			// sortedUrlList.slice(start, end).forEach(function (url) {
			// 	var hostname = url.hostname;
			// 	var li = document.createElement('li');
			// 	var span = document.createElement('span');
			// 	span.innerHTML = hostname + ' -- ' + new Date(url.timestamp).toLocaleString();
			// 	span.classList.add('url');
			// 	span.addEventListener('click', function (e) {
			// 		e.preventDefault();
			// 		console.log(hostname);
			// 		chrome.tabs.create({ url: hostname });
			// 	});

			// 	li.classList.add('urlItem');
			// 	li.appendChild(span);
			// 	history.appendChild(li);
			// });
		}
	});
    console.log("history in action.js: " + history);
});