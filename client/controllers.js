app.controller('ApplicationCtrl', function($scope,UserFactory){

	//
	// Available to all controllers
	//

	$scope.$watch(
		function(){ return UserFactory.isAuthenticated(); },
		function(newValue){ $scope.isLoggedIn = newValue; }
	);

	$scope.$watch(
		function(){ return UserFactory.getUser(); },
		function(newValue){ $scope.user = newValue; }
	);

});

app.controller('homeCtrl', function($scope){
	$scope.message = "home";
});

app.controller('rngCtrl', function($scope,$http){
	console.log('Made it to the rngCtrl');
	$http.get('http://localhost:3000/random').then(function(res){ console.log(res); }, function(err){ console.log(err); });
});

app.controller('userCtrl', function($scope,UserFactory){
	$scope.role  = UserFactory.getRole();
	$scope.token = UserFactory.getToken();
});

app.controller('adminCtrl', function($scope){
	$scope.message = 'Admins Only!';
});

app.controller('loginCtrl', function($scope,AuthFactory,$location,$rootScope,UserFactory,NotifierFactory){

	$scope.login = function(credentials){ 
		AuthFactory.login(credentials).then(
			function(res){ 
				NotifierFactory.success('You have successfully logged in!');
				$scope.credentials.password = null;

				// Go back to previous attempted route else /
				var path = $rootScope.redirectAfterLogin || '/';
				$rootScope.redirectAfterLogin = null;
				$location.path(path);

			},
			function(err){
				NotifierFactory.error('Username/Password combination incorrect');
				$scope.credentials.password = null;
			});
	};

});


app.controller('userNavigationCtrl', function($scope,$location,AuthFactory,UserFactory){

	$scope.logout = function(){	
		AuthFactory.logout();
		$location.path('/');
	};
});