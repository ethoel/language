// TODO README.md, LICENSE.md, and .gitignore
Meteor.methods({
  checkOrgan: function(organ, checked) {
    Organs.upsert({
      organ: organ 
    }, { $set: {
      checked: checked,
      createdAt: new Date()
    }}, { multi: true });
  },
  // atlas project
  upsertOrgan: function(film, organ, data, checked) {
    Organs.upsert({
      film: film,
      organ: organ 
    }, { $set: {
      data: data,
      checked: checked,
      createdAt: new Date()
    }});
  },
  // atlas project
  addImageToStudy: function(name, image) {
    Studies.upsert({
      name: name
    }, { $push: { imageArray: image },
         $set: { createdAt: new Date() }
    });
  },
  addOrganToStudy: function(name, organ, arrayN) {
  
    Studies.upsert({
      name: name
    }, { $push: { 
      organs: { organ: organ, color: "#FFFFFF",
              data: new Array(arrayN) } 
    }
    });
  },
  renameOrgan: function(studyName, oldOrganName, newOrganName) {
    // find the organ named oldOrganName in the study named studyName
    // rename THAT organ ($ is index into organs array) to newOrganName
    Studies.update({ name: studyName, "organs.organ": oldOrganName 
    }, { $set: { "organs.$.organ": newOrganName }});
    console.log("Renamed " + oldOrganName + " organ " + newOrganName);
  },
  saveDescription: function(studyName, organName, newDescription) {
    // find the organ named oldOrganName in the study named studyName
    // rename THAT organ ($ is index into organs array) to newOrganName
    Studies.update({ name: studyName, "organs.organ": organName 
    }, { $set: { "organs.$.description": newDescription }});
    console.log("Added " + newDescription + " to organ " + organName);
  },
  deleteOrgan: function(studyName, organName) {
    // find the organ named organName in the study named studyName
    // remove that organ from the organs array
    Studies.update({ name: studyName 
    }, { $pull: { "organs": { "organ": organName} }});
    console.log("Deleted " + organName );
  },
  retitleStudy: function(studyName, newStudyTitle) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "title": newStudyTitle }});
    console.log("Retitling " + newStudyTitle );
  },
  setStudyVisibility: function(studyName, newVisibility) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "public": newVisibility }});
    console.log("Setting public to " + newVisibility );
  },
  setStudyVerified: function(studyName, newVerified) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "verified": newVerified }});
    console.log("Setting verified to " + newVerified );
  },
  setStudyOwner: function(studyName, newOwner) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "owner": newOwner }});
    console.log("Setting owner to " + newOwner );
  },
  setStudyCredit: function(studyName, newCredit) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "credit": newCredit }});
    console.log("Setting credit to " + newCredit );
  },
  setStudyDescription: function(studyName, newDescription) {
    // find the organ named organName in the study named studyName
    Studies.update({ name: studyName 
    }, { $set: { "description": newDescription }});
    console.log("Setting description to " + newDescription );
  },
  renameStudy: function(studyName, newStudyName) {
    // find the organ named organName in the study named studyName
    // remove that organ from the organs array
    Studies.update({ name: studyName 
    }, { $set: { "name": newStudyName }});
    console.log("Retitling " + newStudyName );
  },
  deleteStudy: function(studyName) {
    // delete images
    // find study
    var studyToDelete = Studies.findOne({name: studyName});
    if (!studyToDelete) { console.log("DELETE aborted"); return; }
    
    // remove studyName and associated imaging
    var imagesToDelete = studyToDelete.imageArray;
    var deleteError = 0;
    for (var i = 0; i < imagesToDelete.length; i++) {
      // find imageFile to delete by _id
      var imageFile = Images.findOne(imagesToDelete[i]);
      if (imageFile) {
        console.log("Should have deleted " + imagesToDelete[i]);
        // delete file
        
        //var errorRemoving = 
        imageFile.remove();
        
        //console.log("errorRemoving=" + errorRemoving + "=errorRemoving")
        
        // TODO what if this does not remove it properly? -the following not work
        // if (errorRemoving) { console.log("No success in removing " + imageFile._id); }
       
        // not sure why the following code does not work
//        Images.remove(imageFile, function (err, file) {
//          if (err) {
//            console.log("Error deleting image " + err);
//            deleteError = 1;
//          } else {
//            console.log("Deleted " + imageFile._id);
//          }
//        });
      } else {
        // _id does not exist
        console.log("Could not find " + imagesToDelete[i]);
      }
    }
    
    if (deleteError) {
      console.log("Study delete aborted, not all images deleted properly");
      return;
    }
    Studies.remove({name: studyName});
    console.log("Deleted " + studyName );
  },
  deleteImage: function(imageId) {
    var imageFile = Images.findOne(imageId);
    if (imageFile) {
      console.log("Deleted " + imageId);
      // delete file

      //var errorRemoving = 
      imageFile.remove();

      //console.log("errorRemoving=" + errorRemoving + "=errorRemoving")

      // TODO what if this does not remove it properly? -the following not work
      // if (errorRemoving) { console.log("No success in removing " + imageFile._id); }

      // not sure why the following code does not work
//        Images.remove(imageFile, function (err, file) {
//          if (err) {
//            console.log("Error deleting image " + err);
//            deleteError = 1;
//          } else {
//            console.log("Deleted " + imageFile._id);
//          }
//        });
    } else {
      // _id does not exist
      console.log("Could not find " + imageId);
    }
  },
  deleteDrawing: function(name, organ, index) {
    // prepare key for drawing index b/c mongodb cannot handle $$
    var key = "organs.$.data." + index;
    var drawData = {};
    drawData[key] = { clickX: [], clickY: [], clickDrag: [] };
    //console.log(drawData);
    
    Studies.update({
      "name": name,
      "organs.organ": organ
    }, { $set: drawData });
  },
  saveDrawingToOrgan: function(name, organ, color, index, data) {
    // prepare key for drawing index b/c mongodb cannot handle $$
    var key = "organs.$.data." + index;
    var drawData = {};
    drawData[key] = data;
    //console.log(drawData);
    
    // add color to object
    key = "organs.$.color";
    drawData[key] = color;
    
    Studies.update({
      "name": name,
      "organs.organ": organ
    }, { $set: drawData });
  },
  saveStudyTags: function(studyName, studyTagsArray) {
    var studyTags = [];
    for (var i = 0; i < studyTagsArray.length; i++) {
      studyTags.push({ tag: studyTagsArray[i] });
    }
    Studies.update({ "name": studyName }, { $set: { "tags": studyTags }});
  }
});

//study {
//  images [
//    id1,
//    id2,
//    id3
//  ],
//  aorta  { organ: "aorta", checked: true, color: #FFFFFF, 
//      data: [ { clickX, clickY, clickDrag }, { clickX, clickY, clickDrag } ] },
//  liver  { organ: "liver", checked: true, color: #AAAAAA, 
//      data: [ { clickX, clickY, clickDrag }, { clickX, clickY, clickDrag } ] }
//}


Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/", function () {
  this.redirect("/atlas");
});

Router.route("/atlas", function () {
  this.redirect("/atlas/test4");
});

Router.route("/atlas/:study", function () {
  
  this.wait(Meteor.subscribe("organs"));
  this.wait(Meteor.subscribe("studies"));
  this.wait(Meteor.subscribe("tags"));
  this.wait(Meteor.subscribe("images"));
  
  if (this.ready()) {
    this.render("atlas");
    
  } else {
    this.render("/loading");
  }
});

Router.route("/admin", function () {
  this.redirect("/admin/test4");
});

Router.route("/admin/:study", function() {
  this.layout("layoutAdmin");
  
  this.wait(Meteor.subscribe("organs"));
  this.wait(Meteor.subscribe("studies"));
  this.wait(Meteor.subscribe("tags"));
  this.wait(Meteor.subscribe("images"));
  
  if (this.ready()) {
    this.render("atlas");
    
  } else {
    this.render("/loading");
  }
}, {name: 'admin.study'});

// When log in should be required
Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
  } else if (Meteor.user() && (Meteor.user().username !== "admin")) {
    this.layout("");
    this.render("unauthorized");
  } else {
    // otherwise continue routing
    this.next();
  }
}, { only: ['admin', 'admin.study'] });

// When log in should be required
Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
//  } else if (Meteor.user() && (Meteor.user().username !== "admin")) {
//    this.layout("");
//    this.render("unauthorized");
  } else {
    // otherwise continue routing
    this.next();
  }
}, { only: ['edit'] });

Router.route("/edit", function () {
  this.wait(Meteor.subscribe("studies", "edit"));
  this.wait(Meteor.subscribe("tags"));
  this.wait(Meteor.subscribe("images"));
  this.wait(Meteor.subscribe("usernames"));
  
  if (this.ready()) {
    this.render("edit");
    
  } else {
    this.render("/loading");
  }
});
