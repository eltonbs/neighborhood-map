var map;

// Array for all the listing markers
var markers = [];

var infowindow = null;

var locations = [
    { title: 'Sabor de Minas', location: { lat: -15.608421, lng: -56.116834 } },
    { title: 'Restaurante Avenida', location: { lat: -15.60699, lng: -56.120244 } },
    { title: 'Subway', location: { lat: -15.607504, lng: -56.119679 } },
];

// Initialize the map
function initMap() {
    var verdao = { lat: -15.605145, lng: -56.119046 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: verdao,
        zoom: 16
    });

    infowindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;

        // Create a marker per location, and put into markers array
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);

        // Open an infowindow and animate the marker
        marker.addListener('click', function () {
            populateInfoWindow(this, infowindow);
        });
    }
}

// Populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 700);

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
    }
}

var ViewModel = function (locations, markers) {
    var self = this;
    this.locations = locations;
    self.markers = markers;

    this.updateCurrentLocation = function (location) {
        populateInfoWindow(self.markers.find(marker => marker.title === location.title), infowindow);
        // self.markers[location.id].setMap(null);
    };
};

ko.applyBindings(new ViewModel(locations, markers));