(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService', '$cookieStore', '$rootScope', 'ApperyService'];
    function LoginController($location, AuthenticationService, FlashService, $cookieStore, $rootScope, ApperyService) {
        var vm = this;

        vm.login = login;

        (function initController() {
            // reset login status
            AuthenticationService.GetCredentials();

            //$cookieStore.get('globals', $rootScope.globals);
            vm.username = $rootScope.globals.currentUser.username;
            vm.password = $rootScope.globals.currentUser.password;
            console.log("Got credentials: %s %s", vm.username, vm.password);
        })();

        function login() {
            vm.dataLoading = true;
            AuthenticationService.Login(vm.username, vm.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(vm.username, vm.password);
                    console.log("setting creds, username=%s", vm.username);
                    if (vm.username == 'ed' && vm.password == 'ed'){
                        $location.path('/home');
                    }
                    else {
                        $location.path('/children');
                    }
                } else {
                    var isApperyUser = { test: false };
                    ApperyService.CheckExistingUser(vm.username, vm.password, isApperyUser)
                    .then(function () {
                        if (isApperyUser.test){
                            // yes, appery user.
                            FlashService.Error('Please register this new version with the same username (' + vm.username +') as before, data will be automatically transferred. Sorry, this will only happen once.');
                        }
                        else {
                            FlashService.Error(response.message);
                        }
                    })
                    vm.dataLoading = false;
                }
            });
        };
    }

})();
