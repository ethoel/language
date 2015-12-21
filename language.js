// TODO README.md, LICENSE.md, and .gitignore
Meteor.methods({
  checkOrgan: function(organ, checked) {
    Organs.upsert({
      organ: organ 
    }, { $set: {
      checked: checked,
      createdAt: new Date()
    }}, { multi: true });
  },
  // atlas project
  upsertOrgan: function(film, organ, data, checked) {
    Organs.upsert({
      film: film,
      organ: organ 
    }, { $set: {
      data: data,
      checked: checked,
      createdAt: new Date()
    }});
  }
});

Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/", function () {
  this.redirect("/atlas");
});

Router.route("/atlas", function () {
  
  this.wait(Meteor.subscribe("organs"));
  
  if (this.ready()) {
    this.render();
    
  } else {
    this.render("/loading");
  }
});

// When log in should be required
//Router.onBeforeAction(function () {
//  if (!Meteor.userId()) {
//    // user is not logged in, force log in
//    this.layout("");
//    this.render("login");
//  } else {
//    // otherwise continue routing
//    this.next();
//  }
//});
