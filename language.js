// TODO README.md, LICENSE.md, and .gitignore

Meteor.methods({
  addQuestion: function (question) {
    //TODO idiot proof this method
    var result;
    question.language = question.language.toLowerCase();
    question.word = question.word.toLowerCase();
    question.sentence = question.sentence.toLowerCase();
    question.translation = question.translation.toLowerCase();
    
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
        language: question.language,
        explanation: "Explanation",
        verified: false,
        likes: 0,
        createdAt: new Date()
      });

      Words.upsert({ 
        word: question.word,
        language: question.language
      }, {$push: { questionIds: questionId }});
      
      // insert language if doesn't exist
      if (!Languages.findOne({ language: question.language })) {
        Languages.insert({ language: question.language});
      }
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

//Router.route("/question", function () {
//  this.wait(Meteor.subscribe("questions"));
//  this.wait(Meteor.subscribe("words"));
//  this.wait(Meteor.subscribe("languages"));
//  
//  if (this.ready()) {
//    this.render();
//    this.render("/languages", { to: "languages" });
//  } else {
//    this.render("/loading");
//  }
//});
//
//Router.route("/question/:_id", function () {
//  this.wait(Meteor.subscribe("questions"));
//  this.wait(Meteor.subscribe("words"));
//  this.wait(Meteor.subscribe("languages"));
//  
//  if (this.ready()) {
//    this.render("question", { data: function () { 
//      return Questions.findOne({_id: this.params._id});
//    }});
//    this.render("languages", { to: "languages" });
//  } else {
//    this.render("loading");
//  }
//}, { name: "question" });
//
//Router.onBeforeAction(function () {
//  alert("hello hook");
//  this.next();
//}, { only: ["question"] });

// temporary first videos
//Router.route("/question", function() {
//  this.wait(Meteor.subscribe("words"));
//  this.wait(Meteor.subscribe("languages"));
//  this.subscribe("questions").wait();
//  if (this.ready()) {
//    //var questionId = Words.findOne({ language: Session.get("language") }).questionIds[0];
//    this.redirect("question", { _id: Session.get("question")._id });
//    //this.render("loading");
//  } else {
//    this.render("loading");
//  }
//}, { name: "defaultquestion" });

Router.route("/question", function () {
  this.redirect("question", { _id: Session.get("question")._id });
}, { name: "currentQuestion" });



Router.route("/question/:_id", {
  name: "question",
  yieldRegions: { "languages" : { to: "languages" } },
  subscriptions: function () {
    this.subscribe("questions").wait();
    this.subscribe("words").wait();
    this.subscribe("languages").wait();
  },
  action: function () {
    if (this.ready()) {
      Session.set("question", Questions.findOne({ _id: this.params._id }));
      this.render();
    } else {
      this.render("loading");
    }
  }
});

Router.route("/words", function() {
  this.wait(Meteor.subscribe("words"));
  this.wait(Meteor.subscribe("languages"));
  if (this.ready()) {
    this.render();
    this.render("/languages", { to: "languages" });
  } else {
    this.render("/loading");
  }
});


Router.route("/contribute", function () {
  this.wait(Meteor.subscribe("questions"));
  this.wait(Meteor.subscribe("words"));
  this.wait(Meteor.subscribe("languages"));
  
  if (this.ready()) {
    this.render();
    //this.render("/languages", { to: "languages" });
  } else {
    this.render("/loading");
  }
});