(function (module) {
    module.controller('userLoginController', ['$state', '$window', 'User', '$scope', 'Login', 'SessionService', '$rootScope', '$location', 'flash', '$filter', '$uibModal', '$uibModalStack', 'pageType', 'TokenServiceData', 'GENERAL_CONFIG', 'expireCookie', 'CartsService', '$cookies', function ($state, $window, User, $scope, Login, SessionService, $rootScope, $location, flash, $filter, $uibModal, $uibModalStack, pageType, TokenServiceData, GENERAL_CONFIG, expireCookie, CartsService, $cookies) {
        var model = this;
        var user_cokkies_details = ['id', 'providertype', 'accesstoken', 'displayname', 'designation', 'referral_earned_amount', 'headline', 'sub_admin_id', 'image_hash', 'token', 'email', 'available_credits', 'site_url','isemailverified'];
        $rootScope.pageTitle =   $filter("translate")("Log in") + " | " + $rootScope.settings['site.name'];
        $rootScope.metaDescription = $filter("translate")("Log in using the email address and password you registered with in order to access your online courses.");
        $rootScope.status = 'ready';
        model.user = {};
        model.loading = false;
        $scope.modalClose = function (e) {
            e.preventDefault();
            $scope.$close();
        };
        $scope.currentPageType = pageType;

        $scope.contentInIframe = false;
        if (self !== top) {
            $scope.contentInIframe = true;
        }
        $scope.modalForgotPassword = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/forgot_password.tpl.html',
                    controller: 'forgotPasswordController',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                    //$scope.$close();
                }, function (result) {
                    $rootScope.modal = false;
                    //$scope.dismiss();
                }).finally(function () {
                    $rootScope.modal = false;
                    // handle finally
                });
                $rootScope.modal = true;
            }
        };
        $scope.goToState = function (state, params) {
            $uibModalStack.dismissAll();
            $state.go(state, params);
        };
        $scope.modalSignup = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/signup.tpl.html',
                    controller: 'userSignupController',
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
            }
        };
        $scope.loginUser = function (userAdd, user) {
            if (userAdd) {
                $scope.disableButton = true;
                $scope.user = user;
                Login.login($scope.user, function (response) {
                    $scope.response = response;
                    if (!angular.isUndefined($scope.response.error) && $scope.response.error.code === 0) {
                        $scope.disableButton = false;
                        SessionService.setUserAuthenticated(true);
                        Auth = {};
                        angular.forEach($scope.response.user, function (value, key) {
                            if (user_cokkies_details.indexOf(key) > -1) {
                                if (key !== 'image_hash') {
                                    Auth[key] = value;
                                } else {
                                    Auth.user_image_hash = value;
                                }
                            }
                        });
                        Auth.site_url = GENERAL_CONFIG.api_url;
                        if (Auth.providertype == "admin") {
                            enabledPlugin = $rootScope.settings['site.enabled_plugins'];
                            $cookies.put('enabled_plugins', enabledPlugin, { path: '/' });
                        }
                        $cookies.put('auth', JSON.stringify(Auth), { path: '/' });
                        $cookies.put('token', $scope.response.access_token, { path: '/' });
                        $cookies.put('refresh_token', $scope.response.refresh_token, { path: '/' });
                        $rootScope.$emit('updateParent', {
                            isAuth: true,
                            auth: Auth
                        });
                        // refreshing header and become an instructor
                        $scope.$emit('refreshHeader', { isAuth: true, });
                        $rootScope.$emit('checkIsTeacher', {});
                        Getcart();

                        if ($cookies.get("redirect_url") !== null && $cookies.get("redirect_url") !== undefined) {
                            $location.path($cookies.get("redirect_url"));
                            $state.reload();
                            $cookies.remove('redirect_url', {
                                path: '/'
                            });
                            $uibModalStack.dismissAll();
                        } else {
                            var redirectto = $location.absUrl().split('/');
                            if (Auth.providertype == "admin") {
                                redirectpath = redirectto[0] + '/ag-admin';
                                window.location.href = redirectpath;
                            } else {
                                var currentPath = $location.path();
                                if (currentPath === "" || currentPath === "users/login" || currentPath === "users/forgot_password" || currentPath === "users/signup?subscription_id" || currentPath === "users/signup") {
                                // if (redirectto[1] === "" || redirectto[1] === "users/login" || redirectto[1] === "users/forgot_password" || redirectto[1] === "users/signup?subscription_id" || redirectto[1] === "users/signup") {
                                    $location.path('/my-courses/learning').replace();
                                } else {
                                    $state.reload();
                                }
                                $uibModalStack.dismissAll();
                            }
                        }

                    } else {
                        $scope.disableButton = false;
                        SessionService.setUserAuthenticated(false);
                        $scope.isAuth = false;
                        $rootScope.isAuth = false;
                        $scope.user.password = "";
                        errrorMsg = $filter("translate")($scope.response.error.message);
                        if ($scope.response.error.code === 7) {
                            errrorMsg = $filter("translate")("Account has not been activated. Please find activation link in your email.");
                        } else if ($scope.response.error.code === 1) {
                            errrorMsg = $filter("translate")("Sorry, login failed. Email or Password is incorrect.");
                        } else {
                            errrorMsg = $filter("translate")($scope.response.error.message);
                        }
                        flash.set(errrorMsg, 'error', false);
                    }
                });
            }
        };
        if ($scope.isAuth) {
            $location.path('/my-courses/learning');
        }
        function Getcart() {
            model.getcart = {};
            if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                var new_cookie1 = $cookies.getObject('cart_cookies');
                model.getcart.session_id = new_cookie1.hash;
            }
            CartsService.get(model.getcart).$promise
                .then(function (response) {
                    $rootScope.$emit('updateCartParent', {
                        carts: response.data
                    });
                });
        }
    }]);
} (angular.module("ace.users")));
