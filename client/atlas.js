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
    console.log("STUDY READY " + study.imageArray);
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
  
  
//  var testImg = Images.findOne({_id: study.imageArray[2]});
//  console.log("TEST IMAGE " + testImg.url());
//  
//  var testImage2 = new Image();
//  testImage2.src = testImg.url();
//  
//  var context1 = document.getElementById("testImage").getContext("2d");
//  context1.globalAlpha = 1;
//  context1.clearRect(0, 0, context1.canvas.width, context1.canvas.height);
//  context1.drawImage(testImage2, 0, 0);
  
  
  // set up and clear canvas
  var context = document.getElementById("canvas").getContext("2d");
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
 
  // draw film
  //var film = document.getElementById("film");
  //var index = Session.get("index") - 1;
  context.drawImage(films[index], 0, 0);
  //context.drawImage(image, 0, 0);
  
  //if (clickX.length) {
  drawOrgan(context, clickX, clickY, clickDrag, clickColor);
  //}
//  // draw new path, then draw organs
//      //context.strokeStyle = "#df4b26";
//    // context.strokeStyle = $("#colorpicker").val();
//   // context.strokeStyle = clickColor;
//      context.fillStyle = clickColor;
//    //console.log("value " + $('#colorpicker').val());
//    //context.lineJoin = "round";
//    //context.lineCap = "round";
//    //context.lineWidth = 10;
//    //context.globalAlpha = 0.5;
//  
//    console.log(clickX);
//    // only attempt to draw if there is something to draw
//    if (clickX.length > 0 ) {
//      context.beginPath();
//      for (var i = 0; i < clickX.length; i++) {	
//        
//        if (!clickDrag[i]) {
//          // close previous path if i not 0
//          if (i) { 
//            context.closePath();
//            context.fill();
//            //context.stroke();
//            context.beginPath();
//          }
//          
//          // start new line
//          context.moveTo(clickX[i], clickY[i]);
//        } else {
//          // continue current line
//          context.lineTo(clickX[i], clickY[i]);
//        }
//
//
////        if (clickDrag[i] && i) {
////          context.moveTo(clickX[i-1], clickY[i-1]);
////        } else {
////          context.moveTo(clickX[i]-1, clickY[i]);
////        }
////
////        context.lineTo(clickX[i], clickY[i]);
//
//
//      }
//      // close path for last line
//      context.closePath();
//      context.fill();
//      //context.stroke();
//    }
  
  // TODO clean up this hack (making new local vars)
  var clickXX, clickYY, clickDragD, clickColorC;
  
  // TODO: right now, only one study, images were preloaded as above
  var study = Studies.findOne({ name: "Normal" });
  var organs = study.organs;
  console.log(organs);
  for (var i = 0; i < organs.length; i++) {
    console.log("start loop");
    var organ = organs[i];
    console.log("Organ to draw: " + organ.organ);
    
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
    
    
    //if (clickXX.length > 0 ) {
    drawOrgan(context, clickXX, clickYY, clickDragD, clickColorC);// }
//    //context.strokeStyle = "#df4b26";
//    // context.strokeStyle = $("#colorpicker").val();
//    context.strokeStyle = clickColorC;
//    //console.log("value " + $('#colorpicker').val());
//    context.lineJoin = "round";
//    context.lineCap = "round";
//    context.lineWidth = 10;
//    //context.globalAlpha = 0.5;
//
//    // only attempt to draw if there is something to draw
//    if (clickXX.length > 0 ) {
//      context.beginPath();
//      for (var j = 0; j < clickXX.length; j++) {	
//
//        //console.log(clickDragD);
//        if (clickDragD[j] && j) {
//          //console.log("line to");
//         context.moveTo(clickXX[j-1], clickYY[j-1]);
//         // context.lineTo(clickXX[j], clickYY[j]);
//        } else {
//          
//          //console.log("close path");
//          //context.closePath();
//          context.moveTo(clickXX[j]-1, clickYY[j]);
//          //context.moveTo(clickXX[j], clickYY[j]);
//        }
//
//        context.lineTo(clickXX[j], clickYY[j]);
//        
//
//      }
//      
//      
//      context.stroke();
//      
//      
//    }
//    
    console.log("Done with " + organ.organ);
  }
  
  // now, for each organ, draw it for this index
//  for (var i = 0; i < organs.length; i++) {
//    console.log("Organ to draw: " + organs[i].organ);
//    
//    var organ = organs[0];

    
//    //context.strokeStyle = "#df4b26";
//    // context.strokeStyle = $("#colorpicker").val();
//    context.strokeStyle = clickColor;
//    //console.log("value " + $('#colorpicker').val());
//    context.lineJoin = "round";
//    context.lineCap = "round";
//    context.lineWidth = 10;
//    //context.globalAlpha = 0.5;
//
//    context.beginPath();
//    for (var i = 0; i < clickX.length; i++) {	
//
//
//      if (clickDrag[i] && i) {
//        context.moveTo(clickX[i-1], clickY[i-1]);
//      } else {
//        context.moveTo(clickX[i]-1, clickY[i]);
//      }
//
//      context.lineTo(clickX[i], clickY[i]);
//
//
//    }
//    context.closePath();
//    context.stroke();
//    
//  }
  


  
 
  

}

Meteor.startup(function () {
  //Session.setDefault("index", 1);
});

Template.atlas.onCreated(function () {
  loadFilms();
});

Template.atlas.onRendered(function () {
  console.log("onRendered");
  $('#colorpicker').colorpicker();
  console.log("onRendered2");
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
    // TODO works because only one study
    var organs = Studies.findOne({}).organs;
    
    console.log(organs);
    
//    organs = _.pluck(organs, "organ");
//    
//    console.log(organs);
//    organs = _.uniq(organs);
//    
//    console.log(organs);
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
  "click #organbox": function (e) {
    // currently working on this TODO
    // this doesn't automagically work, have to click for
    // every one to add the field TODO TODO
    console.log("checked");
    //alert("checked " + event.target.checked);
//    Meteor.call("checkOrgan",
//      "Normal",
//      "Aorta",
//      event.target.checked
//    );
    // JUST REDRAW
    loadOrgan();
    redraw();
  },
  "click #changeColor": function (e) {
    // TODO change JQuery to meteor
    clickColor = $("#colorpicker").val();
    console.log("clickColor " + clickColor);
    console.log("labelvalue " + $('#testingabc').text().trim());
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
    console.log(study);
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
    
    console.log(clickXXX);
    
    
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

