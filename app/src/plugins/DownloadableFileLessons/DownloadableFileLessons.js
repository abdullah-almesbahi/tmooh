/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {


}(angular.module('ace.downloadblefilelesson', [
    'ui.router',
    'ngResource'
])));

(function(module) {
    module.directive('downloadableFileLessonsForm', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/DownloadableFileLessons/downloadableFileLessonsForm.tpl.html',
            link: linker,
            controller: 'downloadableFileLessonsFormController as model',
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

    module.controller('downloadableFileLessonsFormController', function(Course, $scope, addOnlineCourseLessons, $http, OnlineCourseLessonsUpdate, flash, GENERAL_CONFIG, $filter, $rootScope, CreateOnlineCourseLesson) {
        var model = this;
        $scope.label = $filter("translate")("Add Downloadable File");
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        $scope.showForm = false;
        $scope.editForm = false;
        $scope.uploadConfigure = function() {
            //to close all forms and show current form
            $scope.$emit('closeLessons', {});
            $scope.showForm = true;
            model.editDownloadableLesson = {};
            model.onlineDownloadableLesson = {};
            model.onlineDownloadableLesson = new addOnlineCourseLessons();
        };
        $scope.hideForm = function(e) {
            e.preventDefault();
            $scope.showForm = false;
            $scope.editForm = false;
        };
        //to close all forms and show current form
        $rootScope.$on('closeLessons', function(event, args) {
            $scope.showForm = false;
        });
        if ($scope.action === 'edit') {
            $scope.editForm = true;
            getLessonUpdate();
        }

        courseID = model.course;
        var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload';
        $scope.disableSave = false;
        $scope.uploadDocumentFile = function(files) {
            if (files.length > 0) {
                $scope.disableSave = true;
                var fd = new FormData();
                //Take the first selected file
                fd.append("attachment", files[0]);
                fd.append("type", "file");
                $http.post(uploadUrl, fd, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                }).success(function(response, status, headers, config) {
                    if (response.error.code === 0) {
                        if ($scope.action === 'edit') {
                            model.editDownloadableLesson.filename = (response.filename);
                        } else {
                            model.onlineDownloadableLesson.filename = (response.filename);
                        }
                    } else {
                        $("#downloadbleFileVal").val("");
                        if ($scope.action === 'edit') {
                            delete(model.editDownloadableLesson.filename);
                        } else {
                            delete(model.onlineDownloadableLesson.filename);
                        }
                        var errorMessage;
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
                }).error(function(error) {
                    $scope.disableSave = false;
                });
            }

        };

        function CheckUnpublishedLessons($valid) {
            var unpublished_lessons = model.publishparent();
            if (unpublished_lessons.length > 0) {
                angular.forEach(unpublished_lessons, function(lessons) {
                    if (lessons.is_chapter === 0) {
                        lessons.online_lesson_type_id = 5;
                        lessons.filename = model.onlineDownloadableLesson.filename;
                        lessons.is_lesson_ready = 1;

                    }
                });
                addLessonDetail(unpublished_lessons);
            }
            if (unpublished_lessons.length === 0) {
                $scope.addDownloadFile();
            }
        }

        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            CreateOnlineCourseLesson.create(lessondetails, function(response) {
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
        $scope.addDownloadFile = function() {
            $scope.disableButton = true;
            model.onlineDownloadableLesson.online_lesson_type_id = 5;
            model.onlineDownloadableLesson.course_id = parseInt(courseID);
            model.onlineDownloadableLesson.is_chapter = 0;
            model.onlineDownloadableLesson.id = $scope.lessonID;
            model.onlineDownloadableLesson.is_lesson_ready = 1;
            OnlineCourseLessonsUpdate.update(model.onlineDownloadableLesson, function(response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Downloadable file added successfully.");
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
                .then(function(response) {
                    model.editDownloadableLesson = {};
                    model.editDownloadableLesson.lesson_name = response.data[0].lesson_name;
                    model.editDownloadableLesson.lesson_description = response.data[0].lesson_description;
                });
        }

        $scope.editDownloadFile = function() {
            model.editDownloadableLesson.id = $scope.lessonID;
            model.editDownloadableLesson.online_lesson_type_id = 5;
            model.editDownloadableLesson.name = model.editDownloadableLesson.lesson_name;
            model.editDownloadableLesson.description = model.editDownloadableLesson.lesson_description;
            model.editDownloadableLesson.is_lesson_ready = 1;
            if (model.editDownloadableLesson.filename === "") {
                delete model.editDownloadableLesson.filename;
            }
            delete model.editDownloadableLesson.lesson_name;
            delete model.editDownloadableLesson.lesson_description;
            OnlineCourseLessonsUpdate.update(model.editDownloadableLesson, function(response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Downloadable file updated successfully.");
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
})(angular.module('ace.downloadblefilelesson'));

(function(module) {
    module.factory('OnlineCourseLessons', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/online_course_lessons', {
                id: '@id'
            }
        );
    });
    module.factory('OnlineCourseLessonsUpdate', function($resource, GENERAL_CONFIG) {
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

    module.factory('addOnlineCourseLessons', function($resource, GENERAL_CONFIG) {
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

})(angular.module('ace.downloadblefilelesson'));