var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = 0;
var paint = false;
var films = [];
var index = 0;

var loadFilms = function () {
  
  var study = Studies.findOne({name: "Normal"});
  
  // if there isn't any normal study in database
  if (study) {
    //console.log("STUDY READY " + study.imageArray);
    // TODO generalize this to get all images in a dir
    // TODO make this nicer so it doesn't have to depend on 29
    var loaded = 0;
    var total = 29;
    for (var i = 0; i < 29; i++) {
      films.push(new Image());
      films[i].onload = function () { if (++loaded >= total) redraw(); };
      var imageFile = Images.findOne({_id: study.imageArray[i]});
      films[i].src = imageFile.url();
    }
  }
  // the new code
//  var study;
//  study = Studies.findOne({ name: "Normal" });
//  
//  for (var i = 0; i < study.imageArray.length; i++) {
//    console.log("imageArray" + imageArray[i]);
//  }
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
  
  
//  // draw organs for film
//  console.log("loading film " + films[index].src);
//  var study = Studies.findOne({ name: "Normal" });
//  var organ = study.organs[0];
//  console.log("organ " + organ);
//  // var data = Organs.findOne({ film: "Im3.jpg" }).data;
////  if (organ.checked) {
////    alert("true");
////  } else {
////    alert("false " + organ.checked);
////  }
//  
//  if (organ && organ.data[index] && organ.checked) {
//    console.log("organ checked");
//    clickX = organ.data[index].clickX;
//    clickY = organ.data[index].clickY;
//    clickDrag = organ.data[index].clickDrag;
//    clickColor = organ.color;
//  } else {
//    clickX = [];
//    clickY = [];
//    clickDrag = [];
//    clickColor = 0;
//  }
 clickX = [];
 clickY = [];
 clickDrag = [];
 clickColor = "#FFFFFF";
  
}

// drawOrgan is complete
var drawOrgan = function(context, x, y, continuation, color) {
  // only draw if there is something to draw
  if (!x.length) { return; }
  
  // draw organ given x, y, drag arrays in color
  context.fillStyle = color;
  for (var i = 0; i < x.length; i++) {	
    // draw shapes
    if (!continuation[i]) {
      if (i) {
        // fill previous shape
        context.closePath();
        context.fill();   
      }
      // start new shape
      context.beginPath();
      context.moveTo(x[i], y[i]);
    } else {
      // continue current shape
      context.lineTo(x[i], y[i]);
    }
  }
  // fill last shape
  context.closePath();
  context.fill();
}


var redraw = function () {
  // draw everything on canvsas
  
  // set up and clear canvas
  var context = document.getElementById("canvas").getContext("2d");
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
 
  // draw film
  context.drawImage(films[index], 0, 0);
  
  // draw the current edits for organ
  drawOrgan(context, clickX, clickY, clickDrag, clickColor);
  
  // TODO clean up this hack (making new local vars)
  var clickXX, clickYY, clickDragD, clickColorC;
  
  // TODO: right now, only one study named "Normal" 
  // images from study were preloaded into films
  var study = Studies.findOne({ name: "Normal" });
  var organs = study.organs;

  for (var i = 0; i < organs.length; i++) {
    var organ = organs[i];
    
    // if organ is not checked, continue to next organ w/o drawing
    //console.log(organ.organ + Session.get(organ.organ));
    if (!Session.get(organ.organ)) { continue };
    
    if (organ && organ.data[index]) {
      clickXX = organ.data[index].clickX;
      clickYY = organ.data[index].clickY;
      clickDragD = organ.data[index].clickDrag;
      clickColorC = organ.color;
    } else {
      clickXX = [];
      clickYY = [];
      clickDragD = [];
      clickColorC = "#000000";
    }
    drawOrgan(context, clickXX, clickYY, clickDragD, clickColorC);
  }

}

var doInOrgan = function(e, doMe, elseDoMe) {
  // TODO consolidate code with redraw somehow
    // put it in a separate function
    // draw everything on canvsas
  
    // set up and clear canvas
    var canvas = document.getElementById("canvas");
    var context = document.getElementById("canvas").getContext("2d");
    var mouseX = e.pageX - e.target.offsetLeft;
    var mouseY = e.pageY - e.target.offsetTop;

    // TODO: right now, only one study named "Normal" 
    // images from study were preloaded into films
    var study = Studies.findOne({ name: "Normal" });
    var organs = study.organs;
    

    for (var k = 0; k < organs.length; k++) {
      var organ = organs[k];
      
      
      // if organ is not checked, continue to next organ w/o drawing
      //console.log(organ.organ + Session.get(organ.organ));
      //if (!Session.get(organ.organ)) { continue };
      
      var x, y, continuation;
      if (organ && organ.data[index]) {
        x = organ.data[index].clickX;
        y = organ.data[index].clickY;
        continuation = organ.data[index].clickDrag;
      } else {
        x = [];
        y = [];
        continuation = [];
      }

      // only draw if there is something to draw
      if (!x.length) { continue; }

      // draw organ given x, y, drag arrays in color
      for (var i = 0; i < x.length; i++) {	
        // draw shapes
        if (!continuation[i]) {
          if (i) {
            // fill previous shape
            context.closePath();
            if (context.isPointInPath(mouseX, mouseY)) {
              doMe(canvas, organ);
              return organ;
            }
          }
          // start new shape
          context.beginPath();
          context.moveTo(x[i], y[i]);
        } else {
          // continue current shape
          context.lineTo(x[i], y[i]);
        }
      }
      // fill last shape
      context.closePath();
      if (context.isPointInPath(mouseX, mouseY)) {
        doMe(canvas, organ);
        return organ;
      }
    }
    
    elseDoMe(canvas);
  return 0;
}

Meteor.startup(function () {
  
});

Template.atlas.onCreated(function () {
  loadFilms();
});

Template.atlas.onRendered(function () {
  console.log("onRendered");
  $('#colorpicker').colorpicker();
  console.log("onRendered2");
  
  $('body').on('keydown',function(e) { 
      e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
      console.log("up");
      if ((index - 1) >= 0) {
        index = index - 1;
        loadOrgan();
        redraw();
      }
    }
    else if (e.keyCode == '40') {
        // down arrow
      console.log("down");
      if ((index + 1) < 29) {
        //console.log("index up");
        index = index + 1;
        loadOrgan();
        redraw();
      }
    }
    else if (e.keyCode == '37') {
       // left arrow
    }
    else if (e.keyCode == '39') {
       // right arrow
    }
  }); 
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
    // TODO works because only one study, that is "Normal"
    var organs = Studies.findOne({}).organs;
    return organs;
  },
  hoverOrgan: function () {
    var hoverOrgan = Session.get("hoverOrgan");
    if (hoverOrgan) {
      return hoverOrgan;
    } else {
      return "";
    }
  }
});

Template.organ.helpers({
  // if organs are checked from previous sessions
  // i hate using Session vars cause i dont quite understand them
  // this will have to do for now
  checked: function(organ) {
    if (organ && Session.get(organ)) {
      return "checked";
    } else {
      return "";
    }
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
    //prevents default action
    return false;
  },
  "click #organCheckBox": function (e) {
    // currently working on this TODO
    // this doesn't automagically work, have to click for
    // every one to add the field TODO TODO
    //console.log("checked");
    //console.log(e.target);
    //console.log(e.target.checked);
    //console.log(e.target.getAttribute("value"));
    Session.set(e.target.getAttribute("value"), e.target.checked);
    
    redraw();
    
    //alert("checked " + event.target.checked);
//    Meteor.call("checkOrgan",
//      "Normal",
//      "Aorta",
//      event.target.checked
//    );
    // JUST REDRAW
    //loadOrgan();
    //redraw();
  },
  "mousemove #canvas": function (e) {
    //TODO this is real uuugly
    doInOrgan(e, function (canvas, myorgan) {
      canvas.style.cursor = "pointer";
      if (Session.get(myorgan.organ)) {
        console.log(myorgan.organ);
        Session.set("hoverOrgan", myorgan.organ);
      } else {
        Session.set("hoverOrgan", "");
      }
    }, function (canvas) {
      canvas.style.cursor = "default";
      Session.set("hoverOrgan", "");
    });
  },
  "click #canvas": function (e) {
    // TODO this is way too convuluted man
    var organ = doInOrgan(e, function (canvas, myorgan) {
      console.log("clicked organ");
    }, function (canvas) {
      console.log("clicked no organ");
    });
    
    if (organ) {
      console.log(organ.organ);
      Session.set(organ.organ, !Session.get(organ.organ));
      redraw();
    }
  }
});
  
Template.layoutAdmin.events({
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
  "click #changeColor": function (e) {
    // TODO change JQuery to meteor
    clickColor = $("#colorpicker").val();
    console.log("clickColor " + clickColor);
    //console.log("labelvalue " + $('#testingabc').text().trim());
    redraw();
  },
  "click #save": function (e) {
    // TODO this method works grossly but needs cleaning up
    console.log("saved " + clickColor);
//    Meteor.call("upsertOrgan", 
//      films[index].src,
//      "aorta",
//      { clickX: clickX, clickY: clickY, clickDrag: clickDrag, clickColor: clickColor }
//    );
    var study = Studies.findOne({ name: "Normal" }, {fields: { organs: 1, _id: 0 }});
    
    //elemMatch not supported, { organs: { $elemMatch: { organ: "Aorta" }}});
    //so using this hack instead ughh
    var clickXX =[];
    var clickYY = [];
    var clickDragD = [];
    //console.log(study);
    for (var i = 0; i < study.organs.length; i++) {
      if (study.organs[i].organ === $("#currentOrgan").val()) {
        // this is the organ we are looking for
        var organ = study.organs[i];
        clickXX = organ.data[index] ? organ.data[index].clickX : [];
        clickYY = organ.data[index] ? organ.data[index].clickY : [];
        clickDragD = organ.data[index] ? organ.data[index].clickDrag : [];
      }
    }
    

    // omg this code
    var clickXXX = clickXX.concat(clickX);
    var clickYYY = clickYY.concat(clickY);
    var clickDragDD = clickDragD.concat(clickDrag);
    
    //console.log(clickXXX);
    
    
    Meteor.call("saveDrawingToOrgan",
                "Normal",
                $("#currentOrgan").val(),
                clickColor,
                index,
                { clickX: clickXXX, clickY: clickYYY, clickDrag: clickDragDD }
               );
  },
  "click #clear": function (e) {
    console.log("cleared");
    clickX = [];
    clickY = [];
    clickDrag = [];
    clickColor = 0;
    redraw();
  },
  "click #clearAll": function (e) {
    Meteor.call("deleteDrawing",
                "Normal",
                $("#currentOrgan").val(),
                index
               );
    redraw();
  },
  "change #loadImages": function (e) {
    FS.Utility.eachFile(e, function(file) {
      Images.insert(file, function (err, fileObj) {
        console.log(fileObj._id);
        // add image id to array as they load
//        var study, imageArray;
//        study = Studies.findOne({name: "Normal"});
//        if (!study) {
//          imageArray = [];
//        } else {
//          imageArray = study.imageArray;
//        }
//        imageArray.push(fileObj._id);
        // now update database with new array
        Meteor.call("addImageToStudy",
                    "Normal",
                    fileObj._id
                   );
      });
    });
    console.log("loadImages");
  },
  "click #saveCurrentOrgan": function (e) {
    console.log("saving current organ");
    Meteor.call("addOrganToStudy", "Normal", $("#currentOrgan").val());
    // TODO get rid of jquery
    // TODO above needs to become more than just a test button
  },
  "click #testButton2": function (e) {
    console.log("Test2");
//    Meteor.call("saveDrawingToOrgan",
//                "Normal",
//                "Aorta",
//                clickColor,
//                index,
//                { clickX: clickX, clickY: clickY, clickDrag: clickDrag }
//               )
  }
});

