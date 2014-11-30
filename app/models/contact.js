var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'UserSchema'},
	firstName: String,
	lastName: String,
	street: String,
	zipCode: String,
	city: String
});

module.exports = mongoose.model('Contact', ContactSchema);
