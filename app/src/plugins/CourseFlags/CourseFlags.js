/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {

}(angular.module('ace.courseflags', [])));

(function(module) {
    module.directive('courseFlags', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            template: "<a ng-if='model.course_flag.length < 1' href=\"/course-flag/{{model.courseId}}\" class=\"{{model.styleClass}}\" title={{hovertitle}} ng-click=\"model.addCourseFlag($event)\"><span class=\"{{model.textstyleClass}}\"><strong ng-show=\"model.textstrongClass == 'true'\"><i class=\"mdi-18px mdi mdi-flag fa-lg\"></i>&nbsp;{{title}}</strong><span ng-show=\"model.textstrongClass != 'true'\"><i class=\"mdi-18px mdi mdi-flag fa-lg\"></i>&nbsp;{{title}}</span></span></a> <a ng-if='model.course_flag.length > 0' tooltip=\"You already flagged this course\" class=\"{{model.styleClass}}\"><span class=\"text-muted \">Flagged This Course</span></a>",
            link: linker,
            controller: 'courseFlagsController as model',
            bindToController: true,
            scope: {
                styleClass: '@',
                courseId: '@',
                textstyleClass: '@',
                textstrongClass: '@'
            }
        };
    });
    module.controller('courseFlagsController', function(courseFlagsCategories, $state, courseFlag, $rootScope, $uibModal, $scope, $filter) {
        var model = this;
        $scope.title = $filter("translate")("Flag this Course");
        $scope.hovertitle = $filter("translate")("Flag this Course");
        model.addCourseFlag = addCourseFlag;
        $scope.course_flag = [];
        /**
         * @ngdoc function
         * @name $addCourseFlag
         * @function
         *
         * @description
         *
         * to open abuse content form on modal window
         */
        if ($rootScope.isAuth) {
            $scope.auth_user_id = $rootScope.auth ? parseInt($rootScope.auth.id) : '';
        }
        courseFlag.get({
            course_id: model.courseId,
            user_id: $scope.auth_user_id
        }).$promise.then(function(response) {
            model.course_flag = response.data;
        });

        function addCourseFlag(event) {
            event.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'src/plugins/CourseFlags/CourseFlags.tpl.html',
                    controller: 'courseFlagsTplController',
                    size: 'md',
                    resolve: {
                        pageType: function() {
                            return "modal";
                        },
                        courseFlagID: function() {
                            return model.courseId;
                        }
                    }
                }).result.then(function(result) {
                    $rootScope.modal = false;
                }, function(result) {
                    $rootScope.modal = false;
                }).finally(function() {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        }
    });
    module.controller('courseFlagsTplController', function(courseFlagsCategories, courseFlags, $scope, $filter, courseFlagID, flash, $state, pageType, $rootScope) {
        var model = this;
        if (pageType === "page") {
            $rootScope.pageTitle = $filter("translate")("Course Flag")+ " | " +$rootScope.settings['site.name'];
            courseFlagID = $state.params.id;
        }
        model.getCourseFlagCategories = getCourseFlagCategories;
        $scope.pageType = pageType;
        $scope.currentCourseId = courseFlagID;
        $scope.flagCategories = [];
        $scope.disableButton = false;
        $scope.courseFlag = new courseFlags();
        //model.saveCourseFlag = saveCourseFlag;
        $scope.init = function() {
            getCourseFlagCategories();
        };
        $scope.init();
        /**
         * @ngdoc function
         * @name $getCourseFlagCategories
         * @function
         *
         * @description
         *
         * getting courseFlags categories
         */
        function getCourseFlagCategories() {
            courseFlagsCategories.get().$promise.then(function(response) {
                $scope.flagCategories = response.data;
            });
        }
        /**
         * @ngdoc function
         * @name $saveCourseFlag
         * @function
         *
         * @description
         *
         * post abuse content category and description.
         */
        $scope.saveCourseFlag = function($valid) {
            if ($valid) {
                $scope.disableButton = true;
                $scope.courseFlag.course_id = $scope.currentCourseId;
                $scope.courseFlag.$save()
                    .then(function(response) {
                        $state.reload();
                        if (angular.isDefined(response.id)) {
                            success_msg = $filter("translate")("Course flag detail has been updated successfully.");
                            flash.set(success_msg, "success", false);
                        } else {
                            err_message = $filter("translate")("Already flagged this course");
                            flash.set(err_message, 'error', false);
                        }

                        $scope.disableButton = false;
                    })
                    .catch(function(error) {

                    })
                    .finally();
            }


        };
        /**
         * @ngdoc function
         * @name $modalCancel
         * @function
         *
         * @description
         *
         * to close modal window.
         */
        $scope.modalCancel = function(e) {
            e.preventDefault();
            $scope.$close();
        };
    });
})(angular.module('ace.courseflags'));

(function(module) {
    module.factory('courseFlags', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_flags', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('courseFlag', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_flags/:course_id/users/:user_id', {
                id: '@id'
            }, {
                'get': {
                    method: 'GET'
                }
            }
        );
    });
    module.factory('courseFlagsCategories', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_flag_categories', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
})(angular.module("ace.courseflags"));
