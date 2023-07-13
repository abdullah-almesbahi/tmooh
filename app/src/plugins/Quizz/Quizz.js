/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {


} (angular.module('ace.Quiz', [
    'ui.router',
    'ngResource'
])));

(function (module) {
    module.directive('quizLessonsForm', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Quizz/QuizLessonsForm.tpl.html',
            link: linker,
            controller: 'quizLessonsFormController as model',
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
    module.controller('quizLessonsFormController', function ($rootScope, $scope, AddCourseQuiz, $filter, flash, OnlineCourseLessonsQuizUpdate, addOnlineCourseLessons, anchorSmoothScroll, $timeout, CreateOnlineCourseLesson) {
        var model = this;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        $scope.showForm = false;
        $scope.editForm = false;
        if ($scope.action === 'edit') {
            var quizform = {};
            quizform.editForm = true;
            $rootScope.$emit('updateQuizForm', {
                QuizForm: quizform
            });
            getLessonUpdate();
        }
        $rootScope.$on('updateQuizForm', function (event, args) {
            $rootScope.QuizForm = {};
            $rootScope.QuizForm.showForm = args.QuizForm.showForm;
            $rootScope.QuizForm.editForm = args.QuizForm.editForm;
            $rootScope.QuizForm.questionshowForm = args.QuizForm.QuizForm;
            $rootScope.QuizForm.questionshowForm = args.QuizForm.questionshowForm;
            $rootScope.QuizForm.questionlistForm = args.QuizForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var quizform = {};
            quizform.showForm = true;
            $rootScope.$emit('updateQuizForm', {
                QuizForm: quizform
            });
        };
        $scope.hideForm = function (e) {
            e.preventDefault();
            var quizform = {};
            quizform.showForm = false;
            $rootScope.$emit('updateQuizForm', {
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
                        $rootScope.$emit('updateQuizForm', {
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
                    $scope.addQuiz($valid);
                }
            }

        }
        $scope.addQuiz = function ($valid) {
            if ($valid) {
                model.QuizSaveButton = true;
                model.AddOnlineQuiz.is_lesson_ready = 0;
                model.AddOnlineQuiz.course_id = model.course;
                AddCourseQuiz.create(model.AddOnlineQuiz, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Quiz lesson has been added successfully.");
                        flash.set(flashMessage, 'success', false);
                        var quizform = {};
                        quizform.showForm = false;
                        $rootScope.$emit('updateQuizForm', {
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
                    flashMessage = $filter("translate")("Error occurred while adding Quiz lesson. Try again later.");
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
    module.directive('quizQuestionAnswer', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Quizz/AddQuizQuestionAnswerForm.tpl.html',
            link: linker,
            controller: 'AddQuizQuestionAnswerFormController as model',
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
    module.controller('AddQuizQuestionAnswerFormController', function (Course, $scope, addOnlineCourseLessons, OnlineCourseLessons, OnlineCourseLessonsUpdate, $filter, flash, $rootScope, AddCourseQuizQuestion, CourseQuizQuestion, OnlineCourseLessonsQuizUpdate) {
        var model = this;
        model.quizAnswer = {};
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        model.quizAnswer.online_course_lesson_id = model.lessonId;
        model.quizAnswer.course_id = model.course;
        model.quizAnswer.type = 'multi-choice';
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
            $rootScope.$emit('updateQuizForm', {
                QuizForm: quizform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
            GetQuizlessionQuestionsList();
        };
        $rootScope.$on('updateQuizForm', function (event, args) {
            $rootScope.QuizForm = {};
            $rootScope.QuizForm.course_id = args.course_id;
            $rootScope.QuizForm.lesson_id = args.lesson_id;
            $rootScope.QuizForm.showForm = args.QuizForm.showForm;
            $rootScope.QuizForm.editForm = args.QuizForm.editForm;
            $rootScope.QuizForm.questionshowForm = args.QuizForm.questionshowForm;
            $rootScope.QuizForm.questioneditForm = args.QuizForm.questioneditForm;
            $rootScope.QuizForm.questionlistForm = args.QuizForm.questionlistForm;
        });
        $scope.uploadConfigure = function () {
            var quizform = {};
            quizform.questionshowForm = true;
            $rootScope.$emit('updateQuizForm', {
                QuizForm: quizform,
                course_id: model.course,
                lesson_id: $scope.lessonID
            });
        };

        $scope.hideForm = function (e) {
            e.preventDefault();
            var quizform = {};
            quizform.questionshowForm = false;
            $rootScope.$emit('updateQuizForm', {
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
                    $rootScope.$emit('updateQuizForm', {
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
                            /*  model.updateparent();*/
                            if (angular.isDefined(response.data.id !== '' && response.data.id !== "null")) {
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
            OnlineCourseLessonsQuizUpdate.update({
                quizId: $scope.lessonID
            }, params, function (response) {
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
    module.directive('quizExerciseLearner', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/Quizz/QuizExerciseLearner.tpl.html',
            link: linker,
            controller: 'QuizsExerciseLearnerController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
            }
        };
    });
    module.controller('QuizsExerciseLearnerController', function ($rootScope, $scope, $filter, flash, AddCourseQuizQuestion, CourseUserQuestion, GetCourseUserEntry, $state) {
        var model = this;
        $scope.loader = true;
        model.question_slide_change = question_slide_change;
        $scope.ShowAnswer = false;
        model.QuestionTryAGain = QuestionTryAGain;
        //Getting the Quiz and Answer 
        model.quizQuestionlists = [];
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
            //previous question triggering 
            if (option === 'prev') {
                if (key !== null) {
                    model.quizQuestionlists[key].current_index = null;
                    var previous_index = model.quizQuestionlists[key].previous_index;
                    model.quizQuestionlists[previous_index].current_index = model.quizQuestionlists[key].previous_index;
                }
                //next  question triggering 
            } else if (option === 'next') {
                if (model.quizQuestionlists[key].student_answer !== undefined) {
                    if (key !== null) {
                        angular.forEach(model.quizQuestionlists[key].answer, function (answer) { if (answer.is_answer) { correct_answer = answer.id; } });
                        model.quizQuestionlists[key].current_index = null;
                        var next_index = model.quizQuestionlists[key].next_index;
                        model.quizQuestionlists[next_index].current_index = model.quizQuestionlists[key].next_index;
                        var course_users_quiz_questions = {
                            "course_id": model.quizQuestionlists[key].course_id,
                            "course_user_id": courseUserID,
                            "online_course_lesson_id": model.lessonId,
                            "quiz_question_id": model.quizQuestionlists[key].id,
                            "quiz_question_answer_id": correct_answer
                        };
                        if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
                            delete course_users_quiz_questions.course_user_id;
                        }
                        CourseUserQuestion.create(course_users_quiz_questions).$promise
                            .then(function (response) { }, function (error) { });
                    }
                } else {
                    $scope.Incorrectoption = true;
                }

            } //Finding the correct answer and showing the correct/incorrect answer
            else if (option === 'submit') {
                angular.element('#js-lesson-detail').removeClass('lesson_details');
                angular.element('#js-lesson-detail').addClass('lesson_details1 container');
                model.LearnerReviwedQuestionList = [];
                angular.forEach(model.quizQuestionlists, function (student_question, parent_key) {
                    angular.forEach(student_question.answer, function (student_answer, i) {
                        if (student_answer.is_answer === true) {
                            if (student_answer.id == student_question.student_answer) {
                                student_question.Student_Answered = true;
                            } else {
                                student_question.Student_Answered = false;
                            }
                        }
                    });
                    model.LearnerReviwedQuestionList.push(student_question);
                    $scope.ShowAnswer = true;
                });
            }
        }
        //Showing The Error Mesaage 
        $scope.hideError = function () {
            $scope.Incorrectoption = false;
        };
        //Quiz Try Again Function
        function QuestionTryAGain() {
            angular.element('#js-lesson-detail').removeClass('lesson_details1 container');
            angular.element('#js-lesson-detail').addClass('lesson_details');
            model.quizQuestionlists = [];
            getQuizQuestionAnswer();
            $scope.ShowAnswer = false;
        }
        //Calling the QuizQuestion function 
        if ($state.params.is_preview !== '' && $state.params.is_preview !== undefined && $state.params.is_preview !== null && ($state.params.is_preview === 'Instructor' || $state.params.is_preview === 'Learner')) {
            getQuizQuestionAnswer();
        } else {
            coursePurchasedStatus();
        }
    });
})(angular.module('ace.Quiz'));

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
    module.factory('GetCourseUserEntry', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:course_id/users/:user_id/course_users', {
                course_id: '@course_id',
                user_id: '@user_id'
            }
        );
    });
})(angular.module('ace.Quiz'));