(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('ChoresTransactionsService', ChoresTransactionsService);

    ChoresTransactionsService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function ChoresTransactionsService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetByUsernameChild = GetByUsernameChild;
        service.GetByUsernameChildDate = GetByUsernameChildDate;

        return service;

        function GetAll() {
            return Azureservice.getAll('ChoreTransactions')
                .then(function (items) {
                    console.log('Query successful');
                    return items;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetById(id) {
            return Azureservice.getById('ChoreTransactions', id)
                .then(function (item) {
                    console.log('Query successful');
                    return item;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetByUsername(username) {
            return Azureservice.query('ChoreTransactions', {
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
            return Azureservice.query('ChoreTransactions', {
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

        function GetByUsernameChildDate(username, childname, date) {
            var datecheck = new Date(date);
            datecheck.setHours(datecheck.getHours() - 23);  //horrible kludge for time zone diffs. works good enough...
            console.log('GetByUsernameChildDate user,childdate= ' + username, childname, datecheck);
            return Azureservice.query('ChoreTransactions', {
                // need to create our our filter this is how one does it.
                criteria: function (param) {
                    return this.username == param[0] && this.childname == param[1] && this.date >= param[2];  // The this keyword is in referece to the Azure results
                },
                params: [username, childname, datecheck],
                orderBy: [{
                    column: 'date',
                    direction: 'desc'
                }],
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("transactionservice date returns %s transactions for %s %s", items.length, username, childname);
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function Create(transaction) {
            return Azureservice.insert('ChoreTransactions', transaction);
            // unfortunately there is an error angualr about etg headers that can be ignored.
            //.then(function () {
            //    console.log('Insert successful');
            //}, function (err) {
            //    console.error('Azure Error: ' + err);
            //});
        }

        function Update(transaction) {
            console.log('updating a chore ', JSON.stringify(transaction));

            return Azureservice.update('ChoreTransactions',
                transaction
                //{
                //     id: transaction.id,
                //}
                )
            .then(function () {
                console.log('Update successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            });
        }


        function Delete(id) {
            return Azureservice.del('ChoreTransactions',

                {
                    id: id
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
