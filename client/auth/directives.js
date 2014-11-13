angular.module('auth').directive('userNavigation', function($compile){
	return {

		restrict: 'E',
		replace: true,
		templateUrl: '/views/directives/userNavigation.html',
		controller: 'auth.userNavigationCtrl',

	};
});
