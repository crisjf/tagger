console.log('Reloaded!')

chrome.storage.sync.set({
    spreadsheetId: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs',
    spreadsheetIdDef: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs'
}, function() {});

var API_KEY = 'AIzaSyD0_FxY9WT-7Qrqt7JNcxEvXtYjsvFPs9Y'; // In principle I could use the token to authenticate the get call

function getSpreadsheetID(callback) {
	console.log('getting the spreadsheetsID')
	chrome.storage.sync.get(['spreadsheetId'], function(items) {
		var spreadsheetId = items['spreadsheetId'];
		console.log(spreadsheetId)
		callback(spreadsheetId)
	});
}

function authorize(spreadsheetId,current_url,tag) {
	console.log('authorizing')
	console.log(current_url)
	console.log(tag)
	chrome.identity.getAuthToken(
		{'interactive': true},
		function(token){
			current_pos(current_url,spreadsheetId,tag,token)
		}
	);
}

function current_pos(current_url,spreadsheetId,tag,token){
	var range = 'Sheet1!A2:B'
	var url = "https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheetId+"/values/"+range+"?key="+API_KEY
	$.get({
		url: url,
		success: function(response) {
			var pos = null
			var data = response.values
			len = data.length
			i = 0;
			for (i = 0; i < len; i++) {
				var data_url = data[i][0].replace("https://", "").replace("http://", "")
				if (data_url == current_url) { 
					var pos = "Sheet1!B"+(i+2).toString()
					break;
				}
			}
			if (pos == null) {
				console.log('Song not found')
			} else {
				addValue(spreadsheetId,token,tag,pos)
			}
		}
	})
};


function addValue(spreadsheetId,token,tag,pos) {
	var url = "https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheetId+"/values:batchUpdate/"
	var body = '{"data":[{"range":"'+pos+'","values":[["'+tag+'"]]}],"valueInputOption":"RAW"}';
	console.log(body)
	$.ajax({
		type: 'POST',
		url: url,
		dataType: "text",
		data : body,
		success: function( response ) {
			console.log(response);
		},
		error : function(error) {
			console.log(error);
		},
		beforeSend : function( xhr ) {
			xhr.setRequestHeader('Authorization', "Bearer "+token);
			xhr.setRequestHeader("Content-Type", "application/json");
		}
	});
}

function handleListener (response, sender, sendResponse) {
	var tag = response.split(" ")[0]
	var current_url = response.split(" ")[1].replace("https://", "").replace("http://", "")
	console.log(current_url)
	console.log(tag)
	getSpreadsheetID (function(k) {authorize(k,current_url, tag);}); 
}

chrome.runtime.onMessage.addListener(handleListener)


