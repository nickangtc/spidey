/* global $ */

// TODO: add click handler for star button to save to user account

console.log('javascript working');

$(document).ready(function () {
  var SEARCH_STR = '';
  var RESULTS_LIMIT = 5;

  // ======= Search form handler ========
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
  // Send AJAX GET requests to external APIs
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
      var starBtn = $('<button>').attr({
        'type': 'button',
        'url': url
      }).addClass('btn btn-default star-btn');
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

    // ============= Star Buttons click handler =============
    $('.star-btn').on('click', function (ev) {
      // url is obtained from 'url' attr of <a>
      var elem = ev.currentTarget; // element handle
      var urlStr = elem.attributes.url.nodeValue; // string value
      console.log('ev', ev);

      if (!elem.classList.contains('starred')) {
        // format: updateSavedUrls(method, route, data)
        updateSavedUrls('create', '/stars/update', urlStr);
      } else if (elem.classList.contains('starred')) {
        // ajax DELETE to destroy matching entry in 'star' table in db
        updateSavedUrls('delete', '/stars/update', urlStr);
      }
    });

    // Send AJAX POST/DELETE requests to own server
    function updateSavedUrls (action, route, urlToUpdate) {
      // action: 'create' or 'delete' - used in node backend
      $.ajax({
        type: 'POST',
        url: route,
        data: {
          url: urlToUpdate,
          action: action
        },
        success: function (data) {
          console.log('data from server received:', data);
          var option = '';
          if (action === 'create') {
            option = 'star';
          } else if (action === 'delete') {
            option = 'unstar';
          }
          updateStarIcon(urlToUpdate, option, data);
        },
        error: function (xhr, err) {
          handleError(xhr, err, urlToUpdate); // urlToUpdate identifies which star-btn
        } // success implicitly handled by handleError function
      });
    }

    // options: 'star', 'unstar'
    function updateStarIcon (url, option, data) {
      console.log('inside updateStarIcon function');
      console.log('data:', data);
      var thatStarBtn = '';
      var starGlyph = '';

      if (data.status === 'error') { // user not logged in
        $('#user-msg').text('Please signup to save Urls').addClass('alert alert-danger');
      } else {  // user verified to be logged in
        // change glyphicon to coloured star
        if (option === 'star') {
          // remove 'star-btn' class (identifier)
          thatStarBtn = '.star-btn[url|="' + url + '"]';
          console.log('thatStarBtn before:', $(thatStarBtn));
          $(thatStarBtn).addClass('starred');
          console.log('thatStarBtn after:', $(thatStarBtn));
          // change star glyphicon to star-empty
          starGlyph = $(thatStarBtn).children()[0];
          $(starGlyph).addClass('glyphicon-star').removeClass('glyphicon-star-empty');

          // change glyphicon to empty star
        } else if (option === 'unstar') {
          // remove 'star-btn' class (identifier)
          thatStarBtn = '.star-btn[url|="' + url + '"]';
          console.log('thatStarBtn before:', $(thatStarBtn));
          $(thatStarBtn).removeClass('starred');
          console.log('thatStarBtn after:', $(thatStarBtn));
          // change star glyphicon to star-empty
          starGlyph = $(thatStarBtn).vchildren()[0];
          $(starGlyph).addClass('glyphicon-star-empty').removeClass('glyphicon-star');
        }
      }
    }

    // handle errors from updateSavedUrls() function
    function handleError (xhr, err, url) {
      // print error message to top of page
      $('#user-msg').text(err + ' when saving ' + url + ' - try again later');
      console.log('handling error...');

      // remove 'star-btn' class (identifier)
      var thatStarBtn = '.star-btn[url|="' + url + '"]';
      console.log('thatStarBtn before:', $(thatStarBtn));
      $(thatStarBtn).removeClass('starred');
      console.log('thatStarBtn after:', $(thatStarBtn));
      // change star glyphicon to star-empty
      var starGlyph = $(thatStarBtn).children()[0];
      $(starGlyph).addClass('glyphicon-star-empty').removeClass('glyphicon-star');
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
  } // end loadResults
});
