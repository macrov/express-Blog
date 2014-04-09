var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blog');

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
}, {
  collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
  var user = { 
    name: this.name,
    password: this.password,
    email: this.email
  };

  var newUser = userModel(user);

  newUser.save(function(err, user) {
    if(err) {
      return callback(err);
    }

    return callback(null, user);
  });
};

User.get = function(name, callback) {
  userModel.findOne({
    name: name
  }, function(err, user) {
    if(err) {
      return callback(err);
    } else if (user == null) {
      return callback('User not find!');
    }
    return callback(null, user);
  });
};