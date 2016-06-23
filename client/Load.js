// this is how you define a class in meteor
Load = function (max) {
  // returns text for fraction loaded
  this.progress = 0;
  this.max = max;
};

// reset counter to zero for a load object
Load.prototype.resetProgress = function () {
  this.progress = 0;
};

// return percent string after incrementing
Load.prototype.getProgress = function (increment) {
  this.progress = this.progress + increment;
  var percent = (this.progress) / this.max * 100;
  percent = Math.floor(percent);
  percent = percent.toString();
  console.log(this.progress + " " + this.max + "Loading " + percent + "%");
  return percent + "%";
};
