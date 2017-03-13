var runFix = function (deleteReferences, deleteImages) {
  console.log("runFix(" + deleteReferences + ", " + deleteImages + ");");
  Session.set("orphanReferences", "");
  Session.set("orphanImages", "");
  
  // for each study, check that image references are not null
  studies = Studies.find({});
  studies.forEach(function (study) {
    //console.log(study.name);
    var imageArray = study.imageArray;
    var editImageArray = [];
    if (imageArray) {
      editImageArray = imageArray.slice();
    }
    var deletedReference =  false;
    //if (!imageArray) {console.log("No image array for " + study.name);}
    for (var i = 0; imageArray && i < imageArray.length; i++) {
      //console.log(imageArray[i]);
      var imageFile = Images.findOne({ _id: imageArray[i] });
      //console.log(imageArray[i] + " " + imageFile._id + " " + imageFile.url());
      if (!imageFile) {
        //console.log("Orphan reference " + imageArray[i]);
        if (deleteReferences) {
          editImageArray.splice(jQuery.inArray(editImageArray, imageArray[i]), 1);
          deletedReference = true;
        }
        Session.set("orphanReferences", Session.get("orphanReferences") + " " + imageArray[i]);
      } else if (!imageFile.url()) {
        //console.log("Orphan reference " + imageArray[i]);
        if (deleteReferences) {
          editImageArray.splice(jQuery.inArray(editImageArray, imageArray[i]), 1);
          deletedReference = true;
        }
        Session.set("orphanReferences", Session.get("orphanReferences") + " URL" + imageArray[i]);
      }
    }
    if (deleteReferences && deletedReference) {
      Meteor.call("saveStudyImagesArray", study.name, editImageArray);
    }
  });
  
  // TODO there is a race condition here, but, whatever, just run it a couple times
  
  images = Images.find({});
  images.forEach(function (image) {
    var reference = "";
    
    studies.forEach(function (study) {
      var imageArray = study.imageArray;
      //if (!imageArray) {console.log("No image array for " + study.name);}

      for (var i = 0; imageArray && i < imageArray.length; i++) {
        //console.log(imageArray[i]);
        if (image._id === imageArray[i]) {
          reference = imageArray[i];
          return;
        }
      }
    });
    
    if (!reference) {
      //console.log("Orphan image " + image._id);
      deleteImages && Meteor.call("deleteImage", image._id);
      Session.set("orphanImages", Session.get("orphanImages") + " " + image._id);
    }
  });
  console.log("Done");
};

Template.admin.onRendered(function () {
  Session.set("orphanReferences", "");
  Session.set("orphanImages", "");
});

Template.admin.events({
  "click #runCheck": function () {
    runFix(false, false);
  },
  "click #runDeleteReferences": function () {
    runFix(true, false);
  },
  "click #runDeleteImages": function () {
    runFix(false, true);
  },
  "click #runDeleteBoth": function () {
    runFix(true, true);
  }
});

Template.admin.helpers({
  imagesWithoutStudies: function () {
    return Session.get("orphanImages");
  },
  referencesWithoutImages: function () {
    return Session.get("orphanReferences");
  }
});