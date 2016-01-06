(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$scope', '$location', '$rootScope', 'FlashService' ,'$http', 'UserService', 'ApperyService', 'ChildrenService', 'TransactionsService'];
    function RegisterController($scope, $location, $rootScope, FlashService, $http, UserService, ApperyService, ChildrenService, TransactionsService) {
        var vm = this;

        vm.register = register;
        vm.referrer = "self";
        vm.user = null;
        vm.AllChildren = [];

        // remove on release???
        console.log("Load all users in register ctrl");
        loadAllUsers(UserService, vm); //update the list of users

        function register() {
            var _this = this;

            var uname = this.user.username;
            var pword = this.user.password;
            console.log("register username text = %s", uname);
            if (!uname) {
                return;
            };

            var child= {
                username:'',
                childname:''

            };

            var transaction = {
                username: '',
                childname: '',
                date: '',
                amount: '',
                description:''
            };

            var isUser = { test: false };
            UserService.CheckExistingUser(uname, isUser)
                .then(function (checkit) {
                    if (!isUser.test)
                    {
                        //  user does not exist, add in 
                                                                                        
                        console.log("regsiter new user = %s", vm.user.username);
                        vm.user.referrer = 'Google Play';   // Amazon Googgle Play io.cordova.kidsbux1b00f53567404092b26c288159905c38 Amazon Underground io.appery.project342416 old io.appery.project189621.underground old io.cordova.myapp1b00f53567404092b26c288159905c38
                        UserService.Create(vm.user)
                            .then(function (response) {
                                // unfortunately while it does work, we get a ETG failure on some browsers.  so we test if the user got added
                                //if (response.success) {
                                UserService.CheckExistingUser(uname, isUser)
                                    .then(function (aok) {
                                        if (isUser.test){
                                            console.log("create success");
                                            FlashService.Success('Registration successful', true);
                                            $location.path('/login');
                                        } else {
                                            console.log("create fail");
                                            FlashService.Error("There must be a problem with the server. Please try to register again later.");
                                            vm.dataLoading = false;
                                        }
                                    })
                                }
                            );
                    }
                    else 
                    {
                        console.log("register vm username text = %s", uname);
                        var msg = "The user '" + uname + "' already exists. Choose another user name or just login on the Home page if that is your user name.";
                        console.log("errmsg=%s", msg);
                        FlashService.Error(msg);
                        vm.dataLoading = false;
                    }
                });

            }
        }

    /**
 * Update the item location with an address.
 * @param user
 */
    function loadAllUsers(UserService, vm) {
        var promise =UserService.GetAll()
            .then(function (items) {
                vm.allUsers = items;
                console.log("items length = %d ", items.length);
                console.log("user length = %d ", vm.allUsers.length);
                for (var i = 0; i < vm.allUsers.length; i++)
                    console.log("user %d is %s", i, vm.allUsers[i].username);
            });
        return promise;
    }

    // use this one for login not reg because it kills vm.user
    //function loadUser($http, storage, vm, username) {
    //    var promise =storage.GetByUsername($http, username)
    //        .then(function (user) {
    //                vm.user = user[0];  //comes back as array so take first one
    //        });
    //    return promise;
    //}


    function isExistingUser($http, storage, username, isUser) {
        var promise = storage.GetByUsername($http, username)
            .then(function (auser) {
                //console.log("loadUser length = %d ", auser.length);
                if (auser.length == 0) {
                    isUser.test = false;
                }
                else {
                    //console.log("%s is existing", username);
                    isUser.test = true;  //comes back as array so take first one
                }
            });
        return promise;
    }

    /**
	 * Add a  item to the list.
	 */
    RegisterController.prototype.addUser = function () {
        var _this = this;

        var text = this.user.username;
        if (!text) {
            return;
        };

        this.user.username = '';
        this.storage.create(username, password, email)
			.then(function (user) {
			    _this.users.push(user);
			    return user;
			});
    };

    /**
	 * Update the text of a todo item.
	 */
    RegisterController.prototype.changeUser = function (user) {
        this.storage.update(user)
			
    };


    /**
	 * Remove a todo item from the list.
	 */
    RegisterController.prototype.removeUser = function (user) {
        var _this = this;
        this.storage.del(user).then(function (user) {
            var index = _this.todos.indexOf(user);
            _this.users.splice(index, 1);
        });
    };


})();
