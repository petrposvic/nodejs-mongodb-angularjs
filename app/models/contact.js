var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User'},
	firstName: String,
	lastName: String,
	street: String,
	zipCode: String,
	city: String
});

module.exports = mongoose.model('Contact', ContactSchema);
