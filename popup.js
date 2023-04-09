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

$('.info-categories').on('click', function () {
  $(".nav-link").removeClass("active");
  $(".tab-pane").removeClass("show active");
  var help = $("#help");
  help.addClass("show active");
  $(help.attr("href")).addClass("show active");
  $('#confighelp').trigger('focus');
});

// Event listener for the submit button
$("#reportconfig").on("click", function () {
  // Get the values of the checkboxes and radio buttons
  var userCatOptions = {
    aria: $("#ariacheck").is(":checked"),
    color: $("#colourcheck").is(":checked"),
    forms: $("#formcheck").is(":checked"),
    keyboard: $("#keyboardcheck").is(":checked"),
    language: $("#langcheck").is(":checked"),
    namerole: $("#namerolecheck").is(":checked"),
    parsing: $("#parsecheck").is(":checked"),
    semantics: $("#semcheck").is(":checked"),
    sensory_visual: $("#snvcheck").is(":checked"),
    structure: $("#structcheck").is(":checked"),
    tables: $("#tablecheck").is(":checked"),
    text_alternatives: $("#altcheck").is(":checked"),
    time_media: $("#tnmcheck").is(":checked"),
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

  chrome.storage.local.set({ axeConfig: options }); // Save the options object to chrome storage
  console.log(options);
});

$("#report").on("click", async function () {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);

  chrome.runtime.sendMessage({ action: "runAxe", tab: tab }); // Send a message to the background script to run axe on the current page
});
