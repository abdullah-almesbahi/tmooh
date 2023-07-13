/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.webinarCourse', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('webinarCourseBatch', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/WebinarCourses/webinarCourseBatch.tpl.html',
            link: linker,
            controller: 'webinarCourseBatchController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
                userId: '@userId',
                coursePrice: '@coursePrice',
                courseUser: '@courseUser',
                slug: '@slug',
                title: '@title'
            }
        };
    });
    module.controller('webinarCourseBatchController', function ($rootScope, $scope, WebinarBatchesLists, $filter, $state, $uibModal, $uibModalStack, DemoSessionList, ConstDateFormat, ConstTimeZoneConversion) {
        /*Constants*/
        $scope.ConstTimeZoneConversion = ConstTimeZoneConversion;
        /* Assign this as model */
        var model = this;
        model.loader = true;
        if (model.courseUser !== undefined && model.courseUser !== null && model.courseUser !== '') {
            $scope.courseusers = JSON.parse(model.courseUser);
        }
        model.webinar_batch_listing = [];
        if ($state.params.id !== null && $state.params.id !== undefined) {
            model.loader = true;

            var params = {};
            params.limit = 'all';
            params.course_id = $state.params.id;
            WebinarBatchesLists.get(params).$promise
                .then(function (response) {
                    if (angular.isDefined(response.data)) {
                        response.data = $filter('CountryTimezone')(response.data, ['start_date', 'end_date'], 'TimeZoneSet', 'dd MMM yyyy hh:mm:ss');
                        angular.forEach(response.data, function (batch) {
                            if (!batch.is_offline) {
                                if ($scope.courseusers !== null && $scope.courseusers !== undefined) {
                                    if ($scope.courseusers.length > 0) {
                                        var sucesscount = 0;
                                        angular.forEach($scope.courseusers, function (course_user) {
                                            if (sucesscount < 1) {
                                                if (parseInt(course_user.course_batch_id) === parseInt(batch.id)) {
                                                    batch.pruchased = true;
                                                    sucesscount++;
                                                } else {
                                                    batch.pruchased = false;
                                                }
                                            }
                                        });
                                    }

                                } else {
                                    batch.pruchased = false;
                                }
                                batch.start_batch_date = $filter('date')(Date.parse(batch.start_date), 'dd');
                                batch.start_batch_month = $filter('date')(Date.parse(batch.start_date), 'MMM ');
                                batch.start_batch_day = $filter('date')(Date.parse(batch.start_date), 'EEE');
                                batch.end_batch_date = $filter('date')(Date.parse(batch.end_date), 'dd');
                                batch.end_batch_month = $filter('date')(Date.parse(batch.end_date), 'MMM ');
                                if (batch.course_webinar_sessions !== null) {
                                    batch.notifications = {};
                                    batch.course_webinar_sessions = $filter('CountryTimezone')(batch.course_webinar_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', 'dd MMM yyyy hh:mm:a');
                                    angular.forEach(batch.course_webinar_sessions, function (session) {
                                        var session_date = $filter('date')(Date.parse(session.session_date), 'dd');
                                        var session_month = $filter('date')(Date.parse(session.session_date), 'MMM');
                                        var session_time = $filter('date')(Date.parse(session.session_date), 'hh:mm a');
                                        var end_session_time = $filter('date')(Date.parse(session.session_end_date), 'hh:mm a');
                                        var session_day = $filter('date')(Date.parse(session.session_date), 'EEE');
                                        if (!angular.isDefined(batch.notifications[session_month])) {
                                            batch.notifications[session_month] = [];
                                            batch.notifications[session_month].push({
                                                days: []
                                            });
                                            if (angular.isDefined(batch.notifications[session_month])) {
                                                batch.notifications[session_month][0].days.push({
                                                    'date': session_date,
                                                    'day': session_day,
                                                    'topic': session.lesson_topic,
                                                    'description': session.lesson_description,
                                                    'time': session_time,
                                                    'end_time': end_session_time,
                                                    'timezone': session.utc_offset,
                                                    /*User Time zone*/
                                                    'user_start_time': $filter('date')(Date.parse(session.user_session_date), 'hh:mm a'),
                                                    'user_end_time': $filter('date')(Date.parse(session.user_session_end_date), 'hh:mm a'),
                                                    'user_timezone': session.user_timezone

                                                });
                                            }
                                        } else if (angular.isDefined(batch.notifications[session_month])) {
                                            batch.notifications[session_month][0].days.push({
                                                'date': session_date,
                                                'day': session_day,
                                                'topic': session.lesson_topic,
                                                'description': session.lesson_description,
                                                'time': session_time,
                                                'end_time': end_session_time,
                                                'timezone': session.utc_offset,
                                                /*User Time zone*/
                                                'user_start_time': $filter('date')(Date.parse(session.user_session_date), 'hh:mm a'),
                                                'user_end_time': $filter('date')(Date.parse(session.user_session_end_date), 'hh:mm a'),
                                                'user_timezone': session.user_timezone
                                            });
                                        }
                                    });
                                    model.webinar_batch_listing.push(batch);
                                }
                            }

                        });
                    }
                    model.loader = false;
                });
        }
        $scope.modalWebinarBatch = function (e) {
            e.preventDefault();
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                size: 'lg',
                templateUrl: 'src/plugins/WebinarCourses/webinarBatch_model.tpl.html',
                resolve: {
                    pageType: function () {
                        return "modal";
                    },
                }
            });
        };

        function demoScheduleDetails() {
            DemoSessionList.get({
                course_id: $state.params.id,
                type: 'online'
            }).$promise.then(function (response) {
                angular.forEach(response.data, function (demo_session) {
                    demo_session.utc_offset = demo_session.timezone_utc_offset;
                });
                model.demosession_data = $filter('CountryTimezone')(response.data, ['session_start_date', 'session_end_date'], 'TimeZoneSessionSet', 'dd MMM yyyy hh:mm a');
                angular.forEach(model.demosession_data, function (session) {
                    session.start_batch_date = $filter('date')(Date.parse(session.session_start_date), 'dd');
                    session.start_batch_month = $filter('date')(Date.parse(session.session_start_date), 'MMM ');
                    session.start_batch_day = $filter('date')(Date.parse(session.session_start_date), 'EEE');
                    session.session_time = $filter('date')(Date.parse(session.session_start_date), 'hh:mm a');
                    session.end_session_time = $filter('date')(Date.parse(session.session_end_date), 'hh:mm a');
                    /*User browser time zone */
                    session.user_start_session_time = $filter('date')(Date.parse(session.user_session_start_date), 'hh:mm a');
                    session.user_end_session_time = $filter('date')(Date.parse(session.user_session_end_date), 'hh:mm a');
                });

            }, function (error) { });
        }
        $scope.modalDemoShow = function (e, index) {
            e.preventDefault();
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                size: 'lg',
                templateUrl: 'src/plugins/WebinarCourses/webinarDemoBatch_model.tpl.html',
                resolve: {
                    pageType: function () {
                        return "modal";
                    },
                }
            });
        };

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
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();

        };
        demoScheduleDetails();
    });
    module.directive('webinarCourse', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/WebinarCourses/webinarCourseButton.tpl.html',
            link: linker,
            controller: 'webinarCourseButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('webinarCourseButtonController', function ($rootScope) {
        var model = this;
    });
    module.controller('webinarCourseController', function ($state, CourseWebinarSession, TimezoneList, $location, $scope, flash, $filter, $rootScope, $interval, User, UserProfile, moment, WebinarBatchesLists, $uibModal, $uibModalStack, GetCurrencyList, WebinarSessions, AlertBox, ConstDateFormat, ConstToolTipContent) {
        $rootScope.pageTitle = $filter("translate")("Manage Webinar Course")+ " | " +$rootScope.settings['site.name'];
        /**VARIABLE DECLARATION */
        $scope.webinar_course = {};
        $scope.ConstToolTipContent = ConstToolTipContent;
        var model = this;

        /**VARIABLE VALUE ASSIGNING  */
        model.course_id = $state.params.id;
        $scope.webinar_course.course_id = $state.params.id;
        model.loading = true;
        /**FUNCTION ASSIGNING WITH MODEL */
        model.CurrencyTireFilter = CurrencyTireFilter;
        model.TireFilter = TireFilter;
        model.addCourseWebinarSession = addCourseWebinarSession;
        model.editCourseWebinarSession = editCourseWebinarSession;
        model.removeCourseWebinarSession = removeCourseWebinarSession;
        $scope.ConstDateFormat = ConstDateFormat;
        model.paginate = paginate;
        model.AddingWebinarSession = AddingWebinarSession;
        model.sort = sort;
        model.dateInit = dateInit;
        model.sessions = [];
        model.webinar_action = 'list';
        /**FUNCTION DECALARATION  */
        //Need to check the paid course agreement
        if ($rootScope.auth) {
            User.getUser({
                id: $rootScope.auth.id,
                field: 'id,is_paid_course_terms_and_conditions',
            }).$promise
                .then(function (response) {
                    if (response !== null && response !== undefined) {
                        if (response.data !== null && response.data !== undefined) {
                            if (response.data.length > 0) {
                                model.user_paid_agree = response.data[0].is_paid_course_terms_and_conditions;
                            } else {
                                model.user_paid_agree = false;
                            }
                        }
                    }

                }, function (error) {
                    model.user_paid_agree = false;
                });
        }
        //Date Formatting init function
        function dateInit() {
            model.sessions = [];
            $scope.webinar_course = {};
            $scope.webinar_course.course_id = $state.params.id;
            angular.forEach(model.currencies, function (currency) {
                if ($rootScope.settings['site.currency_code'] === currency.code) {
                    $scope.selected = currency;
                    $scope.webinar_course.currency_id = currency.id;
                    if (currency.currencies_tiers !== null) {
                        model.currencies_tiers = currency.currencies_tiers;
                    }
                }
            });
            $scope.tier_selected = null;
            model.sessions = [];
            var today = new Date();
            model.picker1 = {
                datepickerOptions: {
                    minDate: new Date(),
                    showWeeks: false
                }
            };
            model.picker2 = {
                datepickerOptions: {
                    minDate: new Date(),
                    showWeeks: false
                }
            };
        }
        //init function to get the offline course listing ..

        $scope.init = function (element) {
            GetCurrencyList.get({
                limit: 'all'
            }).$promise
                .then(function (response) {
                    model.currencies = response.data;
                });

            //model.addform = false;
            model.webinarCoursesList = [];
            var params = {};
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            if (model.currentSort !== undefined && model.currentSort !== null) {
                params.filter = model.currentSort;
            } else {
                params.filter = 'all';
                model.currentSort = 'all';
            }
            params.sortby = 'DESC';
            params.sort = 'id';
            params.course_id = $state.params.id;
            params.type = 'Instructor';
            WebinarBatchesLists.get(params).$promise
                .then(function (response) {
                    model._metadata = response._metadata;
                    if (response.data !== undefined && response.data.length > 0) {
                        response.data = $filter('CountryTimezone')(response.data, ['start_date', 'end_date'], 'TimeZoneSet', ConstDateFormat.mediumDate);
                        angular.forEach(response.data, function (value) {
                            if (!value.is_offline) {
                                //Fomatting the  Date of Course User
                                if (value.course_users !== undefined && value.course_users !== null) {
                                    if (value.course_users.length > 0) {
                                        value.course_users = $filter('CountryTimezone')(value.course_users, ['created'], 'TimeZoneSet', ConstDateFormat.created_12);
                                    }
                                }
                                //Formatting the Date of Offline Sessions
                                if (value.course_webinar_sessions !== undefined && value.course_webinar_sessions !== null) {
                                    if (value.course_webinar_sessions.length > 0) {
                                        value.course_webinar_sessions = $filter('CountryTimezone')(value.course_webinar_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
                                    }
                                }
                                var today = new Date(),
                                    currentdate = $filter('date')(Date.parse(today), "yyyy-MM-dd"),
                                    currenttime = $filter('date')(Date.parse(today), "HH:mm"),
                                    enddate = $filter('date')(Date.parse(value.end_date), "yyyy-MM-dd"),
                                    startdate = $filter('date')(Date.parse(value.start_date), "yyyy-MM-dd"),
                                    session_length = 0,
                                    session_share = 0;
                                if (currentdate > startdate && currentdate > enddate) {
                                    value.progess_percentage = 100;
                                } else if (currentdate < startdate && currentdate < enddate) {
                                    value.progess_percentage = 0;
                                } else if ((currentdate == startdate && currentdate < enddate) || (currentdate > startdate && currentdate < enddate) || (currentdate == startdate && currentdate == enddate) || (currentdate > startdate && currentdate == enddate)) {
                                    value.progess_percentage = 0;
                                    session_length = value.course_webinar_sessions.length;
                                    session_share = Math.ceil((100 / parseInt(session_length)));
                                    for (i = 0; i < session_length; i++) {
                                        session_date = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "yyyy-MM-dd");
                                        session_time = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "HH:mm");
                                        if (session_date == currentdate && currenttime < session_time) {
                                            value.progess_percentage += 0;
                                        } else if (session_date == currentdate && (currenttime == session_time || currenttime > session_time)) {
                                            value.progess_percentage += session_share;
                                        } else if (session_date < currentdate) {
                                            value.progess_percentage += session_share;
                                        } else if (session_date > currentdate) {
                                            value.progess_percentage += 0;
                                        }
                                    }
                                }
                                if (value.progess_percentage > 100) {
                                    value.progess_percentage = 100;
                                }
                                value.progress_type = "success";
                                model.webinarCoursesList.push(value);
                            }
                        });
                    }
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 1500, 'swing', false);
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

        };
        // function to get the time zone  listing ..


        $scope.EditWebinar = function (id, index) {
            model.editform = true;
            model.addform = false;
            model.listform = false;
            $scope.edit_webinar_course = {};
            WebinarSessions.get({
                id: id
            }).$promise
                .then(function (response) {
                    $scope.editdata = response.data;
                    if (response.data.length > 0) {
                        if (response.data[0].course_webinar_sessions !== null && response.data[0].course_webinar_sessions !== undefined) {
                            if (response.data[0].course_webinar_sessions.length > 0) {
                                $scope.edit_webinar_course.id = response.data[0].id;
                                model.edit_picker1 = { date: new Date(response.data[0].start_date), datepickerOptions: { minDate: new Date(), showWeeks: false, } };
                                model.edit_picker2 = { date: new Date(response.data[0].end_date), datepickerOptions: { minDate: new Date(), showWeeks: false, } };
                                angular.forEach(model.currencies, function (currency) {
                                    if (parseInt(response.data[0].course_batche_currency_id) === parseInt(currency.id)) {
                                        $scope.selected = currency;
                                        $scope.edit_webinar_course.currency_id = currency.id;
                                        if (currency.currencies_tiers !== null && response.data[0].course_batche_tier_id !== null) {
                                            model.currencies_tiers = currency.currencies_tiers;
                                            angular.forEach(currency.currencies_tiers, function (tier) {
                                                if (parseInt(response.data[0].course_batche_tier_id) === parseInt(tier.tier_id)) {
                                                    $scope.tier_selected = tier;
                                                    $scope.edit_webinar_course.tier_id = tier.tier_id;
                                                    $scope.edit_webinar_course.price = $scope.tier_selected.amount;
                                                }
                                            });
                                        }
                                    }
                                });
                                model.edit_sessions = [];
                                /*Formatting the date with choosed time zones */
                                response.data[0].course_webinar_sessions = $filter('CountryTimezone')(response.data[0].course_webinar_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', 'dd MMM yyyy H:mm:ss');
                                /*Setting the max and min data for batch and session date options */
                                if (model.edit_picker1.date !== undefined && model.edit_picker1.date !== null) { model.edit_picker2.datepickerOptions.minDate = model.edit_picker1.date; }
                                if (model.edit_picker2.date !== undefined && model.edit_picker2.date !== null) { model.edit_picker1.datepickerOptions.maxDate = model.edit_picker2.date; }
                                $scope.edit_session_datepickerOptions = { minDate: model.edit_picker1.date, maxDate: model.edit_picker2.date, showWeeks: false, };
                                /*Pushing the session */
                                angular.forEach(response.data[0].course_webinar_sessions, function (webinar_session) {
                                    model.edit_sessions.push({
                                        "webinar_url": webinar_session.webinar_url,
                                        "session_date": new Date(webinar_session.session_date),
                                        "session_time": new Date(webinar_session.session_date),
                                        "timezone_id": webinar_session.timezone_id,
                                        "lesson_description": webinar_session.lesson_description,
                                        "lesson_topic": webinar_session.lesson_topic,
                                        "session_end_date": new Date(webinar_session.session_end_date),
                                        "open": false,
                                    });
                                });
                                /*Checking Session Expired*/
                                var Today = new Date();
                                if (model.edit_sessions.length > 0) {
                                    angular.forEach(model.edit_sessions, function (edit_session) {
                                        if (edit_session.session_end_date < Today) {
                                            edit_session.session_expired = true;
                                        } else {
                                            edit_session.session_expired = false;
                                        }
                                    });
                                }

                            }
                        }
                        model.webinar_action = 'edit';
                    }
                });
        };

        $scope.DeleteWebinar = function (id) {
            AlertBox.confirm('Are you sure you want to delete this Instructor-led live live training class?', function (isConfirmed) {
                if (isConfirmed) {
                    WebinarSessions.remove({
                        id: id,
                    }, function (response) {
                        if (response.error.code === 0) {
                            $scope.init(null);
                            flashMessage = $filter("translate")("Instructor-led live live training clas has been deleted successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flash.set(response.error.message, 'error', false);
                        }

                    });
                }
            });

        };

        function timezone() {
            TimezoneList.get({
                limit: 'all',
                field: 'id,code,utc_offset,name',
                sort: "utc_offset::int",
                sort_by: "ASC"
            }).$promise
                .then(function (response) {
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

        // function sorting function ..

        function sort(a) {
            model.currentPage = 1;
            model.currentSort = a;
            $scope.init(null);
        }
        //pagination function

        function paginate(element) {
            model.currentPage = parseInt(model.currentPage);
            $scope.init(element);
        }
        // watch min and max dates to calculate difference
        var unwatchMinMaxValues = $scope.$watch(function () {
            return [model.picker1, model.picker2, model.edit_picker1, model.edit_picker2];
        }, function () {
            // min max dates
            if (model.picker1.date !== undefined && model.picker1.date !== null) { model.picker2.datepickerOptions.minDate = model.picker1.date; }
            if (model.picker2.date !== undefined && model.picker2.date !== null) { model.picker1.datepickerOptions.maxDate = model.picker2.date; }
            if (model.picker1.date !== null && model.picker2.date !== null && model.picker1.date !== undefined && model.picker2.date !== undefined) {
                $scope.webinar_course.start_date = $filter('date')(Date.parse(model.picker1.date), ConstDateFormat.created);
                $scope.webinar_course.end_date = $filter('date')(Date.parse(model.picker2.date), ConstDateFormat.created);
                $scope.session_datepickerOptions = {
                    minDate: model.picker1.date,
                    maxDate: model.picker2.date
                };
                if (model.sessions.length > 0) {
                    angular.forEach(model.sessions, function (session) {
                        if (session.session_date < $scope.session_datepickerOptions.minDate || session.session_date > $scope.session_datepickerOptions.maxDate) {
                            session.session_date = undefined;
                        }
                    });
                }
            } else {
                model.dayRange = 'n/a';
            }
            /*Offline Course Edit date updating */
            if (model.edit_picker1 !== undefined && model.edit_picker1 !== null) { model.edit_picker2.datepickerOptions.minDate = model.edit_picker1.date; }
            if (model.edit_picker2 !== undefined && model.edit_picker2 !== null) { model.edit_picker1.datepickerOptions.maxDate = model.edit_picker2.date; }
            if (model.edit_picker1 !== null && model.edit_picker2 !== null && model.edit_picker1 !== undefined && model.edit_picker2 !== undefined) {
                $scope.edit_webinar_course.start_date = $filter('date')(Date.parse(model.edit_picker1.date), ConstDateFormat.created);
                $scope.edit_webinar_course.end_date = $filter('date')(Date.parse(model.edit_picker2.date), ConstDateFormat.created);
                $scope.edit_session_datepickerOptions = {
                    minDate: model.edit_picker1.date,
                    maxDate: model.edit_picker2.date
                };
                if (model.edit_sessions !== null && model.edit_sessions !== undefined) {
                    if (model.edit_sessions.length > 0) {
                        angular.forEach(model.edit_sessions, function (session) {
                            if ($filter('date')(Date.parse(session.session_date), 'yyyy-MM-dd') < $filter('date')(Date.parse($scope.edit_session_datepickerOptions.minDate), 'yyyy-MM-dd') || $filter('date')(Date.parse(session.session_date), 'yyyy-MM-dd') > $filter('date')(Date.parse($scope.edit_session_datepickerOptions.maxDate), 'yyyy-MM-dd')) {
                                session.session_date = undefined;
                            }
                        });
                    }
                }
            }
        }, true);

        //removing the session
        function removeCourseWebinarSession(index, scope_variable) {
            if (model[scope_variable].length > 1) {
                model[scope_variable].splice(index, 1);
            } else {
                flashMessage = $filter("translate")("Sorry! You must have atleast one session to create a  Instructor-led live onsite training classes.");
                flash.set(flashMessage, 'info', false);
            }
        }
        //Adding the session
        //Adding the session
        function AddingWebinarSession(type, scope_variable) {
            $scope.session_datepickerOptions = { minDate: model.picker1.date, maxDate: model.picker2.date, showWeeks: false, };
            model[scope_variable].push({ "session_date": undefined, "timezone_id": undefined, "lesson_description": undefined, "lesson_topic": undefined, "open": false, });
        }

        // Adding or Creating the offline sessions
        function addCourseWebinarSession($valid) {
            if ($valid) {
                if (model.sessions.length === 0) {
                    flashMessage = $filter("translate")("Sorry! You must have atleast one session to create a  Instructor-led Live online training classes.");
                    flash.set(flashMessage, 'info', false);
                    return true;
                }
                $scope.webinar_course.sessions = [];
                var timezone, chosedtimezone;
                angular.forEach(model.sessions, function (session) {
                    //Finding the Chossen TimeZone
                    chosedtimezone = model.timezone_lists.filter(function (timezone) {
                        return timezone.id == session.timezone_id;
                    });
                    if (chosedtimezone.length > 0) {
                        timezone = chosedtimezone[0].utc_offset;
                    }
                    //Converting timzone and setting UTC timezone to +0000
                    var sessionEndDate_Time = $filter('date')(Date.parse(session.session_date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(session.session_end_date), ConstDateFormat.time_sec_24);
                    sessionEndDate_Time = $filter('date')(Date.parse(sessionEndDate_Time + timezone), ConstDateFormat.created_24_z, '+0000');
                    var sessionDate_Time = $filter('date')(Date.parse(session.session_date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(session.session_time), ConstDateFormat.time_sec_24);
                    sessionDate_Time = $filter('date')(Date.parse(sessionDate_Time + timezone), ConstDateFormat.created_24_z, '+0000');
                    $scope.webinar_course.sessions.push({
                        'session_date': sessionDate_Time,
                        'timezone_id': session.timezone_id,
                        'lesson_description': session.lesson_description,
                        'lesson_topic': session.lesson_topic,
                        'session_end_date': sessionEndDate_Time,
                        'webinar_url': session.webinar_url,
                    });
                });
                $scope.webinar_disableButton = true;
                CourseWebinarSession.create($scope.webinar_course, function (response) {
                    if (response.error.code === 0) {
                        UpdateCourseStatus();
                        $scope.init(null);
                        flashMessage = $filter("translate")("Instructor-led live online training classes has been Added successfully.");
                        flash.set(flashMessage, 'success', false);
                        model.webinar_action = 'list';
                        $rootScope.$emit('updateCourseParent', {});
                        $scope.webinar_course = {};
                    } else {
                        flashMessage = $filter("translate")("Instructor-led live online training classes couldn't be Added.Try again later");
                        flash.set(flashMessage, 'error', false);
                    }
                    $scope.webinar_disableButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while  adding  Instructor-led live online training classes .Try again later");
                    flash.set(flashMessage, 'error', false);
                    $scope.webinar_disableButton = false;
                });
            }

        }

        function CurrencyTireFilter(index, scope_variable) {
            $scope.selected = model.currencies[index];
            $scope[scope_variable].currency_id = $scope.selected.id;
            if (model.currencies[index].currencies_tiers !== null) {
                model.currencies_tiers = model.currencies[index].currencies_tiers;
                if ($scope.tier_selected !== null && $scope.tier_selected !== undefined) {
                    if (model.currencies_tiers) {
                        angular.forEach(model.currencies_tiers, function (tier) {
                            if ($scope.tier_selected.tier_id === tier.tier_id) {
                                $scope.tier_selected = tier;
                                $scope[scope_variable].tier_id = tier.tier_id;
                                $scope[scope_variable].price = $scope.tier_selected.amount;
                            }
                        });
                    }
                }
            } else {
                model.currencies_tiers = [];
                $scope.tier_selected = null;
            }

        }
        /**Currency Tier filter */
        function TireFilter(tier, scope_variable) {
            var tier_index = model.currencies_tiers.indexOf(tier);
            if (tier_index !== null && tier_index !== undefined) {
                $scope.tier_selected = model.currencies_tiers[tier_index];
                $scope[scope_variable].tier_id = $scope.tier_selected.tier_id;
                $scope[scope_variable].price = $scope.tier_selected.amount;
            }
        }

        // Adding or Creating the offline sessions
        function editCourseWebinarSession($valid, Form) {
            if ($valid) {
                if (model.edit_sessions.length === 0) {
                    flashMessage = $filter("translate")("Sorry! You must have atleast one session to create a  Instructor-led live online training classes.");
                    flash.set(flashMessage, 'info', false);
                    return true;
                }
                $scope.edit_webinar_course.sessions = [];
                var timezone, chosedtimezone;
                angular.forEach(model.edit_sessions, function (session, key) {
                    //Finding the Chossen TimeZone
                    chosedtimezone = model.timezone_lists.filter(function (timezone) {
                        return timezone.id == session.timezone_id;
                    });
                    if (chosedtimezone.length > 0) {
                        timezone = chosedtimezone[0].utc_offset;

                    }
                    //Converting timzone and setting UTC timezone to +0000
                    var sessionDate_Time = $filter('date')(Date.parse(session.session_date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(session.session_time), ConstDateFormat.time_sec_24);
                    sessionDate_Time = $filter('date')(Date.parse(sessionDate_Time + timezone), ConstDateFormat.created_24_z, '+0000');
                    var sessionEndDate_Time = $filter('date')(Date.parse(session.session_date), ConstDateFormat.created) + ' ' + $filter('date')(Date.parse(session.session_end_date), ConstDateFormat.time_sec_24);
                    sessionEndDate_Time = $filter('date')(Date.parse(sessionEndDate_Time + timezone), ConstDateFormat.created_24_z, '+0000');
                    $scope.edit_webinar_course.sessions.push({
                        'webinar_url': session.webinar_url,
                        'session_date': sessionDate_Time,
                        'timezone_id': session.timezone_id,
                        'lesson_description': session.lesson_description,
                        'lesson_topic': session.lesson_topic,
                        'session_end_date': sessionEndDate_Time
                    });
                });
                $scope.edit_webinar_course.course_id = $state.params.id;
                WebinarSessions.update({
                    id: $scope.edit_webinar_course.id,
                }, $scope.edit_webinar_course, function (response) {
                    if (response.error.code === 0) {
                        UpdateCourseStatus();
                        $scope.init(null);
                        model.webinar_action = 'list';
                        flashMessage = $filter("translate")("Instructor-led live online training classes has been updated successfully.");
                        flash.set(flashMessage, 'success', false);
                        $scope.edit_webinar_course = {};
                    } else {
                        flashMessage = $filter("translate")("Instructor-led live online training classes couldn't be updated.Try again later");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Error occurred while updating Instructor-led live online training classes .Try again later");
                    flash.set(flashMessage, 'error', false);
                    $scope.offline_disableButton = false;
                });
            }
        }
        //Batch listing model show
        $scope.modalBatch = function (e, Batch, model_type) {
            e.preventDefault();
            if (model_type === 'Students') {
                template = 'src/plugins/WebinarCourses/enrolledstudent_model.tpl.html';
            } else {
                template = 'src/plugins/WebinarCourses/session_model.tpl.html';
            }
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'lg',
                    templateUrl: template,
                    controller: function ($scope, Batch, modelType, $filter) {
                        var model = this;
                        $scope.batch_list = Batch;
                        if (modelType !== 'Students') {
                            angular.forEach($scope.batch_list.course_webinar_sessions, function (webinar_session) {
                                webinar_session.format_session_date = $filter('date')(Date.parse(webinar_session.session_date), ConstDateFormat.mediumDate);
                            });
                        }
                        //Opening the webinar url in window
                        $scope.OpenWebinarWindow = function (index) {
                            if ($scope.batch_list !== null && $scope.batch_list !== undefined) {
                                if ($scope.batch_list.course_webinar_sessions !== null && $scope.batch_list.course_webinar_sessions !== undefined) {
                                    if ($scope.batch_list.course_webinar_sessions[index].webinar_url !== null && $scope.batch_list.course_webinar_sessions[index].webinar_url !== undefined) {
                                        var w = 1000;
                                        var h = 600;
                                        var left = (window.screen.width / 2) - ((w / 2) + 10);
                                        var top = (window.screen.height / 2) - ((h / 2) + 50);

                                        var win = window.open($scope.batch_list.course_webinar_sessions[index].webinar_url, 'popupWindow',
                                            "status=no,height=" + 600 + ",width=" + 1000 + ",resizable=yes,left=" +
                                            left + ",top=" + top + ",screenX=" + left + ",screenY=" +
                                            top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
                                    }
                                }
                            }
                        };
                    },
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        Batch: function () {
                            return Batch;
                        },
                        modelType: function () {
                            return model_type;
                        },
                    }
                });
            }
        };

        //Opening the Message Model
        $scope.modalBatchMessage = function (e, Batch, Type) {
            e.preventDefault();
            if (Type === 'User') {
                Batch.learner_name = Batch.displayname;
            }
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
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
                            return Type;
                        },
                    }
                });
            }
        };
        //model closing
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();

        };

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
        /**FUNCTION CALLING  */

        $scope.init(null);
        timezone();
        getCourseDetails();
        dateInit();
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
        /***SUPPORTING FUNCTION */

        var autoRefresh;
        $scope.autoReload = function () {
            autoRefresh = $interval(function () {
                $state.reload();
            }, 20000);
        };
        $scope.stopReload = function () {
            if (angular.isDefined(autoRefresh)) {
                $interval.cancel(autoRefresh);
                autoRefresh = undefined;
            }
        };
        $scope.$on('$destroy', function () {
            $scope.stopReload();
        });

    });
})(angular.module('ace.webinarCourse'));

(function (module) {

    module.factory('DemoSessionList', ['$resource', 'GENERAL_CONFIG', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/demo_sessions', {
                id: '@id'
            }, {
                get: {
                    method: 'GET',
                },
            }
        );
    }]);

    module.factory('CourseWebinarSession', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_webinar_sessions', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });

    module.factory('WebinarSessions', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_webinar_batches/:id/course_webinar_sessions', {
                id: '@id'
            }, {
                get: {
                    method: 'GET',
                    params: {
                        id: '@id'
                    }
                },
                remove: {
                    method: 'DELETE',
                    params: {
                        id: '@id'
                    }
                },
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    }
                }
            }
        );
    });

    module.factory('WebinarBatchesLists', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_batches', {}
        );
    });
    module.factory('TimezoneList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/timezones', {}
        );
    });
    module.factory('GetCurrencyList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/currencies', {}
        );
    });
})(angular.module("ace.webinarCourse"));
