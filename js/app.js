var flickrKey = 'Client id D44GZQ3K2O41UJQVYY1LDOAKGAPS2WD0AARQD5LBN0CEJKXO' +
' Client secret GOGXNZ2IICLUCO00VVSK4HH2V5RWAITUUQZRXITGWLOLW0GT';


var googleError = function() {
    /*TODO*/
    console.log("Google Map Load Error");
};

var googleSuccess = function() {

    var ViewModel = function() {

        var self = this;
        this.map;
        this.generalMarkerList = ko.observableArray([]);
        this.currentMarkerList = ko.observableArray([]);
        this.searchString = ko.observable('');
        this.infoWindowsOpened = [];

        this.mainLabel = ko.observable('Cities to visit');

        this.hideButton = ko.observable('▲'); //▼

        this.contentStringTemplate = '<div class="container"><div class="full-width"><h3>%Label%</h3></div>' +
        '<div class="full-width"><a href="%WikiLinkLoc%">%WikiLinkText%</a><p>%WikiInfo%</p></div>' +
        '<div class="full-width"><img class="image-flickr" src=%Image0% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image1% alt="city image"></img>' +
        '<img class="image-flickr" src=%Image2% alt="city image"></img></div></div>';

        this.hideButtonClick = function() {
            var toggleHideButton = function () {
                if (self.hideButton() == '▲') {
                    self.hideButton('▼');
                    var absCont = $('#main-container');
                    var deltaY = absCont.offset().top - absCont.height() + 20;
                    absCont.offset({ top: deltaY, left: 0 });
                } else {
                    self.hideButton('▲');
                    var absCont = $('#main-container');
                    var deltaY = absCont.offset().top + absCont.height() - 20;
                    absCont.offset({ top: deltaY, left: 0 });
                }
            }
            toggleHideButton();
        };

        this.cityDetails = function() {
            self.map.setZoom(14);
            self.map.setCenter(this.position);

            self.mainLabel(this.title);

            var forsquareData = self.getInfoFromForsquare(this.position);



        };

        this.getInfoFromForsquare = function(position) {

            var urlForsquareRequest = 'https://api.foursquare.com/v2/venues/explore?ll=%latlon%&limit=10&section=sights&venuePhotos=1&';

            var forsquareRequestTimeout = setTimeout(function() {
                console.log('Data from Forsquare cannot be loaded');
                //TODO
            }, 8000);

            $.ajax({
                    url : urlForsquareRequest.replace('%latlon%', position.lat + ',' + position.lng),
                    dataType: "jsonp",
                    success: function(data) {
                        clearTimeout(forsquareRequestTimeout);
                        var forsquareData = data;
                    }
            });

            return forsquareData;
        };

        this.getInfoFromWiki = function(markers) {

            var urlWikiRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=%request%&format=json&callback=wikiCallback';

            var wikiRequestTimeout = setTimeout(function() {
                console.log('Data from Wikipedia cannot be loaded');
                //TODO
            }, 8000);

            markers.forEach (function (marker) {
                $.ajax({
                    url : urlWikiRequest.replace('%request%', marker.title),
                    dataType: "jsonp",
                    success: function(data) {
                        clearTimeout(wikiRequestTimeout);
                        marker.wikiData = data;
                    }
                });

            });
        };

        this.getInfoFromFlickr = function(markers) {

            var urlFlickrRequest = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ec08162143dcb46549ffc0535cdbc2cc&' +
            '&tags=%tags%&sort=relevance&per_page=5&content_type=1&' +
            'media=photos&nojsoncallback=1&format=json&lat=%lat%&lon=%lon%';

            var urlFlirckImageTemplate = 'https://farm%farm-id%.staticflickr.com/%server-id%/%id%_%secret%_q.jpg';

            var tagList = 'church, monument, square, nature, architecture, museum, travel, flowers, holidays, city';

            var flickrRequestTimeout = setTimeout(function() {
                console.log('Data from flickr cannot be loaded');
                //TODO
            }, 8000);

            markers.forEach (function (marker) {
                $.ajax({
                    url : urlFlickrRequest.replace('%lat%', marker.position.lat).replace('%lon%', marker.position.lng).replace('%tags%', tagList),
                    success: function(data) {
                        clearTimeout(flickrRequestTimeout);
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

        this.createMarker = function(location, title) {
          var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: title,
            animation: google.maps.Animation.DROP
          });
          marker.addListener('click', function () {self.markerClick(marker);});
          return marker;
        };

        this.itemClick = function() {
            self.markerClick(this);
        };

        this.markerClick = function (marker) {

            var fillContentTemplate = function(template, marker) {
                var result = template.replace('%Label%',marker.title).replace('%WikiInfo%', marker.wikiData[2][0]);
                result = result.replace('%WikiLinkText%', marker.wikiData[1][0]).replace('%WikiLinkLoc%', marker.wikiData[3][0]);
                result = result.replace('%Image0%',marker.flickrData[0]).replace('%Image1%',marker.flickrData[1]).replace('%Image2%',marker.flickrData[2]);
                return result;
            };

            self.infoWindowsOpened.forEach(function(infowindow) {
                infowindow.close();
            });

            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {marker.setAnimation(null);}, 2000);

            var contentString = fillContentTemplate(self.contentStringTemplate, marker);
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(self.map, marker);
            self.infoWindowsOpened.push(infowindow);
        };

        this.clearSearch = function() {
                this.searchString("");
                self.filterLocations();
        };

        this.filterLocations = function() {

            function setMapOnAll(map, markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            };
            //filter list of items
            var str = this.searchString().toLowerCase();
            var tmpArray = [];
            for (var i = 0; i < this.generalMarkerList().length; i++) {
                if (this.generalMarkerList()[i].title.toLowerCase().indexOf(str) != -1) {
                    tmpArray.push(this.generalMarkerList()[i]);
                }
            }
            this.currentMarkerList(tmpArray);

            //filter markers
            setMapOnAll(null, this.generalMarkerList());
            setMapOnAll(this.map, this.currentMarkerList());

        };

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
            self.generalMarkerList(tmpArray);
            self.getInfoFromWiki(self.generalMarkerList());
            self.getInfoFromFlickr(self.generalMarkerList());
            self.currentMarkerList(tmpArray);
        };

        this.initMap(generalMapData.mapCenter, generalMapData.markers);

    };

    ko.applyBindings(new ViewModel());

};






