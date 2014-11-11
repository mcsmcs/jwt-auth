//https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider,$httpProvider,$locationProvider,USER_ROLES){

	$routeProvider
		.when('/', {
			templateUrl: 'views/rng.html',
			controller:  'rngCtrl',
			data: {
				authorizedRoles: [USER_ROLES.admin],
			},
		})

		.when('/login', {
			templateUrl: 'views/login.html',
			controller:  'loginCtrl',
		})

		.when('/rng', {
			templateUrl: 'views/rng.html',
			controller:  'rngCtrl',
			data: {
				authorizedRoles: [USER_ROLES.admin],
			},
		})
	;

	$locationProvider.html5Mode(true);
	$httpProvider.interceptors.push('AuthInterceptor');
});


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

app.constant('API_URL', 'http://localhost:3000');


app.run(function($rootScope,AUTH_EVENTS,AuthFactory){
	$rootScope.$on('$routeChangeStart', function(event,current,previous,rejection){
		console.log('ding!');
		var authorizedRoles = current.data.authorizedRoles;

		if(!AuthFactory.isAuthorized(authorizedRoles)){
			console.log('dong');
			event.preventDefault();
			if(AuthFactory.isAuthenticated()) $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
			else $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
		}
	});
});


app.factory('AuthFactory', function($http,$window,TokenFactory,API_URL){
	
	var authFactory = {};

	authFactory.login = function(credentials){
		return $http.post(API_URL + '/auth/authenticate', credentials).then(
			function success(response){
				TokenFactory.setToken(response.data);
				return response.data.email;
			},
			function error(reason){
				TokenFactory.destroyToken();
			}
		);
	};

	authFactory.isAuthenticated = function(){
		return TokenFactory.getUser();
	};

	authFactory.isAuthorized = function(authorizedRoles){
		if(!angular.isArray(authorizedRoles)){
			authorizedRoles = [authorizedRoles];
		}

		console.log(authorizedRoles);
		console.log(authFactory.isAuthenticated());
		console.log(authorizedRoles.indexOf(TokenFactory.getRole()));

		return (authFactory.isAuthenticated() &&
			authorizedRoles.indexOf(TokenFactory.getRole()) !== -1);
	};


	return authFactory;
});


app.factory('TokenFactory', function($window){
	var tokenFactory = {};

	var store       = $window.localStorage;
	var key         = 'auth-token';
	
	var token 		= null;
	var user 		= null;
	var role        = 'admin';

	tokenFactory.setToken = function(authData){
		console.log(authData);
		token = authData.token;
		user  = authData.email;
		role  = authData.role || 'admin';
		store.setItem(key,token);
	};

	tokenFactory.destroyToken = function(){
		token = user = role = null;
		store.removeItem(key);
	};

	tokenFactory.getUser = function(){ return user; };
	tokenFactory.getRole = function(){ return role; };
	tokenFactory.getToken = function(){ return token; };

	return tokenFactory;
});


app.factory('AuthInterceptor', function($rootScope,$q,AUTH_EVENTS,TokenFactory){

	return {
		request: function(config){
			var token = TokenFactory.getToken();
			if(token){ 
				config.headers = config.headers || {};
				config.headers.Authorization = "Bearer " + token;
			}

			return config;
		},

		responseError: function(response){
			
			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
				403: AUTH_EVENTS.notAuthorized,
				419: AUTH_EVENTS.sessionTimeout,
				440: AUTH_EVENTS.sessionTimeout,
			});

			return $q.reject(response);
		}
	};

});


app.controller('ApplicationCtrl', function($scope,USER_ROLES,AuthFactory){

	$scope.currentUser = null;
	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = AuthFactory.isAuthorized;

	$scope.setCurrentUser = function(user){
		$scope.currentUser = user;
		xuser = user;
	};

});

app.controller('loginCtrl', function($scope,$rootScope,AuthFactory,AUTH_EVENTS){
	$scope.message = 'login';

	$scope.login = function(credentials){
		AuthFactory.login(credentials).then(
			function success(email){
				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				$scope.setCurrentUser(email);
			},
			function error(){
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			}
		);
	};

});


app.controller('rngCtrl', function($scope){
	console.log('Made it to the rngCtrl');
	$scope.message = 'rng';
});



app.directive('loginDialog', function(AUTH_EVENTS){
	return {
		restict: 'A',
		template: '<div ng-if="visible" ng-include="\'views/login.html\'">',
		link: function(scope){
			var showDialog = function(){ scope.visible = true; };
			var hideDialog = function(){ scope.visible = false; };
			
			scope.visible = false;
			
			scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
			scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);

			scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
		}
	};
});