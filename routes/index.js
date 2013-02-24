var ig = require('instagram-node').instagram(),
    db = require('../models');

ig.use({
  client_id: 'd7bf887316474af993f7b9ca662eb988',
  client_secret: '97489a83465e4a6e827040cf43e8cfeb'
});

module.exports.create = function (app) {
  
  app.get('/authorize', function(req, res, next) {
    res.redirect(ig.get_authorization_url('http://instajuan.nodejitsu.com/handleAuth', { scope: ['basic'] }));
  });

  app.get('/handleAuth', function(req, res) {
    ig.authorize_user(req.query.code, 'http://instajuan.nodejitsu.com/handleAuth', function(err, result) {
      var username = result.user.username,
          name = result.user.full_name,
          access_token = result.access_token,
          bio = result.user.bio,
          profile_picture = result.user.profile_picture,
          id = result.user.id;

      db.User.findOne({username: username}, function(err,user) {
        if (!user) {
          user = new db.User();
          user.username = username;
        }

        user.bio = bio;
        user.accessToken = access_token;
        user.profileImage = profile_picture;
        user.name = name;
        user.id = id;

        user.save(function(err){
          req.session.user = user;

          res.redirect('/followers');
        })
      });
      // res.json(result); 
    });
  });  

  app.get('/followers', function(req, res) {
    var user = req.session.user;

    ig.user_followers(user.id, function(err, followers, pagination, limit) {
      var followersCount = followers.length;

      ig.user_follows(user.id, function(err, follows, pagination, limit) {
        var followingCount = follows.length;

        res.render('followers', {
          followers: followers,
          follows: follows,
          followersCount: followersCount,
          followingCount: followingCount,
          title: 'Followers'
        });
      });
    });
  });
  

  app.get('/', function (req, res) {
    res.render('index', {
      title: "home"
    });
  });

  // views code start here
  app.get('/explore', function (req, res, next) {
    ig.media_popular(function(err, medias, limit) {
      if (err) {
        console.log(err);
        // Explain error handling w/ next()
        return next(err);
      }

      console.log(require('util').inspect(medias));

      res.render('explore', {
        title: 'explore',
        medias: medias
      });
    });
  });

  // Illustrate route parameters
  app.get('/location/:latitude/:longitude', function (req, res, next) {
    var lat = Number(req.param('latitude'))
    var lng = Number(req.param('longitude'))

    ig.location_search({ lat: lat, lng: lng }, function(err, result, limit) {
      if (err) {
        console.log(err);
        return next(err);
      }

      if (result.length == 0) {
        return res.send('empty');
      }

      var location = result[0]
 
      ig.location_media_recent(location.id, function(err, result, pagination, limit) {
  if (err) {
    console.log(err);
    return next(err);
  }

        console.log(require('util').inspect(result));
        console.log(require('util').inspect(limit));

        res.render('location', {
          title: 'location',
          medias: result,
          location: location
        });
      });
    });
  });
}