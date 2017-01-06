var Marker = function(data) {

  // 'self' keeps 'this' in scope for nested functions
  var self = this;

  // Bind all our views to ko.observables
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);


  this.infoWindow = ko.computed(function() {
    
  });
}
