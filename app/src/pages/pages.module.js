(function(module) {

    module.config(function($stateProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function(TokenService) {
                return TokenService.promiseSettings;
            }]
        };
        $stateProvider
            .state('pages', {
                url: '/page/{slug}?language',
                views: {
                    'main@': {
                        controller: 'pagesController as model',
                        templateUrl: 'pages/pages.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            });
    });

}(angular.module('ace.pages', [
    'ui.router',
    'ngResource'
])));
