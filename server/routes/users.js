'use strict';
/*jslint unparam: true, node: true */

var express  = require('express');
var mongoose = require('mongoose');
var User     = require('../models/user');
var Authorize = require('../lib/authorize');

var router = express.Router();


// route middleware #######################################

// authorization: only admin can pull all users
router.use('^/$', Authorize.roles(['admin']));

// authorization: only admin or owner can access specific routes
router.param('email', Authorize.ownerOrRoles(['admin']));

// convenience: attach requested document to req if found
router.param('email', function(req,res,next){
		
	User.findOne({'local.email': req.params.email}, function(err,user){
		if(err)        { req.status(500).send(err); }
		else if(!user) { req.status(404).send(); }
		else {
			req.requestedUser = user;
			next();
		}
	});
		
});	



// ########################################################
// resource methods #######################################
// ########################################################

// Read collection ########################################
router.get('/', function(req,res){
	// User.find({}, function(err,users){ res.send(users); });

	User.find().lean().exec(function(err,users){
		if(err){ res.status(500).send(); console.log(err); }
		else {

			// remove sensitive information
			users = users.map(function(user){

				user.email = user.local.email;
				delete user.local;
				delete user._id;
				delete user.__v;
				
				return user;
			});

			res.send(users);
		}
	})
});



// Create #################################################
router.post('/', function(req,res){
	
	// user already exists -> 409 - Conflict
	if(req.requestedUser){ res.status(409).send(); }

	var newUser            = new User();
	newUser.local.email    = req.body.email;
	newUser.local.password = newUser.generateHash(req.body.password);

	newUser.save(function(err,user){
		if(err) res.send('failed to create new user:', err);
		res.json('Success! You have signed up!');
	});
		
});



// Read one ###############################################
router.get('/:email', function(req,res){
	var user = req.requestedUser.toObject();

	// remove sensitive information
	user.email = user.local.email;
	delete user.local
	delete user._id;
	delete user.__v;

	res.send(user);
});



// Update #################################################
router.put('/:email', function(req,res){
	var user = req.requestedUser;

	user.local.email = req.body.email  || user.local.email;
	user.role        = req.body.role   || user.role;
	user.active      = req.body.active || user.active;

	user.local.password = req.body.password ? user.generateHash(req.body.password) : user.local.password;

	user.save(function(err,user){
		if(err){ res.status(500).send(err); }
		else { res.status(200).send(); }
	});

});



// Delete #################################################
router.delete('/:email', function(req,res){
	var user = req.requestedUser;
	
	// don't delete the admin user
	if(user.local.email === 'admin') res.status(403).send();
	else if(user.local.email === req.user.email){ res.status(409).send(); }	// delete yourself?
	else {

		User.remove({_id: user._id}, function(err){
			if(err) { res.status(500).send(err); console.log(err); }
			else    { res.status(200).send(); }
		});
	}
});


// export #################################################
module.exports = router;
