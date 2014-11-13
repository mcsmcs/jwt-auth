'use strict';
/*jslint unparam: true, node: true */

var express            = require('express');
var jwt                = require('jsonwebtoken');
var mongoose           = require('mongoose');
var User               = require('../models/user');
var EXPIRATION_MINUTES = 60;

module.exports = function(jwtSecret){
	
	var router = express.Router();

	// signup (comment out to disallow)
	router.post('/signup', function(req,res){

		User.findOne({'local.email': req.body.email}, function(err,user){
			if(err)       { res.status(401).send(); }
			else if(user) { res.status(409).send(); }
			else {
				
				var newUser            = new User();
				newUser.local.email    = req.body.email;
				newUser.local.password = newUser.generateHash(req.body.password);

				newUser.save(function(err,user){
					if(err) res.send('failed to create new user:', err);
					res.json('Success! You have signed up!');
				});
			}
		});

	});

	// authenticate user and return a token
	router.post('/authenticate', function(req,res){

		User.findOne({'local.email': req.body.email}, function(err,user){
			if(err) { res.status(500).send(err); }
			else if(!user || !user.validPassword(req.body.password)){ res.status(401).send(); }
			else if(!user.active){ res.status(403).send('Account not activated'); }
			else {

				var token = jwt.sign(
					{ 
						iss   : 'themanhimself',
						email : user.local.email,
						role  : user.role,
					}, 
					
					jwtSecret, 
					{expiresInMinutes: EXPIRATION_MINUTES}
				);
				
				var expires = new Date();
				expires.setMinutes(expires.getMinutes() + EXPIRATION_MINUTES);

				res.json({ token: token, email: user.local.email, expires: expires });
			}
		});

	});


	// test if authenticated
	router.get('/protected', function(req,res){
		res.json({ data: "You've accessed protected data!", decoded: req.user });
	});

	return router;
};