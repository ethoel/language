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
      
      Questions.insert({
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

      if (!Words.findOne({ word: question.word })) {
        Words.insert({
          word: question.word,
          language: question.language
        });
      }
      
      // insert language if doesn't exist
      if (!Languages.findOne({ language: question.language })) {
        Languages.insert({ language: question.language});
      }
      result = "Submitted";
    }
    return result;
  },
  
  insertUserWord: function (word, language) {
    UserWords.insert({ 
      word: word,
      language: language,
      owner: Meteor.userId()
    });
  },
  
  removeUserWord: function (word, language) {
    UserWords.remove({ 
      word: word,
      language: language,
      owner: Meteor.userId()
    });
  }
});

Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/", function () {
  this.redirect("/review");
});

//Router.route("/question", function () {
//  this.redirect("question", { _id: Session.get("question")._id });
//}, { name: "currentQuestion" });
//
Router.route("/review", function () {
  this.wait(Meteor.subscribe("languages"));
  this.wait(Meteor.subscribe("userWords"));
  this.subscribe("questions").wait();
  if (this.ready()) {
    this.render();
    this.render("languages", { to: "languages" });
  } else {
    this.render("loading");
  }
});



Router.route("/question/:_id", {
  name: "question",
  subscriptions: function () {
    this.subscribe("questions").wait();
    this.subscribe("words").wait();
    //this.subscribe("languages").wait();
    this.subscribe("userWords").wait();
  },
  action: function () {
    if (this.ready()) {
      Session.set("question", Questions.findOne({ _id: this.params._id }));
      this.render();
    } else {
      this.render("loading");
    }
  }
//  , in case some one types it in before reviewWords is set
  // TODO unlikely but still possible
//  onBeforeAction: function () {
//    alert("BEFORE Q");
//    if (!Session.get("reviewWords")) {
//      this.redirect("review");
//    };
//    alert("BEFORE Q 2");
//    this.next();
//  }
});

Router.route("/words", function() {
  this.wait(Meteor.subscribe("words"));
  this.wait(Meteor.subscribe("languages"));
  this.wait(Meteor.subscribe("userWords"));
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

Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
  } else {
    // otherwise continue routing
    this.next();
  }
});
