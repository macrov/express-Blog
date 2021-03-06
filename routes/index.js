/* GET home page. */
var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    Post = require('../models/post.js').Post,
    Comment = require('../models/comment.js');



module.exports = function(app) {
  app.get('/', function(req, res) {
    var page = req.query.page ? parseInt(req.query.page) : 1,
        pageSize = req.query.pagesize ? parseInt(req.query.pagesize) : 10;
    console.log(req.query.page + ':' + req.query.pagesize);    
    console.log('page:' + page);
    console.log('pagesize' + pageSize);  
    Post.getPaginatedBuckets(null, page, pageSize, function(err, posts, count) {
      if(err) {
        posts = [];
      }
      console.log("count:" + count);
      res.render('index', { 
        title: 'Home',
        user: req.session.user,
        posts: posts,
        page: page,
        isFirstPage: (page -1) == 0,
        isLastPage: ((page -1) * pageSize + posts.length) == count,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });

  app.get('/tags', function(req, res) {
    Post.getTags(function(err, tags) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tags', {
        title: 'Tags',
        tags: tags,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });

  app.get('/tags/:tag', function(req, res) {
    Post.getTaggedPosts(req.params.tag, function(err, posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('tag', {
        title: 'TAGS:' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });

  app.get('/search', function(req, res) {
    Post.search(req.query.keyword, function(err, posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('search', {
        title: "SEARCH : " + req.query.keyword,
        posts: posts,
        user: req.session.user,
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
    res.render('post', {
      title: 'Post',
      user: req.session.user,
      success: req.flash('success'),
      error: req.flash('error')
      });
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        post = new Post(currentUser.name, req.body.title, tags, req.body.post);
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

  app.get('/archive', function(req, res) {
    Post.getArchive(function(err, posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('archive', {
        title: 'Archive',
        posts: posts,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });
  app.get('/u/:name', function(req, res) {
    User.get(req.params.name, function(err, user) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      Post.getAll(req.params.name, function(err, posts) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        console.log(user.email_MD5);
        res.render('user', {
          title: user.name,
          email_MD5: user.email_MD5,
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

  app.post('/u/:name/:day/:title', function(req, res) {
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() +1) + "-" + date.getDate() + " " +
               date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = { 
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    console.log(comment);
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    console.log(newComment);
    newComment.save(function(err) {
      if(err) {
        console.log('err');
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', 'Comment successful!');
      res.redirect('back');
    });
  });
  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: "Edit",
        post: post,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  });

  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function(err) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', 'Update successful!');
      res.redirect('/u' + '/' + currentUser.name + '/' + req.params.day + '/' + req.params.title);
    });
  });

  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function(req, res) {
    Post.remove(req.params.name, req.params.day, req.params.title, function(err) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', 'Remove successful!');
      res.redirect('/');
    });
  });

  app.use(function(req, res) {
    res.render("404");
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
  };
};
