//// controller.js handles all of the ViewModel functionality of the app /////
// This includes the global variable map and constructor function ViewModel
var mapController = {
  initMap: function() {
    var self = this;
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
        map: mapController.map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });
      // Push the marker to our array of markers
      markers.push(marker);

      marker.infoWindow = new google.maps.InfoWindow();


      marker.addListener('click', function() {
        self.populateInfoWindow(this, marker.infoWindow);
      });

      // Set marker color to yellow on mouseover event
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      // Set marker color to red on mouseout event - back to default
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
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
  },

  populateInfoWindow: function(marker, infoWindow) {
    console.log("called populateInfoWindow");
    // First check to make sure infoWindow is not already opened on this marker
    if (infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      // Make sure marker property is cleared if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });

      // If status is OK, which means pano was found, compute the position of streetView
      // image, then calculate the heading, then get a panorama from that and
      // set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;

          // heading variable controls the initial pitch of streetview
          var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
          infoWindow.setContent('<div class="marker-title">' + marker.title + '</div><div id="pano"></div>');

          // Set the properties of streetview
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 10
            }
          };
          // Create the streetview panorama that appears in the infoWindow
          var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        } else {
          infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
        }
      }

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // Use streetview service to get closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infoWindow on the correct marker
      infoWindow.open(mapController.map, marker);
    }
  }
};

var ViewModel = function() {

  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  // Initialize the slide functionality of the hamburger toggle button
  this.initHamburger = function() {
    $('#nav-hamburger').on('click', function() {
      var $slider = $($(this).data('target'));
      $slider.animate({'width':'toggle'}, 350);
    });
  };

  // Initialize the application
  this.initApp = function() {
    self.initHamburger();

    self.landmarkList = ko.observableArray([]);
    self.indexStart = ko.observable(0);
    self.indexEnd = ko.observable(4);

    // Only push first five landmarks into the landmarkList
    for (var i = self.indexStart(); i < self.indexEnd() + 1; i++) {
      self.landmarkList.push(landmarks[i]);
    }

  };

  // Zoom to selected marker when user clicks on any item on the list
  this.zoomToMarker = function() {
    mapController.map.setCenter(this.location);
    mapController.map.setZoom(16);
  };

  // Show all the landmark markers on the map
  this.showLandmarks = function() {

    var map = mapController.map;
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  };

  // Hide all markers on the map
  this.hideMarkers = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  };

  this.moveFeaturedLandmarksLeft = function() {

  };

  // Move the featured landmark selection to the right
  this.moveFeaturedLandmarksRight = function() {
    self.indexEnd(self.indexEnd() + 1);
    console.log(self.indexEnd());

    self.landmarkList.shift();
    self.landmarkList.push(landmarks[self.indexEnd()]);
  };

  this.initApp();
}


ko.applyBindings(ViewModel);
