chrome.storage.local.get("axeConfig", function (data) {
  const config = data.axeConfig;

  // Step 2: Add a script tag to your content script that references the Axe-core library.
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("/node_modules/axe-core/axe.min.js");
  script.onload = () => {
    // Step 3: Use the `axe.run` function to run an accessibility scan on the current page.
    axe.run(document, config, (err, results) => {
      if (err) throw err;

      // Step 4: Handle the results of the scan appropriately.
      console.log(results);
    });
  };
  document.body.appendChild(script);
});
