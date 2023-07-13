/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {


} (angular.module('ace.Assignment', [
    'ui.router',
    'ngResource'
])));

(function (module) {
    module.directive('assignmentLessonsForm', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Assignment/AssignmentLessonsForm.tpl.html',
            link: linker,
            controller: 'assignmentLessonsFormController as model',
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
    module.controller('assignmentLessonsFormController', function ($rootScope, $scope, AddCourseQuiz, $filter, flash, OnlineCourseLessonsQuizUpdate, addOnlineCourseLessons, anchorSmoothScroll, $timeout, CreateOnlineCourseLesson, GENERAL_CONFIG, $http) {
        var model = this;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        $scope.showForm = false;
        $scope.editForm = false;
        $scope.tab_active = 'upload_video';
        $scope.upload_video_tab = true;
        $scope.add_library_tab = true;
        $rootScope.Assignment_bulk_uploader_id = null;
        model.amazonS3Upload = amazonS3Upload;

        model.tabActivate = function (form_tab) {
            $scope.tab_active = form_tab;

        };

        if ($scope.action === 'edit') {
            var assignmentform = {};
            assignmentform.editForm = true;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform
            });
            getLessonUpdate();
        }
        $rootScope.$on('updateAssignmentForm', function (event, args) {
            $rootScope.AssignmentForm = {};
            $rootScope.AssignmentForm.showForm = args.AssignmentForm.showForm;
            $rootScope.AssignmentForm.editForm = args.AssignmentForm.editForm;
            $rootScope.AssignmentForm.questionshowForm = args.AssignmentForm.AssignmentForm;
            $rootScope.AssignmentForm.questionshowForm = args.AssignmentForm.questionshowForm;
            $rootScope.AssignmentForm.questionlistForm = args.AssignmentForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var assignmentform = {};
            assignmentform.showForm = true;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform
            });
        };
        $scope.hideForm = function (e) {
            e.preventDefault();
            var assignmentform = {};
            assignmentform.showForm = false;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform
            });
        };
        courseID = model.course;

        function getLessonUpdate() {
            OnlineCourseLessonsQuizUpdate.get({
                quizId: $scope.lessonID
            }).$promise
                .then(function (response) {
                    model.editOnlineQuiz = {};
                    model.editOnlineQuiz.name = response.data[0].name;
                    model.editOnlineQuiz.description = response.data[0].description;
                });
        }

        $scope.editQuiz = function ($valid) {
            if ($valid) {
                model.QuizEditButton = true;
                model.editOnlineQuiz.course_id = model.course;
                OnlineCourseLessonsQuizUpdate.update({
                    quizId: $scope.lessonID
                }, model.editOnlineQuiz, function (response) {
                    if (response.data !== undefined && response.data !== null) {
                        succsMsg = $filter("translate")("Assignment lesson has been updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        var assignmentform = {};
                        assignmentform.editForm = false;
                        $rootScope.$emit('updateAssignmentForm', {
                            AssignmentForm: assignmentform
                        });
                        model.updateparent(); /*Calling online lessons func.*/
                        UpdateCourseStatus(); /*Calling course update func.*/
                    }
                    model.QuizEditButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, there seems to be an unknown error while updating Assignment lessons. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                    model.QuizEditButton = false;
                });
            }

        };

        function CheckUnpublishedLessons($valid) {
            if ($valid) {
                var unpublished_lessons = model.publishparent();
                if (unpublished_lessons.length > 0) {
                    $scope.published_button = true;
                    addLessonDetail(unpublished_lessons);
                }
                if (unpublished_lessons.length === 0) {
                    $scope.addQuiz($valid);
                }
            }

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
                        model.AddOnlineQuiz.assignment_instruction_downloadedfiles = [{ 'filename': response.filename }];
                    } else {
                        delete (model.AddOnlineQuiz.assignment_instruction_downloadedfiles);
                        $("#downloadTaskAttachments").val("");
                        errorMessage = $filter("translate")("File couldn't be uploaded. File extension not allowed");
                        flash.set(errorMessage, 'error', false);
                    }
                }).error();
            }
        };

        $scope.addQuiz = function ($valid) {
            if ($valid) {
                model.QuizSaveButton = true;
                model.AddOnlineQuiz.is_assignment = true;
                model.AddOnlineQuiz.is_chapter = 0;
                model.AddOnlineQuiz.is_lesson_ready = 0;
                model.AddOnlineQuiz.course_id = model.course;
                if ($rootScope.Assignment_bulk_uploader_id !== undefined && $rootScope.Assignment_bulk_uploader_id !== null) {
                    model.AddOnlineQuiz.assignment_instruction_videos = [{ 'id': $rootScope.Assignment_bulk_uploader_id }];
                }
                CreateOnlineCourseLesson.create(model.AddOnlineQuiz, function (response) {
                    if (response.data) {
                        flashMessage = $filter("translate")("Assignment has been added successfully.");
                        flash.set(flashMessage, 'success', false);
                        var assignmentform = {};
                        assignmentform.showForm = false;
                        $rootScope.$emit('updateAssignmentForm', {
                            AssignmentForm: assignmentform
                        });
                        model.AddOnlineQuiz = {};
                        model.updateparent();
                        UpdateCourseStatus();
                    } else {
                        flash.set("Oops, an unexpected error has occurred while adding Assignment. Please try again later.", 'error', false);
                    }
                    model.QuizSaveButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while adding Assignment. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                    model.QuizSaveButton = false;
                });
            }

        };

        function amazonS3Upload(response) {
            if (!response.error) {
                $scope.add_library_tab = false;
                model.AddOnlineQuiz.aws_url = response.aws_url;
            }
        }
        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            CreateOnlineCourseLesson.create(lessondetails, function (response) {
                if (response.data) {
                    if (lessons.length > 0) {
                        addLessonDetail(lessons);
                    } else {
                        $scope.addQuiz(true);
                    }
                }
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
    //QUIZ QUESTION AND ANSWER GETTING FROM INTRUCTOR FORM
    module.directive('assignmentQuestionAnswer', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Assignment/AddAssignmentQuestionAnswerForm.tpl.html',
            link: linker,
            controller: 'AddassignmentQuestionAnswerFormController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                lessonId: '@lessonId',
                updateparent: '&',
                index: '@index'
            }
        };
    });
    module.controller('AddassignmentQuestionAnswerFormController', function (Course, $scope, addOnlineCourseLessons, OnlineCourseLessons, OnlineCourseLessonsUpdate, $filter, flash, $rootScope, AddCourseQuizQuestion, CourseQuizQuestion) {
        var model = this;
        model.quizAnswer = {};
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        model.quizAnswer.online_course_lesson_id = model.lessonId;
        model.quizAnswer.course_id = model.course;
        $scope.questionshowForm = false;
        $scope.questioneditForm = false;
        model.DeleteQuizAnswerfield = DeleteQuizAnswerfield;
        model.AddQuizAnswerfield = AddQuizAnswerfield;
        model.GetQuizlessionQuestionsList = GetQuizlessionQuestionsList;
        model.getQuizQuestionAnswer = getQuizQuestionAnswer;
        model.editQuizAnswerfield = editQuizAnswerfield;
        model.DeleteEditQuizAnswerfield = DeleteEditQuizAnswerfield;
        model.answerChoosen = false;
        model.deleteQuizQuestionAnswer = deleteQuizQuestionAnswer;
        if ($scope.action === 'list') {
            GetQuizlessionQuestionsList();

        }
        $scope.listuploadConfigure = function () {
            var assignmentform = {};
            assignmentform.questionlistForm = true;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
            GetQuizlessionQuestionsList();
        };
        $rootScope.$on('updateAssignmentForm', function (event, args) {
            $rootScope.AssignmentForm = {};
            $rootScope.AssignmentForm.course_id = args.course_id;
            $rootScope.AssignmentForm.lesson_id = args.lesson_id;
            $rootScope.AssignmentForm.showForm = args.AssignmentForm.showForm;
            $rootScope.AssignmentForm.editForm = args.AssignmentForm.editForm;
            $rootScope.AssignmentForm.questionshowForm = args.AssignmentForm.questionshowForm;
            $rootScope.AssignmentForm.questioneditForm = args.AssignmentForm.questioneditForm;
            $rootScope.AssignmentForm.questionlistForm = args.AssignmentForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var assignmentform = {};
            assignmentform.questionshowForm = true;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
        };

        $scope.hideForm = function (e) {
            e.preventDefault();
            var assignmentform = {};
            assignmentform.questionshowForm = false;
            $rootScope.$emit('updateAssignmentForm', {
                AssignmentForm: assignmentform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
        };
        $scope.EditQuestionCancelForm = function (e) {
            e.preventDefault();
            $scope.action = 'list';
        };

        //Geting the Overall Listing of the course

        function GetQuizlessionQuestionsList() {

            var params = {};
            params.online_course_lesson_id = model.lessonId;
            params.course_id = model.course;
            AddCourseQuizQuestion.get(params).$promise
                .then(function (response) {
                    model.quizQuestionlist = response.data;
                })
                .catch(function (error) {

                })
                .finally();
        }
        //Getting the Particular Quix Question ,Answer && Triggering the edit form
        function getQuizQuestionAnswer(e, id, action) {
            $scope.action = action;
            e.preventDefault();
            CourseQuizQuestion.get({
                quizQuestionId: id
            }).$promise
                .then(function (response) {
                    $scope.quizQuestion_editValue = response.data[0];
                    var assignmentform = {};
                    assignmentform.questioneditForm = true;
                    $rootScope.$emit('updateAssignmentForm', {
                        AssignmentForm: assignmentform
                    });
                })
                .catch(function (error) {

                })
                .finally();
        }
        //Deleting the particular quiz qustions
        function deleteQuizQuestionAnswer(e, id, index) {
            e.preventDefault();
            CourseQuizQuestion.remove({
                quizQuestionId: id
            }).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        model.quizQuestionlist.splice(index, 1);
                        if (model.quizQuestionlist.length === 0) {
                            LessonReadyUpdate(0);
                        }
                        UpdateCourseStatus();
                    } else {
                        errorMsg = $filter("translate")(response.error.message);
                        flash.set(errorMsg, 'error', false);
                    }
                })
                .catch(function (error) {

                })
                .finally();
        }
        //Pushing the option for edit quiz_question
        function editQuizAnswerfield(e) {
            e.preventDefault();
            $scope.quizQuestion_editValue.answer.push({
                "answer": null,
                "feedback": null,
                "is_answer": 0
            });
        }
        //Delete the edit option field
        function DeleteEditQuizAnswerfield(e, index) {
            e.preventDefault();
            if ($scope.quizQuestion_editValue.answer.length > 2) {
                $scope.quizQuestion_editValue.answer.splice(index, 1);
            } else {
                succsMsg = $filter("translate")("Sorry unable to process. Minimum two options are required.");
                flash.set(succsMsg, 'error', false);
            }
        }
        //Edit Quiz Question and Answer submit
        $scope.editAssignmentAnswer = function ($valid) {
            if ($valid) {
                $scope.disableButton = true;
                var params = {
                    "course_id": $scope.quizQuestion_editValue.course_id,
                    "online_course_lesson_id": $scope.quizQuestion_editValue.online_course_lesson_id,
                    "related_chapter_id": 0,
                    "question": $scope.quizQuestion_editValue.question,
                    "quiz_question_answers": [
                        {
                            answer: $scope.quizQuestion_editValue.answer[0].answer,
                        }
                    ]
                };
                if ($scope.quizQuestion_editValue.answer.length > 0) {
                    angular.forEach($scope.quizQuestion_editValue.answer, function (answer) {
                        params.quiz_question_answers.push({
                            "id": answer.id,
                            "answer": answer.answer,
                            "feedback": answer.feedback,
                            "is_answer": answer.is_answer
                        });
                    });
                }
                CourseQuizQuestion.update({
                    quizQuestionId: $scope.quizQuestion_editValue.id
                }, params).$promise
                    .then(function (response) {
                        model.updateparent();
                        $scope.disableButton = false;
                        if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                            succsMsg = $filter("translate")("Assignment Question and Answers updated successfully.");
                            flash.set(succsMsg, 'success', false);
                            UpdateCourseStatus();
                        }
                    })
                    .catch(function (error) {
                        flash.set("Oops, an unexpected error has occurred while updating Assignment question and answers. Please try again later.", 'error', false);
                        $scope.disableButton = false;
                    })
                    .finally();

            }

        };
        //model.editOnlineLesson = [];
        $scope.AnswerChoose = function (index) {
            model.Show_error = false;
            model.answerChoosen = true;
        };
        $scope.AddQuizAnswerForm = function ($valid) {
            if ($valid) {
                angular.forEach(model.quizAnswer, function (value, key) {
                    var assisgnment_add = {
                        online_course_lesson_id: model.lessonId,
                        course_id: model.course,
                        question: value.question,
                        related_chapter_id: 0,
                        quiz_question_answers: [
                            {
                                answer: value.answer,
                            }
                        ]
                    };
                    AddCourseQuizQuestion.create(assisgnment_add).$promise
                        .then(function (response) {
                            LessonReadyUpdate(1);
                            $scope.showForm = false;
                            $scope.disableButton = false;
                            if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                                succsMsg = $filter("translate")("Assignment Question and Answers updated successfully.");
                                flash.set(succsMsg, 'success', false);
                                model.QuestionAddButton = false;
                                UpdateCourseStatus();
                            }
                        })
                        .catch(function (error) {
                            model.QuestionAddButton = false;
                            flash.set("Oops, an unexpected error has occurred while adding Assignment question and answers. Please try again later.", 'error', false);
                        })
                        .finally();
                });
            }
        };

        function QuizAnswerfield() {
            model.quizAnswer = [];
            model.quizAnswer.push({
                "answer": null,
                "question": null,
            });
        }
        function LessonReadyUpdate(value) {
            var params = {};
            params.is_lesson_ready = value;
            params.id = $scope.lessonID;
            OnlineCourseLessonsUpdate.update(params, function (response) {
                model.updateparent();
            });

        }
        function DeleteQuizAnswerfield(e, index) {
            e.preventDefault();
            if (model.quizAnswer.length > 1) {
                model.quizAnswer.splice(index, 1);
            } else {
                succsMsg = $filter("translate")("Please select one option for each Questions");
                flash.set(succsMsg, 'info', false);
            }

        }

        function AddQuizAnswerfield(e) {
            e.preventDefault();
            model.quizAnswer.push({
                "answer": null,
                "question": null,
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
        QuizAnswerfield();
    });
    //LEARNING Quiz FROM LEANER PAGE COURSE
    module.directive('assignmentExerciseLearner', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Assignment/AssignmentExerciseLearner.tpl.html',
            link: linker,
            controller: 'QuizExerciseLearnerController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
                lessonDetail: '@lessonDetail'
            }
        };
    });
    module.controller('QuizExerciseLearnerController', function ($rootScope, $scope, $filter, flash, CourseUserAssignmentUpdate, AddCourseQuizQuestion, CourseUserAssignmentGet, CourseUserQuestion, GetCourseUserEntry, $state, $uibModalStack, AssignmentFeedback, AssignmentGet, AssignmentFeedbackDelete, AssignmentFeedbackUpdate, $uibModal, OnlineCourseLessonsUpdate, AlertBox) {
        var model = this;
        $scope.loader = true;
        $scope.step_1 = true;
        $scope.step_2 = false;
        $scope.lesson_data = {};
        model.assignment_feedback_ans = null;
        if (model.lessonDetail !== undefined && model.lessonDetail !== null && model.lessonDetail !== '') {
            model.assignmentDetails = JSON.parse(model.lessonDetail);
        }
        model.question_slide_change = question_slide_change;
        model.assignment_feedback = assignment_feedback;
        model.FeedbackDelete = FeedbackDelete;
        model.FeedbackEdit = FeedbackEdit;
        $scope.ShowAnswer = false;
        model.QuestionTryAGain = QuestionTryAGain;
        model.QuestionDeleteFormSubmit = QuestionDeleteFormSubmit;
        //Getting the Quiz and Answer
        model.quizQuestionlists = [];
        model.is_share_feedback_to_other_students = true;
        var courseUserID = '';
        //Checking the status
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
                            getQuizQuestionAnswer();
                        }
                    });
            }
        }

        function assignment_feedback(form) {
            if (form.$valid) {
                var parent_ids = 0;
                if (model.Assignment_feedbacks['0'] !== null && model.Assignment_feedbacks['0'] !== undefined) {
                    parent_ids = model.Assignment_feedbacks['0'].id;
                }
                var assignment_feedback = {
                    "foreign_id": model.assignmentDetails.assignment_id,
                    "class": 'AssignmentFeedback',
                    "message": model.assignment_feedback_ans,
                    "subject": model.assignment_feedback_ans,
                    "user_id": [{
                        "user_id": model.assignmentDetails.teacher_user_id
                    }],
                    "parent_id": parent_ids
                };
                model.assignment_feedback_ans = '';
                AssignmentFeedback.create(assignment_feedback).$promise
                    .then(function (response) {
                        succsMsg = $filter("translate")("Feedback submitted successfully.");
                        flash.set(succsMsg, 'success', false);
                        form.$setPristine();
                        form.$setUntouched();
                        getMessages();
                    }, function (error) {
                        flash.set("Oops, an unexpected error has occurred while submitting feedback. Please try again later.", 'error', false);
                    });
            }
        }

        function FeedbackEdit(form, child_index, type) {
            if (form.$valid) {
                var params = '';
                if (type === 'child') {
                    params = {
                        "id": model.Assignment_feedbacks['0'].children[child_index].id,
                        "message": model.Assignment_feedbacks['0'].children[child_index].edit_message,
                    };
                } else {
                    params = {
                        "id": model.Assignment_feedbacks['0'].id,
                        "message": model.Assignment_feedbacks['0'].edit_message,
                    };
                }

                AssignmentFeedbackUpdate.update(params).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            if (type === 'child') {
                                model.Assignment_feedbacks['0'].children[child_index].message = model.Assignment_feedbacks['0'].children[child_index].edit_message;
                                model.Assignment_feedbacks['0'].children[child_index].editForm = false;
                            } else {
                                model.Assignment_feedbacks['0'].message = model.Assignment_feedbacks['0'].edit_message;
                                model.Assignment_feedbacks['0'].editForm = false;
                            }
                            form.$setPristine();
                            form.$setUntouched();
                            flashMessage = $filter("translate")("Feedback has been Updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating feedback. Please try again later. ");
                            flash.set(flashMessage, 'error', false);
                        }
                    }, function (error) {
                        flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating feedback. Please try again later. ");
                        flash.set(flashMessage, 'error', false);
                    });
            }
        }
        function QuestionDeleteFormSubmit(child_index) {
            AlertBox.confirm('Are you sure you want to delete?', function (isConfirmed) {
                if (isConfirmed) {
                    AssignmentFeedbackDelete.remove({
                        'messageId': model.Assignment_feedbacks[0].children[child_index].id
                    }).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                model.Assignment_feedbacks[0].children.splice(child_index, 1);
                                flashMessage = $filter("translate")("Feedback has been deleted successfully.");
                                flash.set(flashMessage, 'success', false);
                            } else {
                                flashMessage = $filter("translate")("Oops, an unexpected error has occurred while deleting feedback. Please try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }, function (error) {
                            flashMessage = $filter("translate")("Oops, an unexpected error has occurred while deleting feedback. Please try again later. ");
                            flash.set(flashMessage, 'error', false);
                        });
                }
            });

        }
        function FeedbackDelete(delete_id) {
            AssignmentFeedbackDelete.remove({
                'messageId': delete_id
            }).$promise
                .then(function (response) {
                    getMessages();
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while deleting feedback. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                });
        }

        function getMessages() {
            model.Assignment_feedbacks = [];
            AssignmentGet.get({
                'foreign_id': model.assignmentDetails.assignment_id,
                'class': 'AssignmentFeedback',
            }).$promise
                .then(function (response) {
                    response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    model.Assignment_feedbacks = response.data;
                    angular.forEach(model.Assignment_feedbacks, function (message) {
                        angular.forEach(message.other_user, function (other_user) {
                            message.other_user = other_user.username;
                            message.other_user_image = other_user.image_hash;
                        });
                        angular.forEach(message.user, function (user) {
                            message.user = user.username;
                            message.user_image = user.image_hash;
                        });
                        message.editable = false;
                        if (message.is_sender === true && (parseInt(message.user_id) === parseInt($rootScope.auth.id))) {
                            message.editable = true;
                        }
                        if (message.is_sender === false && (parseInt(message.other_user_id) === parseInt($rootScope.auth.id))) {
                            message.editable = true;
                        }
                        if (message.children !== null) {
                            if (message.children.length > 0) {
                                message.children = $filter('CountryTimezone')(message.children, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                                angular.forEach(message.children, function (child_message) {
                                    child_message.edit_message = child_message.message;
                                    child_message.editable = false;
                                    if (child_message.is_sender === true && (parseInt(child_message.user_id) === parseInt($rootScope.auth.id))) {
                                        child_message.editable = true;
                                    }
                                    if (child_message.is_sender === false && (parseInt(child_message.other_user_id) === parseInt($rootScope.auth.id))) {
                                        child_message.editable = true;
                                    }
                                });
                            }

                        }
                    });
                });
        }

        function getQuizQuestionAnswer() {
            if (model.lessonId !== null && model.lessonId !== undefined) {
                model.quizQuestionlists = [];
                var params = {};
                params.online_course_lesson_id = model.lessonId;
                params.course_id = model.course;
                AddCourseQuizQuestion.get(params).$promise
                    .then(function (response) {
                        if (response.data.length == 1) {
                            angular.forEach(response.data, function (student_question, parent_key) {
                                student_question.student_answer = undefined;
                                student_question.Number = parent_key + 1;
                                if (parent_key === 0) {
                                    student_question.previous_key = false;
                                    student_question.next_key = false;
                                    student_question.current_index = parent_key;
                                    student_question.next_index = parent_key + 1;
                                    student_question.submit_key = true;
                                }
                                model.quizQuestionlists.push(student_question);
                            });
                        }
                        if (response.data.length > 0 && response.data.length !== 1) {
                            angular.forEach(response.data, function (student_question, parent_key) {
                                student_question.student_answer = undefined;
                                student_question.Number = parent_key + 1;
                                if (parent_key === 0) {
                                    student_question.previous_key = false;
                                    student_question.next_key = true;
                                    student_question.current_index = parent_key;
                                    student_question.next_index = parent_key + 1;
                                } else if (parent_key !== 0 && parent_key !== response.data.length - 1) {
                                    student_question.previous_key = true;
                                    student_question.next_key = true;
                                    student_question.current_index = null;
                                    student_question.previous_index = parent_key - 1;
                                    student_question.next_index = parent_key + 1;
                                } else if (parent_key == response.data.length - 1) {
                                    student_question.previous_key = true;
                                    student_question.next_key = false;
                                    student_question.submit_key = true;
                                    student_question.current_index = null;
                                    student_question.previous_index = parent_key - 1;
                                }
                                model.quizQuestionlists.push(student_question);
                            });
                        }
                        $scope.loader = false;
                    })
                    .catch(function (error) { })
                    .finally();
            }
        }

        //Question Slide Changes
        function question_slide_change(option, key) {
            if (option === 'submit') {
                AlertBox.confirm('Are you sure you want to submit?', function (isConfirmed) {
                    if (isConfirmed) {
                        $scope.is_required_valid = false;
                        angular.forEach(model.quizQuestionlists, function (assignment_data) {
                            if (assignment_data.answer['0'].answer1 !== null && assignment_data.answer['0'].answer1 !== undefined) {
                                $scope.is_required_valid = true;
                            }
                        });
                        if ($scope.is_required_valid === false) {
                            return false;
                        }
                        if (model.is_share_feedback_to_other_students === true) {
                            var datas = {
                                is_share_feedback_to_other_students: model.is_share_feedback_to_other_students
                            };
                            CourseUserAssignmentUpdate.update({
                                CourseUserAssignmentId: model.assignmentDetails.assignment_id
                            }, datas).$promise
                                .then(function (response) {
                                });
                        } else {
                            model.is_share_feedback_to_other_students = false;
                        }
                        angular.forEach(model.quizQuestionlists, function (assignment_data) {
                            var course_users_quiz_questions = {
                                "course_id": assignment_data.course_id,
                                "course_user_id": courseUserID,
                                "online_course_lesson_id": model.lessonId,
                                "quiz_question_id": assignment_data.id,
                                "course_user_assignment_id": model.assignmentDetails.assignment_id,
                                "answer": (assignment_data.answer['0'].answer1 !== null && assignment_data.answer['0'].answer1 !== undefined) ? assignment_data.answer['0'].answer1 : null,
                                "is_completed": 1
                            };
                            if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                                delete course_users_quiz_questions.course_user_id;
                            }
                            CourseUserQuestion.create(course_users_quiz_questions).$promise
                                .then(function (response) {
                                    succsMsg = $filter("translate")("Assignment submitted successfully.");
                                    flash.set(succsMsg, 'success', false);
                                    CourseUserAssignmentGet.get({
                                        'course_user_id': $state.params.learn,
                                        'online_course_lesson_id': $state.params.lesson,
                                        'is_completed': 1,
                                    }).$promise
                                        .then(function (response) {
                                            model.assignmentDetails.is_assignment_completed = true;
                                            model.assignmentDetails.datas = response.data['0'].course_users_quiz_questions;
                                            $scope.step_1 = false;
                                            $scope.step_2 = true;
                                            $scope.step_3 = false;
                                            $scope.step_4 = false;
                                        });
                                }, function (error) {
                                    flash.set("Oops, an unexpected error has occurred while submitting Assignment. Please try again later.", 'error', false);
                                });
                        });
                    }
                });
            } else {
                if (key === 'step_2') {
                    $scope[key] = true;
                    $scope.step_1 = false;
                    $scope.step_3 = false;
                    $scope.step_4 = false;
                }
                if (key === 'step_1') {
                    $scope[key] = true;
                    $scope.step_2 = false;
                    $scope.step_3 = false;
                    $scope.step_4 = false;
                }
                if (key === 'step_3') {
                    $scope[key] = true;
                    $scope.step_2 = false;
                    $scope.step_1 = false;
                    $scope.step_4 = false;
                    getMessages();
                }
                if (key === 'step_4') {
                    $scope[key] = true;
                    $scope.step_2 = false;
                    $scope.step_1 = false;
                    $scope.step_3 = false;
                }
            }
        }
        viewLesson(model.lessonId);
        //Showing The Error Mesaage
        $scope.hideError = function () {
            $scope.Incorrectoption = false;
        };

        function viewLesson(id) {
            params = {};
            params.id = id;
            model.lessonViewPostValues = {};
            OnlineCourseLessonsUpdate.get(params).$promise
                .then(function (response) {
                    angular.forEach(response.data['0'].attachments, function (assignment_data) {
                        if (assignment_data.class === 'AssignmentAnswerDownloadableFile') {
                            $scope.lesson_data.AssignmentAnswerDownloadableFile = assignment_data;
                        }
                        if (assignment_data.class === 'AssignmentInstructionDownloadableFile') {
                            $scope.lesson_data.AssignmentInstructionDownloadableFile = assignment_data;
                        }
                        if (assignment_data.class === 'AssignmentInstructionVideo') {
                            $scope.lesson_data.AssignmentInstructionVideo = assignment_data;
                        }
                        if (assignment_data.class === 'AssignmentAnswerVideo') {
                            $scope.lesson_data.AssignmentAnswerVideo = assignment_data;
                        }
                    });
                    $scope.lesson_data.lessonData = response.data['0'];
                });
        }
        //Quiz Try Again Function
        function QuestionTryAGain() {
            model.quizQuestionlists = [];
            getQuizQuestionAnswer();
            $scope.ShowAnswer = false;
        }
        //Calling the QuizQuestion function
        //Calling the QuizQuestion function
        if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
            getQuizQuestionAnswer();
        } else {
            coursePurchasedStatus();
        }
        $scope.openBrowseQuestiontab = function () {
            angular.element('#js-lesson').addClass('qa-questions-open');
        };
    });
    module.directive('assignmentStartPage', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Assignment/AssignmentStartPage.tpl.html',
            link: linker,
            controller: 'AssignmentStartController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
                lessonDetail: '@lessonDetail'
            }
        };
    });
    module.controller('AssignmentStartController', function ($rootScope, $scope, $filter, flash, CourseUserAssignment, CourseUserAssignmentUpdate, CourseUserAssignmentGet, $state) {
        var model = this;
        $scope.start_test = false;
        if (model.lessonId !== null && model.lessonId !== undefined) {
            if (model.lessonDetail !== undefined && model.lessonDetail !== null && model.lessonDetail !== '') {
                model.assignmentDetails = JSON.parse(model.lessonDetail);
            }
            $scope.startPracticeTest = function () {
                CourseUserAssignmentGet.get({
                    'course_user_id': $state.params.learn,
                    'online_course_lesson_id': $state.params.lesson,
                    'is_completed': 1,
                }).$promise
                    .then(function (response) {
                        if (response.data['0'] === undefined) {
                            var params = {
                                'course_user_id': $state.params.learn,
                                'online_course_lesson_id': $state.params.lesson,
                                'is_share_feedback_to_other_students': 0
                            };
                            CourseUserAssignment.create(params).$promise
                                .then(function (response) {
                                    if (angular.isDefined(response.data)) {
                                        if (response.data.id !== null && response.data.id !== undefined) {
                                            model.assignmentDetails.assignment_id = response.data.id;
                                            model.assignmentDetails.is_assignment_completed = false;
                                            $scope.start_test = true;
                                        }
                                    }
                                }, function (error) { });
                        } else {
                            model.assignmentDetails.assignment_id = response.data['0'].id;
                            model.assignmentDetails.is_assignment_completed = true;
                            model.assignmentDetails.datas = response.data['0'].course_users_quiz_questions;
                            $scope.start_test = true;
                            model.is_share_feedback_to_other_students = response.data['0'].course_users_quiz_questions;
                        }
                    });
            };
        }
    });

    /*Intrcutor Questions controller*/
    module.controller('AssignmentInstructor', function ($state, $rootScope, $scope, $filter, TokenServiceData, CourseAnnoucementMessage, AssignmentFilter, $location, $timeout, Teaching, MessageFactory, CourseBatchMessage, flash, AlertBox) {
        $rootScope.pageTitle = $filter("translate")("Assignment")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.loader = true;
        $scope.messagesort = {};
        $scope._metadata = {};
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'assignment_feedback';
        model.QuestionReplyFormSubmit = QuestionReplyFormSubmit;
        model.QuestionEditFormSubmit = QuestionEditFormSubmit;
        // model.MessageUpdate = MessageUpdate;
        model.QuestionDeleteFormSubmit = QuestionDeleteFormSubmit;

        function getCoursesforum(element) {
            model.loading = true;
            params = {};
            $scope.messagesort.sortby = $state.params.ordering;
            $scope.messagesort.filter = $state.params.filter;
            $scope.ordering = $state.params.ordering;
            $scope.filter = $state.params.filter;
            if ($scope.messagesort.sortby === 'created') {
                params.sort = 'id';
                params.sort_by = 'DESC';
            }
            if ($scope.messagesort.sortby === '-created') {
                params.sort = 'id';
                params.sort_by = 'ASC';
            }
            if ($scope.messagesort.sortby === 'Popularity') {
                params.sort = 'course_status_name';
                params.sort_by = 'ASC';
            }
            if ($state.params.unanswered === '1') {
                params.no_top_answer = 1;
                $scope.messagesort.no_top_answer = 1;
                params.sort_by = 'ASC';
            }
            if ($scope.filter === 'all' || $scope.filter === 'no_feedback' || $scope.filter === 'student_only' || $scope.filter === 'instructor_only' || $scope.filter === 'student_and_instructor') {
                params.filter = $scope.filter;
            }

            $timeout(function () {
                if (model.teachingCourses !== null && model.teachingCourses !== undefined && $state.params.course_id !== undefined) {
                    if (parseInt($state.params.course_id) === -1) {
                        params.course_id = null;
                        $scope.course_filter = false;
                    } else {
                        params.course_id = model.teachingCourses[$state.params.course_id].id;
                        $scope.course_filter = model.teachingCourses[$state.params.course_id];
                    }
                }
                params.type = 'AssignmentFeedback';
                params.class = 'AssignmentFeedback';
                params.page = model.currentPage;
                AssignmentFilter.get(params).$promise.then(function (response) {
                    model.Assignment_feedbacks = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    angular.forEach(model.Assignment_feedbacks, function (Assignment_feedback) {
                        angular.forEach(Assignment_feedback.course_users_quiz_questions, function (Assignment_question) {
                            if (Assignment_question.quiz_questions.length > 0) {
                                Assignment_question.question = Assignment_question.quiz_questions[0].question;
                            }
                            if (Assignment_feedback.messages !== null && Assignment_feedback.messages !== undefined) {
                                if (Assignment_feedback.messages.length > 0) {
                                    Assignment_feedback.messages = $filter('CountryTimezone')(Assignment_feedback.messages, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                                    angular.forEach(Assignment_feedback.messages, function (message) {
                                        angular.forEach(message.other_user, function (other_user) {
                                            message.other_user = other_user.username;
                                            message.other_user_image = other_user.image_hash;
                                        });
                                        angular.forEach(message.user, function (user) {
                                            message.user = user.username;
                                            message.user_image = user.image_hash;
                                        });
                                        message.editable = false;
                                        if (message.is_sender === true && (parseInt(message.user_id) === parseInt($rootScope.auth.id))) {
                                            message.editable = true;
                                        }
                                        if (message.is_sender === false && (parseInt(message.other_user_id) === parseInt($rootScope.auth.id))) {
                                            message.editable = true;
                                        }
                                        if (message.children !== null) {
                                            if (message.children.length > 0) {
                                                message.children = $filter('CountryTimezone')(message.children, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                                                angular.forEach(message.children, function (child_message) {
                                                    child_message.edit_message = child_message.message;
                                                    child_message.editable = false;
                                                    if (child_message.is_sender === true && (parseInt(child_message.user_id) === parseInt($rootScope.auth.id))) {
                                                        child_message.editable = true;
                                                    }
                                                    if (child_message.is_sender === false && (parseInt(child_message.other_user_id) === parseInt($rootScope.auth.id))) {
                                                        child_message.editable = true;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }

                        });
                    });
                    $scope._metadata = response._metadata;
                    model.currentPage = $scope._metadata.currentPage;
                    model.loader = false;
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 2000, 'swing', false);
                    }
                });
            }, 100);

        }
        $scope.index = function (element) {
            model.currentPage = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            getCoursesforum(element);
        };
        $scope.CourseFilter = function (index, type) {
            if (type !== 'All') {
                $scope.course_filter = model.teachingCourses[index];
                $location
                    .search('course_id', index);
                $timeout(function () {
                    getCoursesforum(null);
                }, 1000);
            } else {
                $scope.course_filter = false;
                $location
                    .search('course_id', -1);
                $timeout(function () {
                    getCoursesforum(null);
                }, 1000);
            }

        };
        $scope.Sort = function (type, a) {
            model.currentPage = 1;
            if (type === 'sort') {
                if (a !== undefined && a !== null) {
                    $scope.messagesort.sortby = a;
                }
            } else if (type === 'filter') {
                if (a !== undefined && a !== null) {
                    $scope.messagesort.filter = a;
                }
            }
            $location
                .search('ordering', $scope.messagesort.sortby)
                .search('filter', $scope.messagesort.filter);
            $timeout(function () {
                getCoursesforum(null);
            }, 1000);
        };

        function QuestionEditFormSubmit(form, type, parent_index, child_index) {
            if (form.$valid) {

                var params = {};
                if (type !== 'Parent') {
                    params = {
                        "id": model.Assignment_feedbacks[parent_index].messages[0].children[child_index].id,
                        "message": model.Assignment_feedbacks[parent_index].messages[0].children[child_index].edit_message,
                    };
                } else {
                    params = {
                        "id": model.Assignment_feedbacks[parent_index].messages[0].id,
                        "message": model.Assignment_feedbacks[parent_index].messages[0].edit_message,
                    };
                }
                MessageFactory.update(params).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            form.$setPristine();
                            form.$setUntouched();
                            if (type !== 'Parent') {
                                model.Assignment_feedbacks[parent_index].messages[0].children[child_index].message = model.Assignment_feedbacks[parent_index].messages[0].children[child_index].edit_message;
                                model.Assignment_feedbacks[parent_index].messages[0].children[child_index].editForm = false;
                            } else {
                                model.Assignment_feedbacks[parent_index].messages[0].message = model.Assignment_feedbacks[parent_index].messages[0].edit_message;
                                model.Assignment_feedbacks[parent_index].messages[0].editForm = false;
                            }

                            flashMessage = $filter("translate")("Answer has been Updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        }
                    }, function (error) {
                        flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating Assignment answer. Please try again later.");
                        flash.set(flashMessage, 'error', false);

                    });
            }

        }

        function QuestionDeleteFormSubmit(type, parent_index, child_index) {
            AlertBox.confirm('Are you sure you want to delete?', function (isConfirmed) {
                if (isConfirmed) {
                    var params = {};
                    params.id = (type === 'Parent') ? model.Assignment_feedbacks[parent_index].messages[0].id : model.Assignment_feedbacks[parent_index].messages[0].children[child_index].id;
                    MessageFactory.remove(params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                if (type === 'Parent') {
                                    model.Assignment_feedbacks[parent_index].messages.splice(0, 1);
                                } else {
                                    model.Assignment_feedbacks[parent_index].messages[0].children.splice(child_index, 1);
                                }
                                flashMessage = $filter("translate")("Answer has been deleted successfully.");
                                flash.set(flashMessage, 'success', false);
                            } else {
                                flashMessage = $filter("translate")("Unable to delete the answer. Please try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }, function (error) {
                            flashMessage = $filter("translate")("Unable to delete the answer. Please try again later.");
                            flash.set(flashMessage, 'error', false);
                        });
                }
            });

        }

        function QuestionReplyFormSubmit($valid, form, index) {
            if ($valid) {
                model.reply_Message = {};
                if (model.Assignment_feedbacks[index].messages !== null && model.Assignment_feedbacks[index].messages !== undefined) {
                    if (model.Assignment_feedbacks[index].messages.length > 0) {
                        model.reply_Message.parent_id = model.Assignment_feedbacks[index].messages[0].id;
                    } else {
                        model.reply_Message.parent_id = 0;
                    }
                } else {
                    model.reply_Message.parent_id = 0;
                }
                model.reply_Message.class = 'AssignmentFeedback';
                model.reply_Message.foreign_id = model.Assignment_feedbacks[index].id;
                model.reply_Message.message = model.Assignment_feedbacks[index].reply_message;
                model.reply_Message.user_id = [];
                model.reply_Message.user_id.push({
                    'user_id': model.Assignment_feedbacks[index].user_id
                });
                CourseBatchMessage.create(model.reply_Message, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Replied successfully.");
                        flash.set(flashMessage, 'success', false);
                        getCoursesforum(null);
                        model.Assignment_feedbacks[index].reply_message = ' ';
                        form.$setPristine();
                        form.$setUntouched();
                    } else {
                        flashMessage = $filter("translate")("Unable to send a reply. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Unable to send a reply. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                });
            }
        }  /**GETTING THE COURSES OF INSTRUCTOR */
        function getInstructorCourses() {
            var params = {};
            params.id = $rootScope.auth.id;
            params.limit = 'all';
            params.filter = 'all';
            Teaching.get(params).$promise.then(function (response) {
                model.teachingCourses = response.data;
            });
        }
        getInstructorCourses();
        $scope.index(null);
        $scope.paginate = function (element) {
            model.currentPage = parseInt(model.currentPage);
            $scope.index(element);
        };
        $scope.goToState = function (state, params) {
            $state.go(state, params);
        };
    });
})(angular.module('ace.Assignment'));

(function (module) {
    module.factory('AssignmentFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('AssignmentGet', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages', {
                id: '@id'
            }, {
                create: {
                    method: 'GET'
                }
            }
        );
    });
    module.factory('AssignmentFeedbackDelete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages/:messageId', {
                messageId: '@id'
            }, {
                remove: {
                    method: 'DELETE'
                }
            }
        );
    });
    module.factory('AssignmentFeedbackUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('AddCourseQuiz', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/quizzes', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('CourseUserAssignment', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_assignments', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('CourseUserAssignmentGet', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_assignments', {
                id: '@id'
            }, {
                create: {
                    method: 'GET'
                }
            }
        );
    });
    module.factory('AssignmentFilter', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/assignments', {
                id: '@id'
            }, {
                create: {
                    method: 'GET'
                }
            }
        );
    });
    module.factory('CourseUserAssignmentUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_assignments/:CourseUserAssignmentId', {
                CourseUserAssignmentId: '@CourseUserAssignmentId'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('AddCourseQuizQuestion', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/quiz_questions', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('OnlineCourseLessonsQuizUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/quizzes/:quizId', {
                quizId: '@quizId'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseQuizQuestion', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/quiz_questions/:quizQuestionId', {
                quizQuestionId: '@quizQuestionId'
            }, {
                'update': {
                    method: 'PUT'
                }
            }, {
                'remove': {
                    method: 'DELETE'
                }
            }
        );
    });

    module.factory('addOnlineCourseLessons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseUserQuestion', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users_quiz_questions', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('GetCourseUserEntry', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:course_id/users/:user_id/course_users', {
                course_id: '@course_id',
                user_id: '@user_id'
            }
        );
    });
    module.factory('OnlineCourseLessonsUpdate', ['$resource', 'GENERAL_CONFIG', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    }]);
})(angular.module('ace.Assignment'));
