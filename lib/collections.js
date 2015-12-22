// add here, publish, subscribe, add methods to Meteor.methods
Organs = new Mongo.Collection("organs");
Studies = new Mongo.Collection("studies");


var imageStore = new FS.Store.GridFS("images");
Images = new FS.Collection("images", {
  stores: [imageStore]
});
Images.allow({
 insert: function(){
 return true;
 },
 update: function(){
 return true;
 },
 remove: function(){
 return true;
 },
 download: function(){
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