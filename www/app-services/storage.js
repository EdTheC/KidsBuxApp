(function () {
    'use strict';

    angular.module('KidsBux').factory('storage', ['$injector', storage]);

    /**
	 * Storage service to abstract specific implementations.  EC Note: we dont use local but at least we give an alert.
	 *
	 * @params {!angular.Service} $injector
	 */
    function storage($injector) {
        // If Azure storage is available, use it. Otherwise, use local storage.
        var azureService = $injector.get('azureStorage');
        if (!azureService.isAvailable)
            alert("The server is not available. Please try later");
        return azureService;
        //return azureService.isAvailable ? azureService :
        //$injector.get('localStorage');  
    }
})();