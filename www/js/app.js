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

