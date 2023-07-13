(function (module) {
    module.controller('learnCourseController', function ($state, $scope, OnlineCourseLessons, TokenService, $rootScope, OnlineCourseLessonsUpdate, $sce, OnlineLessonViewPost, OnlineLessonViewComplete, $uibModal, GetCourseUserEntry, $filter, TokenServiceData, OnlineCourseLessonsNeighbour, flash, $anchorScroll, ViewCourseUser, $compile) {
        var model = this;
        $('#scrollbox3').enscroll({
            showOnHover: true,
            verticalTrackClass: 'track3',
            verticalHandleClass: 'handle3'
        });
        model.OnlineCourse = [];
        model.viewLessonDetails = [];
        model.neighbourDetails = [];
        model.neighbourDetails.next_id = null;
        model.neighbourDetails.previous_id = null;
        model.viewLessonDetails.completedId = '';
        model.lessonViewCompleteDetails = {};
        model.viewLesson = viewLesson;
        model.lessonComplete = lessonComplete;
        model.learn_page_params = $state.params;
        courseID = $state.params.id ? $state.params.id : '';
        $scope.lessonID = $state.params.lesson ? parseInt($state.params.lesson) : '';
        $scope.couseUserID = $state.params.learn ? parseInt($state.params.learn) : '';
        $scope.shouldChangePlan = false;
        model.lesson_navbar = false;
        if(typeof zE !== "undefined"){
            zE(function() {
                zE.hide();
            });
        }
        var courseUserID = '';
        var courseArr;
        //change params on location reload false
        $scope.$on('$locationChangeSuccess', function () {
            courseID = $state.params.id ? $state.params.id : '';
            $scope.lessonID = $state.params.lesson ? parseInt($state.params.lesson) : '';
            $scope.couseUserID = $state.params.learn ? parseInt($state.params.learn) : '';
            viewLesson($state.params.lesson);
            updateCourseUser();
        });

        $scope.$on('initVideoJsAfter', function (e,player) {
            if(model.viewLessonDetails.online_lesson_type_id === 3 && model.browse_question === true) {
              // player.browserQA();
              $('.vjs-custom-control-spacer.vjs-spacer ').append($compile('<button type="button" ng-click="openBrowseQuestiontab()" class="btn-control vjs-ask-question-button btn btn-sm btn-default"><i class="mx-2 mdi-36px mdi mdi-comment-question-outline" aria-hidden="true"></i><span class="d-none d-sm-inline-block"> ' + $filter("translate")("Browse Q&A") + '</span></button>')($scope));
              if(model.neighbourDetails.next_id !== null){
                $('.vjs-custom-control-spacer.vjs-spacer ').append($compile('<button type="button"  class="btn-control vjs-continue btn btn-sm btn-default" ui-sref="LearnCourse({slug :model.neighbourDetails.course_slug, id:model.neighbourDetails.course_id, lesson: model.neighbourDetails.next_id,learn: couseUserID, is_preview: model.learn_page_params.is_preview})"><i class="mdi-18px mdi mdi-skip-next" aria-hidden="true"></i> <span class="d-none d-sm-inline-block">' + $filter("translate")("Continue") + '</span></button>')($scope));
              }
            }

            // if((model.viewLessonDetails.is_coding_exercises || model.viewLessonDetails.online_lesson_type_id === 1 || model.viewLessonDetails.online_lesson_type_id === 5 || model.viewLessonDetails.online_lesson_type_id === 4) && model.browse_question === true){
            if(model.viewLessonDetails.is_coding_exercises || model.viewLessonDetails.online_lesson_type_id === 1 || model.viewLessonDetails.online_lesson_type_id === 5 || model.viewLessonDetails.online_lesson_type_id === 4){
              player.src(
                {
                  src: $scope.youtube ,
                  type: 'video/youtube'
                });
              $('.vjs-custom-control-spacer.vjs-spacer ').append($compile('<button type="button" ng-click="openBrowseQuestiontab()" class="btn-control vjs-ask-question-button btn btn-sm btn-default"><i class="mx-2 mdi-36px mdi mdi-comment-question-outline" aria-hidden="true"></i><span class="d-none d-sm-inline-block"> ' + $filter("translate")("Browse Q&A") + '</span></button>')($scope));
            }
        });
        viewLesson($state.params.lesson);
        function updateCourseUser() {
            if ($state.params.lesson !== null && $state.params.lesson !== undefined && $scope.couseUserID !== '') {
                var params = {};
                params.current_online_course_lesson_id = $state.params.lesson;
                ViewCourseUser.update({ id: $state.params.learn }, params).$promise
                    .then(function (response) { });
            }

        }
        //getting online lessons based on this course
        if ($rootScope.isAuth) {
            courseArr = {
                id: courseID,
                sort: 'display_order',
                sort_by: 'ASC',
                view: 'learner_view',
                limit: 'all',
            };
        } else {
            courseArr = {
                id: courseID,
                sort: 'display_order',
                sort_by: 'ASC',
                limit: 'all',
            };
        }
        var init = function () {
            coursePurchasedStatus();
            //getting online course lesssons initially
            getOnlineCourseLessons();
        };
        init();
        // completed status
        function coursePurchasedStatus() {
            userID = $rootScope.auth ? $rootScope.auth.id : '';
            var params = {};
            params.course_id = courseID;
            params.user_id = userID;
            if (userID) {
                GetCourseUserEntry.get(params).$promise
                    .then(function (response) {
                        if (angular.isDefined(response.data[0])) {
                            courseUserID = response.data[0].id;
                            $scope.coursePurchased = true;
                        } else {
                            $scope.coursePurchased = false;
                        }
                    });
            }

        }

        function getOnlineCourseLessons() {
            model.count = { 'lesson_count': 0, 'Quiz_count': 0, 'CodingExercise_count': 0, 'praticeTest_count': 0 };
            OnlineCourseLessons.get(courseArr).$promise
                .then(function (response) {
                    var onlinelessonlist, tmp_onlinelessonlist;
                    //Leaner condition checking
                    if ($scope.couseUserID !== '' && $scope.couseUserID !== undefined && $scope.couseUserID !== null) {
                        model.browse_question = true;
                        onlinelessonlist = $.grep(response.data, function (e) {
                            return ((e.is_chapter === 0 && e.is_lesson_ready !== 0) || (e.is_chapter === 1) || (e.is_chapter === 0 && e.is_coding_exercises === true || ((e.is_quiz === true || e.is_assignment === true || e.is_practice_test === true || e.is_assignment === true) && e.quiz_question_count > 0)));
                        });
                        //Instructor condition checking
                    } else if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                        model.browse_question = true;
                        onlinelessonlist = $.grep(response.data, function (e) {
                            return ((e.is_chapter === 0) || (e.is_chapter === 1));
                        });
                        //Preview condition alone checking
                    } else {
                        onlinelessonlist = $.grep(response.data, function (e) {
                            return ((e.is_chapter === 0 && e.is_lesson_ready !== 0 && e.is_preview === 1) || (e.is_chapter === 1));
                        });
                    }
                    tmp_onlinelessonlist = onlinelessonlist;
                    $scope.online_chapters = [];
                    var online_chapter_key, chapters = [];
                    angular.forEach(tmp_onlinelessonlist, function (online_lessons_value, online_lessons_key) {
                        if (parseInt(online_lessons_value.is_chapter) === 1) {
                            chapters.push(online_lessons_value);
                        }
                    });
                    if (chapters.length > 0) {
                        angular.forEach(tmp_onlinelessonlist, function (online_lessons_value, online_lessons_key) {
                            if (parseInt(online_lessons_value.is_chapter) === 1) {
                                online_chapter_key = online_lessons_value.id;
                                if (online_lessons_value.lessons === undefined) {
                                    online_lessons_value.lessons = [];
                                }
                                var ChaptersFound = $scope.online_chapters.filter(function (chapter) {
                                    return (chapter.id == online_lessons_value.id);
                                });
                                if (ChaptersFound.length === 0) {
                                    $scope.online_chapters.push(online_lessons_value);
                                }
                            }
                            if (parseInt(online_lessons_value.is_chapter) === 0) {
                                if (online_lessons_value.duration !== null && online_lessons_value.duration !== undefined && online_lessons_value.duration !== 0 && parseInt(online_lessons_value.online_lesson_type_id) === 3) {

                                    var videodetails = secondsToTime(online_lessons_value.duration);
                                    var times = online_lessons_value.duration.toString().split(".");
                                    var cminutes = times[0];
                                    var cseconds = times[1];
                                    secs = parseInt(cseconds, 10) + (parseInt(cminutes, 10) * 60);
                                    if (secs < 60) {
                                        online_lessons_value.video_duration = videodetails.s;
                                        // online_lessons_value.video_duration = videodetails.s + ' ' + $filter("translate")("sec");
                                    } else if (secs > 60 && secs < 3600) {
                                        online_lessons_value.video_duration = videodetails.m + ':' + videodetails.s;
                                        // online_lessons_value.video_duration = videodetails.m + ':' + videodetails.s + ' ' + $filter("translate")("min");
                                    } else {
                                        online_lessons_value.video_duration = videodetails.h + '.' + videodetails.m;
                                        // online_lessons_value.video_duration = videodetails.h + '.' + videodetails.m + ' ' + $filter("translate")("hrs");
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
                        $scope.online_chapters = $.grep($scope.online_chapters, function (e) {
                            return (e.lessons.length > 0);
                        });

                        if ($scope.online_chapters.length > 0) {
                            angular.forEach($scope.online_chapters, function (chapter,k) {
                                chapter.total_lessons_count = chapter.lessons.length;
                                chapter.completed_lessons_count = 0;
                                angular.forEach(chapter.lessons, function (lesson) {
                                    chapter.completed_lessons_count += (parseInt(lesson.completed) === 1) ? 1 : 0;
                                    if(lesson.id == model.viewLessonDetails.id){
                                        $scope.online_chapters[k].is_collapsed = true;
                                    }
                                });
                            });
                            // OnlineCourse.id == model.viewLessonDetails.id
                            if(angular.isUndefined(model.viewLessonDetails.id)) {
                                $scope.online_chapters[0].is_collapsed = true;
                            }
                            if (angular.isUndefined($state.params.lesson) || !$state.params.lesson) {
                                GetFirstLesson = false;
                                angular.forEach($scope.online_chapters, function (chapter, i) {
                                    if (GetFirstLesson) {
                                        return;
                                    }

                                    //by default it shows first lesson not a chapter
                                    viewLesson(chapter.lessons[0].id);
                                    GetFirstLesson = true;
                                });
                            }else{
                                //if url comes with lesson id it directly opens it
                                viewLesson($state.params.lesson);
                            }
                        }
                    }
                    
                });
        }
        //view individual lesson based on id
        function viewLesson(id) {
            /*Removind default classes */
            angular.element('#js-lesson').removeClass('lessonslist-open');
            angular.element('#js-video').removeClass('lsvediocont');
            angular.element('#js-lesson').removeClass('videocontainer');

            model.lesson_navbar = false;
            $anchorScroll();
            model.viewLessonDetails = {};
            if (angular.isDefined(id) && id !== null) {
                model.viewLessonDetails.id = id;
                params = {};
                params.id = id;
                model.lessonViewPostValues = {};
                OnlineCourseLessonsUpdate.get(params).$promise
                    .then(function (response) {
                        if (response.error) {
                            $scope.shouldBuyCourse = true;
                            if (response.error.code === 1) {
                                $scope.shouldBuyCourse = true;
                            }
                            if (response.error.code === 2) {
                                $scope.shouldBuyCourse = true;
                                $scope.shouldChangePlan = true;
                            }
                        } else {
                            $rootScope.pageTitle =  response.data[0].lesson_name + " | " + $rootScope.settings['site.name'];
                            $rootScope.metaDescription = response.data[0].lesson_description;

                            $scope.youtube = false;
                            if(response.data[0].embed_code != '' && response.data[0].embed_code != null && response.data[0].embed_code != undefined){
                              if(response.data[0].embed_code.indexOf('youtube') >= 0){
                                var src_url = $(response.data[0].embed_code).attr('src');
                                $scope.youtube = src_url;
                              }
                            }
      

                            // Not authenticated
                            if (!$.cookie('refresh_token')) {
                                $scope.shouldBuyCourse = false;
                                model.viewLessonDetails = response.data[0];
                                model.lessonViewPostValues.course_id = response.data[0].course_id;
                                model.lessonViewPostValues.online_course_lesson_id = response.data[0].id;
                                model.viewLessonDetails.embed_code = $sce.trustAsHtml(response.data[0].embed_code);
                                if (angular.isDefined(response.data[0].online_lesson_type_id)) {
                                    if (parseInt(response.data[0].online_lesson_type_id) === 3 || parseInt(response.data[0].online_lesson_type_id) === 4) {
                                        angular.element('#js-video').addClass('lsvediocont');
                                        angular.element('#js-lesson').addClass('videocontainer');
                                    }
                                }
                                if (angular.isDefined(response.data[0].download_url)) {
                                    model.viewLessonDetails.download_url = response.data[0].download_url;
                                }
                                if (angular.isDefined(response.data[0].video_url)) {
                                    model.viewLessonDetails.video_url = response.data[0].video_url;
                                }
                            } else { // authenticated
                                $scope.shouldBuyCourse = false;
                                model.viewLessonDetails = response.data[0];
                                model.lessonViewPostValues.course_id = response.data[0].course_id;
                                model.lessonViewPostValues.online_course_lesson_id = response.data[0].id;

                                if (courseUserID !== null && courseUserID !== undefined && courseUserID !== '') {
                                    model.lessonViewPostValues.course_user_id = courseUserID;
                                    model.viewLessonDetails.course_user_id = courseUserID;
                                }


                                model.viewLessonDetails.embed_code = $sce.trustAsHtml(response.data[0].embed_code);
                                if (angular.isDefined(response.data[0].online_lesson_type_id)) {
                                    if (parseInt(response.data[0].online_lesson_type_id) === 3 || parseInt(response.data[0].online_lesson_type_id) === 4) {
                                        angular.element('#js-video').addClass('lsvediocont');
                                        angular.element('#js-lesson').addClass('videocontainer');
                                    }
                                }
                                if (angular.isDefined(response.data[0].download_url)) {
                                    model.viewLessonDetails.download_url = response.data[0].download_url;
                                }
                                if (angular.isDefined(response.data[0].video_url)) {
                                    model.viewLessonDetails.video_url = response.data[0].video_url;
                                }
                                if (response.data[0].is_coding_exercises === true) {
                                    model.viewLessonDetails.lesson_name = model.viewLessonDetails.title;
                                }
                                if ($rootScope.isAuth && response.data[0].viewed !== '1') {
                                    // add lesson views for first time i.e when viewed not equal to true
                                    OnlineLessonViewPost.lessonViewPost(model.lessonViewPostValues, function (response) {
                                        if (response) {
                                            for (i = 0; i < model.OnlineCourse.length; i++) {
                                                if (model.OnlineCourse[i].id === id) {
                                                    model.OnlineCourse[i].viewcompleted = 1;
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            $rootScope.status = 'ready';
                        }
                    });
                //getting previous and next id of lessons
                OnlineCourseLessonsNeighbour.get({
                    id: id
                }).$promise
                    .then(function (response) {
                        if (angular.isDefined(response)) {
                            model.neighbourDetails = response;
                        }
                    });
            }
        }
        // to change lesson completed status
        function lessonComplete(onlinelessonid, completedStatus) {
            angular.element('#js-loader' + onlinelessonid)
                .addClass('ldisabled lloading');
            if (completedStatus.completed === '1') {
                if (parseInt(onlinelessonid) === parseInt(model.viewLessonDetails.id)) {
                    model.viewLessonDetails.completed = '0';
                }
                for (i = 0; i < $scope.online_chapters.length; i++) {
                    for (j = 0; j < $scope.online_chapters[i].lessons.length; j++) {
                        if ($scope.online_chapters[i].lessons[j].id === onlinelessonid) {
                            $scope.online_chapters[i].lessons[j].completed = '0';
                            $scope.online_chapters[i].completed_lessons_count -= ($scope.online_chapters[i].completed_lessons_count === 0 || $scope.online_chapters[i].completed_lessons_count > 0) ? 1 : 0;
                        }
                    }

                }
            } else if (completedStatus.completed === '0') {
                if (parseInt(onlinelessonid) === parseInt(model.viewLessonDetails.id)) {
                    model.viewLessonDetails.completed = '1';
                }
                for (i = 0; i < $scope.online_chapters.length; i++) {
                    for (j = 0; j < $scope.online_chapters[i].lessons.length; j++) {
                        if ($scope.online_chapters[i].lessons[j].id === onlinelessonid) {
                            $scope.online_chapters[i].lessons[j].completed = '1';
                            $scope.online_chapters[i].completed_lessons_count += ($scope.online_chapters[i].completed_lessons_count === 0 || $scope.online_chapters[i].completed_lessons_count > 0) ? 1 : 0;
                        }
                    }
                }
            }
            model.lessonViewCompleteDetails.id = onlinelessonid;
            model.lessonViewCompleteDetails.is_completed = 1;
            OnlineLessonViewComplete.lessonViewComplete(model.lessonViewCompleteDetails, function (response) {
                angular.element('#js-loader' + onlinelessonid)
                    .removeClass('ldisabled lloading');
            }, function (error) {
                angular.element('#js-loader' + onlinelessonid)
                    .removeClass('ldisabled lloading');
            });
        }
        $scope.modalLogin = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/login.tpl.html',
                    controller: 'userLoginController',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    if (angular.isDefined(data['ace.socialLogin'])) {
                                        var module = data['ace.socialLogin'];
                                        return $ocLazyLoad.load(module, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                    // handle finally
                });
                $rootScope.modal = true;
            }
        };
        $scope.showLessonNavbar = function (e) {
            e.preventDefault();
            angular.element('#js-lesson')
                .addClass('lessonslist-open');
            model.lesson_navbar = true;
        };

        $scope.hideLessonNavbar = function (e) {
            e.preventDefault();
            angular.element('#js-lesson')
                .removeClass('lessonslist-open');
            model.lesson_navbar = false;
        };
        $scope.openBrowseQuestiontab = function () {
            angular.element('#js-lesson').addClass('qa-questions-open');
        };
        $scope.closeBrowseQuestiontab = function () {
            angular.element('#js-lesson').removeClass('qa-questions-open');
        };
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

        $scope.$on("$destroy", function(){
            if(typeof zE !== "undefined"){
                zE(function() {
                    zE.show();
                });
            }
        });
    });
} (angular.module("ace.courses")));
