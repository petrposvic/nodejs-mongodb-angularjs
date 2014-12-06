var app = angular.module('app', ['ui.bootstrap', 'ngRoute']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/login.html'
		})
		.when('/contacts', {
			templateUrl: 'templates/contacts.html',
			controller: 'ContactController'
		});
});

app.controller('MainController', function($scope, $http, $location) {
	$scope.username = 'admin';
	$scope.password = 'admin';
	$scope.token = null;

	$scope.login = function () {
		$http
			.post('/api/v1/auth', {username: $scope.username, password: $scope.password})
			.success(function (data, status, headers, config) {
				$scope.token = data.token;
				console.log('token = ' + $scope.token);

				$location.path('/contacts');
			})
			.error(function (data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	}
});

app.controller('ContactController', function($scope, $http) {

	$scope.items = [];
	$scope.item = {};

	$scope.reload = function() {
		$scope.getList();
		$scope.clearForm();
	};

	$scope.preFillForm = function(item) {
		$scope.item = item;
	};

	$scope.clearForm = function() {
		$scope.item = {};
	};

	$scope.createOrUpdate = function(item) {
		if (item._id) {
			$scope.updateItem(item);
		} else {
			$scope.createItem(item);
		}
	};

	$scope.getList = function() {
		$http
			.get('/api/v1/contacts', {headers: {'Authorization': 'bearer ' + $scope.token}})
			.success(function(data, status, headers, config) {
				console.log(JSON.stringify(data));
				$scope.items = data;
			})
			.error(function(data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	$scope.createItem = function(item) {
		$http({
			url: '/api/v1/contacts',
			method: 'POST',
			data: item,
			headers: { 'Authorization': 'bearer ' + $scope.token }
		})
			.success(function(data, status, headers, config) {
				console.log(JSON.stringify(data));
				$scope.reload();
			})
			.error(function(data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	$scope.updateItem = function(item) {
		$http({
			url: '/api/v1/contacts/' + item._id,
			method: 'PUT',
			data: item,
			headers: { 'Authorization': 'bearer ' + $scope.token }
		})
			.success(function(data, status, headers, config) {
				console.log(JSON.stringify(data));
				$scope.reload();
			})
			.error(function(data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	$scope.deleteItem = function(obj) {
		if (!confirm('Really?')) {
			return;
		}

		$http({
			url: '/api/v1/contacts/' + obj._id,
			method: 'DELETE',
			headers: { 'Authorization': 'bearer ' + $scope.token }
		})
			.success(function (data, status, headers, config) {
				console.log(JSON.stringify(data));
				$scope.reload();
			})
			.error(function (data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	$scope.reload();
});
