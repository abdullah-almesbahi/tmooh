(function(module) {
    module.directive('courseCertificateButton', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/courseCertificate.tpl.html',
            link: linker,
            controller: 'CourseCertificateController as model',
            bindToController: true,
            scope: {
                courseUserId: '@courseUserId',
                type: '@type',
                position: '@position'

            }
        };
    });
    module.controller('CourseCertificateController', function($state, $scope, $rootScope) {
        /**VARIABLE DECALARATION */
        var model = this;
    });
})(angular.module('ace.courses'));
