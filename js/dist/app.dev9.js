var landmarks = [
  {
    title: 'Great Pyramids of Giza',
    location: {lat: 29.9753, lng: 31.1376},
    country: 'Egypt',
    city: 'Cairo',
    heading: -70,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Angkor Wat',
    location: {lat: 13.4119, lng: 103.8642},
    country: 'Cambodia',
    city: 'Phnom_Penh',
    heading: -46,
    pitch: -5,
    zoom: 3
  },
  {
    title: 'Christ the Redeemer',
    location: {lat: -22.9519, lng: -43.2105},
    country: 'Brazil',
    city: 'Rio_de_Janeiro',
    heading: -130,
    pitch: -20,
    zoom: 0
  },
  {
    title: 'Eiffel Tower',
    location: {lat: 48.8584, lng: 2.2945},
    country: 'France',
    city: 'Paris',
    heading: 132,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Statue of Liberty',
    location: {lat: 40.6892, lng: -74.0445},
    country: 'NY',
    city: 'New_York',
    heading: 5,
    pitch: 70,
    zoom: 0
  },
  {
    title: 'Kaaba',
    location: {lat: 21.4225, lng: 39.8262},
    country: 'Saudi_Arabia',
    city: 'Mecca',
    heading: 53,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Taj Mahal',
    location: {lat: 27.1750, lng: 78.0422},
    country: 'India',
    city: 'Dharmapuri',
    heading: 0,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Colosseum',
    location: {lat: 41.8902, lng: 12.4922},
    country: 'Italy',
    city: 'Rome',
    heading: -88,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'El Castillo',
    location: {lat: 20.6830, lng: -88.5686},
    country: 'Mexico',
    city: 'Yucatan',
    heading: -152,
    pitch: 15,
    zoom: 0
  },
  {
    title: 'St. Basil\'s Cathedral',
    location: {lat: 55.7525, lng: 37.6231},
    country: 'Russia',
    city: 'Moscow',
    heading: 130,
    pitch: 10,
    zoom: 2
  },
  {
    title: 'Golden Gate Bridge',
    location: {lat: 37.8199, lng: -122.4804},
    country: 'CA',
    city: 'San_Francisco',
    heading: -90,
    pitch: 20,
    zoom: 0
  },
  {
    title: 'Great Wall of China',
    location: {lat: 40.4318, lng: 116.5700},
    country: 'China',
    city: 'Beijing',
    heading: 130,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Sydney Opera House',
    location: {lat: -33.8568, lng: 151.2153},
    country: 'Australia',
    city: 'Sydney',
    heading: 170,
    pitch: 10,
    zoom: 0
  },
  {
    title: 'Mount Rushmore',
    location: {lat: 43.8791, lng: -103.4591},
    country: 'SD',
    city: 'Keystone',
    heading: -40,
    pitch: 14,
    zoom: 70
  },
  {
    title: 'Hagia Sophia',
    location: {lat: 41.0086, lng: 28.9802},
    country: 'Turkey',
    city: 'Sultanahmet',
    heading: 100,
    pitch: 8,
    zoom: 0
  }
];

var Marker = function(data, map) {
  // 'self' keeps 'this' in scope for nested functions
  var self = this;
  // position is an object holding lat/lng
  self.position = data.location;
  // title is a string holding name of location
  self.title = data.title;

  // Default Icon color is Red
  var defaultIcon = self.makeMarkerIcon('FF0000');
  // Highlighted Icon is yellow. Highlight occurs on mouseover.
  var highlightedIcon = self.makeMarkerIcon('FFFF24');

  // Create the marker.
  var marker = new google.maps.Marker({
      position: self.position,
      title: self.title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: data
    });

  // A property of marker to help ViewModel.searchResultsForMarkers
  marker.isVisible = ko.observable(false);

  // Use a google map marker's setVisible function to set marker status
  marker.isVisible.subscribe(function(currentState) {
    marker.setVisible(currentState);
  });

  // Initialize marker as visible
  marker.isVisible(true);

  // Set marker color to yellow on mouseover event
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  // Set marker color to red on mouseout event - back to default
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });

  return marker;
};


// Create a marker and color it based on parameter.
Marker.prototype.makeMarkerIcon = function(markerColor) {
  var markerImage = new google.maps.MarkerImage(
  'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
  '|40|_|%E2%80%A2',
  new google.maps.Size(21, 34),
  new google.maps.Point(0, 0),
  new google.maps.Point(10, 34),
  new google.maps.Size(21,34));
  return markerImage;
};

var ViewModel = function() {
  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  // Initialize the map.
  self.initMap = function() {
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

  self.initApp = function() {
    // self.landmarkList holds all landmarks
    self.landmarkList = ko.observableArray(landmarks);

    // self.query holds value of searchbox
    self.query = ko.observable('');

    // Initialize the map
    self.initMap();


    // Initalize all markers
    self.initMarkers();

    /* For more info about self.searchResults, consult self url:
    http://stackoverflow.com/questions/29667134/knockout-search-in-observable-array */
    // self.searchResultsForLandmarks is a ko.computed that dynamically displays landmark list items
    self.searchResultsForLandmarks = ko.computed(function() {

      // self.query() holds value of the searchbox
      // .toLowerCase() makes search results case insensitive
      var query = self.query();

      return self.landmarkList().filter(function(landmark) {
        return landmark.title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
      });
    }); // End self.searchResultsForLandmarks

    /* For more information on how this.searchResultsForMarkers, consult this url:
    http://stackoverflow.com/questions/29557938/removing-map-pin-with-search */
    // this.searchResultsForMarkers is a ko.computed that dynamically displays map markers
    self.searchResultsForMarkers = ko.computed(function() {

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
    }); // End self.searchResultsForMarkers()

    // Used to display an infoWindow when a marker or list item is clicked by self.setAsCurrentMarker()
    self.currentMarker = ko.observable();

    // largeInfoWindow changes to display a marker's corresponding infoWindow
    self.infoWindow = new google.maps.InfoWindow();
  }; // End initApp()

  // Create a marker for each landmark.
  self.initMarkers = function() {
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

  self.setAsCurrentMarker = function(clickedLandmark) {

    // Clear animations for all icons
    self.landmarkList().forEach(function(landmark) {
      landmark.marker.setAnimation(null);
    });

    // Check to make sure clickedLandmark is not already selected
    if (clickedLandmark != self.currentMarker()) {
      // Show clickedMarker by setting its map to ViewModel.map
      clickedLandmark.marker.setMap(self.map);

      var clickedLandmarkLng = clickedLandmark.location.lng, // lng = east/west
          clickedLandmarkLat = clickedLandmark.location.lat, // lat = north
          formattedLandmarkLat;

      // Conditional sets formattedLandmarkLat according to landmark's height on the map
      // This allows the entire infoWindow to be properly displayed
      if (clickedLandmarkLat > 46) {
        formattedLandmarkLat = 82;
      } else if (clickedLandmarkLat > 40) {
        formattedLandmarkLat = clickedLandmarkLat + 38;
      } else if (clickedLandmarkLat > 20) {
        formattedLandmarkLat = clickedLandmarkLat + 42;
      } else if (clickedLandmarkLat > -10) {
        formattedLandmarkLat = clickedLandmarkLat + 56;
      } else {
        formattedLandmarkLat = clickedLandmarkLat + 74;
      }

      // currentLandmarkLocation allows map to be centered properly when a marker is clicked
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



  self.populateInfoWindow = function(landmark, infoWindow) {
    var marker = landmark.marker;

    // Check to make sure infoWindow is not already opened on self marker
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

      // weatherConditions variable displays landmark's weather conditions in the infoWindow
      var weatherConditions = '<h3 class="weather-conditions"></h3>';
      // weatherTemperature variable displays landmark's temperature in the infoWindow
      var weatherTemperature = '<h3 class="weather-temperature"></h3>';

      // Link for weather underground API
      var wundergroundLink = 'https://api.wunderground.com/api/6878610c92332316/conditions/q/' +
      landmark.country + '/' + landmark.city + '.json';

      // Error message for when weather info is blank
      var weatherUnavailableError = 'Error: Weather currently unavailable.';

      // Error message for when weather fails to load
      var weatherAjaxFailError = 'Error: Weather failed to load.';

      // Pulls weather conditions and temperature for current landmark
      $.ajax({
        url: wundergroundLink,
        success: function(result) {
        // Error handling for when API returns blank information
        if (result.current_observation.weather === '' || undefined) {
          infoWindow.setContent(
                '<div class="marker-div">' +
                  '<h2 class="marker-title">' + marker.title + '</h2>' +
                  '<div id="pano"></div>' +
                  '<div class="weather-div">' +
                    '<h3 class="weather-conditions">' + weatherUnavailableError + '</h3>' +
                  '</div>' +
                '</div>'
          );
          // Display panorama
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Insert weather conditions and temperature to infoWindow if no errors occur
        } else {
          infoWindow.setContent(
                '<div class="marker-div">' +
                  '<h2 class="marker-title">' + marker.title + '</h2>' +
                  '<div id="pano"></div>' +
                  '<div class="weather-div">' +
                    '<h3 class="weather-conditions">' + result.current_observation.weather + '</h3>' +
                    '<h3 class="weather-temperature">' + result.current_observation.temperature_string + '</h3>' +
                  '</div>' +
                '</div>'
          );
          // Display panorama
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        }},
        // Error handling for when weather data fails to load
        error: function() {
          infoWindow.setContent(
                '<div class="marker-div">' +
                  '<h2 class="marker-title">' + marker.title + '</h2>' +
                  '<div id="pano"></div>' +
                  '<div class="weather-div">' +
                    '<h3 class="weather-conditions">' + weatherAjaxFailError + '</h3>' +
                  '</div>' +
                '</div>'
          );
          // Display panorama
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        }
      });

      // If status is OK, which means pano was found, compute the position of streetView
      // image, then calculate the heading, then get a panorama from that and
      // set the options
      function getStreetView(data, status) {

        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;

          // heading variable controls the initial pitch of streetview
          var heading = landmark.heading,
              pitch = landmark.pitch,
              zoom = landmark.zoom;


          // Set the properties of streetview
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: pitch,
              zoom: zoom
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

      // Open the infoWindow on the correct marker
      infoWindow.open(self.map, marker);
    } // End (infoWindow.marker != marker) Conditional
  }; // End populateInfoWindow()

  // Show/Hide list items on screens with max-width of 768px
  self.toggleHamburger = function() {
    $('#nav-list').animate({'width':'toggle'}, 350);
  };

  // Invoke the initialize function.
  self.initApp();
};

// Google maps url
var mapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD12rqNI0xx-o1LXAxtJ-X-Es30h_oS6j4&v=3";

/* For more info about how $.getScript works, consult this url:
https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282 */
// Asynchronously load Google Maps
$.getScript(mapsUrl)
// If map is loaded successfully, create our View Model
  .done(function() {
    ko.applyBindings(new ViewModel());
  })
// If an error occurs while loading google maps api, alert the user
  .fail(function() {
    alert('Error: Map failed to load. Please reload page.');
  });
