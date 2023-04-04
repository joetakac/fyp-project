jQuery(function() {
  jQuery('.config').on('click', function (e) {
console.log('config clicked');
  });
});

jQuery(function() {
  jQuery('.help').on('click', function (e) {
console.log('help clicked');
  });
});

jQuery(function() {
  jQuery('.settings').on('click', function (e) {
console.log('settings clicked');
  });
});

$(function() {
  $('body').on('click', '.nav-link', function() {
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('.tab-pane').removeClass('show active');
    $( $(this).attr('href') ).addClass('show active');
  });
});