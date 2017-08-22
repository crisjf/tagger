function getSpreadsheetID(callback) {
	chrome.storage.sync.get(['spreadsheetId'], function(items) {
		var spreadsheetId = items['spreadsheetId'];
		callback(spreadsheetId)
	});
}

function next_song(spreadsheetId){
	var tagCol = 'tag';
	var url = "https://spreadsheets.google.com/feeds/list/"+spreadsheetId+"/od6/public/basic?alt=json";
	console.log(url)
	$.get({
		url: url,
		success: function(response) {
			var data = response.feed.entry,
			len = data.length,
			i = 0;
			var next_url = null;
			for (i = 0; i < len; i++) {
				var cont = data[i].content.$t
				if (cont.indexOf(', '+tagCol+': ')==-1&&cont.indexOf(tagCol+': ')!=0) { 
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

function check_song(spreadsheetId,callback){
	var tagCol = 'tag';
	var url = "https://spreadsheets.google.com/feeds/list/"+spreadsheetId+"/od6/public/basic?alt=json";
	var current_url = window.location.href.replace("https://", "").replace("http://", "")
	$.get({
		url: url,
		success: function(response) {
			var missing_songs = 0;
			var data = response.feed.entry,
			len = data.length,
			i = 0;
			var is_present = false;
			for (i = 0; i < len; i++) {
				var cont = data[i].content.$t
				if (cont.indexOf(', '+tagCol+': ')==-1&&cont.indexOf(tagCol+': ')!=0) { 
					missing_songs +=1;
				}
				if (current_url == data[i].title.$t.replace("https://", "").replace("http://", "")) {
					is_present = true;
				}
			}
			if (is_present) {
				callback(missing_songs);
			}
		}
	});
};

function talk2b(tag) {
	chrome.runtime.sendMessage(tag, function(response){
		if (response=='success'||response=='no-song') {
			if (response=='no-song') {
				alert('Song not found in spreadsheet')
			}
			getSpreadsheetID(next_song)
		} else {
			alert('Selection not recorded, please try again')
		}
	})
}

function load_buttons(missing_songs){
	target.insertAdjacentHTML("afterbegin", "<div id='tagger_div' class='tagger_div'></div>");
	var body = document.getElementById("tagger_div");
	var desctext = document.createElement("p");
	desctext.innerHTML += 'Banner created by tagger extension:';
	body.appendChild(desctext);
	body.appendChild(yes_button);
	body.appendChild(no_button);
	body.appendChild(next_button);
	sheet_link.innerHTML = "SpreadSheet ("+missing_songs.toString()+" left)";
	body.appendChild(sheet_link);
}




var target = document.body;

var yes_button = document.createElement("button");
yes_button.innerHTML = "YES";
yes_button.id = 'tagger_button';

var no_button = document.createElement("button");
no_button.innerHTML = "NO";
no_button.id = 'tagger_button';

var next_button = document.createElement("button");
next_button.innerHTML = "NEXT";
next_button.id = 'tagger_button';

var sheet_link = document.createElement("a");
sheet_link.class = 'taggerSheetButton';
sheet_link.target="_blank";
getSpreadsheetID(function(spreadsheetId){
	sheet_link.href = 'https://docs.google.com/spreadsheets/d/'+spreadsheetId;
})

yes_button.addEventListener ("click", function() {talk2b('TRUE')});
no_button.addEventListener ("click", function() {talk2b('FALSE')});
next_button.addEventListener ("click", function() {getSpreadsheetID(next_song)});

getSpreadsheetID(function(spreadsheetId) {
	check_song(spreadsheetId,load_buttons)
})

