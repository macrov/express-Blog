var mongoose = require('mongoose');
var postModel = require('./post.js').postModel;

function Comment(name, day, title, comment) {
  this.name = name;
  this.day = day;
  this.title = title;
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
  console.log('in commnet save');
  postModel.update({
    "name": this.name,
    "time.day": this.day,
    "title": this.title
  }, {
    $push: { "comments": this.comment}
  }, function(err, post) {
    if(err) {
      console.log("comment.save err");
      return callback(err);
    }
    console.log("comment.save success");
    return callback(null);
  });
};