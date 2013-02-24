var mongoose = require("mongoose"),
	UserSchema = require('./user');

var uri = 'mongodb://juanfiguera:nodejs@linus.mongohq.com:10062/InstaJuan';

mongoose.connect(uri);

var User = mongoose.model('User', UserSchema);

module.exports.User = User;
module.exports.uri = uri;