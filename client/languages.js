Meteor.startup(function () {
  Session.setDefault("language", "english");
});

Template.languages.helpers({
  languages: function () {
    return Languages.find({});
  }
});

Template.languages.events({
  "change select": function (event) {
    Session.set("language", event.target.value);
  }
});

Template.language.helpers({
  selected: function () {
    return (this.language === Session.get("language"));
  }
});