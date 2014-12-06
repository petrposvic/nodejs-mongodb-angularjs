var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');

var User = require('./app/models/user');
var Contact = require('./app/models/contact');

mongoose.connect('mongodb://localhost/NodeRestApi', function(err) {
	if (err) console.log(err);
});

var router = express.Router();
var secret = 'xxx';
var timeout = 60000;

var passport = require('passport'),
	passportAuth = passport.authenticate('bearer', { session: false }),
	BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
	function(token, done) {
		process.nextTick(function() {
			User.findOne({ token: token }, function(err, user) {
				if (err) return done(err);

				if (!user) return done(null, false);

				var now = new Date().getTime();
				if (user.validity + timeout < now) return done(null, false);
				console.log('user validity = ' + user.validity);

				user.validity = now;
				user.save(function(err) {
					if (err) res.send(err);
					return done(null, user);
				});
			});
		});
	}
));

// ----------------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------------

function setup(req, res) {
	User.find().remove(function() {
		console.log('User object removed!');
	});

	Contact.find().remove(function() {
		console.log('Contact object removed!');
	});

	var user1 = new User();
	user1.username = 'admin';
	user1.password = 'admin';
	user1.save(function(err) {
		if (err) res.send(err);
	});

	var user2 = new User();
	user2.username = 'user';
	user2.password = 'pass';
	user2.save(function(err) {
		if (err) res.send(err);
	});

	var contact1 = new Contact();
	contact1.user = user1;
	contact1.firstName = 'Petr';
	contact1.lastName = 'Pošvic';
	contact1.street = 'Dr. Buděšínského';
	contact1.zipCode = '387 01';
	contact1.city = 'Volyně';
	contact1.save(function(err) {
		if (err) res.send(err);
	});

	var contact2 = new Contact();
	contact2.user = user2;
	contact2.firstName = 'František';
	contact2.lastName = 'Vomáčka';
	contact2.street = 'Falešná 123';
	contact2.zipCode = '110 00';
	contact2.city = 'Springfield';
	contact2.save(function(err) {
		if (err) res.send(err);
	});

	res.redirect('/');
}

// ----------------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------------

function login(req, res) {
	User.findOne({username: req.body.username}, function(err, user) {
		if (err) res.send(err);

		if (!user) {
			res.send(404);
			return;
		}

		if (user.password !== req.body.password) {
			res.send(403);
			return;
		}

		var payload = {
			username: user.name,
			validity: new Date().getTime()
		};

		user.token = jwt.encode(payload, secret, 'HS256');
		user.validity = payload.validity;
		user.save(function(err) {
			if (err) res.send(err);

			res.json({
				token: user.token,
				validity: payload.validity
			});
		});
	});
}

// ----------------------------------------------------------------------------
// Contacts
// ----------------------------------------------------------------------------

function createContact(req, res) {
	var contact = new Contact();
	contact.user = req.user;
	contact.firstName = req.body.firstName;
	contact.lastName = req.body.lastName;
	contact.street = req.body.street;
	contact.zipCode = req.body.zipCode;
	contact.city = req.body.city;

	contact.save(function(err) {
		if (err) res.send(err);
		res.json({ message: 'Contact created!', obj: contact });
	});
}

function getContactList(req, res) {
	User.findOne({ token: req.user.token }, function(err, user) {
		if (err) res.send(err);
		Contact.find({user: user}, function(err, contacts) {
			if (err) res.send(err);
			res.json(contacts);
		});
	});
}

function getContact(req, res) {
	Contact.findById(req.params.contact_id, function(err, contact) {
		if (err) res.send(err);
		res.json(contact);
	});
}

function updateContact(req, res) {
	Contact.findById(req.params.contact_id, function(err, contact) {
		if (err) res.send(err);

		contact.firstName = req.body.firstName;
		contact.lastName = req.body.lastName;
		contact.street = req.body.street;
		contact.zipCode = req.body.zipCode;
		contact.city = req.body.city;
		contact.save(function(err) {
			if (err) res.send(err);
			res.json({ message: 'Contact updated!', obj: contact });
		});
	});
}

function deleteContact(req, res) {
	Contact.remove({ _id: req.params.contact_id }, function(err, contact) {
		if (err) res.send(err);
		res.json({ message: 'Successfully deleted' });
	});
}

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------

router.route('/setup')
	.get(setup);

router
	.route('/v1/auth')
	.post(login);

router.route('/v1/contacts')
	.get(passportAuth, getContactList)
	.post(passportAuth, createContact);

router.route('/v1/contacts/:contact_id')
	.get(passportAuth, getContact)
	.put(passportAuth, updateContact)
	.delete(passportAuth, deleteContact);

// ----------------------------------------------------------------------------

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/css', express.static('./public/css'));
app.use('/img', express.static('./public/img'));
app.use('/js', express.static('./public/js'));
app.use('/', express.static('./public/'));
app.use('/api', router);

app.all('/*', function(req, res, next) {
	res.sendfile('index.html', { root: './public' });
});

app.listen(3000);
