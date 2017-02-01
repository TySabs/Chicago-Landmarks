var Marker = function(data, map) {
  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  // Create a marker taking in one parameter: a marker color.
  this.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
    'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
    return markerImage;
  };

  // position is an object holding lat/lng
  this.position = data.location;
  // title is a string holding name of location
  this.title = data.title;

  // Default Icon color is Red
  var defaultIcon = this.makeMarkerIcon('FF0000');
  // Highlighted Icon is yellow. Highlight occurs on mouseover.
  var highlightedIcon = this.makeMarkerIcon('FFFF24');

  // Create the marker.
  var marker = new google.maps.Marker({
      position: self.position,
      title: self.title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: data
    });

  marker.isVisible = ko.observable(false);

  /* For more information on how this.filterMarkers, consult this url:
  http://stackoverflow.com/questions/29557938/removing-map-pin-with-search */
  marker.isVisible.subscribe(function(currentState) {
    if (currentState) {
      marker.setVisible(true);
    } else {
      marker.setVisible(false);
    }
  });

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
