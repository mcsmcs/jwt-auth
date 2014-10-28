'use strict';
/*jslint unparam: true, node: true */

var express  = require('express');
var jwt      = require('jsonwebtoken');
var mongoose = require('mongoose');
var User     = require('../models/user');


module.exports = function(jwtSecret){
	
	var router = express.Router();

	// signup (comment out to disallow)
	router.post('/signup', function(req,res){

		User.findOne({'local.email': req.body.email}, function(err,user){
			if(err) res.send(401);
			else if (user) res.send('user already exists');
			else {
				var newUser = new User();
				newUser.local.email = req.body.email;
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
			if(err) res.send(err);
			else if(!user) res.send('no such user');
			else if(!user.validPassword(req.body.password)) res.send('bad password');
			else {
				var token = jwt.sign({ iss: 'themanhimself', email: user.local.email }, jwtSecret, {expiresInMinutes: 30});
				res.json({ token: token });
			}
		});

	});


	// test if authenticated
	router.get('/protected', function(req,res){
		res.json({ data: "You've accessed protected data!", decoded: req.user });
	});

	return router;
}