function showCurrent() {
  getParams(function(spreadsheetId,tagCol,urlCol,sheetName) {
    var status = document.getElementById('status');
    var status_link = document.getElementById('status_link');
    var content = document.getElementById("spreadsheetId_status");
    content.textContent = 'Current spreadsheetId: '+spreadsheetId;
    var content = document.getElementById("tagCol_status");
    content.textContent = 'Current tag column: '+tagCol;
    var content = document.getElementById("urlCol_status");
    content.textContent = 'Current url column: '+urlCol;
    var content = document.getElementById("sheetName_status");
    content.textContent = 'Current Sheet name: '+sheetName;
    status_link.href = 'https://docs.google.com/spreadsheets/d/'+spreadsheetId;
  })
}

function getParams(callback) {
  chrome.storage.sync.get(['spreadsheetId','tagCol','urlCol','sheetName'],function(items) {
    if (items==null) {
      callback('None','None','None','None');
    } else {
      callback(items['spreadsheetId'],items['tagCol'],items['urlCol'],items['sheetName']);
    }
  })
}


function readInputs(callback) {
  getParams(function(spreadsheetId,tagCol,urlCol,sheetName) {
    var newspreadsheetId = document.getElementById('spreadsheetId_input').value;
    var newtagCol = document.getElementById('tagCol_input').value;
    var newurlCol = document.getElementById('urlCol_input').value;
    var newsheetName = document.getElementById('sheetName_input').value;
    if (newspreadsheetId!='') {
      var passspreadsheetId = newspreadsheetId
    } else {
      var passspreadsheetId = spreadsheetId
    }
    if (newtagCol!='') {
      var passtagCol = newtagCol
    } else {
      var passtagCol = tagCol
    }
    if (newtagCol!='') {
      var passtagCol = newtagCol
    } else {
      var passtagCol = tagCol
    }
    if (newurlCol!='') {
      var passurlCol = newurlCol
    } else {
      var passurlCol = urlCol
    }
    if (newsheetName!='') {
      var passsheetName = newsheetName
    } else {
      var passsheetName = sheetName
    }
    callback(passspreadsheetId,passtagCol,passurlCol,passsheetName)
  })
}

function save_options() {
  readInputs(setOptions)
}

function setOptions(spreadsheetId,tagCol,urlCol,sheetName) {
  chrome.storage.sync.set({
    spreadsheetId: spreadsheetId,
    tagCol: tagCol,
    urlCol: urlCol,
    sheetName: sheetName,
  }, showCurrent);
};

function reset_options() {
  chrome.storage.sync.get(['spreadsheetIdDef','tagColDef','urlColDef','sheetNameDef'], function(items) {
    setOptions(items['spreadsheetIdDef'],items['tagColDef'],items['urlColDef'],items['sheetNameDef'])
  }); 
}

function getSpreadsheetID(callback) {
  chrome.storage.sync.get(['spreadsheetId'], function(items) {
    var spreadsheetId = items['spreadsheetId'];
    callback(spreadsheetId)
  });
}

function next_song(spreadsheetId){
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
        if (cont.indexOf(', tag: ')==-1&&cont.indexOf('tag: ')!=0) { 
          var next_url = data[i].title.$t
          break;
        }  
      }
      if (next_url == null) {
        alert('No more songs to tag!')
      } else {
        // window.open(next_url,"_self");
        var win = window.open(next_url, '_blank');
        win.focus();
      }
    }
  });
};

showCurrent();
document.getElementById('save').addEventListener('click',save_options);
document.getElementById('reset').addEventListener('click',reset_options);
document.getElementById('start').addEventListener ("click", function() {getSpreadsheetID(next_song)});

