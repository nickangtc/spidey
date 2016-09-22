/* global $ */

// TODO: add click handler for star button to save to user account

// newsapi.org apiKey = 9b242e828f7142489a52bae448e8f9f8
// NYT apikey = 1a6e15371cf94b97a62802a17d365145

console.log('javascript working');

$(document).ready(function () {
  var SEARCH_STR = '';
  var RESULTS_LIMIT = 5; // will be updated based on user input later
  console.log('RESULTS_LIMIT:', RESULTS_LIMIT);

  // ======= Search form handler ========
  $('#submit-btn').on('click', function (ev) {
    ev.preventDefault();
    SEARCH_STR = $('form input').val();
    RESULTS_LIMIT = $('#results-limit').val();
    console.log('search string stored as: ' + SEARCH_STR);

    // show search term on page
    $('#search-term').text(SEARCH_STR);

    // send GET request to APIs
    console.log('search button clicked, calling getJSON with source = wikipedia');
    getJSON('wikipedia');
    getJSON('nyt');
    getJSON('guardian');
  });

  // ========== Functions ===========

  // Send AJAX GET requests to external APIs
  // sources covered: 'wikipedia', 'nyt', 'guardian'
  function getJSON (source) {
    var url = '';

    // WIKIPEDIA
    if (source === 'wikipedia') {
      console.log('inside getJSON(), source = wikipedia');
      url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=';

      $.ajax({
        url: url + SEARCH_STR,
        dataType: 'jsonp',
        method: 'GET',
        success: function (data) {
          console.log('obtained wikipedia data:', data);
          // give API data to getSavedUrls, just to pass it on to loadResults later
          console.log('calling getSavedUrls(data, source)');
          getSavedUrls(data, source);
        },
        error: function (err) {
          throw err;
        }
      });

      // NEW YORK TIMES
    } else if (source === 'nyt') {
      console.log('inside getJSON(), source = nyt');
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
          console.log(data);
        },
        error: function (err) {
          throw err;
        }
      });

      // THE GUARDIAN
    } else if (source === 'guardian') {
      console.log('inside getJSON(), source = guardian');
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
          console.log(data);
        },
        error: function (err) {
          throw err;
        }
      });
    }
  }

  // GET '/users/id/stars' to obtain currentUser's list of saved urls
  // apiData param corresponds to data from getJSON()
  // source param corresponds to api source (eg. wikipedia)
  function getSavedUrls (apiData, source) {
    console.log('inside getSavedUrls');
    $.ajax({
      url: '/getstars',
      type: 'GET',
      success: function (data) { // data = savedUrlsArr
        // hand everything to loadResults to append to page
        // server returns error if user is not logged in
        console.log('data inside getSavedUrls:', data);
        if (data.status !== 'error') {
          console.log('data.status inside getSavedUrls - ', data.status);
          console.log('previously starred array from server:', data);
          console.log('calling loadResults(apidata, source, data)');
          loadResults(apiData, source, data);
        } else {
          console.log('server returned with no previously stored array bc user not signed in');
          console.log('calling loadResults(apidata, source)');
          loadResults(apiData, source);
        }
      }
    });
  }

  // --- Format GET response, append to page ---
  // data = api response JSON
  // source = api source (eg. wikipedia, nyt, guardian)
  // savedUrlsArr = arr containing all of currentUser's savedUrls
  function loadResults (data, source, savedUrlsArr) {
    console.log('inside loadResults()');
    console.log('params passed in here are... data:', data, ' source:', source, ' savedUrlsArr:', savedUrlsArr);
    var sourceId = '#' + source;
    console.log('sourceId:', sourceId);

    // remove previous search results
    $(sourceId + ' .row').remove(); // every result card
    $(sourceId + ' p').remove(); // 'show x more results...'

    var title = '';
    var excerpt = '';
    var url = '';

    var numOfResults = '';
    var numOfCards = '';
    if (source === 'wikipedia') {
      numOfResults = data[1].length;
    } else if (source === 'nyt') {
      numOfResults = data.response.docs.length;
    } else if (source === 'guardian') {
      numOfResults = data.response.results.length;
    }
    // number of results displayed filter
    if (numOfResults >= RESULTS_LIMIT) {
      numOfCards = RESULTS_LIMIT;
    } else {
      numOfCards = numOfResults;
    }

    // each loop creates and appends individual results to DOM
    for (var i = 0; i < numOfCards; i++) {
      // WIKIPEDIA
      if (source === 'wikipedia') {
        title = $('<h4>').text(data[1][i]);
        excerpt = $('<p>').text(data[2][i]);
        url = data[3][i];

        // NEW YORK TIMES
      } else if (source === 'nyt') {
        title = $('<h4>').text(data.response.docs[i].headline.main);
        excerpt = $('<p>').text(data.response.docs[i].snippet);
        url = data.response.docs[i].web_url;

        // THE GUARDIAN
      } else if (source === 'guardian') {
        title = $('<h4>').text(data.response.results[i].webTitle);
        excerpt = $('<p>').text('no excerpt available');
        url = data.response.results[i].webUrl;
        console.log('guardian...', title, url);
      }

      // Note: No need to amend from here onwards - all works with various APIs
      // create html elements before appending to page
      // elements for results content
      var row = $('<div>').addClass('row');
      var col = $('<div>').addClass('col-sm-12 result-card');

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

      var glyphicon = '';
      if (isSavedBefore(url, savedUrlsArr)) {
        glyphicon = $('<span>').addClass('glyphicon glyphicon-star');
        starBtn.addClass('starred'); // indicate to frontend that it's starred
      } else if (!isSavedBefore(url, savedUrlsArr)) {
        glyphicon = $('<span>').addClass('glyphicon glyphicon-star-empty');
      }

      // append card elements from child to parent, then to page
      a.append(title, excerpt);
      starBtn.append(glyphicon);
      inputStar.append(starBtn);
      inputGroup.append(input, inputStar);
      col.append(a, inputGroup);
      row.append(col);
      // append card to page
      $(sourceId).append(row);
    } // -- end for loop --

    // // display 'show x more results...' if applicable
    // if (numOfResults > RESULTS_LIMIT) {
    //   var moreResults = numOfResults - RESULTS_LIMIT;
    //   var hidden = $('<p>').text('show ' + moreResults + ' more results...');
    //   $(sourceId).append(hidden);
    // }

    // ============= Star Buttons click handler =============
    $('.star-btn').on('click', function (ev) {
      // debugger;
      // url is obtained from 'url' attr of <a>
      var elem = $(this); // element handle
      var urlStr = $(elem).attr('url'); // string value
      console.log('ev', ev);

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
        if (action === 'create' && data.status !== 'error') {
          option = 'star';
        } else if (action === 'delete' && data.status !== 'error') {
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
        starGlyph = $(thatStarBtn).children()[0];
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

  // ================= Frontend form validation logic ==================
  // inputs to be validated have .validate class

  // $('.validate').on('focusout', validateInput);
  //
  // function validateInput (ev) {
  //   var input = $(this);
  //   var span = $('<span>');
  //
  //   console.log(span);
  //
  //   input.prepend(span);
  //   console.log('ev', ev);
  //   console.log('$(this):', input);
  //   console.log('$(this).siblings():', input.siblings());
  //   console.log('$(this).siblings()[0]:', input.siblings()[0]);
  //   console.log('$(this).siblings().prevObject:', input.siblings().prevObject);
  //   console.log('ev.target', ev.target);
  // }

  // $('#myModal').on('show.bs.modal', function () {
  //   $('.modal-content').css('height', $(window).height() * 0.9);
  // });
}); // end document ready function
