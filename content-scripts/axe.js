chrome.storage.local.get("axeConfig", function (data) {
  const config = data.axeConfig;
  console.log(data.axeConfig);

  // Get the document URL
  const documentUrl = window.location.href;

  // Inject the axe-core script into the page
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("/node_modules/axe-core/axe.min.js");

  const options = {
    runOnly: {
      type: "tag",
      values: config,
    },
  };
  script.onload = () => {
    // Call the axe.run method with the options object as an argument
    axe.run(document, options, (err, results) => {
      // Handle the axe.run results here
      if (err) {
        console.error(err);
      } else {
        console.log(results);
        // Send the results and document URL to the background script
        chrome.runtime.sendMessage({
          action: "sendResults",
          report: results,
          url: documentUrl,
        });
      }
    });
  };
  document.body.appendChild(script);
});
