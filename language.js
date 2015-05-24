// TODO README.md, LICENSE.md, and .gitignore

Meteor.methods({
  addQuestion: function (question) {
    //TODO idiot proof this method
    var result;
    
    if (question.sentence.indexOf(question.word) === -1) {
      // word is not a substring of sentence
      result = '"' + question.word + '" is not in "' + question.sentence + '"';
    } else if (!(parseInt(question.startSeconds) < parseInt(question.endSeconds))) { 
      result = "End seconds should be greater than start seconds";
    } else {
      
      var questionId = Questions.insert({
        word: question.word,
        sentence: question.sentence,
        translation: question.translation,
        videoId: question.videoId,
        startSeconds: question.startSeconds,
        endSeconds: question.endSeconds,
        explanation: "Explanation",
        verified: false,
        likes: 0,
        createdAt: new Date()
      });

      Words.upsert({ word: question.word }, {$push: { questionIds: questionId }});

      result = "Submitted";
    }
    return result;
  }
});

Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/", function () {
  this.redirect("/question");
});

Router.route("/question", function () {
  this.wait(Meteor.subscribe("questions"));
  this.wait(Meteor.subscribe("words"));
  
  if (this.ready()) {
    this.render();
  } else {
    this.render("/loading");
  }
});

Router.route("/words", function() {
  this.wait(Meteor.subscribe("words"));
  if (this.ready()) {
    this.render();
  } else {
    this.render("/loading");
  }
});

Router.route("/contribute", function () {
  this.wait(Meteor.subscribe("questions"));
  this.wait(Meteor.subscribe("words"));
  
  if (this.ready()) {
    this.render();
  } else {
    this.render("/loading");
  }
});