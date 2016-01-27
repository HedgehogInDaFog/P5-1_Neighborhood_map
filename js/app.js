
var googleError = function() {
    /*TODO*/
    console.log("Google Map Load Error");
};

var googleSuccess = function() {

    var ViewModel = function() {

        var self = this;
        this.map;
        this.markerList = ko.observableArray([]);
        this.currentMarkerList = ko.observableArray([]);
        this.searchString = ko.observable('');
        this.infoWindowsOpened = [];

        this.contentStringTemplate = '<div class="container"><div class="full-width"><h3>%Label%</h3></div>' +
        '<div class="full-width"><a href="%WikiLinkLoc%">%WikiLinkText%</a><p>%WikiInfo%</p></div>' + 
        '<div class="full-width"><img class="image-flickr" src=%Image0% alt="city image"></img>' + 
        '<img class="image-flickr" src=%Image1% alt="city image"></img>' + 
        '<img class="image-flickr" src=%Image2% alt="city image"></img></div></div>';

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
            '&tags=sightseeing,beauty,church,monument,square,nature,city&sort=interestingness-desc&per_page=3&content_type=1&' + 
            'media=photos&nojsoncallback=1&format=json&lat=%lat%&lon=%lon%';

            var urlFlirckImageTemplate = 'https://farm%farm-id%.staticflickr.com/%server-id%/%id%_%secret%_q.jpg';

            var flickrRequestTimeout = setTimeout(function() {
                console.log('Data from flickr cannot be loaded');
                //TODO
            }, 8000);

            markers.forEach (function (marker) {
                $.ajax({
                    url : urlFlickrRequest.replace('%lat%',marker.position.lat).replace('%lon%',marker.position.lng),
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
            for (var i = 0; i < this.markerList().length; i++) {
                if (this.markerList()[i].title.toLowerCase().indexOf(str) != -1) {
                    tmpArray.push(this.markerList()[i]);
                }
            }
            this.currentMarkerList(tmpArray);

            //filter markers
            setMapOnAll(null, this.markerList());
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
            self.markerList(tmpArray);
            self.getInfoFromWiki(self.markerList());
            self.getInfoFromFlickr(self.markerList());
            self.currentMarkerList(tmpArray);
        };

        this.initMap(generalMapData.mapCenter, generalMapData.markers);

    };

    ko.applyBindings(new ViewModel());

};






