app.value('Toastr', toastr);

app.factory('NotifierFactory', function(Toastr){
	var notifier = {};

	notifier.success = function(msg){ Toastr.success(msg); };
	notifier.error = function(msg){ Toastr.error(msg); };
	
	return notifier;
});


app.factory('UsersFactory', function($resource){
	return $resource('http://localhost:3000/users/:email');
});