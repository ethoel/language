// add here, publish, subscribe, add methods to Meteor.methods
Organs = new Mongo.Collection("organs");
Studies = new Mongo.Collection("studies");


var imageStore = new FS.Store.GridFS("images");
Images = new FS.Collection("images", {
  stores: [imageStore]
});


// TODO actually add real rules for allow, return true
// if user has permission to change Images, for deny,
// return true is user does not have permission
Images.allow({
 insert: function(){
   return true;
   // code does not work on serverside
 //return (Meteor.user() && (Meteor.user().username === "admin"));
 },
 update: function(){
 return true;
 },
 remove: function(){
   return true;
 //return (Meteor.user() && (Meteor.user().username === "admin"));
 },
 download: function(){
 return true;
 }
});

//Images.deny({
// insert: function(){
// return false;
// },
// update: function(){
// return false;
// },
// remove: function(){
// return false;
// },
// download: function(){
// return false;
// }
//});


// not sure where this code is supposed to go...
// deny all users to update users collection
Meteor.users.deny({
  update: function() {
    return true;
  }
});

//study {
//  image[
//    1.jpg,
//    2.jpg,
//    3.jpg
//  ],
//  organs {
//    aorta
//    chest
//    smallbowel: checked, color
//    [
//      x, y for 1
//      x, y for 2
//    ]
//  }
//}