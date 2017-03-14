const CATLAS_INSTRUCTIONS = "<p>To get started, scroll through the study loaded above using your mouse wheel, the up and down arrow keys on your keyboard, or, if you have a touchscreen, your finger. Click on a structure within the study to highlight and identify the structure; click on it again to remove the highlighting. Alternatively, use the menu button in the upper left to access the full list of structures and available studies.</p>"

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


var initializePageVariables = function () {
  studyName = Router.current().params.study;
  
  var study = Studies.findOne({name: studyName});
  if (study && study.imageArray) {
    study_length = study.imageArray.length;
  } else {
    study_length = 0;
  }
};

var loadFilmsRecursively = function () {
  console.log("loading films recursively");
  var study = Studies.findOne({name: studyName});
  // abort load if no study images
  if (!study || !study.imageArray) {
    console.log("Aborting load films");
    return;
  }
  
  // set iterating i for recursion
  var i = 0;
  
  var loadNextFilms = function () {
    
    //load the next set of films before freeing process for UI
    films.push(new Image());
    films[i].onload = function () {
        redraw(); 
    };
    var imageFile = Images.findOne({_id: study.imageArray[i]});
    
    // load film and call onload defined above
    films[i].src = imageFile.url();
    
    console.log("Loading film[" + i + "] " + study.imageArray[i]);
    
    // iterate and recurse
    i = i + 1;
    if (i < study.imageArray.length) {
      // if there are more films to load, wait, then do it again
      setTimeout(loadNextFilms, 1000);
    }
  }
  
  // can use setTimeout to simulate lag in runtime
  setTimeout(loadNextFilms, 3000);
}



var addClick = function (x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

var loadOrgan = function () {
 clickX = [];
 clickY = [];
 clickDrag = [];
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
  // draw everything on canvas
  var studyCanvas = document.getElementById("canvas");

  var study = Studies.findOne({ name: studyName });
  var studyHeightY;
  var studyWidthX;
  if (films && films[0]) {
    console.log("USING FILM HEIGHTS AND WIDTHS");
    studyHeightY = films[0].height;
    studyWidthX = films[0].width;
  } else if (study && study.firstImageHeight && study.firstImageWidth) {
    console.log("USING STORED HEIGHTS AND WIDTHS");
    studyHeightY = study.firstImageHeight;
    studyWidthX = study.firstImageWidth;
  } else {
    console.log("ERROR: USING 300 HEIGHTS AND WIDTHS");
    studyHeightY = 300;
    studyWidthX = 300;
  }
  
  var studyHeightYConst = studyHeightY;
  var studyWidthXConst = studyWidthX;
  
  // max dimension is set to the size of the viewport
  var maxHeight = window.innerHeight;
  var maxWidth = window.innerWidth;
  
  // need to take into account height of other elements
  maxHeight = maxHeight - document.getElementById("study_title_id").offsetHeight;
  maxHeight = maxHeight - document.getElementById("organ_title_id").offsetHeight;
  maxHeight = maxHeight - 100; // pixel padding at bottom of #study-description
  // and when descriptions are added TODO
  //maxHeight = maxHeight - document.getElementById("description_id").offsetHeight;
  
  // TODO same hack as below re admin
  if (!Router.current().route.getName().includes("admin") &&
     !Router.current().route.getName().includes("edit")) {
    // only scale if not admin
    // find the largest dimension, set it to the max dimension
    // scale the other dimension to size
    // if the study is bigger than the viewport in one of the dimensions
    // calc dimensions to scale the study to fit
    if (studyHeightY > maxHeight && (studyHeightY - maxHeight) > (studyWidthX - maxWidth)) {
      // if study is taller than viewport and more tall than it is wide
      studyWidthX = maxHeight / studyHeightY * studyWidthX;
      studyHeightY = maxHeight;
    } else if (studyWidthX > maxWidth) {
      // else if study is wider than viewport
      studyHeightY = maxWidth / studyWidthX * studyHeightY;
      studyWidthX = maxWidth;
    }
  }
  

  // set the size of the canvas to draw the image on to the size of the scaled image
  studyCanvas.height = studyHeightY;
  studyCanvas.width = studyWidthX;
//  document.body.style.width = studyCanvas.width;
  $("#canvas-container").css("width", studyWidthX + "px");
  
  // set up and clear canvas
  
  var context = document.getElementById("canvas").getContext("2d");
  
  // make the image fit if not admin
  console.log(Router.current().route.getName().includes("admin"));
  // TODO fix this hack--this whole program is becoming one big hack
  if (!Router.current().route.getName().includes("admin") &&
     !Router.current().route.getName().includes("edit")) {
    // only scale if not admin
    context.scale(studyCanvas.width/studyWidthXConst, studyCanvas.height/studyHeightYConst);
  }
    
  context.globalAlpha = 1;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  
  if (films && films[index]) {

    context.drawImage(films[index], 0, 0); //only

    // draw the current edits for organ
    drawOrgan(context, clickX, clickY, clickDrag, clickColor);

    // TODO clean up this hack (making new local vars)
    var clickXX, clickYY, clickDragD, clickColorC;


    // images from study were preloaded into films
    study = Studies.findOne({ name: studyName });
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
  } else {
    // film not yet loaded, draw loading text
    if (context.fillText) {
      context.font = "italic 16px Sans-serif";
      context.fillStyle = "#c7c7c7";
      context.textAlign = "center";
      context.fillText("Image " + index + " of " + study_length + " loading...", studyWidthXConst / 2, studyHeightYConst / 2);
    } else {
      // some older browsers do not support fillText
      loadingImage = new Image();
      loadingImage.onload = function () {
        context.drawImage(loadingImage, 
                          studyWidthXConst / 2 - loadingImage.width / 2,
                          studyHeightYConst / 2 - loadingImage.height / 2);
      };
      loadingImage.src = "/LoadingArial12.png";
    }
  }
}

var doInOrgan = function(e, doMe, elseDoMe) {
  // TODO consolidate code with redraw somehow
    // put it in a separate function
    // draw everything on canvsas
  
    // set up and clear canvas
    var canvas = document.getElementById("canvas");
    var context = document.getElementById("canvas").getContext("2d");
//    var mouseX = e.pageX - e.target.offsetLeft;
//    var mouseY = e.pageY - e.target.offsetTop;
//  // is the menu open? need to accomodate for that
//  if ($('body').hasClass('menu-open')) {
//    console.log("adding to mouseX menu open");
//    mouseX = mouseX - document.getElementById("menu-side-id").offsetWidth;
//  }
  
//    var mouseX = e.clientX - e.target.offsetLeft;
//    var mouseY = e.clientY - e.target.offsetTop;
  
  // works on everything but the ipad for some reason!! does not need to adjust for open menu
  var rect = canvas.getBoundingClientRect();
  //console.log("clientX = " + e.clientX);
 // console.log("touchX = " + e.originalEvent.touches[0].clientX);
  
  var myclientX;
  var myclientY;
  
  if (e.clientX) {
    // click event
    myclientX = e.clientX;
    myclientY = e.clientY;
  } else if (e.originalEvent && 
             e.originalEvent.changedTouches &&
             e.originalEvent.changedTouches[0]) {
    // touchend event
    myclientX = e.originalEvent.changedTouches[0].clientX;
    myclientY = e.originalEvent.changedTouches[0].clientY;
  } else {
    console.log("ERROR weird X Y 200");
    return;
  }
  
  var mouseX = myclientX - rect.left;
  var mouseY = myclientY - rect.top;
  

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
  Session.setDefault("hoverOrgan", "Welcome to Catlas");
  Session.setDefault("studyDescription", CATLAS_INSTRUCTIONS);
});

Template.atlas.onCreated(function () {
  initializePageVariables();
});

Template.atlas.onRendered(function () {
  redraw();
  
  loadFilmsRecursively();
  
  
  $("body").addClass("menu");
  
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
  
  if (study_length === 0) {
    $("#atlasOverlay").css("display", "none");
  }
});

Template.atlas.onRendered(function () {
//  context = document.getElementById("scan").getContext("2d");
//  var mimage = document.getElementById("myimage");
//  context.drawImage(mimage, 0, 0);
//  context.fillStyle = "#ff0000";
//  context.fillRect(0,0,150,75);
  
  $(window).on("resize", function (e) { 
    console.log("RESIZED ON");
    setMenuWidth(400, .80);
    redraw()});
  
  // set the max width of the menu
  setMenuWidth(400, .80);
  
  // if flexbox exsited, wouldnt have to do this
  var navlistHeight = $("#nav-list-id").innerHeight();
  
  $("#organs").css("top", navlistHeight + "px");
  
  // for safari 10 on iphone
  document.getElementById("canvas").addEventListener('touchforcechange', function (e) { e.preventDefault(); });
});

var setMenuWidth = function (menuWidth, percentOfWindowWidth) {
  // if the menu covers pretty much the whole screen, just cover the whole screen
  // increase width of menu to full screen if greater than % screen size
  console.log("WINDOW W " + window.innerWidth + "px");
  if (menuWidth > percentOfWindowWidth * window.innerWidth) {
    menuWidth = "100vw";
  } else {
    menuWidth = menuWidth + "px";
  }
  $(".menu-side").css("max-width", menuWidth);
  
  // TODO make this into a function
  var menuIsOpen = ($(".menu-side").css("left") === "0px");
  if (menuIsOpen) {
    // menu is open, left of body needs adjustment
    $("#study-pane").css("left", menuWidth);
  } else {
    // menu is closed, left of menu needs adjustment
    $(".menu-side").css("left", "-" + menuWidth);
  }
}

Template.atlas.onDestroyed(function () {
  $(window).off("resize");
//  Session.set("questionRendered", false);
//  Session.set("playerReady", false);
//  // destroy player if it has been created
//  player && player.destroy();
});

Template.atlas.helpers({
  organs: function () {
    // TODO SPOT
    var study = Studies.findOne({name: studyName});
    var organs;
    
    if (study && study.organs) {
      organs = study.organs;
      console.log("ORGANS UNSORTED " + organs[0].organ);
      organs.sort(function (a, b) {
        return a.organ.localeCompare(b.organ);
      }); // sort organs alphabetically
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
  studyDescription: function () {
    var studyDescription = Session.get("studyDescription");
    if (studyDescription) {
      return studyDescription;
    } else {
      return "";
    }
  },
  title: function () {
    // depreciated
    return Router.current().params.study;
  },
  studyTitle: function () {
    var studyTitle = Router.current().params.study;
    // TODO this needs to be not hard-coded
    if (studyTitle === "normalaxial") {
      studyTitle = "Abdomen Axial";
    } else if (studyTitle === "test4") {
      studyTitle = "Abdomen Coronal";
    } else if (studyTitle === "normalsagittal") {
      studyTitle = "Abdomen Sagittal";
    } else if (studyTitle === "test32") {
      studyTitle = "Test Axial 32";
    }
    return studyTitle;
  },
  filteredStudies: function () {
    console.log("FILTERED STUDIES");
    var filterUpdated = Session.get("filterUpdated");
    
    // sample filter
    // { $and: [{verified: true}, {public: "public"}, { $or: [{tags.tag: "tag1"}, {tags.tag: "tag2" } ]}]}
    
    var finalAndFilter = [];
    
    // only verified studies
    finalAndFilter.push({ verified: true });
    
    // only public studies
    finalAndFilter.push({ public: "public" });
    
    
    // There must be a better way!
    // Also, there is this problem where this function is called before
    // the checked properties are set...
    var normalFilter = [];
    if ($("#normalCheckbox").prop("checked") === undefined) {
      // default filter
      normalFilter = [{ "tags.tag": "Normal" }, { "tags.tag": "Abnormal" }];
    } else {
    

      if ($("#normalCheckbox").prop("checked")) {
        normalFilter.push({ "tags.tag": "Normal" });
      } else {
        normalFilter.push({ "tags.tag": "" });
      }
      if ($("#abnormalCheckbox").prop("checked")) {
        normalFilter.push({ "tags.tag": "Abnormal" });
      } else {
        normalFilter.push({ "tags.tag": "" });
      }
    }
    var tagFilter = { $or : normalFilter };
    
    // add the tags
    finalAndFilter.push(tagFilter);
    
    var filter = { $and: finalAndFilter };
    
    console.log(filter);
    
    var filteredStudies = Studies.find(filter);
    return filteredStudies;
    
    //return ["banana"];
  },
  studyHeight: function () {
//    var studyCanvas = document.getElementById("canvas");
//    studyCanvas.height = films[0].height;
//    studyCanvas.width = films[0].width;
    if (films.length) {
      return films[0].height;
    } else {
      var study = Studies.findOne({name: studyName});
      if (study) {
        return study.firstImageHeight;
      } else {
        return 300;
      }
    }
  },
  studyWidth: function () {
//    var studyCanvas = document.getElementById("canvas");
//    studyCanvas.height = films[0].height;
//    studyCanvas.width = films[0].width;
    if (films.length) {
      return films[0].width;
    } else {
      var study = Studies.findOne({name: studyName});
      if (study) {
        return study.firstImageWidth;
      } else {
        return 300;
      }
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
    
    // update the descriptors
    if (Session.get(e.target.getAttribute("value"))) {
      Session.set("hoverOrgan", e.target.getAttribute("value"));
      
      // find organ description
      var myOrganName = e.target.getAttribute("value");
      
      //begin find organ description--these need to become functions eventually
      var study = Studies.findOne({ name: studyName });
      var organs = study.organs;
      var organsLength = 0;
      if (organs) {
        organsLength = organs.length;
      }
      console.log("organsLength " + organsLength);

      var organ;
      var myorgan;
      for (var i = 0; i < organsLength; i++) {
        organ = organs[i];

        // if organ is not checked, continue to next organ w/o drawing
        //console.log(organ.organ + Session.get(organ.organ));
        if (organ.organ === myOrganName) { myorgan = organ; break; };

      }
      //end new code that should be a function
      
      if (myorgan) { Session.set("studyDescription", myorgan.description); }
    } else {
      Session.set("hoverOrgan", "");
      Session.set("studyDescription", "");
    }
    
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
        Session.set("studyDescription", myorgan.description);
      } else {
//        Session.set("hoverOrgan", "");
      }
    }, function (canvas) {
      canvas.style.cursor = "default";
//      Session.set("hoverOrgan", "");
    });
  },
  "touchend #canvas, click #canvas": function (e) {
    // TODO this is way too convuluted man
    
    if (lastY) {
      // was a touchmove event
      lastY = "";
      return false;
    }
    
    console.log("CLICKED CANVAS");
    var organ = doInOrgan(e, function (canvas, myorgan) {
      console.log("clicked organ");
      Session.set(myorgan.organ, !Session.get(myorgan.organ));
      if (Session.get(myorgan.organ)) {
        Session.set("hoverOrgan", myorgan.organ);
        Session.set("studyDescription", myorgan.description);
      } else {
        Session.set("hoverOrgan", "");
        Session.set("studyDescription", "");
      }
    }, function (canvas) {
      console.log("clicked no organ");
      Session.set("hoverOrgan", "");
      Session.set("studyDescription", "");
    });
    
    if (organ) {   
      redraw();
    }
    
    return false;
  },
  "click .menu-toggle": function (e) {
    console.log("click");
    // this is kept to rotate the menu toggle button
    $('body').toggleClass("menu-open");
    
//    var menuWidth = 400;
//    if (menuWidth > .75 * window.innerWidth) {
//      menuWidth = "100%";
//    } else {
//      menuWidth = menuWidth + "px";
//    }
    
    // get the width of the menu as designated in css
    var menuWidth = $(".menu-side").css("max-width");
    console.log("MENU SIDE width " + menuWidth);
    
    // check to see if menu is currently open
    var menuIsOpen = ($(".menu-side").css("left") === "0px");
    
    // animate menu opening or closing
    if (menuIsOpen) {
      $(".menu-side").animate({left: "-" + menuWidth }, 200, "swing");
      $("#study-pane").animate({left: "0px"}, 200, "swing");
    } else {
      $(".menu-side").animate({left: "0px"}, 200, "swing");
      $("#study-pane").animate({left: menuWidth }, 200, "swing");
    }
    
    // prevent default action
    return false;
  },
  "click .help-button": function (e) {
    console.log("clicked help button");
    Session.set("hoverOrgan", "Welcome to Catlas");
    Session.set("studyDescription", CATLAS_INSTRUCTIONS);
    // do I need to clear currentOrgan TODO
    // prevent default action
    return false;
  },
  // TODO these links need to be dynamically generated in the future
  // Also fix the timeout hack and use iron router for real to dynamically load study
  "click .filteredStudyLink": function (e) {
    console.log("clicked filtered study " + e.target);
    // not sure why page is not reloaded when link is changed with ahref
    // i think it has something to do with iron router/meteor, will use to my advantage
    // for now and just reload the right pane
    Router.go(e.target.href);
    document.location.reload(true);
    return false;
  },
  "change .filterCheckbox": function (e) {
    if (Session.get("filterUpdated")) {
      Session.set("filterUpdated", (Session.get("filterUpdated") + 1) % 10);
    } else {
      Session.set("filterUpdated", 1);
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
  "click #saveOrganDescription": function (e) {
    if (!Session.get("currentOrgan")) {
      return;
    }
    var description = $("#organ-description").val();
    console.log("clicked save description " + description);
    
    Meteor.call("saveDescription",
                studyName,
                Session.get("currentOrgan"),
                description
               );
  },
  "click #loadCurrentDescription": function (e) {
    var studyDescription = Session.get("studyDescription");
    console.log("clicked load description " + studyDescription);
    if (studyDescription) {
      $("#organ-description").val(studyDescription);
    }
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
  "click #renameCurrentOrgan": function (e) {
    if ($("#currentOrgan").val() === "" || study_length < 1 || !Session.get("currentOrgan")) {
      console.log("Aborted");
      return;
    }
    console.log("Renaming organ");
    
    // TODO hoverOrgan does not update, but do not want to bother right now
    
    
    Meteor.call("renameOrgan", studyName, $("#currentOrganDrop option:selected").val(), $("#currentOrgan").val(),
               function () {
      // call back function
      // rename the organ pointer
      Session.set("currentOrgan", $("#currentOrgan").val());
     // set the dropdown to new organ
      $("#currentOrganDrop").val(Session.get("currentOrgan")).change();
      
                           }
               );
    
    
    
  },
  "click #deleteCurrentOrgan": function (e) {
    if (study_length < 1 || !Session.get("currentOrgan")) {
      console.log("Aborted deletion");
      return;
    }
    
    if ($("#currentOrgan").val() !== "DELETE") {
      console.log("Aborted");
      alert('You must type in "DELETE" in the field to the left to delete organ permanently')
      return;
    }
    $("#currentOrgan").val("");
    console.log("Deleting organ");
    
    // TODO hoverOrgan does not update, but do not want to bother right now, drawings don't update, but they are gone gone gone
    
    
    Meteor.call("deleteOrgan", studyName, $("#currentOrganDrop option:selected").val(),
               function () {
      // call back function
      // if there are still options
      if ($("#currentOrganDrop option").length > 0) {
      // rename the organ pointer
      Session.set("currentOrgan", $("#currentOrganDrop option").eq(0).val());
     // set the dropdown to new organ
      $("#currentOrganDrop").val(Session.get("currentOrgan")).change();
      } else {
        Session.set("currentOrgan", "");
      }
      
                           }
               );
    
    
    
  },
  "click #permDeleteStudy": function (e) {
    if (study_length < 1) {
      console.log("Aborted deletion");
      return;
    }
    
    if ($("#currentStudyName").val() !== "DELETE" || 
       $("#currentStudyAddress").val() !== "DELETE") {
      console.log("Aborted");
      alert('You must type in "DELETE" in both fields to the left to delete study permanently')
      return;
    }
    
    

    
    console.log("DELETING STUDY");
    Meteor.call("deleteStudy", studyName, function () {
      console.log("Study deleted callback");
      document.location.reload(true);
    });
  },
  "click #renameStudy": function (e) {
    
    if (study_length < 1) {
      console.log("Aborted retitle");
      return;
    }
    
    var newStudyTitle = $("#currentStudyName").val();
    
    if (!newStudyTitle) { 
      console.log("Name must be filled out");
      return;
    };
    
    console.log("retitling STUDY");
    Meteor.call("retitleStudy", studyName, newStudyTitle, function () {
      console.log("Study retitled callback");
    });
  },
  "click #changeAddress": function (e) {
    
    if (study_length < 1) {
      console.log("Aborted address change");
      return;
    }
    
    var newStudyName = $("#currentStudyAddress").val();
    
    if (!newStudyName) { 
      console.log("Adress must be filled out");
      return;
    };
    
    // cannot have duplicate name
    var duplicateStudyName = Studies.findOne({name: newStudyName});
    if (duplicateStudyName) {
      alert("Address taken. Please choose unique address");
      return;
    }
    
    console.log("changing address STUDY");
    Meteor.call("renameStudy", studyName, newStudyName, function () {
      console.log("Study renamed callback");
      Router.go("/admin/" + newStudyName);
      document.location.reload();
    });
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
