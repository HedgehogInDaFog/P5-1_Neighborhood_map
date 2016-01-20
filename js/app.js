
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}


/*

var Cat = function() {
	this.clickCount = ko.observable(0);
    this.name = ko.observable('Tabby');
    this.imgSrc = ko.observable('img/22252709_010df3379e_z.jpg');
    this.imgAttribution = ko.observable('https://www.fakeLink.com/1');
    this.nicknames = ko.observableArray([
            { name: 'Berta'},
            { name: 'Ada'},
            { name: 'Adelaida'},
            { name: 'Mustang'},
            { name: 'Punny-Munny'}
        ]);

    this.level = ko.computed(function() {
    	if (this.clickCount() < 5) {
    		return "Newbie";
    	}
    	if ((this.clickCount() > 4) && (this.clickCount() < 15)) {
    		return "Ok Cat";
    	}
    	if (this.clickCount() > 14) {
    		return "Monsta!";
    	}
    }, this);

}

var ViewModel = function() {

	this.currentCat = ko.observable ( new Cat() );

    this.incrementCounter = function() {
        this.currentCat().clickCount(this.currentCat().clickCount() + 1);
    };

}

ko.applyBindings(new ViewModel());

*/