(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ChildrenController', ChildrenController);

    ChildrenController.$inject = ['$location', 'ChildrenService', 'TransactionsService', '$rootScope', 'UserService', '$scope', '$cookieStore'];
    function ChildrenController($location, ChildrenService, TransactionsService, $rootScope, UserService, $scope, $cookieStore) {
        var vm = this;

        vm.allChildren = [];
        vm.deleteChild = deleteChild;
        vm.editChild = editChild;
        vm.addChild = addChild;
        vm.user = null;
        vm.username = $rootScope.globals.currentUser.username;
        vm.transactChild = transactChild;
        vm.recurringTransactions = recurringTransactions;

        initController();

        function initController() {
            loadAllChildren()
                .then(function () {
                    updateAllowance()
                });
        }

        // test each child for allowance and adds in weekly if today has past a recurrence
        function updateAllowance()
        {
            console.log('Updating Allowance...');
            angular.forEach(vm.allChildren, function (child) {
                // dont bother if no weekly set
                console.log('checking child ' + child.childname);
                if (child.weekly != null && child.weekly != 0) {
                    var today = moment();
                    console.log('today is ' + today.format() + 'child last weekly ' + child.lastweekly + 'amount= ' + child.weekly + 'day= ' + child.allowanceday);
                    var dateCheck = moment(child.lastweekly);
                    var dateLastWeekly = moment();
                    var interval = moment(child.lastweekly).recur().every('Friday').dayOfWeek();
                    dateCheck.add(1, 'd');
                    // check every day through today if its an allowance day. 
                    while (dateCheck.isSameOrBefore(today)) {
                        if (interval.matches(dateCheck)){
                            // allowance day needs to be added to transactions here.
                            vm.transaction = {
                                username : $rootScope.globals.currentUser.username,
                                childname : child.childname,
                                description: 'Allowance',
                                amount: child.weekly,
                                deposit: true,
                                date: dateCheck
                            };
                            // update the balance too
                            child.balance += child.weekly;
                            TransactionsService.Create(vm.transaction)
                            .then(function () {
                                // remember the last day set
                                dateLastWeekly = dateCheck;
                                console.log(' added allowance date= ' + dateCheck.format());
                            })
                        }
                        // next day
                        dateCheck.add(1, 'd');
                    }
                    // set lastweekly here 
                    child.lastweekly = dateLastWeekly;
                    ChildrenService.Update(child);
                }
            })
        }


        function loadAllChildren() {
            vm.username = $rootScope.globals.currentUser.username;  //used in html
            console.log("loading all children for username %s", $rootScope.globals.currentUser.username);
            var promise = 
                ChildrenService.GetByUsername($rootScope.globals.currentUser.username)
                    .then(function (children) {
                        vm.allChildren = children;
                        console.log("all children for %s loaded. vm Length=%d childrenlen=%d", $rootScope.globals.currentUser.username, vm.allChildren.length, children.length);
                    });
            return promise;
        }

        function deleteChild(id) {
            //console.log("delete id = %s", id);
            ChildrenService.GetById(id)
            .then(function (child) {
                if (confirm('Are you sure want to permanently remove ' + child.childname + '?') == true) {
                    ChildrenService.Delete(id)
                    .then(function () {
                        loadAllChildren();
                        console.log("delete going home");
                        $location.path('/children');
                    });
                }
                else {
                    $location.path('/children');
                }
            })
        }

        // set current child and then go to child edit page
        function editChild(id) {
            //console.log("edit id = %s", id);
            ChildrenService.GetById(id)
            .then(function (child) {
                console.log(" edit child ");
                $location.path('/child');
                return child;
            });
        }
        // set current child and then go to child transactions page
        function transactChild(id) {
            console.log("transactChild:transact id = %s", id);
            ChildrenService.GetById(id)
            .then(function (child) {
                $rootScope.globals.currentUser.currentchild = child.childname;

                $cookieStore.put('globals', $rootScope.globals);  //update current child in case refresh

                console.log(" transactchild done for %s ", $rootScope.globals.currentUser.currentchild);
                $location.path('/transactions');
                return child;
            });
        }

        // set current child and then go to child recurring transactions page
        function recurringTransactions(id) {
            console.log("recurringTransactions id = %s", id);
            ChildrenService.GetById(id)
            .then(function (child) {
                $rootScope.globals.currentUser.currentchild = child.childname;

                $cookieStore.put('globals', $rootScope.globals);  //update current child in case refresh
                $location.path('/recurring');
                return child;
            });
        }


        function addChild() {
            var _this = this;
            vm.child.username = $rootScope.globals.currentUser.username;
            vm.child.balance = 0;  //starts with zero balance
            console.log("adding child for username %s", vm.child.username);
            ChildrenService.Create(vm.child)
            .then(function (response) {
                console.log("addedchild ");
                loadAllChildren();  //update the list now.
                $scope.form.$setPristine();
                vm.child = {
                    childname: "",
                };

            }
            );
        }
    }

})();