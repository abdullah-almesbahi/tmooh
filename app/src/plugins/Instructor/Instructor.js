/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {
    module.config(function ($stateProvider) {

    });
} (angular.module('ace.instructor', [
    'ui.router',
    'ngResource'

])));

(function (module) {
    module.directive('instructorCourses', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Instructor/InstructorCourses.tpl.html',
            link: linker,
            controller: 'instructorCoursesController as model',
            bindToController: true,
            scope: {
                themeName: '@themeName'
            }
        };
    });
    module.directive('instructorCoursesDetail', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Instructor/InstructorCoursesButton.tpl.html',
            link: linker,
            controller: 'instructorCoursesController as model',
            bindToController: true,
            scope: {
                themeName: '@themeName',
            }
        };
    });
    module.controller('instructorCoursesController', function ($state, Course, $scope, Teaching, $rootScope, UserStats, CourseType) {
        var model = this;
        model.loader = true;
        model.teachingCourses = [];
        model._metadata = [];
        $scope.CourseType = CourseType;
        model.stats = [];
        UserStats.get({}).$promise.then(function (response) {
            model.stats = response.data;
        });

        model._metadata = [];

        function getTeachingCourses(element) {
            model.loader = true;
            userID = $rootScope.auth.id;
            params = {};
            $scope.csearchVal = $state.params.q;
            $scope.ordering = '';
            orderingval = $state.params.ordering;
            $scope.ordering = $state.params.ordering;
            $scope.type = $state.params.type;
            if ($scope.type === '')
                if (orderingval === 'created') {
                    params.sort = 'id';
                    params.sort_by = 'DESC';
                }
            if (orderingval === '-created') {
                params.sort = 'id';
                params.sort_by = 'ASC';
            }
            if (orderingval === 'title') {
                params.sort = 'title';
                params.sort_by = 'ASC';
            }
            if (orderingval === '-title') {
                params.sort = 'title';
                params.sort_by = 'DESC';
            }
            if (orderingval === '-title') {
                params.sort = 'title';
                params.sort_by = 'DESC';
            }
            if (orderingval === 'is_published') {
                params.sort = 'course_status_name';
                params.sort_by = 'DESC';
            }
            if (orderingval === '-is_published') {
                params.sort = 'course_status_name';
                params.sort_by = 'ASC';
            }
            params.filter = 'all';
            params.q = $state.params.q;
            params.course_type_id = $scope.CourseType[$state.params.type];
            getUserParams = {
                id: userID,
                filter: params,
                limit: 12,
                page: model._metadata.currentPage,
            };
            Teaching.get(getUserParams).$promise.then(function (response) {
                model.teachingCourses = response;
                angular.forEach(model.teachingCourses.data, function (teaching_course) {
                    if (teaching_course.course_options !== undefined && teaching_course.course_options !== null && teaching_course.course_options !== '') {
                        teaching_course.coursetype = {};
                        teaching_course.course_options.split(',')
                            .forEach(function (e) {
                                if (e == CourseType.video) {
                                    teaching_course.coursetype.video = true;
                                } else if (e == CourseType.onsite) {
                                    teaching_course.coursetype.onsite = true;
                                } else if (e == CourseType.online) {
                                    teaching_course.coursetype.online = true;
                                }
                            });
                    }
                });
                model._metadata = response._metadata;
                model.loader = false;
                if (element !== null && angular.isDefined(element)) {
                    $('html, body').animate({
                        scrollTop: $(element).offset().top
                    }, 2000, 'swing', false);
                }
            });
        }
        $scope.index = function (element) {
            getTeachingCourses(element);
        };
        $scope.index(null);
        $scope.paginate = function (element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
        $scope.goToState = function (state, params) {
            $state.go(state, params);
        };
    });
})(angular.module('ace.instructor'));

(function (module) {
    module.factory('Teaching', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

    module.factory('UserStats', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/me/stats'
        );
    });

})(angular.module("ace.instructor"));
