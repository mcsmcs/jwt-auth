module.exports = {
	roles        : roles,
	ownerOrRoles : ownerOrRoles,
};


// 
// Return express middleware that checks:
// the req.user's role against the passed in array of roles [validRoles]
// 
function ownerOrRoles(validRoles){

	return function(req,res,next){
		var roles  = validRoles;

		if(!req.user || !req.user.role || !req.user.email){
		 	// malformed req object (not populated correctly by expressJWT)
			res.status(403).send('Insufficient permissions'); 
		} 
		else if (req.user.email === req.params.email || roles.indexOf(req.user.role) !== -1){
			// passed validation as either owner or sufficient role
			next(); 
		}
		else { 
			// catchall: fail anything else
			res.status(403).send('Insufficient permissions'); 
		}
		
	};
};


// 
// Return express middleware that checks the user's role
// against the passed in array of roles [validRoles]
// 
function roles(validRoles){

	return function(req,res,next){
		var roles = validRoles;

		if(req.user && req.user.role && roles.indexOf(req.user.role) !== -1){
			next();
		}
		else { 
			res.status(403).send('Insufficient permissions'); 
		}
	};
}