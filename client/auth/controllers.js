angular.module('auth').controller('userCtrl', function($scope,UserFactory){
	$scope.role  = UserFactory.getRole();
	$scope.token = UserFactory.getToken();
});


angular.module('auth').controller('auth.loginCtrl', function($scope,AuthFactory,$location,$rootScope,UserFactory,NotifierFactory){

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


angular.module('auth').controller('auth.userNavigationCtrl', function($scope,$location,AuthFactory,UserFactory){

	$scope.logout = function(){	
		AuthFactory.logout();
		$location.path('/');
	};
});
