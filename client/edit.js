// local copy of study's image array and tag arrays
var editImageArray = [];
var editStudyTags = [];
var unsavedImages = [];
var toDeleteImages = [];

var deleteUnsavedImages = function () {
  for (var i = 0; i < unsavedImages.length; i++) {
    Meteor.call("deleteImage", unsavedImages[i]);
  }
  unsavedImages = [];
}

var prepareImageForDeletion = function (index) {
  var imageToDelete = editImageArray[index];
  console.log("Preparing image for deletion " + imageToDelete);
  // remove image from working image array and add to delete queue
  toDeleteImages.push(imageToDelete);
  editImageArray.splice(jQuery.inArray(imageToDelete, editImageArray), 1);
  Session.set("updateReactive", "Added for deletion " + imageToDelete);
}

var deleteImagesPreparedForDeletion = function () {
  for (var i = 0; i < toDeleteImages.length; i++) {
    Meteor.call("deleteImage", toDeleteImages[i]);
  }
  toDeleteImages = [];
}

var setCurrentStudy = function (studyName) {
  // set current study
  var study = Studies.findOne({ name: studyName });
  editImageArray = study.imageArray || [];
  resetEditStudyTags(study.tags);
  Session.set("currentStudy", studyName);
  Session.set("updateReactive", studyName);
  $("#publishDropDown").val(study.public).change();
  setFieldsDisabled(true);
}

var resetEditStudyTags = function (studyTags) {
  editStudyTags = [];
  if (studyTags) {
    for (var i = 0; i < studyTags.length; i++) {
      editStudyTags[i] = studyTags[i].tag;
    }
  }
  console.log(editStudyTags);
}

var displayCancelSaveButton = function () {
  $("#editStudy").css({"display": "none"});
  // while editing cant change study
  $("#studiesDropDown").attr("disabled", true);
  $("#cancelStudy").css({"display": "inline"});
  $("#saveStudy").css({"display": "inline"});
};

var displayEditButton = function () {
  $("#editStudy").css({"display": "inline"});
  // enable changing study to edit
  $("#studiesDropDown").attr("disabled", false);
  $("#cancelStudy").css({"display": "none"});
  $("#saveStudy").css({"display": "none"});
};

var setFieldsDisabled = function (disabled) {
  $(".studyEditField").attr("disabled", disabled);
  if (Meteor.user().username !== "admin") {
    // the following fields are always disabled for non-admin
    $("#verifiedCheckBox").attr("disabled", true);
    $("#currentStudyOwner").attr("disabled", true);
  }
};

var clearAllFields = function () {
  $("#publishDropDown").val("Public");
  $("#allTagsDropDown").val("Abnormal");
  $("#currentStudyOwner").val("");
  $("#currentStudyAddress").val("");
  $("#currentStudyTitle").val("");
  $("#currentStudyCredit").val("");
  $("#currentStudyDescription").val("");
  $("#studiesDropDown").val("Untitled");
  editImageArray = [];
  editStudyTags = [];
};

var setEditFieldsForNewStudy = function () {
  clearAllFields();
  displayCancelSaveButton();
  setFieldsDisabled(false);
  $("#currentStudyDeleteButton").prop("disabled", true);
  Session.set("updateReactive", "Untitled");
  Session.set("currentStudy", "Untitled");
};

var loadNewImagesAt = function (e, index, number) {
  FS.Utility.eachFile(e, function(file) {
    Images.insert(file, function (err, fileObj) {
      if (err) {
        console.log("Error uploading images to edit");
      } else {
        console.log(fileObj._id + " being added");
        editImageArray.splice(index, 0, fileObj._id);
        
        var intervalHandle = Meteor.setInterval(function () {
          console.log("Inside interval");
          if (fileObj.hasStored("images")) {
            console.log(fileObj._id + " successfully added");
            unsavedImages.push(fileObj._id);
            Session.set("updateReactive", fileObj._id + "uploaded");
            Meteor.clearInterval(intervalHandle);
          }
        }, 200);
      }
    });
  });
};



var resetAllFields = function () {
  // clean up unsaved images and cancel images to delete
  deleteUnsavedImages();
  toDeleteImages = [];
  
  // hitting cancel all fields must be reset
  var study = Studies.findOne({ name: Session.get("currentStudy") });
  
  // this is hitting cancel on a new study
  if (!study) {
    $("#studiesDropDown").val($("#studiesDropDown option:first").val());
    setCurrentStudy($("#studiesDropDown option:first").val());
    return; 
  }
  
  editImageArray = study.imageArray;
  resetEditStudyTags(study.tags);
  Session.set("updateReactive", "Changes canceled");
  $("#currentStudyAddress").val(study.name);
  $("#currentStudyTitle").val(study.title);
  $("#publishDropDown").val(study.public).change();
  $("#verifiedCheckbox").prop("checked", study.verified);
  $("#currentStudyOwner").val(study.owner);
  $("#currentStudyCredit").val(study.credit);
  $("#currentStudyDescription").val(study.description);
};

var saveAllFields = function () {
  // get all the entered values
  var newStudyName = $("#currentStudyAddress").val();
  var newStudyTitle = $("#currentStudyTitle").val();
  var newStudyOwner = $("#currentStudyOwner").val();
  var newStudyCredit = $("#currentStudyCredit").val();
  var newStudyDescription = $("#currentStudyDescription").val();
  
  
  // check all the values, return false if not correct
  if (!newStudyName) { 
    console.log("Address must be filled out");
    return false;
  };
  // cannot have duplicate name, unless current name
  var duplicateStudy = Studies.findOne({name: newStudyName});
  if (duplicateStudy && (!Session.equals("currentStudy", duplicateStudy.name))) {
    alert("Address taken. Please choose unique address");
    return false;
  }
  
  if (!newStudyTitle || newStudyTitle === "Untitled") {
    console.log("Title must be filled out");
    return false;
  };
  
  // USER COLLECTION TEST
  var usernamesTest = Meteor.users.find({});
  console.log("USERS");
  usernamesTest.forEach(function (user) {
    console.log("Username " + user.username);
  });
  var userExists = Meteor.users.findOne({username: newStudyOwner});
  console.log("Exists " + userExists);
  //USER COLLECTION TEST
  
  if (!newStudyOwner) {
    // TODO search for valid owner
    console.log("Owner must be filled out");
    return false;
  } else if (!Meteor.users.findOne({ username: newStudyOwner })) {
    console.log("Owner must be valid");
    return false;
  }
  
  // save all fields
  // if new study, create new study
  var currentStudy = Session.get("currentStudy");
  if (currentStudy === "Untitled") {
    Meteor.call("createNewStudy", newStudyName, function () {
      console.log("Study created callback");
      completeSaveOf(newStudyName, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription);
      $("#currentOrganDrop").val(newStudyName).change();
      Session.set("currentStudy", newStudyName);
    });
  } else {
    Meteor.call("renameStudy", currentStudy, newStudyName, function () {
      console.log("Study renamed callback");
      completeSaveOf(newStudyName, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription);
      $("#currentOrganDrop").val(newStudyName).change();
      Session.set("currentStudy", newStudyName);
    });
  }
  
  // should have attempted save, so should be a success 
  return true;
};

var completeSaveOf = function (currentStudy, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription) {
  Meteor.call("setStudyVisibility", currentStudy, $("#publishDropDown option:selected").val(), function () { console.log("Study visibility callback"); });
  
  Meteor.call("setStudyVerified", currentStudy, $("#verifiedCheckbox").prop("checked"), function () { console.log("Study set verified callback"); });
  
  Meteor.call("retitleStudy", currentStudy, newStudyTitle, function () {
    console.log("Study retitled callback");
  });

  
  Meteor.call("setStudyOwner", currentStudy, newStudyOwner, function () { console.log("Study set owner callback"); });
  
  Meteor.call("setStudyCredit", currentStudy, newStudyCredit, function () { console.log("Study set credit callback"); });
  
  Meteor.call("setStudyDescription", currentStudy, newStudyDescription, function () { console.log("Study set description callback"); });
  
  // save new tags to Tags database
  
  // save tags to Study
  Meteor.call("saveStudyTags", currentStudy, editStudyTags, function () {
    console.log("Study tags saved");
  });
  
  // height and width of first image
  if (editImageArray && editImageArray.length > 0) {
    var firstImageFile = Images.findOne({ _id: editImageArray[0] });
    var firstImage = new Image();
    firstImage.onload = function () {
      continueCompleteSaveOf(currentStudy, this.height, this.width);
    }
    firstImage.src = firstImageFile.url();
  } else {
    continueCompleteSaveOf(currentStudy, 0, 0);
  }
}

var continueCompleteSaveOf = function (currentStudy, firstImageHeight, firstImageWidth) {
  Meteor.call("updateFirstHeightWidth", currentStudy, firstImageHeight, firstImageWidth);
    
  // save images to Study
  Meteor.call("saveStudyImagesArray", currentStudy, editImageArray, unsavedImages, toDeleteImages, function () {
    console.log("Image array saved");
  });
  
  // delete images that have been deleted
  deleteImagesPreparedForDeletion();
  // clear unsaved images, they have now been saved
  unsavedImages = [];
};

var swapImageWithNextImage = function (indexA) {
  var indexB = indexA + 1;
  var tmpImageID = editImageArray[indexA];
  if (indexB < editImageArray.length) {
    editImageArray[indexA] = editImageArray[indexB];
    editImageArray[indexB] = tmpImageID;
    // note that A was swapped with B
    tmpImageID = tmpImageID + editImageArray[indexA];
  }
  return tmpImageID;
};

Template.edit.onRendered(function () {
  setCurrentStudy($("#studiesDropDown option:selected").val());
});

Template.imageItem.helpers({
  display: function () {
    if (this.index === (editImageArray.length - 1)) {
      // if last image, don't display swap button
      return "display:none";
    } else {
      return "";
    }
  }
});

Template.edit.helpers({
  studies: function () {
    // log in first
    if (!Meteor.user()) { return; }
    
    var owner = Meteor.user().username;
    var studies;
    if (owner === "admin") {
      // display all studies for admin
      studies = Studies.find({});
    } else {
      studies = Studies.find({ owner: owner });
    }
    return studies;
  },
  adminLink: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    if (study) {
      return '<a class="catlasLink" href=' + '"/edit/' + study.owner + "/" + study.name + '">Edit structures</a>';
    } else {
      return '<span class="catlasLinkDead">Edit structures</span>';
    }
  },
  previewLink: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    if (study) {
      return '<a class="catlasLink" href=' + '"/preview/' + study.owner + "/" + study.name + '">Preview study</a>';
    } else {
      return '<span class="catlasLinkDead">Preview study</span>';
    }
  },
  allTags: function () {
    var addedStudyTag = Session.get("updateReactive");
    var tags = ["Normal", "Abnormal", "Ultrasound"];
    tags.push("Custom...");
    return tags;
  },
  studyTags: function () {
    var addedStudyTag = Session.get("updateReactive");
    var studyTags = editStudyTags;
    return studyTags;
  },
  verified: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    if (study && study.verified) {
      return "checked";
    } else {
      return "";
    }
  },
  studyOwner: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyOwner;
    if (study) {
      studyOwner = study.owner;
    } else {
      studyOwner = Meteor.user().username;
    }
    return studyOwner;
  },
  studyCredit: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyCredit;
    if (study) {
      studyCredit = study.credit;
    } else {
      studyCredit = "";
    }
    return studyCredit;
  },
  studyDescription: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyDescription;
    if (study) {
      studyDescription = study.description;
    } else {
      studyDescription = "";
    }
    return studyDescription;
  },
  studyTitle: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyTitle;
    if (study) {
      studyTitle = study.title;
    } else {
      studyTitle = "";
    }
    return studyTitle;
  },
  studyAddress: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyAddress;
    if (study) {
      studyAddress = study.name;
    } else {
      studyAddress = "";
    }
    return studyAddress;
  },
  images: function () {
    // makes this responsive
    var getImageURLs = Session.get("updateReactive");
    var imageURLs = [];
    for (var i = 0; i < editImageArray.length; i++) {
      var imageFile = Images.findOne({_id: editImageArray[i]});
      // TODO make into loading image
      if (!imageFile) {
        // TODO: this is not the issue!
        console.log("not imageFile " + editImageArray[i]);
        imageFile = { url: function () { return "/loadingArial12.png"; } }; 
      }
      imageURLs[i] = { url: imageFile.url(), index: i };
    }
    return imageURLs;
  }
});

Template.edit.events({
  "change #studiesDropDown": function () {
    setCurrentStudy($("#studiesDropDown option:selected").val());
  },
  "click #editStudy": function () {
    // make fields editable
    setFieldsDisabled(false);
    displayCancelSaveButton();
  },
  "click #cancelStudy": function () {
    // reset variables manually, not reactive here as currentStudy unchanged
    resetAllFields();
    setFieldsDisabled(true);
    displayEditButton();
  },
  "click #saveStudy": function () {
    if (saveAllFields()) {
      setFieldsDisabled(true);
      displayEditButton();
    }
  },
  "change #allTagsDropDown": function () {
    if ($("#allTagsDropDown option:selected").val() === "Custom...") {
      $("#addStudyTagField").css("display", "inline");
    } else {
      $("#addStudyTagField").css("display", "none");
    }
  },
  "click #addStudyTagButton": function () {
    var studyTag = $("#allTagsDropDown option:selected").val();
    if (studyTag === "Custom...") {
      studyTag = $("#addStudyTagField").val();
    }
    if (studyTag && (jQuery.inArray(studyTag, editStudyTags) < 0)) {
      editStudyTags.push(studyTag);
      Session.set("updateReactive", "added " + studyTag);
    }
  },
   "click .studyTagButton": function () {
     // get value of clicked tag
     var studyTag = event.target.value;
     editStudyTags.splice(jQuery.inArray(studyTag, editStudyTags), 1);
     Session.set("updateReactive", "removed " + studyTag);
  },
  "click .swapImage": function () {
    // convert value (index) to integer
    var index = event.target.value * 1;
    Session.set("updateReactive", swapImageWithNextImage(index));
    console.log(index);
  },
  "click #currentStudyDeleteButton": function () {
    var currentStudyName = Session.get("currentStudy");
    var deleteStudy = confirm('Delete "' + currentStudyName + '" permanently?');
    if (deleteStudy) {
      console.log("deleting study");
      // delete images that have been added but are not in study.imageArray
      deleteUnsavedImages();
      // the images prepared for deletion will be deleted when the study is deleted
      toDeleteImages = [];
      // delete study and associated images
      Meteor.call("deleteStudy", currentStudyName, function () {
        setCurrentStudy($("#studiesDropDown option:selected").val());
        displayEditButton();
        console.log("Study deleted callback");
      });
    } else {
      console.log("not deleting study");
    }
  },
  "click #newStudyButton": function (e) {
    setEditFieldsForNewStudy();
  },
  "click .insertImagesButton": function (e) {
    console.log("Clicked insert images button with index " + $(e.target).val());
    $("#loadImagesForNewStudy").data("imageArrayIndex", $(e.target).val() * 1 + 1);
    $("#loadImagesForNewStudy").click();
  },
  "click .deleteImageButton": function (e) {
    console.log("Clicked delete image button with index " + $(e.target).val());
    prepareImageForDeletion($(e.target).val());
  },
  "change #loadImagesForNewStudy": function(e) {
    console.log("At index " + $("#loadImagesForNewStudy").data("imageArrayIndex"));
    loadNewImagesAt(e, $("#loadImagesForNewStudy").data("imageArrayIndex"), e.target.files.length);
    $("#loadImagesForNewStudy").val("");
  }
});