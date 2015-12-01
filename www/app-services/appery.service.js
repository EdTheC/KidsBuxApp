(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('ApperyService', ApperyService);

    ApperyService.$inject = ['$http', '$rootScope'];

    function ApperyService($http, $rootScope) {
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.CheckExistingUser = CheckExistingUser;
        service.GetAllChildren = GetAllChildren;
        service.GetAllTransactions = GetAllTransactions;

        return service;

        function GetAll() {
            return $http({
                method: 'GET',
                url:
                    'https://api.appery.io/rest/1/db/login' + '?' + encodeURI('username=ed&password=ed'),
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',
                    'X-Appery-Database-Id': '53adf662e4b07420882b4144'
                },
            })

            .then(function (res) {
                $rootScope.sessionToken = res.data.sessionToken;
                $rootScope.apperyID = res.data._id;
                console.log('GetAll ses id ' + $rootScope.sessionToken + ' ' + $rootScope.apperyID);
                var config = {
                    headers: {
                        'X-Appery-Database-Id': '53adf662e4b07420882b4144',
                        'X-Appery-Session-Token': $rootScope.sessionToken,
                        'Accept': 'application/json;odata=verbose'
                    }
                };
                console.log('getall = ' + config);
                return $http.get('https://api.appery.io/rest/1/db/users', config).then(handleSuccess, handleError('Error getting all users'));
            })
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            var query = 'where={"username":"' + username + '"}';
            return $http({
                method: 'GET',
                url:
                    'https://api.appery.io/rest/1/db/users' + '?' + encodeURIComponent(query),
                headers: {
                    'X-Appery-Database-Id': '53adf662e4b07420882b4144',
                    'X-Appery-Session-Token': $rootScope.sessionToken,
                    'Accept': 'application/json'
                },
            })

            .then(handleSuccess, handleError('Error getting all users'));
        }

        function GetAllChildren(username) {
            // NOTE: it gets ALL of them. dont really care much since we are abondoning appery...
            var query = 'where={"UserID":"' + username + '"}';
            return $http({
                method: 'GET',
                url:
                    'https://api.appery.io/rest/1/db/collections/Children' + '?' + encodeURI(query),
                headers: {
                    'X-Appery-Database-Id': '53adf662e4b07420882b4144',
                    'X-Appery-Session-Token': $rootScope.sessionToken,
                    'Accept': 'application/json'
                },
            })

            .then(handleSuccess, handleError('Error getting all users'));
        }


        function GetAllTransactions(username) {
            //var id = 'where={ "Userid": "edc" }';
            var id = 'where={ "Userid": "' + username + '" }';
            return $http({
                method: 'GET',
                url:
                    'https://api.appery.io/rest/1/db/collections/Transactions' + '?' + encodeURI(id),
                headers: {
                    'X-Appery-Database-Id': '53adf662e4b07420882b4144',
                    'X-Appery-Session-Token': $rootScope.sessionToken,
                    'Accept': 'application/json'
                },
            })

            .then(handleSuccess, handleError('Error getting all users'));
        }


        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError('Error creating user'));
        }

        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        function CheckExistingUser(username, password, isUser) {
            var id = 'username=' + username + '&password=' + password;
            return $http({
                method: 'GET',
                url:
                    'https://api.appery.io/rest/1/db/login' + '?' + encodeURI(id),
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',
                    'X-Appery-Database-Id': '53adf662e4b07420882b4144'
                },
            })

            .then(function (res) {
                $rootScope.sessionToken = res.data.sessionToken;
                $rootScope.apperyID = res.data._id;
                isUser.test = true;
                console.log(' found user in appery');
            })
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();

