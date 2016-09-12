/* global $ */

// TODO: add click handler for star button to save to user account

console.log('javascript working');

$(document).ready(function () {
  var SEARCH_STR = '';
  var RESULTS_LIMIT = 5;

  // ======= Form handler ========
  $('#submit-btn').on('click', function (ev) {
    ev.preventDefault();
    SEARCH_STR = $('form input').val();
    console.log('search string stored as: ' + SEARCH_STR);

    // show search term on page
    $('#search-term').text(SEARCH_STR);

    // send GET request to APIs
    getJSON('jsonp', 'wikipedia');
  });

  // ========== Functions ===========
  // Send AJAX GET requests
  function getJSON (dataType, source) {
    var url = '';
    if (source === 'wikipedia') {
      url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=';
    }
    console.log('url', url, 'source', source, 'searchstr', SEARCH_STR);

    $.ajax({
      url: url + SEARCH_STR,
      dataType: dataType,
      type: 'GET',
      success: function (data) {
        loadResults(data, source);
      }
    });
  }

  // Format GET response, append to page
  function loadResults (data, source) {
    $('#wikipedia .row').empty();
    var moreResults = data[1].length - RESULTS_LIMIT;
    for (var i = 0; i < RESULTS_LIMIT; i++) {
      // create html elements before appending to page
      var url = data[3][i];
      var hidden = $('<p>').text('show ' + moreResults + ' more results...');

      var row = $('<div>').addClass('row');
      var a = $('<a>').attr('href', url);
      var col = $('<div>').addClass('col-sm-12 result-card');
      var title = $('<h4>').text(data[1][i] + ' ');
      var excerpt = $('<p>').text(data[2][i] + ' ');

      var inputGroup = $('<div>').addClass('input-group input-group-sm copy-url');
      var input = $('<input>').attr({
        onclick: 'this.select();',
        type: 'text',
        value: url
      }).addClass('form-control');
      var inputStar = $('<span>').addClass('input-group-btn');
      var starBtn = $('<button>').attr('type', 'button').addClass('btn btn-default');
      var glyphicon = $('<span>').addClass('glyphicon glyphicon-star-empty');

      // append card elements from child to parent, then to page
      a.append(title, excerpt);
      // copy-url interface at bottom of card
      starBtn.append(glyphicon);
      inputStar.append(starBtn);
      inputGroup.append(input, inputStar);
      // content of card
      col.append(a, inputGroup);
      row.append(col);
      $('#wikipedia').append(row);
    }
    $('#wikipedia').append(hidden);
  }
});
