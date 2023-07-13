(function (module) {

    module.config(function ($stateProvider, $analyticsProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function (TokenService) {
                return TokenService.promiseSettings;
            }],
            'pageType': function () {
                return "page";
            }
        };
        $stateProvider
            .state('Signup', {
                url: '/users/signup?subscription_id',
                views: {
                    'main@': {
                        controller: 'userSignupController as model',
                        templateUrl: 'users/signup.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                    requiredPlugins.push(data['ace.socialLogin']);
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })

            .state('Login', {
                url: '/users/login',
                views: {
                    'main@': {
                        controller: 'userLoginController as model',
                        templateUrl: 'users/login.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
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
                    }],
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('Logout', {
                url: '/users/logout',
                views: {
                    'main@': {
                        controller: 'userLogoutController as model',
                        templateUrl: 'users/logout.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            })
            .state('UserActivation', {
                url: '/users/activation/:id/:hash/:ex_token',
                views: {
                    'main@': {
                        controller: 'userActivationController as model',
                        templateUrl: 'users/activation.tpl.html'
                    }
                },
                data: {},
                resolve: getToken
            })
            .state('ForgotPassword', {
                url: '/users/forgot_password',
                views: {
                    'main@': {
                        controller: 'forgotPasswordController as model',
                        templateUrl: 'users/forgot_password.tpl.html'
                    }
                },
                data: {},
                resolve: getToken
            })
            /*.state('user', {
                 url: '/user/{id}/{slug}/',
                 views: {
                     'main@': {
                         controller: 'UserController as model',
                         templateUrl: 'users/userProfile.tpl.html'
                     }
                 },
                 data: {},
                 resolve: {
                     TokenServiceData: function($ocLazyLoad, TokenService, $rootScope, $q) {
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
                     }
                 }
             })       */
            .state('ChangePassword', {
                url: '/users/edit_account',
                views: {
                    'main@': {
                        controller: 'changePasswordController as model',
                        templateUrl: 'users/change_password.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_Account'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserProfile', {
                url: '/users/edit-profile',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/user_profile.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_edit'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })

            .state('AllUser', {
                url: '/users',
                views: {
                    'main@': {
                        controller: 'UserAllController as model',
                        templateUrl: 'users/all_user.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('SubscribePlans', {
                url: '/subscribe/plans',
                views: {
                    'main@': {
                        controller: 'SubscribePlansController as model',
                        templateUrl: 'users/subscribe_plans.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];

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
                    'pageType': function () {
                        return "page";
                    }
                }
            }).state('UserCreditCard', {
                url: '/users/credit-cards',
                views: {
                    'main@': {
                        controller: 'creditController as model',
                        templateUrl: 'src/plugins/Credit/credit.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_creditCard'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.credit']) && $ocLazyLoad.getModules().indexOf('ace.credit') === -1) {
                                    requiredPlugins.push(data['ace.credit']);
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
                    'pageType': function () {
                        return "page";
                    }
                }
            }).state('message', {
                url: '/message/{type}',
                views: {
                    'main@': {
                        controller: 'MessageController as model',
                        templateUrl: 'src/plugins/Message/myMessage.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.credit']) && $ocLazyLoad.getModules().indexOf('ace.credit') === -1) {
                                    requiredPlugins.push(data['ace.credit']);
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
                    'pageType': function () {
                        return "page";
                    }
                }
            }).state('messageview', {
                url: '/message/{id}/{type}',
                views: {
                    'main@': {
                        controller: 'MessageViewController as model',
                        templateUrl: 'src/plugins/Message/message_view.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.credit']) && $ocLazyLoad.getModules().indexOf('ace.credit') === -1) {
                                    requiredPlugins.push(data['ace.credit']);
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserMyAnnoucement', {
                url: '/users/my-annoucement',
                views: {
                    'main@': {
                        controller: 'UserAnnouncementController as model',
                        templateUrl: 'users/user_annnoucement.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.credit']) && $ocLazyLoad.getModules().indexOf('ace.credit') === -1) {
                                    requiredPlugins.push(data['ace.credit']);
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('InstructorPayment', {
                url: '/users/instructor_payment',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/instructor_payment.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_payment'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('PromotionalAgreements', {
                url: '/users/promotional_agreements?course',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/promotional_agreements.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_promotional'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('Referral', {
                url: '/users/referral',
                views: {
                    'main@': {
                        controller: 'UserReferralController as model',
                        templateUrl: 'users/user_referral.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_referral'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('OAuthClient', {
                url: '/user/api-clients?page',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'oAuthClientController as model',
                        templateUrl: 'src/plugins/OAuthClient/OAuthClient.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_oAuthClient'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('EditOAuthClient', {
                url: '/user/api-client/:id/edit',
                views: {
                    'main@': {
                        controller: 'oAuthClientEditController as model',
                        templateUrl: 'src/plugins/OAuthClient/OAuthClientEdit.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_oAuthClient'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserPrivacy', {
                url: '/users/privacy',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/instructor_privacy.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_privacy'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserDisable', {
                url: '/users/danger-zone',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/user_profile_disable.tpl.html'
                    }
                },
                data: {

                    profile_activetab: 'profile_disable'

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            }).state('UserPhoto', {
                url: '/users/photo',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/user_photo.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_photo'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserMessageSetting', {
                url: '/users/notifications',
                views: {
                    'main@': {
                        controller: 'UserProfileController as model',
                        templateUrl: 'users/user_notification.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_notification'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserPurchaseHistory', {
                url: '/users/purchase-history',
                views: {
                    'main@': {
                        controller: 'UserPurchaseController as model',
                        templateUrl: 'users/user_pruchase.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_purchase'

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            })
            .state('UserPurchaseOrderReceipt', {
                url: '/order/{id}?error_code',
                views: {
                    'main@': {
                        controller: 'UserPurchaseOrderReceiptController as model',
                        templateUrl: 'users/user_purchase_receipt.tpl.html'
                    }
                },
                data: {
                    profile_activetab: 'profile_purchase'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
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
                    'pageType': function () {
                        return "page";
                    }
                }
            });
    });

} (angular.module('ace.users', [
    'ui.router',
    'ngResource',
    'ace.courses',
    'OcLazyLoad',
    'angulartics',
    'angulartics.google.analytics',
    // 'angulartics.facebook.pixel',
    'ace.home'
])));
