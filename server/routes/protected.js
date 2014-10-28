'use strict';
/*jslint unparam: true, node: true */

var express  = require('express');
var jwt      = require('jsonwebtoken');
var mongoose = require('mongoose');
var User     = require('../models/user');

var router = express.Router();

router.get('/1', function(req,res){
	res.json('1');
});

router.get('/2', function(req,res){
	res.json('2');
});

router.get('/3', function(req,res){
	res.json('3');
});

module.exports = router;
