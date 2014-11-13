'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

	active: { type: Boolean, required: true, default: false },

	role: { type: String, required: true, default: 'user' },
	
	local: {
		email: String,
		password: String,
	},

});


// instance methods =======================================
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
};


// static methods =========================================



module.exports = mongoose.model('User', userSchema);