(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('RecurringController', RecurringController);

    RecurringController.$inject = ['$location',  'ChildrenService', '$rootScope', '$scope'];
    function RecurringController($location, ChildrenService, $rootScope, $scope) {
        var vm = this;

        vm.user = null;
        vm.childname = $rootScope.globals.currentUser.currentchild;
        vm.username = $rootScope.globals.currentUser.username;
        vm.defaultForm = {
            amount: "",
            day:'Friday'
        };

        vm.daysOfWeek = [
            {
                index: 0,
                day: 'Sunday'
            },
            {
                index: 1,
                day: 'Monday'
            },
            {
                index: 2,
                day: 'Tuesday'
            },
            {
                index: 3,
                day: 'Wednesday'
            },
            {
                index: 4,
                day: 'Thursday'
            },
            {
                index: 5,
                day: 'Friday'
            },
            {
                index: 6,
                day: 'Saturday'
            },
        ];

        vm.recurTransaction = recurTransaction;
        vm.selDay = selDay;

        initController();

        function initController() {
            vm.childname = $rootScope.globals.currentUser.currentchild;
            vm.username = $rootScope.globals.currentUser.username;

            ChildrenService.GetByUsernameChildname(vm.username, vm.childname)
            .then(function (child) {
                vm.child = child[0];
                vm.transaction = {
                    amount: vm.child.weekly,
                    day: vm.child.allowanceday
                };
                vm.selected = vm.child.allowanceday;
                console.log(vm.child.childname + ' weekly= ' + vm.child.weekly + ' day= ' + vm.child.allowanceday);
            })
        }

        function recurTransaction() {
            console.log("recurtransaction");
            vm.child.weekly = vm.transaction.amount;
            vm.child.allowanceday = vm.selected;
            ChildrenService.Update(vm.child)
            .then(function () { return });
        }

        function selDay() {
            console.log('selected = ' + vm.selected);
        }

    }

})();