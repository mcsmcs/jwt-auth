var app = angular.module('app', ['ngRoute','ngResource','auth']);

app.config(function($routeProvider,$httpProvider,$locationProvider){

	function authorize(roles){ return function(AuthFactory){ return AuthFactory.authorize(roles); }; }

	$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller:  'homeCtrl',
		})

		.when('/login', {
			templateUrl: 'views/login.html',
			controller:  'loginCtrl',
		})

		.when('/notAuthorized', {
			templateUrl: 'views/notAuthorized.html',
		})

		.when('/user', {
			templateUrl: 'views/user.html',
			controller: 'userCtrl',
			resolve: {
				auth: authorize(['user','admin']),
			}
		})

		.when('/users', {
			templateUrl: 'views/userList.html',
			controller: 'usersCtrl',
			resolve: {
				auth  : authorize(['admin']),
				users : app.controller('usersCtrl').loadUsers
			}
		}) 

		.when('/admin', {
			templateUrl: 'views/admin.html',
			controller: 'adminCtrl',
			resolve: {
				auth: authorize(['admin']),
			}
		}) 

		.when('/rng', {
			templateUrl: 'views/rng.html',
			controller:  'rngCtrl',
			resolve: {
				auth: authorize(['user','admin']),
			}
		})
	;

	$locationProvider.html5Mode(true);
	$httpProvider.interceptors.push('AuthInterceptor');
});


app.constant('API_URL', 'http://localhost:3000');


app.run(function($rootScope,$location,AuthFactory,UserFactory,NotifierFactory){

	// Load user session info from session storage
	UserFactory.loadSessionStorage();


	// Check for authentication/authorization and redirect to 
	$rootScope.$on('$routeChangeError', function(event,curr,prev,rejection){

		if(rejection.error === 'not-authenticated'){
			$rootScope.redirectAfterLogin = $location.path();
			$location.path('/login');
		}
		else if (rejection.error === 'not-authorized'){
			if(prev.originalPath !== '/login'){
				$location.path(prev.originalPath);
			} else {
				$location.path('/');	
			}
		}


		NotifierFactory.error(rejection.message);
	});

	
});
