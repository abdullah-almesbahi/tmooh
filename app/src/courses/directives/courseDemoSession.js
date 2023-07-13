(function(module) {
    module.directive('demoSession', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/courseDemoSession.tpl.html',
            link: linker,
            controller: 'courseDemoSessionController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('courseDemoSessionController', function($state, $scope, $rootScope) {
        var model = this;
    });
})(angular.module('ace.courses'));
