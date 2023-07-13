/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function(module) {


}(angular.module('ace.articlelesson', [
    'ui.router',
    'ngResource'
])));

(function(module) {
    module.directive('articleLessonsForm', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/ArticleLessons/articleLessonsForm.tpl.html',
            link: linker,
            controller: 'articleLessonsFormController as model',
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

    module.controller('articleLessonsFormController', function(Course, $scope, addOnlineCourseLessons, OnlineCourseLessons, OnlineCourseLessonsUpdate, $filter, flash, $rootScope, CreateOnlineCourseLesson) {
        var model = this;
        $scope.label = $filter("translate")("Add Article");
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        $scope.showForm = false;
        $scope.editForm = false;
        if ($scope.action === 'edit') {
            $scope.editForm = true;
            getLessonUpdate();
        }
        $scope.uploadConfigure = function() {
            //to close all forms and show current form
            $scope.$emit('closeLessons', {});
            $scope.showForm = true;
            model.editOnlineLesson = {};
            model.onlineLesson = {};
            model.onlineLesson = new addOnlineCourseLessons();
        };
        //to close all forms and show current form
        $rootScope.$on('closeLessons', function(event, args) {
            $scope.showForm = false;
            //to clear textangular editor vaildation scope values.
            $scope.info = "";
            $scope.error = false;
        });

        $scope.hideForm = function(e) {
            e.preventDefault();
            $scope.showForm = false;
            $scope.editForm = false;
        };
        //model.editOnlineLesson = [];       
        courseID = model.course;
        $scope.error = false;


        function CheckUnpublishedLessons(e, add_article) {
            var unpublished_lessons = model.publishparent();
            if (unpublished_lessons.length > 0) {
                $scope.error = false;
                if (add_article.article_content.$invalid) {
                    $scope.info = $filter("translate")("Lesson could not be updated. Please enter article content.");
                    $scope.error = true;
                    return;
                }
                angular.forEach(unpublished_lessons, function(lessons) {
                    if (lessons.is_chapter === 0) {
                        lessons.online_lesson_type_id = 1;
                        lessons.article_content = model.onlineLesson.article_content;
                        lessons.is_lesson_ready = 1;

                    }
                });
                addLessonDetail(unpublished_lessons);
            }
            if (unpublished_lessons.length === 0) {
                $scope.addArticle(e, add_article);
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
        $scope.addArticle = function(e, add_article) {
            $scope.error = false;
            if (add_article.article_content.$invalid) {
                $scope.info = $filter("translate")("Lesson could not be updated. Please enter article content.");
                $scope.error = true;
                return;
            }
            $scope.disableButton = true;
            model.onlineLesson.online_lesson_type_id = 1;
            model.onlineLesson.course_id = parseInt(courseID);
            model.onlineLesson.is_chapter = 0;
            model.onlineLesson.id = $scope.lessonID;
            model.onlineLesson.is_lesson_ready = 1;
            OnlineCourseLessonsUpdate.update(model.onlineLesson, function(response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Article added successfully.");
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
                    model.editOnlineLesson = {};
                    model.editOnlineLesson.lesson_name = response.data[0].lesson_name;
                    model.editOnlineLesson.lesson_description = response.data[0].lesson_description;
                    model.editOnlineLesson.filename = response.data[0].filename;
                    model.editOnlineLesson.edit_article_content = response.data[0].article_content;
                });
        }

        $scope.editArticle = function(e, edit_article) {
            $scope.error = false;
            if (edit_article.edit_article_content.$invalid) {
                $scope.info = $filter("translate")("Lesson could not be updated. Please enter article content.");
                $scope.error = true;
                return;
            }
            $scope.disableButton = true;
            model.editOnlineLesson.id = $scope.lessonID;
            model.editOnlineLesson.online_lesson_type_id = 1;
            model.editOnlineLesson.name = model.editOnlineLesson.lesson_name;
            model.editOnlineLesson.description = model.editOnlineLesson.lesson_description;
            model.editOnlineLesson.is_lesson_ready = 1;
            model.editOnlineLesson.article_content = model.editOnlineLesson.edit_article_content;
            delete model.editOnlineLesson.lesson_name;
            delete model.editOnlineLesson.lesson_description;
            delete model.editOnlineLesson.edit_article_content;
            OnlineCourseLessonsUpdate.update(model.editOnlineLesson, function(response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Article updated successfully.");
                    flash.set(succsMsg, 'success', false);
                    $scope.editForm = false;
                    model.updateparent();
                    UpdateCourseStatus();
                }
                $scope.disableButton = false;
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
})(angular.module('ace.articlelesson'));

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

})(angular.module('ace.articlelesson'));