Meteor.startup(function () {
  // code to run on server at startup
  Meteor.publish("organs", function () {
    return Organs.find();
  });
  
  Meteor.publish("studies", function (context) {
    if (context === "edit" && Meteor.users.findOne(this.userId).username !== "admin") {
//      console.log("TEST PUB " + this.userId);
//      console.log("TEST PUB 2 " + Meteor.users.findOne(this.userId).username);
      return Studies.find({ owner: Meteor.users.findOne(this.userId).username });
    } else {
      return Studies.find();
    }
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