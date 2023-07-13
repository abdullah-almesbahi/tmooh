(function (module) {

    module.controller('learningController', function ($state, Course, $scope, Learning, $rootScope, AddFavourite, Archive, flash, $filter, TokenServiceData, CourseType, CourseUserList, $timeout, Common, $uibModal, $uibModalStack, $window, Groups, Unarchive, ConstDateFormat) {
        var model = this;
        $rootScope.pageTitle =   $filter("translate")("My Learning Courses") + " | " + $rootScope.settings['site.name'];
        model.learningCourses = [];
        model.loader = true;
        model.addToFavourite = addToFavourite;
        model.addToArchive = addToArchive;
        model.addToUnarchive = addToUnarchive;
        model.archive = new Archive();
        model.unarchive = new Unarchive();
        $scope.ConstDateFormat = ConstDateFormat;
        $scope.userID = $rootScope.auth ? $rootScope.auth.id : '';
        $rootScope.activeMenu = 'dashboard';
        model.getLearningCourses = getLearningCourses;
        model.openWebinarCourseModal = openWebinarCourseModal;
        model.OpenWebinarWindow = OpenWebinarWindow;
        model.openOfflineCourseModal = openOfflineCourseModal;
        $scope.CourseType = CourseType;

        function getLearningCourses(element) {
            GetGroup();
            model.loader = true;
            $scope.ordering = '';
            userID = $rootScope.auth.id;
            var params = {};
            $timeout(function () {
                if (model.Instructor !== null && model.Instructor !== undefined && $state.params.instructor !== undefined) {
                    if (parseInt($state.params.instructor) === -1) {
                        params.teacher_user_id = null;
                        $scope.instructor = false;
                    } else {
                        $scope.instructor = model.Instructor[$state.params.instructor];
                        params.teacher_user_id = model.Instructor[$state.params.instructor].teacher_id;
                    }

                }
            }, 500);
            $timeout(function () {
                if (model.parentCategories !== null && model.parentCategories !== undefined && $state.params.category_id !== undefined) {
                    if (parseInt($state.params.category_id) === -1) {
                        $scope.category = false;
                        params.category_id = null;
                    } else {
                        $scope.category = model.parentCategories[$state.params.category_id];
                        params.category_id = model.parentCategories[$state.params.category_id].id;
                    }
                }
            }, 500);
            $scope.csearchVal = $state.params.q;
            $scope.type = $state.params.type;
            $scope.feature = $state.params.feature;
            orderingval = $state.params.ordering;
            $scope.ordering = $state.params.ordering;
            if ($state.params.feature === 'closed_captions') {
                params.closed_captions = 1;
            } else if ($state.params.feature === 'quiz') {
                params.quiz = 1;

            } else if ($state.params.feature === 'coding_exercises') {
                params.coding_exercises = 1;

            } else if ($state.params.feature === 'assignment') {
                params.is_assignment = 1;
            } else if ($state.params.feature === 'practise_test') {
                params.is_practice_test = 1;
            }
            if (orderingval === 'favourites') {
                params.filter = 'favourites';
            } else if (orderingval === 'in_progress') {
                params.filter = 'in_progress';
            } else if (orderingval === 'not_started') {
                params.filter = 'not_started';
            } else if (orderingval === 'completed') {
                params.filter = 'completed';
            } else if (orderingval === 'archived') {
                params.filter = 'archived';
            } else if (orderingval === null || orderingval === undefined) {
                params.filter = 'active';
            }
            if (orderingval === 'created') {
                params.sort = 'id';
                params.sort_by = 'DESC';
            }
            if (orderingval === '-created') {
                params.sort = 'id';
                params.sort_by = 'ASC';
            }
            if (orderingval === 'title') {
                params.sort = 'course_title';
                params.sort_by = 'ASC';
            }
            if (orderingval === '-title') {
                params.sort = 'course_title';
                params.sort_by = 'DESC';
            }
            if (orderingval === '-title') {
                params.sort = 'course_title';
                params.sort_by = 'DESC';
            }
            params.q = $state.params.q;
            params.course_type_id = $scope.CourseType[$state.params.type];
            params.page = $scope.currentPage;
            params.id = userID;
            params.limit = 12;
            $timeout(function () {
                Learning.get(params).$promise.then(function (response) {
                    model.learningCourses = response;
                    angular.forEach(model.learningCourses.data, function (learn_course) {
                        if (learn_course.course_batches !== null && learn_course.course_batch_id !== null) {
                            learn_course.course_batches = $filter('CountryTimezone')(learn_course.course_batches, ['start_date', 'end_date'], 'TimeZoneSet', ConstDateFormat.mediumDate);
                            angular.forEach(learn_course.course_batches, function (value) {
                                var today = new Date(),
                                    currentdate = $filter('date')(Date.parse(today), "yyyy-MM-dd"),
                                    currenttime = $filter('date')(Date.parse(today), "HH:mm"),
                                    enddate = $filter('date')(Date.parse(value.end_date), "yyyy-MM-dd"),
                                    startdate = $filter('date')(Date.parse(value.start_date), "yyyy-MM-dd"),
                                    session_length = 0,
                                    session_share = 0;
                                if (learn_course.is_offline) {
                                    learn_course.offline_course = true;
                                    value.course_offline_sessions = $filter('CountryTimezone')(value.course_offline_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
                                    if (currentdate > startdate && currentdate > enddate) {
                                        learn_course.progess_percentage = 100;
                                    } else if (currentdate < startdate && currentdate < enddate) {
                                        learn_course.progess_percentage = 0;
                                    } else if ((currentdate == startdate && currentdate < enddate) || (currentdate > startdate && currentdate < enddate) || (currentdate == startdate && currentdate == enddate) || (currentdate > startdate && currentdate == enddate)) {
                                        learn_course.progess_percentage = 0;
                                        session_length = value.course_offline_sessions.length;
                                        session_share = Math.ceil((100 / parseInt(session_length)));
                                        for (i = 0; i < session_length; i++) {
                                            session_date = $filter('date')(Date.parse(value.course_offline_sessions[i].session_date), "yyyy-MM-dd");
                                            session_time = $filter('date')(Date.parse(value.course_offline_sessions[i].session_date), "HH:mm");
                                            if (session_date == currentdate && currenttime < session_time) {
                                                learn_course.progess_percentage += 0;
                                            } else if (session_date == currentdate && (currenttime == session_time || currenttime > session_time)) {
                                                learn_course.progess_percentage += session_share;
                                            } else if (session_date < currentdate) {
                                                learn_course.progess_percentage += session_share;

                                            } else if (session_date > currentdate) {
                                                learn_course.progess_percentage += 0;
                                            }
                                        }
                                    }
                                    if (learn_course.progess_percentage > 100) {
                                        learn_course.progess_percentage = 100;
                                    }
                                }


                                //   Webinar course condition for completion
                                if (!learn_course.is_offline) {
                                    learn_course.webinar_course = true;
                                    learn_course.course_webinar_sessions = $filter('CountryTimezone')(value.course_webinar_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
                                    if (currentdate > startdate && currentdate > enddate) {
                                        learn_course.progess_percentage = 100;
                                    } else if (currentdate < startdate && currentdate < enddate) {
                                        learn_course.progess_percentage = 0;
                                    } else if ((currentdate == startdate && currentdate < enddate) || (currentdate > startdate && currentdate < enddate) || (currentdate == startdate && currentdate == enddate) || (currentdate > startdate && currentdate == enddate)) {
                                        learn_course.progess_percentage = 0;
                                        session_length = value.course_webinar_sessions.length;
                                        session_share = Math.ceil((100 / parseInt(session_length)));
                                        for (i = 0; i < session_length; i++) {
                                            session_date = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "yyyy-MM-dd");
                                            session_time = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "HH:mm");
                                            if (session_date == currentdate && currenttime < session_time) {
                                                learn_course.progess_percentage += 0;
                                            } else if (session_date == currentdate && (currenttime == session_time || currenttime > session_time)) {
                                                learn_course.progess_percentage += session_share;
                                            } else if (session_date < currentdate) {
                                                learn_course.progess_percentage += session_share;
                                            } else if (session_date > currentdate) {
                                                learn_course.progess_percentage += 0;
                                            }
                                        }
                                    }
                                    if (learn_course.progess_percentage > 100) {
                                        learn_course.progess_percentage = 100;
                                    }
                                }
                            });
                        } else {
                            learn_course.vedio_course = true;
                        }
                    });
                    $scope._metadata = response._metadata;
                    model.loader = false;
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 2000, 'swing', false);
                    }
                });
            }, 500);
        }

        function addToFavourite(courseID, e) {
            e.preventDefault();
            courseArr = {
                course_id: courseID
            };
        }
        $scope.index = function (element) {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            getLearningCourses(element);
            getParentCategory();
            getInstructor();
        };

        function getInstructor() {
            model.Instructor = [];
            CourseUserList.get({
                limit: 'all',
                type: 'Instructor',
                field: 'id,code,leaner_name,teacher_name,teacher_id,learner_id',
                sort_by: 'ASC',
            }, function (response) {
                if (response.data.length > 0) {
                    response.data = $filter('validData')(response.data, ['teacher_id', 'teacher_name']);
                    angular.forEach(response.data, function (user) {
                        model.Instructor.push({
                            'id': user.id,
                            'leaner_name': user.learner_name,
                            'teacher_name': user.teacher_name,
                            'teacher_id': user.teacher_user_id,
                            'learner_id': user.user_id
                        });
                    });
                }
            });
        }
        $scope.index(null);
        $scope.paginate = function (element) {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.index(element);
        };

        function openOfflineCourseModal(index) {
            $scope.batch_details = model.learningCourses.data[index].course_batches[0];
            if ($scope.batch_details.course_offline_sessions !== null) {
                angular.forEach($scope.batch_details.course_offline_sessions, function (offline_session) {
                    offline_session.format_session_date = $filter('date')(Date.parse(offline_session.session_date), ConstDateFormat.mediumDate);
                    $scope.batch_details.addresss = offline_session.address;
                    $scope.batch_details.city_name = offline_session.city_name;
                    $scope.batch_details.state_name = offline_session.state_name;
                    $scope.batch_details.country_name = offline_session.country_name;
                });
            }
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/OfflineCourse/myCourseOfflineBatch.tpl.html',
                size: 'lg',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        }

        function openWebinarCourseModal(index) {
            $scope.webinar_batch_details = model.learningCourses.data[index].course_batches[0];
            angular.forEach($scope.webinar_batch_details.course_webinar_sessions, function (webinar_session) {
                webinar_session.format_session_date = $filter('date')(Date.parse(webinar_session.session_date), ConstDateFormat.mediumDate);
            });
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/WebinarCourses/myCourseWebianerBatch.tpl.html',
                size: 'lg',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        }

        function OpenWebinarWindow(index) {
            if ($scope.webinar_batch_details !== null && $scope.webinar_batch_details !== undefined) {
                if ($scope.webinar_batch_details.course_webinar_sessions !== null && $scope.webinar_batch_details.course_webinar_sessions !== undefined) {
                    if ($scope.webinar_batch_details.course_webinar_sessions[index].webinar_url !== null && $scope.webinar_batch_details.course_webinar_sessions[index].webinar_url !== undefined) {
                        var w = 1000,
                            h = 600,
                            left = (window.screen.width / 2) - ((w / 2) + 10),
                            top = (window.screen.height / 2) - ((h / 2) + 50);
                        var win = window.open($scope.webinar_batch_details.course_webinar_sessions[index].webinar_url, 'popupWindow',
                            "status=no,height=" + 600 + ",width=" + 1000 + ",resizable=yes,left=" +
                            left + ",top=" + top + ",screenX=" + left + ",screenY=" +
                            top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
                    }
                }
            }
        }

        function addToArchive(courseUserID, e, ordering) {
            e.preventDefault();
            model.archive.id = courseUserID;
            model.archive.$save()
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (ordering !== '') {
                            var delElement = angular.element(document.querySelector('#learning_elements_' + courseUserID));
                            delElement.remove();
                        }
                        // to hide pagination when course length is 0
                        learning_course = angular.element(document.getElementsByClassName('course-listing'));
                        learning_course_length = learning_course.children().length;
                        if (angular.isDefined(learning_course_length) && learning_course_length <= 0) {
                            angular.element(document.getElementsByClassName('paging')).addClass("ng-hide");
                        }
                        flashMessage = $filter("translate")("Archived Successfully");
                        flash.set(flashMessage, 'success', false);
                    }
                })
                .catch(function (error) {
                    flashMessage = $filter("translate")("Unable to archive course.");
                    flash.set(flashMessage, 'error', false);
                })
                .finally();
        }

        function addToUnarchive(courseUserID, e) {
            e.preventDefault();
            model.unarchive.id = courseUserID;
            model.unarchive.$save()
                .then(function (response) {
                    if (response.error.code === 0) {
                        // to hide pagination when course length is 0
                        getLearningCourses(null);
                        flashMessage = $filter("translate")("Unarchived Successfully");
                        flash.set(flashMessage, 'success', false);
                    }
                })
                .catch(function (error) {
                    flashMessage = $filter("translate")("Unable to unarchive course.");
                    flash.set(flashMessage, 'error', false);
                })
                .finally();
        }
        //Getting groups
        function GetGroup() {
            model.groups = [];
            var params = {};
            params.user_id = $rootScope.auth.id;
            Groups.get(params, function (response) {
                if (response.data.length > 0) {
                    model.groups = response.data;
                }
            });
        }
        //model closing
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();

        };

        function getParentCategory() {
            filter_parent = "parent";
            Common.get({
                category_type: filter_parent,
                limit: "all",
                filter: "active",
                sort_by: 'ASC',
                sort: 'sub_category_name',
                field: "id,sub_category_name"
            }).$promise.then(function (response) {
                if (response.data.length > 0) {
                    model.parentCategories = $filter('validData')(response.data, 'sub_category_name');
                }
            });
        }
        $scope.goToState = function (state, params) {
            $state.go(state, params);
        };
    });
} (angular.module("ace.courses")));
