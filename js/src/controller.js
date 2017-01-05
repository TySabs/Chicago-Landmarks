//// controller.js handles all of the ViewModel functionality of the app /////
// This includes the global variable map and constructor function ViewModel
var mapController = {
  initMap: function() {
      this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 41.8789, lng: -87.6359},
      zoom: 12,
      mapTypeControl: false
    });
    // Create default icon (red)
    var defaultIcon = this.makeMarkerIcon('FF0000');

    // Create a highlighted marker for when use mouses over (yellow)
    var highlightedIcon = this.makeMarkerIcon('FFFF24');

    // Create a list of markers based off landmarks array
    for (var i = 0; i < landmarks.length; i++) {
      // Get the position from landmarks array
      var position = landmarks[i].location;
      var title = landmarks[i].title;
      // Create a marker for each location, then push markers into an array
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });
      // Push the marker to our array of markers
      markers.push(marker);

      // Set marker color to yellow on mouseover event
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      // Set marker color to red on mouseout event - back to default
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
    // Create click events to hide/show landmarks
    document.getElementById('show-landmarks').addEventListener('click', this.showLandmarks);
    document.getElementById('hide-landmarks').addEventListener('click', this.hideMarkers);
  },

  showLandmarks: function() {
    console.log("showLandmarks called");

    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(mapController.map);
      bounds.extend(markers[i].position);
    }
    mapController.map.fitBounds(bounds);
  },

  hideMarkers: function() {
    console.log("hideMarkers called");
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  },

  makeMarkerIcon: function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
    'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
    return markerImage;
  }
}

var ViewModel = function() {

  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  this.initHamburger = function() {
    $('#nav-hamburger').on('click', function() {
      $navMenuCont = $($(this).data('target'));
      $navMenuCont.animate({'width':'toggle'}, 350);
    });
  }

  this.initHamburger();
}

ko.applyBindings(ViewModel);
