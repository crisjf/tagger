console.log('Reloaded!')

function setSpreadsheetID() {
	chrome.storage.sync.set({
		spreadsheetId: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs',
		spreadsheetIdDef: '1Qouq_N8m3clE2281eX2-EtUZLnR_GJjRFZogIja5Dhs',
		tagCol: 'tag',
		tagColDef: 'tag',
		tagColPos: 'B',
		tagColPosDef: 'B',
		urlCol: 'url',
		urlColDef: 'url',
		urlColPos: 'A',
		urlColPosDef: 'A',
		sheetName: 'Sheet1',
		sheetNameDef: 'Sheet1'
	});
}

chrome.storage.sync.clear()
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
};

function authorize(callback) {
	chrome.identity.getAuthToken(
		{'interactive': true},
		function(token){
			callback(token);
		}
	);
}

function current_pos(current_url,spreadsheetId,token,callback){
	var sheetName = 'Sheet1';
	var range = sheetName+'!A2:B';
	var url = "https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheetId+"/values/"+range
	$.get({
		url: url,
		beforeSend : function( xhr ) {
			xhr.setRequestHeader('Authorization', "Bearer "+token);
			xhr.setRequestHeader("Content-Type", "application/json")
		},
		success: function(response) {
			var pos = null
			var data = response.values
			len = data.length
			i = 0;
			for (i = 0; i < len; i++) {
				var data_url = data[i][0].replace("https://", "").replace("http://", "")
				if (data_url == current_url) { 
					var pos = sheetName+"!B"+(i+2).toString()
					break;
				}
			}
			callback(pos)
		}
	})
};

function getParams(current_url,callback){
	getSpreadsheetID(function(spreadsheetId) {
		authorize(function(token) {
			current_pos(current_url,spreadsheetId,token,function(pos) {
				callback(token,pos,spreadsheetId)
			});
		})
	});
}

function addValue(spreadsheetId,token,tag,pos,callback) {
	var url = "https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheetId+"/values:batchUpdate/"
	var body = '{"data":[{"range":"'+pos+'","values":[["'+tag+'"]]}],"valueInputOption":"RAW"}';
	$.ajax({
		type: 'POST',
		url: url,
		dataType: "text",
		data : body,
		success: function( response ) {
			callback('success');
		},
		error : function(error) {
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
