(function(module) {

    module.config(function($stateProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function(TokenService) {
                return TokenService.promiseSettings;
            }]
        };
        $stateProvider
            .state('creditoffer', {
                url: '/credits?page',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'creditofferController as model',
                        templateUrl: 'creditoffer/creditoffer.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_credits'
                },
                resolve: getToken
            });
    });

}(angular.module('ace.creditoffer', [
    'ui.router',
    'ngResource'
])));
