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
  }
});