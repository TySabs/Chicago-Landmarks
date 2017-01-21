var Marker = function(data) {


  var defaultIcon = mapController.makeMarkerIcon('FF0000');

  // 'self' keeps 'this' in scope for nested functions
  var self = this;
  var position = this.location;
  var title = this.title;
  

  var marker = new google.maps.Marker({
    position: position,
    title: title,
    map: mapController.map,
    animation: google.maps.Animation.DROP,
    icon: defaultIcon,
    id: data
  });

  // Bind all our views to ko.observables
  data.title = ko.observable(data.title);
  data.location = ko.observable(data.location);


  data.infoWindow = ko.computed(function(marker, infoWindow) {

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
      };

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // Use streetview service to get closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infoWindow on the correct marker
      infoWindow.open(mapController.map, marker);
    }
  });
};
