
// for IE
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  console.log("No indexOf");
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = fromIndex | 0;

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}

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
      organs: { organ: organ, color: "rgba(12,34,56,0.78)",
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


      if (newVisibility !== "public" && 
          newVisibility !== "private" && 
          newVisibility !== "link only") {
        // securing code from losers
        newVisibility = "public";
      }

      Studies.update({ name: studyName 
      }, { $set: { "public": newVisibility }});
      console.log("Setting public to " + newVisibility );
    
  },
  setStudyVerified: function(studyName, newVerified) {
    // find the organ named organName in the study named studyName
    if (Meteor.user().username === "admin") {
      Studies.update({ name: studyName 
      }, { $set: { "verified": newVerified }});
      console.log("Setting verified to " + newVerified );
    }
  },
  setStudyOwner: function(studyName, newOwner) {
    // find the organ named organName in the study named studyName
    if (Meteor.user().username === "admin") {
      Studies.update({ name: studyName 
      }, { $set: { "owner": newOwner }});
      console.log("Setting owner to " + newOwner );
    }
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
    //fight losers

    duplicate = Studies.findOne({ name: newStudyName });
    if (newStudyName.match(/^[a-z0-9]+$/) && !duplicate) {
      // valid
      Studies.update({ name: studyName 
      }, { $set: { "name": newStudyName }});
      console.log("Renaming " + newStudyName );
    } else {
      // abort save

    }
  },
  createNewStudy: function(newStudyName) {
    //fight losers

    duplicate = Studies.findOne({ name: newStudyName });
    if (newStudyName.match(/^[a-z0-9]+$/) && !duplicate) {
      // valid
      Studies.insert({ name: newStudyName, createdAt: new Date() });
      console.log("Creating new study " + newStudyName );
    } else {
      //abort save

    }
  },
  bigCreateNewStudy: function(newStudyName, newVisibility, newVerified, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription, editStudyTags, editImageArray, firstImageHeight, firstImageWidth) {
    //fight insecurity
    duplicate = Studies.findOne({ name: newStudyName });
    if (newStudyName.match(/^[a-z0-9]+$/) && !duplicate) {
      // valid
      Studies.insert({ name: newStudyName, createdAt: new Date() }, function (error, study_id) {
        if (study_id) {
          completeSaveOf(newStudyName, newVisibility, newVerified, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription, editStudyTags, editImageArray, firstImageHeight, firstImageWidth);
        }
      });
      console.log("Attempted to create big new study " + newStudyName );
      return true;
    } else {
      //abort save
      console.log("Save aborted");
      return false;
    }
  },
  bigRenameStudy: function(studyName, newStudyName, newVisibility, newVerified, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription, editStudyTags, editImageArray, firstImageHeight, firstImageWidth) {
    // find the organ named organName in the study named studyName
    // remove that organ from the organs array
    //fight losers
    if (newStudyName.match(/^[a-z0-9]+$/)) {
      // valid
      Studies.update({ name: studyName }, { $set: { "name": newStudyName }}, { upsert: false }, function (error, count) {
        if (count) {
          completeSaveOf(newStudyName, newVisibility, newVerified, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription, editStudyTags, editImageArray, firstImageHeight, firstImageWidth);
        }
      });
      console.log("Attempted renaming big " + newStudyName );
      return true;
    } else {
      // abort save
      console.log("Save aborted");
      return false;
    }
  },
  saveStudyImagesArray: function(studyName, newImageArray) {
      // TODO, so new array, need to update the organ arrays if not a new study, ugh
      // maybe create a better data structure in the future to avoid this!
      var study = Studies.findOne({ name: studyName });
      if (study) {
        var oldImageArray = study.imageArray;
        if (!oldImageArray) { oldImageArray = []; }
        var organs = study.organs;

        for (var k = 0; organs && k < organs.length; k++) {
          // update the data array for each organ
          var newDataArray = [];
          var oldDataArray = organs[k].data;

          for (var i = 0; i < newImageArray.length; i++) {
            // find the old index of the image at i, move data at old index to i
            var oldIndex = oldImageArray.indexOf(newImageArray[i]);
            newDataArray.push(oldDataArray[oldIndex]);
          }

          // set the data array in database
          var key = "organs." + k + ".data";
          var newData = {};
          newData[key] = newDataArray; // newData = { organs.k.data: newDataArray }
          Studies.update({ name: studyName }, { $set: newData });
        }
      }

      // for each image, link with studyName so that not all images need to be
      // loaded when studyName is loaded, only associated images. improve speed
      for (var i = 0; i < newImageArray.length; i++) {
        Images.update({ _id: newImageArray[i] }, {$set: { "metadata.studyName": studyName } });
      }

      // update the array
      Studies.update({ name: studyName }, { $set: { "imageArray": newImageArray }});
      //console.log("New array " + newImageArray );
  },
  updateFirstHeightWidth: function(studyName, height, width) {
    // update the array

      Studies.update({ name: studyName }, { $set: { "firstImageHeight": height, "firstImageWidth": width }});

  },
  deleteStudy: function(studyName) {
    // delete images
    // find study
    var studyToDelete = Studies.findOne({name: studyName});
    if (!studyToDelete) { console.log("DELETE aborted"); return; }
    
    // remove studyName and associated imaging
    var imagesToDelete = studyToDelete.imageArray;
    var deleteError = 0;
    for (var i = 0; imagesToDelete && i < imagesToDelete.length; i++) {
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

var completeSaveOf = function (currentStudy, newVisibility, newVerified, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription, editStudyTags, editImageArray, firstImageHeight, firstImageWidth) {
  // public is default
  if (newVisibility !== "public" && 
      newVisibility !== "private" && 
      newVisibility !== "link only") {
    newVisibility = "public";
  }

  Studies.update({ name: currentStudy }, { $set: 
                                       { "public": newVisibility }
                                      });
  console.log("Setting public to " + newVisibility );
  
  // TODO: get rid of the calls
  
  Meteor.call("setStudyVerified", currentStudy, newVerified, function () { console.log("Study set verified callback"); });
  
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
  Meteor.call("updateFirstHeightWidth", currentStudy, firstImageHeight, firstImageWidth);
    
  // save images to Study
  Meteor.call("saveStudyImagesArray", currentStudy, editImageArray, function () {
    console.log("Image array saved");
  });
};

//
//var completeSaveOf = function (currentStudy, newStudyTitle, newStudyOwner, newStudyCredit, newStudyDescription) {
//  Meteor.call("setStudyVisibility", currentStudy, $("#publishDropDown option:selected").val(), function () { console.log("Study visibility callback"); });
//  
//  Meteor.call("setStudyVerified", currentStudy, $("#verifiedCheckbox").prop("checked"), function () { console.log("Study set verified callback"); });
//  
//  Meteor.call("retitleStudy", currentStudy, newStudyTitle, function () {
//    console.log("Study retitled callback");
//  });
//
//  
//  Meteor.call("setStudyOwner", currentStudy, newStudyOwner, function () { console.log("Study set owner callback"); });
//  
//  Meteor.call("setStudyCredit", currentStudy, newStudyCredit, function () { console.log("Study set credit callback"); });
//  
//  Meteor.call("setStudyDescription", currentStudy, newStudyDescription, function () { console.log("Study set description callback"); });
//  
//  // save new tags to Tags database
//  
//  // save tags to Study
//  Meteor.call("saveStudyTags", currentStudy, editStudyTags, function () {
//    console.log("Study tags saved");
//  });
//  
//  // height and width of first image
//  if (editImageArray && editImageArray.length > 0) {
//    var firstImageFile = Images.findOne({ _id: editImageArray[0] });
//    var firstImage = new Image();
//    firstImage.onload = function () {
//      continueCompleteSaveOf(currentStudy, this.height, this.width);
//    }
//    firstImage.src = firstImageFile.url();
//  } else {
//    continueCompleteSaveOf(currentStudy, 0, 0);
//  }
//}

//var continueCompleteSaveOf = function (currentStudy, firstImageHeight, firstImageWidth) {
//  Meteor.call("updateFirstHeightWidth", currentStudy, firstImageHeight, firstImageWidth);
//    
//  // save images to Study
//  Meteor.call("saveStudyImagesArray", currentStudy, editImageArray, unsavedImages, toDeleteImages, function () {
//    console.log("Image array saved");
//  });
//  
//  Meteor.call("endSave", function (error, saveAborted) {
//    if (saveAborted) {
//      // delete images that have been added but are not in study.imageArray
//      deleteUnsavedImages();
//      // the images prepared for deletion will be deleted when the study is deleted
//      toDeleteImages = [];
//    } else {
//      // delete images that have been deleted
//      deleteImagesPreparedForDeletion();
//      // clear unsaved images, they have now been saved
//      unsavedImages = [];
//    }
//  });
//  
//  
//  
//  
//};