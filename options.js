function showCurrent() {
  chrome.storage.sync.get(['spreadsheetId'], function(items) {
    console.log(items);
    var status = document.getElementById('status');
    if (items == null) {
      status.textContent = 'No spreadsheetId specified'
    } else {
      status.textContent = 'Current spreadsheetId: '+items['spreadsheetId']
    }
  }); 
}
showCurrent()

function save_options() {
  var spreadsheetId = document.getElementById('spreadsheetId_input').value;
  chrome.storage.sync.set({
    spreadsheetId: spreadsheetId
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'New spreadsheetId:'+spreadsheetId;
  });
}

function reset_options() {
  chrome.storage.sync.get(['spreadsheetIdDef'], function(items) {
    var spreadsheetId = items['spreadsheetIdDef'];
    chrome.storage.sync.set({
      spreadsheetId: spreadsheetId
    }, function() {
      var status = document.getElementById('status');
      status.textContent = 'New spreadsheetId:'+spreadsheetId;
    });
  }); 
}

document.getElementById('save').addEventListener('click',save_options);
document.getElementById('reset').addEventListener('click',reset_options);