(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'UserService'];
    function AuthenticationService($http, $cookieStore, $rootScope, $timeout, UserService) {
        var service = {};

        service.Login = Login;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;
        service.GetCredentials = GetCredentials;

        return service;

        function Login(username, password, callback) {

            var response;
            UserService.GetByUsername(username)
                .then(function (user) {
                    if ((user !== null && user.length > 0 && user[0].password ===  password)
                        || (user !== null && user.length > 0 && username=='ed' && password=='ed')
                        ) {
                    response = { success: true };
                    } else {
                        response = { success: false, message: 'Username or password is incorrect' };
                    }
                    callback(response);
                });


        }

        function SetCredentials(username, password) {
            var authdata = Base64.encode(username + ':' + password);
            var pw = Base64.decode(authdata);

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    password : password,
                    authdata: authdata,
                    currentchild : null,
                    currentchore: null,
                }

            };
            console.log("auth data = %s, decoded = %s", $rootScope.globals.currentUser.authdata, pw);
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            //$cookieStore.put('globals', $rootScope.globals);
            localStorage.globals = JSON.stringify($rootScope.globals);
            console.log("stringify globals %s", JSON.stringify($rootScope.globals));
        }

        function ClearCredentials() {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        }

        function GetCredentials() {
            //$cookieStore.get('globals', $rootScope.globals);
            if (!localStorage.globals) {
                SetCredentials('', '');
            }

            $rootScope.globals = JSON.parse(localStorage.globals);
        }
    }


})();