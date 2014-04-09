var mongoose = require('mongoose');
var markdown = require('markdown').markdown;

var postSchema = new mongoose.Schema({
  name: String,
  title: String,
  post: String,
  time: mongoose.Schema.Types.Mixed,
  comments: Array,
  tags: Array
}, {
  collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);

function Post(name, title, tags, post) {
  this.name = name;
  this.title = title;
  this.post = post;
  this.tags = tags;
}

module.exports = { 
  Post: Post,
  postModel: postModel
};
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
    post: this.post,
    tags: this.tags
  };

  var newPost = postModel(post);
  newPost.save(function(err, post) {
    if(err) {
      return callback(err);
    }
    callback(null, post);
  });
};

Post.getAll = function(name, callback) {
  var query = {};
  if(name) {
    query.name = name;
  }
  postModel.find(query, null, {
    sort: {
      time: -1
    }
  }, function(err, posts) {
    if(err) {
      return callback(err);
    }
    posts.forEach(function(post) {
      post.post = markdown.toHTML(post.post);
    })
    callback(null, posts);
  });
};

Post.getOne = function(name, day, title, callback) {
  postModel.findOne({
    "name": name,
    "time.day": day,
    "title": title
  }, function(err, post) {
    if(err) { 
      return callback(err);
    }
    post.post = markdown.toHTML(post.post);
    callback(null, post);
  });
};

Post.getArchive = function(callback) {
  postModel.find(null, {
    "name": 1,
    "time": 1,
    "title": 1
  }, {
    sort: {
      time: -1
    }
  }, function(err, posts) {
    if(err) {
      return callback(err);
    }
    callback(null, posts);
  })
}

Post.edit = function(name, day, title, callback) {
  postModel.findOne({
    "name": name,
    "time.day": day,
    "title": title
  }, function(err, post) {
    if(err) {
      return callback(err);
    }
    callback(null, post);
  });
};

Post.update = function(name, day, title, post,callback) {
   postModel.update({
    "name": name,
    "time.day": day,
    "title": title
   }, { 
    "post": post
   }, function(err, post) {
    if(err) {
      return callback(err);
    }
    return callback(null, post);
   });
};

Post.remove = function(name, day, title, callback) {
  postModel.remove({
    "name": name,
    "time.day": day,
    "title": title
  }, function(err) {
    if(err) {
      return callback(err);
    }
    return callback(null);
  });
};

Post.getPaginatedBuckets = function(name, page, pageSize, callback) {
  var query = {};
  if(name) {
    query.name = name;
  }
  postModel.count(query,
   function(err, count) {
    postModel.find(query, null, {
      skip: (page -1) * pageSize,
      limit: pageSize,
      sort: {
        time: -1
      }
    }, function(err, posts) {
      if(err) {
        return callback(err);
      }
      callback(null, posts, count);
    });
  });
};

Post.getTags = function(callback) {
  postModel.distinct('tags', function(err, tags) {
    if(err) {
      return callback(err);
    }
    callback(null, tags);
  });
};

Post.getTaggedPosts = function(tag, callback) {
  postModel.find({
    "tags": tag
  }, {
    "name": 1,
    "time": 1,
    "title": 1,
  },{
    sort: {
      time: -1
    }
  }, function(err, posts) {
    if(err) {
      return callback(err);
    }
    callback(null, posts);
  });
};