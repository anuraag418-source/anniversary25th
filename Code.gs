// Guestbook for the 25th anniversary site. Stores wishes in the sheet tab "Wishes".
var TAB = 'Wishes';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(['Time', 'Name', 'Message']);
    sh.getRange('B:C').setNumberFormat('@'); // plain text, so nothing is treated as a formula
  }
  return sh;
}

function clean_(s, max) {
  return String(s || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim().slice(0, max);
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var name = clean_(d.name, 40), msg = clean_(d.msg, 300);
    if (name && msg) getSheet_().appendRow([new Date(), name, msg]);
  } catch (err) {}
  return ContentService.createTextOutput('ok');
}

function doGet() {
  var sh = getSheet_(), last = sh.getLastRow(), out = [];
  if (last > 1) {
    var n = Math.min(last - 1, 100);
    out = sh.getRange(last - n + 1, 1, n, 3).getValues().reverse().map(function (r) {
      return { t: new Date(r[0]).toISOString(), name: String(r[1]), msg: String(r[2]) };
    });
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
