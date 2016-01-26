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

        this.contentStringTemplate = '<div class="container"><div class="full-width"><h3>%Label%</h3></div>' +
        '<div class="full-width"><p>%WikiInfo%</p></div><div class="full-width"><img src=%Image% alt="city image"></img></div></div>';

        this.getInfoFromWiki = function(request) {
            var wikiRequestTimeout = setTimeout(function() {
                console.log('Data from Wikipedia cannot be loaded');
            }, 8000);

            var urlWikiRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + request + '&format=json&callback=wikiCallback';

            $.ajax({
                url : urlWikiRequest,
                dataType: "jsonp",
                success: function(data) {
                    console.log(data[2]);
                    clearTimeout(wikiRequestTimeout);
                    return data[2];
                }   
            });

        };

        this.fillContentTemplate = function(template, marker) {
            var wiki = this.getInfoFromWiki(marker.title);
            var result = template.replace('%Label%',marker.title).replace('%WikiInfo%',wiki);
            return result;
        };

        this.createMarker = function(location, title) {
          var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: title,
            animation: google.maps.Animation.DROP
          });
          marker.addListener('click', self.markerClick);
          return marker;
        };

        this.itemClick = function() {
            console.log("itemClick done");
            //TODO
            //self.searchString(this.title);
            //self.filterLocations();
        };

        this.markerClick = function () {
            console.log("markerClick done");
            var contentString = self.fillContentTemplate(self.contentStringTemplate, this);
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(self.map, this);   
            //TODO
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
            this.markerList(tmpArray);
            this.currentMarkerList(tmpArray);
        };

        this.initMap(generalMapData.mapCenter, generalMapData.markers);

    };

    ko.applyBindings(new ViewModel());

};






