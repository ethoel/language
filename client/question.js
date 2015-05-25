// youtube api will call onYouTubeIframeAPIReady() when API ready
// make sure it's a global variable
onYouTubeIframeAPIReady = function () {
  Session.set("YTApiLoaded", true);
};

Meteor.startup(function () {
  // set up youtube api and player
  Session.set("YTApiLoaded", false);
  Session.set("questionRendered", false);
  Session.set("playerReady", false);
  YT.load();

  // set default session variables
  Session.setDefault("words", Words.find({}).fetch());
  Session.setDefault("current", 0);
  // also answer, choices, question
});

Tracker.autorun(function () {
  if (Session.get("YTApiLoaded") && Session.get("questionRendered")) {
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
          //cueQuestion(event.target);
          Session.set("playerReady", true);
        }
      }
    });
  }
});



// TODO are autoruns really the best way to do this?
Tracker.autorun(function () {
  if (Session.get("playerReady")) {
    // reload video when question is changed
    var language = Session.get("language");
    var question = Session.get("question");
    
    if (language !== question.language) {
      
      // TODO this needs to be changed in the future
      Session.set("current", 0);
      Router.go("question", { _id: Words.findOne({ language: language }).questionIds[0] });
      
    } else {
    
    
      //alert("AUTORUN " + question.word);
      // cue question
      cueQuestion(question);
    }
  }
});

Template.question.onRendered(function () {
  Session.set("questionRendered", true);
});

Template.question.onDestroyed(function () {
  Session.set("questionRendered", false);
  Session.set("playerReady", false);
  // destroy player if it has been created
  player && player.destroy();
});


// cue a question on player
var cueQuestion = function (question) {

  // cue video. start seconds will be set when video is started
  player && player.cueVideoById({
      "videoId": question.videoId,
      "startSeconds": question.startSeconds,
      "endSeconds": question.endSeconds
  });

  // generate and set multiple choice for question from all words user
  // is trying to learn, not just those in this set
  // TODO idiot proof this
  var allWords = Words.find({ language: Session.get("language") }).fetch();
  var numberChoices = 4;
  if (allWords.length < 4) {
    numberChoices = allWords.length - 1;
  }
  var choices = LTools.getChoices(allWords, numberChoices, question.word);
  Session.set("choices", choices);

  // reset the page for new question
  document.getElementById("choices").reset();
  document.getElementById("speed").reset();
  Session.set("answer", "Select an answer");
};

Template.question.helpers({

  // chosen answer
  answer: function () {
    return Session.get("answer");
  },

//  sentence: function () {
//    var question = Session.get("question"); 
//    var sentence = question.sentence;
//    var word = question.word;
//
//    return LTools.replaceAll(word, "___", sentence);
//  },

  choices: function () {
    return Session.get("choices");
  }

});

Template.question.events({

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

      var words = Words.find({ language: Session.get("language") }).fetch();
      current = (current + 1) % words.length;
      

      Session.set("current", current);
      // cue next question

      Router.go("question", { _id: words[current].questionIds[0] });

      
    } else {
      Session.set("answer", "Select correct answer");
    }
  }
});