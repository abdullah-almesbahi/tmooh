/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {



}(angular.module('ace.multipleInstructor', [
    'ui.router',
    'ngResource',
])));

(function(module) {
    module.directive('multipleInstructor', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/MultipleInstructor/multipleInstructor.tpl.html',
            link: linker,
            controller: 'multipleInstructorController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });

    module.controller('multipleInstructorController', function($state, MultipleInstructorLists, MultipleInstructor, $location, $scope, flash, $filter, $rootScope, $interval, User, UserProfile) {
        var model = this;
        model.loading = true;
        model.addInstructorEmail = addInstructorEmail;
        model.InstructorDelete = InstructorDelete;
        model.InstructorUpdate = InstructorUpdate;
        model.paginate = paginate;
        model.currentPage = 1;
        $rootScope.pageTitle = $filter("translate")("Manage Credit Card")+ " | " +$rootScope.settings['site.name'];
        getMultipleInstructor(null);

        function getMultipleInstructor(element) {
            var page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            if ($rootScope.auth) {
                MultipleInstructorLists.get({
                        course_id: model.courseId,
                        page: page
                    }).$promise
                    .then(function(response) {
                        model._metadata = response._metadata;
                        model.multiple_instructors = response.data;
                        if (element !== null && angular.isDefined(element)) {
                            $('html, body').animate({
                                scrollTop: $(element).offset().top
                            }, 1500, 'swing', false);
                        }
                    });
            }
        }

        function addInstructorEmail() {
            $scope.email_disableButton = true;
            model.user.course_id = model.courseId;
            MultipleInstructorLists.create(model.user, function(response) {
                if (response.error.code === 0) {
                    model.user = {};
                    flashMessage = $filter("translate")("Instructor has been added successfully.");
                    flash.set(flashMessage, 'success', false);
                    getMultipleInstructor(null);
                    $scope.user = {};
                } else {
                    flashMessage = $filter("translate")(response.error.message);
                    flash.set(flashMessage, 'error', false);
                }
                $scope.email_disableButton = false;
            }, function(error) {
                flashMessage = $filter("translate")("Error occurred while adding Instructor. Try again later.");
                flash.set(flashMessage, 'error', false);
                $scope.email_disableButton = false;
            });
        }

        function InstructorDelete(instructor_id, index, event) {
            event.preventDefault();
            MultipleInstructor.deleteInstructor({
                    courseInstructorId: instructor_id,
                }).$promise
                .then(function(response) {
                    if (response.error.code === 0) {
                        model.multiple_instructors.splice(index, 1);
                        flashMessage = $filter("translate")("Instructor has been deleted successfully.");
                        flash.set(flashMessage, 'success', false);
                    } else {
                        flashMessage = $filter("translate")("Instructor couldn't be deleted. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function(error) {
                    flashMessage = $filter("translate")("Error occurred while deleting Instructor. Try again later.");
                    flash.set(flashMessage, 'error', false);
                });
        }

        function InstructorUpdate(instructor_id, index, event) {
            event.preventDefault();
            var calculate = 0;
            angular.forEach(model.multiple_instructors, function(data) {
                calculate = parseInt(calculate) + parseInt(data.sharing_percentage);
            });
            var params = {};
            //Checking viewable and editing condition
            if (model.multiple_instructors[index].is_editable === true) {
                model.multiple_instructors[index].is_viewable = true;
            }
            params.is_viewable = model.multiple_instructors[index].is_viewable;
            params.is_editable = model.multiple_instructors[index].is_editable;
            params.sharing_percentage = model.multiple_instructors[index].sharing_percentage;
            if (calculate <= 100) {
                MultipleInstructor.updateInstructor({
                        courseInstructorId: instructor_id,
                    }, params).$promise
                    .then(function(response) {
                        if (response.error.code === 0) {
                            getMultipleInstructor(null);
                            flashMessage = $filter("translate")("Instructor has been updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("Instructor couldn't be updated. Try again later.");
                            flash.set(flashMessage, 'error', false);

                        }
                    }, function(error) {
                        flashMessage = $filter("translate")("Error occurred while updating Instructor. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    });
            } else {
                flashMessage = $filter("translate")("Overall sharing percentage should be 100 or less than 100.");
                flash.set(flashMessage, 'error', false);
            }
        }

        function paginate(element) {
            model.currentPage = parseInt(model.currentPage);
            getMultipleInstructor(element);
        }
        var autoRefresh;
        $scope.autoReload = function() {
            autoRefresh = $interval(function() {
                $state.reload();
            }, 20000);
        };
        $scope.stopReload = function() {
            if (angular.isDefined(autoRefresh)) {
                $interval.cancel(autoRefresh);
                autoRefresh = undefined;
            }
        };
        $scope.$on('$destroy', function() {
            $scope.stopReload();
        });

    });
    module.directive('multipleInstructorShow', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/MultipleInstructor/multipleInstructorShow.tpl.html',
            link: linker,
            controller: 'multipleInstructorShowController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('multipleInstructorShowController', function($state, GetCourseInstuctor, $scope, User, ConstProfileSocialLink) {
        var model = this;
        model.loading = true;
        if (angular.isDefined(model.courseId) && model.courseId !== '') {
                GetCourseInstuctor.get({
                        course_id: model.courseId,
                    }).$promise
                    .then(function(response) {
                        if (response.data.length > 0) {
                            model.multipleInstructor = [];
                            angular.forEach(response.data, function(instructor) {
                                User.getUser({
                                        id: instructor.user_id,
                                        field: 'twitter_profile_link,google_plus_profile_link,facebook_profile_link,youtube_profile_link,website,linkedin_profile_link,biography,image_hash,user_id,displayname,designation'
                                    }).$promise
                                    .then(function(response) {
                                        if (response !== null && response !== undefined) {
                                            if (response.data !== null && response.data !== undefined) {
                                                if (response.data.length > 0) {
                                                    if (response.data[0].facebook_profile_link !== null && response.data[0].facebook_profile_link !== undefined) {
                                                            response.data[0].facebook_profile_link = ConstProfileSocialLink.facebook + '' + response.data[0].facebook_profile_link;
                                                        }
                                                        if (response.data[0].twitter_profile_link !== null && response.data[0].twitter_profile_link !== undefined) {
                                                            response.data[0].twitter_profile_link = ConstProfileSocialLink.twitter + '' + response.data[0].twitter_profile_link;
                                                        }
                                                        if (response.data[0].google_plus_profile_link !== null && response.data[0].google_plus_profile_link !== undefined) {
                                                            response.data[0].google_plus_profile_link = ConstProfileSocialLink.google + '' + response.data[0].google_plus_profile_link;
                                                        }
                                                        if (response.data[0].linkedin_profile_link !== null && response.data[0].linkedin_profile_link !== undefined) {
                                                            response.data[0].linkedin_profile_link = ConstProfileSocialLink.linkedin + '' + response.data[0].linkedin_profile_link;
                                                        }
                                                        if (response.data[0].youtube_profile_link !== null && response.data[0].youtube_profile_link !== undefined) {
                                                            response.data[0].youtube_profile_link = ConstProfileSocialLink.youtube + '' + response.data[0].youtube_profile_link;
                                                        }
                                                    model.multipleInstructor.push(response.data[0]);
                                                }
                                            }
                                        }
                                    },function(error){});
                            });
                        }
                        model.loading = false;
                    }, function(error) {
                model.loading = false;
            });
        }

    });
})(angular.module('ace.multipleInstructor'));

(function(module) {

    module.factory('MultipleInstructorLists', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_instructors', {
                course_id: '@course_id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('MultipleInstructor', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_instructors/:courseInstructorId', {}, {
                deleteInstructor: {
                    method: 'DELETE',
                    courseInstructorId: '@courseInstructorId'
                },
                updateInstructor: {
                    method: 'PUT',
                    courseInstructorId: '@courseInstructorId'
                }
            }
        );
    });
})(angular.module("ace.multipleInstructor"));
