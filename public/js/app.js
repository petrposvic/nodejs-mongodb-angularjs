var app = angular.module('app', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http) {
	$scope.username = 'admin';
	$scope.password = 'admin';
	$scope.token = null;

	$scope.login = function () {
		$http
			.post('/api/v1/auth', {username: $scope.username, password: $scope.password})
			.success(function (data, status, headers, config) {
				$scope.token = data.token;
				console.log('token = ' + $scope.token);

				$scope.reload();
			})
			.error(function (data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	// ------------------------------------------------------------------------
	// Contacts
	// ------------------------------------------------------------------------

	$scope.contacts = [];
	$scope.obj = {};

	$scope.reload = function() {
		$scope.getContactList();
		$scope.clearForm();
	};

	$scope.preFillContact = function(obj) {
		$scope.obj = obj;
	};

	$scope.clearForm = function() {
		$scope.obj = {};
	};

	$scope.createOrUpdateContact = function(obj) {
		if (obj._id) {
			$scope.updateContact(obj);
		} else {
			$scope.createContact(obj);
		}
	};

	$scope.getContactList = function() {
		$http
			.get('/api/v1/contacts', {headers: {'Authorization': 'bearer ' + $scope.token}})
			.success(function(data, status, headers, config) {
				console.log(JSON.stringify(data));
				$scope.contacts = data;
			})
			.error(function(data, status, headers, config) {
				if (status == 401) {
					$scope.token = null;
				}
			});
	};

	$scope.createContact = function(obj) {
		$http({
			url: '/api/v1/contacts',
			method: 'POST',
			data: obj,
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

	$scope.updateContact = function(obj) {
		$http({
			url: '/api/v1/contacts/' + obj._id,
			method: 'PUT',
			data: obj,
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

	$scope.deleteContact = function(obj) {
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
});
