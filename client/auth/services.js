angular.module('auth').factory('AuthFactory', function($http,$q,UserFactory,AUTH_API_URL){

	var authFactory = {};

	authFactory.login = function(credentials){

		var defer = $q.defer();

		$http.post(AUTH_API_URL + '/auth/authenticate', credentials)
			.success(function(response){
				UserFactory.setUserInfo(response);
				defer.resolve(response);
			})
			.error(function(response){
				UserFactory.unsetUserInfo();
				defer.reject(response);
			});

		return defer.promise;
	};

	authFactory.logout = function(){ 
		UserFactory.unsetUserInfo(); 
	};


	// Function for authorizing roles in $routeProvider->resolve
	authFactory.authorize = function(roles){

			var defer = $q.defer();
			var role  = UserFactory.getRole();

			if(!UserFactory.isAuthenticated()){ 
				
				// Wipe user state
				UserFactory.unsetUserInfo();

				// Reject the route change
				defer.reject({
					error: 'not-authenticated',
					message: 'Please log in first'
				}); 
			} 
			else if (roles.indexOf(role) === -1){
				defer.reject({
					error: 'not-authorized',
					message: 'Insufficient permissions to view that page'
				}); 
			} 
			else if (UserFactory.isAuthenticated() && roles.indexOf(role) !== -1){ 
				defer.resolve(); 
			}

			return defer.promise;
	};

	return authFactory;
});


angular.module('auth').factory('AuthInterceptor', function($rootScope,$q,$location,UserFactory,NotifierFactory){

	var interceptor = {};

	// add bearer authorization header
	interceptor.request = function(config){
		var token   = UserFactory.getToken();
		var expires = UserFactory.getExpires();

		if(token){
			config.headers = config.headers || {};
			config.headers.Authorization = "Bearer " + token;
		}

		return config;
	};

	interceptor.responseError = function(response){
		UserFactory.unsetUserInfo();
		$q.reject(response);
		$rootScope.redirectAfterLogin = $location.path();
		$location.path('/login');
	};

	return interceptor;
});


angular.module('auth').factory('UserFactory', function($window){

	var self = {};

	// state
	var user    = null;
	var role    = null;
	var token   = null;
	var expires = null;


	// getters
	self.getUser    = function(){ return user; };
	self.getRole    = function(){ return role; };
	self.getToken   = function(){ return token; };
	self.getExpires = function(){ return expires; };


	// Accepts an object and stores key->val in localStorage
	function setSessionStorage(data){
		var store = $window.sessionStorage;
		for(var key in data){
			if(data.hasOwnProperty(key)){
				store.setItem(key, data[key]);
			}
		}
	}

	// Remove all sessionStorage data
	function unsetSessionStorage(){	$window.sessionStorage.clear();	}


	// Bootstrap our authentication from sessionStorage (get state after page refresh)
	self.loadSessionStorage = function(){
		user    = $window.sessionStorage.getItem('email') || null;
		role    = $window.sessionStorage.getItem('role')  || null;
		token   = $window.sessionStorage.getItem('token') || null;
		expires = new Date($window.sessionStorage.getItem('expires')) || null;
	};

	// Set user state after authentication with API
	self.setUserInfo = function(userAuthData){
		user    = userAuthData.email;
		role    = userAuthData.role || 'user';
		token   = userAuthData.token;
		expires = new Date(userAuthData.expires);

		setSessionStorage({
			email   : user,
			role    : role,
			token   : token,
			expires : expires,
		});
	};

	// Remove user authentication information
	self.unsetUserInfo = function(){ 
		unsetSessionStorage();
		user = role = token = null; 
	};

	// Verify user has authentication data, and it isn't expired
	self.isAuthenticated = function(){ 
		return 	user && role &&	token &&
				expires && new Date() < expires; 
	};

	self.tokenIsExpired = function(){
		return !(expires && new Date() < expires);
	};

	return self;
});