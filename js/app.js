/**
 * @file
 * Contains most logic of an application, including ViewModel
 *
 * @author
 * Vladimir Vorotnikov
 * v.s.vorotnikov@gmail.com
 *
 */

'use strict';

/**
 * @function
 * @description Manage what happening when Google Map API is no available
 */
var googleError = function() {
    var googleErrorHTML = '<div class="google-error"><div class="half-screen"></div><h1>We cannot get data from the Google Maps 😿</h1>' +
    '<h1> Please try again later</h1></div>';
    $('#map').append(googleErrorHTML);
};

/**
 * @function
 * @description This function is called if Google Map API is available
 * @description ViewModel is initialized here. Also all KO-bindings are done here
 */
var googleSuccess = function() {

    var ViewModel = function() {

        var self = this;
        this.map = {};                                          //Google map
        this.markerList = ko.observableArray([]);               //The list of markers
        this.currentMarkerList = ko.observableArray([]);        //The list of currently visible markers
        this.searchString = ko.observable('');                  //Current text in search string
        this.hideButton = ko.observable('▲'); //▼
        this.starButton = ko.observable('★');
        this.showOnlyFavourites = ko.observable(false);         //Defines we need to show all markers, or only favourites

        this.infoWindowsOpened = [];

        this.contentStringTemplate = '<div class="container"><div class="full-width"><h4>%Label%</h4></div>' +
        '<div class="full-width"><a href="%WikiLinkLoc%">%WikiLinkText%</a><p>%WikiInfo%</p></div>' +
        '<div class="full-width"><img class="image-flickr" src=%Image0% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image1% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image2% alt="city image"></img></div></div>'; //InfoWindow HTML

        /**
        * @function
        * @description Initialize map and all markers
        * @param {object} mapCenter - JSON, containing data about initial map center (see model.js for more details)
        * @param {object} markers - JSON, containing data about markers (see model.js for more details)
        */
        this.initMap = function(mapCenter, markers) {
            //create map
            this.map = new google.maps.Map(document.getElementById('map'), {
                center: mapCenter.position,
                zoom: mapCenter.zoom
            });

            //create markers
            var len = markers.length;
            var tmpArray = [];
            for (var i = 0; i < len; i++) {
                 tmpArray.push(this.createMarker(markers[i].position, markers[i].title, markers[i].icon));
            }
            self.markerList(tmpArray);
            self.getInfoFromWiki(self.markerList());
            self.getInfoFromFlickr(self.markerList());
            self.currentMarkerList(tmpArray);
        };

        /*----------=========Functions, working with 3rd-party APIs=========---------*/

        /**
        * @function
        * @description Get data from Wikipedia API
        * @param {object} markers - list, containing Google Map Markers
        */
        this.getInfoFromWiki = function(markers) {

            var urlWikiRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=%request%&format=json&callback=wikiCallback';

            var wikiRequestTimeout = setTimeout(function() {
                marker.wikiSuccess = false;
            }, 8000);

            markers.forEach (function (marker) {
                $.ajax({
                    url : urlWikiRequest.replace('%request%', marker.title),
                    dataType: "jsonp",
                    success: function(data) {
                        marker.wikiSuccess = true;
                        clearTimeout(wikiRequestTimeout);
                        marker.wikiData = data;
                    }
                });
            });
        };

        /**
        * @function
        * @description Get data from Flickr API
        * @param {object} markers - list, containing Google Map Markers
        */
        this.getInfoFromFlickr = function(markers) {

            var urlFlickrRequest = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ec08162143dcb46549ffc0535cdbc2cc&' +
            '&tags=%tags%&sort=interestingness-desc&per_page=3&content_type=1&' +
            'media=photos&nojsoncallback=1&format=json&lat=%lat%&lon=%lon%';

            var urlFlirckImageTemplate = 'https://farm%farm-id%.staticflickr.com/%server-id%/%id%_%secret%_q.jpg'; //helps to get URL of the photo, from Flickr data

            var tagList = 'church, monument, square, nature, travel, architecture, city, museum, flowers, holidays';

            var flickrRequestTimeout = setTimeout(function() {
                marker.flickrSuccess = false;
            }, 8000);

            markers.forEach (function (marker) {
                $.ajax({
                    url : urlFlickrRequest.replace('%lat%', marker.position.lat).replace('%lon%', marker.position.lng).replace('%tags%', tagList),
                    success: function(data) {
                        clearTimeout(flickrRequestTimeout);
                        marker.flickrSuccess = true;
                        marker.flickrData = [];
                        for (var k = 0; k < 3; k++) {
                            var tmp = data.photos.photo[k];
                            marker.flickrData[k] = urlFlirckImageTemplate.replace('%farm-id%',tmp.farm).replace('%server-id%',tmp.server);
                            marker.flickrData[k] = marker.flickrData[k].replace('%id%',tmp.id).replace('%secret%',tmp.secret);
                        }
                    }
                });
            });
        };

        /*----------=========Functions, handling user clicks=========---------*/

        this.centerMapClick = function() {
            self.mapZoom(mapData.mapCenter.zoom, mapData.mapCenter.position);
        };

        this.cityZoomClick = function() {
            self.mapZoom(14, this.position);
        };

        this.mapZoom = function(zoom, center) {     // functions: centerMapClick, cityZoomClick and mapZoom can be moved to one function with parameters,
            self.map.setZoom(zoom);                 // but for me this way is more straightforward and understandable: we have separate functions for
            self.map.setCenter(center);             // handle users clicks and separate function for changing map. Also mapZoom can be used in other
        };                                          // places of the code

        this.clearSearchClick = function() {
                this.searchString("");
                self.filterLocations();
        };

        this.hideButtonClick = function() {

            var absCont = $('#main-container');
            var deltaY = 0;

            if (self.hideButton() === '▲') {
                self.hideButton('▼');
                deltaY = absCont.offset().top - absCont.height() + 20;
                absCont.offset({ top: deltaY, left: 0 });
            } else {
                self.hideButton('▲');
                deltaY = absCont.offset().top + absCont.height() - 20;
                absCont.offset({ top: deltaY, left: 0 });
            }
        };

        this.markerClick = function (marker) {

            // close all opened infowindows
            self.infoWindowsOpened.forEach(function(infowindow) {
                infowindow.close();
            });

            // animate marker for 2 seconds after click
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);

            //create new infowindow
            var infowindow = new google.maps.InfoWindow({
                content: self.markerDataToHTML(marker, self.contentStringTemplate)
            });

            //open new infowindow and add it to a list of opened
            infowindow.open(self.map, marker);
            self.infoWindowsOpened.push(infowindow);
        };

        this.showFavouritesClick = function() {
            self.showOnlyFavourites(!self.showOnlyFavourites());
            self.filterLocations();
        };

        this.starButtonClick = function() {
            this.isFavorite(!this.isFavourite());
            self.filterLocations();
        };

        /*----------=========Functions, creating markers and content for them=========---------*/
        this.createMarker = function(location, title, icon) {
          var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: title,
            icon: icon,
            animation: google.maps.Animation.DROP,
            isFavourite: ko.observable(false)
          });
          marker.addListener('click', function () {self.markerClick(marker);});
          return marker;
        };

        /**
        * @function
        * @description Turn 3rd-party data (Wiki, Flickr) into HTML for InfoWindow
        * @param {object} marker - Google Map Marker for which we create HTML
        * @param {string} template - HTML Template, in which we add data from 3rd-party APIs
        */
        this.markerDataToHTML = function(marker, template) {

            //Add Wikipedia data
            var result = template.replace('%Label%',marker.title);
            if (marker.wikiSuccess === true) {
                result = result.replace('%WikiInfo%', marker.wikiData[2][0]);
                result = result.replace('%WikiLinkText%', marker.wikiData[1][0]).replace('%WikiLinkLoc%', marker.wikiData[3][0]);
            } else {
            //In case, wikipedia request was unsuccessful we still need to write something for user
                result = result.replace('%WikiInfo%', 'Sorry, we can\'t get information from Wikipedia :-(');
                result = result.replace('%WikiLinkText%', '').replace('%WikiLinkLoc%', '');
            }

            //Add Flickr data
            if (marker.flickrSuccess === true) {
                result = result.replace('%Image0%',marker.flickrData[0]).replace('%Image1%',marker.flickrData[1]).replace('%Image2%',marker.flickrData[2]);
            } else {
            //In case, flickr request was unsuccessful we still need to show something for user
                result = result.replace('%Image0%','images/err.png').replace('%Image1%','images/err.png').replace('%Image2%','images/err.png');
                result = result.replace('city image', 'Images from Flickr cannot be downloaded');
            }

            return result;
        };

        /*----------=========Search functions=========---------*/

        /**
        * @function
        * @description Filter list of cities and markers
        */
        this.filterLocations = function() {

            /**
            * @function
            * @description Set map parametr for list of markers
            * @param {object} map - Google Map Object (or "Null" if we want to hide markers)
            * @param {object} markers - List of Google Map Marker for which we set "map"
            */
            function setMapOnAll(map, markers) {
                var len = markers.length;
                for (var i = 0; i < len; i++) {
                    markers[i].setMap(map);
                }
            }

            //filter list of items
            var str = this.searchString().toLowerCase();
            var tmpArray = [];
            var len = this.markerList().length;
            for (var i = 0; i < len; i++) {
                if (self.markerList()[i].title.toLowerCase().indexOf(str) !== -1) {
                    if ((self.markerList()[i].isFavourite() === true) || (self.showOnlyFavourites() === false)) {
                        tmpArray.push(self.markerList()[i]);
                    }
                }
            }
            this.currentMarkerList(tmpArray);

            //filter markers
            setMapOnAll(null, this.markerList());
            setMapOnAll(this.map, this.currentMarkerList());
        };
        this.initMap(mapData.mapCenter, mapData.markers);
    };

    ko.applyBindings(new ViewModel());
};
