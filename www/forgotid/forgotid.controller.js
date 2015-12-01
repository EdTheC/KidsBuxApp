(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ForgotIDController', ForgotIDController);

    ForgotIDController.$inject = ['$scope', '$location', '$rootScope', 'FlashService', '$http', 'UserService','ForgotIDService'];
    function ForgotIDController($scope, $location, $rootScope, FlashService, $http, UserService, ForgotIDService) {
        var vm = this;

        vm.forgotid = forgotid;
        var forgot = {
            toemail : 'kidsbuxapp@gmail.com',
            fromemail: 'kidsbuxapp@gmail.com',
            subject: 'Test Subject',
            body : 'This is the body.'
        };

        function forgotid() {
            var _this = this;
            vm.dataLoading = true;

            var email = this.user.email;
            console.log("forgot email = %s", email);
            if (!email) {
                return;
            };
            UserService.GetByEmail(email)
                .then(function (user) {
                    console.log("getbyemail success. count=%d", user.length);
                    if (user.length > 0) {

                        forgot.toemail = user[0].email;
                        forgot.fromemail = 'kidsbuxapp@gmail.com';
                        forgot.subject = 'Kids Bux Credentials';
                        forgot.body = 'Your credentials are username=' + user[0].username + ' password=' + user[0].password;
                        ForgotIDService.Create(forgot)
                        .then(function () {
                            alert('An email with your login has been sent. Please check your inbox in a few moments.');
                            $location.path('/login');
                        })
                    } else {
                            //console.log("getbyemail3 success. count=%d", user.length);
                        FlashService.Error("The email address registered is not recognized.");
                        vm.dataLoading = false;

                    }
            });
        };
    }

})();
