// Array to store the places 
var places = [
    { title: 'Bar do Alemão', location: { lat: -15.6075983, lng: -56.1195065 } },
    { title: 'Furnas', location: { lat: -15.6069453, lng: -56.1208885 } },
    { title: 'Lu Espetos', location: { lat: -15.6085844, lng: -56.1172655 } },
    { title: 'Puro Açaí', location: { lat: -15.6088712, lng: -56.1164877 } },
    { title: 'Restaurante Avenida', location: { lat: -15.60699, lng: -56.120244 } },
    { title: 'Rodrigues Grill Restaurante', location: { lat: -15.60696, lng: -56.120657 } },
    { title: 'Sabor de Minas', location: { lat: -15.608421, lng: -56.116834 } },
    { title: 'Subway', location: { lat: -15.607504, lng: -56.119679 } },
];

// Initialize the map
function initMap() {
    var verdao = { lat: -15.607731, lng: -56.118839 };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: verdao,
        zoom: 17
    });

    ko.applyBindings(new ViewModel(map, places));
}

// Populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow, map) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 700);

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
    }
}

// Place model
function Place(title, location, map, filter) {
    var self = this;
    this.title = title;
    this.marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
    });
    this.show = ko.computed(function() {
        if (!filter() || (self.title.toLowerCase().indexOf(filter().toLowerCase()) > -1)) {
            self.marker.setMap(map);
            return true;
        } else {
            self.marker.setMap(null);
            return false;
        }
    }, this);
}

var ViewModel = function (map, places) {
    var self = this;
    this.map = map;

    this.infowindow = new google.maps.InfoWindow();
    // Make sure the marker property is cleared if the infowindow is closed.
    this.infowindow.addListener('closeclick', function () {
        this.marker = null;
    });

    this.filter = ko.observable("");

    this.places = ko.observableArray([]);
    places.forEach(function(place){
        self.places.push(new Place(place.title, place.location, self.map, self.filter))
    });

    this.places().forEach(function(place){
        place.marker.addListener('click', function (){
            populateInfoWindow(place.marker, self.infowindow, self.map);
        });
    });

    this.showInfowindow = function (place) {
        populateInfoWindow(place.marker, self.infowindow, self.map);
    };
};
