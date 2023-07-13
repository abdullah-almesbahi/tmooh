(function(module) {
    module.directive('dashboardNavbar', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/instructorDasboardNavbar.tpl.html',
            link: linker,
            controller: 'instructorDasboardNavbarController as model',
            bindToController: true,
            scope: {}
        };
    });

    module.controller('instructorDasboardNavbarController', function(Course, $scope, $rootScope, $state, $uibModal, $timeout, TokenService, $filter, flash) {
        var model = this;
        model.loadingNavBar = true;
        $scope.dasboardActivetab = $rootScope.dasboardActivetab;
    });
})(angular.module('ace.courses'));
