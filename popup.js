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
  // When the "Back" button is clicked on the help page
  $(document).on("click", "#back", function (e) {
    $(".nav-link").removeClass("active");
    $(".tab-pane").removeClass("show active");
    var popup = $("#popup");
    popup.addClass("show active");
    $(popup.attr("href")).addClass("show active");
  });
});

// Event listener for the submit button
$("#reportconfig").on("click", function () {
  // Get the values of the checkboxes and radio buttons
  var aria = $("#ariacheck").is(":checked");
  var color = $("#colourcheck").is(":checked");
  var forms = $("#formcheck").is(":checked");
  var keyboard = $("#keyboardcheck").is(":checked");
  var language = $("#langcheck").is(":checked");
  var namerole = $("#namerolecheck").is(":checked");
  var parsing = $("#parsecheck").is(":checked");
  var semantics = $("#semcheck").is(":checked");
  var sensory_visual = $("#snvcheck").is(":checked");
  var structure = $("#structcheck").is(":checked");
  var tables = $("#tablecheck").is(":checked");
  var text_alternatives = $("#altcheck").is(":checked");
  var time_media = $("#tnmcheck").is(":checked");

  var wcag2a = $("#wcag2acheck").is(":checked");
  var wcag2aa = $("#wcag2aacheck").is(":checked");
  var wcag21a = $("#wcag21acheck").is(":checked");
  var wcag21aa = $("#wcag21aacheck").is(":checked");

  // Get the text value of the selected radio button label
  var device = $("input[name='device']:checked + label").text();

  // Create the options object
  var options = {
    aria: aria,
    color: color,
    forms: forms,
    keyboard: keyboard,
    language: language,
    namerole: namerole,
    parsing: parsing,
    semantics: semantics,
    sensory_visual: sensory_visual,
    structure: structure,
    tables: tables,
    text_alternatives: text_alternatives,
    time_media: time_media,
    wcag2a: wcag2a,
    wcag2aa: wcag2aa,
    wcag21a: wcag21a,
    wcag21aa: wcag21aa,
    device: device,
  };

  chrome.storage.local.set({ axeConfig: options }); // Save the options object to chrome storage
  console.log(options);
});

$('#report').on('click', async function () {

    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);

  chrome.runtime.sendMessage({ action: "runAxe", tab: tab}); // Send a message to the background script to run axe on the current page
});