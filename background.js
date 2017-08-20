console.log('Reloaded!')

// chrome.storage.sync.clear()

function setSpreadsheetID() {
	chrome.storage.sync.set({
		spreadsheetId: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs',
		spreadsheetIdDef: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs'
	});
}

var API_KEY = 'AIzaSyD0_FxY9WT-7Qrqt7JNcxEvXtYjsvFPs9Y'; // In principle I could use the token to authenticate the get call

getSpreadsheetID(function(spreadsheetId){
	if (spreadsheetId==null) {
		setSpreadsheetID()
	}
});

function getSpreadsheetID(callback) {
	chrome.storage.sync.get(['spreadsheetId'], function(items) {
		var spreadsheetId = items['spreadsheetId'];
		callback(spreadsheetId)
	});
}

function authorize(callback) {
	console.log('authorizing')
	chrome.identity.getAuthToken(
		{'interactive': true},
		function(token){
			callback(token);
		}
	);
}

function current_pos(current_url,spreadsheetId,callback){
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
			callback(pos)
		}
	})
};


function getParams(current_url,callback){
	getSpreadsheetID(function(spreadsheetId){
		current_pos(current_url,spreadsheetId,function(pos) {
			authorize(function(token){
				callback(token,pos,spreadsheetId)
			})
		});
	});
}

function addValue(spreadsheetId,token,tag,pos,callback) {
	var url = "https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheetId+"/values:batchUpdate/"
	var body = '{"data":[{"range":"'+pos+'","values":[["'+tag+'"]]}],"valueInputOption":"RAW"}';
	console.log(body)
	$.ajax({
		type: 'POST',
		url: url,
		dataType: "text",
		data : body,
		success: function( response ) {
			console.log('Yay!')
			console.log(response);
			callback('success');
		},
		error : function(error) {
			console.log(error);
			callback('error');
		},
		beforeSend : function( xhr ) {
			xhr.setRequestHeader('Authorization', "Bearer "+token);
			xhr.setRequestHeader("Content-Type", "application/json");
		}
	});
}

function handleListener (response, sender, sendResponse) {
	var tag = response
	var current_url = sender.tab.url.replace("https://", "").replace("http://", "")
	getParams(current_url,function(token,pos,spreadsheetId) {
		if (pos == null) {
			sendResponse('no-song');
		} else {
			addValue(spreadsheetId,token,tag,pos, function (message) {
				sendResponse(message);
			});
		};
	});
	return true;
}

chrome.runtime.onMessage.addListener(handleListener)
