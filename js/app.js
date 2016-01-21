var ViewModel = function() {

    var self = this;
    this.markerList = ko.observableArray([]);

    mapData.markers.forEach(function(markerItem){
        self.markerList.push(markerItem);
    });

    this.mapCenter = ko.observable (mapData.mapCenter);

    this.doNothing = function (){console.log("nothing")};

    this.initMap = function() {

    };
/*
    this.incrementCounter = function() {
        self.currentCat().clickCount(self.currentCat().clickCount() + 1);
    };

    this.changeCurrent = function() {
        self.currentCat(this);
    };
*/
}

ko.applyBindings(new ViewModel());


