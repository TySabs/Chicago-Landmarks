var Marker = function(data) {

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
  this.position = ko.observable(data.location);
  // title is a string holding name of location
  this.title = ko.observable(data.title);

  // Default Icon color is Red
  var defaultIcon = this.makeMarkerIcon('FF0000');
  // Highlighted Icon is yellow. Highlight occurs on mouseover.
  var highlightedIcon = this.makeMarkerIcon('FFFF24');

  // Create the marker.
  var marker = new google.maps.Marker({
      position: self.position(),
      title: self.title(),
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: data
    });

  // Set marker color to yellow on mouseover event
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  // Set marker color to red on mouseout event - back to default
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });

//  console.log("This:", this);
//  console.log("Marker:", marker);

  return marker;

};
