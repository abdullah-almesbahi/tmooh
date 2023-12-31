(function(module) {

    module.controller('forgotPasswordController', ['$state', '$window', '$scope', 'SessionService', '$rootScope', '$location', 'flash', '$filter', '$uibModal', 'ForgotPassword', 'TokenServiceData', '$uibModalStack', function($state, $window, $scope, SessionService, $rootScope, $location, flash, $filter, $uibModal, ForgotPassword, TokenServiceData, $uibModalStack) {
        $uibModalStack.dismissAll();
        var model = this;
        $scope.user = {};
        $rootScope.pageTitle = $filter("translate")("Forgot Password")+ " | " +$rootScope.settings['site.name'];
        $rootScope.status = 'ready';
        model.loading = false;
        $scope.modalLogin = function(e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/login.tpl.html',
                    controller: 'userLoginController',
                    size: 'lg',
                    resolve: {
                        pageType: function() {
                            return "modal";
                        },
                        TokenServiceData: function($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function(data) {
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
                }).result.then(function(result) {
                    $rootScope.modal = false;
                    //$scope.$close();
                }, function(result) {
                    $rootScope.modal = false;
                    //$scope.dismiss();
                }).finally(function() {
                    $rootScope.modal = false;
                    // handle finally
                });
                $rootScope.modal = true;
            }
        };
        $scope.modalSignup = function(e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/signup.tpl.html',
                    controller: 'userSignupController',
                    size: 'sm',
                    resolve: {
                        pageType: function() {
                            return "modal";
                        }
                    }
                }).result.then(function(result) {
                    $rootScope.modal = false;
                    //$scope.$close();
                }, function(result) {
                    $rootScope.modal = false;
                    //$scope.dismiss();
                }).finally(function() {
                    $rootScope.modal = false;
                    // handle finally
                });
                $rootScope.modal = true;
            }
        };
        $scope.modalClose = function(e) {
            e.preventDefault();
            $scope.$close();
        };
        $scope.forgot_password = function(forgotPasswordForm, user) {
            $scope.user = user;
            $scope.disableButton = true;
            if (forgotPasswordForm) {
                ForgotPassword.forgot_password($scope.user, function(response) {
                    if (response.error.code === 0) {
                        successMsg = $filter("translate")("Your password has been sent through mail successfully.");
                        flash.set(successMsg, 'success', false);
                        $scope.user = {};
                    } else if (response.error.code === 1) {
                        errrorMsg = $filter("translate")("Given Email is not existing.");
                        flash.set(errrorMsg, 'error', false);
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.disableButton = false;
                });
            }
        };
        if ($scope.isAuth) {
            $location.path('/courses');
        }
    }]);
}(angular.module("ace.users")));
