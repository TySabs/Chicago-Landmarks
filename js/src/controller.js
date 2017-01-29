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

  this.initApp = function() {
    this.landmarkList = ko.observableArray(landmarks);


    this.query = ko.observable('');

    this.initMap();
    this.initHamburger();
    this.createMarkers();

    /* For more info about self.searchResults, consult this url:
    http://stackoverflow.com/questions/29667134/knockout-search-in-observable-array */
    this.searchResults = ko.computed(function() {
    //  var query = self.query();

      return self.landmarkList().filter(function(landmark) {
        return landmark.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
      });
    });

    this.filterMarkers = ko.computed(function() {
        var search  = self.query().toLowerCase();

        return ko.utils.arrayFilter(self.landmarkList(), function(landmark) {
          var doesMatch = landmark.marker.title.toLowerCase().indexOf(search) >= 0;

          landmark.marker.isVisible(doesMatch);

          return doesMatch;
      });
    });


    this.currentMarker = ko.observable();

    // this.infoWindow changes to display a marker's corresponding infoWindow
    var largeInfoWindow = new google.maps.InfoWindow();
    this.infoWindow = ko.observable(largeInfoWindow);

  };

  // Create a marker for each landmark.
  this.createMarkers = function() {
    var map = self.map;
    var landmarkList = self.landmarkList();
    var bounds = new google.maps.LatLngBounds();

    self.landmarkList().forEach(function(landmark) {

      // Create a new marker property for each landmark
      landmark.marker = new Marker(landmark, map);

      landmark.marker.setMap(map);

      bounds.extend(landmark.marker.position);


      // Add a click handler to each mark which calls self.setAsCurrentMarker
      landmark.marker.addListener('click', function() {
        self.setAsCurrentMarker(landmark);
      });
    }); // End landmarks.forEach()
    self.map.fitBounds(bounds);
  };

  this.setAsCurrentMarker = function(clickedMarker) {

    self.landmarkList().forEach(function(landmark) {
      //works landmark.marker.setMap(null);
      landmark.marker.setAnimation(null);
    });

    // Check to make sure clickedMarker is not already selected
    if (clickedMarker != self.currentMarker()) {
      // Show clickedMarker by setting its map to ViewModel.map
      clickedMarker.marker.setMap(self.map);

      // Center map on clicked marker
      self.map.setCenter(clickedMarker.location);

      clickedMarker.marker.setAnimation(google.maps.Animation.BOUNCE);

      // Set currentMarker to the clicked landmark's marker
      self.currentMarker = ko.observable(clickedMarker.marker);

      // Update the infoWindow
      self.populateInfoWindow(clickedMarker.marker, self.infoWindow());
    }
  };



  this.populateInfoWindow = function(marker, infoWindow) {
    // First check to make sure infoWindow is not already opened on this marker
    if (infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      // Make sure marker property is cleared if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
        marker.setAnimation(null);
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
            },
            addressControl: false,
            panControl: false
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
