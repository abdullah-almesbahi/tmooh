/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function(module) {
    module.config(function($stateProvider, $analyticsProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function(TokenService) {
                return TokenService.promiseSettings;
            }]
        };

        $stateProvider
            .state('home', {
                url: '/?utm_source&utm_medium&utm_campaign',
                views: {
                    "main": {
                        controller: 'HomeController as model',
                        templateUrl: 'home/home.tpl.html'
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
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }

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
                    }]
                }
            }) //Plugin routes defined here to avoid oclazyload page refresh problem
            .state('MeSubscription', {
                url: '/me/subscriptions?error_code&error_message&subscription_id',
                views: {
                    'main@': {
                        controller: 'MeSubscriptionController as model',
                        templateUrl: 'src/plugins/Subscriptions/mySubscription.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
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

                    }]
                }
            })
            .state('subscribe', {
                url: '/subscribe/payment/{id}',
                views: {
                    'main@': {
                        controller: 'subscribePaymentController as model',
                        templateUrl: 'src/plugins/Subscriptions/subscriptionsPayment.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
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
                    }]
                }
            })
            .state('buyCourse', {
                url: '/course/{id}/payment/',
                views: {
                    'main@': {
                        controller: 'paymentController as model',
                        templateUrl: 'src/plugins/CourseCheckout/payment.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.CourseCheckout']) && $ocLazyLoad.getModules().indexOf('ace.CourseCheckout') === -1) {
                                    requiredPlugins.push(data['ace.CourseCheckout']);
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

                    }]
                }
            })
            .state('Seo', {
                url: '/manage-course/seo/{id}',
                views: {
                    'main@': {
                        controller: 'SeoUpdateController as model',
                        templateUrl: 'src/plugins/SEO/courseSeo.tpl.html'
                    }
                },
                data: {
                    activetab: 'seo'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.seo']) && $ocLazyLoad.getModules().indexOf('ace.seo') === -1) {
                                    requiredPlugins.push(data['ace.seo']);
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

                    }]
                }
            })
            .state('manageCoursePayment', {
                url: '/manage-course/payout/:id?error_code&error_message&zazpay_gateway_id',
                views: {
                    'main@': {
                        controller: 'payoutController as model',
                        templateUrl: 'src/plugins/ZazPayPayout/payout.tpl.html'
                    }
                },
                data: {
                    activetab: 'payout'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.payout']) && $ocLazyLoad.getModules().indexOf('ace.payout') === -1) {
                                    requiredPlugins.push(data['ace.payout']);
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
                    }]
                }
            })
            .state('courseRating', {
                url: '/course-rating/{id}',
                views: {
                    'main@': {
                        controller: 'ratingController as model',
                        templateUrl: 'src/plugins/RatingAndReview/ratingAndReviewForm.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    rating: function() {
                        return "";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
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

                    }]
                }
            })
            .state('studentSatisfaction', {
                url: '/manage-course/satisfaction-analytics/{id}',
                views: {
                    'main@': {
                        controller: 'studentSatisfactionController as model',
                        templateUrl: 'src/plugins/RatingAndReview/studentSatisfaction.tpl.html'
                    }
                },
                data: {
                    activetab: 'coursestudtsatisfaction'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
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
                    }]
                }
            })
            .state('sociallogin', {
                url: '/social-login',
                views: {
                    'main@': {
                        controller: 'SocialLoginController as model',
                        templateUrl: 'src/plugins/SocialLogins/socialLogins.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
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
                    }]
                }
            })
            .state('socialLoginEmail', {
                url: '/social-login/email',
                views: {
                    'main@': {
                        controller: 'SocialLoginEmailController as model',
                        templateUrl: 'src/plugins/SocialLogins/getEmailFromUser.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
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
                    }]
                }
            })
            .state('moneyTransfer', {
                url: '/user_cash_withdrawals',
                views: {
                    'main@': {
                        controller: 'moneyTransferController as model',
                        templateUrl: 'src/plugins/CourseCheckoutRevenueWithdrawal/moneyTransfer.tpl.html'
                    }
                },
                data: {

                },
                resolve: {

                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.withdrawal']) && $ocLazyLoad.getModules().indexOf('ace.withdrawal') === -1) {
                                    requiredPlugins.push(data['ace.withdrawal']);
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
                    }]
                }
            })
            .state('moneyTransferAdd', {
                url: '/user_cash_withdrawals/add',
                views: {
                    'main@': {
                        controller: 'moneyTransferAddController as model',
                        templateUrl: 'src/plugins/CourseCheckoutRevenueWithdrawal/moneyTransferAdd.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.withdrawal']) && $ocLazyLoad.getModules().indexOf('ace.withdrawal') === -1) {
                                    requiredPlugins.push(data['ace.withdrawal']);
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
                    }]
                }
            })
            .state(' instructor', {
                url: '/instructor/{id}/{slug}',
                views: {
                    'main@': {
                        controller: 'InstructorController as model',
                        templateUrl: 'src/plugins/InstructorProfile/InstructorProfile.tpl.html'
                    }
                },
                data: {},
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
                    }]
                }
            })
            .state('user', {
                url: '/user/{id}/{slug}',
                views: {
                    'main@': {
                        controller: 'UserController as model',
                        templateUrl: 'users/userProfile.tpl.html'
                    }
                },
                data: {},
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
                    }]
                }
            })
            .state('Coupon', {
                url: '/manage-course/coupon/{id}',
                views: {
                    'main@': {
                        controller: 'CouponController as model',
                        templateUrl: 'src/plugins/Coupons/courseCoupon.tpl.html'
                    }
                },
                data: {
                    activetab: 'coupons'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q',function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.coupons']) && $ocLazyLoad.getModules().indexOf('ace.coupons') === -1) {
                                    requiredPlugins.push(data['ace.coupons']);
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
                    }]
                }
            })
            .state('transaction', {
                url: '/transactions',
                views: {
                    'main@': {
                        controller: 'transactionsController as model',
                        templateUrl: 'src/plugins/CourseCheckout/transactions.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.CourseCheckout']) && $ocLazyLoad.getModules().indexOf('ace.CourseCheckout') === -1) {
                                    requiredPlugins.push(data['ace.CourseCheckout']);
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

                    }]
                }
            })
            .state('revenueReport', {
                url: '/Revenue-Report',
                views: {
                    'main@': {
                        controller: 'InstructorRevenueReportController as model',
                        templateUrl: 'src/plugins/RevenueReports/revenueReport.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.revenue_report']) && $ocLazyLoad.getModules().indexOf('ace.revenue_report') === -1) {
                                    requiredPlugins.push(data['ace.revenue_report']);
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

                    }]
                }
            })
            .state('Carts', {
                url: '/cart',
                views: {
                    'main@': {
                        controller: 'CourseCartController as model',
                        templateUrl: 'src/plugins/CourseBulkCheckout/carts.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.carts']) && $ocLazyLoad.getModules().indexOf('ace.carts') === -1) {
                                    requiredPlugins.push(data['ace.carts']);
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

                    }]
                }
            })
            .state('news', {
                url: '/news',
                views: {
                    'main@': {
                        controller: 'newsController as model',
                        templateUrl: 'src/plugins/News/newsListing.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
            .state('newsView', {
                url: '/news/{id}',
                views: {
                    'main@': {
                        controller: 'newsViewController as model',
                        templateUrl: 'src/plugins/News/newView.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
            .state('Support', {
                url: '/support/{type}?q',
                views: {
                    'main@': {
                        controller: 'supportsController as model',
                        templateUrl: 'src/plugins/Support/support.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
             .state('SupportCategory', {
                url: '/support/Categories/{id}/{type}',
                views: {
                    'main@': {
                        controller: 'supportsCategoryController as model',
                        templateUrl: 'src/plugins/Support/supportCategory.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function () {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function ($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function (data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
             .state('SupportContent', {
                url: '/support/{Category_id}/content/{id}/{type}',
                views: {
                    'main@': {
                        controller: 'supportsContentController as model',
                        templateUrl: 'src/plugins/Support/supportContent.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
            .state('Categorynews', {
                url: '/category/{id}/news',
                views: {
                    'main@': {
                        controller: 'categoryNewsController as model',
                        templateUrl: 'src/plugins/News/categoryNewsListing.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.news']) && $ocLazyLoad.getModules().indexOf('ace.news') === -1) {
                                    requiredPlugins.push(data['ace.news']);
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

                    }]
                }
            })
            .state('courseFlag', {
                url: '/course-flag/{id}',
                views: {
                    'main@': {
                        controller: 'courseFlagsTplController as model',
                        templateUrl: 'src/plugins/CourseFlags/CourseFlags.tpl.html',
                    }

                },
                data: {},
                resolve: {
                    pageType: function() {
                        return "page";
                    },
                    courseFlagID: function() {
                        return "";
                    },
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.courseflags']) && $ocLazyLoad.getModules().indexOf('ace.courseflags') === -1) {
                                    requiredPlugins.push(data['ace.courseflags']);
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

                    }]
                }
            });
    });

    // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ace.home", [
    'ui.router',
    'angulartics',
    'angulartics.klaviyo',
    'angulartics.google.analytics',
    // 'angulartics.google.analytics',
    // 'angulartics.facebook.pixel'
])));
