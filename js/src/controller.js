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

  this.initDrawingManager = function() {
    // Initialize the drawing manager
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON
        ]
      }
    });

    self.polygon = null;

    self.drawingManager = drawingManager;

    self.drawingManager.addListener('overlaycomplete', function(event) {
      // First, check if there is an existing polygon
      // If there is, get rid of it and remove the markers
      if (self.polygon) {
        self.polygon.setMap(null);
        self.hideMarkers(landmarks);
      }
      // Turn off drawing mode
      self.drawingManager.setDrawingMode(null);
      // Create a new editable polygon from the overlay
      self.polygon = event.overlay;
      self.polygon.setEditable(true);
      // Search within the polygon
      self.searchWithinPolygon();
      // Make sure the search is re-done if the poly is changed
      self.polygon.getPath().addListener('set_at', self.searchWithinPolygon);
      self.polygon.getPath().addListener('insert_at', self.searchWithinPolygon);
    });
  };

  // Initialize app by calling all our init functions.
  this.initApp = function() {
    this.initMap();
    this.initHamburger();
    this.initDrawingManager();
    this.createMarkers();

    // self.landmarkList shows the top five featured landmarks
    self.landmarkList = ko.observableArray([]);

//    self.landmarks = ko.observableArray(landmarks);
    self.query = ko.observable('');

    /* For more info about self.searchResults, consult this url:
    http://stackoverflow.com/questions/29667134/knockout-search-in-observable-array */
    self.searchResults = ko.computed(function() {
      var q = self.query();
      return self.landmarkList().filter(function(i) {
        return i.title.toLowerCase().indexOf(q) >= 0;
      });
    });

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

    self.placeMarkers = [];
  };



/*  this.search = function(value) {
    self.landmarks.removeAll();
    self.landmarks.forEach(function(landmark) {
      if (self.landmarks()[landmark].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.landmarks().push(self.landmarks()[landmark]);
      }
    });
  };
*/
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
  this.hideMarkers = function(markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].marker.setMap(null);
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

  this.toggleDrawing = function() {
    if (self.drawingManager.map) {
      self.drawingManager.setMap(null);
      // In case the user drew anything, get rid of polygon
      if (self.polygon !== null) {
        self.polygon.setMap(null);
      }
    } else {
      self.drawingManager.setMap(self.map);
    }
  };

  this.searchWithinPolygon = function() {
    landmarks.forEach(function(landmark) {
      if (google.maps.geometry.poly.containsLocation(landmark.marker.position, self.polygon)) {
        landmark.marker.setMap(self.map);
      } else {
        landmark.marker.setMap(null);
      }
    });
  };

  this.textSearchPlaces = function() {
    console.log("textSearchPlaces called");
    var bounds = self.map.getBounds();
    self.hideMarkers(self.placeMarkers());
    var placesService = new google.maps.places.PlacesService(self.map);
    placesService.textSearch({
      query: document.getElementById('places-search').value,
      bounds: bounds
    }, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        self.createMarkersForPlaces(results);
      }
    });
  };

  this.createMarkersForPlaces = function(places) {
    console.log("CMFP Called");
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
      var place = places[i];
      var icon = {
        url: place.icon,
        size: new google.maps.Size(35, 35),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      // Create a marker for each place
      var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location,
        id: place.place_id
      });
      // Create a single infoWindow to be used with the place details information
      // so that only one is open at once
      var placeInfoWindow = new google.maps.InfoWindow();
      // If a marker is clicked, do a place details search on it in the next function
      marker.addListener('click', function() {
        if (placeInfoWindow.marker == this) {
          console.log("This infoWindow already is on this marker!");
        } else {
          self.getPlaceDetails(this, placeInfoWindow);
        }
      });
      self.placeMarkers().push(marker);
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    }
    self.map.fitBounds(bounds);
  };

  this.getPlaceDetails = function(marker, infoWindow) {
    console.log("GPD called");
    var service = new google.maps.places.PlacesService(self.map);
    service.getDetails({
      placeId: marker.id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Set the marker property on this infoWindow so it isn't created again
        infoWindow.marker = marker;
        var innerHTML = '<div>';
        if (place.name) {
          innerHTML += '<strong>' + place.name + '</strong>';
        }
        if (place.formatted_address) {
          innerHTML += '<br>' + place.formatted_address;
        }
        if (place.formatted_phone_number) {
          innerHTML += '<br>' + place.formatted_phone_number;
        }
        if (place.opening_hours) {
          innerHTML += '<br><br><strong>Hours:</strong><br>' +
            place.opening_hours.weekday_text[0] + '<br>' +
            place.opening_hours.weekday_text[1] + '<br>' +
            place.opening_hours.weekday_text[2] + '<br>' +
            place.opening_hours.weekday_text[3] + '<br>' +
            place.opening_hours.weekday_text[4] + '<br>' +
            place.opening_hours.weekday_text[5] + '<br>' +
            place.opening_hours.weekday_text[6];
          }
        if (place.photos) {
          innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
          }
        innerHTML += '</div>';
        infoWindow.setContent(innerHTML);
        infoWindow.open(self.map, marker);
        // Make sure the marker property is cleared if the infoWindow is closed
        infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
        });
      }
    });
  };

//  this.query.subscribe(self.search);

  // Invoke the initialize function.
  this.initApp();
};


ko.applyBindings(new ViewModel());
