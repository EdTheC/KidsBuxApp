(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('TransactionsController', TransactionsController);

    TransactionsController.$inject = ['$location', 'TransactionsService', 'ChildrenService', '$rootScope', '$scope', '$timeout'];
    function TransactionsController($location,TransactionsService, ChildrenService, $rootScope, $scope, $timeout) {
        var vm = this;

        vm.user = null;
        vm.allTransactions = [];
        vm.deleteTransaction = deleteTransaction;
        vm.username = $rootScope.globals.currentUser.username;
        vm.childname = $rootScope.globals.currentUser.currentchild;
        vm.addTransaction = addTransaction;
        vm.viewChoreTransactions = viewChoreTransactions;

        vm.defaultForm = {
            description: "",
            amount: "",
            date: Date.today()
        };

        initController();

        function initController() {
            vm.transaction = {
                description: "",
                amount: "",
                date: Date.today(),
                ispenalty: 0,
            };
            loadAllTransactions();
            vm.childname = $rootScope.globals.currentUser.currentchild;
        }


        function loadAllTransactions() {
            TransactionsService.GetByUsernameChild(vm.username, vm.childname)
                .then(function (transactions) {
                    console.log("transactionservice all loaded count = %d", transactions.length);
                    // calculate the balance
                    vm.balance = 0;
                    for (var i = 0; i < transactions.length; i++) {
                        var num = transactions[i].amount;
                        if (transactions[i].deposit=='false' && num > 0) {
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
                    // this is a good time to update the child's balance, so use the Children service to do so
                    ChildrenService.GetByUsernameChildname(vm.username, vm.childname)
                    .then(function (children) {
                        children[0].balance = vm.balance;
                        ChildrenService.Update(children[0])
                        .then(function () { })
                    })
                });
        }

        function deleteTransaction(id) {
            console.log('delete transaction ' + id);
            TransactionsService.GetById(id)
            .then(function (transaction) {
                if (confirm('Are you sure want to permanently remove ' + transaction.description + '?') == true) {
                    TransactionsService.Delete(id)
                    .then(function () {
                        loadAllTransactions();
                        $location.path('/transactions');
                    });
                }
                else {
                    $location.path('/transactions');
                }
            })
        }

        function viewChoreTransactions(id) {
            $timeout(function () {
                $location.path('/chorestransactions');
            });
        }


        function addTransaction() {
            var _this = this;
            //console.log("adding transaction for %s deposit=%s", $rootScope.globals.currentUser.currentchild, vm.transaction.deposit);
            vm.transaction.username = $rootScope.globals.currentUser.username;
            vm.transaction.childname = $rootScope.globals.currentUser.currentchild;
            console.log("deposit=%s", this.transaction.deposit);
            if (this.transaction.deposit == 'false' && this.transaction.amount > 0)
                this.transaction.amount = -this.transaction.amount;
            TransactionsService.Create(vm.transaction)
            .then(function (response) {  //note: response will have the id
                console.log('addedtransaction id= ' + response.id + 'response= ' + JSON.stringify(response));
                loadAllTransactions();  //update the list now.
                $scope.form.$setPristine();
                vm.transaction = {
                    description: "",
                    amount: "",
                    date: Date.today(),
                    ispenalty: 0,
                };
            }
            );
        }


    }

})();