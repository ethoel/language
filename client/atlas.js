var clickX = [];
var clickY = [];
var clickDrag = [];
var paint = false;
var films = [];
var index = 0;

var loadFilms = function () {
  // TODO generalize this to get all images in a picture
  var loaded = 0;
  var total = 29;
  for (var i = 0; i < 29; i++) {
    films.push(new Image());
    films[i].onload = function () { if (++loaded >= total) redraw(); };
    films[i].src = "normal/Im" + (i + 1) + ".jpg";
  }
}

var addClick = function (x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

var redraw = function () {
  var context = document.getElementById("canvas").getContext("2d");
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
 
  //var film = document.getElementById("film");
  //var index = Session.get("index") - 1;
  context.drawImage(films[index], 0, 0);
  
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineCap = "round";
  context.lineWidth = 10;
  context.globalAlpha = 0.5;
  
  context.beginPath();
  for (var i = 0; i < clickX.length; i++) {	
    
    
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i-1], clickY[i-1]);
    } else {
      context.moveTo(clickX[i]-1, clickY[i]);
    }
    
    context.lineTo(clickX[i], clickY[i]);
     
    
  }
  context.closePath();
  context.stroke();  
}

Meteor.startup(function () {
  //Session.setDefault("index", 1);
});

Template.atlas.onCreated(function () {
  loadFilms();
});

//Template.atlas.onRendered(function () {
//  context = document.getElementById("scan").getContext("2d");
//  var mimage = document.getElementById("myimage");
//  context.drawImage(mimage, 0, 0);
//  context.fillStyle = "#ff0000";
//  context.fillRect(0,0,150,75);
//});
//
//Template.atlas.onDestroyed(function () {
////  Session.set("questionRendered", false);
////  Session.set("playerReady", false);
////  // destroy player if it has been created
////  player && player.destroy();
//});

Template.atlas.helpers({
//  index: function () {
//    return Session.get("index");
//  }
});

Tracker.autorun(function() {
//    context = document.getElementById("scan").getContext("2d");
//    var mimage = document.getElementById("myimage");
//    context.drawImage(mimage, 0, 0);
});

Template.atlas.events({
  "wheel #canvas": function (e) { //touchmove?
    //var index = Session.get("index");
    //console.log(e);
    if (e.originalEvent.deltaY > 0) {
      // scroll down
      //alert("down " + event.deltaY);
      
      if ((index + 1) < 29) {
        //console.log("index up");
        index = index + 1;
      }
    } else {
      // scroll up
      //alert("up " + event.deltaY);
      
      if ((index - 1) >= 0) {
        index = index - 1;
      }
    }
    redraw();
    return false;
  },
  "mousedown #canvas": function (e) {
    console.log(e);
    paint = true;
    addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, false);
    redraw();
  },
  "mousemove #canvas": function (e) {
    if (paint) {
      addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, true);
      redraw();
    }
  },
  "mouseup #canvas": function(e) {
    paint = false;
  },
  "mouseleave #canvas": function (e) {
    paint = false;
  }
});

