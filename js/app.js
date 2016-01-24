var googleError = function() {
    /*TODO*/
    console.log("Google Map Load Error");
};

var googleSuccess = function() {

    var ViewModel = function() {

        var self = this;
        this.mapCenter = ko.observable(generalMapData.mapCenter);
        this.markerList = ko.observableArray([]);

        generalMapData.markers.forEach(function(markerItem){
            self.markerList.push(markerItem);
        });

        this.searchString = ko.observable("Search...");

        this.doNothing = function() {
            console.log("nothing dune")
        };

        this.clearOnFirstClick = function() {
            if (this.searchString() == "Search...") {
                this.searchString("");
            }
        };

        this.filterLocations = function() {
            console.log("filter")
        };


        this.initMap = function(mapCenter, markerList) {
            var map = new google.maps.Map(document.getElementById('map'), {
                center: mapCenter.position,
                zoom: mapCenter.zoom
            });

            len = markerList.length;
            for (var i = 0; i < len; i++) {
                new google.maps.Marker({
                    position: markerList[i].position,
                    map: map,
                    title: markerList[i].title
                });
            }
        };

        this.initMap(this.mapCenter(), this.markerList());

    };

    ko.applyBindings(new ViewModel());

};






