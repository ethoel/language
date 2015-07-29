Template.review.helpers({
  number: function () {
    return UserWords.find({ language: Session.get("language") }).count();
  },
  
  language: function () {
    return Session.get("language");
  },
  
  first: function () {
    // set array for words to review TODO add date etc
    var reviewWords = UserWords.find({ language: Session.get("language" )}).fetch();
    Session.set("reviewWords", reviewWords);
    Session.set("current", 0);
    return Questions.findOne({ word: reviewWords[0].word })._id;
  }
});

// do I need to use a tracker autofunction for the above?