(function(module) {
    module.directive('learnerDashboardNavbar', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/learnerDasboardNavbar.tpl.html',
            link: linker,
            controller: 'learnerDasboardNavbarController as model',
            bindToController: true,
            scope: {}
        };
    });
    module.controller('learnerDasboardNavbarController', function(Course, $scope, $rootScope, $state, $uibModal, $timeout, TokenService, $filter, flash, ViewCourseUser, ViewCourse, User, Archive, Unarchive, $location) {
        var model = this;
        model.loading = true;
        model.type = $state.params.type;
        model.addToArchive = addToArchive;
        model.addToUnarchive = addToUnarchive;
        model.archive = new Archive();
        model.unarchive = new Unarchive();
        model.IntructorToScroll = IntructorToScroll;

        function getCourseUserDetails(is_reload) {
            model.loading = (is_reload === null) ? true : false;
            ViewCourseUser.get({
                    id: $state.params.course_user_id,
                    field: 'current_online_course_lesson_id,course_slug,course_id,id,user_id,rating,active_online_course_lesson_count,completed_lesson_count,course_user_status,course_image,course_image_hash,course_slug,course_title'
                }).$promise
                .then(function(response) {
                    if (response.data !== null && response.data !== undefined) {
                        if (response.data.length > 0) {
                            model.course_users = response.data[0];
                            model.course_users.rating_text = (model.course_users.rating !== null && model.course_users.rating !== undefined && model.course_users.rating > 0) ? 'Edit Your Rating' : 'Rate This Course';
                            model.loading = false;
                        } else {
                            error();
                        }
                    } else {
                        error();
                    }
                }, function(error) {
                    error();
                });
        }

        function addToArchive() {
            model.archive.id = $state.params.course_user_id;
            model.archive.$save()
                .then(function(response) {
                    if (response.error.code === 0) {
                        getCourseUserDetails('update');
                        flashMessage = $filter("translate")("Archived Successfully");
                        flash.set(flashMessage, 'success', false);
                    }
                })
                .catch(function(error) {

                })
                .finally();
        }

        function IntructorToScroll(element) {
            $location.path('/learn/' + $state.params.course_user_id + '/overview').replace();
            $timeout(function() {
                if (element !== null && angular.isDefined(element)) {
                    $('html, body').animate({
                        scrollTop: $(element).offset().top
                    }, 1500, 'swing', false);
                }
            }, 1000);

        }

        function addToUnarchive() {
            model.unarchive.id = $state.params.course_user_id;
            model.unarchive.$save()
                .then(function(response) {
                    if (response.error.code === 0) {
                        getCourseUserDetails('update');
                        // to hide pagination when course length is 0
                        flashMessage = $filter("translate")("Unarchived Successfully");
                        flash.set(flashMessage, 'success', false);
                    }
                })
                .catch(function(error) {

                })
                .finally();
        }

        $rootScope.$on('updateLeanerCourseParent', function(event, args) {
            getCourseUserDetails('update');
        });
        getCourseUserDetails(null);

        $scope.goState = function(type) {
            $state.go('LearnCourseview', {
                'type': type,
                'course_user_id': model.course_users.id,
            }, {
                reload: false
            }, {
                notify: false
            });
        };

        function error() {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
    });
})(angular.module('ace.courses'));