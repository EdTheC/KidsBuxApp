(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ChoresController', ChoresController);

    ChoresController.$inject = ['$location', 'ChoresService', 'ChildrenService', '$rootScope', '$scope', '$timeout'];
    function ChoresController($location, ChoresService, ChildrenService, $rootScope, $scope) {
        var vm = this;

        vm.user = null;
        vm.allChores = [];
        vm.deleteChore = deleteChore;
        vm.username = $rootScope.globals.currentUser.username;
        vm.childname = $rootScope.globals.currentUser.currentchild;
        vm.addChore = addChore;
        vm.assumeDone = true;
        vm.repeat = [
            {
                index: 0,
                frequency: 'Once',
            },
            {
                index: 1,
                frequency: 'Daily',
            },
            {
                index: 2,
                frequency: 'Sundays',
            },
            {
                index: 3,
                frequency: 'Mondays',
            },
            {
                index: 4,
                frequency: 'Tuesdays',
            },
            {
                index: 5,
                frequency: 'Wednesdays',
            },
            {
                index: 6,
                frequency: 'Thursdays',
            },
            {
                index: 7,
                frequency: 'Fridays',
            },
            {
                index: 8,
                frequency: 'Saturdays',
            },
            {
                index: 9,
                frequency: 'Every 2 weeks',
            },
            {
                index: 10,
                frequency: 'Monthly',
            }
        ];
        vm.selected = 'Daily';
        vm.selRepeat = selRepeat;

        vm.defaultForm = {
            description: "",
            startdate: Date.today(),
            penalty: 0,
            penaltycount: 1,
            frequency: 'Daily',
            assumedone: true,
        };

        initController();

        function initController() {
            vm.childname = $rootScope.globals.currentUser.currentchild;
            vm.username = $rootScope.globals.currentUser.username;

            vm.transaction = {
                description: "",
                startdate: Date.today(),
                penalty: 0,
                penaltycount: 1,
                frequency: 'Daily',
                assumedone: true,
            };
            loadAllChores()
        }


        function loadAllChores() {
            return ChoresService.GetByUsernameChild(vm.username, vm.childname)
                .then(function (chores) {
                    vm.allChores = chores;
                });
        }

        function deleteChore(id) {
            ChoresService.GetById(id)
            .then(function (chore) {
                if (confirm('Are you sure want to permanently remove ' + chore.description + '?') == true) {
                    ChoresService.Delete(id)
                    .then(function () {
                        loadAllChores();
                        $location.path('/chores'); 
                    });
                }
                else {
                    $location.path('/children');
                }
            })
        }

        function addChore() {
            var _this = this;
            //console.log('adding chore ', JSON.stringify(vm.transaction));
            vm.transaction.username = $rootScope.globals.currentUser.username;
            vm.transaction.childname = $rootScope.globals.currentUser.currentchild;
            console.log('assumedone = ' + vm.assumeDone + ' transassdone= ' + vm.transaction.assumedone);
            if (vm.assumeDone == true)
                vm.transaction.assumedone = true;
            else
                vm.transaction.assumedone = false;
            vm.transaction.startdate.setHours(0,0,0,0); 
            switch (vm.selected) {
                case 'Sundays':
                    vm.transaction.frequency = 'Sunday'
                    break;
                case 'Mondays':
                    vm.transaction.frequency = 'Monday'
                    break;
                case 'Tuesdays':
                    vm.transaction.frequency = 'Tuesday'
                    break;
                case 'Wednesdays':
                    vm.transaction.frequency = 'Wednesday'
                    break;
                case 'Thursdays':
                    vm.transaction.frequency = 'Thursday'
                    break;
                case 'Fridays':
                    vm.transaction.frequency = 'Friday'
                    break;
                case 'Saturdays':
                    vm.transaction.frequency = 'Saturday'
                    break;
                default:
                    vm.transaction.frequency = vm.selected;
            }

            ChoresService.Create(vm.transaction)
            .then(function (response) {
                //console.log("addedtransaction");
                loadAllChores();  //update the list now.
                $scope.form.$setPristine();
                vm.transaction = {
                    description: "",
                    startdate: Date.today(),
                    penalty: 0,
                    penaltycount: 1,
                    frequency: 'Daily',
                    assumedone: true,
                };
            });
        }

        function selRepeat() {
            console.log('selected = ' + vm.selected);
        }

    }

})();