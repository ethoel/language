var clickX = [];
var clickY = [];
var clickDrag = [];
var paint = false;
var films = [];
var index = 0;

var loadFilms = function () {
  // TODO generalize this to get all images in a dir
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

var loadOrgan = function () {
  // need to figure out how to make organ appear and disappear
  // with check of box for now just for one organ, but later
  // need to generalize to multiple...
  // maybe add a checked field to the organ object and check for that
  // also, need to figure out how to add to clickX and clickY for each
  // organ with different colors. does load organ need to be a part of
  // redraw? do i need a clickColor array? or maybe just an organ color
  // would work actually. maybe a clickSize down the road
  // array3 = array1.concat(array2);
  
  
  // draw organs for film
  console.log("loading film " + films[index].src);
  var organ = Organs.findOne({ film: films[index].src });
  console.log("organ " + organ);
  // var data = Organs.findOne({ film: "Im3.jpg" }).data;
  if (organ) {
    clickX = organ.data.clickX;
    clickY = organ.data.clickY;
    clickDrag = organ.data.clickDrag;
  } else {
    clickX = [];
    clickY = [];
    clickDrag = [];
  }
}

var redraw = function () {
  // set up and clear canvas
  var context = document.getElementById("canvas").getContext("2d");
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
 
  // draw film
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
  organs: function () {
    var organs = Organs.find().fetch();

    organs = _.pluck(organs, "organ");
    
    console.log(organs);
    organs = _.uniq(organs);
    
    console.log(organs);
    return organs;
  }
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
        loadOrgan();
        redraw();
      }
    } else {
      // scroll up
      //alert("up " + event.deltaY);
      
      if ((index - 1) >= 0) {
        index = index - 1;
        loadOrgan();
        redraw();
      }
    }
  },
  "mousedown #canvas": function (e) {
    //console.log(e);
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
  },
  "click #save": function (e) {
    console.log("saved");
    Meteor.call("upsertOrgan", 
      films[index].src,
      "aorta",
      { clickX: clickX, clickY: clickY, clickDrag: clickDrag }
    );
  },
  "click #clear": function (e) {
    console.log("cleared");
    clickX = [];
    clickY = [];
    clickDrag = [];
    redraw();
  }
});

