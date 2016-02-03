
var googleError = function() {
    var googleErrorHTML = '<div id="google-error"><div id="half-screen"></div><h1>We cannot get data from the Google Maps 😿</h1>' + 
    '<h1> Please try again later</h1></div>';
    $('#map').append(googleErrorHTML);
};

var googleSuccess = function() {

    var ViewModel = function() {

        var self = this;
        this.map;
        this.markerList = ko.observableArray([]);
        this.currentMarkerList = ko.observableArray([]);
        this.searchString = ko.observable('');
        this.hideButton = ko.observable('▲'); //▼
        this.starButton = ko.observable('★');
        this.showOnlyFavourites = ko.observable(false);        

        this.infoWindowsOpened = [];

        this.contentStringTemplate = '<div class="container"><div class="full-width"><h3>%Label%</h3></div>' +
        '<div class="full-width"><a href="%WikiLinkLoc%">%WikiLinkText%</a><p>%WikiInfo%</p></div>' +
        '<div class="full-width"><img class="image-flickr" src=%Image0% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image1% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image2% alt="city image"></img></div></div>';

        this.initMap = function(mapCenter, markers) {
            this.map = new google.maps.Map(document.getElementById('map'), {
                center: mapCenter.position,
                zoom: mapCenter.zoom
            });

            len = markers.length;
            var tmpArray = [];
            for (var i = 0; i < len; i++) {
                 tmpArray.push(this.createMarker(markers[i].position, markers[i].title));
            }
            self.markerList(tmpArray);
            self.getInfoFromWiki(self.markerList());
            self.getInfoFromFlickr(self.markerList());
            self.currentMarkerList(tmpArray);
        };

        /*----------=========Functions, working with 3rd-party APIs=========---------*/

        this.getInfoFromWiki = function(markers) {

            var urlWikiRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=%request%&format=json&callback=wikiCallback';

            var wikiRequestTimeout = setTimeout(function() {
                console.log('Data from Wikipedia cannot be loaded');
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

        this.getInfoFromFlickr = function(markers) {

            var urlFlickrRequest = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ec08162143dcb46549ffc0535cdbc2cc&' +
            '&tags=%tags%&sort=interestingness-desc&per_page=3&content_type=1&' +
            'media=photos&nojsoncallback=1&format=json&lat=%lat%&lon=%lon%';

            var urlFlirckImageTemplate = 'https://farm%farm-id%.staticflickr.com/%server-id%/%id%_%secret%_q.jpg';

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
            self.map.setZoom(mapData.mapCenter.zoom);
            self.map.setCenter(mapData.mapCenter.position);
        };

        this.cityZoomClick = function() {
            self.map.setZoom(14);
            self.map.setCenter(this.position);
        };

        this.clearSearchClick = function() {
                this.searchString("");
                self.filterLocations();
        };

        this.hideButtonClick = function() {

            var absCont = $('#main-container');

            if (self.hideButton() == '▲') {
                self.hideButton('▼');
                var deltaY = absCont.offset().top - absCont.height() + 20;
                absCont.offset({ top: deltaY, left: 0 });
            } else {
                self.hideButton('▲');
                var deltaY = absCont.offset().top + absCont.height() - 20;
                absCont.offset({ top: deltaY, left: 0 });
            }
        };

        this.markerClick = function (marker) {

            self.infoWindowsOpened.forEach(function(infowindow) {
                infowindow.close();
            });

            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);

            var infowindow = new google.maps.InfoWindow({
                content: self.markerDataToHTML(marker, self.contentStringTemplate)
            });

            infowindow.open(self.map, marker);
            self.infoWindowsOpened.push(infowindow);
        };

        this.showFavouritesClick = function() { 
            if (self.showOnlyFavourites() == false) {
                self.showOnlyFavourites(true);
            } else {
                self.showOnlyFavourites(false);
            }
            self.filterLocations();
        };

        this.starButtonClick = function() {

            if (this.isFavourite() == true) {
                this.isFavourite(false);
            } else {
                this.isFavourite(true);
            }
            self.filterLocations();
        };

        /*----------=========Functions, creating markers and content for them=========---------*/
        this.createMarker = function(location, title) {
          var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: title,
            animation: google.maps.Animation.DROP,
            isFavourite: ko.observable(false)
          });
          marker.addListener('click', function () {self.markerClick(marker);});
          return marker;
        };

        this.markerDataToHTML = function(marker, template) {

            var result = template.replace('%Label%',marker.title);
            if (marker.wikiSuccess == true) {
                result = result.replace('%WikiInfo%', marker.wikiData[2][0]);
                result = result.replace('%WikiLinkText%', marker.wikiData[1][0]).replace('%WikiLinkLoc%', marker.wikiData[3][0]);
            } else {
                result = result.replace('%WikiInfo%', 'Sorry, we can\'t get information from Wikipedia :-(');
                result = result.replace('%WikiLinkText%', '').replace('%WikiLinkLoc%', '');
            }
            
            if (marker.flickrSuccess == true) {
                result = result.replace('%Image0%',marker.flickrData[0]).replace('%Image1%',marker.flickrData[1]).replace('%Image2%',marker.flickrData[2]);
            } else {
                result = result.replace('%Image0%','images/err.png').replace('%Image1%','images/err.png').replace('%Image2%','images/err.png');
                result = result.replace('city image', 'Images from Flickr cannot be downloaded');
            }

            return result;
        };

        /*----------=========Search functions=========---------*/

        this.filterLocations = function() {

            function setMapOnAll(map, markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            };
            //filter list of items
            var str = this.searchString().toLowerCase();
            var tmpArray = [];
            var len = this.markerList().length;
            for (var i = 0; i < len; i++) {
                if (self.markerList()[i].title.toLowerCase().indexOf(str) != -1) {
                    if ((self.markerList()[i].isFavourite() == true) || (self.showOnlyFavourites() == false)) {
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






