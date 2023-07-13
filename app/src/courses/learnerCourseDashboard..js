(function(module) {

    module.controller('learnerCourseDashboardController', function(Course, $scope, $rootScope, $state, $uibModal, $timeout, TokenService, $filter, flash, ViewCourseUser, ViewCourse, User, Archive, Unarchive, $location) {
        $rootScope.pageTitle =   $filter("translate")("Learn") + " | " + $rootScope.settings['site.name'];
        var model = this;
        model.loading = true;
        model.type = $state.params.type;
        $scope.WhatActionsStudentsHaveToPerformBeforeBegin = [];
        $scope.whoShouldTakeThisCourseAndWhoShouldNot = [];
        $scope.$on('$locationChangeSuccess', function() {
            getCourse();
            model.type = $state.params.type;
        });

        function getCourse() {
            model.loading = true;
            ViewCourseUser.get({
                    id: $state.params.course_user_id,
                }).$promise
                .then(function(response) {
                    if (response.data.length > 0) {
                        model.course_users = response.data[0];
                        ViewCourse.get({
                                id: model.course_users.course_id,
                                field: 'description,what_actions_students_have_to_perform_before_begin,what_actions_students_have_to_perform_before_begin,user_image_hash,user_id,displayname,id'
                            }).$promise
                            .then(function(response) {
                                if (response.error.code === 0 && response.data.length > 0) {
                                    model.course = response.data[0];
                                    $scope.whoShouldTakeThisCourseAndWhoShouldNot = (response.data[0].who_should_take_this_course_and_who_should_not) ? response.data[0].who_should_take_this_course_and_who_should_not : '';
                                    $scope.WhatActionsStudentsHaveToPerformBeforeBegin = (response.data[0].what_actions_students_have_to_perform_before_begin) ? response.data[0].what_actions_students_have_to_perform_before_begin : '';
                                    if (angular.isDefined(model.course.user_id) && model.type === 'overview') {
                                        User.getUser({
                                                id: model.course.user_id,
                                                field: 'twitter_profile_link,google_plus_profile_link,facebook_profile_link,youtube_profile_link,website,linkedin_profile_link,biography'
                                            }).$promise
                                            .then(function(response) {
                                                if (response !== null && response !== undefined) {
                                                    if (response.data !== null && response.data !== undefined) {
                                                        if (angular.isDefined(response.data[0])) {
                                                            if (response.data.length > 0) {
                                                                model.user_profile = response.data[0];
                                                            }
                                                        }
                                                    }
                                                }

                                            });
                                    }
                                }
                            });
                        model.loading = false;
                    }
                });
        }
        getCourse();
    });
}(angular.module("ace.courses")));
