(function (module) {

    module.config(function ($stateProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function (TokenService) {
                return TokenService.promiseSettings;
            }]
        };
        $stateProvider
            .state('contact', {
                url: '/contactus',
                views: {
                    'main@': {
                        controller: 'contactUsController as model',
                        templateUrl: 'contactUs/contactUs.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            })
            .state('Quote', {
                url: '/get-quote',
                views: {
                    'main@': {
                        controller: 'contactUsController as model',
                        templateUrl: 'contactUs/GetQuote.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            })
            .state('H2kforcorporate', {
                url: '/business',
                views: {
                    'main@': {
                        controller: 'contactUsController as model',
                        templateUrl: 'contactUs/H2k-for-corporate.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            });

    });

} (angular.module('ace.contactUs', [
    'ui.router',
    'ngResource'
])));
