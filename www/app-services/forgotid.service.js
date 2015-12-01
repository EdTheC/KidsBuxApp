(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('ForgotIDService', ForgotIDService);

    ForgotIDService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function ForgotIDService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
        var service = {};
        service.Create = Create;

        return service;

 
        function Create(forgot) {
            return Azureservice.insert('IDReset', forgot);
            // unfortunately there is an error angualr about etg headers that can be ignored.
            //.then(function () {
            //    console.log('Insert successful');
            //}, function (err) {
            //    console.error('Azure Error: ' + err);
            //});
        }

    }

})();
