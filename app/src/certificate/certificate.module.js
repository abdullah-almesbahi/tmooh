(function(module) {

    module.config(function($stateProvider, $analyticsProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function(TokenService) {
                return TokenService.promiseSettings;
            }],
            'pageType': function() {
                return "page";
            }
        };
        $stateProvider
            .state('certificate', {
                url: '/certificate/{id}',
                views: {
                    'main@': {
                        controller: 'CourseCertificateController as model',
                        templateUrl: 'certificate/certificate.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }],
                    'pageType': function() {
                        return "page";
                    }
                }
            });
    });

}(angular.module('ace.certificate', [
    'ui.router',
    'ngResource',
    'ace.courses',
    'OcLazyLoad',
    'angulartics',
    'angulartics.google.analytics',
    // 'angulartics.facebook.pixel',
    'ace.home'
])));
