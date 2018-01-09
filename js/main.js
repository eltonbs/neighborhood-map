// Array to store the places 
var places = [
    { title: 'Bar do Alemão', location: { lat: -15.6075983, lng: -56.1195065 }, foursquareId: '4ddc421c22713339cd128b17' },
    { title: 'Furnas', location: { lat: -15.6069453, lng: -56.1208885 }, foursquareId: '4e447a78887703085fe19f84' },
    { title: 'Lu Espetos', location: { lat: -15.6085844, lng: -56.1172655 }, foursquareId: '4ff64e63e4b0956dd4bbd7c6' },
    { title: 'Puro Açaí', location: { lat: -15.6088712, lng: -56.1164877 }, foursquareId: '590e3f536a8d860861465966' },
    { title: 'Restaurante Avenida', location: { lat: -15.60699, lng: -56.120244 }, foursquareId: '4d5305719d493704fd1bdf39' },
    { title: 'Rodrigues Grill Restaurante', location: { lat: -15.60696, lng: -56.120657 }, foursquareId: '4dacc583cda1a7f15b1f5f3e' },
    { title: 'Sabor de Minas', location: { lat: -15.608421, lng: -56.116834 }, foursquareId: '553d7c59498e8c4907c1892c' },
    { title: 'Subway', location: { lat: -15.607504, lng: -56.119679 }, foursquareId: '50faf7aae4b0d5fd0407e510' },
];

// Initialize the map
function initMap() {
    var verdao = { lat: -15.607731, lng: -56.118839 };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: verdao,
        zoom: 16
    });

    ko.applyBindings(new ViewModel(map, places));
}

// Show error message if map initialization failed
function initMapError() {
    $('#error-message').show();
}

// Populates the infowindow when the marker is clicked
function populateInfoWindow(place, infowindow, map) {
    place.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        place.marker.setAnimation(null);
    }, 700);

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != place.marker) {
        infowindow.marker = place.marker;
        infowindow.setContent(place.content);
        infowindow.open(map, place.marker);
    }
}

// Place model
function Place(place, map, filter, activePlace) {
    var self = this;
    this.title = place.title;
    this.marker = new google.maps.Marker({
        position: place.location,
        map: map,
        title: place.title,
        animation: google.maps.Animation.DROP,
    });
    this.content = null;
    // show the place if the filter is empty or if the filter matches the title
    this.show = ko.computed(function () {
        if (!filter() || (self.title.toLowerCase().indexOf(filter().toLowerCase()) > -1)) {
            self.marker.setMap(map);
            return true;
        } else {
            self.marker.setMap(null);
            return false;
        }
    }, this);

    // Get Foursquare info
    $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + place.foursquareId,
        data: {
            client_id: 'CVZ01VR24ZSY0S3GZPUNKTR0NRUKNRMVCRTX2PZAXF35VCLB',
            client_secret: '40EORKBUBAQTNZA54K2E0M0CIJVUY3QR1ZVSC5NVQSPKOIL1',
            v: '20170801',
        }
    }).done(function (resp) {
        var venue = resp.response.venue;
        var $content = $('#fs-template').clone();

        $content.find('.fs-name').text(venue.name); 
        if(venue.bestPhoto) {
            var url = venue.bestPhoto.prefix + 'width200' + venue.bestPhoto.suffix;
            $content.find('.fs-photo').attr('src', url); 
        }
        if(venue.rating) {
            $content.find('.fs-rating span').text(venue.rating); 
            $content.find('.fs-rating').removeClass('hidden');
        }
        if(venue.price) {
            $content.find('.fs-price span').text(venue.price.tier + ' - ' + venue.price.message); 
            $content.find('.fs-price').removeClass('hidden');
        }
        if(venue.location) {
            $content.find('.fs-address span').text(venue.location.formattedAddress.join(', ')); 
            $content.find('.fs-address').removeClass('hidden');
        }
        if(venue.contact.formattedPhone) {
            $content.find('.fs-phone span').text(venue.contact.formattedPhone); 
            $content.find('.fs-phone').removeClass('hidden');
        }
        $content.find('.fs-link a').attr('href', venue.canonicalUrl);
        
        self.content = $content.html();
    }).fail(function (error) {
        console.log('Failed to get "' + place.title + '"');
        console.log(error.responseJSON);
        self.content = "Unable to get Foursquare's info"
    });
}

var ViewModel = function (map, places) {
    var self = this;
    this.map = map;

    this.infowindow = new google.maps.InfoWindow({
        maxWidth: 400
    });
    // Clear the marker and activePlace if the infowindow is closed.
    this.infowindow.addListener('closeclick', function () {
        this.marker = null;
        self.activePlace(null);
    });

    this.filter = ko.observable("");

    // Current place selected
    this.activePlace = ko.observable();

    this.places = ko.observableArray([]);

    // Create the Places objects
    places.forEach(function (place) {
        self.places.push(new Place(place, self.map, self.filter));
    });

    this.places().forEach(function (place) {
        place.marker.addListener('click', function () {
            self.showInfowindow(place);
        });
    });

    this.showInfowindow = function (place) {
        self.activePlace(place);
        populateInfoWindow(place, self.infowindow, self.map);
    };
};
