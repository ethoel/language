Meteor.startup(function () {
  Session.setDefault("preview", { 
    word: "",
    sentence: "",
    translation: "",
    videoId: "",
    startSeconds: "",
    endSeconds: ""
  });
  Session.set("contributeRendered", false);
});

Template.contribute.events({

  "submit #addVideoForm": function (event) {

    Meteor.call("addQuestion", {
      word: event.target.word.value,
      sentence: event.target.sentence.value,
      translation: event.target.translation.value,
      videoId: event.target.videoId.value,
      startSeconds: event.target.startSeconds.value,
      endSeconds: event.target.endSeconds.value
    }, function (error, result) {
      alert(result);
    });

    //event.target.reset();
    return false;
  },
  
  "change #addVideoForm": function (event) {
    
    var name = event.target.getAttribute("name");
    var preview = Session.get("preview");

    preview[name] = event.target.value;
    
    switch (name) {
      case "videoId":
        contributePlayer && contributePlayer.cueVideoById({
          videoId: preview.videoId,
          startSeconds: preview.startSeconds,
          endSeconds: preview.endSeconds
        });
        break;
      case "startSeconds":
      case "endSeconds":
        
        
        contributePlayer && contributePlayer.loadVideoById({
          videoId: preview.videoId,
          startSeconds: preview.startSeconds,
          endSeconds: preview.endSeconds
        });
        break;
    }
    
    Session.set("preview", preview);
  },
  
  "click #preview": function (event) {

    var preview = Session.get("preview");
    contributePlayer && contributePlayer.loadVideoById({
      videoId: preview.videoId,
      startSeconds: preview.startSeconds,
      endSeconds: preview.endSeconds
    });

  }
});

Template.contribute.helpers({
  preview: function () {
    return true;
  },
  question: function () {
    return Session.get("preview");
  }
});

// pDXHfmHxg_A

Tracker.autorun(function () {
  
  if (Session.get("YTApiLoaded") && Session.get("contributeRendered")) {

    contributePlayer = new YT.Player("contributePlayer", {
      playerVars: { 
        "showinfo": 0,
        "rel": 0,
        "playsinline": 1,
        "modestbranding": 1,
        "origin": "http://localhost"
      },
      // events like ready, state change
      events: {
        "onStateChange": function (event) {
          if (event.data == YT.PlayerState.PLAYING) {
            //alert(event.target.endSeconds);
            //event.target.seekTo(Session.get("preview").startSeconds, true);
            
          } else if (event.data == YT.PlayerState.ENDED) {
//            event.target.stopVideo();
//            event.target.cueVideoById({
//              videoId: preview.videoId,
//              startSeconds: preview.startSeconds,
//              endSeconds: preview.endSeconds
//            });
          }
        },
        "onReady": function (event) {
          
        }
      }
    });
  }
});

Template.contribute.onRendered(function () {
  Session.set("contributeRendered", true);
});

Template.contribute.onDestroyed(function () {
  Session.set("contributeRendered", false);
  // destroy player if it has been created
  contributePlayer && contributePlayer.destroy();
});