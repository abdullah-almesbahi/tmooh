/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {


} (angular.module('ace.practicetest', [
    'ui.router',
    'ngResource'
])));

(function (module) {
    module.directive('practicetestLessonsForm', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/PracticeTest/PracticeLessonsForm.tpl.html',
            link: linker,
            controller: 'practiceLessonsFormController as model',
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
    module.controller('practiceLessonsFormController', function ($rootScope, $scope, AddCourseQuiz, $filter, flash, OnlineCourseLessonsQuizUpdate, addOnlineCourseLessons, anchorSmoothScroll, $timeout, CreateOnlineCourseLesson) {
        var model = this;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        $scope.action = model.action;

        $scope.lessonID = model.lessonId;
        $scope.showForm = false;
        $scope.editForm = false;
        if ($scope.action === 'edit') {
            var quizform = {};
            quizform.editForm = true;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform
            });
            getLessonUpdate();
        }
        $rootScope.$on('updatePraticeForm', function (event, args) {
            $rootScope.PraticeForm = {};
            $rootScope.PraticeForm.showForm = args.QuizForm.showForm;
            $rootScope.PraticeForm.editForm = args.QuizForm.editForm;
            $rootScope.PraticeForm.questionshowForm = args.QuizForm.QuizForm;
            $rootScope.PraticeForm.questionshowForm = args.QuizForm.questionshowForm;
            $rootScope.PraticeForm.questionlistForm = args.QuizForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var quizform = {};
            model.AddOnlineQuiz = {};
            model.AddOnlineQuiz.is_randomize_question_answer_order = false;
            quizform.showForm = true;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform
            });
        };
        $scope.hideForm = function (e) {
            e.preventDefault();
            var quizform = {};
            quizform.showForm = false;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform
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
                        succsMsg = $filter("translate")("Quiz lesson has been updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        var quizform = {};
                        quizform.editForm = false;
                        $rootScope.$emit('updatePraticeForm', {
                            QuizForm: quizform
                        });
                        model.updateparent(); /*Calling online lessons func.*/
                        UpdateCourseStatus(); /*Calling course update func.*/
                    }
                    model.QuizEditButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while updating Quiz lesson. Try again later.");
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
                    $scope.addPractice($valid);
                }
            }

        }
        $scope.addPractice = function ($valid) {
            if ($valid) {
                model.QuizSaveButton = true;
                model.AddOnlineQuiz.course_id = model.course;
                model.AddOnlineQuiz.is_practice_test = true;
                model.AddOnlineQuiz.is_lesson_ready = 0;
                model.AddOnlineQuiz.is_chapter = 0;
                CreateOnlineCourseLesson.create(model.AddOnlineQuiz, function (response) {
                    if (response.data) {
                        flashMessage = $filter("translate")("Pratice test lesson has been added successfully.");
                        flash.set(flashMessage, 'success', false);
                        var quizform = {};
                        quizform.showForm = false;
                        $rootScope.$emit('updatePraticeForm', {
                            QuizForm: quizform
                        });
                        model.AddOnlineQuiz = {};
                        model.updateparent();
                        UpdateCourseStatus();
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    model.QuizSaveButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while adding Pratice test lesson. Try again later.");
                    flash.set(flashMessage, 'error', false);
                    model.QuizSaveButton = false;
                });
            }

        };

        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            CreateOnlineCourseLesson.create(lessondetails, function (response) {
                if (response.data) {
                    if (lessons.length > 0) {
                        addLessonDetail(lessons);
                    } else {
                        $scope.addPractice(true);
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
    module.directive('praticeQuestionAnswer', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/PracticeTest/AddPracticeQuestionAnswerForm.tpl.html',
            link: linker,
            controller: 'AddPraticeQuestionAnswerFormController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                quizAction: '@quizAction',
                lessonId: '@lessonId',
                updateparent: '&',
                index: '@index'
            }
        };
    });
    module.controller('AddPraticeQuestionAnswerFormController', function (Course, $scope, addOnlineCourseLessons, OnlineCourseLessons, OnlineCourseLessonsUpdate, $filter, flash, $rootScope, AddCourseQuizQuestion, CourseQuizQuestion, OnlineCourseLessonsQuizUpdate) {
        var model = this;
        model.quizAnswer = {};
        $scope.action = model.action;
        $scope.Quizaction = model.quizAction;
        $scope.lessonID = model.lessonId;
        model.quizAnswer.online_course_lesson_id = model.lessonId;
        model.quizAnswer.course_id = model.course;
        model.quizAnswer.type = $scope.Quizaction;
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
            var quizform = {};
            quizform.questionlistForm = true;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
            GetQuizlessionQuestionsList();
        };
        $rootScope.$on('updatePraticeForm', function (event, args) {
            $rootScope.PraticeForm = {};
            $rootScope.PraticeForm.course_id = args.course_id;
            $rootScope.PraticeForm.lesson_id = args.lesson_id;
            $rootScope.PraticeForm.showForm = args.QuizForm.showForm;
            $rootScope.PraticeForm.editForm = args.QuizForm.editForm;
            $rootScope.PraticeForm.questionshowForm = args.QuizForm.questionshowForm;
            $rootScope.PraticeForm.questioneditForm = args.QuizForm.questioneditForm;
            $rootScope.PraticeForm.questionlistForm = args.QuizForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var quizform = {};
            quizform.questionshowForm = true;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
        };

        $scope.hideForm = function (e) {
            e.preventDefault();
            var quizform = {};
            quizform.questionshowForm = false;
            $rootScope.$emit('updatePraticeForm', {
                QuizForm: quizform,
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
                    var quizform = {};
                    quizform.questioneditForm = true;
                    $rootScope.$emit('updatePraticeForm', {
                        QuizForm: quizform
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
                succsMsg = $filter("translate")("Sorry minimum 2 option is needed.");
                flash.set(succsMsg, 'error', false);
            }
        }
        //Edit Quiz Question and Answer submit
        $scope.editQuizAnswer = function ($valid) {
            if ($valid) {
                $scope.disableButton = true;
                var params = {
                    "course_id": $scope.quizQuestion_editValue.course_id,
                    "online_course_lesson_id": $scope.quizQuestion_editValue.online_course_lesson_id,
                    "related_chapter_id": 0,
                    "question": $scope.quizQuestion_editValue.question,
                    "quiz_question_answers": []
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
                            succsMsg = $filter("translate")("Quiz Question and Answers updated successfully.");
                            flash.set(succsMsg, 'success', false);
                            UpdateCourseStatus();
                        }
                    })
                    .catch(function (error) {
                        flash.set("Error occurred while updating Quiz question.", 'error', false);
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
            if (!model.answerChoosen) {
                model.Show_error = true;
            } else {
                if ($valid) {
                    model.QuestionAddButton = true;
                    model.quizAnswer.related_chapter_id = 0;
                    AddCourseQuizQuestion.create(model.quizAnswer).$promise
                        .then(function (response) {
                            LessonReadyUpdate(1);
                            $scope.showForm = false;
                            $scope.disableButton = false;
                            if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                                succsMsg = $filter("translate")("Quiz Question has been added  successfully.");
                                flash.set(succsMsg, 'success', false);
                                model.QuestionAddButton = false;
                                UpdateCourseStatus();
                            }
                        })
                        .catch(function (error) {
                            model.QuestionAddButton = false;
                            flash.set("Error occurred while adding Quiz question.", 'error', false);
                        })
                        .finally();
                }
            }


        };

        function QuizAnswerfield() {
            model.quizAnswer.quiz_question_answers = [];
            for (i = 1; i <= 3; i++) {
                model.quizAnswer.quiz_question_answers.push({
                    "answer": null,
                    "feedback": null,
                    "is_answer": 0
                });
            }
        }

        function DeleteQuizAnswerfield(e, index) {
            e.preventDefault();
            if (model.quizAnswer.quiz_question_answers.length > 2) {
                model.quizAnswer.quiz_question_answers.splice(index, 1);
            } else {
                succsMsg = $filter("translate")("Minimum two option is needed from each Quiz Questions");
                flash.set(succsMsg, 'info', false);
            }

        }
        function LessonReadyUpdate(value) {
            var params = {};
            params.is_lesson_ready = value;
            params.id = $scope.lessonID;
            OnlineCourseLessonsUpdate.update(params, function (response) {
                model.updateparent();
            });

        }
        function AddQuizAnswerfield(e) {
            e.preventDefault();
            model.quizAnswer.quiz_question_answers.push({
                "answer": null,
                "feedback": null,
                "is_answer": 0
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
    module.directive('practiceExerciseLearner', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/PracticeTest/PracticeExerciseLearner.tpl.html',
            link: linker,
            controller: 'PraticeExerciseLearnerController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
                lessonDetail: '@lessonDetail',
                updateparent: '&',
            }
        };
    });

    module.controller('PraticeExerciseLearnerController', function ($rootScope, $scope, $filter, flash, AddCourseQuizQuestion, CourseUserQuestion, GetCourseUserEntry, $timeout, $uibModal, $uibModalStack, CourseUserPraticeTestFactory, CourseUserPraticeTests, Fullscreen, $state) {
        var model = this;
        $scope.loader = true;
        model.question_slide_change = question_slide_change;
        $scope.ShowAnswer = false;
        model.QuestionTryAGain = QuestionTryAGain;
        model.MarkAsReview = MarkAsReview;
        model.timerFinishTest = timerFinishTest;
        model.FinishTest = FinishTest;
        model.pratice_test_navbar = false;
        model.RevieQuestionFilter = RevieQuestionFilter;
        model.closeQuestionTab = closeQuestionTab;
        model.openQuestionTab = openQuestionTab;
        model.openQuestion = openQuestion;
        model.QuestionFilter = QuestionFilter;
        $scope.timerRunning = true;
        //Getting the Quiz and Answer 
        model.quizQuestionlists = [];
        var courseUserID = '';
        //Checking the status
        $scope.deadlineMillis = 0;
        $scope.timerRunning = true;

        $scope.startTimer = function (deadline) {
            $scope.$broadcast('timer-start');
            $scope.timerRunning = true;
        };

        $scope.stopTimer = function () {
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/PracticeTest/PracticeTimerResumeTest.tpl.html',
                size: 'sm',
                backdrop: 'static',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });

        };
        $scope.resumeTimer = function () {
            $scope.$broadcast('timer-resume');
            $scope.timerRunning = true;
        };
        $scope.$on('timer-tick', function (event, data) {
            $scope.current_exam_time = data;
            if ($scope.current_exam_time.timeoutId !== null && $scope.current_exam_time.days === 0 && $scope.current_exam_time.hours === 0 && $scope.current_exam_time.minutes === 0 && $scope.current_exam_time.seconds === 0) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'src/plugins/PracticeTest/PraticeTestTimout.tpl.html',
                    size: 'sm',
                    backdrop: 'static',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        }
                    }
                });
            }
            if ($scope.timerRunning && data.millis >= $scope.deadlineMillis) {
                $scope.$apply($scope.timeOver);
            }
        });
        if (model.lessonId !== null && model.lessonId !== undefined) {
            if (model.lessonDetail !== undefined && model.lessonDetail !== null && model.lessonDetail !== '') {
                model.praticeTestDetails = JSON.parse(model.lessonDetail);
                var Today = new Date();
                model.endTime = Today.setMinutes(Today.getMinutes() + parseInt(model.praticeTestDetails.allowed_duration));
                $timeout(function () {
                    $scope.startTimer();
                }, 1000);

            }

        }

        function coursePurchasedStatus() {
            userID = $rootScope.auth ? $rootScope.auth.id : '';
            var params = {};
            params.course_id = courseID;
            params.user_id = userID;
            if (userID) {
                GetCourseUserEntry.get(params).$promise
                    .then(function (response) {
                        if (angular.isDefined(response.data.length > 0)) {
                            if ($state.params.learn !== undefined && $state.params.learn !== null) {
                                courseUserID = $state.params.learn;
                                getQuizQuestionAnswer();
                            }
                        }
                    });
            }
        }

        function getQuizQuestionAnswer() {
            if (model.lessonId !== null && model.lessonId !== undefined) {
                model.quizQuestionlists = [];
                var params = {};
                params.online_course_lesson_id = model.lessonId;
                params.course_id = model.course;
                AddCourseQuizQuestion.get(params).$promise
                    .then(function (response) {
                        $scope.Question_Percentage = 0;
                        if (response.data.length == 1) {
                            model.Question_Percentage = 100;
                            angular.forEach(response.data, function (student_question, parent_key) {
                                student_question.student_answer = undefined;
                                student_question.tmp_student_answer = {};
                                student_question.Number = parent_key + 1;
                                model.question_number = 1;
                                if (parent_key === 0) {
                                    student_question.is_mark_review = 'false';
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
                            model.Split_percentage = 100 / response.data.length;
                            model.Question_Percentage = model.Split_percentage;
                            var last_percentage = 0;
                            angular.forEach(response.data, function (student_question, parent_key) {
                                student_question.student_answer = undefined;
                                student_question.question_enable = false;
                                student_question.is_mark_review = 'false';
                                student_question.tmp_student_answer = {};
                                student_question.Number = parent_key + 1;
                                last_percentage += model.Split_percentage;
                                student_question.tab_percentage = last_percentage;
                                if (parent_key === 0) {
                                    student_question.previous_key = false;
                                    student_question.next_key = true;
                                    student_question.current_index = parent_key;
                                    student_question.next_index = parent_key + 1;
                                    model.question_number = 1;
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
            //previous question triggering 
            if (option === 'prev') {
                if (key !== null) {
                    model.question_number = model.quizQuestionlists[model.quizQuestionlists[key].previous_index].Number;
                    model.Question_Percentage = (model.Question_Percentage - model.Split_percentage);
                    model.quizQuestionlists[key].current_index = null;
                    var previous_index = model.quizQuestionlists[key].previous_index;
                    model.quizQuestionlists[previous_index].current_index = model.quizQuestionlists[key].previous_index;
                }
                //next  question triggering 
            } else if (option === 'next' || option === 'skip') {
                if (key !== null) {
                    model.question_number = model.quizQuestionlists[model.quizQuestionlists[key].next_index].Number;
                    model.Question_Percentage = (model.Question_Percentage + model.Split_percentage);
                    angular.forEach(model.quizQuestionlists[key].answer, function (answer) {
                        if (answer.is_answer) {
                            correct_answer = answer.id;
                        }
                    });
                    model.quizQuestionlists[key].is_skipped = (option === 'next') ? 'false' : 'true';
                    model.quizQuestionlists[key].question_enable = true;
                    model.quizQuestionlists[key].current_index = null;
                    var next_index = model.quizQuestionlists[key].next_index;
                    model.quizQuestionlists[next_index].current_index = model.quizQuestionlists[key].next_index;
                    var course_users_quiz_questions = {
                        "course_id": model.quizQuestionlists[key].course_id,
                        "course_user_id": courseUserID,
                        "online_course_lesson_id": model.lessonId,
                        "quiz_question_id": model.quizQuestionlists[key].id,
                        "course_user_practice_test_id": model.praticeTestDetails.pratice_test_id,
                        "answer": (model.quizQuestionlists[key].student_answer !== null && model.quizQuestionlists[key].student_answer !== undefined) ? model.quizQuestionlists[key].student_answer : null,
                        "is_skipped": (option === 'next') ? 'false' : 'true'
                    };
                    if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                        delete course_users_quiz_questions.course_user_id;
                    }
                    console.log(course_users_quiz_questions);
                    CourseUserQuestion.create(course_users_quiz_questions).$promise
                        .then(function (response) { }, function (error) { });
                }


            } //Finding the correct answer and showing the correct/incorrect answer
            else if (option === 'submit') {
                model.CorrectQuestions = [];
                model.WrongQuestions = [];
                angular.forEach(model.quizQuestionlists, function (student_question, parent_key) {
                    angular.forEach(student_question.answer, function (student_answer, i) {
                        if (student_answer.is_answer === true) {
                            if (student_answer.id == student_question.student_answer) {
                                student_question.Student_Answered = true;
                                model.CorrectQuestions.push(student_question);
                            } else {
                                student_question.Student_Answered = false;
                                model.WrongQuestions.push(student_question);

                            }
                        }
                    });
                    $scope.ShowAnswer = true;
                });
            }
        }

        /*Formatting the answer for 'multi-select' options*/
        $scope.AnswerChoose = function (index) {
            model.quizQuestionlists[index].is_skipped = 'false';
            if (model.quizQuestionlists[index].type === 'multi-select') {
                var temp_var = $scope.getChecked(model.quizQuestionlists[index].tmp_student_answer);
                model.quizQuestionlists[index].student_answer = (temp_var.length !== 0) ? temp_var.join() : null;
            }
        };
        /*Mark as review of the question and Updating the back end */
        function MarkAsReview(key, type) {
            var course_users_quiz_questions_details = {
                "is_marked_for_review": (type === 'mark') ? 'true' : 'false',
                "course_id": model.quizQuestionlists[key].course_id,
                "course_user_id": courseUserID,
                "online_course_lesson_id": model.lessonId,
                "quiz_question_id": model.quizQuestionlists[key].id,
                "course_user_practice_test_id": model.praticeTestDetails.pratice_test_id,
            };
            if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                delete course_users_quiz_questions_details.course_user_id;
            }
            CourseUserQuestion.create(course_users_quiz_questions_details).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (angular.isDefined(response.data.id)) {
                            model.quizQuestionlists[key].is_mark_review = (type === 'mark') ? 'true' : 'false';
                            model.quizQuestionlists[key].course_user_id = response.data.id;
                        }
                    }
                }, function (error) { });
        }
        /*Final Finish function*/
        function FinishTest() {
            angular.element('#js-lesson-detail').removeClass('lesson_details');
            angular.element('#js-lesson-detail').addClass('lesson_details1 container');
            $uibModalStack.dismissAll();
            var hour_sec, min_sec, sec, day_sec, Total_Time_taken;
            if ($scope.current_exam_time !== null && $scope.current_exam_time !== undefined) {
                hour_sec = ($scope.current_exam_time.hours * 3600);
                min_sec = ($scope.current_exam_time.minutes * 60);
                sec = $scope.current_exam_time.seconds;
                day_sec = ($scope.current_exam_time.days * 86400);
                Total_Time_taken = ((model.praticeTestDetails.allowed_duration * 60) - (hour_sec + min_sec + sec + day_sec));
            }
            var params = {};
            params.id = model.praticeTestDetails.pratice_test_id;
            params.taken_time = Total_Time_taken;
            params.is_completed = true;
            CourseUserPraticeTestFactory.update(params, function (reponse) {
                if (reponse.error.code === 0) {
                    CourseUserPraticeTests.get({ 'online_course_lesson_id': model.lessonId, 'course_user_id': courseUserID, 'user_id': $rootScope.auth.id, 'is_completed': 1, 'limit': 'all', 'sort': 'id', 'sort_by': 'DESC' }, function (response) {
                        model.pratice_test_attempts = $filter('CountryTimezone')(response.data, ['start_date'], 'TimeZoneSet', 'dd MMM yyyy  hh:mm a');
                        angular.forEach(model.pratice_test_attempts, function (practice_test, key) {
                            if (parseInt(key) === 0) {
                                practice_test.expand = true;
                            }
                            practice_test.serial_no = key + 1;
                            practice_test.duration = secondsToTime(practice_test.taken_time);
                            var splitpercentage = 100 / parseInt(practice_test.quiz_question_count);
                            practice_test.skipped_percentage = $filter('number')((splitpercentage * parseInt(practice_test.skipped_count)), 2);
                            practice_test.correct_percentage = $filter('number')((splitpercentage * parseInt(practice_test.total_correct_answer_count)), 2);
                            practice_test.wrong_percentage = (100 - (parseFloat(practice_test.skipped_percentage) + parseFloat(practice_test.correct_percentage)));
                            practice_test.praticetest_highchart_data = [{
                                name: "Skipped",
                                y: parseFloat(practice_test.skipped_percentage),
                            }, {
                                    name: "correct",
                                    y: parseFloat(practice_test.correct_percentage),
                                }, {
                                    name: "wrong",
                                    y: parseFloat(practice_test.wrong_percentage),
                                }];
                        });
                        model.Show_pratice_test = true;
                    });
                }
            });
        }

        /*Checking the Skipped and mark as Review fucntion */
        $scope.FinishExam = function (key) {
            if (key !== null) {
                model.Question_Percentage = (model.Question_Percentage + model.Split_percentage);
                angular.forEach(model.quizQuestionlists[key].answer, function (answer) {
                    if (answer.is_answer) {
                        correct_answer = answer.id;
                    }
                });
                model.quizQuestionlists[key].is_skipped = (model.quizQuestionlists[key].student_answer !== null && model.quizQuestionlists[key].student_answer !== undefined) ? 'false' : 'true';
                var course_users_quiz_questions = {
                    "course_id": model.quizQuestionlists[key].course_id,
                    "course_user_id": courseUserID,
                    "online_course_lesson_id": model.lessonId,
                    "quiz_question_id": model.quizQuestionlists[key].id,
                    "course_user_practice_test_id": model.praticeTestDetails.pratice_test_id,
                    "answer": (model.quizQuestionlists[key].student_answer !== null && model.quizQuestionlists[key].student_answer !== undefined) ? model.quizQuestionlists[key].student_answer : null,
                    "is_skipped": (model.quizQuestionlists[key].student_answer !== null && model.quizQuestionlists[key].student_answer !== undefined) ? 'false' : 'true'
                };
                if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                    delete course_users_quiz_questions.course_user_id;
                }
                CourseUserQuestion.create(course_users_quiz_questions).$promise
                    .then(function (response) { }, function (error) { });
            }
            model.skipped_count = 0;
            angular.forEach(model.quizQuestionlists, function (quizQuestion) {
                if (quizQuestion.is_skipped == 'true') {
                    model.skipped_count = model.skipped_count + 1;
                }
            });
            var template_name = (model.skipped_count > 0) ? 'PracticeSkipped.tpl.html' : 'PracticeReview.tpl.html';
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/PracticeTest/' + template_name,
                size: 'sm',
                backdrop: 'static',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        };
        /*Showing the Review Questions Detailed*/
        $scope.reviewedQuestions = function (practice_test) {
            $scope.Review_questions = practice_test;
            $scope.Review_questions.questions = [];
            model.tmp_reviewed_questions = [];
            angular.forEach(practice_test.course_users_quiz_questions, function (course_user_quiz) {
                var obj = {
                    'question': course_user_quiz.quiz_questions[0].question,
                    'is_skipped': course_user_quiz.is_skipped,
                    'is_marked_for_review': course_user_quiz.is_marked_for_review,
                    'answer': [],
                    'type': course_user_quiz.quiz_questions[0].type,
                    'is_correct': false
                };
                var course_user_correct_answer;
                var originalcorrect_answer = $filter('filter')(course_user_quiz.quiz_questions[0].answer, { 'is_answer': true });
                if (course_user_quiz.is_skipped === false) {
                    course_user_correct_answer = course_user_quiz.answer.split(',');
                } else {
                    course_user_correct_answer = [];
                }
                if (course_user_quiz.is_skipped === false) {
                    if (originalcorrect_answer.length === course_user_correct_answer.length) {
                        var correct_answers = $scope.compareArrays(originalcorrect_answer, course_user_correct_answer);
                        if (correct_answers.length === originalcorrect_answer.length) {
                            obj.is_correct = true;
                        } else {
                            obj.is_correct = false;
                        }
                    } else {
                        obj.is_correct = false;
                    }
                }
                angular.forEach(course_user_quiz.quiz_questions[0].answer, function (quiz_answer) {
                    if (course_user_quiz.is_skipped === true) {
                        obj.answer.push({
                            'id': quiz_answer.id,
                            'answer': quiz_answer.answer,
                            'user_choosed_answer': false,
                            'original_answer': quiz_answer.is_answer

                        });
                    } else if (course_user_quiz.is_skipped === false) {
                        angular.forEach(course_user_correct_answer, function (course_user_answer_id) {
                            var answerAlreadyExists = obj.answer.filter(function (answer) {
                                return (quiz_answer.id == answer.id);
                            });
                            if (answerAlreadyExists.length === 0) {
                                if (parseInt(course_user_answer_id) === parseInt(quiz_answer.id)) {
                                    obj.answer.push({
                                        'id': quiz_answer.id,
                                        'answer': quiz_answer.answer,
                                        'user_choosed_answer': true,
                                        'original_answer': quiz_answer.is_answer
                                    });
                                } else {
                                    var LearnerAnswerExists = course_user_correct_answer.filter(function (correct_answer) {
                                        return (quiz_answer.id == correct_answer);
                                    });
                                    if (LearnerAnswerExists.length === 0) {
                                        obj.answer.push({
                                            'id': quiz_answer.id,
                                            'answer': quiz_answer.answer,
                                            'user_choosed_answer': false,
                                            'original_answer': quiz_answer.is_answer
                                        });
                                    }
                                }
                            }

                        });
                    }
                });
                $scope.Review_questions.questions.push(obj);
                model.tmp_reviewed_questions.push(obj);
            });
            $scope.ReviewDetails = true;
        };

        function inti23() {
            CourseUserPraticeTests.get({ 'online_course_lesson_id': model.lessonId, 'course_user_id': courseUserID, 'user_id': $rootScope.auth.id, 'is_completed': 1, 'limit': 'all' }, function (response) {
                model.pratice_test_attempts = $filter('CountryTimezone')(response.data, ['start_date'], 'TimeZoneSet', 'dd MMM yyyy  hh:mm a');
                angular.forEach(model.pratice_test_attempts, function (practice_test, key) {
                    practice_test.serial_no = key + 1;
                    practice_test.duration = secondsToTime(practice_test.taken_time);
                    var splitpercentage = 100 / parseInt(practice_test.quiz_question_count);
                    practice_test.skipped_percentage = $filter('number')((splitpercentage * parseInt(practice_test.skipped_count)), 2);
                    practice_test.correct_percentage = $filter('number')((splitpercentage * parseInt(practice_test.total_correct_answer_count)), 2);
                    practice_test.wrong_percentage = (100 - (parseFloat(practice_test.skipped_percentage) + parseFloat(practice_test.correct_percentage)));
                    practice_test.praticetest_highchart_data = [{
                        name: "Skipped",
                        y: parseFloat(practice_test.skipped_percentage),

                    }, {
                            name: "correct",
                            y: parseFloat(practice_test.correct_percentage),

                        }, {
                            name: "wrong",
                            y: parseFloat(practice_test.wrong_percentage),

                        }];
                    model.Show_pratice_test = true;
                });
            });
        }
        /*Applying the filter for Reviewed Questions */
        function RevieQuestionFilter(type) {
            $scope.review_type = type;
            $scope.Review_questions.questions = [];
            if (type === 'correct') {
                $scope.Review_questions.questions = $filter('filter')(model.tmp_reviewed_questions, { 'is_correct': true });
            } else if (type === 'incorrect') {
                $scope.Review_questions.questions = $filter('filter')(model.tmp_reviewed_questions, { 'is_correct': false });
            } else if (type === 'skipped') {
                $scope.Review_questions.questions = $filter('filter')(model.tmp_reviewed_questions, { 'is_skipped': true });
            } else if (type === 'marked') {
                $scope.Review_questions.questions = $filter('filter')(model.tmp_reviewed_questions, { 'is_marked_for_review': true });
            } else {
                $scope.Review_questions.questions = model.tmp_reviewed_questions;
            }
        }
        //Hide Review questions details and enable Review Questionslisting
        $scope.hidereviewedQuestions = function () {
            $scope.ReviewDetails = false;
        };

        function timerFinishTest() {
            /*Checking the Balance percentage to complete*/
            model.Balance_text_perc = 0;
            angular.forEach(model.quizQuestionlists, function (question) {
                if (question.student_answer !== null && question.student_answer !== undefined) {
                    model.Balance_text_perc = (model.Balance_text_perc + model.Split_percentage);
                }
            });
            model.Balance_text_perc = parseInt(100 - model.Balance_text_perc);
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/PracticeTest/PracticeTimerFinishTest.tpl.html',
                size: 'sm',
                backdrop: 'static',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        }
        $scope.$watch(function () {
            return [model.quizQuestionlists];
        }, function () {
            $scope.Questions_list = model.quizQuestionlists;
        }, true);
        /*Opening Current Questions*/
        function openQuestion(key) {
            if (key !== null) {
                angular.forEach(model.quizQuestionlists, function (pratice_question) {
                    pratice_question.current_index = null;
                });
                model.question_number = model.quizQuestionlists[key].Number;
                model.Question_Percentage = model.quizQuestionlists[key].tab_percentage;
                model.quizQuestionlists[key].current_index = key;
            }
        }
        function QuestionFilter(type) {
            $scope.search = {};
            if (type !== 'all') {
                $scope.search[type] = 'true';
            }
            $scope.Question_type = type;
        }
        //Opening Model Questions Tab
        function openQuestionTab() {
            $uibModalStack.dismissAll();
            angular.element('#js-lesson').addClass('questions-open');
            model.pratice_test_navbar = true;
        }
        function closeQuestionTab() {
            angular.element('#js-lesson').removeClass('questions-open');
            model.pratice_test_navbar = false;
        }
        //Retest the Pratice funtions
        function QuestionTryAGain() {
            angular.element('#js-lesson-detail').removeClass('lesson_details1 container');
            angular.element('#js-lesson-detail').addClass('lesson_details');
            model.quizQuestionlists = [];
            model.pratice_test_navbar = false;
            getQuizQuestionAnswer();
            $scope.ReviewDetails = false;
            model.Show_pratice_test = false;
            $scope.ReviewDetails = false;
            model.updateparent();
        }
        //Comparing the learner and Instructor answer
        $scope.compareArrays = function (Instructor_answers, Learner_answers) {
            var correct_answer = [];
            angular.forEach(Instructor_answers, function (I_answer) {
                angular.forEach(Learner_answers, function (L_anser) {
                    if (parseInt(I_answer.id) === parseInt(L_anser)) {
                        correct_answer.push(I_answer);
                    }
                });
            });
            return correct_answer;
        };

        // Converting the video timing 
        function secondsToTime(secs) {
            var hours = Math.floor(secs / (60 * 60));
            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            var obj = {
                "hour": hours,
                "min": minutes,
                "sec": seconds
            };
            return obj;
        }
        /*Enable/disable the  Full Screen mode*/
        $scope.Fullscreen = function () {
            if (Fullscreen.isEnabled())
                Fullscreen.cancel();
            else
                Fullscreen.all();
        };
        $scope.getChecked = function (obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push(key);
                }
            }
            return checked;
        };
        /*Closing modal */
        $scope.modalClose = function (e, type) {
            e.preventDefault();
            $uibModalStack.dismissAll();
            if (type === 'resume') {
                $scope.resumeTimer();
            }

        };
        //Calling the QuizQuestion function 
        if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
            getQuizQuestionAnswer();
        } else {
            coursePurchasedStatus();
        }
    });

    module.directive('practiceTestStartPage', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/PracticeTest/PracticeTestStartPage.tpl.html',
            link: linker,
            controller: 'PracticeTestStartController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
                lessonDetail: '@lessonDetail'
            }
        };
    });
    module.controller('PracticeTestStartController', function ($rootScope, $scope, $filter, flash, CourseUserPraticeTests, $state) {
        var model = this;
        model.init = init;
        $scope.start_test = false;
        if (model.lessonId !== null && model.lessonId !== undefined) {
            if (model.lessonDetail !== undefined && model.lessonDetail !== null && model.lessonDetail !== '') {
                model.praticeTestDetails = JSON.parse(model.lessonDetail);
            }
            $scope.startPracticeTest = function () {
                var params = {
                    'course_user_id': $state.params.learn,
                    'online_course_lesson_id': $state.params.lesson
                };
                CourseUserPraticeTests.create(params).$promise
                    .then(function (response) {
                        if (angular.isDefined(response.data)) {
                            if (response.data.id !== null && response.data.id !== undefined) {
                                model.praticeTestDetails.pratice_test_id = response.data.id;
                                $scope.start_test = true;
                            }
                        }
                    }, function (error) { });
            };
        }

        function init() {
            $scope.start_test = false;
        }
    });
    module.directive('praticeHighChart', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            template: '<div></div>',
            link: linker,
            controller: 'praticeChartController as model',
            bindToController: true,
            scope: {
                options: '@options',
                categories: '@categories',
                type: '@type',
                title: '@title',
                width: '@width',
                height: '@height',
                innerSize: '@innerSize',
                size: '@size',
                seriesData: '@seriesData'
            }
        };
    });
    module.controller('praticeChartController', function ($element) {
        /**
         * @ngdoc controller
         * @name HighChartController
         * @description
         * formatting the data for high chart and triggering the high chart.
         *
         *
         **/
        var model = this;
        if (model.seriesData !== undefined && model.seriesData !== null && model.seriesData !== '') {
            model.highChartseriesData = JSON.parse(model.seriesData);
        }
        /**Pie Chart plot option */
        Highcharts.setOptions({
            colors: ['#cccccc', '#79d047', '#d60606']
        });
        Highcharts.chart($element[0], {
            chart: {
                type: 'pie',
                width: parseInt(model.width),
                height: parseInt(model.height),
                backgroundColor: '#ffffff',
            },
            title: {
                text: null
            },
            plotOptions: {
                pie: {
                    innerSize: parseInt(model.innerSize),
                    size: parseInt(model.size),
                }, series: {
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}%</b>'
            },
            series: [{
                data: model.highChartseriesData,
            }],
        });
    });
})(angular.module('ace.practicetest'));

(function (module) {
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
    module.factory('CourseUserPraticeTests', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_practice_tests', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('CourseUserPraticeTestFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_practice_tests/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT'
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
})(angular.module('ace.practicetest'));