chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "runAxe":
      runAxe(request.tab);
      break;
    default:
      break;
  }
  return true; // Return true to keep the message channel open
});

function runAxe(tab) {
    // Inject the content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-scripts/axe.js"],
    });
}
