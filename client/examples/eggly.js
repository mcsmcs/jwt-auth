// egghead.io tutorial: https://egghead.io/series/angularjs-authentication-with-jwt

(function(){
	'use strict';

	var app = angular.module('app', [], function config($httpProvider){
		$httpProvider.interceptors.push('AuthInterceptor');
	});

	app.constant('API_URL', 'http://10.10.10.26:3000');

	app.controller('MainCtrl', function MainCtrl($scope,RandomNumberFactory,UserFactory){
		'use strict';

		$scope.getRandomNumber = function getRandomNumber(){
			RandomNumberFactory.getNumber().then(function success(response){
				$scope.randomNumber = response.data;
			}, handleError);
		};

		$scope.login = function login(email,password) {
			UserFactory.login(email,password).then(function success(response){
				$scope.token = response.data.token;
			}, handleError);
		}

		$scope.logout = function logout(){
			UserFactory.logout();
		}

		function handleError(response){
			alert('Error: ' + response.data);
		}
	});

	app.factory('RandomNumberFactory', function RandomNumberFactory($http, API_URL){
		return {
			getNumber: getNumber,
		};

		function getNumber(){
			return $http.get(API_URL + '/random');
		}
	});

	app.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory){
		
		return {
			login: login,
			logout: logout,
		}

		function login(email, password){
			return $http.post(API_URL + '/auth/authenticate', {
				email: email,
				password: password
			}).then(function success(response){
				AuthTokenFactory.setToken(response.data.token);
				return response;
			});
		}

		function logout(){
			AuthTokenFactory.setToken();
		}
	});

	app.factory('AuthTokenFactory', function AuthTokenFactory($window){
		
		var store = $window.localStorage;
		var key   = 'auth-token';

		return { 
			getToken: getToken,
			setToken: setToken,
		};

		function getToken(){ return store.getItem(key); }

		function setToken(token){
			if(token) store.setItem(key, token);
			else store.removeItem(key);
		}
	});

	app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory){
		return {
			request: addToken
		};

		function addToken(config){
			var token = AuthTokenFactory.getToken();
			if(token){ 
				config.headers = config.headers || {};
				config.headers.Authorization = "Bearer " + token;
			}

			return config;
		}


	});

})();