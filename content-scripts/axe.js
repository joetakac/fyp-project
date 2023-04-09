chrome.storage.local.get("axeConfig", function (data) {
  const config = data.axeConfig;
  console.log(data.axeConfig);

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
      }
    });
  };
  document.body.appendChild(script);
});
