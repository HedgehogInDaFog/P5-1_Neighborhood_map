var map;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapData.mapCenter.position,
    zoom: mapData.mapCenter.zoom
  });

	len = mapData.markers.length;
	for (var i = 0; i < len; i++) {
	  markers.push(new google.maps.Marker({
	    position: mapData.markers[i].position,
	    map: map,
	    title: mapData.markers[i].title
	  }));
	}
}