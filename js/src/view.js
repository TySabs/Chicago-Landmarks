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
  marker.weatherConditions = ko.observable();
  marker.weatherTemperature = ko.observable();

  marker.infoWindow = ko.computed(function() {
    return marker.weatherConditions() + " " + marker.weatherTemperature();
  }, this);

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
