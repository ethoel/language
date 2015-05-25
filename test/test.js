Router.route("/test", function () {
  
  this.wait(Meteor.subscribe("questions"));
  this.wait(Meteor.subscribe("words"));
  this.wait(Meteor.subscribe("languages"));
  
  if (this.ready()) {
    this.render();
    this.render("/languages", { to: "languages" });
  } else {
    this.render("/loading");
  }
});

Router.route("/test/:_id", function () {
  
  this.wait(Meteor.subscribe("questions"));
  this.wait(Meteor.subscribe("words"));
  this.wait(Meteor.subscribe("languages"));
  
  if (this.ready()) {
    this.render("/test", { data: function () { return Questions.findOne({_id: this.params._id}) }});
    this.render("/languages", { to: "languages" });
  } else {
    this.render("/loading");
  }
});

if (Meteor.isClient) {
  Template.test.helpers({
    test: function () {
      return "กั้ว".toLowerCase();
    }
  });
};