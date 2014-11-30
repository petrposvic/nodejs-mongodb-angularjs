var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: String,
	password: String,
	authToken: String,
	token: String,
	validity: Number
});

module.exports = mongoose.model('User', UserSchema);
