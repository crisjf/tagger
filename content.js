function getSpreadsheetID(callback) {
	chrome.storage.sync.get(['spreadsheetId'], function(items) {
		var spreadsheetId = items['spreadsheetId'];
		callback(spreadsheetId)
	});
}

function next_song(spreadsheetId){
	var url = "https://spreadsheets.google.com/feeds/list/"+spreadsheetId+"/od6/public/basic?alt=json";
	$.get({
		url: url,
		success: function(response) {
			var data = response.feed.entry,
			len = data.length,
			i = 0;
			var next_url = null;
			for (i = 0; i < len; i++) {
				var cont = data[i].content.$t
				if (cont.indexOf('tag') == -1) { 
					var next_url = data[i].title.$t
					break;
				}  
			}
			if (next_url == null) {
				alert('No more songs to tag!')
			} else {
				window.open(next_url,"_self");
			}
		}
	});
};

function check_song(spreadsheetId){
	var url = "https://spreadsheets.google.com/feeds/list/"+spreadsheetId+"/od6/public/basic?alt=json";
	var current_url = window.location.href.replace("https://", "").replace("http://", "")
	$.get({
		url: url,
		success: function(response) {
			var data = response.feed.entry,
			len = data.length,
			i = 0;
			for (i = 0; i < len; i++) {
				if (current_url == data[i].title.$t.replace("https://", "").replace("http://", "")) {
					load_buttons()
					break;
				}
			}
		}
	});
};

function load_buttons(){
	var body = document.getElementById("tagger_div");
	body.appendChild(yes_button);
	body.appendChild(no_button);
	body.appendChild(next_button);
}

function talk2b(tag) {
	var current_url = window.location.href
	chrome.runtime.sendMessage(tag+' '+current_url)
}

// Create top div
var target = document.body;
target.insertAdjacentHTML("afterbegin", "<div id='tagger_div' class='tagger_div' width='100%' lenght='10%'></div>");

// Create the buttons
var yes_button = document.createElement("button");
yes_button.innerHTML = "YES";
yes_button.id = 'tagger_button'

var no_button = document.createElement("button");
no_button.innerHTML = "NO";
no_button.id = 'tagger_button'

var next_button = document.createElement("button");
next_button.innerHTML = "NEXT";
next_button.id = 'tagger_button'

yes_button.addEventListener ("click", function() {talk2b('TRUE')});
no_button.addEventListener ("click", function() {talk2b('FALSE')});
next_button.addEventListener ("click", function() {getSpreadsheetID(next_song)});

getSpreadsheetID(check_song)

// In order to make the page change automatically after the selection, 
// I need to look into receiving messages from the background and using them
// to trigger the next_song function once the POST call has been executed



