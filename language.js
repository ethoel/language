// TODO README.md, LICENSE.md, and .gitignore
Words = new Mongo.Collection("words");
Questions = new Mongo.Collection("questions");

if (Meteor.isClient) {
  // load youtube iframe api
  YT.load();
  
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
            console.log("hello");
            event.target.seekTo(Session.get("question").startSeconds, true);
          }
        },
        "onReady": function (event) {
          cueQuestion(event.target);
        }
      }
    });
  };
  
  // session variables
  Session.setDefault("answer", "Answer");
  Session.setDefault("words", Words.find({}).fetch());
  Session.setDefault("current", 0);
  // also choices, question
  
  // cue a question on player
  var cueQuestion = function (player) {
    // grab new current question
    var current = Session.get("current");
    var words = Session.get("words");
    var question = Questions.findOne({ word: words[current].word });
    
    // set the current question
    Session.set("question", question);
    
    // cue video. start seconds will be set when video is started
    player.cueVideoById({
        "videoId": question.videoId,
        "endSeconds": question.endSeconds
    });
    
    // generate and set multiple choice for question from all words user
    // is trying to learn, not just those in this set
    var allWords = Words.find({}).fetch();
    var choices = LTools.getChoices(allWords, 2, words[current]);
    Session.set("choices", choices);
  };
  
//  // to get the timing right the video has to be loaded first
//  var videoLoaded = false;
//  onPlayerStateChange = function (event) {
//    if (event.data == YT.PlayerState.PLAYING)
//    {
//      if (videoLoaded) {
//        event.target.seekTo(42, true);
//        setTimeout(function () { event.target.pauseVideo() }, 2500);
//      } else {
//        event.target.pauseVideo();
//        videoLoaded = true;
//        event.target.playVideo();
//      }
//    }
//  };
  
  
  Meteor.startup(function () {
    
  });
  
  Template.body.helpers({
    // temporary list of quiz sentences
//    words: [
//      { word: "I don't know what I'm doing" },
//      { word: "When is the real thing coming" },
//      { word: "มึงเห็นไอ้คนที่เลี้ยงบาสอยู่นั้นป่ะ" }
//    ],
//    
//    word: function () {
//      return Session.get("word");
//    },
    
    // chosen answer
    answer: function () {
      return Session.get("answer");
    },
    
    question: function () {
      var current = Session.get("current");
      var words = Session.get("words");
      console.log("function question, current =" + current);
      return words[current].word;
    },
    
    choices: function () {
      return Session.get("choices");
    }
  });
  
  Template.body.events({
    //debugging function
    "click #debug-button": function () {
      Session.set("answer", "Answer");
      Session.set("words", Words.find({}).fetch());
      Session.set("current", 0);  
    },
    
    "change #answer": function () {
      Session.set("answer", event.target.value);
      console.log(event.target.value);
    },
    
    "change #speed": function (event) {
      //TODO fix this--resets after clicking next
      player.setPlaybackRate(event.target.value);
      console.log(event.target.value);
    },
    
    "click #next": function (event) {
      // increment current
      var current = Session.get("current");
      var words = Session.get("words");
      current = (current + 1) % words.length;
      Session.set("current", current);
      // cue next question
      cueQuestion(player);
    },
    
    "submit #addVideoForm": function (event) {
      var videoId = event.target.videoId.value;
      var word = event.target.word.value;
      
      var questionId = Questions.insert({
        word: word,
        videoId: videoId
      });
      
      var questionIds = [];
      questionIds.push(questionId);
      
      Words.insert({
        word: word,
        questionIds: questionIds
      });
      
      console.log("adding video " + videoId + " for " + word);
      return false;
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
  });
}
