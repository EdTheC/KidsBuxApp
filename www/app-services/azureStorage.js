(function () {
	'use strict';

	angular.module('KidsBux').service('azureStorage', ['$resource', 'guidGenerator', AzureStorage]);

	/**
	 * Azure Mobile Service Application Key.
	 */ 
	var AZURE_MOBILE_SERVICES_KEY = 'QUHdPvJjitkCaTKGgGfJgaNNciNnco34';
	/**
	 * Azure Mobile Service Application URL.
	 */
	var AZURE_MOBILE_SERVICES_ADDRESS = 'https://kidsbux.azure-mobile.net/';
	AzureStorage.$inject = ['$http'];

    // we use these throught this module
	var azureMobileServicesInstallationId;
	var headers;
	var queryFilter;
    /**
	 * Use the Azure Mobile Service to store items in the cloud.
	 *
	 * @param {angular.Service} $resource
	 * @param {angular.Service} guidGenerator
	 * @constructor
	 */

	function AzureStorage($resource, guidGenerator, $http) {
		this.isAvailable = AZURE_MOBILE_SERVICES_KEY && AZURE_MOBILE_SERVICES_ADDRESS;
		if (!AZURE_MOBILE_SERVICES_KEY || !AZURE_MOBILE_SERVICES_KEY) {
			console.warn("The Azure Mobile Services key and URL are not set up properly. Items will not be stored on Azure.");
		}

		// Generate the headers to access the Azure Mobile Services table.
        azureMobileServicesInstallationId = guidGenerator.get();
	    headers = {
		        'X-ZUMO-APPLICATION': AZURE_MOBILE_SERVICES_KEY,
		        'X-ZUMO-INSTALLATION-ID': azureMobileServicesInstallationId,
		        'X-ZUMO-VERSION': 'ZUMO/1.0 (lang=Web; os=--; os_version=--; arch=--; version=1.0.20218.0)',
		        'Content-Type': 'application/json'
		    };

		// Url of the Azure Mobile Services table to access.
		var azureMobileServicesTableAddress = AZURE_MOBILE_SERVICES_ADDRESS + 'tables/users/:id';
		console.log("before init");
		this.init = function () { return 1 };

		this.userItem = $resource(azureMobileServicesTableAddress, { id: '@id' }, {
		    'query': {
				method: 'GET',
				params: { $top: '1000' },
				isArray: true,
				headers: headers
			},
			'delete': {
				method: 'DELETE',
				headers: headers
			},
			'save': {
				method: 'POST',
				headers: headers
			},
			'update': {
				method: 'PATCH',
				headers: headers
			}
		})
	    ;

    }

    /**
	 * Retrieve all data from Azure storage.
	 */
	AzureStorage.prototype.getAll = function ($http) {
        this.init();
	    var azureMobileServicesTableAddressQ = AZURE_MOBILE_SERVICES_ADDRESS + 'tables/users';
        var promise = $http.get(azureMobileServicesTableAddressQ, { headers: headers }).then(handleSuccess, handleError('Error getting all users'));
        return promise;
	};

    /**
	 * Retrieve a user from Azure storage.
	 */
	AzureStorage.prototype.GetByUsername = function ($http, username) {
	    console.log("GetByUsername=%s", username);
	    this.init();
	    var filt = "(username+eq+" + "'" + username + "')";
	    var azureMobileServicesTableAddressF = AZURE_MOBILE_SERVICES_ADDRESS + 'tables/users?$filter=' + filt;
	    console.log("URL = %s", azureMobileServicesTableAddressF);
	    var promise = $http.get(azureMobileServicesTableAddressF, { headers: headers} ).then(handleSuccess, handleError('Error getting user'));
	    return promise;
	};

	/**
	 * Create a new todo to Azure storage.
	 *
	 * @param {string} text Text of the todo item.
	 * @param {string} address Address of the todo item.
	 */
	AzureStorage.prototype.create = function (user, $http) {
	    console.log("in create username=%s", user.username);
	    var item = new this.userItem({
	        username: user.username,
	        password: user.password,
	        email: user.email,
	        referrer: user.referrer
	    });

	    //return item.$save().$promise;
	    
	    //var promise = item.$save();

	    this.init();
	    var azureMobileServicesTableAddressC = AZURE_MOBILE_SERVICES_ADDRESS + "tables/users?username='eq'";
	    console.log("URL = %s", azureMobileServicesTableAddressC);
	    var promise = $http.post(azureMobileServicesTableAddressC, {
	         
	        headers: headers

	    }).then(handleSuccess, handleError('Error creating user'));

	    return promise;
	};

	/**
	 * Update an existing todo in Azure storage.
	 *
	 * @param {Object} item Todo item to modify.
	 */
	AzureStorage.prototype.update = function (item) {
		return item.$update();
	};

	/**
	 * Remove a todo from Azure storage.
	 *
	 * @param {Object} item Todo item to remove from local storage.
	 */
	AzureStorage.prototype.del = function (item) {
		return item.$delete();
	};

    // private functions

	function handleSuccess(res) {
	    return res.data;
	}

	function handleError(error) {
	    return function () {
	        return { success: false, message: error };
	    };
	}

})();