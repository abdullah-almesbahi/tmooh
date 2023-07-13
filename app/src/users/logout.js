(function (module) {
    module.controller('userLogoutController', ['$rootScope', '$scope', 'Logout', '$location', 'SessionService', 'flash', '$filter', 'GENERAL_CONFIG', 'TokenServiceData', '$cookies', '$window', function ($rootScope, $scope, Logout, $location, SessionService, flash, $filter, GENERAL_CONFIG, TokenServiceData, $cookies, $window) {
        /**
         * @ngdoc controller
         * @name LogoutController
         * @description
         * User can logout from site, unset the session details and redirect to login page
         *
         *
         **/
        $rootScope.pageTitle = $filter("translate")("Logout")+ " | " +$rootScope.settings['site.name'];
        Logout.logout('', function (response) {
            $scope.title = 'Logout';
            if (response.error.code === 0) {
                SessionService.setUserAuthenticated(false);
                Auth = Array();
                $scope.isAuth = false;
                $rootScope.isAuth = false;
                $cookies.remove("cart_cookies", { path: "/" });
                $cookies.remove("auth", { path: "/" });
                $cookies.remove("token", { path: "/" });
                $cookies.remove("refresh_token", { path: "/" });
                $cookies.remove("enabled_plugins", { path: "/" });
                $cookies.remove("isUser", { path: "/" });
                if ($window.localStorage.getItem("satellizer_token") !== undefined && $window.localStorage.getItem("satellizer_token") !== null) {
                    $window.localStorage.removeItem("satellizer_token");
                }
                flashMessage = $filter("translate")("Logout successful.");
                flash.set(flashMessage, 'success', false);
                $scope.$emit('updateParent', {
                    isAuth: false,
                    auth: ""
                });
                $rootScope.$emit('refreshHeader', { isAuth: false, });
                $rootScope.$emit('checkIsTeacher', {});
                $location.path('/');
            }
        });
    }]);
} (angular.module("ace.users")));
