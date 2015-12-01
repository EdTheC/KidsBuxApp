(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function TransactionsService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetByUsernameChild = GetByUsernameChild;

        return service;

        function GetAll() {
            return Azureservice.getAll('Transactions')
                .then(function(items) {
                    console.log('Query successful');
                    return items;
                }, function(err) {
                    console.error('Azure Error: ' + err);
                });        
        }

        function GetById(id) {
            return Azureservice.getById('Transactions', id)
                .then(function (item) {
                    console.log('Query successful');
                    return item;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetByUsername(username) {
            return Azureservice.query('Transactions', {
                criteria: {
                    username: username
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function GetByUsernameChild(username, childname) {
            return Azureservice.query('Transactions', {
                criteria: {
                    username: username,
                    childname: childname
                }, orderBy: [{
                    column: 'date',
                    direction: 'desc'
                }]
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("transactionservice returns %s transactions for %s %s", items.length, username, childname);
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function Create(transaction) {
            return Azureservice.insert('Transactions', transaction);
                // unfortunately there is an error angualr about etg headers that can be ignored.
                //.then(function () {
                //    console.log('Insert successful');
                //}, function (err) {
                //    console.error('Azure Error: ' + err);
                //});
        }

        function Update(transaction) {
            return Azureservice.update('Transactions',
                user, 
                {
                    criteria: {username : child.username},
                }
            .then(function () {
                console.log('Update successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            }));
        }

        function Delete(id) {
            return Azureservice.del('Transactions',
                
                {
                    id : id
                })
            .then(function () {
                console.log('delete successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            });

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
