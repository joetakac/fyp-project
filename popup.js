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
      chrome.storage.local.set({ axeResults: results }); // Save the results object to chrome storage

      //hide the home page and show the report page
      $(".nav-link").removeClass("active");
      $(".tab-pane").removeClass("show active");
      var report = $("#report");
      report.addClass("show active");

      // Print the results to the page
      printARIAResults(results);
    }
    return true;
  });
});

function printARIAResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var ariaPasses = $(".accordion-body.aria-passes");
  var ariaFails = $(".accordion-body.aria-fails");

  if (passes.length === 0) {
    ariaPasses.append("<div class='pass'><p>ARIA passes were not found.</p></div>");
  }

  if (fails.length === 0) {
    ariaFails.append("<div class='fail'><p>ARIA violations were not found.</p></div>");
  }

  // Print passes to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.aria")) {
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      var card = $("<div>", { class: "card mb-3" });
      var cardBody = $("<div>", { class: "card-body" });
      var cardTitle = $("<h5>", { class: "card-title" }).text(description);
      var code = $("<pre>", { class: "card-text mb-0" }).html(html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

      cardBody.append(cardTitle, code);
      card.append(cardBody);
      ariaPasses.append(card);
    } else {
      ariaPasses.append("<p>ARIA elements were not found.</p>");
    }
  });

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.aria")) {
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      ariaFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        ariaFails.append(card);
      });
    } else {
      ariaFails.append("<p>ARIA violations were not found.</p>");
    }
  });
}
