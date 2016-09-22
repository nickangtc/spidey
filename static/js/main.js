/* global $ */

// TODO: add click handler for star button to save to user account
// TODO: some useful code snippets can be found at end of this file

console.log('javascript working');

$(document).ready(function () {
  var SEARCH_STR = '';
  var RESULTS_LIMIT = 5; // will be updated based on user input later

  // ======= Search form handler ========
  $('#submit-btn').on('click', function (ev) {
    ev.preventDefault();

    // display loading spinner
    var throbber = $('<i>').addClass('fa fa-spinner fa-2x fa-spin');
    $('#wikipedia, #nyt, #guardian').append(throbber);

    // extract search string and results limit inputs
    SEARCH_STR = $('form input').val();
    RESULTS_LIMIT = $('#results-limit').val();

    // show search term on page
    $('#search-term').text(SEARCH_STR);

    // send GET request to APIs
    getJSON('wikipedia');
    getJSON('nyt');
    getJSON('guardian');
  });

  // ========== Functions ===========

  // Send AJAX GET requests to external APIs
  // sources covered: 'wikipedia', 'nyt', 'guardian'
  function getJSON (source) {
    var url = '';

    // WIKIPEDIA API CALL
    if (source === 'wikipedia') {
      url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=';

      $.ajax({
        url: url + SEARCH_STR,
        dataType: 'jsonp',
        method: 'GET',
        success: function (data) {
          // give API data to getSavedUrls, just to pass it on to loadResults later
          getSavedUrls(data, source);
        },
        error: function (err) {
          throw err;
        }
      });

      // NEW YORK TIMES API CALL
    } else if (source === 'nyt') {
      url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
      url += '?' + $.param({
        'api-key': '1a6e15371cf94b97a62802a17d365145',
        'q': SEARCH_STR,
        'begin_date': '20140101'
      });

      $.ajax({
        url: url,
        dataType: 'json',
        method: 'GET',
        success: function (data) {
          getSavedUrls(data, source);
        },
        error: function (err) {
          throw err;
        }
      });

      // THE GUARDIAN API CALL
    } else if (source === 'guardian') {
      url = 'http://content.guardianapis.com/search';
      url += '?' + $.param({
        'api-key': 'e8eb4ddb-47ce-4400-9edc-42c41e3f2a2f',
        'q': SEARCH_STR,
        'from-date': '2014-01-01',
        'section': 'news'
      });

      $.ajax({
        url: url,
        dataType: 'json',
        method: 'GET',
        success: function (data) {
          getSavedUrls(data, source);
        },
        error: function (err) {
          throw err;
        }
      });
    }
  }

  // request currentUser's list of saved urls from backend
  // apiData param carries data from getJSON()
  // source param corresponds to api source (eg. wikipedia)
  function getSavedUrls (apiData, source) {
    $.ajax({
      url: '/getstars',
      type: 'GET',
      success: function (data) { // data = savedUrlsArr
        // server returns error if user is not logged in
        if (data.status !== 'error') { // logged in
          loadResults(apiData, source, data);
        } else { // not logged in
          loadResults(apiData, source);
        }
      },
      error: function (err) {
        throw err;
      }
    });
  }

  // --- Format GET response, append to page ---
  // data = api response JSON
  // source = api source (eg. wikipedia, nyt, guardian)
  // savedUrlsArr = arr containing all of currentUser's savedUrls
  function loadResults (data, source, savedUrlsArr) {
    var sourceId = '#' + source;

    // remove throbber
    $(sourceId + ' i').fadeOut();
    // remove previous search results
    $(sourceId + ' .row').remove(); // every result card
    $(sourceId + ' p').remove(); // 'show x more results...'

    // common elements to be created below
    var title = '';
    var excerpt = '';
    var url = '';

    var numOfResults = '';
    var numOfCards = '';
    // CONFIGURATION for each API integration
    if (source === 'wikipedia') {
      numOfResults = data[1].length;
    } else if (source === 'nyt') {
      numOfResults = data.response.docs.length;
    } else if (source === 'guardian') {
      numOfResults = data.response.results.length;
    }

    // limit results displayed based on user's max input
    if (numOfResults >= RESULTS_LIMIT) {
      numOfCards = RESULTS_LIMIT;
    } else {
      numOfCards = numOfResults;
    }

    // each loop creates and appends a result card to DOM
    for (var i = 0; i < numOfCards; i++) {
      // CONFIGURATION for each API integration
      // WIKIPEDIA
      if (source === 'wikipedia') {
        title = $('<h3>').text(data[1][i]);
        excerpt = $('<p>').text(data[2][i]);
        url = data[3][i];

        // NEW YORK TIMES
      } else if (source === 'nyt') {
        title = $('<h3>').text(data.response.docs[i].headline.main);
        excerpt = $('<p>').text(data.response.docs[i].snippet);
        url = data.response.docs[i].web_url;

        // THE GUARDIAN
      } else if (source === 'guardian') {
        title = $('<h3>').text(data.response.results[i].webTitle);
        excerpt = $('<p>').text('no excerpt available');
        url = data.response.results[i].webUrl;
      }

      // Note: No need to amend from here onwards - all works with various APIs
      // create html elements before appending to page
      var row = $('<div>').addClass('row');
      var col = $('<div>').addClass('col-sm-12 result-card');

      // click to launch BS Modal with relevant iframe
      var a = $('<a>').attr({
        'url': url, // hidden data, value is set as iframe 'src' when modal is triggered
        'data-toggle': 'modal',
        'data-target': '.iframe-modal-lg',
        'class': 'modal-trigger'
      });

      // create URL input field
      var inputGroup = $('<div>').addClass('input-group input-group-sm copy-url');
      var input = $('<input>').attr({
        onclick: 'this.select();',
        type: 'text',
        value: url,
        id: 'link-' + source + '-' + i
      }).addClass('form-control');
      var inputGroupBtns = $('<span>').addClass('input-group-btn');

      // --- create and modify star button (save url to backend) ---
      var starBtn = $('<button>').attr({
        'type': 'button',
        'url': url
      }).addClass('btn btn-default star-btn');
      var starGlyphicon = '';

      // check if user has saved url before
      if (isSavedBefore(url, savedUrlsArr)) {
        starGlyphicon = $('<span>').addClass('glyphicon glyphicon-star');
        starBtn.addClass('starred'); // indicate to frontend that it's starred
      } else if (!isSavedBefore(url, savedUrlsArr)) {
        starGlyphicon = $('<span>').addClass('glyphicon glyphicon-star-empty');
      }
      // nest glyph inside button
      starBtn.append(starGlyphicon);

      // --- create and modify COPY button (one click copy) ---
      var copyBtn = $('<button>').attr({
        type: 'button',
        'data-clipboard-target': '#link-' + source + '-' + i
      }).addClass('clipboard btn btn-default');
      var copyGlyphicon = $('<span>').addClass('glyphicon glyphicon-copy');
      // nest glyph inside button
      copyBtn.append(copyGlyphicon);

      // --- create and modify GLOBE button (open in new tab) ---
      var globeBtn = $('<a>').attr({ // yes, it's a hack
        href: url,
        target: '_blank'
      }).addClass('btn btn-default');
      var globeGlyphicon = $('<span>').addClass('glyphicon glyphicon-globe');
      // nest glyph inside button
      globeBtn.append(globeGlyphicon);

      // APPEND ALL THE ABOVE TO PAGE
      a.append(title, excerpt);
      inputGroupBtns.append(copyBtn, globeBtn, starBtn);
      inputGroup.append(input, inputGroupBtns);
      col.append(a, inputGroup);
      row.append(col);

      // append card to page
      $(sourceId).append(row);
    } // -- end for loop --

    // ============= Star Buttons click handler =============
    $('.star-btn').on('click', function (ev) {
      // debugger;
      // url is obtained from 'url' attr of <a>
      var elem = $(this); // element handle
      var urlStr = $(elem).attr('url'); // string value

      if (!elem.hasClass('starred')) {
        // format: updateSavedUrls(method, route, data)
        updateSavedUrls('create', '/stars/update', urlStr);
      } else if (elem.hasClass('starred')) {
        // ajax DELETE to destroy matching entry in 'star' table in db
        updateSavedUrls('delete', '/stars/update', urlStr);
      }
    });

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

  // Send AJAX POST requests to own server
  function updateSavedUrls (action, route, urlToUpdate) {
    // action: 'create' or 'delete' - backend configured to these values
    $.ajax({
      type: 'POST',
      url: route,
      data: {
        url: urlToUpdate,
        action: action
      },
      success: function (data) {
        var option = '';
        if (action === 'create' && data.status !== 'error') {
          option = 'star';
        } else if (action === 'delete' && data.status !== 'error') {
          option = 'unstar';
        }
        updateStarIcon(urlToUpdate, option, data);
      },
      error: function (err) {
        throw err;
      }
    });
  }

  // options: 'star', 'unstar'
  function updateStarIcon (url, option, data) {
    var thatStarBtn = '';
    var starGlyph = '';

    if (data.status === 'error') { // user not logged in
      $('#user-msg').text('Please signup to save Urls').addClass('alert alert-danger');
    } else {  // user verified to be logged in
      // change glyphicon to coloured star
      if (option === 'star') {
        // remove 'star-btn' class (identifier)
        thatStarBtn = '.star-btn[url|="' + url + '"]';
        $(thatStarBtn).addClass('starred');
        // change star glyphicon to star-empty
        starGlyph = $(thatStarBtn).children()[0];
        $(starGlyph).addClass('glyphicon-star').removeClass('glyphicon-star-empty');

        // change glyphicon to empty star
      } else if (option === 'unstar') {
        // remove 'star-btn' class (identifier)
        thatStarBtn = '.star-btn[url|="' + url + '"]';
        $(thatStarBtn).removeClass('starred');
        // change star glyphicon to star-empty
        starGlyph = $(thatStarBtn).children()[0];
        $(starGlyph).addClass('glyphicon-star-empty').removeClass('glyphicon-star');
      }
    }
  }

  // checks if a particular url is contained in user's savedUrlsArr
  function isSavedBefore (url, arr) {
    if (arr === undefined) {
      return false;
    }
    for (var i = 0; i < arr.length; i++) {
      if (url === arr[i].url) {
        return true;
      }
    }
    return false;
  }

  // intialise clipboard.js, loaded in layout.ejs
  // project: https://clipboardjs.com/ - click button to copy text
  var clipboard = new Clipboard('.clipboard');

  // =========== CODE DUMP (IGNORE) ===========
  // FUTURE USE - FIX NON-ROOT SEARCH SUBMITS
  // var currentPage = $(location).attr('href');
  // if (currentPage !== 'http://localhost:3000') {
  //   console.log('current page IS NOT ROOT');
  //   window.location = "/?string=" + SEARCH_STR;
  // }
}); // end document ready function
