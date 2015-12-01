'use strict';

angular.module('About')

.controller('aboutController',
    ['$scope',
    function ($scope) {
        $scope.message = 'About Controller';
    }]);