Template.words.helpers({
  words: function () {
    return Words.find({ language: Session.get("language") });
  }
});

Template.word.helpers({

  checked: function () {
    //return "checked";
    if (UserWords.findOne({ word: this.word })) {
      return "checked";
    } else {
      return "";
    }
  }
});

Template.word.events({
  "change .wordBox": function () {
    //alert(this.word + " " + event.target.checked);
    if (event.target.checked) {
      // add word to user words
      Meteor.call("insertUserWord", this.word, this.language);
    } else {
      // drop word from user words
      Meteor.call("removeUserWord", this.word, this.language);
    }
  }
});