(function () {
    'use strict';

    angular
        .module('KidsBux')
        .controller('ChildrenController', ChildrenController);

    ChildrenController.$inject = ['$location', 'ChildrenService', '$rootScope', 'UserService', '$scope', '$cookieStore'];
    function ChildrenController($location, ChildrenService,  $rootScope, UserService, $scope, $cookieStore) {
        var vm = this;

        vm.allChildren = [];
        vm.deleteChild = deleteChild;
        vm.editChild = editChild;
        vm.addChild = addChild;
        vm.user = null;
        vm.username = $rootScope.globals.currentUser.username;
        vm.transactChild = transactChild;

        initController();

        function initController() {
            loadAllChildren();
        }


        function loadAllChildren() {
            vm.username = $rootScope.globals.currentUser.username;  //used in html
            console.log("loading all children for username %s", $rootScope.globals.currentUser.username);
            ChildrenService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (children) {
                    vm.allChildren = children;
                    console.log("all children for %s loaded. vm Length=%d childrenlen=%d", $rootScope.globals.currentUser.username, vm.allChildren.length, children.length);
                });
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