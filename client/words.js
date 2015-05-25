Template.words.helpers({
  words: function () {
    return Words.find({ language: Session.get("language") });
  }
});