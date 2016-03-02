(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('ChoresService', ChoresService);

    ChoresService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function ChoresService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
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
            return Azureservice.getAll('Chores')
                .then(function (items) {
                    console.log('Query all of chores successful');
                    return items;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetById(id) {
            return Azureservice.getById('Chores', id)
                .then(function (item) {
                    console.log('Query id of chores successful');
                    return item;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetByUsername(username) {
            return Azureservice.query('Chores', {
                criteria: {
                    username: username
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log('chores get by user name ' + username + ' returned count= ' + items.length);
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        // returns all chores for the username + childname
        function GetByUsernameChild(username, childname) {
            return Azureservice.query('Chores', {
                criteria: {
                    username: username,
                    childname: childname
                }, orderBy: [{
                    column: '__createdAt',
                    direction: 'desc'
                }]
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("choresservice returns %s chore(s) for %s %s", items.length, username, childname);
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function Create(transaction) {
            return Azureservice.insert('Chores', transaction);
            // unfortunately there is an error angualr about etg headers that can be ignored.
            //.then(function () {
            //    console.log('Insert successful');
            //}, function (err) {
            //    console.error('Azure Error: ' + err);
            //});
        }

        function Update(chore) {
            return Azureservice.update('Chores',
                chore
                //{
                //    id: id,
                //    lastdate: date,
                //}
                )
            .then(function () {
                console.log('Update of chore successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            });
        }

        function Delete(id) {
            return Azureservice.del('Chores',

                {
                    id: id
                })
            .then(function () {
                console.log('delete of chore successful');
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
