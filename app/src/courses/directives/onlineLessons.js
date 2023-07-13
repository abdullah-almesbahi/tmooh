(function (module) {
    module.directive('onlineLessons', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/onlineLessons.tpl.html',
            link: linker,
            controller: 'onlineLessonsController as model',
            bindToController: true,
            scope: {
                course: '=homeCourse',
                courseId: '@courseId',
                lookups: '=courseLookups',
                filter: '@filter',
                limit: '@limit',
            }
        };
    });

    module.controller('onlineLessonsController', function ($state, OnlineCourseLessons, $scope, OnlineLessonViewComplete, $filter, $timeout, $rootScope) {
        var model = this;
        model.loader = true;
        model.OnlineCourse = {};
        model.lessonComplete = lessonComplete;
        model.setOpenAll = setOpenAll;
        model.course_user_id = $state.params.course_user_id;
        model.course_id = model.courseId;
        model.search_start = false;
        $scope.message_must_enroll = $filter("translate")("You need to enroll this course to be able to watch this lesson");
        $scope.message_must_register = $filter("translate")("You need to register to be able to watch this lesson");
        model.count = { 'lesson_count': 0, 'Quiz_count': 0, 'CodingExercise_count': 0, 'praticeTest_count': 0 };
        var tmp_chapters;
        var courseArr = {
            id: model.course_id,
            sort: 'display_order',
            sort_by: 'ASC',
            limit: 'all',
        };
        if (model.filter === 'CourseLearner') {
            courseArr.view = 'learner_view';
        }
        OnlineCourseLessons.get(courseArr).$promise
            .then(function (response) {
                model.OnlineCourses = response;
                model.OnlineCourse = $.grep(response.data, function (e) {
                    return ((e.is_chapter === 0 && e.is_lesson_ready !== 0) || (e.is_chapter === 1) || e.is_chapter === 0 && (e.is_coding_exercises === true || ((e.is_quiz === true || e.is_assignment === true || e.is_practice_test === true || e.is_assignment === true) && e.quiz_question_count > 0)));
                });
                $scope.online_chapters = [];
                var online_chapter_key, chapters = [];
                angular.forEach(model.OnlineCourse, function (online_lessons_value, online_lessons_key) {
                    if (parseInt(online_lessons_value.is_chapter) === 1) {
                        chapters.push(online_lessons_value);
                    }
                });
                if (chapters.length > 0) {
                    angular.forEach(model.OnlineCourse, function (online_lessons_value, online_lessons_key) {
                        if (parseInt(online_lessons_value.is_chapter) === 1) {
                            online_chapter_key = online_lessons_value.id;
                            if (online_lessons_value.lessons === undefined) {
                                online_lessons_value.lessons = [];
                            }
                            /*Checking unique chapters*/
                            var ChaptersFound = $scope.online_chapters.filter(function (chapter) {
                                return (chapter.id == online_lessons_value.id);
                            });
                            if (ChaptersFound.length === 0) {
                                $scope.online_chapters.push(online_lessons_value);
                            }
                        }
                        /*Pushing the Lessons into the chapters */
                        if (parseInt(online_lessons_value.is_chapter) === 0) {
                            if (online_lessons_value.duration !== null && online_lessons_value.duration !== undefined && online_lessons_value.duration !== 0 && parseInt(online_lessons_value.online_lesson_type_id) === 3) {
                                var videodetails = secondsToTime(online_lessons_value.duration);
                                var times = online_lessons_value.duration.toString().split(".");
                                var cminutes = times[0];
                                var cseconds = times[1];
                                secs = parseInt(cseconds, 10) + (parseInt(cminutes, 10) * 60);
                                if (secs < 60) {
                                    online_lessons_value.video_duration = videodetails.s + ' ' + $filter("translate")("sec");
                                } else if (secs > 60 && secs < 3600) {
                                    online_lessons_value.video_duration = videodetails.m + ':' + videodetails.s + ' ' + $filter("translate")("min");
                                } else {
                                    online_lessons_value.video_duration = videodetails.h + '.' + videodetails.m + ' ' + $filter("translate")("hrs");
                                }
                            }
                            if (online_chapter_key === undefined) {
                                online_chapter_key = chapters[0].id;
                                chapters[0].lessons = [];
                                $scope.online_chapters.push(chapters[0]);

                            }
                            angular.forEach($scope.online_chapters, function (chapter) {
                                if (chapter.id === online_chapter_key) {
                                    if (online_lessons_value.is_coding_exercises === true) {
                                        model.count.CodingExercise_count += 1;
                                        online_lessons_value.lesson_name = online_lessons_value.title;
                                        online_lessons_value.serial_number = model.count.CodingExercise_count;
                                    } else if (online_lessons_value.is_quiz === true) {
                                        model.count.Quiz_count += 1;
                                        online_lessons_value.serial_number = model.count.Quiz_count;
                                    } else if (online_lessons_value.is_practice_test === true) {
                                        model.count.praticeTest_count += 1;
                                        online_lessons_value.serial_number = model.count.praticeTest_count;
                                    } else {
                                        model.count.lesson_count += 1;
                                        online_lessons_value.serial_number = model.count.lesson_count;
                                    }
                                    chapter.lessons.push(online_lessons_value);
                                }
                            });
                        }
                    });
                    /*Checking and  omitting chapters not having any lessons */
                    $scope.online_chapters = $.grep($scope.online_chapters, function (e) {
                        return (e.lessons.length > 0);
                    });
                    angular.forEach($scope.online_chapters, function (chapter) {
                        chapter.total_lessons_count = chapter.lessons.length;
                        chapter.completed_lessons_count = 0;
                        angular.forEach(chapter.lessons, function (lesson) {
                            chapter.completed_lessons_count += (parseInt(lesson.completed) === 1) ? 1 : 0;
                        });
                    });
                    if ($scope.online_chapters.length > 0) {
                        $scope.activeState = 'collapse';
                        $scope.online_chapters[0].is_collapsed = true;
                    }


                }
                model.loader = false;
            });
        $scope.showDetail = function (OnlineCourse, e) {
            e.preventDefault();
            if ($scope.active != OnlineCourse.id) {
                $scope.active = OnlineCourse.id;
            } else {
                $scope.active = null;
            }
        };
        function setOpenAll(expand_value) {
            if (expand_value === 'false') {
                $scope.activeState = 'collapse';
                angular.forEach($scope.online_chapters, function (chapter, key) {
                    if (key === 0) {
                        chapter.is_collapsed = true;
                    } else {
                        chapter.is_collapsed = false;
                    }
                });
            } else if (expand_value === 'true') {
                $scope.activeState = 'expand';
                angular.forEach($scope.online_chapters, function (chapter, key) {
                    chapter.is_collapsed = true;
                });
            }
        }
        // Converting the video timing
        function secondsToTime(secs) {
            var times = secs.toString().split(".");
            var cminutes = times[0];
            var cseconds = times[1];
            secs = parseInt(cseconds, 10) + (parseInt(cminutes, 10) * 60);
            var hours = Math.floor(secs / (60 * 60));
            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            var obj = {
                "h": hours,
                "m": minutes,
                "s": seconds
            };
            return obj;
        }
        function lessonComplete(onlinelessonid, completedStatus) {
            angular.element('#js-loader' + onlinelessonid)
                .addClass('ldisabled lloading');
            if (completedStatus.completed === '1') {
                for (i = 0; i < $scope.online_chapters.length; i++) {
                    for (j = 0; j < $scope.online_chapters[i].lessons.length; j++) {
                        if ($scope.online_chapters[i].lessons[j].id === onlinelessonid) {
                            $scope.online_chapters[i].lessons[j].completed = '0';
                            $scope.online_chapters[i].completed_lessons_count -= ($scope.online_chapters[i].completed_lessons_count === 0 || $scope.online_chapters[i].completed_lessons_count > 0) ? 1 : 0;
                        }
                    }

                }
            } else if (completedStatus.completed === '0') {
                for (i = 0; i < $scope.online_chapters.length; i++) {
                    for (j = 0; j < $scope.online_chapters[i].lessons.length; j++) {
                        if ($scope.online_chapters[i].lessons[j].id === onlinelessonid) {
                            $scope.online_chapters[i].lessons[j].completed = '1';
                            $scope.online_chapters[i].completed_lessons_count += ($scope.online_chapters[i].completed_lessons_count === 0 || $scope.online_chapters[i].completed_lessons_count > 0) ? 1 : 0;
                        }
                    }
                }
            }
            var params = {
                'id': onlinelessonid,
                'is_completed': 1
            };
            OnlineLessonViewComplete.lessonViewComplete(params, function (response) {
                if (response.error.code === 0) {
                    $scope.$emit('updateLeanerCourseParent', {});
                }
                angular.element('#js-loader' + onlinelessonid)
                    .removeClass('ldisabled lloading');
            }, function (error) {
                angular.element('#js-loader' + onlinelessonid)
                    .removeClass('ldisabled lloading');
            });
        }

        $scope.lessonSearch = function (search_text) {
            if (model.search_start === false) {
                model.tmp_chapters = [];
                angular.forEach($scope.online_chapters, function (chapter, key) {
                    model.tmp_chapters.push({
                        'chapter': chapter,
                        'lessons': chapter.lessons
                    });
                });
            }
            $scope.online_chapters = [];
            angular.forEach(model.tmp_chapters, function (tmp_chap, key) {
                delete tmp_chap.chapter.lessons;
                tmp_chap.chapter.lessons = tmp_chap.lessons;
                $scope.online_chapters.push(tmp_chap.chapter);
            });
            model.search_start = true;
            angular.forEach($scope.online_chapters, function (chapter, key) {
                chapter.lessons = $filter('filter')(chapter.lessons, { 'lesson_name': search_text });
            });
            $scope.online_chapters = $.grep($scope.online_chapters, function (e) {
                return (e.lessons.length > 0);
            });
        };
    });
})(angular.module('ace.courses'));
