var ViewModel = function() {
  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  // Initialize the map.
  this.initMap = function() {
    /* Pale Dawn Styles url: https://snazzymaps.com/style/1/pale-dawn */
    var paleDawnStyles = [
      {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "lightness": 33
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
          {
            "color": "#f2e5d4"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c5dac6"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c5c6c6"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e4d7c6"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#fbfaf7"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#acbcc9"
          }
        ]
      }];
    self.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 41.8789, lng: -87.6359},
      styles: paleDawnStyles,
      zoom: 12,
      mapTypeControl: false
    });
  }; // End initMap()

  // Initialize the slide functionality of the hamburger toggle button.
  this.initHamburger = function() {
    $('#nav-hamburger').on('click', function() {
      var $slider = $($(this).data('target'));
      $slider.animate({'width':'toggle'}, 350);
    });
  };

  // Initialize app by calling all our init functions.
  this.initApp = function() {
    this.initMap();
    this.initHamburger();
    this.createMarkers();

    // self.landmarkList shows the top five featured landmarks
    self.landmarkList = ko.observableArray([]);

    // self.indexStart/End allows calculation of which landmarks belong in self.landmarkList
    self.indexStart = ko.observable(0);
    self.indexEnd = ko.observable(4);

    // self.CurrentMarker allows user to select a landmark to view more detailed information
    self.currentMarker = ko.observable();

    // self.infoWindow changes to display a marker's corresponding infoWindow
    var largeInfoWindow = new google.maps.InfoWindow();
    self.infoWindow = ko.observable(largeInfoWindow);

    // Only push first five landmarks into the landmarkList
    for (var i = self.indexStart(); i < self.indexEnd() + 1; i++) {
      self.landmarkList.push(landmarks[i]);
    }
  };

  // Create a marker for each landmark.
  this.createMarkers = function() {
    landmarks.forEach(function(landmark) {
      // Create a new marker property for each landmark
      landmark.marker = new Marker(landmark);

      // Add a click handler to each mark which calls self.setAsCurrentMarker
      landmark.marker.addListener('click', function() {
        self.setAsCurrentMarker(landmark);
      });

      self.allMarkers = ko.observableArray([]);
      self.allMarkers.push(landmark.marker);
    }); // End landmarks.forEach()
  };

  this.setAsCurrentMarker = function(clickedMarker) {

    // Check to make sure clickedMarker is not already selected
    if (clickedMarker != self.currentMarker()) {
      // Show clickedMarker by setting its map to ViewModel.map
      clickedMarker.marker.setMap(self.map);

      // Center map on clicked marker
      self.map.setCenter(clickedMarker.location);

      // Set currentMarker to the clicked landmark's marker
      self.currentMarker = ko.observable(clickedMarker.marker);

      // Update the infoWindow
      self.populateInfoWindow(clickedMarker.marker, self.infoWindow());
    }
  };

  // Show all the landmark markers on the map
  this.showLandmarks = function() {
    var map = self.map;
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < landmarks.length; i++) {
      landmarks[i].marker.setMap(map);
      bounds.extend(landmarks[i].marker.position);
    }
    map.fitBounds(bounds);
  };

  // Hide all markers on the map
  this.hideMarkers = function() {
    for (var i = 0; i < landmarks.length; i++) {
      landmarks[i].marker.setMap(null);
    }
  };

  // Move featured landmarks to the left
  this.moveFeaturedLandmarksLeft = function() {
    // Decrement index start and end
    self.indexStart(self.indexStart() - 1);
    self.indexEnd(self.indexEnd() - 1);

    // If index end & start are both above landmarks beginning index - Act as normal:
    // Remove last landmark on featured landmarks array,
    // And add next landmark on the beginning of featured landmarks array
    if ((self.indexStart() > -1) && (self.indexEnd() > -1)) {
      self.landmarkList.pop();
      self.landmarkList.unshift(landmarks[self.indexStart()]);

    // If indexStart is less than beginning of landmarks array,
    // Move indexStart to the back of landmarks array,
    // But treat indexEnd as normal
    } else if (self.indexStart() <= -1) {
      var landmarksLength = landmarks.length - 1;
      self.indexStart(landmarksLength);

      self.landmarkList.pop();
      self.landmarkList.unshift(landmarks[self.indexStart()]);

    // If indexEnd is less than beginning of landmarks array,
    // Move indexEnd to back of featured landmarks array,
    // But treat indexStart as normal
    } else if (self.indexEnd() <= -1) {
      var landmarksLength = landmarks.length - 1;
      self.indexEnd(landmarksLength);

      self.landmarkList.pop();
      self.landmarkList.unshift(landmarks[self.indexStart()]);
    } // End Conditional
  };

  // Move the featured landmark selection to the right
  this.moveFeaturedLandmarksRight = function() {
    // Increment index start and end
    self.indexEnd(self.indexEnd() + 1);
    self.indexStart(self.indexStart() + 1);

    // If index end & start are both below landmarks.length - Act as normal:
    // Remove first landmark on featured landmarks array
    // And add next landmark on the end of featured landmarks array
    if ((self.indexEnd() < landmarks.length) && (self.indexStart() < landmarks.length)) {
      self.landmarkList.shift();
      self.landmarkList.push(landmarks[self.indexEnd()]);

    // If indexEnd is greater than landmarks.length,
    // Then move indexEnd back to beginning of array
    // But treat indexStart as normal
    } else if (self.indexEnd() >= landmarks.length) {
      self.indexEnd(0);

      self.landmarkList.shift();
      self.landmarkList.push(landmarks[self.indexEnd()]);

    // If indexStart is greater than landmarks.length,
    // Treat indexEnd as normal, but
    // Then move indexStart back to beginning of the array
    } else if (self.indexStart() >= landmarks.length) {
      self.indexStart(0);

      self.landmarkList.shift();
      self.landmarkList.push(landmarks[self.indexEnd()]);
    } // End Conditional
  };

  this.populateInfoWindow = function(marker, infoWindow) {
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

          infoWindow.setContent('<div class="marker-div" data-bind="with: $root.currentMarker"><div class="marker-title">' + marker.title + '</div><div id="pano"></div></div>');


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
      infoWindow.open(self.map, marker);
    }
  };

  // Invoke the initialize function.
  this.initApp();
};

ko.applyBindings(new ViewModel());
