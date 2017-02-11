// local copy of study's image array and tag arrays
var editImageArray = [];
var editStudyTags = [];

var setCurrentStudy = function (studyName) {
  var study = Studies.findOne({ name: studyName });
  editImageArray = study.imageArray;
  Session.set("currentStudy", studyName);
  Session.set("updateReactive", editImageArray[0]);
  setFieldsDisabled(true);
}

var displayCancelSaveButton = function () {
  $("#editStudy").css({"display": "none"});
  $("#cancelStudy").css({"display": "inline"});
  $("#saveStudy").css({"display": "inline"});
};

var displayEditButton = function () {
  $("#editStudy").css({"display": "inline"});
  $("#cancelStudy").css({"display": "none"});
  $("#saveStudy").css({"display": "none"});
};

var setFieldsDisabled = function (disabled) {
  $("#currentStudyAddress").attr("disabled", disabled);
  $("#currentStudyTitle").attr("disabled", disabled);
  $("#allTagsDropDown").attr("disabled", disabled);
  $("#addStudyTagButton").attr("disabled", disabled);
  $(".studyTagButton").attr("disabled", disabled);
};

var resetAllFields = function () {
  var study = Studies.findOne({ name: Session.get("currentStudy") });
  $("#currentStudyAddress").val(study.name);
  $("#currentStudyTitle").val(study.title);
};

var saveAllFields = function () {
  // get all the entered values
  var newStudyName = $("#currentStudyAddress").val();
  var newStudyTitle = $("#currentStudyTitle").val();
  
  
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
  
  if (!newStudyTitle) {
    console.log("Title must be filled out");
    return false;
  };
  
  // save all fields
  Meteor.call("retitleStudy", Session.get("currentStudy"), newStudyTitle, function () {
    console.log("Study retitled callback");
  });

  Meteor.call("renameStudy", Session.get("currentStudy"), newStudyName, function () {
    console.log("Study renamed callback");
  });
  
  // success
  $("#currentOrganDrop").val(newStudyName).change();
  Session.set("currentStudy", newStudyName);
  return true;
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
    // TODO
    return "checked";
  },
  studyOwner: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var studyOwner;
    if (study) {
      studyOwner = study.owner;
    } else {
      studyOwner = "";
    }
    return studyOwner;
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
    // not using imageZero, but makes this responsive
    var swappedImageID = Session.get("updateReactive");
    var imageURLs = [];
    for (var i = 0; i < editImageArray.length; i++) {
      var imageFile = Images.findOne({_id: editImageArray[i]});
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
  }
});