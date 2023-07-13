/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) { } (angular.module('ace.socialLogin', [
    'ui.router',
    'ngResource',
    'satellizer'
])));

(function (module) {
    module.config(function ($authProvider, GENERAL_CONFIG, $windowProvider) {
        var $window = $windowProvider.$get();
        var params = {};
        $.get(GENERAL_CONFIG.api_url+'api/v1/providers', params, function (response) {
            var credentials = {};
            var url = GENERAL_CONFIG.api_url;
            var providers = JSON.parse(response);
            angular.forEach(providers.data, function (res, i) {
                credentials = {
                    clientId: res.api_key,
                    redirectUri: url + 'api/v1/users/social_login?type=' + angular.lowercase(res.name),
                    url: url + 'api/v1/users/social_login?type=' + angular.lowercase(res.name),
                };
                if (res.name === 'Facebook') {
                    $authProvider.facebook(credentials);
                }
                if (res.name === 'Google') {
                    $authProvider.google(credentials);
                }
                if (res.name === 'LinkedIn') {
                    $authProvider.linkedin(credentials);
                }
                if (res.name === 'Twitter') {
                    $authProvider.twitter(credentials);
                }
            });
        });
    });
    module.directive('socialLogin', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/SocialLogins/socialLogins.tpl.html',
            link: linker,
            controller: 'SocialLoginController as model',
            bindToController: true,
            scope: {
                pageType: '@pageType'
            }
        };
    });

    module.controller('SocialLoginEmailController', function ($state, SocialLoginsList, $auth, $scope, flash, UsersSocialSignInFactory, $rootScope, $filter, TokenServiceData, pageType) {
        /**
         * @ngdoc function
         * @name $scope.loginUser
         * @function
         *
         * @description
         * User social login method
         *
         * @returns {*} If true  'logged user details' or 'Authenticated failed'
         */
        $scope.currentPageType = pageType;
        $rootScope.pageTitle = $filter("translate")("Get Social API Email")+ " | " +$rootScope.settings['site.name'];
        $scope.loginnow = function (user) {
            $scope.user = user;
            $scope.user.thrid_party_profile = $rootScope.thrid_party_profile;
            var params = {};
            delete $rootScope.thrid_party_profile.error;
            params = $rootScope.thrid_party_profile;
            params.email = user.email;
            UsersSocialSignInFactory.login(params, function (response) {
                if (response.error.code === 0) {

                } else {
                    var errorMessage;
                    if (response.error.code === 1) {
                        errorMessage = $filter("translate")("Already registered email");
                    } else {
                        errorMessage = response.error.message;
                    }
                    flash.set(errorMessage, 'error', false);
                }
            });
        };
    });
    module.controller('SocialLoginController', function ($state, SocialLoginsList, $auth, $scope, $rootScope, $uibModalStack, $uibModal, $location) {
        $scope.contentInIframe = false;
        if (self !== top) {
            $scope.contentInIframe = true;
        }
        var model = this;
        model.sociallogin = {};
        SocialLoginsList.get().$promise
            .then(function (response) {
                model.sociallogin = response;
            });
        $scope.authenticate = function (provider) {
            $auth.authenticate(provider);
        };
        $rootScope.$on('getEmailFromUser', function (event, args) {
            if ($rootScope.pageBool) {
                $rootScope.pageBool = false;
                $rootScope.thrid_party_profile = args.thrid_party_profile;
                if (model.pageType === 'modal') {
                    $scope.modalInstance = $uibModal.open({
                        scope: $scope,
                        templateUrl: 'src/plugins/SocialLogins/getEmailFromUser.tpl.html',
                        controller: 'SocialLoginEmailController as model',
                        size: 'lg',
                        resolve: {
                            pageType: function () {
                                return "modal";
                            },
                            TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                                var promiseSettings = TokenService.promiseSettings;
                                return $q.all({
                                    load: promiseSettings.then(function (data) {
                                        if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                            var module = data['ace.socialLogin'];
                                            return $ocLazyLoad.load(module, {
                                                cache: true
                                            });
                                        } else {
                                            return '';
                                        }
                                    })
                                });
                            }
                        }
                    }).result.then(function (result) {
                        $rootScope.modal = false;
                    }, function (result) {
                        $rootScope.modal = false;
                    }).finally(function () {
                        $rootScope.modal = false;
                        // handle finally
                    });
                    $rootScope.modal = true;
                } else {
                    var redirectto = $location.absUrl().split('/');
                    redirectpath = redirectto[0] + '/social-login/email';
                    window.location.href = redirectpath;
                }
            }
        });

    });
})(angular.module('ace.socialLogin'));

(function (module) {
    module.factory('SocialLoginsList', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/providers', {}, {});
    });
    module.factory('UsersSocialSignInFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/social_login?type=twitter', {}, {
            login: {
                method: 'POST'
            }
        });
    });
})(angular.module('ace.socialLogin'));
