(function(module) {
    module.controller('teachingController', function($state, $rootScope, $scope, $filter, TokenServiceData) {
        $rootScope.pageTitle = $filter("translate")("My Courses") + " | " + $rootScope.settings['site.name'];
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'my_courses';
    });
}(angular.module("ace.courses")));
