Template.words.helpers({
  words: function () {
    return Words.find({});
  },
  
  languages: function () {
    return Languages.find({});
  }
});