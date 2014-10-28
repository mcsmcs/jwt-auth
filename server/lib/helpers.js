'use strict';
/*jslint unparam: true, node: true */

var User = require('../models/user');


// Create an admin user in mongodb if one does not already exist
function ensureAdminUser(){
	User.findOne({'local.email':'admin'}, function(err,admin){
		if(err) console.log('Failed to lookup admin user', err);
		else if(admin) console.log('Admin user already exists');
		else if(!admin){
			var newAdmin = new User();
			newAdmin.local.email = 'admin';
			newAdmin.local.password = newAdmin.generateHash('admin');

			newAdmin.save(function(err,admin){
				if(err) console.log('Error saving admin user', err);
				else console.log('Saved admin user with default password');
			});
		}
	});
}


module.exports = {

	ensureAdminUser: ensureAdminUser,

};