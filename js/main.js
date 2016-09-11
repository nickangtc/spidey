/* global $ */

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

  function loadResults (data, source) {
    for (var i = 0; i < RESULTS_LIMIT; i++) {
      // create html elements to append to page
      var url = data[3][i];
      var row = $('<div>').addClass('row');
      var a = $('<a>').attr('href', url);
      var col = $('<div>').addClass('col-sm-12 result-card');
      var title = $('<h4>').text(data[1][i] + ' ');
      var excerpt = $('<p>').text(data[2][i] + ' ');
      var glyphicon = $('<span>').addClass('glyphicon glyphicon-copy');

      // append elements from child to parent, then to page
      title.append(glyphicon);
      a.append(excerpt);
      col.append(title, a);
      row.append(col);
      $('#wikipedia').append(row);
    }
    // create div class row
    // create and append to div: a href "wiki URL"
    // create and append to a: div class col-sm-12 result-card
    // create and append to div: h4 for title, p for excerpt
    // append to $('#wikipedia')

  }
});
