/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {


} (angular.module('ace.videolesson', [
    'ui.router',
    'ngResource'
])));

(function (module) {
    module.directive('videoLessonsForm', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/VideoLessons/videoLessonsForm.tpl.html',
            link: linker,
            controller: 'videoLessonsFormController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                lessonId: '@lessonId',
                updateparent: '&',
                publishparent: '&'
            }
        };
    });

    module.controller('videoLessonsFormController', function (Course, $scope, addOnlineCourseLessons, $http, OnlineCourseLessons, OnlineCourseLessonsUpdate, flash, $filter, GENERAL_CONFIG, $rootScope, CreateOnlineCourseLesson) {
        var model = this;
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        $scope.tab_active = 'upload_video';
        model.amazonS3Upload = amazonS3Upload;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        model.unpublishedLessonDetails = unpublishedLessonDetails;
        $scope.showForm = false;
        $scope.editForm = false;
        if ($scope.action === 'edit') {
            $scope.editForm = true;
            getLessonUpdate();
        }
        $scope.label = $filter("translate")("Add Video");

        $scope.uploadConfigure = function () {
            //to close all forms and show current form
            $scope.$emit('closeLessons', {});
            $scope.showForm = true;
            model.editOnlineVideoLesson = {};
            model.onlineVideoLesson = {};
            model.onlineVideoLesson = new addOnlineCourseLessons();
        };
        $scope.hideForm = function (e) {
            e.preventDefault();
            $scope.showForm = false;
            $scope.editForm = false;
        };
        //to close all forms and show current form
        $rootScope.$on('closeLessons', function (event, args) {
            $scope.showForm = false;
        });
        var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload';
        $scope.disableSave = false;

        courseID = model.course;
        $scope.uploadVideo = function (files) {
            if (files.length > 0) {
                $scope.disableSave = true;
                var fd = new FormData();
                //Take the first selected file
                fd.append("attachment", files[0]);
                fd.append("type", "video");
                $http.post(uploadUrl, fd, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                }).success(function (response, status, headers, config) {
                    if (response.error.code === 0) {
                        if ($scope.action === 'edit') {
                            model.editOnlineVideoLesson.filename = (response.filename);
                        } else {
                            model.onlineVideoLesson.filename = (response.filename);
                        }
                    } else {
                        if ($scope.action === 'edit') {
                            delete (model.editOnlineVideoLesson.filename);
                        } else {
                            delete (model.onlineVideoLesson.filename);
                        }
                        $("#inputTaskAttachments").val("");
                        if (response.error.code === 1) {
                            errorMessage = $filter("translate")("File couldn't be uploaded. File extension not allowed");
                        } else if (response.error.code === 2) {
                            errorMessage = $filter("translate")("File couldn't be uploaded. File extension not allowed");
                        } else if (response.error.code === 3) {
                            errorMessage = $filter("translate")("The uploaded file size exceeds the allowed size.");
                        } else {
                            errorMessage = response.error.message;
                        }
                        flash.set(errorMessage, 'error', false);
                    }
                    $scope.disableSave = false;
                }).error();
            }
        };

        function amazonS3Upload(response) {
            if (!response.error) {
                if (response.formName === 'add_video') {
                    model.onlineVideoLesson.aws_url = response.aws_url;
                } else if (response.formName === 'edit_video') {
                    model.editOnlineVideoLesson.aws_url = response.aws_url;
                }
            }
        }
        model.tabActivate = function (form_tab) {
            $scope.tab_active = form_tab;

        };

        function unpublishedLessonDetails() {
            var unpublished_lessons_detail = model.publishparent();
            return unpublished_lessons_detail;
        }

        function CheckUnpublishedLessons($valid) {
            if ($valid) {
                var unpublished_lessons = model.publishparent();
                angular.forEach(unpublished_lessons, function (lessons) {
                    if (lessons.is_chapter === 0) {
                        lessons.online_lesson_type_id = 3;
                        lessons.aws_url = model.onlineVideoLesson.aws_url;
                        lessons.is_lesson_ready = 1;

                    }
                });
                if (unpublished_lessons.length > 0) {
                    addLessonDetail(unpublished_lessons);
                }
                if (unpublished_lessons.length === 0) {
                    $scope.addVideoDetails($valid);
                }
            }

        }

        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            CreateOnlineCourseLesson.create(lessondetails, function (response) {
                if (response.data) {
                    if (lessons.length > 0) {
                        addLessonDetail(lessons);
                    } else {
                        model.updateparent();
                        UpdateCourseStatus();
                    }
                }
            });
        }
        $scope.addVideoDetails = function (e) {
            $scope.disableButton = true;
            model.onlineVideoLesson.online_lesson_type_id = 3;
            model.onlineVideoLesson.course_id = parseInt(courseID);
            model.onlineVideoLesson.is_chapter = 0;
            model.onlineVideoLesson.id = $scope.lessonID;
            model.onlineVideoLesson.is_lesson_ready = 1;
            OnlineCourseLessonsUpdate.update(model.onlineVideoLesson, function (response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Video added successfully.");
                    flash.set(succsMsg, 'success', false);
                    model.updateparent();
                    UpdateCourseStatus();
                    $scope.disableButton = false;
                }
            });
        };


        function getLessonUpdate() {
            OnlineCourseLessonsUpdate.get({
                id: $scope.lessonID
            }).$promise
                .then(function (response) {
                    model.editOnlineVideoLesson = {};
                    model.editOnlineVideoLesson.lesson_name = response.data[0].lesson_name;
                    model.editOnlineVideoLesson.lesson_description = response.data[0].lesson_description;
                });
        }

        $scope.editVideodetails = function (e) {
            model.editOnlineVideoLesson.online_lesson_type_id = 3;
            model.editOnlineVideoLesson.id = $scope.lessonID;
            model.editOnlineVideoLesson.name = model.editOnlineVideoLesson.lesson_name;
            model.editOnlineVideoLesson.description = model.editOnlineVideoLesson.lesson_description;
            model.editOnlineVideoLesson.is_lesson_ready = 1;
            if (model.editOnlineVideoLesson.filename === "") {
                delete model.editOnlineVideoLesson.filename;
            }
            delete model.editOnlineVideoLesson.lesson_name;
            delete model.editOnlineVideoLesson.lesson_description;
            OnlineCourseLessonsUpdate.update(model.editOnlineVideoLesson, function (response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Video updated successfully.");
                    flash.set(succsMsg, 'success', false);
                    $scope.editForm = false;
                    model.updateparent();
                    UpdateCourseStatus();
                }
            });
        };
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
    });
})(angular.module('ace.videolesson'));

(function (module) {
    module.factory('OnlineCourseLessons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/online_course_lessons', {
                id: '@id'
            }
        );
    });

    module.factory('OnlineCourseLessonsUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

    module.factory('addOnlineCourseLessons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

})(angular.module("ace.videolesson"));