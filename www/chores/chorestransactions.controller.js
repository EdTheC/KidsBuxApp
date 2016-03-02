(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ChoresTransactionsController', ChoresTransactionsController);

    ChoresTransactionsController.$inject = ['$location', 'ChoresService', 'ChildrenService', '$rootScope', '$scope',
                                            '$q',
                                            '$anchorScroll', '$cookieStore', 'ChoresTransactionsService', 'TransactionsService', '$timeout'];
    function ChoresTransactionsController($location, ChoresService, ChildrenService, $rootScope, $scope,
                                            $q, 
                                            $anchorScroll, $cookieStore, ChoresTransactionsService, TransactionsService, $timeout) {
        var vm = this;
        console.log('ChoresTransactionsController');

        vm.user = null;
        vm.allChores = [];
        vm.choresHistory = [];
        vm.editDone = editDone;
        vm.deleteChore = deleteChore;
        vm.addChore = addChore;
        vm.onDateChange = onDateChange;
        vm.username = $rootScope.globals.currentUser.username;
        vm.childname = $rootScope.globals.currentUser.currentchild;
        vm.clickedDone = clickedDone;
        vm.transaction = [];

        vm.defaultForm = {
            date: Date.today(),
        };

        initController();

        function initController() {
            console.log('ChoresTransactionsController initializing...');
            vm.childname = $rootScope.globals.currentUser.currentchild;
            vm.username = $rootScope.globals.currentUser.username;
            var today = new Date();
            var beginofmonth = new Date(today.getFullYear(), today.getMonth(), 1); // show history from start of the month
            vm.transaction = {
                date: beginofmonth,
            };
            loadHistory()
            .then(function () {
                if (vm.choresHistory.length == 0) {
                    $timeout(function () {
                        $location.path('/chores');
                    });
                }
            })

        }

        function loadHistory() {
            return ChoresTransactionsService.GetByUsernameChildDate(vm.username, vm.childname, vm.transaction.date)
                .then(function (chores) {
                    vm.choresHistory = chores;
                    angular.forEach(vm.choresHistory, function (chore) {
                        var theDate = new Date(chore.date);
                        chore.date = theDate.toString("MMM dd, yyyy");
                        console.log(' returned history chore = ' + JSON.stringify(chore));
                    });
                });
        }

        function editDone(id) {
            $rootScope.globals.currentUser.currentchore = id;
            $cookieStore.put('globals', $rootScope.globals);  //update current child in case refresh
            $timeout(function () {
                $location.path('/children');
            });
        }

        function deleteChore(id) {
            $rootScope.globals.currentUser.currentchore = id;
            $cookieStore.put('globals', $rootScope.globals);  //update current child in case refresh
            $timeout(function () {
                $location.path('/chores');
            });
        }

        function addChore() {
            $timeout(function () {
                $location.path('/chores');
            });
        }

        function onDateChange(date) {
            console.log('date change ' + date);
            loadHistory();
        }

        // this is hit when the checkbox is clicked.
        // if the chore is marked not done, add penalty. If done, remove penalty.
        function clickedDone(choretrans) {
            var promises = [];
            //console.log(' clicked done state b4= ' + chore.done);
            if (choretrans.done == 1)
                choretrans.done = 0;
            else
                choretrans.done = 1;
            console.log(' clicked done state = ' + choretrans.done);
            // if the chore transaction goes to false, we add a penalty to the regualr transactions.
            // if the chore becomes true, we remove the penalty transaction.
            if (choretrans.done) {
                // the chore is done, remove any penalty transaction
                if (choretrans.penaltytransid != null){
                    // we have a transaction pointer, so rid it.
                    console.log('clickdone: pushing delete');
                    promises.push(TransactionsService.Delete(choretrans.penaltytransid)
                    .then(function () {
                        choretrans.penaltytransid = null;
                        //update the state and id of the chore tranasctions (must be in then part else happens before other promise)
                        var fdate = new Date(choretrans.date);
                        var trans = {
                            id: choretrans.id,
                            username: choretrans.username,
                            childname: choretrans.childname,
                            date: fdate,
                            chore: choretrans.chore,
                            done: true,
                            penalty: choretrans.penalty,
                            penaltytransid: null,
                            frequency: choretrans.frequency,
                        };

                        promises.push(ChoresTransactionsService.Update(trans));
                    }));
                }
            } else {
                // the chores is not done, add penalty
                // create a transaction for transactions database
                var amt = choretrans.penalty > 0 ? -choretrans.penalty : choretrans.penalty;
                var fdate = new Date(choretrans.date);
                var transaction = {
                    username: $rootScope.globals.currentUser.username,
                    childname: choretrans.childname,
                    description: choretrans.chore + ' (not done)',
                    amount: amt,
                    date: fdate,
                    deposit: 'false',
                    ispenalty:1,
                };
                console.log(' penalty found adding trans = ' + JSON.stringify(transaction));
                promises.push(TransactionsService.Create(transaction)
                    .then(function (transback) {
                        console.log('After penalty tranasction create, transback= ' + JSON.stringify(transback));
                        choretrans.penaltytransid = transback.id;
                        // the transactions has a hard time with the fact that the returned choretrans has $$haskey in it. remove it. (brute force)
                        var fdate = new Date(choretrans.date);
                        var trans = {
                            id: choretrans.id,
                            username: choretrans.username,
                            childname: choretrans.childname,
                            date:fdate,
                            chore:choretrans.chore,
                            done:false,
                            penalty:choretrans.penalty,
                            penaltytransid:choretrans.penaltytransid,
                            frequency:choretrans.frequency,
                        };
                        console.log('After penalty tranasction create, trans= ' + JSON.stringify(trans));
                        //update the state and id of the chore tranasctions (must be in then part else happens before other promise)
                        promises.push(ChoresTransactionsService.Update(trans));
                    }));

            }
            return $q.all(promises);
        }
    }

})();