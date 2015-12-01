(function () {
    'use strict';

    angular
        .module('KidsBux')
        .factory('ChildrenService', ChildrenService);

    ChildrenService.$inject = ['$http', 'Azureservice'];  // not using http, azureservice wraps azure mobile sercice calls. add to app too to propagate
    function ChildrenService($http, Azureservice) {       //https://github.com/TerryMooreII/angular-azure-mobile-service
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.GetByUsernameChildname = GetByUsernameChildname;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return Azureservice.getAll('Children')
                .then(function(items) {
                    console.log('Query successful');
                    return items;
                }, function(err) {
                    console.error('Azure Error: ' + err);
                });        
        }

        function GetById(id) {
            return Azureservice.getById('Children', id)
                .then(function (item) {
                    console.log('children service Query successful name=%s', item.childname);
                    return item;
                }, function (err) {
                    console.error('Azure Error: ' + err);
                });
        }

        function GetByUsername(username) {
            console.log("childrenservice:getbyusername = %s", username);
            return Azureservice.query('Children', {
                criteria: {
                    username: username
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("childrenservice:getbyusername done. count= %s", items.length);
                    return items;

                }, function (err) {
                    console.error('There was an error quering Azure ' + err);
                });
        }

        function GetByUsernameChildname(username, childname) {
            console.log("childrenservice:getbyusernamechildname = %s %s", username, childname);
            return Azureservice.query('Children', {
                criteria: {
                    username: username,
                    childname: childname
                }
            })
                .then(function (items) {
                    // Assigin the results to a $scope variable 
                    console.log("childrenservice:getbyusernamechildname done. count= %s", items.length);
                    return items;

                }, function (err) {
                    console.error('childrenservice:getbyusernamechildname There was an error quering Azure ' + err);
                });
        }

        function Create(child) {
            return Azureservice.insert('Children', child);
                // unfortunately there is an error angular about etg headers that can be ignored.
                //.then(function () {
                //    console.log('Insert successful');
                //}, function (err) {
                //    console.error('Azure Error: ' + err);
                //});
        }

        function Update(child) {
            return Azureservice.update('Children',
                child
                //,
                //{
                //    criteria: {username : child.username, childname:child.childname},
                //}
                )
            .then(function () {
                console.log('childservice Update successful');
            }, function (err) {
                console.error('Azure Error: ' + err);
            });
        }

        function Delete(id) {
            return Azureservice.del('Children',
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
