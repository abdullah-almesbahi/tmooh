/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {

} (angular.module('ace.message', [
    'ui.router',
    'ngResource',
])));
(function (module) {
    module.directive('messageNotification', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/Message/Messagenotification.tpl.html',
            link: linker,
            controller: 'MessageNotificationController as model',
            bindToController: true,
            scope: {}
        };
    });
    module.controller('MessageNotificationController', function ($rootScope, $scope, UserMessage, MessageFactory, $filter, $timeout) {
        var model = this;
        model.notificationMessages = [];
        model.MultipleProcess = MultipleProcess;
        $rootScope.$on('updateMessageParent', function (event, args) {
            getUserMessage();
        });
        /**Gettin the address of the batch  */
        function getUserMessage() {
            model.notificationMessages = [];
            model.unreadnotificationCount = 0;
            params = {};
            params.type = 'notification';
            UserMessage.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        angular.forEach(response.data, function (message) {
                            if (parseInt(message.parent_id) === 0) {
                                angular.forEach(message.other_user, function (other_user) {
                                    message.other_user = other_user.username;
                                    message.other_user_image = other_user.image_hash;
                                });
                                angular.forEach(message.user, function (user) {
                                    message.user = user.username;
                                });
                                if (message.children !== null && message.children !== undefined) {
                                    if (message.children.length > 0) {
                                        message.child_reply = true;
                                    } else {
                                        message.child_reply = false;
                                    }
                                } else {
                                    message.child_reply = false;
                                }
                                if (!message.is_read) {
                                    model.unreadnotificationCount += 1;
                                    if (message.class === 'QA') {
                                        if (parseInt(message.teacher_user_id) === parseInt($rootScope.auth.id)) {
                                            message.state = "/teaching/qa";
                                        } else if (parseInt(message.teacher_user_id) !== parseInt($rootScope.auth.id) && angular.isDefined(message.qa_course)) {
                                            if (message.qa_course.length > 0) {
                                                message.state = (message.qa_course[0].course_user_id !== null && message.qa_course[0].course_user_id !== undefined) ? "/learn/" + message.qa_course[0].course_user_id + "/inbox/" + message.id : "/message/" + message.id + "/inbox";
                                            }

                                        } else {
                                            message.state = "/message/" + message.id + "/inbox";
                                        }
                                    } else if (message.class === 'AssignmentFeedback') {
                                        if (parseInt(message.teacher_user_id) === parseInt($rootScope.auth.id)) {
                                            message.state = "/teaching/assignment";
                                        } else if (parseInt(message.teacher_user_id) !== parseInt($rootScope.auth.id) && angular.isDefined(message.course_assignment_feedback)) {
                                            if (message.course_assignment_feedback.length > 0) {
                                                message.state = (message.course_assignment_feedback[0].course_user_id !== null && message.course_assignment_feedback[0].course_user_id !== undefined) ?
                                                    "/learn-course/"+ message.course_assignment_feedback[0].course_id  + "/" + message.course_assignment_feedback[0].online_course_lesson_id + "/" + message.course_assignment_feedback[0].course_slug + "?learn=" + message.course_assignment_feedback[0].course_user_id
                                                    : "/message/" + message.id + "/inbox";
                                            }
                                        }
                                    } else if (message.class === 'CourseFeedback') {
                                        message.state = "/manage-course/edit-h2k-feedback/" + message.course_feedback[0].course_id;
                                        message.subject = 'Regarding Tmooh Feedback';
                                    } else {

                                        message.state = "/message/" + message.id + "/inbox";
                                    }
                                    model.notificationMessages.push(message);
                                }
                            }
                        });
                    }
                    $timeout(function(){
                         getUserMessage();
                    },7000);
                });
        }
        $scope.SingleMessageRead = function(message_id) {
            var params = {};
            params.id = message_id;
            params.is_read = 1;
            MessageFactory.update(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        getUserMessage();
                    }
                });
        };
        /**MULTIPLE READ*/
        function MultipleProcess(e) {
            e.preventDefault();
            if (model.notificationMessages.length > 0) {
                angular.forEach(model.notificationMessages, function (message) {
                    var params = {};
                    params.id = message.id;
                    params.is_read = 1;
                    MessageFactory.update(params).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                getUserMessage();
                            }
                        });
                });
            }
        }
        getUserMessage();
    });

    module.controller('MessageViewController', function ($rootScope, $scope, UserMessageView, MessageFactory, $filter, $state, CourseBatchMessage, flash) {
        var model = this;
        model.type = $state.params.type;
        model.MessageReplyFormSubmit = MessageReplyFormSubmit;
        /**Gettin the address of the batch  */
        function getMessage() {
            model.loader = true;
            var params = {};
            params.id = $state.params.id;
            UserMessageView.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        model.message = response.data[0];
                        angular.forEach(model.message.other_user, function (other_user) {
                            model.message.other_user = other_user.username;
                            model.message.other_user_image = other_user.image_hash;
                        });
                        angular.forEach(model.message.user, function (user) {
                            model.message.user = user.username;
                        });
                    }
                    if (!model.message.is_read) {
                        MessageUpdate();
                    }
                    model.loader = false;
                });
        }
        /** SINGLE MESSAGE UPDATE FUNCTION */
        function MessageUpdate() {
            var params = {};
            params.id = $state.params.id;
            params.is_read = 1;
            MessageFactory.update(params).$promise
                .then(function (response) {
                    $scope.$emit('updateMessageParent', {});
                });
        }
        /** Message Reply Form Submit*/
        function MessageReplyFormSubmit($valid, Form, message) {
            if ($valid) {
                model.reply_Message = {};
                model.reply_Message.parent_id = model.message.id;
                model.reply_Message.message = model.message.reply_message;
                model.reply_Message.user_id = [];
                model.reply_Message.user_id.push({
                    'user_id': model.message.other_user_id
                });
                CourseBatchMessage.create(model.reply_Message, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Message has been Sended successfully.");
                        flash.set(flashMessage, 'success', false);
                        getMessage();
                    } else {
                        flashMessage = $filter("translate")("Message couldn't be Sended. Try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while Replied. Try again later");
                    flash.set(flashMessage, 'error', false);
                });
            }
        }
        getMessage();
    });

    /*MY MESSAGE CONTROLLER */

    module.controller('MessageController', function (UserMessage, $scope, $rootScope, $state, AllUserList, CourseBatchMessage, flash, $filter, UserDetailService, MessageFactory, $uibModal, $uibModalStack, SweetAlert, AlertBox) {
        /**VARIABLE DECELARATION */
        var model = this;
        model.userCourseMessage = [];
        model.MessageArray = {};
        $scope.tags = [];
        /**ASSIGNING  DEFAULT VALUE TO  VARIABLED */
        $scope.feedbackLimit = 12;
        model.loader = true;
        model.type = $state.params.type;
        /**ASSIGNING FUNCTION TO MODEL */
        model.sort = sort;
        model.MultipleDeleteProcess = MultipleDeleteProcess;
        model.sendMessage = sendMesssage;
        model.getMessageDetails = getMessageDetails;
        model.MultipleProcess = MultipleProcess;
        model.messageDeleteConfirm = messageDeleteConfirm;
        /**GETTING THE OVERALL MESSAGE LISTING FUNCTION  */
        function getUserMessage() {
            model.loader = true;
            model.userMessages = [];
            $scope._metadata = {};
            params = {};
            params.page = $scope.currentPage;
            params.limit = $scope.feedbackLimit;
            params.type = model.type;
            if (model.currentSorttype !== undefined && model.currentSorttype !== null) {
                if (model.currentSorttype === 'All') {
                    params.message_type = null;
                } else {
                    params.message_type = model.currentSorttype;

                }
            } else {
                model.currentSorttype = 'All';
            }
            UserMessage.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        $scope._metadata = response._metadata;
                        model.userMessages = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet','dd MMM yyyy hh:mm a');
                        angular.forEach(model.userMessages, function (message) {
                            message.isShowContent = false;
                            message.isShowReply = false;
                            angular.forEach(message.other_user, function (other_user) {
                                message.other_user = other_user.username;
                                message.other_user_id = other_user.id;
                                message.other_user_image = other_user.image_hash;
                            });
                            angular.forEach(message.user, function (user) {
                                message.user = user.username;
                            });
                        });
                    }
                    model.loader = false;
                });
        }
        /**SORTING FUNCTION OF MESSAGE */
        function sort(a, e) {
            e.preventDefault();
            $scope.currentPage = 1;
            model.currentSorttype = a;
            getUserMessage();
        }
        /**PAGINATION FUNCTION OF MESSAGE  */
        $scope.paginate = function (pageno) {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.index();
        };

        /**GETTING THE MESSAGE ARRAY FOR MULPTIPLE READ, UNREAD AND DELETE*/
        function getMessageDetails() {
            model.checked_row = getChecked(model.MessageArray);
        }

        function getChecked(obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push(key);
                }
            }
            return checked;
        }
        /** *MULTIPLE READ,UNREAD FUNCTION */
        function MultipleProcess(type) {
            var index = model.checked_row.shift();
            var params = {};
            params.id = model.userMessages[index].id;
            params.is_read = (type === 'read') ? 1 : 0;
            MessageFactory.update(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (model.checked_row.length > 0) {
                            MultipleProcess(type);
                        } else {
                            succsMsg = $filter("translate")("The conversation has been marked as " + type + '.');
                            flash.set(succsMsg, 'success', false);
                            model.MessageArray = {};
                            getUserMessage();
                            $scope.$emit('updateMessageParent', {});
                        }
                    }
                });
        }

        function messageDeleteConfirm() {
            AlertBox.confirm('Are you sure you want to delete the conversation?', function (isConfirmed) {
                if (isConfirmed) {
                    MultipleDeleteProcess();
                }
            });
        }
        /**MESSAGE DELETE FUNCTION */
        function MultipleDeleteProcess() {
            var index = model.checked_row.shift();
            var params = {};
            params.id = model.userMessages[index].id;
            MessageFactory.remove(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (model.checked_row.length > 0) {
                            MultipleDeleteProcess();
                        } else {
                            succsMsg = $filter("translate")("The conversation has been deleted.");
                            flash.set(succsMsg, 'success', false);
                            model.MessageArray = {};
                            getUserMessage();
                            $scope.$emit('updateMessageParent', {});
                        }
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while deleting the conversation. Try again later");
                    flash.set(flashMessage, 'error', false);
                });
        }

        //Opening the Compose Model
        $scope.openComposeModel = function () {
            $scope.message_disableButton = false;
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'src/plugins/Message/ComposeMessage.tpl.html',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.message']) && $ocLazyLoad.getModules().indexOf('ace.message') === -1) {
                                        requiredPlugins.push(data['ace.message']);
                                    }
                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
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
                });
                $rootScope.modal = true;
            }
        };
        /**LOADING THE USERS FOR AUTOCOMPLETED  */
        $scope.loadTags = function (query) {
            return AllUserList.get({
                q: query,
                type: $scope.type
                // fields: 'id,displayname'
            })
                .$promise.then(function (response) {
                    if (angular.isDefined(response.data) && response.data.length > 0) {
                        $scope.newEntry = [];
                        angular.forEach(response.data, function (tag) {
                            if ($scope.type === 'Instructor') {
                                $scope.newEntry.push({
                                    'id': tag.user_id,
                                    'text': tag.teacher_name
                                });

                            } else if ($scope.type === 'Student') {
                                $scope.newEntry.push({
                                    'id': tag.user_id,
                                    'text': tag.learner_name
                                });
                            }

                        });
                    } else {
                        $scope.newEntry = [];
                    }
                    return $scope.newEntry;
                });
        };

        /**SENDING THE MESSAGE TO THE MULTIPLE USERS */
        function sendMesssage($valid) {
            if ($valid) {
                model.instructor.user_id = [];
                angular.forEach($scope.tags, function (tag) {
                    model.instructor.user_id.push({
                        'user_id': tag.id
                    });
                });
                $scope.message_disableButton = true;
                CourseBatchMessage.create(model.instructor, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Message  has been Send successfully.");
                        flash.set(flashMessage, 'success', false);
                        getUserMessage();
                        $uibModalStack.dismissAll();
                        model.instructor = {};
                        $scope.tags = [];
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
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();
            $scope.tags = [];
            model.instructor = {};
        };

        /**GETTING THE USER DETAILS */
        function getUserDetails() {
            var params = {};
            params.field = "is_teacher";
            UserDetailService.get({
                id: $rootScope.auth.id
            }, params, function (response) {
                if (response.data.length > 0) {
                    var is_teacher = response.data[0].is_teacher;
                    $scope.type = (is_teacher === 0) ? 'Instructor' : 'Student';
                }
            });
        }

        /**INIT FUNCTION DECLARATION  */
        $scope.index = function () {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            getUserMessage();
            getUserDetails();
        };
        /**INIT FUNCTION CALLING  */
        $scope.index();

    });

})(angular.module('ace.message'));

/**BATCH MESSAGE CONTROLLER  */
(function (module) {
    module.directive('courseBatchMessage', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/Message/CourseBatchMessageButton.tpl.html",
            link: linker,
            controller: 'courseBatchMessageButtonController as model',
            bindToController: true,
            scope: {
                coursebatchId: '@coursebatchId',
            }
        };
    });
    module.controller('courseBatchMessageButtonController', function ($scope) {
        var model = this;
        $scope.coursebatchId = model.coursebatchId;
    });
    module.controller('courseBatchMessageController', function ($state, $scope, $rootScope, $filter, $uibModalStack, $uibModal, Batch, CourseBatchMessage, flash, course_id, classType, Type) {
        var model = this;
        model.batch = {};
        model.loading = true;
        model.sendMessage = sendMessage;
        $rootScope.pageTitle = $filter("translate")("Batch Message")+ " | " +$rootScope.settings['site.name'];
        model.type = Type;
        model.Batch_details = Batch;

        function sendMessage() {
            $scope.message_disableButton = true;
            if (Type === 'Batch') {
                model.batch.class = classType;
                model.batch.course_batch_id = Batch.id;
                model.batch.type = 'Promotion';
            } else if (Type === 'User') {
                model.batch.user_id = [];
                model.batch.class = classType;
                model.batch.foreign_id = course_id;
                model.batch.user_id.push({
                    'user_id': Batch.user_id
                });
            }
            CourseBatchMessage.create(model.batch, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Message has been Send successfully.");
                    flash.set(flashMessage, 'success', false);
                    $scope.$close();
                    $scope.offline_course = {};
                } else {
                    flashMessage = $filter("translate")("Message could not be Sended. Try again later");
                    flash.set(flashMessage, 'error', false);
                    $scope.$close();
                }
                $scope.message_disableButton = false;
            }, function (error) {
                if (error.status === 404) {
                    flashMessage = $filter("translate")("Message could not be Sended. Try again later");
                    flash.set(flashMessage, 'error', false);
                }
                $scope.message_disableButton = false;
                $scope.$close();
            });
        }
        $scope.modalClose = function (e) {
            e.preventDefault();
            $scope.$close();
        };
    });
})(angular.module('ace.message'));

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
    module.factory('AllUserList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/search_users', {
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
})(angular.module("ace.message"));
