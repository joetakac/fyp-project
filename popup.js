//this function shows and hides content on the popup.html page based on user clicks in the nav bar
$(function () {
  $("body").on("click", ".nav-link", function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    $(".tab-pane").removeClass("show active");
    $($(this).attr("href")).addClass("show active");
  });
});

$(function () {
  // When the "Home" breadcrumb is clicked
  $(document).on("click", 'a[href="#popup"]', function (e) {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    $(".tab-pane").removeClass("show active");
    $($(this).attr("href")).addClass("show active");
  });
});

$(function () {
  // When the "Back" button is clicked on first child page
  $(document).on("click", "#back", function (e) {
    $(".nav-link").removeClass("active");
    $(".tab-pane").removeClass("show active");
    var popup = $("#popup");
    popup.addClass("show active");
    $(popup.attr("href")).addClass("show active");
  });
});

$(".info-categories").on("click", function () {
  $(".nav-link").removeClass("active");
  $(".tab-pane").removeClass("show active");
  var help = $("#help");
  help.addClass("show active");
  $(help.attr("href")).addClass("show active");
});

$("#selectAllCat").on("click", function () {
  var checkboxes = $('.categories input[type="checkbox"]');
  checkboxes.prop("checked", true);
});

$("#selectAllWCAG").on("click", function () {
  var checkboxes = $('.WCAG input[type="checkbox"]');
  checkboxes.prop("checked", true);
});

function showReport() {
  //hide the home page and show the report page
  $(".nav-link").removeClass("active");
  $(".tab-pane").removeClass("show active");
  var report = $("#report");
  report.addClass("show active");
}

// Event listener for the submit button
$("#reportconfig").on("click", function () {
  console.log("report config button clicked");

  // Get the values of the checkboxes and radio buttons
  var userCatOptions = {
    aria: $("#ariacheck").is(":checked"),
    color: $("#colourcheck").is(":checked"),
    forms: $("#formcheck").is(":checked"),
    keyboard: $("#keyboardcheck").is(":checked"),
    language: $("#langcheck").is(":checked"),
    name_role_value: $("#namerolecheck").is(":checked"),
    parsing: $("#parsecheck").is(":checked"),
    semantics: $("#semcheck").is(":checked"),
    sensory_and_visual_cues: $("#snvcheck").is(":checked"),
    structure: $("#structcheck").is(":checked"),
    tables: $("#tablecheck").is(":checked"),
    text_alternatives: $("#altcheck").is(":checked"),
    time_and_media: $("#tnmcheck").is(":checked"),
  };

  var userOptions = {
    wcag2a: $("#wcag2acheck").is(":checked"),
    wcag2aa: $("#wcag2aacheck").is(":checked"),
    wcag2aaa: $("#wcag2aaacheck").is(":checked"),
    wcag21a: $("#wcag21acheck").is(":checked"),
    wcag21aa: $("#wcag21aacheck").is(":checked"),
    wcag22aa: $("#wcag22aacheck").is(":checked"),
  };

  var options = [];

  // Loop through the userOptions object and add true keys to the options array prefixed with "cat." for axe-core
  for (var key in userCatOptions) {
    if (userCatOptions.hasOwnProperty(key) && userCatOptions[key]) {
      options.push("cat." + key.replace(/_/g, "-"));
    }
  }

  // loop through the userOptions object and add true keys to the options array
  for (var key in userOptions) {
    if (userOptions.hasOwnProperty(key) && userOptions[key]) {
      options.push(key);
    }
  }

  // // Get the text value of the selected radio button label
  // var device = $("input[name='device']:checked + label").text();
  if (chrome.storage.local.get("axeConfig")) chrome.storage.local.set({ axeConfig: options }); // Save the options object to chrome storage
  console.log(options);
});

$("#reportbutton").on("click", async function () {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);

  chrome.runtime.sendMessage({ action: "runAxe", tab: tab }); // Send a message to the background script to run axe on the current page

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Listen for report response
    if (request.action === "sendResults") {
      var results = request.report;
      var url = request.url;

      //clear the report page if there is an existing report
      existingReport();
      //print the results to the report page
      printAll(results, url);
      //show the report page
      showReport();

      //export the results to a json file
      $("#exportJson").on("click", function (Event) {
        Event.preventDefault(); // prevent browser saving as html file
        const data = results;
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "accessibility_report.json";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      //export the results to a html file
      $("#exportHtml").on("click", function () {
        const data = results;
        const jsonString = JSON.stringify(data, null, 2); // Convert object to JSON string with 2-space indentation

        // Create an HTML string that includes the JSON string in a pre tag
        const html = `
       <html>
         <head>
           <meta charset="UTF-8">
            <title>Accessibility Report</title>
         </head>
         <body>
           <pre>${jsonString}</pre> // Display JSON string in a pre tag
         </body>
       </html>
      `;

        // Create a new Blob object with the HTML string and set its type to "text/html"
        const blob = new Blob([html], { type: "text/html" });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a new <a> element with the download attribute set to the desired filename and its href set to the URL of the Blob object
        const link = document.createElement("a");
        link.download = "accessibility_report.html";
        link.href = url;

        // Append the <a> element to the body, trigger a click event on it, and remove it from the body
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Attach a click event listener to the "Copy JSON" button
      $("#copyJson").on("click", function () {
        // Retrieve the accessibility report data
        const data = results;

        // Convert the data to a formatted JSON string
        const jsonString = JSON.stringify(data, null, 2);

        // Copy the JSON string to the clipboard using the Clipboard API
        navigator.clipboard
          .writeText(jsonString)
          .then(() => {
            // Display a success message to the user
            alert("JSON data copied to clipboard!");
          })
          .catch((error) => {
            // Display an error message if copying fails
            console.error("Error copying JSON data to clipboard:", error);
          });
      });
    }
    return true;
  });
});

function existingReport() {
  var title = $("#reporttitle");
  var passes = $('[class$="-passes"]');
  var fails = $('[class$="-fails"]');

  if (title.length > 0) {
    title.html("");
  }

  if (passes.length > 0) {
    passes.html("");
  }

  if (fails.length > 0) {
    fails.html("");
  }
}

function printAll(results, url) {
  //create the report title with target page url
  $("#reporttitle").append("Report for <br>").append($("<small></small>").text(url));
  // Print the results to the page
  printARIAResults(results);
  printColorResults(results);
  printFormsResults(results);
  printKeyboardResults(results);
  printLanguageResults(results);
  printNameRoleValueResults(results);
  printParsingResults(results);
  printSemanticsResults(results);
  printSensoryAndVisualCuesResults(results);
  printStructureResults(results);
  printTablesResults(results);
  printTextAlternativesResults(results);
  printTimeAndMediaResults(results);
}

function printARIAPasses(results) {
  var foundARIAPasses = false;
  var passes = results.passes;
  var ariaPasses = $(".accordion-body.aria-passes");


  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.aria")) {
      foundARIAPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundARIAPasses) {
    var h4 = $("<h4>").text("Checks Performed:");
    ariaPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#aria-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    ariaPasses.append(accordionItem);
  });

  if (!foundARIAPasses) {
    ariaPasses.append("<div class='pass'><p>ARIA passes were not found.</p></div>");
  }
}

function printARIAFails(results) {
  var fails = results.violations;
  var foundARIAFails = false;
  var ariaFails = $(".accordion-body.aria-fails");
  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.aria")) {
      foundARIAFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundARIAFails){
    var h4 = $("<h4>").text("Checks Performed:");
    ariaFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#aria-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    ariaFails.append(accordionItem);
  });

  if (!foundARIAFails) {
    ariaFails.append("<div class='fail'><p>ARIA violations were not found.</p></div>");
  }
}

function printARIAResults(results) {
  printARIAFails(results);
  printARIAPasses(results);
}

function printColorPasses(results) {
  var foundcolorPasses = false;
  var passes = results.passes;
  var colorPasses = $(".accordion-body.color-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.color")) {
      foundcolorPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundcolorPasses){
    var h4 = $("<h4>").text("Checks Performed:");
    colorPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#color-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    colorPasses.append(accordionItem);
  });

  if (!foundcolorPasses) {
    colorPasses.append("<div class='pass'><p>color passes were not found.</p></div>");
  }
}

function printColorFails(results) {
  var fails = results.violations;
  var foundcolorFails = false;
  var colorFails = $(".accordion-body.color-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.color")) {
      foundcolorFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundcolorFails){
    var h4 = $("<h4>").text("Checks Performed:");
    colorFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#color-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    colorFails.append(accordionItem);
  });

  if (!foundcolorFails) {
    colorFails.append("<div class='fail'><p>color violations were not found.</p></div>");
  }
}

function printColorResults(results) {
  printColorFails(results);
  printColorPasses(results);
}

function printFormsPasses(results) {
  var foundformsPasses = false;
  var passes = results.passes;
  var formsPasses = $(".accordion-body.forms-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.forms")) {
      foundformsPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundformsPasses){
    var h4 = $("<h4>").text("Checks Performed:");
    formsPasses.append(h4);
  }
  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#forms-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    formsPasses.append(accordionItem);
  });

  if (!foundformsPasses) {
    formsPasses.append("<div class='pass'><p>forms passes were not found.</p></div>");
  }
}

function printFormsFails(results) {
  var fails = results.violations;
  var foundformsFails = false;
  var formsFails = $(".accordion-body.forms-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.forms")) {
      foundformsFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundformsFails){
    var h4 = $("<h4>").text("Checks Performed:");
    formsFails.append(h4);
  }
  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#forms-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    formsFails.append(accordionItem);
  });

  if (!foundformsFails) {
    formsFails.append("<div class='fail'><p>forms violations were not found.</p></div>");
  }
}

function printFormsResults(results) {
  printFormsFails(results);
  printFormsPasses(results);
}

function printKeyboardPasses(results) {
  var foundkeyboardPasses = false;
  var passes = results.passes;
  var keyboardPasses = $(".accordion-body.keyboard-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.keyboard")) {
      foundkeyboardPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundkeyboardPasses){
    var h4 = $("<h4>").text("Checks Performed:");
    keyboardPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#keyboard-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    keyboardPasses.append(accordionItem);
  });

  if (!foundkeyboardPasses) {
    keyboardPasses.append("<div class='pass'><p>keyboard passes were not found.</p></div>");
  }
}

function printKeyboardFails(results) {
  var fails = results.violations;
  var foundkeyboardFails = false;
  var keyboardFails = $(".accordion-body.keyboard-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.keyboard")) {
      foundkeyboardFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundkeyboardFails){
    var h4 = $("<h4>").text("Checks Performed:");
    keyboardFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#keyboard-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    keyboardFails.append(accordionItem);
  });

  if (!foundkeyboardFails) {
    keyboardFails.append("<div class='fail'><p>keyboard violations were not found.</p></div>");
  }
}

function printKeyboardResults(results) {
  printKeyboardFails(results);
  printKeyboardPasses(results);
}

function printLanguagePasses(results) {
  var foundlanguagePasses = false;
  var passes = results.passes;
  var languagePasses = $(".accordion-body.language-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.language")) {
      foundlanguagePasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundlanguagePasses){
    var h4 = $("<h4>").text("Checks Performed:");
    languagePasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#language-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    languagePasses.append(accordionItem);
  });

  if (!foundlanguagePasses) {
    languagePasses.append("<div class='pass'><p>language passes were not found.</p></div>");
  }
}

function printLanguageFails(results) {
  var fails = results.violations;
  var foundlanguageFails = false;
  var languageFails = $(".accordion-body.language-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.language")) {
      foundlanguageFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundlanguageFails){
    var h4 = $("<h4>").text("Violations Found:");
    languageFails.append(h4);
  }
  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#language-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    languageFails.append(accordionItem);
  });

  if (!foundlanguageFails) {
    languageFails.append("<div class='fail'><p>language violations were not found.</p></div>");
  }
}

function printLanguageResults(results) {
  printLanguageFails(results);
  printLanguagePasses(results);
}

function printNameRoleValuePasses(results) {
  var foundname_role_valuePasses = false;
  var passes = results.passes;
  var name_role_valuePasses = $(".accordion-body.name-role-value-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.name-role-value")) {
      foundname_role_valuePasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundname_role_valuePasses){
    var h4 = $("<h4>").text("Passes Found:");
    name_role_valuePasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#name-role-value-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    name_role_valuePasses.append(accordionItem);
  });

  if (!foundname_role_valuePasses) {
    name_role_valuePasses.append("<div class='pass'><p>name-role-value passes were not found.</p></div>");
  }
}

function printNameRoleValueFails(results) {
  var fails = results.violations;
  var foundname_role_valueFails = false;
  var name_role_valueFails = $(".accordion-body.name-role-value-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.name-role-value")) {
      foundname_role_valueFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundname_role_valueFails){
    var h4 = $("<h4>").text("Fails Found:");
    name_role_valueFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#name-role-value-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    name_role_valueFails.append(accordionItem);
  });

  if (!foundname_role_valueFails) {
    name_role_valueFails.append("<div class='fail'><p>name-role-value violations were not found.</p></div>");
  }
}

function printNameRoleValueResults(results) {
  printNameRoleValueFails(results);
  printNameRoleValuePasses(results);
}

function printParsingPasses(results) {
  var foundparsingPasses = false;
  var passes = results.passes;
  var parsingPasses = $(".accordion-body.parsing-passes");


  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.parsing")) {
      foundparsingPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundparsingPasses){
    var h4 = $("<h4>").text("Passes Found:");
    parsingPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#parsing-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    parsingPasses.append(accordionItem);
  });

  if (!foundparsingPasses) {
    parsingPasses.append("<div class='pass'><p>parsing passes were not found.</p></div>");
  }
}

function printParsingFails(results) {
  var fails = results.violations;
  var foundparsingFails = false;
  var parsingFails = $(".accordion-body.parsing-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.parsing")) {
      foundparsingFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundparsingFails){
    var h4 = $("<h4>").text("Fails Found:");
    parsingFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#parsing-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    parsingFails.append(accordionItem);
  });

  if (!foundparsingFails) {
    parsingFails.append("<div class='fail'><p>parsing violations were not found.</p></div>");
  }
}

function printParsingResults(results) {
  printParsingFails(results);
  printParsingPasses(results);
}

function printSemanticsPasses(results) {
  var foundsemanticsPasses = false;
  var passes = results.passes;
  var semanticsPasses = $(".accordion-body.semantics-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.semantics")) {
      foundsemanticsPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundsemanticsPasses){
    var h4 = $("<h4>").text("Passes Found:");
    semanticsPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#semantics-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    semanticsPasses.append(accordionItem);
  });

  if (!foundsemanticsPasses) {
    semanticsPasses.append("<div class='pass'><p>semantics passes were not found.</p></div>");
  }
}

function printSemanticsFails(results) {
  var fails = results.violations;
  var foundsemanticsFails = false;
  var semanticsFails = $(".accordion-body.semantics-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.semantics")) {
      foundsemanticsFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundsemanticsFails){
    var h4 = $("<h4>").text("Fails Found:");
    semanticsFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#semantics-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    semanticsFails.append(accordionItem);
  });

  if (!foundsemanticsFails) {
    semanticsFails.append("<div class='fail'><p>semantics violations were not found.</p></div>");
  }
}

function printSemanticsResults(results) {
  printSemanticsFails(results);
  printSemanticsPasses(results);
}

function printSensoryAndVisualCuesPasses(results) {
  var foundsensory_and_visual_cuesPasses = false;
  var passes = results.passes;
  var sensory_and_visual_cuesPasses = $(".accordion-body.sensory-and-visual-cues-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.sensory-and-visual-cues")) {
      foundsensory_and_visual_cuesPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundsensory_and_visual_cuesPasses){
    var h4 = $("<h4>").text("Passes Found:");
    sensory_and_visual_cuesPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#sensory-and_visual-cues-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    sensory_and_visual_cuesPasses.append(accordionItem);
  });

  if (!foundsensory_and_visual_cuesPasses) {
    sensory_and_visual_cuesPasses.append("<div class='pass'><p>sensory-and-visual-cues passes were not found.</p></div>");
  }
}

function printSensoryAndVisualCuesFails(results) {
  var fails = results.violations;
  var foundsensory_and_visual_cuesFails = false;
  var sensory_and_visual_cuesFails = $(".accordion-body.sensory-and-visual-cues-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.sensory-and-visual-cues")) {
      foundsensory_and_visual_cuesFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundsensory_and_visual_cuesFails){
    var h4 = $("<h4>").text("Fails Found:");
    sensory_and_visual_cuesFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#sensory-and-visual-cues-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    sensory_and_visual_cuesFails.append(accordionItem);
  });

  if (!foundsensory_and_visual_cuesFails) {
    sensory_and_visual_cuesFails.append("<div class='fail'><p>sensory-and-visual-cues violations were not found.</p></div>");
  }
}

function printSensoryAndVisualCuesResults(results) {
  printSensoryAndVisualCuesFails(results);
  printSensoryAndVisualCuesPasses(results);
}

function printStructurePasses(results) {
  var foundstructurePasses = false;
  var passes = results.passes;
  var structurePasses = $(".accordion-body.structure-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.structure")) {
      foundstructurePasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundstructurePasses){
    var h4 = $("<h4>").text("Passes Found:");
    structurePasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#structure-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    structurePasses.append(accordionItem);
  });

  if (!foundstructurePasses) {
    structurePasses.append("<div class='pass'><p>structure passes were not found.</p></div>");
  }
}

function printStructureFails(results) {
  var fails = results.violations;
  var foundstructureFails = false;
  var structureFails = $(".accordion-body.structure-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.structure")) {
      foundstructureFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundstructureFails){
    var h4 = $("<h4>").text("Fails Found:");
    structureFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#structure-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    structureFails.append(accordionItem);
  });

  if (!foundstructureFails) {
    structureFails.append("<div class='fail'><p>structure violations were not found.</p></div>");
  }
}

function printStructureResults(results) {
  printStructureFails(results);
  printStructurePasses(results);
}

function printTablesPasses(results) {
  var foundtablesPasses = false;
  var passes = results.passes;
  var tablesPasses = $(".accordion-body.tables-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.tables")) {
      foundtablesPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundtablesPasses){
    var h4 = $("<h4>").text("Passes Found:");
    tablesPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#tables-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    tablesPasses.append(accordionItem);
  });

  if (!foundtablesPasses) {
    tablesPasses.append("<div class='pass'><p>tables passes were not found.</p></div>");
  }
}

function printTablesFails(results) {
  var fails = results.violations;
  var foundtablesFails = false;
  var tablesFails = $(".accordion-body.tables-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.tables")) {
      foundtablesFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundtablesFails){
    var h4 = $("<h4>").text("Fails Found:");
    tablesFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#tables-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    tablesFails.append(accordionItem);
  });

  if (!foundtablesFails) {
    tablesFails.append("<div class='fail'><p>tables violations were not found.</p></div>");
  }
}

function printTablesResults(results) {
  printTablesFails(results);
  printTablesPasses(results);
}

function printTextAlternativesPasses(results) {
  var foundtext_alternativesPasses = false;
  var passes = results.passes;
  var text_alternativesPasses = $(".accordion-body.text-alternatives-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.text-alternatives")) {
      foundtext_alternativesPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundtext_alternativesPasses){
    var h4 = $("<h4>").text("Passes Found:");
    text_alternativesPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#text-alternatives-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    text_alternativesPasses.append(accordionItem);
  });

  if (!foundtext_alternativesPasses) {
    text_alternativesPasses.append("<div class='pass'><p>text-alternatives passes were not found.</p></div>");
  }
}

function printTextAlternativesFails(results) {
  var fails = results.violations;
  var foundtext_alternativesFails = false;
  var text_alternativesFails = $(".accordion-body.text-alternatives-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.text-alternatives")) {
      foundtext_alternativesFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundtext_alternativesFails){
    var h4 = $("<h4>").text("Fails Found:");
    text_alternativesFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#text-alternatives-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    text_alternativesFails.append(accordionItem);
  });

  if (!foundtext_alternativesFails) {
    text_alternativesFails.append("<div class='fail'><p>text-alternatives violations were not found.</p></div>");
  }
}

function printTextAlternativesResults(results) {
  printTextAlternativesFails(results);
  printTextAlternativesPasses(results);
}

function printTimeAndMediaPasses(results) {
  var foundtime_and_mediaPasses = false;
  var passes = results.passes;
  var time_and_mediaPasses = $(".accordion-body.time-and-media-passes");

  // Group passes by description
  var passGroups = {};
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.time-and-media")) {
      foundtime_and_mediaPasses = true;
      if (!passGroups[pass.description]) {
        passGroups[pass.description] = [];
      }
      passGroups[pass.description].push(pass);
    }
  });

  if(foundtime_and_mediaPasses){
    var h4 = $("<h4>").text("Passes Found:");
    time_and_mediaPasses.append(h4);
  }

  // Print passes to the relevant div
  Object.keys(passGroups).forEach(function (description) {
    var nodes = passGroups[description]
      .map(function (pass) {
        return pass.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "pass-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#time-and-media-passes-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      passGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-success mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    time_and_mediaPasses.append(accordionItem);
  });

  if (!foundtime_and_mediaPasses) {
    time_and_mediaPasses.append("<div class='pass'><p>time-and-media passes were not found.</p></div>");
  }
}

function printTimeAndMediaFails(results) {
  var fails = results.violations;
  var foundtime_and_mediaFails = false;
  var time_and_mediaFails = $(".accordion-body.time-and-media-fails");

  // Group fails by description
  var failGroups = {};
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.time-and-media")) {
      foundtime_and_mediaFails = true;
      if (!failGroups[fail.description]) {
        failGroups[fail.description] = [];
      }
      failGroups[fail.description].push(fail);
    }
  });

  if(foundtime_and_mediaFails){
    var h4 = $("<h4>").text("Fails Found:");
    time_and_mediaFails.append(h4);
  }

  // Print failes to the relevant div
  Object.keys(failGroups).forEach(function (description) {
    var nodes = failGroups[description]
      .map(function (fail) {
        return fail.nodes
          .map(function (node) {
            return "<p>" + node.html + "</p>";
          })
          .join("");
      })
      .join("");

    var htmlSnippets = nodes.split("<p>").filter(function (snippet) {
      return snippet !== "";
    });

    var accordionId = "fail-accordion-" + description.toLowerCase().replace(/\W+/g, "-");
    var accordionItem = $("<div>", {
      class: "accordion-item",
    });
    var accordionHeader = $("<h2>", {
      class: "accordion-header",
    });
    var accordionButton = $("<button>", {
      class: "accordion-button collapsed",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#" + accordionId,
      "aria-expanded": "false",
      "aria-controls": accordionId,
    }).text(description);
    accordionHeader.append(accordionButton);
    accordionItem.append(accordionHeader);

    var accordionCollapse = $("<div>", {
      id: accordionId,
      class: "accordion-collapse collapse",
      "aria-labelledby": accordionButton,
      "data-bs-parent": "#time-and-media-fails-accordion",
    });
    var accordionBody = $("<div>", {
      class: "accordion-body",
    });
    accordionCollapse.append(accordionBody);
    accordionItem.append(accordionCollapse);

    htmlSnippets.forEach(function (snippet) {
      var card = $("<div>", { class: "card bg-light" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
      var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      cardBody.append(cardTitle, code);
      card.append(cardBody);

      // Add an image to the left of the tags
      var image = $("<img>", {
        class: "tag-image",
        src: "img/tag.png",
        height: "20",
      });
      cardBody.append(image);

      // Create a badge for each relevant tag and append to card header
      failGroups[description][0].tags.forEach(function (tag) {
        var badge = $("<span>", {
          class: "badge bg-danger mx-1",
          text: tag,
        });
        cardBody.append(badge);
      });
      accordionBody.append(card);
    });

    time_and_mediaFails.append(accordionItem);
  });

  if (!foundtime_and_mediaFails) {
    time_and_mediaFails.append("<div class='fail'><p>time-and-media violations were not found.</p></div>");
  }
}

function printTimeAndMediaResults(results) {
  printTimeAndMediaFails(results);
  printTimeAndMediaPasses(results);
}
