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

var setFieldsReadOnly = function (readOnly) {
  $("#currentStudyAddress").attr("readonly", readOnly);
  $("#currentStudyTitle").attr("readonly", readOnly);
};

var resetAllFields = function () {
  var study = Studies.findOne({ name: Session.get("currentStudy") });
  $("#currentStudyAddress").val(study.name);
  $("#currentStudyTitle").val(study.title);
}

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
}

Template.edit.onRendered(function () {
  Session.set("currentStudy", $("#studiesDropDown option:selected").val());
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
  studyTitle: function () {
    var studyName = Session.get("currentStudy");
    var study = Studies.findOne({ name: studyName });
    return study.title;
  },
  studyAddress: function () {
    var studyName = Session.get("currentStudy");
    var study = Studies.findOne({ name: studyName });
    return study.name;
  },
  images: function () {
    var study = Studies.findOne({ name: Session.get("currentStudy") });
    var imageURLs = [];
    for (var i = 0; i < study.imageArray.length; i++) {
      var imageFile = Images.findOne({_id: study.imageArray[i]});
      imageURLs[i] = imageFile.url();
    }
    return imageURLs;
  }
});

Template.edit.events({
  "change #studiesDropDown": function () {
    Session.set("currentStudy", $("#studiesDropDown option:selected").val());
  },
  "click #editStudy": function () {
    // make fields editable
    setFieldsReadOnly(false);
    displayCancelSaveButton();
  },
  "click #cancelStudy": function () {
    // reset variables manually, not reactive here as currentStudy unchanged
    resetAllFields();
    setFieldsReadOnly(true);
    displayEditButton();
  },
  "click #saveStudy": function () {
    if (saveAllFields()) {
      setFieldsReadOnly(true);
      displayEditButton();
    }
  }
});