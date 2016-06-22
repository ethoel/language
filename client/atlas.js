var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = 0;
var paint = false;
var films = [];
var index = 0;
var study_length = 0;
var studyName = "";
//var filmsLoaded = false;
var lastY;


var loadFilms = function () {
  console.log("loading films");
  studyName = Router.current().params.study;
  var study = Studies.findOne({name: studyName});
  
  // if there is a normal study in database
  // TODO allow other studies...
  if (study) {
    console.log("STUDY LENGTH = " + study.imageArray.length);
    
    var loaded = 0;
    study_length = study.imageArray.length;
    var load = new Load(study_length);
    for (var i = 0; i < study_length; i++) {
      films.push(new Image());
      
      // first draw is called, clear loading screen
//        console.log("HELLO");
//  $("#atlasOverlay").css("display", "none");
      films[i].onload = function () { 
        Session.set("loadingText", "Loading study " + load.getProgress(1, study_length));
        if (++loaded >= study_length) { 
          redraw(); 
          $("#atlasOverlay").css("display", "none");
        }
      };
      var imageFile = Images.findOne({_id: study.imageArray[i]});
      films[i].src = imageFile.url();
    } 
    
    
  } else {
    console.log("ESLE");
    //$("#atlasOverlay").css("display", "none");
    //setTimeout( function() {$("#atlasOverlay").css("display", "none");}, 5000);
  }
  // will do this when i figure out a better way to load studies
//  else {
//    // if no study found
//    Router.go("/");
//  }
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
 //clickColor = "#FFFFFF";
  
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
  
  // TODO better way to do this?
  var studyCanvas = document.getElementById("canvas");
  //studyCanvas.height = films[0].height;
  //studyCanvas.width = films[0].width;
  //studyCanvas.height = 700;
  //studyCanvas.width = 700;
  var studyHeightY = films[0].height;
  var studyWidthX = films[0].width;
  var maxHeightWidth = 700;
  
  // TODO same hack as below
  if (!Router.current().route.getName().includes("admin")) {
    // only scale if not admin
    if (studyHeightY > studyWidthX && studyHeightY > maxHeightWidth) {
      studyWidthX = maxHeightWidth / studyHeightY * studyWidthX;
      studyHeightY = maxHeightWidth;
    } else if (studyWidthX > maxHeightWidth) {
      studyHeightY = maxHeightWidth / studyWidthX * studyHeightY;
      studyWidthX = maxHeightWidth;
    }
  }
  

  
  studyCanvas.height = studyHeightY;
  studyCanvas.width = studyWidthX;
  document.body.style.width = studyCanvas.width;
  
  // set up and clear canvas
  
  var context = document.getElementById("canvas").getContext("2d");
  
  // make the image fit if not admin
  console.log(Router.current().route.getName().includes("admin"));
  // TODO fix this hack--this whole program is becoming one big hack
  if (!Router.current().route.getName().includes("admin")) {
    // only scale if not admin
    context.scale(studyCanvas.width/films[0].width, studyCanvas.height/films[0].height);
  }
    
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
 
  
  
  // draw film on canvas 500x500 TODO ????
    
  
  
  //context.drawImage(films[index], 0, 0, 500, 500);
  context.drawImage(films[index], 0, 0);
  // TODO this means that the drawings cannot be scaled anymore
  // Only scale if not admin
  // context.scale(films[0].width/studyCanvas.width, films[0].height/studyCanvas.height);
  
  // draw the current edits for organ
  drawOrgan(context, clickX, clickY, clickDrag, clickColor);
  
  // TODO clean up this hack (making new local vars)
  var clickXX, clickYY, clickDragD, clickColorC;
  
  // TODO: right now, only one study named "Normal" 
  // images from study were preloaded into films
  var study = Studies.findOne({ name: studyName });
  var organs = study.organs;
  var organsLength = 0;
  if (organs) {
    organsLength = organs.length;
  }
  console.log("organsLength " + organsLength);

  for (var i = 0; i < organsLength; i++) {
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
  
  //studyCanvas.height = 500;
  //studyCanvas.width = 500;


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
    var study = Studies.findOne({ name: studyName });
    if (!study) return;
    var organs = study.organs;
    
    var organsLength = 0;
    if (organs) {
      organsLength = organs.length;
    }
    console.log("organsLength " + organsLength);
    for (var k = 0; k < organsLength; k++) {
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
//  Session.set("tracker_study_length", 0);
  Session.set("tracker_goal", 0);
  Session.set("loadingText", "Loading study 0%");
});

Template.atlas.onCreated(function () {
  loadFilms();
});

Template.atlas.onRendered(function () {
  
  $("#savedFade").fadeOut(0);
  
  Session.set("currentOrgan", $("#currentOrganDrop option:selected").val());
  
  //console.log("onRendered");
  $('#colorpicker').colorpicker();
  //console.log("onRendered2");
  
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
      e.preventDefault();
    }
    else if (e.keyCode == '40') {
        // down arrow
      console.log("down. study length = " + study_length);
      if ((index + 1) < study_length) {
        //console.log("index up");
        index = index + 1;
        loadOrgan();
        redraw();
      }
      e.preventDefault();
    }
    else if (e.keyCode == '37') {
       // left arrow
    }
    else if (e.keyCode == '39') {
       // right arrow
    }
  });
  
  //loadFilms();
  if (study_length === 0) {
    $("#atlasOverlay").css("display", "none");
  }
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
    // TODO SPOT
    var study = Studies.findOne({name: studyName});
    var organs;
    
    if (study) {
      organs = study.organs;
    } else {
      organs = [];
    }
    //console.log(organs);
    return organs;
  },
  loadingText: function() {
    return Session.get("loadingText");
  },
  hoverOrgan: function () {
    var hoverOrgan = Session.get("hoverOrgan");
    if (hoverOrgan) {
      return hoverOrgan;
    } else {
      return "";
    }
  },
  title: function () {
    return Router.current().params.study;
  },
  studyHeight: function () {
//    var studyCanvas = document.getElementById("canvas");
//    studyCanvas.height = films[0].height;
//    studyCanvas.width = films[0].width;
    if (films.length) {
      return films[0].height;
    } else {
      return 300;
    }
  },
  studyWidth: function () {
//    var studyCanvas = document.getElementById("canvas");
//    studyCanvas.height = films[0].height;
//    studyCanvas.width = films[0].width;
    if (films.length) {
      return films[0].width;
    } else {
      return 300;
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
  // once images are loaded
//  console.log("TRACKER");
//  var study = Studies.findOne({name: studyName});
//  if (study) {
//    console.log("Images LOADED");
//  }
// TODO this code just feels horrible
//  console.log("Tracker " + Session.get("tracker_study_length" + " goal " + Session.get("tracker_goal")));
//  if (Session.get("tracker_goal") !== undefined && Session.get("tracker_study_length") === Session.get("tracker_goal")) {
//    console.log("TRACKER LENGTH " + Session.get("tracker_goal"));
//    location.reload(true);
//  }
  if (Session.get("tracker_goal")) {
    var study = Studies.findOne({name: studyName});
    if (study && study.imageArray.length === Session.get("tracker_goal")) {
//      var imageFile = Images.findOne({_id: study.imageArray[0]});
//      if (imageFile.hasStored("images")) {
//        console.log(imageFile.hasStored("images") + " LOADED BAH BAH " + Session.get("tracker_goal"));
//      }
      console.log("Images Loaded HAHAHAHAH " + study.imageArray.length);
      location.reload(true);
    }
  }
});

Template.atlas.events({
  "wheel #canvas": function (e) { //touchmove?
    //var index = Session.get("index");
    //console.log(e);
    if (e.originalEvent.deltaY > 0) {
      // scroll down
      //alert("down " + event.deltaY);
      console.log("index up. study_length = " + study_length);
      if ((index + 1) < study_length) {
        
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
  "touchmove #canvas": function (e) {
    //e.preventDefault();
    console.log("TOUCHED");
    var currentY = e.originalEvent.touches[0].clientY;
    //if (!lastY) lastY = currentY;
    if (currentY > lastY){
         // moved down
      console.log('down');
      
      // scroll down
      if ((index + 1) < study_length) {
        
        index = index + 1;
        loadOrgan();
        redraw();
      }
     } else if (currentY < lastY){
         // moved up
       console.log("up");
       
      if ((index - 1) >= 0) {
        index = index - 1;
        loadOrgan();
        redraw();
      }
     }
     lastY = currentY;
    
    //prevents default
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
  
  // TODO: when the wheel moves, we need to change this as well
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
      Session.set(myorgan.organ, !Session.get(myorgan.organ));
      if (Session.get(myorgan.organ)) {
        Session.set("hoverOrgan", myorgan.organ);
      } else {
        Session.set("hoverOrgan", "");
      }
    }, function (canvas) {
      console.log("clicked no organ");
      Session.set("hoverOrgan", "");
    });
    
    if (organ) {   
      redraw();
    }
  }
});

// Weird that helpers are under atlas but events under layout admin. Doesnt pose a problem yet
Template.controlPanel.helpers({
  organs: function () {
    // TODO SPOT
    var study = Studies.findOne({name: studyName});
    var organs;
    
    if (study) {
      organs = study.organs;
    } else {
        organs = [];
    }
    //console.log(organs);
    return organs;
  },
  currentOrganColor: function() {
    if (!Session.get("currentOrgan")) {
      return "#123456";
    }
    
    console.log(Session.get("currentOrgan"));
    
    var current = Session.get("currentOrgan");
    //return "#000000";
    
    var study = Studies.findOne({ name: studyName });
    
    //elemMatch not supported, { organs: { $elemMatch: { organ: "Aorta" }}});
    
    for (var i = 0; i < study.organs.length; i++) {
      if (study.organs[i].organ === current) {
        // this is the organ we are looking for
        var organ = study.organs[i];
        clickColor = organ.color;
        return organ.color;
      }
    }
  },
  currentOrgan: function() {
    return Session.get("currentOrgan");
  }
});
  
Template.layoutAdmin.events({
  "change #currentOrganDrop": function (e) {
//    console.log($("#currentOrganDrop option:selected").val());
    Session.set("currentOrgan", $("#currentOrganDrop option:selected").val());
    //console.log(e);
//    paint = true;
//    addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, false);
//    redraw();
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
  "click #changeColor": function (e) {
    // TODO change JQuery to meteor
    clickColor = $("#colorpicker").val();
    console.log("clickColor " + clickColor);
    //console.log("labelvalue " + $('#testingabc').text().trim());
    redraw();
  },
  "click #resetColor": function (e) {
    //console.log(Session.get("currentOrgan"));
    if (!Session.get("currentOrgan")) {
      return;
    }
    // TODO change JQuery to meteor
    
    var current = Session.get("currentOrgan");
    //return "#000000";
    
    var study = Studies.findOne({ name: studyName });
    
    //elemMatch not supported, { organs: { $elemMatch: { organ: "Aorta" }}});
    
    for (var i = 0; i < study.organs.length; i++) {
      if (study.organs[i].organ === current) {
        // this is the organ we are looking for
        var organ = study.organs[i];
        clickColor = organ.color;
        
      }
    }
    redraw();
  },
  "click #save": function (e) {
    // TODO this method works grossly but needs cleaning up
    if (!Session.get("currentOrgan")) {
      return;
    }
    
    console.log("saved " + clickColor);
    $("#savedFade").fadeIn(100).fadeOut(900);
//    Meteor.call("upsertOrgan", 
//      films[index].src,
//      "aorta",
//      { clickX: clickX, clickY: clickY, clickDrag: clickDrag, clickColor: clickColor }
//    );
    var study = Studies.findOne({ name: studyName }, {fields: { organs: 1, _id: 0 }});
    
    //elemMatch not supported, { organs: { $elemMatch: { organ: "Aorta" }}});
    //so using this hack instead ughh
    var clickXX =[];
    var clickYY = [];
    var clickDragD = [];
    var current = Session.get("currentOrgan");
    //console.log(study);
    for (var i = 0; i < study.organs.length; i++) {
      if (study.organs[i].organ === current) {
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
                studyName,
                //$("#currentOrgan").val(),
                Session.get("currentOrgan"),
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
    if (!Session.get("currentOrgan")) {
      return;
    }
    Meteor.call("deleteDrawing",
                studyName,
                //$("#currentOrgan").val(),
                Session.get("currentOrgan"),
                index
               );
    redraw();
  },
  // NEXT TODO I need to work on this function to create new studies without crashing
  "change #loadImages": function (e) {
    // shortcircuit if images already loaded for this route TODO
    if (study_length > 0) {
      console.log("No images loaded");
      return;
    }
    
//    var loadNewImages = Meteor.wrapAsync(function (callback) {
//  
//  FS.Utility.eachFile(e, function(file) {
//      Images.insert(file, function (err, fileObj) {
//        console.log(fileObj._id);
//        // add image id to array as they load
////        var study, imageArray;
////        study = Studies.findOne({name: "Normal"});
////        if (!study) {
////          imageArray = [];
////        } else {
////          imageArray = study.imageArray;
////        }
////        imageArray.push(fileObj._id);
//        // now update database with new array
//        
//        //TODO other than NORMAL
//        Meteor.call("addImageToStudy",
//                    studyName,
//                    fileObj._id/*,
//                    function () { console.log(fileObj._id + "ADDED TO study"); }*/
//                   );
//      });
//  });
//    });
//    var loadedNewImages = loadNewImages();
//    console.log("IMAGES LOADED BOOYAH");
    
    // Prepare load
    var load = new Load(event.target.files.length);
    Session.set("loadingText", "Uploading images " + load.getProgress(0));
    
    $("#atlasOverlay").css("display", "inline");
    Session.set("tracker_goal", event.target.files.length);
    FS.Utility.eachFile(e, function(file) {
      Images.insert(file, function (err, fileObj) {
        if (err) {
          console.log("Error");
        } else {
          console.log(fileObj._id + " being added");
          //Session.set("loadingText", load.getProgress(1));
          var intervalHandle = Meteor.setInterval(function () {
            console.log("Inside interval");
            if (fileObj.hasStored("images")) {
              // image has been uploaded and stored, add to study
              Meteor.call("addImageToStudy",
                      studyName,
                      fileObj._id,
                          function () { Session.set("loadingText", "Uploading images " + load.getProgress(1)); }


                      //,
  //                    function () { Session.set("tracker_study_length", Session.get("tracker_study_length") + 1); } 
                     );
              Meteor.clearInterval(intervalHandle);
            }
            
          }, 200);
          
          
        }
      });
    });
  },
  "click #saveCurrentOrgan": function (e) {
    if ($("#currentOrgan").val() === "" || study_length < 1) {
      return;
    }
    console.log("Added organ");
    
    Session.set("currentOrgan", $("#currentOrgan").val());
    // TODO others other than "NORMAL"--though I don't think this code is active anymore
    Meteor.call("addOrganToStudy", studyName, Session.get("currentOrgan"), study_length,
               function () {
     // set the dropdown to new organ
      $("#currentOrganDrop").val(Session.get("currentOrgan")).change();
      
                           }
               );
    // TODO get rid of jquery
    // TODO above needs to become more than just a test button
  },
  "click #testButton": function (e) {
    $("#overlay").css("display", "inline");
//    Meteor.call("saveDrawingToOrgan",
//                "Normal",
//                "Aorta",
//                clickColor,
//                index,
//                { clickX: clickX, clickY: clickY, clickDrag: clickDrag }
//               )
  },
  "click #testButton2": function (e) {
    $("#overlay").css("display", "none");
//    Meteor.call("saveDrawingToOrgan",
//                "Normal",
//                "Aorta",
//                clickColor,
//                index,
//                { clickX: clickX, clickY: clickY, clickDrag: clickDrag }
//               )
  }
});
