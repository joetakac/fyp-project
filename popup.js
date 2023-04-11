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
  this.querySelector(".spinner-border").removeAttribute("hidden");
  this.querySelector(".sr-only").removeAttribute("hidden");
  this.querySelector(".default").setAttribute("hidden", true);

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
    return true;
  });
});

function printARIAResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var ariaPasses = $(".accordion-body.aria-passes");
  var ariaFails = $(".accordion-body.aria-fails");

  var foundARIAPasses = false;
  // Print passes to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.aria")) {
      foundARIAPasses = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      ariaPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        ariaPasses.append(card);
      });
    }
  });

  if (!foundARIAPasses) {
    ariaPasses.append("<div class='pass'><p>ARIA passes were not found.</p></div>");
  }

  var foundARIAFails = false;
  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.aria")) {
      foundARIAFails = true;
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
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        ariaFails.append(card);
      });
    }
  });

  if (!foundARIAFails) {
    ariaFails.append("<div class='pass'><p>ARIA violations were not found.</p></div>");
  }
}

function printColorResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var colorPasses = $(".accordion-body.color-passes");
  var colorFails = $(".accordion-body.color-fails");

  var foundColorPasses = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.color")) {
      foundColorPasses = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      colorPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        colorPasses.append(card);
      });
    }
  });

  if (!foundColorPasses) {
    colorPasses.append("<div class='pass'><p>Color passes were not found.</p></div>");
  }

  var foundColorFails = false;
  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.color")) {
      foundColorFails = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      colorFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        colorFails.append(card);
      });
    }
  });
  if (!foundColorFails) {
    colorFails.append("<div class='pass'><p>Color violations were not found.</p></div>");
  }
}

function printFormsResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var formsPasses = $(".accordion-body.forms-passes");
  var formsFails = $(".accordion-body.forms-fails");

  var formPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.forms")) {
      formPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      formsPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        formsPasses.append(card);
      });
    }
  });

  if (!formPassesFound) {
    formsPasses.append("<div class='pass'><p>Form passes were not found.</p></div>");
  }

  //create a variable to check if form fails were found
  var formFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.forms")) {
      formFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      formsFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        formsFails.append(card);
      });
    }
  });

  //if no form fails were found, print message
  if (!formFailsFound) {
    formsFails.append("<div class='pass'><p>Form fails were not found.</p></div>");
  }
}

function printKeyboardResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var keyboardPasses = $(".accordion-body.keyboard-passes");
  var keyboardFails = $(".accordion-body.keyboard-fails");

  var keyboardPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.keyboard")) {
      keyboardPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      keyboardPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        keyboardPasses.append(card);
      });
    }
  });

  if (!keyboardPassesFound) {
    keyboardPasses.append("<div class='pass'><p>keyboard passes were not found.</p></div>");
  }

  //create a variable to check if keyboard fails were found
  var keyboardFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.keyboard")) {
      keyboardFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      keyboardFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        keyboardFails.append(card);
      });
    }
  });

  //if no keyboard fails were found, print message
  if (!keyboardFailsFound) {
    keyboardFails.append("<div class='pass'><p>keyboard passes were not found.</p></div>");
  }
}

function printLanguageResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var languagePasses = $(".accordion-body.language-passes");
  var languageFails = $(".accordion-body.language-fails");

  var languagePassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.language")) {
      languagePassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      languagePasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        languagePasses.append(card);
      });
    }
  });

  if (!languagePassesFound) {
    languagePasses.append("<div class='pass'><p>language passes were not found.</p></div>");
  }

  //create a variable to check if language fails were found
  var languageFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.language")) {
      languageFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      languageFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        languageFails.append(card);
      });
    }
  });

  //if no language fails were found, print message
  if (!languageFailsFound) {
    languageFails.append("<div class='pass'><p>Language violations were not found.</p></div>");
  }
}

function printNameRoleValueResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var name_role_valuePasses = $(".accordion-body.name-role-value-passes");
  var name_role_valueFails = $(".accordion-body.name-role-value-fails");

  var name_role_valuePassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.name-role-value")) {
      name_role_valuePassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      name_role_valuePasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        name_role_valuePasses.append(card);
      });
    }
  });

  if (!name_role_valuePassesFound) {
    name_role_valuePasses.append("<div class='pass'><p>language passes were not found.</p></div>");
  }

  //create a variable to check if name_role_value fails were found
  var name_role_valueFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.name-role-value")) {
      name_role_valueFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      name_role_valueFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        name_role_valueFails.append(card);
      });
    }
  });

  //if no name_role_value fails were found, print message
  if (!name_role_valueFailsFound) {
    name_role_valueFails.append("<div class='pass'><p>name_role_value violations were not found.</p></div>");
  }
}

function printParsingResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var parsingPasses = $(".accordion-body.parsing-passes");
  var parsingFails = $(".accordion-body.parsing-fails");

  var parsingPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.parsing")) {
      parsingPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      parsingPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        parsingPasses.append(card);
      });
    }
  });

  if (!parsingPassesFound) {
    parsingPasses.append("<div class='pass'><p>parsing passes were not found.</p></div>");
  }

  //create a variable to check if parsing fails were found
  var parsingFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.parsing")) {
      parsingFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      parsingFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        parsingFails.append(card);
      });
    }
  });

  //if no parsing fails were found, print message
  if (!parsingFailsFound) {
    parsingFails.append("<div class='pass'><p>parsing violations were not found.</p></div>");
  }
}

function printSemanticsResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var semanticsPasses = $(".accordion-body.semantics-passes");
  var semanticsFails = $(".accordion-body.semantics-fails");

  var semanticsPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.semantics")) {
      semanticsPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      semanticsPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        semanticsPasses.append(card);
      });
    }
  });

  if (!semanticsPassesFound) {
    semanticsPasses.append("<div class='pass'><p>semantics passes were not found.</p></div>");
  }

  //create a variable to check if semantics fails were found
  var semanticsFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.semantics")) {
      semanticsFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      semanticsFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        semanticsFails.append(card);
      });
    }
  });

  //if no semantics fails were found, print message
  if (!semanticsFailsFound) {
    semanticsFails.append("<div class='pass'><p>semantics violations were not found.</p></div>");
  }
}

function printSensoryAndVisualCuesResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var sensory_and_visual_cuesPasses = $(".accordion-body.sensory-and-visual-cues-passes");
  var sensory_and_visual_cuesFails = $(".accordion-body.sensory-and-visual-cues-fails");

  var sensory_and_visual_cuesPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.sensory-and-visual-cues")) {
      sensory_and_visual_cuesPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      sensory_and_visual_cuesPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        sensory_and_visual_cuesPasses.append(card);
      });
    }
  });

  if (!sensory_and_visual_cuesPassesFound) {
    sensory_and_visual_cuesPasses.append("<div class='pass'><p>sensory-and-visual-cues passes were not found.</p></div>");
  }

  //create a variable to check if sensory_and_visual_cues fails were found
  var sensory_and_visual_cuesFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.sensory-and-visual-cues")) {
      sensory_and_visual_cuesFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      sensory_and_visual_cuesFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        sensory_and_visual_cuesFails.append(card);
      });
    }
  });

  //if no sensory_and_visual_cues fails were found, print message
  if (!sensory_and_visual_cuesFailsFound) {
    sensory_and_visual_cuesFails.append("<div class='pass'><p>sensory-and-visual-cues violations were not found.</p></div>");
  }
} 

function printStructureResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var structurePasses = $(".accordion-body.structure-passes");
  var structureFails = $(".accordion-body.structure-fails");

  var structurePassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.structure")) {
      structurePassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      structurePasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        structurePasses.append(card);
      });
    }
  });

  if (!structurePassesFound) {
    structurePasses.append("<div class='pass'><p>structure passes were not found.</p></div>");
  }

  //create a variable to check if structure fails were found
  var structureFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.structure")) {
      structureFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      structureFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        structureFails.append(card);
      });
    }
  });

  //if no structure fails were found, print message
  if (!structureFailsFound) {
    structureFails.append("<div class='pass'><p>structure violations were not found.</p></div>");
  }
}

function printTablesResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var tablesPasses = $(".accordion-body.tables-passes");
  var tablesFails = $(".accordion-body.tables-fails");

  var tablesPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.tables")) {
      tablesPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      tablesPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        tablesPasses.append(card);
      });
    }
  });

  if (!tablesPassesFound) {
    tablesPasses.append("<div class='pass'><p>tables passes were not found.</p></div>");
  }

  //create a variable to check if tables fails were found
  var tablesFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.tables")) {
      tablesFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      tablesFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        tablesFails.append(card);
      });
    }
  });

  //if no tables fails were found, print message
  if (!tablesFailsFound) {
    tablesFails.append("<div class='pass'><p>tables violations were not found.</p></div>");
  }
}

function printTextAlternativesResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var text_alternativesPasses = $(".accordion-body.text-alternatives-passes");
  var text_alternativesFails = $(".accordion-body.text-alternatives-fails");

  var text_alternativesPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.text-alternatives")) {
      text_alternativesPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      text_alternativesPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        text_alternativesPasses.append(card);
      });
    }
  });

  if (!text_alternativesPassesFound) {
    text_alternativesPasses.append("<div class='pass'><p>text_alternatives passes were not found.</p></div>");
  }

  //create a variable to check if text_alternatives fails were found
  var text_alternativesFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.text-alternatives")) {
      text_alternativesFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      text_alternativesFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        text_alternativesFails.append(card);
      });
    }
  });

  //if no text_alternatives fails were found, print message
  if (!text_alternativesFailsFound) {
    text_alternativesFails.append("<div class='pass'><p>text-alternatives violations were not found.</p></div>");
  }
}

function printTimeAndMediaResults(results) {
  var passes = results.passes;
  var fails = results.violations;
  var time_and_mediaPasses = $(".accordion-body.time-and-media-passes");
  var time_and_mediaFails = $(".accordion-body.time-and-media-fails");

  var time_and_mediaPassesFound = false;
  // Print failures to the relevant div
  passes.forEach(function (pass) {
    if (pass.tags.includes("cat.time-and-media")) {
      time_and_mediaPassesFound = true;
      var description = pass.description;
      var nodes = pass.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      time_and_mediaPasses.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Passing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        cardBody.append(cardTitle, code);
        card.append(cardBody);
        time_and_mediaPasses.append(card);
      });
    }
  });

  if (!time_and_mediaPassesFound) {
    time_and_mediaPasses.append("<div class='pass'><p>time_and_media passes were not found.</p></div>");
  }

  //create a variable to check if time_and_media fails were found
  var time_and_mediaFailsFound = false;

  // Print failures to the relevant div
  fails.forEach(function (fail) {
    if (fail.tags.includes("cat.time-and-media")) {
      time_and_mediaFailsFound = true;
      var description = fail.description;
      var nodes = fail.nodes;
      var html = "";

      nodes.forEach(function (node) {
        html += "<p>" + node.html + "</p>";
      });

      time_and_mediaFails.append("<div class='fail'><h4>" + description + "</h4></div>");

      var htmlSnippets = html.split("<p>").filter(function (snippet) {
        return snippet !== "";
      });

      htmlSnippets.forEach(function (snippet) {
        var card = $("<div>", { class: "card mb-3 bg-light" });
        var cardBody = $("<div>", { class: "card-body" });
        var cardTitle = $("<h5>", { class: "card-title text-dark" }).text("Failing element");
        var code = $("<pre>", { class: "card-text mb-0 text-muted" }).html(snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        var help = $("<p>", { class: "help" }).text(fail.help);

        cardBody.append(cardTitle, code, help);
        card.append(cardBody);
        time_and_mediaFails.append(card);
      });
    }
  });

  //if no time_and_media fails were found, print message
  if (!time_and_mediaFailsFound) {
    time_and_mediaFails.append("<div class='pass'><p>time_and_media violations were not found.</p></div>");
  }
}