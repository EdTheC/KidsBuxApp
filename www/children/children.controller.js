(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ChildrenController', ChildrenController);

    ChildrenController.$inject = ['$location', 'ChildrenService', 'TransactionsService', '$rootScope', 'UserService', '$scope', '$cookieStore', 'ChoresService', 'ChoresTransactionsService', '$q', '$timeout'];
    function ChildrenController($location, ChildrenService, TransactionsService, $rootScope, UserService, $scope, $cookieStore, ChoresService, ChoresTransactionsService, $q, $timeout) {
        var vm = this;

        vm.allChildren = [];
        vm.allChores = [];
        vm.allChoresTransactions = [];
        vm.deleteChild = deleteChild;
        vm.editChild = editChild;
        vm.addChild = addChild;
        vm.choreChild = choreChild;
        vm.user = null;
        vm.username = $rootScope.globals.currentUser.username;
        vm.transactChild = transactChild;
        vm.recurringTransactions = recurringTransactions;

        initController();

        function initController() {
            loadAllChildren()
            .then(function () {
                updateChores()
                .then(function () {
                    updateAllowance()
                    .then(function () {
                        recalcBalance();
                    })
                });
            })
        }


        // test each chore for this child to make sure *all* transactions for it are entered in choretransactions, and any penalties are in the transactions
        // this should be done BEFORE any totals so we have everything up to date to add into the total
        // note we don only to today do today's chores appear in the todo list
        function updateChores() {
            console.log('Updating Chores...');
            var todaydate = new Date();
            todaydate.setHours(0, 0, 0, 0);
            var today = moment(todaydate);
            return ChoresService.GetByUsername(vm.username)   // get all defined chores for this user
            .then(function (chores) {
                //  add to the allChoresTransactions array. dont do DB yet, must check for penalties first
                console.log('update chores: after get all chores');
                vm.allChores = chores;
                angular.forEach(vm.allChores, function (chore) {
                    if (chore.lastdate == null)  // last not set, assume start
                        chore.lastdate = chore.startdate;
                    var dateCheck = moment(chore.lastdate);
                    console.log('checking chore ' + chore.description + 'for '+ chore.childname + ' today is ' + today.format() + 'chore last ' + dateCheck.format());
                    // determine interval based on recurrence
                    var interval = setInterval(chore);
                    if (!datecompare(chore.lastdate, '===',chore.startdate))
                        dateCheck.add(1, 'd');  //start day after start date as long start!=last, which means the chore was just entered and has not been processed
                    //
                    // check every day through today. if it's a chore day, add the transaction to chorestransactions
                    //
                    while (!datecompare(dateCheck, '>', today))   {             //dateCheck.isSameOrBefore(today)) <-- dont use this, hrs, min, sec screws it up
                        console.log('chores update checking date ', dateCheck.format());
                        if (interval.matches(dateCheck)) {
                            // chore needs to be added to chorestransactions here.
                            var chorestransaction = {
                                username: $rootScope.globals.currentUser.username,
                                childname: chore.childname,
                                chore: chore.description,
                                date: dateCheck,
                                done: chore.assumedone,
                                penalty: chore.penalty,
                                penaltytransid: null,
                                frequency: chore.frequency,
                                ispenalty:0,
                            };
                            // found a match save the transaction as it is so far
                            //console.log('chores update date checked', dateCheck.format() + 'MATCH FOUND');
                            //console.log(' chorestransaction = ', JSON.stringify(chorestransaction));
                            var transcopy = angular.copy(chorestransaction);  // must copy because push pushes reference
                            vm.allChoresTransactions.push(transcopy);  // need these for the next step
                        }
                        // next day
                        dateCheck.add(1, 'd');
                    }   //end while
                }) //next chore

                // now that we have a transaction array, see if there are any penalties
                var promises = [];  // stack up the enter transactions requests. we can only do the next step when they are all done.

                angular.forEach(vm.allChoresTransactions, function (trans) {
                    console.log(' chorestransaction in penaly check = ', JSON.stringify(trans));
                    if (trans.penalty != 0 && trans.done == 'false') {
                        // create a transaction for transactions database
                        var amt = trans.penalty > 0 ? -trans.penalty : trans.penalty;
                        var transaction = {
                            username: $rootScope.globals.currentUser.username,
                            childname: trans.childname,
                            description: trans.chore +  ' (not done)',
                            amount: amt,
                            date: trans.date,
                            deposit: 'false',
                            ispenalty: 1,
                        };
                        console.log(' penalty found ' + JSON.stringify(transaction));
                        promises.push(TransactionsService.Create(transaction)
                            .then(function (transback) {
                                console.log('After penalty tranasction create, trans= ' + JSON.stringify(transback));
                                trans.penaltytransid = transback.id;
                            }));

                    }
                })

                return $q.all(promises);
            })

                // after the chores are all created, and after all transactions done (we need the ID of penalty ones before we commit them), 
                // we now can place them into the database chorestransactions table.
            .then(function () {
                console.log('updating chores: adding all transactions to ChoresTransactions');
                var promises = [];
                angular.forEach(vm.allChoresTransactions, function (trans) {
                    console.log(' before chorestran add to db ' + JSON.stringify(trans));
                    promises.push(ChoresTransactionsService.Create(trans)
                    .then(function () {
                        console.log(' added chore trans to db' + trans.chore + ' date= ' + trans.date.format());
                    }))
                })

                return $q.all(promises);
            })

                // last, but not least, update the chores lastday
            .then(function () {
                console.log('updating chores: updating all chores lastdates');
                var promises = [];
                angular.forEach(vm.allChores, function (chore) {
                    chore.lastdate = today;
                    promises.push(ChoresService.Update(chore)); 
               })

                return $q.all(promises);
            })

        }

        // test each child for allowance and adds in weekly if today has past a recurrence
        function updateAllowance()
        {
            var promises = [];
            console.log('Updating Allowance...');
            angular.forEach(vm.allChildren, function (child) {
                // dont bother if no weekly set
                console.log('checking child ' + child.childname);
                if (child.weekly != null && child.weekly != 0) {
                    var todaydate = new Date();
                    todaydate.setHours(0, 0, 0, 0);
                    var today = moment(todaydate);
                    console.log('today is ' + today.format() + 'child last weekly ' + child.lastweekly + 'amount= ' + child.weekly + 'day= ' + child.allowanceday);
                    var dateCheck = moment(child.lastweekly);
                    var dateLastWeekly = moment();
                    var interval = moment(child.lastweekly).recur().every('Friday').dayOfWeek();
                    dateCheck.add(1, 'd');
                    // check every day through today if its an allowance day. 
                    while (!datecompare(dateCheck, '>', today))   {             //dateCheck.isSameOrBefore(today)) <-- dont use this, hrs, min, sec screws it up
                        if (interval.matches(dateCheck)){
                            // allowance day needs to be added to transactions here.
                            vm.transaction = {
                                username : $rootScope.globals.currentUser.username,
                                childname : child.childname,
                                description: 'Allowance',
                                amount: child.weekly,
                                deposit: true,
                                date: dateCheck,
                                ispenalty:0,
                            };
                            // update the balance too
                            child.balance += child.weekly;
                            promises.push(TransactionsService.Create(vm.transaction)
                            .then(function () {
                                // remember the last day set
                                dateLastWeekly = dateCheck;
                                console.log(' added allowance date= ' + dateCheck.format());
                            }))
                        }
                        // next day
                        dateCheck.add(1, 'd');
                    }
                    // set lastweekly here 
                    child.lastweekly = dateLastWeekly;
                    console.log('child=' + JSON.stringify(child));

                    var child2 = angular.toJson(child);   // this rids the stupid $$haskey error.
                    //ChildrenService.Update(child2);
                    promises.push(ChildrenService.UpdateLastWeekly(child.id, dateLastWeekly));
                }
            })
            return $q.all(promises);

        }

        function recalcBalance() {
            var promises = [];
            // update all children balances at this time.
            angular.forEach(vm.allChildren, function (child) {
                console.log('updating balance for ' + child.childname);
                promises.push(TransactionsService.GetByUsernameChild(vm.username, child.childname)
                .then(function (transactions) {
                    console.log("recalcBalance: transactionservice all loaded count = %d", transactions.length);
                    // calculate the balance
                    vm.balance = 0;
                    for (var i = 0; i < transactions.length; i++) {
                        var num = transactions[i].amount;
                        if (transactions[i].deposit == 'false' && num > 0) {
                            num = -num;
                        }
                        //console.log("transactions bal=%d num=%d", vm.balance, num);
                        vm.balance += num;

                        // format date and money while we are at it
                        var theDate = new Date(transactions[i].date);
                        transactions[i].date = theDate.toString("MMM dd, yyyy");
                        //console.log('transact amount ' + transactions[i].amount);
                        transactions[i].formattedamount = transactions[i].amount.toFixed(2).replace(/./g, function (c, i, a) {
                            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                        });
                        //console.log('transact formatted ' + transactions[i].formattedamount + ' tofix ' + transactions[i].amount.toFixed(2));
                    }
                    vm.allTransactions = transactions;
                    vm.balance = vm.balance.toFixed(2).replace(/./g, function (c, i, a) {   //format else you might get extra junk.
                        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                    });
                    // time to update the child's balance, so use the Children service to do so
                    child.balance = vm.balance;
                    delete child['$$hashKey'];
                    console.log('after remove haskey, cnhild= ' + JSON.stringify(child));
                    promises.push(ChildrenService.Update(child));
                }))
            })

            return $q.all(promises);
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

        // set current child and then go to child chores page
        function choreChild(name) {
            console.log('chorechild name=', name);
            $rootScope.globals.currentUser.currentchild = name;
            $cookieStore.put('globals', $rootScope.globals);  //update current child in case refresh
            $timeout(function () {
                $location.path('/chorestransactions');
            });
            //$location.path('/chorestransactions');   
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