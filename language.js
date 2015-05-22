// TODO README.md, LICENSE.md, and .gitignore


if (Meteor.isClient) {
  var wordsHandle = Meteor.subscribe("words");
  var questionsHandle = Meteor.subscribe("questions");
  
    // session variables
  Session.setDefault("words", Words.find({}).fetch());
  Session.setDefault("current", 0);
  // also answer, choices, question
  

  
  // youtube api will call onYouTubeIframeAPIReady() when API ready
  // make sure it's a global variable
  onYouTubeIframeAPIReady = function () {
    // new video player, the first argument is the id of the div
    // make sure it's a global variable
    player = new YT.Player("player", {
      //height: "0", 
      //width: "0", 
      //http://www.youtube.com/watch?v=LdH1hSWGFGU, videoId = "LdH1hSWGFGU")
      //videoId: "IhOtFuo_kdI",
      playerVars: { 
        "controls": 0,
        "showinfo": 0,
        //"end": 45,
        "rel": 0,
        "playsinline": 1,
        "modestbranding": 1,
        "origin": "http://localhost"
      },
      // events like ready, state change
      events: {
        "onStateChange": function (event) {
          if (event.data == YT.PlayerState.PLAYING) {
          
            event.target.seekTo(Session.get("question").startSeconds, true);
          }
        },
        "onReady": function (event) {
          //alert("Hello 2");
          cueQuestion(event.target);
        }
      }
    });
  };
  
  // load youtube iframe api
  //alert("Hello 1");
  YT.load();

  
  // cue a question on player
  var cueQuestion = function (player) {
    // grab new current question
    //alert("Hello 3");
    
    var current = Session.get("current");

    //var words = Session.get("words");
    var wordfind = Words.find({});
    //alert("Words.find({}) " + wordfind);
    var words;
    
    words = wordfind.fetch();
      //alert("is words undefined? " + words + " is wordfind undefined? " + wordfind);
    //alert("Hello 4");
    //alert("current " + current);
    //alert("Words " + Words);
    //alert("words " + words);
    //alert("words[current]" + words[current]);
    //alert("words[current].word " + words[current].word);
    // TODO what the fuck is wrong after deploy?
    var question = Questions.findOne({ word: words[current].word });
    
     //alert("Hello 5");
    
    
    // set the current question
    Session.set("question", question);
    
    
    
    // cue video. start seconds will be set when video is started
    player.cueVideoById({
        "videoId": question.videoId,
        "startSeconds": question.startSeconds,
        "endSeconds": question.endSeconds
    });
    
    // generate and set multiple choice for question from all words user
    // is trying to learn, not just those in this set
    var allWords = Words.find({}).fetch();
    var choices = LTools.getChoices(allWords, 2, words[current]);
    Session.set("choices", choices);
    
    // reset the page for new question
    document.getElementById("choices").reset();
    document.getElementById("speed").reset();
    Session.set("answer", "Select an answer");
  };
  
  Meteor.startup(function () {
    
  });
  
  Template.body.helpers({
    
    // chosen answer
    answer: function () {
      return Session.get("answer");
    },
    
    sentence: function () {
      var question = Session.get("question"); 
      var sentence = question.sentence;
      var word = question.word;
      
      return LTools.replaceAll(word, "___", sentence);
    },
    
    choices: function () {
      return Session.get("choices");
    },
    
  });
  
  Template.body.events({
    //debugging function
    "click #debug-button": function () {
      Session.set("answer", "Select an answer");
      Session.set("words", Words.find({}).fetch());
      Session.set("current", 0);  
    },
    
    "change #choices": function (event) {
      Session.set("answer", event.target.value);
      console.log(event.target.value);
    },
    
    "change #speed": function (event) {
      //TODO fix this--resets after clicking next
      player.setPlaybackRate(event.target.value);
      console.log(event.target.value);
    },
    
    "click #next": function (event) {
      // make sure correct answer has been selected
      if (Session.get("answer") === "Correct") {
        // advance to next question
        // increment current
        var current = Session.get("current");
        //var words = Session.get("words");
        var words = Words.find({}).fetch();
        current = (current + 1) % words.length;
        Session.set("current", current);
        // cue next question
        cueQuestion(player);
      } else {
        Session.set("answer", "Select correct answer");
      }
    }
  });
  
/*  // counter starts at 0
  Session.setDefault("counter", 2);

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.events({
    "click button": function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });*/
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish("words", function () {
      return Words.find();
    });
    
    Meteor.publish("questions", function () {
      return Questions.find();
    });
  });
}

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


Router.route("/", function () {
  this.render("home");
});

Router.route("/words");

Router.route("/contribute");