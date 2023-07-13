/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {

} (angular.module('ace.question&answer', [
    'ui.router',
    'ngResource',
])));
(function (module) {
    module.directive('questionAnswers', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/QA/QuestionAnswers.tpl.html',
            link: linker,
            controller: 'QuestionAnswersController as model',
            bindToController: true,
            scope: {
                courseInstructorId: '@courseInstructorId',
                courseId: '@courseId',
            }
        };
    });

    module.controller('QuestionAnswersController', function (UserMessage, $scope, $rootScope, $state, CourseBatchMessage, flash, $filter, UserDetailService, MessageFactory, $uibModal, $uibModalStack, SweetAlert, AlertBox, $location) {
        // $rootScope.pageTitle = $rootScope.settings['site.name'] + " | " + $filter("translate")("QA");
        /**VARIABLE DECELARATION */
        var model = this;
        model.userCourseMessage = [];
        /**ASSIGNING  DEFAULT VALUE TO  VARIABLED */
        model.loader = true;
        /**ASSIGNING FUNCTION TO MODEL */
        model.QuestionForm = QuestionForm;
        model.sendQuestionAnswer = sendQuestionAnswer;
        model.QuestionReplyFormSubmit = QuestionReplyFormSubmit;
        model.QuestionEditFormSubmit = QuestionEditFormSubmit;
        model.QuestionDeleteFormSubmit = QuestionDeleteFormSubmit;
        /**GETTING THE OVERALL MESSAGE LISTING FUNCTION  */
        function getUserMessage() {
            model.loader = true;
            $scope.closeBrowseQuestiontab = function () {
                angular.element('#js-lesson').removeClass('qa-questions-open');
            };
            model.userMessages = [];
            $scope._metadata = {};
            params = {};
            params.page = model.currentPage;
            params.class = 'QA';
            params.type = 'QA';
            if ($scope.sortby === 'created') {
                params.sort = 'id';
                params.sort_by = 'DESC';
            }
            if ($scope.sortby === '-created') {
                params.sort = 'id';
                params.sort_by = 'ASC';
            }
            params.no_response = (model.no_response === true) ? 1 : 0;
            params.foreign_id = model.courseId;
            params.limit = 10;
            if (model.query !== undefined && model.query !== null) {
                params.q = model.query;
            }
            UserMessage.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        $scope._metadata = response._metadata;
                        model.currentPage = $scope._metadata.currentPage;
                        model.userMessages = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        angular.forEach(model.userMessages, function (message) {
                            message.isShowContent = false;
                            message.isShowReply = false;
                            angular.forEach(message.other_user, function (other_user) {
                                message.other_user = other_user.username;
                                message.other_user_id = other_user.id;
                                message.other_user_image = other_user.image_hash;
                            });
                            angular.forEach(message.user, function (user) {
                                message.user_image = user.image_hash;
                                message.user = user.username;
                            });
                        });
                    }
                    model.loader = false;
                });
        }
        /**PAGINATION FUNCTION OF MESSAGE  */
        $scope.paginate = function (currentPage) {
            model.currentPage = parseInt(model.currentPage);
            $scope.index();
        };
        $scope.searchQuestions = function () {
            model.currentPage = 1;
            getUserMessage();
        };

        $scope.Sort = function (a) {
            model.currentPage = 1;
            if (a !== undefined && a !== null && a !== 'no_response') {
                $scope.sortby = a;
            }
            getUserMessage();
        };

        function QuestionForm(type, form) {
            if (type === 'Show') {
                model.showQuestionForm = true;
            } else if (type === 'Close') {
                model.showQuestionForm = false;
                form.$setPristine();
                form.$setUntouched();
            } else {
                model.showQuestionForm = false;
                form.$setPristine();
                form.$setUntouched();
            }

        }
        /**SENDING THE MESSAGE TO THE MULTIPLE USERS */
        function sendQuestionAnswer($valid) {
            if ($valid) {
                model.Question.class = 'QA';
                model.Question.foreign_id = model.courseId;
                model.Question.user_id = [];
                model.Question.user_id.push({
                    'user_id': model.courseInstructorId
                });
                $scope.message_disableButton = true;
                CourseBatchMessage.create(model.Question, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Message  has been Send successfully.");
                        flash.set(flashMessage, 'success', false);
                        model.showQuestionForm = false;
                        getUserMessage();
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.message_disableButton = false;
                }, function (error) {
                    if (error.status === 404) {
                        flashMessage = $filter("translate")("Message  could not be Sended. Try again later");
                        flash.set(flashMessage, 'error', false);
                    }
                    $scope.message_disableButton = false;
                });
            }

        }
        $scope.viewQuestion = function (index) {
            if ($state.current.name === "LearnCourse" || $state.current.name === 'LearnCourseEmpty') {
                model.question = model.userMessages[index];
                model.question.editable = false;
                if (model.question.is_sender === true && (parseInt(model.question.user_id) === parseInt($rootScope.auth.id))) {
                    model.question.editable = true;
                }
                if (model.question.is_sender === false && (parseInt(model.question.other_user_id) === parseInt($rootScope.auth.id))) {
                    model.question.editable = true;
                }
                angular.forEach(model.question.other_user, function (other_user) {
                    model.question.other_user = other_user.username;
                    model.question.other_user_image = other_user.image_hash;
                });
                if (model.question.children !== null) {
                    if (model.question.children.length > 0) {
                        model.question.children = $filter('CountryTimezone')(model.question.children, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        angular.forEach(model.question.children, function (child_message) {
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
                angular.element('#js-lesson').addClass('qa-question-view-open');
            } else {
                $state.go('LearnQuestionView', {
                    'course_user_id': $state.params.course_user_id,
                    'type': 'questions',
                    'question_id': model.userMessages[index].id
                });
            }

        };
        $scope.closeQuestionview = function () {
            angular.element('#js-lesson').removeClass('qa-question-view-open');
        };
        function QuestionReplyFormSubmit($valid, Form, message) {
            if ($valid) {
                model.reply_disableButton = true;
                model.reply_Message = {};
                model.reply_Message.parent_id = model.question.id;
                model.reply_Message.class = 'QA';
                model.reply_Message.foreign_id = model.question.foreign_id;
                model.reply_Message.message = model.question.reply_message;
                model.reply_Message.user_id = [];
                model.reply_Message.user_id.push({
                    'user_id': model.question.other_user_id
                });
                CourseBatchMessage.create(model.reply_Message, function (response) {
                    if (response.error.code === 0) {
                        model.reply_disableButton = false;
                        flashMessage = $filter("translate")("Answer has been added  successfully.");
                        flash.set(flashMessage, 'success', false);
                        model.reply_Message = {};
                        getUserMessage();
                        Form.$setPristine();
                        Form.$setUntouched();
                        angular.element('#js-lesson').removeClass('qa-question-view-open');
                    } else {
                        model.reply_disableButton = false;
                        flashMessage = $filter("translate")("Answer couldn't be added. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    model.reply_disableButton = false;
                    flashMessage = $filter("translate")("Error occurred while adding the  Answer. Try again later");
                    flash.set(flashMessage, 'error', false);
                });
            }
        }

        function QuestionEditFormSubmit($valid, form, child_index) {
            if ($valid) {
                var params = {
                    "id": model.question.children[child_index].id,
                    "message": model.question.children[child_index].edit_message,
                };
                MessageFactory.update(params).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            form.$setPristine();
                            form.$setUntouched();
                            model.question.children[child_index].message = model.question.children[child_index].edit_message;
                            model.question.children[child_index].editForm = false;
                            flashMessage = $filter("translate")("Answer has been Updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        }
                    });
            }

        }

        function QuestionDeleteFormSubmit(type, child_index) {
            var message = (type === 'Parent') ? 'Are you sure you want to delete the question?' : 'Are you sure you want to delete the answer?';
            AlertBox.confirm(message, function (isConfirmed) {
                if (isConfirmed) {
                    var params = {};
                    params.id = (type === 'Parent') ? model.question.id : model.question.children[child_index].id;
                    MessageFactory.remove(params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                if (type === 'Parent') {
                                    $state.go('LearnCourseview', {
                                        'course_user_id': $state.params.course_user_id,
                                        'type': 'questions',
                                    });
                                } else {
                                    model.question.children.splice(child_index, 1);
                                }
                                flashMessage = $filter("translate")("Answer has been deleted successfully.");
                                flash.set(flashMessage, 'success', false);
                            } else {
                                flashMessage = $filter("translate")("Answer couldn't be deleted. Try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }, function (error) {
                            flashMessage = $filter("translate")("Error occurred while deleting. Try again later");
                            flash.set(flashMessage, 'error', false);
                        });
                }
            });

        }

        /**INIT FUNCTION DECLARATION  */
        $scope.index = function () {
            model.currentPage = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            getUserMessage();
        };
        /**INIT FUNCTION CALLING  */
        $scope.index();

    });
    module.controller('QuestionAnswerViewController', function ($rootScope, $scope, UserMessageView, MessageFactory, $filter, $state, CourseBatchMessage, flash, ViewCourseUser, ViewCourse, User, $location, $timeout, AlertBox) {
        $rootScope.pageTitle = $filter("translate")("QA")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.type = $state.params.type;
        model.course_user_id = $state.params.course_user_id;
        model.QuestionReplyFormSubmit = QuestionReplyFormSubmit;
        model.QuestionEditFormSubmit = QuestionEditFormSubmit;
        model.QuestionDeleteFormSubmit = QuestionDeleteFormSubmit;
        /**Gettin the address of the batch  */
        function getMessage() {
            model.loader = true;
            var params = {};
            params.id = $state.params.question_id;
            UserMessageView.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        model.question = response.data[0];
                        model.question.editable = false;
                        if (model.question.is_sender === true && (parseInt(model.question.user_id) === parseInt($rootScope.auth.id))) {
                            model.question.editable = true;
                        }
                        if (model.question.is_sender === false && (parseInt(model.question.other_user_id) === parseInt($rootScope.auth.id))) {
                            model.question.editable = true;
                        }
                        angular.forEach(model.question.other_user, function (other_user) {
                            model.question.other_user = other_user.username;
                            model.question.other_user_image = other_user.image_hash;
                        });
                        if (model.question.children !== null) {
                            if (model.question.children.length > 0) {
                                model.question.children = $filter('CountryTimezone')(model.question.children, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                                angular.forEach(model.question.children, function (child_message) {
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

                        angular.forEach(model.question.user, function (user) {
                            model.question.user = user.username;
                            model.question.user_image = user.image_hash;
                        });
                    }
                    model.loader = false;
                });
        }
        /** Message Reply Form Submit*/
        function QuestionReplyFormSubmit($valid, Form, message) {
            if ($valid) {
                model.reply_disableButton = true;
                model.reply_Message = {};
                model.reply_Message.parent_id = model.question.id;
                model.reply_Message.class = 'QA';
                model.reply_Message.foreign_id = model.question.foreign_id;
                model.reply_Message.message = model.question.reply_message;
                model.reply_Message.user_id = [];
                model.reply_Message.user_id.push({
                    'user_id': model.question.other_user_id
                });
                CourseBatchMessage.create(model.reply_Message, function (response) {
                    if (response.error.code === 0) {
                        model.reply_disableButton = false;
                        flashMessage = $filter("translate")("Answer has been added  successfully.");
                        flash.set(flashMessage, 'success', false);
                        Form.$setPristine();
                        Form.$setUntouched();
                        getMessage();

                    } else {
                        model.reply_disableButton = false;
                        flashMessage = $filter("translate")("Answer couldn't be added. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    model.reply_disableButton = false;
                    flashMessage = $filter("translate")("Error occurred while adding the  Answer. Try again later");
                    flash.set(flashMessage, 'error', false);
                });
            }
        }

        function QuestionEditFormSubmit($valid, form, child_index) {
            if ($valid) {
                var params = {
                    "id": model.question.children[child_index].id,
                    "message": model.question.children[child_index].edit_message,
                };
                MessageFactory.update(params).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            form.$setPristine();
                            form.$setUntouched();
                            model.question.children[child_index].message = model.question.children[child_index].edit_message;
                            model.question.children[child_index].editForm = false;
                            flashMessage = $filter("translate")("Answer has been Updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        }
                    });
            }

        }

        function QuestionDeleteFormSubmit(type, child_index) {
            var message = (type === 'Parent') ? 'Are you sure you want to delete the question?' : 'Are you sure you want to delete the answer?';
            AlertBox.confirm(message, function (isConfirmed) {
                if (isConfirmed) {
                    var params = {};
                    params.id = (type === 'Parent') ? model.question.id : model.question.children[child_index].id;
                    MessageFactory.remove(params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                if (type === 'Parent') {
                                    $state.go('LearnCourseview', {
                                        'course_user_id': $state.params.course_user_id,
                                        'type': 'questions',
                                    });
                                } else {
                                    model.question.children.splice(child_index, 1);
                                }
                                flashMessage = $filter("translate")("Answer has been deleted successfully.");
                                flash.set(flashMessage, 'success', false);
                            } else {
                                flashMessage = $filter("translate")("Answer couldn't be deleted. Try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }, function (error) {
                            flashMessage = $filter("translate")("Error occurred while deleting. Try again later");
                            flash.set(flashMessage, 'error', false);
                        });
                }
            });

        }
        getMessage();
    });

    /*Intrcutor Questions controller*/
    module.controller('InstructorQuestionsController', function ($state, $rootScope, $scope, $filter, TokenServiceData, CourseAnnoucementMessage, $location, $timeout, Teaching, MessageFactory, CourseBatchMessage, flash, AlertBox) {
        $rootScope.pageTitle = $filter("translate")("QA")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.loader = true;
        $scope.messagesort = {};
        $scope._metadata = {};
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'forum';
        model.QuestionReplyFormSubmit = QuestionReplyFormSubmit;
        model.QuestionEditFormSubmit = QuestionEditFormSubmit;
        model.MessageUpdate = MessageUpdate;
        model.QuestionDeleteFormSubmit = QuestionDeleteFormSubmit;
        model.UpdateMessageOption = UpdateMessageOption;
        model.removeMessageOption = removeMessageOption;


        function getCoursesforum(element) {
            model.loading = true;
            var params = {};
            $scope.messagesort.sortby = $state.params.ordering;
            $scope.ordering = $state.params.ordering;
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
            }
            if ($state.params.unanswered === '0') {
                params.no_top_answer = 0;
                $scope.messagesort.no_top_answer = 0;
            }
            if ($state.params.unread === '0') {
                params.is_read = null;
                $scope.messagesort.no_unread = 0;
            }
            if ($state.params.unread === '1') {
                params.is_read = 0;
                $scope.messagesort.no_unread = 1;
            }
            if ($state.params.unresponded === '1') {
                params.no_response = 1;
                $scope.messagesort.no_response = 1;
            }
            if ($state.params.unresponded === '0') {
                params.no_response = 0;
                $scope.messagesort.no_response = 0;
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
                params.type = 'forum';
                params.class = 'QA';
                params.page = model.currentPage;
                CourseAnnoucementMessage.get(params).$promise.then(function (response) {
                    model.forumCourses = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    $scope._metadata = response._metadata;
                    model.currentPage = $scope._metadata.currentPage;
                    model.unread_count = 0;
                    angular.forEach(model.forumCourses, function (message) {
                        message.isShowContent = false;
                        model.unread_count += (message.is_read) ? 0 : 1;
                        angular.forEach(message.other_user, function (other_user) {
                            message.other_user = other_user.username;
                            message.other_user_image = other_user.image_hash;
                        });
                        angular.forEach(message.user, function (user) {
                            message.user = user.username;
                            message.user_image = user.image_hash;
                        });
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
                    model.loader = false;
                });
            }, 100);

        }
        $scope.index = function (element) {
            model.currentPage = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            getCoursesforum(element);
        };
        /** SINGLE MESSAGE UPDATE FUNCTION */
        function MessageUpdate(type, index) {
            var params = {};
            params.id = model.forumCourses[index].id;
            if (type === 'read') {
                params.is_read = 1;
            } else if (type === 'unread') {
                params.is_read = 0;
            }
            MessageFactory.update(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (type === 'read') {
                            model.forumCourses[index].is_read = true;
                            model.unread_count -= 1;

                        } else if (type === 'unread') {
                            model.forumCourses[index].is_read = false;
                            model.unread_count += 1;
                        }
                    }
                });
        }
        function UpdateMessageOption(type, parent_index, child_index) {
            var params = {};
            params.id = model.forumCourses[parent_index].children[child_index].id;
            if (type === 'Help') {
                params.is_helpful = 1;
            } else if (type === 'Top') {
                params.is_answer = 1;
            }
            var dynamic_mes_cont = (type === 'Help') ? 'helpful' : 'top as answer';
            MessageFactory.update(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Answer successfully marked as " + dynamic_mes_cont + ".");
                        flash.set(flashMessage, 'success', false);
                        if (type === 'Help') {
                            model.forumCourses[parent_index].children[child_index].is_helpful = true;
                        } else if (type === 'Top') {
                            model.forumCourses[parent_index].children[child_index].is_answer = true;
                        }
                    } else {
                        flashMessage = $filter("translate")("Answer couldn't be marked as " + dynamic_mes_cont + ". Please try again later");
                        flash.set(flashMessage, 'success', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Answer couldn't be marked as " + dynamic_mes_cont + ". Please try again later");
                    flash.set(flashMessage, 'success', false);
                });
        }
        function removeMessageOption(type, parent_index, child_index) {
            var params = {};
            params.id = model.forumCourses[parent_index].children[child_index].id;
            if (type === 'Help') {
                params.is_helpful = 0;
            } else if (type === 'Top') {
                params.is_answer = 0;
            }
            MessageFactory.update(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Answer successfully unmarked as helpful.");
                        flash.set(flashMessage, 'success', false);
                        if (type === 'Help') {
                            model.forumCourses[parent_index].children[child_index].is_helpful = false;
                        } else if (type === 'Top') {
                            model.forumCourses[parent_index].children[child_index].is_answer = false;
                        }
                    } else {
                        flashMessage = $filter("translate")("Answer couldn't be unmarked as helpful. Please try again later");
                        flash.set(flashMessage, 'success', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Answer couldn't be unmarked as helpful. Please try again later");
                    flash.set(flashMessage, 'success', false);
                });
        }


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
        $scope.Sort = function (a) {
            model.currentPage = 1;
            if (a !== undefined && a !== null) {
                $scope.messagesort.sortby = a;
            }
            $location
                .search('ordering', $scope.messagesort.sortby)
                .search('unanswered', $scope.messagesort.no_top_answer)
                .search('unread', $scope.messagesort.no_unread)
                .search('unresponded', $scope.messagesort.no_response);
            $timeout(function () {
                getCoursesforum(null);
            }, 1000);
        };

        function QuestionEditFormSubmit($valid, form, parent_index, child_index) {
            if ($valid) {
                var params = {
                    "id": model.forumCourses[parent_index].children[child_index].id,
                    "message": model.forumCourses[parent_index].children[child_index].edit_message,
                };
                MessageFactory.update(params).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            form.$setPristine();
                            form.$setUntouched();
                            model.forumCourses[parent_index].children[child_index].message = model.forumCourses[parent_index].children[child_index].edit_message;
                            model.forumCourses[parent_index].children[child_index].editForm = false;
                            flashMessage = $filter("translate")("Answer has been Updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        }
                    });
            }

        }

        function QuestionDeleteFormSubmit(type, parent_index, child_index) {
            var message = (type === 'Parent') ? 'Are you sure you want to delete the question?' : 'Are you sure you want to delete the answer?';
            AlertBox.confirm(message, function (isConfirmed) {
                if (isConfirmed) {
                    var params = {};
                    params.id = (type === 'Parent') ? model.forumCourses[parent_index].id : model.forumCourses[parent_index].children[child_index].id;
                    MessageFactory.remove(params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                if (type === 'Parent') {
                                    model.forumCourses.splice(parent_index, 1);
                                } else {
                                    model.forumCourses[parent_index].children.splice(child_index, 1);
                                }
                                flashMessage = $filter("translate")("Answer has been deleted successfully.");
                                flash.set(flashMessage, 'success', false);
                            } else {
                                flashMessage = $filter("translate")("Answer couldn't be deleted. Try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }, function (error) {
                            flashMessage = $filter("translate")("Error occurred while deleting. Try again later");
                            flash.set(flashMessage, 'error', false);
                        });
                }
            });

        }

        function QuestionReplyFormSubmit($valid, form, index) {
            if ($valid) {
                model.reply_Message = {};
                model.reply_Message.parent_id = model.forumCourses[index].id;
                model.reply_Message.class = 'QA';
                model.reply_Message.foreign_id = model.forumCourses[index].foreign_id;
                model.reply_Message.message = model.forumCourses[index].reply_message;
                model.reply_Message.user_id = [];
                model.reply_Message.user_id.push({
                    'user_id': model.forumCourses[index].other_user_id
                });
                CourseBatchMessage.create(model.reply_Message, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Replied successfully.");
                        flash.set(flashMessage, 'success', false);
                        getCoursesforum(null);
                        model.forumCourses[index].reply_message = ' ';
                        form.$setPristine();
                        form.$setUntouched();
                    } else {
                        flashMessage = $filter("translate")("Replied couldn't be added. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while Replied. Try again later");
                    flash.set(flashMessage, 'error', false);
                });
            }
        }

        /**GETTING THE COURSES OF INSTRUCTOR */
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
})(angular.module('ace.question&answer'));

/**MESSAGE SERVICES */
(function (module) {
    module.factory('UserMessage', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('MessageFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    }
                }
            }, {
                remove: {
                    method: 'DELETE',
                    params: {
                        id: '@id'
                    }
                }
            }
        );
    });
    module.factory('CourseBatchMessage', function ($resource, GENERAL_CONFIG) {
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
    module.factory('UserDetailService', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id', {
                id: '@id'
            }
        );
    });
    module.factory('UserMessageView', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages/:id', {
                id: '@id'
            }
        );
    });
})(angular.module("ace.question&answer"));
