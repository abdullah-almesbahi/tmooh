(function (module) {
    module.directive('userprofileNavbar', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'users/directives/manageUserProfileNavbar.tpl.html',
            link: linker,
            controller: 'userNavbarController as model',
            bindToController: true,
            scope: {}
        };
    });

    module.controller('userNavbarController', function (Course, $scope, $rootScope, $state, $uibModal, $timeout, TokenService, $filter, flash, User) {
        var model = this;
        model.loadingNavBar = true;
        if ($rootScope.isAuth) {
            $scope.auth_user_id = $rootScope.auth ? parseInt($rootScope.auth.id) : '';
            getUserParams = {
                id: $scope.auth_user_id,
                field: 'is_teacher'
            };
            User.get(getUserParams).$promise.then(function (response) {
                model.userDetails = response.data[0];
                $rootScope.is_teacher = response.data[0].is_teacher;
            });
        }
        $scope.profile_activetab = $rootScope.profile_activetab;

    });
})(angular.module('ace.users'));
