(function(module) {
    module.controller('CourseForumController', function($state, $rootScope, $scope, $filter, TokenServiceData, CourseAnnoucementMessage, $location, $timeout, Teaching, MessageFactory) {
        $rootScope.pageTitle =  $filter("translate")("My Courses") + " | " +  $rootScope.settings['site.name'];
        var model = this;
        model.loader = true;
        $scope.messagesort = {};
        model._metadata = [];
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'forum';
        model.showMessage = showMessage;

        function getCoursesforum(element) {
            model.loading = true;
            params = {};
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
                params.sort_by = 'ASC';
            }
            if ($state.params.unanswered === '0') {
                params.no_top_answer = 0;
                $scope.messagesort.no_top_answer = 0;
                params.sort_by = 'DESC';
            }
            if ($state.params.unread === '0') {
                params.is_read = 0;
                $scope.messagesort.no_unread = 0;
            }
            if ($state.params.unread === '1') {
                params.is_read = 1;
                $scope.messagesort.no_unread = 1;
            }
            if ($state.params.unresponded === '1') {
                params.no_response = 1;
                $scope.messagesort.no_response = 1;
                params.sort_by = 'ASC';
            }
            if ($state.params.unresponded === '0') {
                params.no_response = 0;
                $scope.messagesort.no_response = 0;
                params.sort_by = 'DESC';
            }
            $timeout(function() {
                if (model.teachingCourses !== null && model.teachingCourses !== undefined && $state.params.course_id !== undefined) {
                    if (parseInt($state.params.course_id) === -1) {
                        params.course_id = null;
                        $scope.course_filter = false;
                    } else {
                        params.course_id = model.teachingCourses[$state.params.course_id].id;
                        $scope.course_filter = model.teachingCourses[$state.params.course_id];
                    }
                }
                params.type = 'inbox';
                params.page = model._metadata.currentPage;
                CourseAnnoucementMessage.get(params).$promise.then(function(response) {
                    model.forumCourses =$filter('CountryTimezone')(response.data,['created'], 'TimeZoneSet');
                    model._metadata = response._metadata;
                    angular.forEach(model.forumCourses, function(message) {
                        message.isShowContent = false;
                        angular.forEach(message.other_user, function(other_user) {
                            message.other_user = other_user.username;
                            message.other_user_image = other_user.image_hash;
                        });
                        angular.forEach(message.user, function(user) {
                            message.user = user.username;
                        });
                    });
                    model.loader = false;
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 2000, 'swing', false);
                    }
                });
            }, 100);

        }
        $scope.index = function(element) {
            getCoursesforum(element);
        };
        /**ShOWING MESSAGE CONTENT */
        function showMessage(index, e, type) {
            e.preventDefault();
            if (type === 'Show') {
                model.forumCourses[index].isShowContent = !model.forumCourses[index].isShowContent;
                MessageUpdate('read', index);
            } else if (type === 'Reply') {
                model.forumCourses[index].isShowReply = !model.forumCourses[index].isShowReply;
            }
        }
        /** SINGLE MESSAGE UPDATE FUNCTION */
        function MessageUpdate(type, index) {
            var params = {};
            params.id = model.forumCourses[index].id;
            params.is_read = 1;
            MessageFactory.update(params).$promise
                .then(function(response) {
                    if (response.error.code === 0) {
                        if (type === 'read') {
                            model.forumCourses[index].is_read = true;

                        } else if (type === 'unread') {
                            model.forumCourses[index].is_read = false;

                        }
                    }
                });
        }
        $scope.CourseFilter = function(index, type) {
            if (type !== 'All') {
                $scope.course_filter = model.teachingCourses[index];
                $location
                    .search('course_id', index);
                $timeout(function() {
                    getCoursesforum(null);
                }, 1000);
            } else {
                $scope.course_filter = false;
                $location
                    .search('course_id', -1);
                $timeout(function() {
                    getCoursesforum(null);
                }, 1000);
            }

        };
        $scope.Sort = function(a) {
            if (a !== undefined && a !== null) {
                $scope.messagesort.sortby = a;
            }
            $location
                .search('ordering', $scope.messagesort.sortby)
                .search('unanswered', $scope.messagesort.no_top_answer)
                .search('unread', $scope.messagesort.no_unread)
                .search('unresponded', $scope.messagesort.no_response);
            $timeout(function() {
                getCoursesforum(null);
            }, 1000);
        };
        /**GETTING THE COURSES OF INSTRUCTOR */
        function getInstructorCourses() {
            var params = {};
            params.id = $rootScope.auth.id;
            params.limit = 'all';
            Teaching.get(params).$promise.then(function(response) {
                model.teachingCourses = response.data;
            });
        }
        $scope.index(null);
        getInstructorCourses();
        $scope.paginate = function(element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
        $scope.goToState = function(state, params) {
            $state.go(state, params);
        };
    });
}(angular.module("ace.courses")));
