Meteor.startup(function () {
  // code to run on server at startup
  Meteor.publish("words", function () {
    return Words.find();
  });

  Meteor.publish("questions", function () {
    return Questions.find();
  });
});