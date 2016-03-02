(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('UserService', UserService);

    UserService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function UserService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.CheckExistingUser = CheckExistingUser;
        service.GetByEmail = GetByEmail;

        return service;

        function GetAll() {
            return Azureservice.getAll('Users')
                .then(function(items) {
                    console.log('Query successful');
                    return items;
                }, function(err) {
                    console.error('Azure Error: ' + err);
                });        
        }

        function GetById(id) {
            return Azureservice.getById('Users', id)
                .then(function (item) {
                    console.log('Query successful');
                    return item;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetByUsername(username) {
alert('query username='+username+'=');
            return Azureservice.query('Users', {
                criteria: {
                    username: username
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    alert("query username success");
                    return items;

                }, function (err) {
                    alert('query username FAIL=' + err);
                    console.error('There was an error quering Azure ' + err);
                });
        }
        function GetByEmail(email) {
            console.log("GetbyEmail=%s", email);
            return Azureservice.query('Users', {
                criteria: {
                    email:email
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("getbyemail success");
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function Create(user) {
            return Azureservice.insert('Users', user);
                // unfortunately there is an error angualr about etg headers that can be ignored.
                //.then(function () {
                //    console.log('Insert successful');
                //}, function (err) {
                //    console.error('Azure Error: ' + err);
                //});
        }

        function Update(user) {
            return Azureservice.update('Users',
                user, 
                {
                    criteria: {username : user.username},
                }
            .then(function () {
                console.log('Update successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            }));
        }

        function Delete(id) {
            return Azureservice.del('Users',
                
                {
                    id : id
                })
            .then(function () {
                console.log('delete successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            });

        }

        function CheckExistingUser(username, isUser) {
            var promise = Azureservice.query('Users', {
                criteria: {
                    username: username
                }
            })
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
