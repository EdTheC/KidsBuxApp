'use strict';

//declare modules
angular.module('Authentication', []);
angular.module('Home', []);
angular.module('About', []);
angular.module('Contact', []);
angular.module('LoginController', []);
angular.module('HomeController', []);
angular.module('azureStorage', ['ngResource']);
//angular.module('storage', []);
angular.module('ForgotIDController', []);


angular.module('KidsBux', ['ngRoute',
                            'ngCookies',
                            'KidsBux.services',
                            'Authentication',
                            'Home',
                            'About',
                            'Contact',
                            'LoginController',
                            'HomeController',
                            'ngResource',
                            'azureStorage',
                            'ForgotIDController',
                            'azure-mobile-service.module'
                            ]
)
    // .config(['$compileProvider', function ($compileProvider) {
    //     $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
// }])
.constant('AzureMobileServiceClient', {
    API_URL: 'https://kidsbux.azure-mobile.net/',
    API_KEY: 'QUHdPvJjitkCaTKGgGfJgaNNciNnco34',
})

.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/', {
            controller: 'HomeController',
            templateUrl: 'home/home.view.html',
            controllerAs: 'vm'
        })
        .when('/home', {
            controller: 'HomeController',
            templateUrl: 'home/home.view.html',
            controllerAs: 'vm'
        })

       .when('/login', {
           controller: 'LoginController',
           templateUrl: 'login/login.view.html',
           controllerAs: 'vm'
       })

        .when('/forgotid', {
            controller: 'ForgotIDController',
            templateUrl: 'forgotid/forgotid.view.html',
            controllerAs: 'vm'
        })

       .when('/register', {
           controller: 'RegisterController',
           templateUrl: 'register/register.view.html',
           controllerAs: 'vm'
       })

       .when('/children', {
           controller: 'ChildrenController',
           templateUrl: 'children/children.view.html',
           controllerAs: 'vm'
       })

       .when('/child', {
           controller: 'ChildrenController',
           templateUrl: 'children/child.view.html',
           controllerAs: 'vm'
       })

       .when('/transactions', {
           controller: 'TransactionsController',
           templateUrl: 'transactions/transactions.view.html',
           controllerAs: 'vm'
       })

        			// route for the about page
		.when('/about', {
		    templateUrl: 'modules/about/views/about.html',
		    controller: 'aboutController'
		})

		// route for the contact page
		.when('/contact', {
		    templateUrl: 'modules/contact/views/contact.html',
		    controller: 'contactController'
		})

		// route for the recurring transaction page
		.when('/recurring', {
		    templateUrl: 'recurring/recurring.view.html',
		    controller: 'RecurringController',
		    controllerAs: 'vm'

		})

		// route for the chores age
		.when('/chores', {
		    templateUrl: 'chores/chores.view.html',
		    controller: 'ChoresController',
		    controllerAs: 'vm'

		})
		// route for the choretransactions page
		.when('/chorestransactions', {
		    templateUrl: 'chores/chorestransactions.view.html',
		    controller: 'ChoresTransactionsController',
		    controllerAs: 'vm'

		})

        .otherwise({ redirectTo: '/login' });
}])


.run(['$rootScope', '$location', '$cookieStore', '$http',

function run($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        // redirect to login page if not logged in and trying to access a restricted page
        var restrictedPage = $.inArray($location.path(), ['/login', '/register', '/forgotid']) === -1;
        var loggedIn = $rootScope.globals.currentUser;
        if (restrictedPage && !loggedIn) {
            //console.log("restricted and not logged in");
            $location.path('/login');
        }
    });
}]);

// Base64 encoding service used by AuthenticationService
var Base64 = {

    keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
};
/*
 * Generic date compare using DATES only. 
 * 
 * Solves problem of hours, min, secs not being the same for comparison tests
 * 
 * Usage:
 *  datecompare(data1, '===', data2) for equality check,
 *  datecompare(data1, '>', data2) for greater check,
 *  !datecompare(data1, '>', data2) for less or equal check
 * 
 */
function datecompare(date1, sign, date2) {
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    var day1 = d1.getDate();
    var mon1 = d1.getMonth();
    var year1 = d1.getFullYear();
    var day2 = d2.getDate();
    var mon2 = d2.getMonth();
    var year2 = d2.getFullYear();
    if (sign === '===') {
        if (day1 === day2 && mon1 === mon2 && year1 === year2) return true;
        else return false;
    }
    else if (sign === '>') {
        if (year1 > year2) return true;
        else if (year1 === year2 && mon1 > mon2) return true;
        else if (year1 === year2 && mon1 === mon2 && day1 > day2) return true;
        else return false;
    }
};

/*
 * Sets future dates by the repeat. eg every day, every Monday, etc.
 *  
 * returns the days to match interval based on frequency in a moment var
 *
 */
function setInterval(chore) {
    if (chore.frequency != null) {
        if (chore.frequency == 'Daily') {
            return moment(chore.startdate).recur().every(1).day();
        }
        else if (chore.frequency == 'Every 2 weeks') {
            return moment(chore.startdate).recur().every(2).week();
        }
        else if (chore.frequency == 'Monthly') {
            return moment(chore.startdate).recur().every(1).month();
        }
        else if (chore.frequency == 'Once') {
            // TODO 
            alert('once not handled!');
        }
        else {
            // must be day of week
            return moment(chore.startdate).recur().every(chore.frequency).dayOfWeek();
        }
    }
    alert('chore frequency ' + chore.frequency + 'not handled');
    return null;
};
