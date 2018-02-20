'use strict';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = 'AIzaSyBaRVmbuUlZraJz_FMp1_EKn2YD81p90mA';

let searchString = '';

// handles the search 
function handleSearch() {
    $('.search-form').on('submit', function(event){
        event.preventDefault();
        
        // get search string
        searchString = $('.query').val();
        
        // make AJAX call 
        getAPIData(searchString, null, handleAPIResponse);
    })
}

// gets api data
// if nextPageToken is supplied, use that as a parameter
function getAPIData(string, nextPageToken, callback) {
    const settings = {
        url: YOUTUBE_SEARCH_URL,
        data: {
            q: string,
            key: YOUTUBE_API_KEY,
            part: 'snippet',
            pageToken: nextPageToken
        },
        dataType: 'json',
        type: 'GET',
        success: callback
    };

  $.ajax(settings);
}

function handleAPIResponse(response) {    
    let nextPageToken = response.nextPageToken;

    // compile result data into array of objects
    let resultArr = compileResult(response);
    
    // render html
    renderHtml(resultArr);

    // listen for click on Next button
    handleNextPage(searchString, nextPageToken);
    
    $('.query').val('').blur(); // empty and deselect input
}

function compileResult(result) {
    // build array of objects containing search results
    let resultsPerPage = result.pageInfo.resultsPerPage;
    let resultArr = [];
    
    for(let i = 0; i < resultsPerPage; i++) {
        let resultObj = {
            title: result.items[i].snippet.title,
            description: result.items[i].snippet.description,
            thumbnailUrl: result.items[i].snippet.thumbnails.default.url,
            id: result.items[i].id.videoId || result.items[i].id.channelId,
            kind: result.items[i].id.kind,
            getUrl: function() {
                if (this.kind.match('video')) {
                    return `https://www.youtube.com/watch?v=${this.id}`;
                } else {
                    return `https://www.youtube.com/channel/${this.id}`;
                }
            }
        } 
        resultArr.push(resultObj);
    }
    return resultArr;
}

function renderHtml(data) {
    // clear .search-results
    clearResults();
    
    // loop through data and append html to .search-results
    for(let i = 0; i < data.length; i++) {
        let resultHtml = `<div class="result">
                            <h2>${data[i].title}</h2>
                            <a href="${data[i].getUrl()}" target="_blank">
                                <img src="${data[i].thumbnailUrl}" alt="${data[i].description}"/>
                            </a>
                          </div>`
        
        $('.search-results').append(resultHtml);
    }
    // add Next button
    $('.search-results').prepend(`<button type="button" class="next-results">Next</button>`);
}

// listens for a click on the Next page button
// calls API to request the next page of data
function handleNextPage(searchString, nextPageToken) {
    $('.search-results').on('click', '.next-results', function() {
        console.log(`Search String: ${searchString}`);
        console.log(nextPageToken);
        
        // make AJAX call to get next results page
        getAPIData(searchString, nextPageToken, handleAPIResponse);
    })
}

// empties the .search-results div
function clearResults() {
    // clear search-results
    $('.search-results').html('');
}

$(handleSearch);
