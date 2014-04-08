/* GET home page. */
var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');



module.exports = function(app) {
  app.get('/', function(req, res) {
    Post.getAll(null, function(err, posts) {
      if(err) {
        posts = [];
      }
      res.render('index', { 
        title: 'Home',
        user: req.session.user,
        posts: posts,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });

  app.get('/reg', checkNotLogin);
  app.get('/reg', function(req, res) {
    res.render('reg', { 
      title: 'Register',
      user: req.session.user,
      posts: posts,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    if(password != password_re) {
      req.flash('error', "Password and Password-confirm didn't match !");
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: req.body.name,
      password: password,
      email: req.body.email
    });

    User.get(newUser.name, function(err, user) {
      if(user) {
        req.flash('error', 'User existed!');
        return res.redirect('/reg');
      }
      newUser.save(function(err, user) {
        if(err) {
          req.flash('error', err)
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', 'Register successful!');
        res.redirect('/');
      })
    })
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function(err, user) {
      if(err) {
        req.flash('error', 'User not exist!')
        return res.redirect('/login');
      }
      if(password != user.password) {
        req.flash('error', 'Password incorrect!');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', 'Login success!');
      res.redirect('/');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function(req, res) {
    res.render('post', {title: 'Post'});
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function(err) {
      if(err) {
        req.flash('error', err);
        return redirect('back');
      }
      req.flash('success', 'Post success!');
      res.redirect('/');
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', 'Logout success!');
    res.redirect('/');
  });

  app.get('/upload', checkLogin);
  app.get('/upload', function(req, res) {
    res.render('upload', {
      title: 'Upload',
      user: req.session.user,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });

  app.post('/upload', checkLogin);
  app.post('/upload', function(req, res) {
    for(var i in req.files) {
      if(req.files[i].size == 0) {
        fs.unlinkSync(req.files[i].path);
        console.log('remove');
      } else {
        var target_path = './public/images/' + req.files[i].name;
        fs.renameSync(req.files[i].path, target_path);
        console.log('save');

      }
    }
    req.flash('success', 'Upload success!');
    res.redirect('/upload');
  });

  app.get('/u/:name', function(req, res) {
    User.get(req.params.name, function(err, user) {
      if(err) {
        req.flash('error', "can't find this user!");
        return res.redirect('/');
      }
      Post.getAll(user.name, function(err, posts) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
          user: req.session.user,
          success: req.flash('success'),
          error: req.flash('error')
        });
      });
    });
  });

  app.get('/u/:name/:day/:title', function(req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('erro')
      });
    });
  });
  function checkLogin(req, res, next) {
    if(!req.session.user) {
      req.flash('error', 'Please Login!');
      return res.redirect('/login');
    }
    next();
  };

  function checkNotLogin(req, res, next) {
    if(req.session.user) {
      req.flash('error', 'Already login!');
      return res.redirect('back');
    }
    next();
  }
};
