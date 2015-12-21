Meteor.startup(function () {
  // code to run on server at startup
  Meteor.publish("organs", function () {
    return Organs.find();
  });
});