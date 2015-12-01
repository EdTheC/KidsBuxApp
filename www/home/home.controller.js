(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$location', 'ApperyService', '$rootScope'];
    function HomeController($location,ApperyService, $rootScope) {
        var vm = this;

        vm.user = null;
        vm.allUsers = [];
        vm.allChildren = [];
        vm.allTransactions
        //vm.deleteUser = deleteUser;

        initController();

        function initController() {
            loadAllUsers()
            .then(function () {
                console.log('getting username from appery users ' + $rootScope.globals.currentUser.username);
                ApperyService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (res) {
                    console.log('got username! ' + res.username);
                    return res.username;
                }, console.log('Did NOT get user name!'))
            }
            )
        }

    //    function loadCurrentUser() {
    //        UserService.GetByUsername($rootScope.globals.currentUser.username)
    //            .then(function (user) {
    //                vm.user = user[0];
    //            });
    //    }

        function loadAllUsers() {
            return ApperyService.GetAll()
                .then(function (users) {
                    vm.allUsers = users;
                });
        }

    //    function deleteUser(id) {
    //        //console.log("delete id = %s", id);
    //        UserService.Delete(id)
    //        .then(function () {
    //            loadAllUsers();
    //            console.log("delete going home");
    //            $location.path('/home');
    //        });
    //    }
    }

})();