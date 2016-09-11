/* global $ */

console.log('javascript working');

$(document).ready(function () {
  var SEARCH_STR = '';

  // submit via search button
  $('#submit-btn').on('click', function (ev) {
    ev.preventDefault();
    SEARCH_STR = $('form input').val();
    console.log('search string stored as: ' + SEARCH_STR);
    $.ajax({
      url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + SEARCH_STR,
      dataType: 'jsonp',
      type: 'GET',
      success: loadResults
    });
  });

  function loadResults (data) {
    console.log(data);
  }
});
