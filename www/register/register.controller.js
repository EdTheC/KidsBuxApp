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
                        // appery user?
                        var isApperyUser = { test: false };
                        ApperyService.CheckExistingUser(uname, pword, isApperyUser)
                        .then(function () {
                            // yes, appery user.
                            ApperyService.GetAllChildren(uname)
                            .then (function (children){
                                // copy all children
                                vm.AllChildren = children;
                                for (var i = 0; i < children.length; i++) {
                                    child.username = uname;
                                    child.childname = children[i].Child;
                                    if (children[i].UserID == uname) {              // stupid service gets em all
                                        // only if child belongs to this user
                                        ChildrenService.Create(child)
                                        .then ();
                                    }
                                }
                            })
                            ApperyService.GetAllTransactions(uname)
                            .then(function (transactions) {
                                console.log('transcations length = ' + transactions.length);
                                    for (var i = 0; i < transactions.length; i++) {
                                        // copy all transactions for this user transactions
                                        transaction.username = uname;
                                        transaction.childname = transactions[i].ChildName;
                                        transaction.date = transactions[i].Date;
                                        transaction.amount = transactions[i].Amount;
                                        transaction.description = transactions[i].For;
                                        TransactionsService.Create(transaction)
                                        .then();
                                    }
                                    // get balance for each child
                                    for (var c = 0; c < vm.AllChildren.length; c++) {
                                        vm.AllChildren[c].Amount = 0;
                                        for (var i = 0; i < transactions.length; i++) {
                                            if (transactions[i].ChildName == vm.AllChildren[c].Child) {
                                                vm.AllChildren[c].Amount += transactions[i].Amount;
                                            }
                                        }
                                    }
                                    for (var c = 0; c < vm.AllChildren.length; c++) {
                                        // this is a good time to update the child's balance, so use the Children service to do so
                                        ChildrenService.GetByUsernameChildname(uname, vm.AllChildren[c].Child)
                                        .then(function (children) {
                                            var bal = 0;
                                            for (var i = 0; i < transactions.length; i++) {
                                                if (transactions[i].ChildName == children[0].childname) {
                                                    bal += transactions[i].Amount;
                                                }
                                            }
                                            console.log('then bal = ' + bal );

                                            children[0].balance = bal;
                                            ChildrenService.Update(children[0])
                                            .then(function () { })
                                        })
                                    }


                            })

                             //finally delete the user so this does not happen again

                        })

                        //  user does not exist, add in 
                                                                                        
                        console.log("regsiter new user = %s", vm.user.username);
                        vm.user.referrer = 'Amazon Underground';   // Amazon Googgle Play io.cordova.kidsbux1b00f53567404092b26c288159905c38 Amazon Underground io.appery.project342416 old io.appery.project189621.underground old io.cordova.myapp1b00f53567404092b26c288159905c38
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
