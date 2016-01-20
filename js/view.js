var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: mapData.lat, lng: mapData.lng},
    zoom: mapData.zoom
  });
}