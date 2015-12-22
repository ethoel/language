Meteor.startup(function () {
  // code to run on server at startup
  Meteor.publish("organs", function () {
    return Organs.find();
  });
  
  Meteor.publish("studies", function () {
    return Studies.find();
  });
  
  Meteor.publish("images", function(){ return Images.find(); });
});