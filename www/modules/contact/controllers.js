'use strict';

angular.module('Contact')

    .controller('contactController', ['$scope', '$window', function ($scope, $window) {
        $scope.message = 'Contact Controller';
    }]);
