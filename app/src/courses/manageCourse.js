(function (module) {

    module.controller('manageCourseController', function ($state, Course, Pages, $filter, TokenServiceData, $rootScope, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle =   $filter("translate")("Manage Course") + " | " + $rootScope.settings['site.name'];
        model.courseRoadmap = [];
        var slugName = 'course-road-map';
        var params = {};
        params.slug = slugName;
        params.iso2 = $.cookie("currentLocale");
        staticRoadMap();
        $rootScope.$on('changeLanguage', function (event, args) {
            params.iso2 = args.currentLocale;
            staticRoadMap();
        });

        function staticRoadMap() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                Pages.get(params).$promise
                    .then(function (response) {
                        model.courseRoadmap = response.data[0];
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }

    });
    module.controller('ManageCourseFeedbackController', function (Pages, $filter, TokenServiceData, $rootScope, $state, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Feedback") + " | " + $rootScope.settings['site.name'];
        model.courseFeedback = [];
        var slugName = 'manage-course-feedback';
        var params = {};
        params.slug = slugName;
        params.iso2 = $.cookie("currentLocale");
        staticCourseFeedback();
        $rootScope.$on('changeLanguage', function (event, args) {
            params.iso2 = args.currentLocale;
            staticCourseFeedback();
        });

        function staticCourseFeedback() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                Pages.get(params).$promise
                    .then(function (response) {
                        model.courseFeedback = response.data[0];
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }
    });
    module.controller('ManageCourseh2kFeedbackController', function (H2kFeedbackList, $filter, TokenServiceData, $rootScope, $state, $scope, CourseH2kFeedback, flash, ViewCourse, CourseUpdate, $window, AlertBox, CourseAnnoucementMessage, GetCourseFeedbackQuestions) {
        var model = this;
        model.loading = true;
        model.loadingNavBar = true;
        model.courseH2kFeedbackupdate = courseH2kFeedbackupdate;
        model.publishCourse = publishCourse;
        model.paginate = paginate;
        $rootScope.pageTitle = $filter("translate")("Manage Tmooh Feedback")  + " | " + $rootScope.settings['site.name'];
        model.courseH2kFeedbacks = [];
        model.saveFeedbackComment = saveFeedbackComment;
        if ($rootScope.auth.providertype === 'admin') {
            model.new_feedback = {};
            GetCourseFeedbackQuestions.get({ limit: 'all' }).$promise
                .then(function (response) {
                    model.Course_feedback_questions = response.data;
                }, function (error) { });
        }
        $scope.createCourseFeedback = function ($valid, Form) {
            if ($valid) {
                model.new_feedback.course_id = $state.params.id;
                H2kFeedbackList.create(model.new_feedback, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Feedback has been raised successfully.");
                        flash.set(flashMessage, 'success', false);
                        model.new_feedback = {};
                        H2kCourseFeedback(null);
                    } else {
                        flashMessage = $filter("translate")("Unable to raise feedback. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Unable to raise feedback. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                });
            }

        };

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    if (data !== null && data !== undefined) {
                        model.manageCourseOption = data;
                        model.loadingNavBar = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }

        /**GETTING THE OVERALL MESSAGE LISTING FUNCTION  */
        function getUserMessage() {
            var params = {};
            params.limit = 'all';
            params.class = 'CourseFeedback';
            CourseAnnoucementMessage.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        model.userMessages = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet');
                    }
                    H2kCourseFeedback();
                    model.loader = false;
                }, function (error) {
                    H2kCourseFeedback();
                });
        }

        function H2kCourseFeedback(element) {
            model.loading = true;
            model.courseH2kFeedbacks = [];
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                var params = {};
                params.course_id = $state.params.id;
                params.limit = 'all';
                params.sort = 'id';
                params.sortby = 'DESC';
                H2kFeedbackList.get(params).$promise
                    .then(function (response) {
                        response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm:a');
                        model.CompletedFeedbacks = [];
                        model.IncompletedFeedbacks = [];
                        angular.forEach(response.data, function (course_feeedback) {
                            course_feeedback.comments = [];
                            angular.forEach(model.userMessages, function (feedback_comment) {
                                course_feeedback.isCollapsed = true;
                                if (feedback_comment.course_feedback !== null && feedback_comment.course_feedback.length > 0) {
                                    if (parseInt(feedback_comment.course_feedback[0].id) === parseInt(course_feeedback.id)) {
                                        course_feeedback.comments.push(feedback_comment);
                                    }
                                }
                            });
                            if (course_feeedback.admin_approved === true) {
                                model.CompletedFeedbacks.push(course_feeedback);
                            } else {
                                model.IncompletedFeedbacks.push(course_feeedback);
                            }
                        });
                        if (model.IncompletedFeedbacks.length > 0) {
                            if ($rootScope.auth.providertype === 'admin') {
                                angular.forEach(model.IncompletedFeedbacks, function (incompleted_feedback) {
                                    incompleted_feedback.isCollapsed = false;
                                });
                            } else {
                                model.IncompletedFeedbacks[0].isCollapsed = false;
                            }
                        }
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }



        /**SENDING THE MESSAGE TO THE MULTIPLE USERS */
        function saveFeedbackComment(e, index) {
            if (e.keyCode == 27) {
                var target = e.target;
                target.blur();
                model.IncompletedFeedbacks[index].showInfo = false;
            }
            if (e.keyCode == 13 && !e.shiftKey) {
                model.feedback_comment = {};
                model.feedback_comment.user_id = [];
                model.feedback_comment.class = 'CourseFeedback';
                model.feedback_comment.foreign_id = model.IncompletedFeedbacks[index].id;
                model.feedback_comment.message = model.IncompletedFeedbacks[index].message;
                model.feedback_comment.user_id = [];
                if ($rootScope.auth.providertype === 'admin') {
                    model.feedback_comment.user_id.push({
                        'user_id': model.manageCourseOption.user_id
                    });
                } else {
                    model.feedback_comment.user_id.push({
                        'user_id': $rootScope.auth.id
                    });
                }
                $scope.message_disableButton = true;
                CourseAnnoucementMessage.create(model.feedback_comment, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Message has been sent successfully.");
                        flash.set(flashMessage, 'success', false);
                        getUserMessage();
                        model.feedback_comment = {};
                    } else {
                        flash.set("Unable to send messages. Please try again later.", 'error', false);
                    }
                    $scope.message_disableButton = false;
                }, function (error) {
                    if (error.status === 404) {
                        flashMessage = $filter("translate")("Unable to send messages. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                    $scope.message_disableButton = false;
                });
            }

        }

        function publishCourse(type) {
            model.coursePublish = {};
            model.coursePublish.id = $state.params.id;
            if (type === 'publish') {
                model.coursePublish.course_status_id = 3;
                flashMessage = $filter("translate")("Course published successfully.");
            } else if (type === 'waiting') {
                flashMessage = $filter("translate")("Course submitted for review successfully");
                model.coursePublish.course_status_id = 2;
            } else if (type === 'draft') {
                flashMessage = $filter("translate")("Course successfully moved to draft.");
                model.coursePublish.course_status_id = 1;
            }
            CourseUpdate.update(model.coursePublish, function (response) {
                $rootScope.$emit('updateCourseParent', {});
                flash.set(flashMessage, 'success', false);
            });
        }

        function paginate(element) {
            model.currentPage = parseInt(model.currentPage);
            H2kCourseFeedback(element);
        }
        $scope.adminFeedbackapprove = function (feedback) {
            var params = {};
            params.admin_approved = feedback.admin_approved;
            CourseH2kFeedback.update({
                courseFeedbackId: feedback.id,
            }, params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        H2kCourseFeedback(null);
                        $rootScope.$emit('updateCourseParent', {});
                        flash.set("Feedback has been approved.", 'success', false);
                    } else {
                        flash.set("Unable to approve feedback. Please try again later.", 'error', false);
                    }
                }, function (error) {
                    flash.set("Oops, an error has occurred while approving feedback. Please try again later.", 'error', false);

                });
        };

        function courseH2kFeedbackupdate(index, type) {
            AlertBox.confirm('Are you sure you want to update as ' + type + ' as fixed?', function (isConfirmed) {
                if (isConfirmed) {
                    var params = {};
                    params.is_fixed = (type === 'unmark') ? 'false' : 'true';
                    CourseH2kFeedback.update({
                        courseFeedbackId: model.IncompletedFeedbacks[index].id,
                    }, params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                H2kCourseFeedback(null);
                                $rootScope.$emit('updateCourseParent', {});
                                flash.set("Feedback as been successfully updated.", 'success', false);
                            } else {
                                flash.set("Unable to update feedback. Please try again later.", 'error', false);
                            }
                        }, function (error) {
                            flash.set("Oops, an error has occurred while updating feedback. Please try again later.", 'error', false);

                        });
                }
            });
        }
        getCourseDetails();
        getUserMessage();
    });
    module.controller('ManageCourseGoalsController', function ($state, $scope, $rootScope, ViewCourse, CourseUpdate, InstructionLevels, $location, flash, $filter, TokenServiceData) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Goals")  + " | " + $rootScope.settings['site.name'];
        model.courseGoals = {};
        model.courseGoals.what_actions_students_have_to_perform_before_begin = '';
        model.courseGoals.who_should_take_this_course_and_who_should_not = '';
        model.courseGoals.students_will_be_able_to = '';
        model.InstructionLevels = {};

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                model.loading = true;
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    if (data !== null && data !== undefined) {
                        model.courseGoals.students_will_be_able_to = (data.students_will_be_able_to) ? data.students_will_be_able_to : '';
                        model.courseGoals.who_should_take_this_course_and_who_should_not = (data.who_should_take_this_course_and_who_should_not) ? data.who_should_take_this_course_and_who_should_not : '';
                        model.courseGoals.what_actions_students_have_to_perform_before_begin = (data.what_actions_students_have_to_perform_before_begin) ? data.what_actions_students_have_to_perform_before_begin : '';
                        model.courseGoals.instructional_level_id = data.instructional_level_id;
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }
        InstructionLevels.get({
            sort_by: 'ASC'
        }).$promise
            .then(function (response) {
                model.InstructionLevels = response.data;
            });

        model.goalsSave = goalsSave;

        function goalsSave($valid, to_next) {
            CoursesID = $state.params.id;
            var flashMessage = '';
            model.courseGoals.id = CoursesID;
            CourseUpdate.update(model.courseGoals, function (response) {
                flashMessage = $filter("translate")("Course goals has been updated successfully.");
                flash.set(flashMessage, 'success', false);
                $rootScope.$emit('updateCourseParent', {});
                if (to_next === 'next') {
                    $location.path('/manage-course/edit-image/' + CoursesID);
                }
            }, function (error) {
                flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating. Please try again later.");
                flash.set(flashMessage, 'error', false);
            });
        }
        getCourseDetails();
    });
    module.controller('ManageCourseCurriculumController', function ($state, $scope, OnlineCourseLessons, ViewCourse, addOnlineCourseLessons, UpdateDispalyOrder, OnlineCourseLessonsDelete, $rootScope, AlertBox, AssignmentDeleteFactory, OnlineCourseLessonsUpdate, TokenServiceData, flash, $filter, $cookies, anchorSmoothScroll, CreateOnlineCourseLesson, SweetAlert, GENERAL_CONFIG, $http, ConstToolTipContent) {
        var model = this;
        model.loading = true;
        $scope.ConstToolTipContent = ConstToolTipContent;
        $rootScope.pageTitle = $filter("translate")("Manage Course Curriculum")  + " | " + $rootScope.settings['site.name'];
        model.OnlineCourse = [];
        model.deleteLesson = [];
        model.editOnlineChapter = {};
        model.AddOnlineChapter = new addOnlineCourseLessons();
        model.onlineVideoLesson = new addOnlineCourseLessons();
        getOnlineCourses();
        model.addChapterClick = addChapterClick;
        model.addChapterCancel = addChapterCancel;
        // model.editChapterCancel = editChapterCancel;
        model.addChapter = addChapter;
        model.addLesson = addLesson;
        model.updateChapter = updateChapter;
        model.deleteLessonFun = deleteLessonFun;
        model.cancelAddLesson = cancelAddLesson;
        model.getOnlineCourses = getOnlineCourses;
        model.UnpublishedLesson = UnpublishedLesson;
        model.UpdateSolutionDetail = UpdateSolutionDetail;
        model.displayOrder = {};
        model.addsection = false;
        $scope.openLesson = false;
        $scope.openItem = '';
        $scope.courseID = $state.params.id;
        $scope.formStatus = 'close';
        $scope.tab_active = 'upload_video';
        model.amazonS3Upload = amazonS3Upload;
        model.tabActivate = function (form_tab) {
            $scope.tab_active = form_tab;

        };
        var lessons_show_details = ['showDetails', 'addlessonsContent', 'showSolutionContent', 'showDetailsLesson', 'multiple_selection', 'multiple_choice', 'showLessonsTitle'];
        // var lesson_details = [];
        $scope.aws_url_data = null;
        $scope.downloadable_data = null;

        function amazonS3Upload(response) {
            if (!response.error) {
                $scope.aws_url_data = response.aws_url;
            }
        }

        $scope.sortOptions = {
            placeholder: 'sortableplaceholder',
            tolerance: 'pointer',
            cursor: 'move',
            dropOnEmpty: true,
            connectWith: '.connector',
            stop: function (e, ui) {
                var logEntry = [];
                angular.forEach($scope.online_chapters, function (chapter) {
                    angular.forEach(chapter.lessons, function (lesson) {
                        logEntry.push(lesson.id);
                    });
                });
                updateDisplayOrder(logEntry.join(', '));
            }
        };

        function updateDisplayOrder(logEntry) {
            model.displayOrder.online_course_lessons = logEntry;
            model.displayOrder.id = $scope.courseID;
            UpdateDispalyOrder.update(model.displayOrder, function () {
                getOnlineCourses();
            });
        }

        function updateChapter(lessons, chapterindex) {
            var previous_lesson_details = lessons;
            var lesson_index = $scope.online_chapters[chapterindex].lessons.indexOf(lessons);
            $scope.disableUpdateButton = true;
            var params = {
                'id': lessons.id,
                'name': lessons.tmp_lesson_name,
                'description': lessons.tmp_lesson_description,
            };
            if (lessons.id !== 'Unpublish' && lessons.id !== 'Unpublishchapter') {
                OnlineCourseLessonsUpdate.update(params, function (response) {
                    if (response.error.code === 0) {
                        succsMsg = $filter("translate")("Chapter updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        if (response.data) {
                            var params = {};
                            params.id = response.data;
                            OnlineCourseLessonsUpdate.get(params, function (response) {
                                if (response.data.length > 0) {
                                    //SettingLessonsDetails(previous_lesson_details, response.data[0], chapterindex, lesson_index);
                                    getOnlineCourses();
                                }

                            });

                        }
                        UpdateCourseStatus();
                    } else {
                        succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating chapter. Please try again later.");
                        flash.set(succsMsg, 'error', false);
                    }

                }, function (error) {
                    succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating chapter. Please try again later.");
                    flash.set(succsMsg, 'error', false);
                });
            } else {
                model.AddOnlineChapter.name = lessons.tmp_lesson_name;
                model.AddOnlineChapter.description = lessons.tmp_lesson_description;
                addChapter(null);
            }
            $scope.disableUpdateButton = false;
        }

        function addChapterClick(e) {
            e.preventDefault();
            model.addsection = true;
        }

        function addChapterCancel(e) {
            e.preventDefault();
            model.addsection = false;
        }
        function addChapter(e) {
            if (e !== null) {
                e.preventDefault();
            }
            delete model.AddOnlineChapter.data;
            delete model.AddOnlineChapter.error;
            $scope.disableButton = true;
            model.AddOnlineChapter.course_id = parseInt($scope.courseID);
            model.AddOnlineChapter.is_chapter = 1;
            model.AddOnlineChapter.is_preview = 1;
            model.AddOnlineChapter.online_lesson_type_id = 1; //Article
            model.AddOnlineChapter.$save()
                .then(function (response) {
                    model.addsection = false;
                    flashMessage = $filter("translate")("Chapter has been added successfully.");
                    flash.set(flashMessage, 'success', false);
                    $scope.disableButton = false;
                    getOnlineCourses();
                    UpdateCourseStatus();
                })
                .catch(function (error) {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while adding chapter. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                })
                .finally();

        }

        function addLesson(e, currenItem) {
            e.preventDefault();
            $scope.currenItem = currenItem;
            $scope.currentView = "add";
        }

        function cancelAddLesson(e) {
            e.preventDefault();
            $scope.currentView = "";
        }

        function getLessonUpdate(currenItem, OnlineCourse, lessonType) {
            if (currenItem !== 'Unpublish' && currenItem !== 'Unpublishchapter') {
                OnlineCourseLessonsUpdate.get({
                    id: currenItem
                }).$promise
                    .then(function (response) {
                        model.editOnlineChapter = {};
                        model.editOnlineChapter.lesson_name = response.data[0].lesson_name;
                        model.editOnlineChapter.lesson_description = response.data[0].lesson_description;
                    });
            } else {
                if (lessonType === 'chapter') {
                    var unpublishIndex = $scope.online_chapters.indexOf(OnlineCourse);
                    model.editOnlineChapter = {};
                    model.editOnlineChapter.lesson_name = $scope.online_chapters[unpublishIndex].lesson_name;
                    model.editOnlineChapter.lesson_description = $scope.online_chapters[unpublishIndex].lesson_description;
                }
            }
        }

        function deleteLessonFun(e, OnlineCourse, type, key) {
            e.preventDefault();
            SweetAlert.swal({
                title: "Are you sure want to delete ?",
                showCancelButton: true,
                confirmButtonColor: "#79d047",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                animation: false,
            }, function (isConfirm) {
                if (isConfirm) {
                    if (OnlineCourse.id !== 'Unpublish' && OnlineCourse.id !== 'Unpublishchapter') {
                        model.deleteLesson.id = parseInt(OnlineCourse.id);
                        OnlineCourseLessonsDelete.DeleteOnlineLesson(model.deleteLesson, function (response) {
                            if (response.error.code === 0) {
                                succsMsg = $filter("translate")("Deleted successfully.");
                                flash.set(succsMsg, 'success', false);
                            }
                            getOnlineCourses();
                            UpdateCourseStatus();
                        });
                    } else {
                        var unpublishIndex;
                        if (type === 'Chapter') {
                            unpublishIndex = $scope.online_chapters.indexOf(OnlineCourse);
                            $scope.online_chapters.splice(unpublishIndex, 1);
                        } else if (type === 'Lesson') {
                            unpublishIndex = $scope.online_chapters[key].lessons.indexOf(OnlineCourse);
                            $scope.online_chapters[key].lessons.splice(unpublishIndex, 1);
                        }
                        getOnlineCourses();

                    }
                }
            });

        }

        function getOnlineCourses() {
            $rootScope.$emit('updateCourseParent', {});
            $scope.currentquizView = '';
            model.count = { 'lesson_count': 0, 'assignment_count': 0, 'Quiz_count': 0, 'CodingExercise_count': 0, 'praticeTest_count': 0 };
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                var courseArr = {
                    id: $state.params.id,
                    sort: 'display_order',
                    filter: 'all',
                    sort_by: 'ASC',
                    limit: 'all',
                };
                OnlineCourseLessons.get(courseArr).$promise
                    .then(function (response) {
                        if (response.data.length > 0) {
                            model.OnlineCourse = response;
                            $scope.online_chapters = [];
                            var online_chapter_key, chapters = [];
                            angular.forEach(model.OnlineCourse.data, function (online_lessons_value, online_lessons_key) {
                                if (parseInt(online_lessons_value.is_chapter) === 1) {
                                    chapters.push(online_lessons_value);
                                }
                            });
                            angular.forEach(model.OnlineCourse.data, function (online_lessons_value, online_lessons_key) {
                                if (online_lessons_value.attachments !== null) {
                                    angular.forEach(online_lessons_value.attachments, function (assignment_data) {
                                        if (assignment_data.class === 'AssignmentAnswerDownloadableFile') {
                                            model.OnlineCourse.data[online_lessons_key].AssignmentAnswerDownloadableFile = assignment_data;
                                        }
                                        if (assignment_data.class === 'AssignmentInstructionDownloadableFile') {
                                            model.OnlineCourse.data[online_lessons_key].AssignmentInstructionDownloadableFile = assignment_data;
                                        }
                                        if (assignment_data.class === 'AssignmentInstructionVideo') {
                                            model.OnlineCourse.data[online_lessons_key].AssignmentInstructionVideo = assignment_data;
                                        }
                                        if (assignment_data.class === 'AssignmentAnswerVideo') {
                                            model.OnlineCourse.data[online_lessons_key].AssignmentAnswerVideo = assignment_data;
                                        }
                                    });
                                }
                                if (parseInt(online_lessons_value.is_chapter) === 1) {
                                    online_chapter_key = online_lessons_value.id;
                                    if (online_lessons_value.lessons === undefined) {
                                        online_lessons_value.lessons = [];
                                        online_lessons_value.lessons.push(online_lessons_value);
                                    }
                                    var ChaptersFound = $scope.online_chapters.filter(function (chapter) {
                                        return (chapter.id == online_lessons_value.id);
                                    });
                                    if (ChaptersFound.length === 0) {
                                        $scope.online_chapters.push(online_lessons_value);
                                    }
                                }
                                if (parseInt(online_lessons_value.is_chapter) === 0) {
                                    if (online_chapter_key === undefined) {
                                        if (chapters.length === 0) {
                                            $scope.online_chapters = [{
                                                "id": 'Unpublishchapter',
                                                "lesson_name": "Introduction",
                                                "is_chapter": 1,
                                                "course_id": parseInt($scope.courseID),
                                                "lessons": []
                                            }];
                                            online_chapter_key = 'Unpublishchapter';
                                        } else {
                                            online_chapter_key = chapters[0].id;
                                            chapters[0].lessons = [];
                                            $scope.online_chapters.push(chapters[0]);

                                        }
                                    }
                                    angular.forEach($scope.online_chapters, function (chapter) {
                                        if (chapter.id === online_chapter_key) {
                                            /*if (online_lessons_value.online_lesson_type_id !== null) {
                                                online_lessons_value.is_publish = true;
                                            } else if (online_lessons_value.is_coding_exercises === true || ((online_lessons_value.is_quiz === true || online_lessons_value.is_assignment === true || online_lessons_value.is_practice_test === true || online_lessons_value.is_assignment === true) && online_lessons_value.quiz_question_count > 0)) {
                                                online_lessons_value.is_publish = true;
                                                online_lessons_value.is_lesson_ready = 1;
                                            } else {
                                                online_lessons_value.is_publish = false;
                                            }*/
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
                                            } else if (online_lessons_value.is_assignment === true) {
                                                model.count.assignment_count += 1;
                                                online_lessons_value.serial_number = model.count.assignment_count;
                                            } else {
                                                model.count.lesson_count += 1;
                                                online_lessons_value.serial_number = model.count.lesson_count;
                                            }
                                            if (chapter.lessons.length === 0) {
                                                chapter.lessons.push(chapter);
                                            }
                                            chapter.lessons.push(online_lessons_value);
                                        }
                                    });
                                }
                            });
                        } else {
                            $scope.online_chapters = [{
                                "id": 'Unpublishchapter',
                                "lesson_name": "Introduction",
                                "is_chapter": 1,
                                "course_id": parseInt($scope.courseID),
                                "lessons": [{
                                    "id": 'Unpublishchapter',
                                    "lesson_name": "Introduction",
                                    "is_chapter": 1,
                                    "course_id": parseInt($scope.courseID),
                                }, {
                                        "id": 'Unpublish',
                                        "lesson_name": "Introduction",
                                        "is_chapter": 0,
                                        "online_lesson_type_id": null,
                                        'is_lesson_ready': 0,
                                        "course_id": parseInt($scope.courseID),
                                    }]
                            }];
                        }
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }

        $scope.ShowLessonDetails = function (lesson, type, chapterindex, lessonType) {
            var lesson_index = $scope.online_chapters[chapterindex].lessons.indexOf(lesson);
            $scope.online_chapters[chapterindex].lessons[lesson_index].tmp_lesson_name = $scope.online_chapters[chapterindex].lessons[lesson_index].lesson_name;
            $scope.online_chapters[chapterindex].lessons[lesson_index].tmp_lesson_description = $scope.online_chapters[chapterindex].lessons[lesson_index].lesson_description;
            angular.forEach(lessons_show_details, function (lesson_details) {
                $scope.online_chapters[chapterindex].lessons[lesson_index][lesson_details] = false;
            });
            $scope.online_chapters[chapterindex].lessons[lesson_index][type] = true;
            if (type === 'showDetailsLesson') {
                if (lessonType === 'chapter') {
                    $scope.online_chapters[chapterindex].showDetailsChapter = true;
                    $scope.online_chapters[chapterindex].currenItem1 = $scope.online_chapters[chapterindex].id;
                } else {
                    $scope.online_chapters[chapterindex].lessons[lesson_index].currenItemLesson = $scope.online_chapters[chapterindex].lessons[lesson_index].id;
                }
            }
        };
        $scope.closeLessonDetails = function (lesson, chapterindex) {
            var lesson_close_index = $scope.online_chapters[chapterindex].lessons.indexOf(lesson);
            /*Chapter Closing details*/
            $scope.online_chapters[chapterindex].showDetailsChapter = false;
            $scope.online_chapters[chapterindex].currenItem1 = null;
            /*lesson Closing details*/
            angular.forEach(lessons_show_details, function (lesson_details) {
                $scope.online_chapters[chapterindex].lessons[lesson_close_index][lesson_details] = false;
            });
        };
        $scope.deleteAttachment = function (index, name, id) {
            AlertBox.confirm('Are you sure you want to delete a video?', function (isConfirmed) {
                if (isConfirmed) {
                    AssignmentDeleteFactory.remove({ id: id }, function (response) {
                        if (response.error.code === 0) {
                            model.OnlineCourse.data[index][name] = null;
                            flashMessage = $filter("translate")("video has been deleted successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("unable to delete the video. Please try again.");
                            flash.set(flashMessage, 'error', false);
                        }
                    });
                }
            });
        };
        $scope.addLessonDescription = function ($valid, lesson, chapter_index) {
            if ($valid) {
                var lesson_descriptions = UnpublishedLesson();
                if (lesson.id === 'Unpublish') {
                    angular.forEach(lesson_descriptions, function (unpub_lesson) {
                        if (parseInt(unpub_lesson.is_chapter) === 0) {
                            unpub_lesson.description = lesson.tmp_lesson_description;
                        }
                    });
                    addLessonDetail(lesson_descriptions);
                }
                else {
                    UpdateLessonDetail(lesson, chapter_index);
                }
            }

        };
        $scope.addLessonTitle = function () {
            var lesson_titles = UnpublishedLesson();
            lesson_titles.push({
                'course_id': parseInt($scope.courseID),
                'name': model.onlineVideoLesson.name,
                'is_chapter': 0,
                'is_lesson_ready': 0,
            });
            addLessonDetail(lesson_titles);
        };


        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            $scope.disableButton = true;
            CreateOnlineCourseLesson.create(lessondetails, function (response) {
                if (response.error.code === 0) {
                    if (lessons.length > 0) {
                        addLessonDetail(lessons);
                    } else {
                        model.onlineVideoLesson = {};
                        $scope.disableButton = false;
                        succsMsg = $filter("translate")("Lessons has been added successfully.");
                        flash.set(succsMsg, 'success', false);
                        getOnlineCourses();
                        UpdateCourseStatus();
                    }
                } else {
                    succsMsg = $filter("translate")("Oops, an unexpected error has occurred while adding lessons. Please try again later.");
                    flash.set(succsMsg, 'error', false);
                }
            }, function (error) {
                succsMsg = $filter("translate")("Oops, an unexpected error has occurred while adding lessons. Please try again later.");
                flash.set(succsMsg, 'error', false);
            });
        }

        var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload?type=file';

        $scope.downloadVideoFile = function (files) {
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
                }).success(function (response, status, headers, config) {
                    if (response.error.code === 0) {
                        $scope.downloadable_data = [{ 'filename': response.filename }];
                    } else {
                        delete ($scope.downloadable_data);
                        $("#downloadTaskAttachments").val("");
                        errorMessage = $filter("translate")("File couldn't be uploaded. File extension not allowed");
                        flash.set(errorMessage, 'error', false);
                    }
                }).error();
            }
        };
        function UpdateSolutionDetail($valid, lessons) {
            if ($valid) {
                var params = {
                    'id': lessons.id,
                    'is_lesson_ready': lessons.is_lesson_ready,
                };
                if ($scope.downloadable_data !== undefined && $scope.downloadable_data !== null) {
                    params.assignment_answer_downloadedfiles = $scope.downloadable_data;
                }
                if ($scope.aws_url_data !== undefined && $scope.aws_url_data !== null) {
                    params.aws_url = $scope.aws_url_data;
                }
                if ($rootScope.Assignment_bulk_uploader_id !== undefined && $rootScope.Assignment_bulk_uploader_id !== null) {
                    params.assignment_answer_videos = { 'id': $rootScope.Assignment_bulk_uploader_id };
                }
                OnlineCourseLessonsUpdate.update(params, function (response) {
                    if (response.error.code === 0) {
                        succsMsg = $filter("translate")("Lessons has been updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        getOnlineCourses();
                        UpdateCourseStatus();
                    } else {
                        succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating lesson. Please try again later.");
                        flash.set(succsMsg, 'error', false);
                    }
                }, function (error) {
                    succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating lesson. Please try again later.");
                    flash.set(succsMsg, 'error', false);
                });
            }
        }

        function UpdateLessonDetail(lessons, chapter_index) {
            var lesson_index = $scope.online_chapters[chapter_index].lessons.indexOf(lessons);
            $scope.Previous_lesson_details = $scope.online_chapters[chapter_index].lessons[lesson_index];
            var params = {
                'id': lessons.id,
                'description': lessons.tmp_lesson_description,
                'name': lessons.tmp_lesson_name,
                'is_lesson_ready': lessons.is_lesson_ready,
                'is_preview': (lessons.is_preview === true || lessons.is_preview == '1') ? 1 : 0
            };
            if (lessons.is_practice_test === true) {
                params.is_randomize_question_answer_order = lessons.is_randomize_question_answer_order;
                params.pass_mark_percentage = lessons.pass_mark_percentage;
                params.allowed_duration = lessons.allowed_duration;
            }
            if (lessons.is_assignment === true) {
                params.assignment_instructions = lessons.assignment_instructions;
                params.allowed_duration = lessons.allowed_duration;
                if ($scope.downloadable_data !== undefined && $scope.downloadable_data !== null) {
                    params.assignment_instruction_downloadedfiles = $scope.downloadable_data;
                }
                if ($scope.aws_url_data !== undefined && $scope.aws_url_data !== null) {
                    params.aws_url = $scope.aws_url_data;
                }
                if ($rootScope.Assignment_bulk_uploader_id !== undefined && $rootScope.Assignment_bulk_uploader_id !== null) {
                    params.assignment_instruction_videos = { 'id': $rootScope.Assignment_bulk_uploader_id };
                }
            }
            if (lessons.is_coding_exercises === true) {
                params.title = lessons.tmp_lesson_name;
                delete params.name;
            }
            OnlineCourseLessonsUpdate.update(params, function (response) {
                if (response.error.code === 0) {
                    if (response.data) {
                        var params = {};
                        params.id = response.data;
                        OnlineCourseLessonsUpdate.get(params, function (response) {
                            if (response.data.length > 0) {
                                SettingLessonsDetails($scope.Previous_lesson_details, response.data[0], chapter_index, lesson_index);
                            }

                        });
                    }
                    succsMsg = $filter("translate")("Lessons has been updated successfully.");
                    flash.set(succsMsg, 'success', false);
                    UpdateCourseStatus();
                } else {
                    succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating lesson. Please try again later.");
                    flash.set(succsMsg, 'error', false);
                }
            }, function (error) {
                succsMsg = $filter("translate")("Oops, an unexpected error has occurred while updating lesson. Please try again later.");
                flash.set(succsMsg, 'error', false);
            });
        }


        function SettingLessonsDetails(old_lesson_details, new_lesson_details, Chapter_index, Lesson_index) {
            $scope.online_chapters[Chapter_index].showDetailsChapter = false;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index] = new_lesson_details;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index].serial_number = old_lesson_details.serial_number;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index].showDetails = (old_lesson_details.showDetails !== undefined && old_lesson_details.showDetails !== null) ? old_lesson_details.showDetails : false;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_preview = $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_preview === 0 ? false : true;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index].tmp_lesson_name = $scope.online_chapters[Chapter_index].lessons[Lesson_index].lesson_name;
            $scope.online_chapters[Chapter_index].lessons[Lesson_index].tmp_lesson_description = $scope.online_chapters[Chapter_index].lessons[Lesson_index].lesson_description;
            /*if ($scope.online_chapters[Chapter_index].lessons[Lesson_index].online_lesson_type_id !== null) {
                $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_publish = true;
            } else if (($scope.online_chapters[Chapter_index].lessons[Lesson_index].is_coding_exercises === true || $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_quiz === true || $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_assignment === true) && $scope.online_chapters[Chapter_index].lessons[Lesson_index].quiz_question_count > 0) {
                $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_publish = true;
            } else {
                $scope.online_chapters[Chapter_index].lessons[Lesson_index].is_publish = false;
            }*/
        }
        //Unpublished Chapter and Lesson updation
        function UnpublishedLesson() {
            var unpublished_lessons = [];
            angular.forEach($scope.online_chapters, function (chapter) {
                angular.forEach(chapter.lessons, function (lesson) {
                    if (lesson.id === 'Unpublish' || lesson.id === 'Unpublishchapter') {
                        unpublished_lessons.push({
                            'course_id': lesson.course_id,
                            'name': lesson.lesson_name,
                            'is_chapter': lesson.is_chapter,
                            'is_lesson_ready': lesson.is_lesson_ready,
                        });
                    }
                });
            });
            return unpublished_lessons;
        }
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
    });
    module.controller('ManageCourseBasicsController', function ($state, Course, $scope, $rootScope, ViewCourse, Common, CourseUpdate, $location, GetLanguages, flash, $filter, TokenServiceData, UserAll, CourseType) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Basics")  + " | " + $rootScope.settings['site.name'];
        var flashMessage = '';
        model.listcourse = new Course();
        model.courseBasic = {};
        model.listcourse = [];
        model.languages = [];
        model.subCategories = [];
        model.instructors = [];
        model.coursetype = {};
        /**
         * @ngdoc function
         * @name $getSubCategories
         * @function
         *
         * @description
         *
         * creates sub category dropdown on parent category dropdown change
         */

        GetLanguages.get({
            sort_by: 'ASC',
            sort: 'name',
        }).$promise.then(function (response) {
            model.languages = response.data;
        });

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        model.courseBasic.title = data.title;
                        model.courseBasic.subtitle = data.subtitle;
                        model.courseBasic.language_id = data.language_id;
                        model.courseBasic.parent_category_id = data.parent_category_id;
                        model.courseBasic.category_id = data.category_id;
                        model.courseBasic.description = data.description;
                        model.courseBasic.projects = data.projects;
                        model.courseBasic.certificate = data.certificate;
                        model.courseBasic.faq = data.faq;
                        model.courseBasic.meta_keywords = data.meta_keywords;
                        model.courseBasic.meta_description = data.meta_description;
                        model.courseBasic.id = data.id;
                        model.courseBasic.slug = data.slug;
                        model.courseBasic.user_id = data.user_id;
                        model.coursetype = data.coursetype;
                        Common.get({
                            category_type: "parent",
                            filter: "active",
                            sort_by: 'ASC',
                            sort: 'sub_category_name',
                            limit: "all",
                            field: "id,category_id,sub_category_name,sub_category"
                        }).$promise.then(function (response) {
                            response.data = $filter('validData')(response.data, 'sub_category_name');
                            model.listcourse.category = response.data;
                            getSubCategories();
                        });
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }
        model.getSubCategories = getSubCategories;

        function getSubCategories() {
            for (var i = 0; i < model.listcourse.category.length; i++) {
                if (model.listcourse.category[i].id == model.courseBasic.parent_category_id) {
                    model.subCategories = model.listcourse.category[i].sub_category;
                    return i;
                }
            }
            return null;
        }
        model.saveCourseBasic = saveCourseBasic;

        function saveCourseBasic(manage_course_basics, to_next) {
            /*Atleast One Course Type Need To Check */
            var courseChecked = false;
            angular.forEach(model.coursetype, function (course_type) { if (course_type === true) { courseChecked = true; } });
            if (!courseChecked) { model.Showerror = true; }

            /*Saving Basic Inform About the Course*/
            if (courseChecked === true && !manage_course_basics.$invalid) {
                CoursesID = $state.params.id;
                model.courseBasic.id = CoursesID;
                var checked = [];
                for (var key in model.coursetype) {
                    if (model.coursetype[key]) {
                        var value = CourseType[key];
                        checked.push(value);
                    }
                }
                model.courseBasic.course_options = checked.join();
                CourseUpdate.update(model.courseBasic, function (response) {
                    flashMessage = $filter("translate")("Course basic detail has been updated successfully.");
                    flash.set(flashMessage, 'success', false);
                    $rootScope.$emit('updateCourseParent', {});
                    if (model.NextButtonVal === 'next') {
                        $location.path('/manage-course/edit-goals-and-audience/' + CoursesID);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while updating basic details. Please try again later.");
                    flash.set(flashMessage, 'success', false);
                });

            }

        }
        if (angular.isDefined($rootScope.auth)) {
            if ($rootScope.auth.providertype === 'admin') {
                getAllUser();
            }
        }

        function getAllUser() {
            var params = {};
            params.sort_by = 'ASC';
            params.is_teacher = 1;
            params.limit = 'all';
            params.field = "displayname,user_id";
            UserAll.getUserAll(params).$promise.then(function (response) {
                model.instructors = response.data;
            });
        }
        getCourseDetails();
    });
    module.controller('ManageCourseSummaryController', function ($state, ViewCourse, CourseUpdate, flash, $filter, $scope, $rootScope, TokenServiceData) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Basics")  + " | " + $rootScope.settings['site.name'];
        var flashMessage = '';
        model.courseSummary = {};
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            ViewCourse.get({
                id: $state.params.id,
                // field: 'id,description'
            }).$promise
                .then(function (response) {
                    model.courseSummary.description = response.data[0].description;
                    model.courseSummary.projects = response.data[0].projects;
                    model.courseSummary.certificate = response.data[0].certificate;
                    model.courseSummary.faq = response.data[0].faq;
                    model.loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        model.saveCourseSummary = saveCourseSummary;

        function saveCourseSummary(manage_course_summary) {
            $scope.error = false;
            if (manage_course_summary.summary.$invalid) {
                $scope.info = $filter("translate")("Course could not be updated. Please enter summary.");
                $scope.error = true;
                return;
            }
            model.courseSummary.id = $state.params.id;
            CourseUpdate.update(model.courseSummary, function (response) {
                //$state.reload();
                flashMessage = $filter("translate")("Course summary has been updated successfully.");
                flash.set(flashMessage, 'success', false);
            });
        }
    });
    module.controller('ManageCourseImageController', function ($state, Course, $scope, $rootScope, ViewCourse, CourseUpdate, $http, $timeout, $sce, flash, $filter, GENERAL_CONFIG, TokenServiceData, $location, Upload) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Image")  + " | " + $rootScope.settings['site.name'];
        model.course = new Course();
        model.courseImage = {};
        model.saveCourseImage = saveCourseImage;
        $scope.disableSave = false;
        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        init();
                        model.courseDetails = data;
                        model.courseImage.id = data.id;
                        model.courseImage.image_hash = data.image_hash;
                        model.courseImage.course_image = data.course_image;
                        model.courseImage.is_from_mooc_affiliate = data.is_from_mooc_affiliate;
                        model.courseImage.mooc_affiliate_course_link = data.mooc_affiliate_course_link;
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }
        function init() {
            $scope.progressPercentage = 0;
            $scope.obj = { 'thumbnail': false, 'selection': [0, 23, 512, 262, 512, 239], 'src': '' };
            $scope.preview_picture_filename = '';
        }
        var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload';
        $scope.upload = function (file) {
            $scope.progressPercentage = 0;
            var flashMessage;
            $scope.file = file;
            if (file !== null && file !== undefined) {
                $scope.disableSave = true;
                Upload.upload({
                    url: 'api/v1/image_upload',
                    data: {
                        file: file,
                        course_id: $state.params.id
                    }
                })
                    .then(function (response) {
                        if (response.data.error.code === 0) {
                            model.courseImage.course_image = (response.data.filename);
                            $scope.preview_picture_filename = response.data.filename;
                            $scope.obj.src = $rootScope.site_url + 'img/original/CoursePreview/' + model.courseImage.id + '.' + $scope.preview_picture_filename + '?rand=' + Math.random();
                            $scope.progressValue = 100;
                        } else {
                            delete (model.courseImage.course_image);
                            var errorMessage;
                            if (response.data.error.code === 1) {
                                errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: mov, mpeg4, avi, wmv, mpeg, flv, 3gpp, webm, mp4.");
                            } else if (response.data.error.code === 2) {
                                errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: gif, jpeg, jpg, png.");
                            } else {
                                errorMessage = response.data.error.message;
                            }
                            flash.set(errorMessage, 'error', false);
                        }
                        $scope.disableSave = false;
                    }, function (resp) {
                        if (resp.status === 413) {
                            flashMessage = $filter("translate")("Unable to upload a image, Image size is too large. Please try with another image");
                            flash.set(flashMessage, 'error', false);
                        } else {
                            flashMessage = $filter("translate")("Oops, an error has occurred while trying to upload, please try again later.");
                            flash.set(flashMessage, 'error', false);
                        }
                        init();
                        $scope.disableSave = false;
                    }, function (evt) {
                        $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    }, function (error) {
                        $scope.disableSave = false;
                    });
            } else {
                $scope.preview_picture_filename = '';
                $scope.obj.src = '';
                $scope.disableSave = false;
            }
        };
        function saveCourseImage($valid) {
            if ($valid) {
                model.courseImage.id = $state.params.id;
                model.courseImage.x = $scope.obj.selection[0];
                model.courseImage.y = $scope.obj.selection[1];
                model.courseImage.width = $scope.obj.selection[4];
                model.courseImage.height = $scope.obj.selection[5];
                CourseUpdate.update(model.courseImage, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Course image has been updated successfully.");
                        flash.set(flashMessage, 'success', false);
                        if (model.NextButtonVal === 'next') {
                            if (model.courseDetails.coursetype.video === true) {
                                $state.go('manageCoursePromoVideo', { id: $state.params.id });
                            } else if (model.courseDetails.coursetype.online === true || model.courseDetails.coursetype.onsite === true) {
                                $state.go('manageDemoSessionCourse', { id: $state.params.id });
                            } else {
                                $state.go('manageCourseAutomatedMessage', { id: $state.params.id });

                            }
                        }
                        $rootScope.$emit('updateCourseParent', {});
                    } else {
                        flashMessage = $filter("translate")("Oops, an unexpected error has occurred while uploading course image. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while uploading course image. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                    $rootScope.$emit('updateCourseParent', {});
                });
            }
        }
        getCourseDetails();
    });
    module.controller('ManageCoursePromoVideoController', function ($state, CourseUpdate, $scope, $http, flash, $filter, GENERAL_CONFIG, ViewCourse, $rootScope, TokenServiceData, GetMicrophones, GetLightings, GetEditingSoftwares, GetCameras, $location) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Promo Video")  + " | " + $rootScope.settings['site.name'];
        model.courseVideo = {};
        model.amazonS3Upload = amazonS3Upload;

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        model.courseVideo.id = data.id;
                        model.courseVideo.embed_code = data.embed_code;
                        model.courseVideo.aws_job_id = data.aws_job_id;
                        model.courseVideo.promo_video = data.promo_video;
                        model.courseVideo.is_promo_video_converting_is_processing = data.is_promo_video_converting_is_processing;
                        model.courseVideo.is_promo_video_convert_error = data.is_promo_video_convert_error;
                        model.courseVideo.video_url = data.video_url;
                        // model.courseVideo.microphone_id = data.microphone_id;
                        // model.courseVideo.lighting_id = data.lighting_id;
                        // model.courseVideo.editing_software_id = data.editing_software_id;
                        // model.courseVideo.camera_id = data.camera_id;
                        // model.courseVideo.is_closed_captions_available = data.is_closed_captions_available;
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }

        function VideoExtraDetails() {
            //Get Microphones
            GetMicrophones.get({
                sort_by: 'ASC',
                sort: 'name',
            }).$promise
                .then(function (response) {
                    model.microphones = response.data;
                }, function (error) { });
            //Get Lighting
            GetLightings.get({
                sort_by: 'ASC',
                sort: 'name',
            }).$promise
                .then(function (response) {
                    model.lightings = response.data;
                }, function (error) { });
            //Get Editing software
            GetEditingSoftwares.get({
                sort_by: 'ASC',
                sort: 'name',
            }).$promise
                .then(function (response) {
                    model.editingsoftwares = response.data;
                }, function (error) { });
            //Get Cameras
            GetCameras.get({
                sort_by: 'ASC',
                sort: 'name',
            }).$promise
                .then(function (response) {
                    model.cameras = response.data;
                }, function (error) { });
        }

        model.videoSave = videoSave;
        var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload';
        $scope.disableSave = false;
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
                        model.courseVideo.promo_video = (response.filename);
                    } else {
                        $("#inputTaskAttachments").val("");
                        delete (model.courseVideo.promo_video);
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
                }).error();
            }

        };

        function amazonS3Upload(response) {
            if (!response.error) {
                model.courseVideo.aws_url = response.aws_url;
            }
        }

        function videoSave() {
            $scope.disableSave = true;
            model.courseVideo.id = $state.params.id;
            delete model.courseVideo.is_promo_video_converting_is_processing;
            delete model.courseVideo.is_promo_video_convert_error;
            delete model.courseVideo.video_url;
            CourseUpdate.update(model.courseVideo, function (response) {
                $rootScope.$emit('updateCourseParent', {});
                flashMessage = $filter("translate")("Promo Video uploaded successfully.");
                flash.set(flashMessage, 'success', false);
                angular.element("input[type='file']").val(null);
                angular.element('#js-amazon-progress')
                    .addClass('hide');
                if (model.NextButtonVal == 'next') {
                    $location.path('/manage-course/edit-curriculum/' + $state.params.id);
                }
                $scope.disableSave = false;
            }, function (error) {
                flashMessage = $filter("translate")("Oops, an error has occurred while uploading Promo video. Please try again later.");
                flash.set(flashMessage, 'error', false);
                $scope.disableSave = false;
            });

        }
        // VideoExtraDetails();
        getCourseDetails();

    });

    module.controller('ManageCoursePriceController', function (ViewCourse, $state, CourseUpdate, flash, $filter, $rootScope, TokenServiceData, $scope, GetCurrencyList, User, $location, ConstToolTipContent, SweetAlert) {
        var model = this;
        model.courseID = $state.params.id;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Price")  + " | " + $rootScope.settings['site.name'];
        model.coursePrice = {};
        model.priceSave = priceSave;
        model.ConstToolTipContent = ConstToolTipContent;
        if ($rootScope.auth) {
            User.getUser({
                id: $rootScope.auth.id,
                field: 'id,is_paid_course_terms_and_conditions,paypal_email',
            }).$promise
                .then(function (response) {
                    if (response !== null && response !== undefined) {
                        if (response.data !== null && response.data !== undefined) {
                            if (response.data.length > 0) {
                                model.user_paid_agree = response.data[0].is_paid_course_terms_and_conditions;
                                model.paypal_email = response.data[0].paypal_email;
                            } else {
                                model.user_paid_agree = false;
                            }
                        }
                    }

                }, function (error) {
                    model.user_paid_agree = false;
                });
        }
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            ViewCourse.get({
                id: $state.params.id,
            }).$promise
                .then(function (response) {
                    model.coursePrice.price = response.data[0].price;
                    model.loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });

        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        function priceSave() {
            if (model.coursePrice.price !== 0 && model.coursePrice.price !== undefined && model.coursePrice.price !== null) {
                if (model.user_paid_agree !== 'true') {
                // if (model.user_paid_agree !== 'true' || (model.paypal_email === undefined || model.paypal_email === null || model.paypal_email === '')) {
                    SweetAlert.swal(ConstToolTipContent.PaidCourseAlert);
                    return true;
                }
            }
            model.coursePrice.id = $state.params.id;
            model.coursePrice.is_price = 1;
            CourseUpdate.update(model.coursePrice, function (response) {
                flashMessage = $filter("translate")("Price has been updated successfully.");
                flash.set(flashMessage, 'success', false);
                if (model.NextButtonVal === 'next') {
                    if (model.course.coursetype.online === true || model.course.coursetype.onsite === true) {
                        $state.go('manageDemoSessionCourse', { id: $state.params.id });
                    } else {
                        $state.go('manageCourseAutomatedMessage', { id: $state.params.id });
                    }
                } else {
                    $rootScope.$emit('updateCourseParent', {});
                }
                UpdateCourseStatus();
            }, function (error) {
                flashMessage = $filter("translate")("Oops, an error has occurred while updating course price. Please try again later.");
                flash.set(flashMessage, 'error', false);
            });

        }

        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
    });
    module.controller('ManageCourseDangerZoneController', function ($state, Pages, $filter, TokenServiceData, $rootScope, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Danger Zone")  + " | " + $rootScope.settings['site.name'];
        model.courseDangerZone = [];
        var slugName = 'danger-zone';
        var params = {};
        params.slug = slugName;
        params.iso2 = $.cookie("currentLocale");
        staticDangerZone();
        $rootScope.$on('changeLanguage', function (event, args) {
            params.iso2 = args.currentLocale;
            staticDangerZone();
        });

        function staticDangerZone() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                Pages.get(params).$promise
                    .then(function (response) {
                        model.courseDangerZone = response.data[0];
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }


    });
    module.controller('ManageCourseHelpController', function ($state, Pages, $filter, $rootScope, TokenServiceData, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Help")  + " | " + $rootScope.settings['site.name'];
        model.courseHelp = [];
        var slugName = 'instructor-manage-course-help';
        var params = {};
        params.slug = slugName;
        params.iso2 = $.cookie("currentLocale");
        staticHelp();
        $rootScope.$on('changeLanguage', function (event, args) {
            params.iso2 = args.currentLocale;
            staticDangerZone();
        });

        function staticHelp() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                Pages.get(params).$promise
                    .then(function (response) {
                        model.courseHelp = response.data[0];
                        model.loading = false;

                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }

        }
    });
    module.controller('ManageCourseEnrolledController', function ($state, CourseUsers, $filter, $rootScope, TokenServiceData, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Help")  + " | " + $rootScope.settings['site.name'];
        model._metadata = [];
        model.courseHelp = [];
        $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
        var slugName = 'students-enrolled';
        var params = {};
        params.slug = slugName;
        params.id = $state.params.id;
        params.page = model._metadata.currentPage;
        params.iso2 = $.cookie("currentLocale");
        staticEnrolled();
        $rootScope.$on('changeLanguage', function (event, args) {
            params.iso2 = args.currentLocale;
            staticDangerZone();
        });

        function staticEnrolled(element) {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                CourseUsers.get(params).$promise
                    .then(function (response) {
                        model._metadata = response._metadata;
                        model.courseEnrolleds = response.data;
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }
        $scope.index = function (element) {
            staticEnrolled(element);
        };
        $scope.index(null);
        $scope.paginate = function (element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
    });
    module.controller('ManageCourseManagementController', function (ViewCourse, $state, flash, $filter, $rootScope, TokenServiceData, $scope, ManageCoursePrivacy, CourseUpdate, $location, AlertBox) {
        var model = this;
        model.loading = true;
        model.input_type = "password";
        $rootScope.pageTitle = $filter("translate")("Manage Course Price")  + " | " + $rootScope.settings['site.name'];
        model.courseManagement = {};
        model.coursePublish = {};
        model.publishCourse = publishCourse;
        model.DeleteCourse = DeleteCourse;
        model.managecourseprivacy = [];
        angular.forEach(ManageCoursePrivacy, function (key, value) {
            model.managecourseprivacy.push({
                'id': key,
                'name': value,
            });
        });
        model.courseupdate = courseupdate;
        $scope.course_id = $state.params.id;

        function error() {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            getCourseDetails();
        } else {
            error();
        }

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        model.courseManagement.course_status_id = data.course_status_id;
                        model.courseManagement.is_leason_ready_emails = data.is_leason_ready_emails;
                        model.courseManagement.is_send_daily_qa_mail = data.is_send_daily_qa_mail;
                        model.courseManagement.ga_tracking_id = data.ga_tracking_id;
                        model.courseManagement.google_adwords_conversion_id = data.google_adwords_conversion_id;
                        model.courseManagement.landing_page_conversion_label = data.landing_page_conversion_label;
                        model.courseManagement.checkout_page_conversion_label = data.checkout_page_conversion_label;
                        model.courseManagement.success_page_conversion_label = data.success_page_conversion_label;
                        model.courseManagement.privacy_id = data.privacy_id;
                        model.courseManagement.password = data.password;
                        model.courseManagement.course_status_id = data.course_status_id;
                        model.courseManagement.course_user_count = data.course_user_count;
                        model.SubmitForReview = data.SubmitForReview;
                        $scope.getpassword();
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    error();
                }
            });
        }

        function courseupdate($valid) {
            if ($valid) {
                CourseUpdate.update({
                    id: $state.params.id,
                }, model.courseManagement, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Course Settings has been updated successfully.");
                        flash.set(flashMessage, 'success', false);
                        $rootScope.$emit('updateCourseParent', {});
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }

                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while updating course settings. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                });
            }

        }

        function publishCourse(type) {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 1
            });
        }

        function DeleteCourse() {
            AlertBox.confirm('Are you sure want to delete this course?', function (isConfirmed) {
                if (isConfirmed) {
                    CourseUpdate.remove({
                        id: $state.params.id,
                    }, function (response) {
                        if (response.error.code === 0) {
                            $state.go('myCoursesTeaching');
                            flashMessage = $filter("translate")("Course has been deleted successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flash.set(response.error.message, 'error', false);
                        }

                    }, function (error) {
                        flashMessage = $filter("translate")("Oops, an error has occurred while deleting the course. Please try again later.");
                        flash.set(flashMessage, 'error', false);

                    });
                }
            });

        }
        $scope.getpassword = function () {
            if (model.courseManagement.privacy_id === 3) {
                model.password_field = true;
            } else {
                model.password_field = false;

            }
        };
    });
    module.controller('ManageCourseScheduleController', function (ViewCourse, $state, $filter, $rootScope, $scope) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Schedule ")  + " | " + $rootScope.settings['site.name'];
        $scope.course_id = $state.params.id;
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            ViewCourse.get({
                id: $state.params.id,
            }).$promise
                .then(function (response) {
                    model.loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }


    });
    module.controller('demoSessionCourseController', function (ViewCourse, $state, CourseUpdate, flash, $filter, $rootScope, TokenServiceData, $scope, TimezoneList, $window, DemoSession, $uibModal, DemoSessionUpdate, $uibModalStack, ConstDateFormat, AlertBox, ConstToolTipContent) {
        var model = this;
        model.loading = true;
        $scope.ConstToolTipContent = ConstToolTipContent;
        $rootScope.pageTitle = $filter("translate")("Manage Demo Classes")  + " | " + $rootScope.settings['site.name'];
        model.createDemoInit = createDemoInit;
        $scope.course_id = $state.params.id;
        model.addCourseDemoSession = addCourseDemoSession;
        model.editCourseDemoSession = editCourseDemoSession;
        model.sort = sort;
        model.demo_action = 'list';
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            getCourseDetails();
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
        /*Getting course details*/
        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        model.course = data;
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }
        //Gettting the Demosession list
        function demoSessionList() {
            DemoSession.get({
                course_id: $scope.course_id,
            }).$promise.then(function (response) {
                angular.forEach(response.data, function (demo_session) {
                    demo_session.utc_offset = demo_session.timezone_utc_offset;
                });
                model.demosession_list = $filter('CountryTimezone')(response.data, ['session_start_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
            }, function (error) {
                if (error.status === 404) {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: error.status
                    });
                }
            });
        }
        //Gettting the Demosession list
        function sort(sort) {
            model.currentSort = sort;
            if (sort === 'all') {
                sort = null;
            }
            DemoSession.get({
                type: sort,
                course_id: $scope.course_id,
            }).$promise.then(function (response) {
                model.demosession_list = $filter('CountryTimezone')(response.data, ['session_start_date', 'session_end_date'], 'TimeZoneSet', ConstDateFormat.created_12);
            }, function (error) {
                if (error.status === 404) {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: error.status
                    });
                }
            });
        }

        //Creating the demo classes
        function addCourseDemoSession($valid, form) {
            if ($valid) {
                /*Led Onsite demo classes*/
                if ($scope.demo_session.type === 'onsite') {
                    if (typeof (model.place) !== 'string' && model.place !== null && model.place !== undefined) {
                        $scope.demo_session.address = model.place.formatted_address;
                    } else {
                        $scope.demo_session.address = model.place;
                    }
                }
                var timezone, chosedtimezone;
                //Finding the chosen Timezone
                chosedtimezone = model.timezone_lists.filter(function (timezone) {
                    return timezone.id == $scope.demo_session.timezone_id;
                });
                if (chosedtimezone.length > 0) {
                    timezone = chosedtimezone[0].utc_offset;
                }
                //Converting timzone and setting UTC timezone to +0000
                var demo_startdate = $filter('date')(Date.parse(model.demopicker.date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(model.demopicker.start_session_time), ConstDateFormat.time_sec_24);
                demo_startdate = $filter('date')(Date.parse(demo_startdate + timezone), ConstDateFormat.created_24_z, '+0000');
                var demo_enddate = $filter('date')(Date.parse(model.demopicker.date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(model.demopicker.end_session_time), ConstDateFormat.time_sec_24);
                demo_enddate = $filter('date')(Date.parse(demo_enddate + timezone), ConstDateFormat.created_24_z, '+0000');
                $scope.demo_session.session_end_date = demo_enddate;
                $scope.demo_session.session_start_date = demo_startdate;
                if ($scope.demo_session.session_end_date < $scope.demo_session.session_start_date) {
                    flashMessage = $filter("translate")("Start time should be less than End time.");
                    flash.set(flashMessage, 'error', false);
                    return true;
                }
                model.demo_disableButton = true;
                $scope.demo_session.course_id = $scope.course_id;
                DemoSession.create(
                    $scope.demo_session,
                    function (response) {
                        if (response.id) {
                            demoSessionList();
                            form.$setPristine();
                            form.$setUntouched();
                            $rootScope.$emit('updateCourseParent', {});
                            UpdateCourseStatus();
                            model.demo_action = 'list';
                            flashMessage = $filter("translate")("Demo session  has been created successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("Demo session  couldn't be created. Try again later.");
                            flash.set(flashMessage, 'error', false);
                            model.addform = false;
                            model.editform = false;
                        }
                        model.demo_disableButton = false;
                    },
                    function (error) {
                        flashMessage = $filter("translate")("Error occurred while creating a demo session. Try again later.");
                        flash.set(flashMessage, 'error', false);
                        model.demo_disableButton = false;
                    });
            }
        }
        /*Triggering demo class editing */
        $scope.EditDemoSession = function (id, index) {
            model.edit_demo_detail = model.demosession_list[index];
            model.edit_demopicker = {
                date: new Date(model.edit_demo_detail.session_start_date),
                start_session_time: new Date(model.edit_demo_detail.session_start_date),
                end_session_time: new Date(model.edit_demo_detail.session_end_date),
                datepickerOptions: { minDate: new Date(), showWeeks: false }
            };
            var Today = new Date();
            if (model.edit_demopicker.end_session_time < Today) {
                model.edit_demo_detail.demo_expired = true;
            } else {
                model.edit_demo_detail.demo_expired = false;
            }
            model.demo_action = 'edit';
        };
        //Creating the demo classes
        function editCourseDemoSession($valid, form) {
            if ($valid) {
                $scope.edit_demo_session = {};
                /*Led Onsite demo classes*/
                if (model.edit_demo_detail.type === 'onsite') {
                    if (typeof (model.edit_demo_detail.address) !== 'string' && model.edit_demo_detail.address !== null && model.edit_demo_detail.address !== undefined) {
                        $scope.edit_demo_session.address = model.edit_demo_detail.address.formatted_address;
                    } else {
                        $scope.edit_demo_session.address = model.edit_demo_detail.address;
                    }
                }
                /*Led Online demo classes*/
                if (model.edit_demo_detail.type === 'online') {
                    $scope.edit_demo_session.webinar_url = model.edit_demo_detail.webinar_url;
                }
                $scope.edit_demo_session.timezone_id = model.edit_demo_detail.timezone_id;
                var edit_timezone, edit_chosedtimezone;
                //Finding the chosen Timezone
                edit_chosedtimezone = model.timezone_lists.filter(function (timezone) {
                    return timezone.id == $scope.edit_demo_session.timezone_id;
                });
                if (edit_chosedtimezone.length > 0) {
                    edit_timezone = edit_chosedtimezone[0].utc_offset;
                }
                //Converting timzone and setting UTC timezone to +0000
                var edit_demo_startdate = $filter('date')(Date.parse(model.edit_demopicker.date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(model.edit_demopicker.start_session_time), ConstDateFormat.time_sec_24);
                edit_demo_startdate = $filter('date')(Date.parse(edit_demo_startdate + edit_timezone), ConstDateFormat.created_24_z, '+0000');
                var edit_demo_enddate = $filter('date')(Date.parse(model.edit_demopicker.date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(model.edit_demopicker.end_session_time), ConstDateFormat.time_sec_24);
                edit_demo_enddate = $filter('date')(Date.parse(edit_demo_enddate + edit_timezone), ConstDateFormat.created_24_z, '+0000');
                $scope.edit_demo_session.session_end_date = edit_demo_enddate;
                $scope.edit_demo_session.session_start_date = edit_demo_startdate;
                if ($scope.edit_demo_session.session_end_date < $scope.edit_demo_session.session_start_date) {
                    flashMessage = $filter("translate")("Start time should be less than End time.");
                    flash.set(flashMessage, 'error', false);
                    return true;
                }
                model.edit_demo_disableButton = true;
                DemoSessionUpdate.update({
                    id: model.edit_demo_detail.id,
                }, $scope.edit_demo_session, function (response) {
                    if (response.error.code === 0) {
                        demoSessionList();
                        form.$setPristine();
                        form.$setUntouched();
                        model.demo_action = 'list';
                        $rootScope.$emit('updateCourseParent', {});
                        UpdateCourseStatus();
                        flashMessage = $filter("translate")("Demo session updated successfully.");
                        flash.set(flashMessage, 'success', false);
                    } else {
                        flashMessage = $filter("translate")("Demo session  couldn't be updated. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                    model.edit_demo_disableButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while creating a demo session. Try again later.");
                    flash.set(flashMessage, 'error', false);
                    model.edit_demo_disableButton = false;
                });

            }
        }
        /*Deleting demo classes*/
        $scope.DeleteDemoSession = function (id) {
            AlertBox.confirm('Are you sure you want to delete this demo class?', function (isConfirmed) {
                if (isConfirmed) {
                    DemoSessionUpdate.remove({
                        id: id,
                    }, function (response) {
                        if (response.error.code === 0) {
                            demoSessionList();
                            flashMessage = $filter("translate")("Demosession has been deleted successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flash.set(response.error.message, 'error', false);
                        }

                    });
                }
            });

        };
        /*Opening demo class webinar url */
        $scope.OpenWebinarWindow = function (url) {
            if (url !== null && url !== undefined) {
                var w = 1000,
                    h = 600,
                    left = (window.screen.width / 2) - ((w / 2) + 10),
                    top = (window.screen.height / 2) - ((h / 2) + 50);
                var win = window.open(url, 'popupWindow',
                    "status=no,height=" + 600 + ",width=" + 1000 + ",resizable=yes,left=" +
                    left + ",top=" + top + ",screenX=" + left + ",screenY=" +
                    top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
            }
        };
        function dateInit() {
            model.demopicker = { datepickerOptions: { minDate: new Date(), showWeeks: false } };
        }
        function createDemoInit() {
            $scope.demo_session = {};
            model.demopicker = { datepickerOptions: { minDate: new Date(), showWeeks: false } };
            if (model.course.coursetype.onsite === true && model.course.coursetype.online === true) {
                $scope.demo_session.type = 'online';
                model.showcourseType = true;
            } else if (model.course.coursetype.onsite === true && !model.course.coursetype.online) {
                model.showcourseType = false;
                $scope.demo_session.type = 'onsite';
            } else if (!model.course.coursetype.onsite && model.course.coursetype.online === true) {
                model.showcourseType = false;
                $scope.demo_session.type = 'online';
            }
            model.demo_action = 'add';
        }
        //Gettting the timezones
        function timezone() {
            TimezoneList.get({
                limit: 'all',
                field: 'id,code,utc_offset,name',
                sort: "utc_offset::int",
                sort_by: "ASC"
            }).$promise.then(function (response) {
                model.timezone_lists = response.data;
            }, function (error) {
                if (error.status === 404) {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: error.status
                    });
                }
            });
        }
        //init function calling
        timezone();
        dateInit();
        demoSessionList();
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
    });
    module.controller('ManageCourseAutomatedMessageController', function (ViewCourse, $state, CourseUpdate, flash, $filter, $rootScope, TokenServiceData, $scope, $uibModal, $location) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Price")  + " | " + $rootScope.settings['site.name'];
        model.course = {};
        $scope.course_id = $state.params.id;
        model.courseupdate = courseupdate;

        function getCourseDetails() {
            $scope.$on("CourseDetails", function (evt, data) {
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.loading = true;
                    if (data !== null && data !== undefined) {
                        model.course.congratulation_message = data.congratulation_message;
                        model.course.welcome_message = data.welcome_message;
                        model.manageCourseOption = data;
                        model.loading = false;
                    } else {
                        $rootScope.$emit('updateCourseParent', {});
                    }
                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });
        }

        /*function init() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                ViewCourse.get({
                        id: $state.params.id,
                    }).$promise
                    .then(function(response) {
                        model.course.congratulation_message = response.data[0].congratulation_message;
                        model.course.welcome_message = response.data[0].welcome_message;
                        model.loading = false;
                    }, function(error) {
                        if (error.status === 404) {
                            $scope.$emit('updateParent', {
                                isOn404: true,
                                errorNo: error.status
                            });
                        }
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }*/


        function courseupdate() {

            model.add_disableButton = (model.NextButtonVal === 'next') ? false : true;
            var params = {};
            params.congratulation_message = model.course.congratulation_message;
            params.welcome_message = model.course.welcome_message;
            CourseUpdate.update({
                id: $state.params.id,
            }, params, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Automated Course Message has been updated successfully.");
                    flash.set(flashMessage, 'success', false);
                    $rootScope.$emit('updateCourseParent', {});
                    model.add_disableButton = false;
                    if (model.NextButtonVal === 'next') {
                        if ($rootScope.settings['site.enabled_plugins'].indexOf('Coupons') > -1 && model.manageCourseOption.course_status_id == '3') {
                            $location.path('/manage-course/coupon/' + $state.params.id);
                        } else {
                            $location.path('/manage-course/edit-management/' + $state.params.id);
                        }
                    }
                } else {
                    flash.set('Oops, an error has occurred while updating automated course message. Please try again later.', 'error', false);
                }

            }, function (error) {
                flash.set('Oops, an error has occurred while updating automated course message. Please try again later.', 'error', false);
            });
        }
        getCourseDetails();
    });

    module.controller('ManageCourseStudentListController', function (CourseUserList, $state, flash, $filter, $rootScope, TokenServiceData, $scope, $uibModal) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Student List")  + " | " + $rootScope.settings['site.name'];
        model.course = {};
        $scope.course_id = $state.params.id;
        model.sort = sort;
        model.paginate = paginate;
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {

        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        function getCourseStudent(element) {
            var params = {};
            params.field = 'id,created,course_id,course_title,course_slug,teacher_name,learner_name,course_user_status,price,site_commission_amount,booked_date,course_groups,total_viewed_video_duration,course_batch_id,name,start_date,end_date,course_user_count,is_offline,user_id,teacher_user_id,feedback_from_instructor,is_refund_requested,refund_reason,refunded_date,admin_reject_reason,channel_id,channel_name,coupon_code,discount_amount,platform_id';
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            if (model.currentSortby !== undefined && model.currentSortby !== null) {
                if (model.currentSortby !== 'all') {
                    params.sort = model.currentSortby;
                    params.sort_by = 'ASC';
                } else {
                    params.sort = null;
                    params.sort_by = null;
                }
            } else {
                model.currentSortby = 'all';
            }
            params.type = 'Student';
            params.course_id = $state.params.id;
            CourseUserList.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        model._metadata = response._metadata;
                        model.currentPage = model._metadata.currentPage;
                        model.StudentCoursesLists = $filter('CountryTimezone')(response.data, ['end_date', 'created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm:a');
                        angular.forEach(model.StudentCoursesLists, function (value) {
                            var today = new Date();
                            var currentdate = $filter('date')(Date.parse(today), "yyyy-MM-dd");
                            var enddate = $filter('date')(Date.parse(value.end_date), "yyyy-MM-dd");
                            if (currentdate < enddate) {
                                var number_session = moment(Date.parse(enddate)).diff(moment(Date.parse(currentdate)), 'days');
                                value.progess_percentage = (100 / number_session);
                            } else {
                                value.progess_percentage = 100;
                            }
                        });
                        if (element !== null && angular.isDefined(element)) {
                            $('html, body').animate({
                                scrollTop: $(element).offset().top
                            }, 1500, 'swing', false);
                        }

                    }
                        model.loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });
        }

        function paginate(element) {
            model.currentPage = parseInt(model.currentPage);
            getCourseStudent(element);
        }

        function sort(a) {
            model.currentPage = 1;
            model.currentSortby = a;
            getCourseStudent(null);
        }
        getCourseStudent(null);
        $scope.modalSignup = function (e, Batch) {
            e.preventDefault();
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/Message/CourseBatchMessage.tpl.html',
                controller: 'courseBatchMessageController as model',
                size: 'sm',
                resolve: {
                    pageType: function () {
                        return "modal";
                    },
                    Batch: function () {
                        return Batch;
                    },
                    course_id: function () {
                        return $state.params.id;
                    },
                    classType: function () {
                        return "Course";
                    },
                    Type: function () {
                        return "User";
                    },
                }
            });
        };

    });

} (angular.module("ace.courses")));
