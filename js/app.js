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

        this.searchString = ko.observable("Search...");

        this.createMarker = function(location, title) {
          var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: title
          });
          return marker;
        };

        this.itemClick = function() {
            //TODO
            //self.searchString(this.title);
            //self.filterLocations();
        };

        this.clearOnFirstClick = function() {
            if (this.searchString() == "Search...") {
                this.searchString("");
            }
            self.filterLocations();
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






