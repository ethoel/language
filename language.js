


Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/", function () {
  this.redirect("/atlas");
});

Router.route("/atlas", function () {
  this.redirect("/atlas/case1");
});

Router.route("/atlas/:study", function () {
  
  var study = this.params.study;
  //this.wait(Meteor.subscribe("organs"));
  this.wait(Meteor.subscribe("studies"));
  //this.wait(Meteor.subscribe("tags"));
  this.wait(Meteor.subscribe("images", "", study));
  
  if (this.ready()) {
    var wholeStudy = Studies.findOne({name: study});
    if (wholeStudy && wholeStudy.public !== "private") {
      this.render("atlas");
    } else {
      this.render("unauthorized");
    }
  } else {
    this.render("/loading");
  }
});

//Router.route("/admin", function () {
//  this.redirect("/admin/test4");
//});
//
//Router.route("/admin/:study", function() {
//  this.layout("layoutAdmin");
//  
//  this.wait(Meteor.subscribe("organs"));
//  this.wait(Meteor.subscribe("studies"));
//  this.wait(Meteor.subscribe("tags"));
//  this.wait(Meteor.subscribe("images"));
//  
//  if (this.ready()) {
//    this.render("atlas");
//    
//  } else {
//    this.render("/loading");
//  }
//}, {name: 'admin.study'});

// When log in should be required
Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
  } else if (Meteor.user() && (Meteor.user().username !== "admin")) {
    this.layout("");
    this.render("unauthorized");
  } else {
    // otherwise continue routing
    this.next();
  }
}, { only: [/*'admin', 'admin.study', */'admincheck'] });

// When log in should be required
Router.onBeforeAction(function () {
  var owner = this.params.owner;
  
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
  } else if (Meteor.user() && (Meteor.user().username !== owner) && (Meteor.user().username !== "admin")) {
    this.layout("");
    this.render("unauthorized");
  } else {
    // otherwise continue routing
    this.next();
  }
}, { only: ['edit.owner', 'edit.owner.study', 'preview.owner.study'] });

Router.onBeforeAction(function () {
  var owner = this.params.owner;
  
  if (!Meteor.userId()) {
    // user is not logged in, force log in
    this.layout("");
    this.render("login");
  } else {
    // otherwise continue routing
    this.next();
  }
}, { only: ['edit'] });

Router.route("/edit", function () {
  if (Meteor.user()) {
    this.redirect("/edit/" + Meteor.user().username);
  } else {
    // TODO understand better how iron router works
    this.render("/loading");
  }
});

Router.route("/edit/:owner", function () {
  var owner = this.params.owner;
  
  this.wait(Meteor.subscribe("studies", owner));
  //this.wait(Meteor.subscribe("tags"));
  this.wait(Meteor.subscribe("images"));
  this.wait(Meteor.subscribe("usernames"));
  
  if (this.ready()) {
    this.render("edit");
    
  } else {
    this.render("/loading");
  }
}, { name: "edit.owner" });

Router.route("/edit/:owner/:study", function () {
  // TODO, delete this, render an editStudy page
  this.layout("layoutAdmin");
  
  var owner = this.params.owner;
  var study = this.params.study;
  
  this.wait(Meteor.subscribe("studies"));
  this.wait(Meteor.subscribe("images", owner, study));
  
  if (this.ready()) {
    this.render("atlas");
    
  } else {
    this.render("/loading");
  }
}, {name: 'edit.owner.study'});

Router.route("/preview/:owner/:study", function () {
  
  var owner = this.params.owner;
  var study = this.params.study;
  
  this.wait(Meteor.subscribe("studies"));
  this.wait(Meteor.subscribe("images", owner, study));
  
  if (this.ready()) {
    this.render("atlas");
    
  } else {
    this.render("/loading");
  }
}, {name: 'preview.owner.study'});

Router.route("/admincheck", function () {
  this.wait(Meteor.subscribe("studies"));
  this.wait(Meteor.subscribe("images"));
  
  if (this.ready()) {
    this.render("admin");
    
  } else {
    this.render("/loading");
  }
}, { name: 'admincheck' });
