(function(module) {
    module.controller('CoursesController', function(Course, $state, $scope, TokenServiceData, $filter, $rootScope) {
        $rootScope.pageTitle =   $filter("translate")("Courses") + " | " + $rootScope.settings['site.name'];
        var model = this;
        model.loading = false;
        model.courses = [];
        $scope.category_id = $state.params.id ? $state.params.id : '';
    });
}(angular.module("ace.courses")));
