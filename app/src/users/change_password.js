(function (module) {
    module.controller('changePasswordController', ['$state', '$window', '$scope', 'SessionService', '$rootScope', '$location', 'flash', '$filter', '$uibModal', 'ChangePassword', 'TokenServiceData', 'UserProfile', 'User', 'ConstToolTipContent', '$uibModalStack', function ($state, $window, $scope, SessionService, $rootScope, $location, flash, $filter, $uibModal, ChangePassword, TokenServiceData, UserProfile, User, ConstToolTipContent,  $uibModalStack) {
        $scope.user = {};
        $scope.email = {};
        $scope.ConstToolTipContent= ConstToolTipContent;
        $rootScope.pageTitle = $filter("translate")("Account Settings")+ " | " +$rootScope.settings['site.name'];
        console.log($rootScope.auth);
        $scope.change_password = function (changePasswordForm, user) {
            //Changing the password of the user
            $scope.user = user;
            if (changePasswordForm.$valid) {
                $scope.disableButton = true;
                ChangePassword.change_password($scope.user, function (response) {
                    if (response.error.code === 0) {
                        successMsg = $filter("translate")("Password Changed Successfully.");
                        flash.set(successMsg, 'success', false);
                        $scope.user = {};
                        changePasswordForm.$setPristine();
                        changePasswordForm.$setUntouched();
                    } else if (response.error.code === 1) {
                        errrorMsg = $filter("translate")("Your current password was incorrect.");
                        flash.set(errrorMsg, 'error', false);
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.disableButton = false;
                });
            }
        };
        $scope.change_email = function (changeEmailForm) {
            // Changing the mail of the user
            if (changeEmailForm.$valid) {
                $scope.email_disableButton = true;
                UserProfile.update($scope.email, function (response) {
                    if (response.error.code === 0) {
                        $scope.email = {};
                        changeEmailForm.$setPristine();
                        changeEmailForm.$setUntouched();
                        flashMessage = $filter("translate")("Your email address has been changed Successfully.");
                        flash.set(flashMessage, 'success', false);
                        $state.go('Logout');
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.email_disableButton = false;
                });
            }
        };
        $scope.OpenChangeEmailModal = function () {
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'users/change_email_modal.tpl.html',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        };
          $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();

        };
    }]);
} (angular.module("ace.users")));
