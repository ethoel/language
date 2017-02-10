// this is how you define a class in meteor
// construct with study object from database
Study = function (dbStudy) {
  // owner of study
  this.owner = dbStudy.owner;
  // _id of study
  this.dbID = dbStudy._id;
  // the name of the study, used as address
  this.name = dbStudy.name;
  // title displayed at top of study
  this.title = dbStudy.title;
  // images in study
  this.imageArray = dbStudy.imageArray;
  // organs in study
  this.organs = dbStudy.organs;
  // whether to publish as public, unlisted, private
  this.publish = dbStudy.publish;
};

// constants

// Getters and setters
//Study.prototype.getName = function () {
//  return this.name;
//}

// reset counter to zero for a load object
//Study.prototype.resetProgress = function () {
//  this.progress = 0;
//};
//
//// return percent string after incrementing
//Study.prototype.getProgress = function (increment) {
//  this.progress = this.progress + increment;
//  var percent = (this.progress) / this.max * 100;
//  percent = Math.floor(percent);
//  percent = percent.toString();
//  console.log(this.progress + " " + this.max + "Loading " + percent + "%");
//  return percent + "%";
//};