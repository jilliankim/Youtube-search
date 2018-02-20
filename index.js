'use strict';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = 'AIzaSyBaRVmbuUlZraJz_FMp1_EKn2YD81p90mA';

let searchString, nextPageToken, prevPageToken;

// handles the search 
function handleSearch() {
    $('.search-form').on('submit', function(event){
        event.preventDefault();
        
        // get search string
        searchString = $('.query').val();
        
        // clear and deselect input
        $('.query').val('').blur(); 
        
        // make AJAX call. pass null for pageToken
        getAPIData(searchString, null, handleAPIResponse);
    })
}

// gets api data
// if nextPageToken is supplied, use that as a parameter
function getAPIData(string, pageToken, callback) {
    const settings = {
        url: YOUTUBE_SEARCH_URL,
        data: {
            q: string,
            key: YOUTUBE_API_KEY,
            part: 'snippet',
            pageToken: pageToken
        },
        dataType: 'json',
        type: 'GET',
        success: callback
    };

  $.ajax(settings);
}

// API callback function
// renders the response as html, updates tokens, and creates next/prev listeners
function handleAPIResponse(response) {        
    renderHtml(compileResults(response));

    nextPageToken = response.nextPageToken;
    prevPageToken = response.prevPageToken;
    
    handleNextPage();
    handlePrevPage();
}

// build array of objects containing search results
function compileResults(response) {
    let resultsPerPage = response.pageInfo.resultsPerPage;
    let resultArr = [];
    
    for(let i = 0; i < resultsPerPage; i++) {
        let resultObj = {
            title: response.items[i].snippet.title,
            description: response.items[i].snippet.description,
            thumbnailUrl: response.items[i].snippet.thumbnails.default.url,
            id: response.items[i].id.videoId || response.items[i].id.channelId,
            kind: response.items[i].id.kind,
            getUrl: function() {
                //added try catch to catch uncaught error
                try {
                    if (this.kind.match('video')) {
                        return `https://www.youtube.com/watch?v=${this.id}`;
                    } else if (this.kind.match('channel')) {
                        return `https://www.youtube.com/channel/${this.id}`;
                    }
                } catch (err) {
                    console.log(err)
                    throw `response ${this.kind} unknown. Not a video or a channel.`
                }
            }
        } 
        resultArr.push(resultObj);
    }
    return resultArr;
}

// Render the API data as HTML 
function renderHtml(results) {
    clearSearchResults();
    
    // loop through data and append html to .search-results
    for(let i = 0; i < results.length; i++) {
        let resultHtml = `<div class="result">
                            <h2>${results[i].title}</h2>
                            <a href="${results[i].getUrl()}" target="_blank">
                                <img src="${results[i].thumbnailUrl}" alt="${results[i].description}"/>
                            </a>
                          </div>`
        // append the html result
        $('.search-results').append(resultHtml);
    }
    // add Next and Prev buttons
    $('.search-results').prepend(`<button type="button" class="next-results">Next</button>`);
    $('.search-results').prepend(`<button type="button" class="prev-results">Prev</button>`);
}

// listens for a click on the Next page button
// calls API to request the next page of data
function handleNextPage() {
    $('.next-results').on('click', function() {
        getAPIData(searchString, nextPageToken, handleAPIResponse);
    })
}

// listens for a click on the Prev page button
// calls API to request the Prev page of data
function handlePrevPage() {
    $('.prev-results').on('click', function() {
        getAPIData(searchString, prevPageToken, handleAPIResponse);
    })
}

// empties the .search-results div
function clearSearchResults() {
    $('.search-results').html('');
}

$(handleSearch);