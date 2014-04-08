var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  name: String,
  title: String,
  post: String,
  time: mongoose.Schema.Types.Mixed
}, {
  collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);

function Post(name, title, post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;
Post.prototype.save = function(callback) {
  var date = new Date();
  var time = {
    date: date,
    year : date.getFullYear(),
    month : date.getFullYear() + "-" + (date.getMonth() + 1),
    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  };
  var post = {
    name: this.name,
    time: time,
    title: this.title,
    post: this.post
  };

  var newPost = postModel(post);
  newPost.save(function(err, post) {
    if(err) {
      return callback(err);
    }
    callback(null, post);
  });
};

Post.get = function(name, callback) {
  postModel.find({
    name: name
  }, function(err, posts) {
    if(err) {
      return callback(err);
    }
    callback(null, posts);
  });
};