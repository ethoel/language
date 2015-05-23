Meteor.startup(function () {
  Session.setDefault("preview", false);
});

Template.contribute.events({

  "submit #addVideoForm": function (event) {

    Meteor.call("addQuestion", {
      word: event.target.word.value,
      sentence: event.target.sentence.value,
      translation: event.target.translation.value,
      videoId: event.target.videoId.value,
      startSeconds: event.target.startSeconds.value,
      endSeconds: event.target.endSeconds.value,
    });

    event.target.reset();
    return false;
  },
  
  // this needs to find the parent TODO of event
  "click #videoPreviewButton": function (event) {
    
    var question = {
      word: event.target.word.value,
      sentence: event.target.sentence.value,
      translation: event.target.translation.value,
      videoId: event.target.videoId.value,
      startSeconds: event.target.startSeconds.value,
      endSeconds: event.target.endSeconds.value,
    };
    Session.set("preview", true);
    Session.set("question", question);
    return false;
  }
});

Template.contribute.helpers({
  preview: function () {
    return true;
  },
  question: function () {
    return Session.get("question");
  }
});