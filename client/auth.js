app.constant('AUTH_EVENTS', {
	loginSuccess     : 'auth-login-success',
	loginFailed      : 'auth-login-failed',
	logoutSuccess    : 'auth-logout-success',
	sessionTimeout   : 'auth-session-timeout',
	notAuthenticated : 'auth-not-authenticated',
	notAuthorized    : 'auth-not-authorized'
});

app.constant('USER_ROLES', {
	all   : '*',
	admin : 'admin',
	guest : 'guest'
});


app.factory('AuthFactory', function($http,$q,AUTH_EVENTS,UserFactory,API_URL){
	
	var authFactory = {};

	authFactory.login = function(credentials){
		var defer = $q.defer()

		$http.post(API_URL + '/auth/authenticate', credentials).then(
			function(response){ 
				UserFactory.setUser(response.data);  
				defer.resolve(response);
			},
			function(error){ 
				UserFactory.destroyUser();
				defer.reject(error);
			}
		);

		return defer.promise;
	};

	authFactory.isAuthenticated = function(){ return UserFactory.getUser();	};

	authFactory.isAuthorized = function(authorizedRoles){
		if(!angular.isArray(authorizedRoles)){ authorizedRoles = [authorizedRoles]; }

		return (authFactory.isAuthenticated() &&
			authorizedRoles.indexOf(UserFactory.getRole()) !== -1);
	};

	authFactory.authorize = function(requiresLogin, roles){

		var authResult = [];

		if(requiresLogin && !UserFactory.getUser()){
			return AUTH_EVENTS.notAuthenticated;
		}

		if(roles && roles.IndexOf(UserFactory.getRole()) === -1){
			return AUTH_EVENTS.notAuthorized;
		}
	}


	return authFactory;
});


app.factory('AuthInterceptor', function($rootScope,$q,AUTH_EVENTS,UserFactory){

	return {

		// Add Authorization: Bearrer xxxx to requests
		request: function(config){
			var token = UserFactory.getToken();
			if(token){ 
				config.headers = config.headers || {};
				config.headers.Authorization = "Bearer " + token;
			}

			return config;
		},

		// On error responses broadcast the event
		responseError: function(response){
			
			var responseTypes = {
				401: AUTH_EVENTS.notAuthenticated,
				403: AUTH_EVENTS.notAuthorized,
				419: AUTH_EVENTS.sessionTimeout,
				440: AUTH_EVENTS.sessionTimeout,
			};

			$rootScope.$broadcast(responseTypes[response.status]);

			return $q.reject(response);
		}
	};

});


app.factory('UserFactory', function($window){

	var userFactory = {};

	var store       = $window.localStorage;
	var key         = 'auth-token';
	var token 		= null;
	var user 		= null;
	var role        = 'admin';

	userFactory.setUser = function(authData){
		token = authData.token;
		user  = authData.email;
		role  = authData.role || 'admin';
		store.setItem(key,token);
	};

	userFactory.destroyUser = function(){
		token = user = role = null;
		store.removeItem(key);
	};

	userFactory.getUser = function(){ return user; };
	userFactory.getRole = function(){ return role; };
	userFactory.getToken = function(){ return token; };

	return userFactory;
});