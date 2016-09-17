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
    // remove previous search results
    $('#wikipedia .row').remove(); // every result card
    $('#wikipedia p').remove(); // 'show x more results...'
    var numOfResults = data[1].length;
    var numOfCards = numOfResults;

    // always display all results, unless RESULTS_LIMIT < num of results
    if (numOfResults >= RESULTS_LIMIT) {
      numOfCards = RESULTS_LIMIT;
    }

    for (var i = 0; i < numOfCards; i++) {
      var url = data[3][i];

      // create html elements before appending to page
      // elements for results content
      var row = $('<div>').addClass('row');
      var col = $('<div>').addClass('col-sm-12 result-card');
      var title = $('<h4>').text(data[1][i] + ' ');
      var excerpt = $('<p>').text(data[2][i] + ' ');

      // when clicked launches Modal with relevant iframe
      var a = $('<a>').attr({
        'url': url, // hidden data, value is set as iframe 'src' when modal is triggered
        'data-toggle': 'modal',
        'data-target': '.iframe-modal-lg',
        'class': 'modal-trigger'
      });

      // elements for URL copy field
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
      starBtn.append(glyphicon);
      inputStar.append(starBtn);
      inputGroup.append(input, inputStar);
      col.append(a, inputGroup);
      row.append(col);
      // append card to page
      $('#wikipedia').append(row);
    }

    // display 'show x more results...' if applicable
    if (numOfResults > RESULTS_LIMIT) {
      var moreResults = numOfResults - RESULTS_LIMIT;
      var hidden = $('<p>').text('show ' + moreResults + ' more results...');
      $('#wikipedia').append(hidden);
    }

    // ============= Modal click handler ==============
    // index.html contains modal with embedded iframe
    // main.js sets relevant 'src' of iframe when result card is clicked
    $('.modal-trigger').on('click', function (ev) {
      // url is obtained from 'url' attr of <a>
      var url = ev.currentTarget.attributes[0].value;
      // prevent re-load of the same content in modal
      if ($('iframe').attr('src') !== url) {
        $('iframe').attr('src', url);
      }
    });
  }
});
