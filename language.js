// TODO README.md, LICENSE.md, and .gitignore

Meteor.methods({
  addQuestion: function (question) {
    //TODO idiot proof this method
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
    
    // TODO support multiple questions per word
    var questionIds = [];
    questionIds.push(questionId);
    
    Words.insert({
      word: question.word,
      questionIds: questionIds
    });
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