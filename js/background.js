// chrome.browserAction.onClicked.addListener(function(tab) {
//   // chrome.tabs.executeScript(null, {file: "testScript.js"});
//   console.log('extension clicked');
// });

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "js/app.js"});
});