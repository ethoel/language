Meteor.startup(function () {
  // code to run on server at startup
  Meteor.publish("organs", function () {
    return Organs.find();
  });
  
  Meteor.publish("studies", function () {
    return Studies.find();
  });
  
  Meteor.publish("tags", function () {
    return Tags.find();
  });
  
  Meteor.publish("usernames", function () {
    //return Meteor.users.find();
    
    // TODO restrict this to admin users or whatever
    return Meteor.users.find({}, {fields: {username: 1}});
  });
  
  Meteor.publish("images", function(){ return Images.find(); });
});