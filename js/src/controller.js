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
      center: {lat: 0, lng: 0},
      styles: paleDawnStyles,
      zoom: 12,
      mapTypeControl: false
    });
  }; // End initMap()

  this.initApp = function() {
    // this.landmarkList holds all landmarks
    this.landmarkList = ko.observableArray(landmarks);

    // this.query holds value of searchbox
    this.query = ko.observable('');

    // Initialize the map
    this.initMap();


    // Initalize all markers
    this.initMarkers();

    /* For more info about self.searchResults, consult this url:
    http://stackoverflow.com/questions/29667134/knockout-search-in-observable-array */
    // this.searchResultsForLandmarks is a ko.computed that dynamically displays landmark list items
    this.searchResultsForLandmarks = ko.computed(function() {

      // self.query() holds value of the searchbox
      // .toLowerCase() makes search results case insensitive
      var query = self.query();

      return self.landmarkList().filter(function(landmark) {
        return landmark.title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
      });
    }); // End this.searchResultsForLandmarks

    /* For more information on how this.filterMarkers, consult this url:
    http://stackoverflow.com/questions/29557938/removing-map-pin-with-search */
    // this.searchResultsForMarkers is a ko.computed that dynamically displays map markers
    this.searchResultsForMarkers = ko.computed(function() {

        // self.query() holds value of the searchbox
        // .toLowerCase() makes search results case insensitive
        var search  = self.query().toLowerCase();

        return ko.utils.arrayFilter(self.landmarkList(), function(landmark) {

          // Set landmark's title to lowercase and do an index of search,
          // If index can find any results, it will set doesMatch to true,
          // If index cannot find any results, it will set doesMatch to false
          var doesMatch = landmark.marker.title.toLowerCase().indexOf(search) >= 0;

          // marker will be visible if doesMatch is true, otherwise marker will be hideen
          landmark.marker.isVisible(doesMatch);

          return doesMatch;
      });
    }); // End this.searchResultsForMarkers()

    // Used to display an infoWindow when a marker or list item is clicked by this.setAsCurrentMarker()
    this.currentMarker = ko.observable();

    // largeInfoWindow changes to display a marker's corresponding infoWindow
    this.infoWindow = new google.maps.InfoWindow();
  }; // End initApp()

  // Create a marker for each landmark.
  this.initMarkers = function() {
    var map = self.map;
    var bounds = new google.maps.LatLngBounds();

    self.landmarkList().forEach(function(landmark) {

      // Create a new marker property for each landmark
      landmark.marker = new Marker(landmark, map);

      // Display marker by setMap() to map
      landmark.marker.setMap(map);

      // Extend map's bounds to fit current landmark on initialize
      bounds.extend(landmark.marker.position);

      // Extend map's bounds to fit current landmark on resize
      google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
      });

      // Add a click handler to each mark which calls self.setAsCurrentMarker
      landmark.marker.addListener('click', function() {
        self.setAsCurrentMarker(landmark);
      });
    }); // End landmarkList().forEach()

    // Make map's bounds fit all landmarks
    self.map.fitBounds(bounds);
  }; // End initMarkers()

  this.setAsCurrentMarker = function(clickedLandmark) {

    // Clear animations for all icons
    self.landmarkList().forEach(function(landmark) {
      landmark.marker.setAnimation(null);
    });

    // Check to make sure clickedLandmark is not already selected
    if (clickedLandmark != self.currentMarker()) {
      // Show clickedMarker by setting its map to ViewModel.map
      clickedLandmark.marker.setMap(self.map);

      var clickedLandmarkLng = clickedLandmark.location.lng;
      var clickedLandmarkLat = clickedLandmark.location.lat;

      // Conditional sets formattedLandmarkLat according to landmark's height on the map
      // This allows the entire infoWindow to be properly displayed
      if (clickedLandmarkLat > 46) {
        var formattedLandmarkLat = 82;
      } else if (clickedLandmarkLat > 40) {
        var formattedLandmarkLat = clickedLandmarkLat + 38;
      } else if (clickedLandmarkLat > 20) {
        var formattedLandmarkLat = clickedLandmarkLat + 42;
      } else if (clickedLandmarkLat > -10) {
        var formattedLandmarkLat = clickedLandmarkLat + 56;
      } else {
        var formattedLandmarkLat = clickedLandmarkLat + 74;
      }

      // currentLandmarkLocation allows map to be centered properly
      var currentLandmarkLocation = {lat: formattedLandmarkLat, lng: clickedLandmarkLng};

      // Center map on clicked marker
      self.map.setCenter(currentLandmarkLocation);

      // Make clickedLandmark's icon bounce
      clickedLandmark.marker.setAnimation(google.maps.Animation.BOUNCE);

      // Set currentLandmark to the clicked landmark's marker
      self.currentLandmark = ko.observable(clickedLandmark.marker);

      // Update the infoWindow
      self.populateInfoWindow(clickedLandmark, self.infoWindow);
    }
  }; // End setAsCurrentMarker()



  this.populateInfoWindow = function(landmark, infoWindow) {
    var marker = landmark.marker;

    // Check to make sure infoWindow is not already opened on this marker
    if (infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      // Make sure marker property is cleared if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
        // Close the infoWindow
        infoWindow.marker = null;

        // Turn off marker's animation
        marker.setAnimation(null);
      });

      // infoWindow.setContent creates the HTML for the infoWindow
      infoWindow.setContent(
        '<div class="marker-div">' +
          '<h2 class="marker-title">' + marker.title + '</h2>' +
          '<div id="pano" data-bind=""></div>' +
          '<div class="weather-div">' +
            '<h3 class="weather-conditions"></h3>' +
            '<h3 class="weather-temperature"></h3>' +
          '</div>' +
        '</div>'
      );

      // weatherConditions variable displays landmark's weather conditions in the infoWindow
      var weatherConditions = '<h3 class="weather-conditions"></h3>';
      // weatherTemperature variable displays landmark's temperature in the infoWindow
      var weatherTemperature = '<h3 class="weather-temperature"></h3>';

      // Link for weather underground API
      var wundergroundLink = 'https://api.wunderground.com/api/6878610c92332316/conditions/q/' +
      landmark.country + '/' + landmark.city + '.json';

      // Pulls weather conditions and temperature for current landmark
      $.ajax({
        url: wundergroundLink,
        success: function(result) {
        // Error handling for when API returns blank information
        if (result.current_observation.weather === '' || undefined) {
          $('.weather-conditions').html('Error: Weather currently unavailable.');
        } else {
          // Insert weather conditions and temperature to infoWindow if no errors occur
          $('.weather-conditions').html(result.current_observation.weather);
          $('.weather-temperature').html(result.current_observation.temperature_string);
        }},
        // Error handling for when weather data fails to load
        error: function() {
          $('.weather-conditions').html('Error: Weather failed to load.');
        }
      });

      // If status is OK, which means pano was found, compute the position of streetView
      // image, then calculate the heading, then get a panorama from that and
      // set the options
      function getStreetView(data, status) {

        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;

          // heading variable controls the initial pitch of streetview
          var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);

          // Set the properties of streetview
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 10
            },
            // Remove Address Box
            addressControl: false,

            // Remove Compass
            panControl: false
          };
          // Create the streetview panorama that appears in the infoWindow
          var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        } else {
          $('#pano').html('Error: No street view found.');
        }
      } // End getStreetView()

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // Use streetview service to get closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

      // Open the infoWindow on the correct marker
      infoWindow.open(self.map, marker);
    } // End Conditional
  }; // End populateInfoWindow()

  // Show/Hide list items on screens with max-width of 768px
  this.toggleHamburger = function() {
    $('#nav-list').animate({'width':'toggle'}, 350);
  };

  // Invoke the initialize function.
  this.initApp();
};

// Google maps url
var mapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD12rqNI0xx-o1LXAxtJ-X-Es30h_oS6j4&v=3";

/* For more info about how $.getScript works, consult this url:
https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282 */
// Asynchronously load Google Maps
$.getScript(mapsUrl)
  .done(function() {
    ko.applyBindings(new ViewModel());
  })
  .fail(function() {
    alert('Error: Map failed to load. Please reload page.');
  });
