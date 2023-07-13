/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {

} (angular.module('ace.ratingAndReview', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('courseFeedback', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/RatingAndReview/courseFeedback.tpl.html",
            link: linker,
            controller: 'courseFeedbackController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
            }
        };
    });
    module.controller('courseFeedbackController', function (CourseFeedback, $scope, $rootScope, $state, $filter) {

        var model = this;
        model.courseFeedback = [];
        $scope.feedbackLimit = 12;

        function getCoursesFeedback() {
            params = {};
            params.page = $scope.currentPage;
            params.limit = $scope.feedbackLimit;
            CourseFeedback.get({
                id: model.courseId,
                filter: params,
                field: 'user_id,image_hash,displayname,rating,created,feedback',
            }).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        //Formatting the date with Current Country Zone
                        response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                        angular.forEach(response.data, function (feedback) {
                            model.courseFeedback.push(feedback);
                        });
                        $scope._metadata = response._metadata;
                    }
                });
        }
        $scope.index = function () {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            getCoursesFeedback();
        };
        $scope.index();
        $scope.paginate = function (pageno) {
            $scope.currentPage += 1;
            $scope.index();
        };
    });

    module.directive('homeUserFeedback', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/RatingAndReview/homeUserFeedback.tpl.html",
            link: linker,
            controller: 'homeUserFeedbackController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
            }
        };
    });
    module.controller('homeUserFeedbackController', function (CourseRating, $scope, $uibModal) {
        var model = this;
        model.usercourseFeedback = [];
        model.OpenHomeReviewModel = OpenHomeReviewModel;

        function getCoursesFeedback() {
            model.usercourseFeedback = [];
            params = {};
            params.is_display_home = true;
            CourseRating.get(params).$promise
                .then(function (response) {
                    if (response.data.length > 0) {
                        model.usercourseFeedback = response.data;
                    }
                });
        }

        function OpenHomeReviewModel(index) {
            if (index !== null && index !== undefined) {
                var course_review = model.usercourseFeedback[index];
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'src/plugins/RatingAndReview/homeReviewModel.tpl.html',
                    size: 'sm',
                    controller: function (course_review, $scope, $uibModalStack) {
                        $scope.course_review = course_review;
                        $scope.modalClose = function (e) {
                            e.preventDefault();
                            $uibModalStack.dismissAll();
                        };
                    },
                    resolve: {
                        course_review: function () {
                            return course_review;
                        }
                    }
                });
            }
        }
        getCoursesFeedback();
    });
})(angular.module('ace.ratingAndReview'));

(function (module) {
    module.factory('CourseUsersFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users/:id/course_user_feedbacks', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/course_user_feedbacks', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseRating', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_feedbacks', {
                course_id: '@course_id'
            }
        );
    });
    module.factory('CourseUserRating', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/course_user_feedbacks', {
                course_id: '@course_id',
                id: '@id'
            }
        );
    });
    module.factory('CourseRatingAction', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_feedbacks/:id', {
                id: '@id'
            }, {
                'updaterating': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseRatingDelete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_feedbacks/:id', {
                id: '@id'
            }, {
                'deletecourserating': {
                    method: 'Delete'
                }
            }
        );
    });
    module.factory('CourseReviewQuestion', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_review_questions', {
                id: '@id'
            }
        );
    });
    module.factory('Teaching', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
})(angular.module("ace.ratingAndReview"));

(function (module) {
    module.directive('ratingButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/RatingAndReview/ratingButton.tpl.html",
            link: linker,
            controller: 'ratingButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
                courseuserid: '@courseuserid',
                userId: '@userId',
                btnstyle: '@btnstyle',
                btntext: '@btntext',
                averageRating: '@averageRating'
            }
        };
    });
    module.controller('ratingButtonController', function ($scope, $uibModal, $rootScope) {
        var model = this;
        $scope.rating_id = model.courseuserid;
        $scope.course_id = model.courseId;
        $scope.user_id = model.userId;
        $scope.rateCourseClick = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'src/plugins/RatingAndReview/ratingAndReviewForm.tpl.html',
                    controller: 'ratingController as model',
                    size: 'md',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        rating: function () {
                            return model.courseuserid;
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                        var module = data['ace.ratingAndReview'];
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
                });
                $rootScope.modal = true;
            }
        };
    });
    module.controller('ratingController', function ($scope, pageType, $rootScope, $location, CourseUsersFeedback, CourseRating, $state, CourseRatingAction, CourseUserDetails, CourseRatingDelete, rating, $filter, TokenServiceData, flash, CourseReviewQuestion) {
        var model = this;
        if (pageType === "page") {
            $rootScope.pageTitle = $filter("translate")("Course Rating")+ " | " +$rootScope.settings['site.name'];
            courseUserID = $state.params.id;
        } else {
            courseUserID = rating;
        }
        model.postCourseRating = postCourseRating;
        model.deleteCourseRating = deleteCourseRating;
        model.updateCourseRating = updateCourseRating;
        model.ratingFormSubmit = ratingFormSubmit;
        model.courseUserDetails = [];
        $scope.action = 'post';
        $scope.feedbackContent = '';
        $scope.isAuth = $rootScope.isAuth;
        $scope.rate = 0;
        $scope.overStar = 0;
        CourseUserDetails.get({
            id: courseUserID
        }).$promise
            .then(function (response) {
                if (response.data[0]) {

                    model.courseUserDetails = response.data[0];
                    CourseUsersFeedback.get({
                        id: response.data[0].id,
                    }).$promise
                        .then(function (response) {
                            if (response.data.length > 0) {
                                if (response.data[0]) {
                                    FeedbackID = response.data[0].id;
                                    model.rateCourse.review_title = response.data[0].review_title;
                                    model.rateCourse.feedback = response.data[0].feedback;
                                    $scope.feedbackContent = response.data[0].feedback;
                                    if ($scope.feedbackContent !== '' && $scope.feedbackContent !== undefined) {
                                        $scope.action = 'edit';
                                    }
                                    model.rateCourse.rating = response.data[0].rating;
                                }
                                if (response.data[0].course_review_answers !== undefined && response.data[0].course_review_answers !== null) {
                                    if (response.data[0].course_review_answers.length > 0) {
                                        model.reviewQuestions = [];
                                        angular.forEach(response.data[0].course_review_answers, function (answer) {
                                            var obj = {};
                                            obj.rate = answer.rate;
                                            obj.id = answer.course_review_question_id;
                                            obj.name = answer.course_review_questions[0].name;
                                            model.reviewQuestions.push(obj);
                                        });
                                    }
                                }

                                if (model.rateCourse.rating) {
                                    $scope.rate = model.rateCourse.rating;
                                    $scope.overStar = model.rateCourse.rating;

                                }
                            }

                        });
                }
            });
        if (!$scope.isAuth) {
            $location.path('/users/login');
        }
        $scope.currentPageType = pageType;
        $scope.modalCancel = function (e) {
            e.preventDefault();
            $scope.$close();
        };
        model.rateCourse = new CourseRating();
        $scope.max = 5;
        $scope.isReadonly = false;
        $scope.hoveringOver = function (value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };

        function postCourseRating(rateCourse) {
            //model.rateCourse.is_satisfied = 1;
            $scope.ratingAdd = true;
            model.rateCourse.rating = $scope.overStar;
            model.rateCourse.course_id = parseInt(model.courseUserDetails.course_id);
            model.rateCourse.course_user_id = parseInt(model.courseUserDetails.id);
            model.rateCourse.user_id = parseInt(model.courseUserDetails.user_id);

            if (model.reviewQuestions !== undefined) {
                if (model.reviewQuestions.length > 0) {
                    model.rateCourse.reviews = [];
                    angular.forEach(model.reviewQuestions, function (value) {
                        model.rateCourse.reviews.push({
                            "rate": value.rate,
                            "course_review_question_id": value.id
                        });
                    });
                }
            }
            model.rateCourse.$save()
                .then(function (data) {
                    $state.reload();
                    if (angular.isDefined(data.id !== '' && data.id !== "null")) {
                        succsMsg = $filter("translate")("Review added successfully.");
                        flash.set(succsMsg, 'success', false);
                    }
                })
                .catch(function (error) {

                })
                .finally();
        }

        function updateCourseRating(rateCourse) {
            // model.rateCourse.is_satisfied = 1;
            $scope.ratingUpdate = true;
            model.rateCourse.id = FeedbackID;
            model.rateCourse.rating = $scope.overStar;
            model.rateCourse.course_id = parseInt(model.courseUserDetails.course_id);
            model.rateCourse.course_user_id = parseInt(model.courseUserDetails.id);
            model.rateCourse.user_id = parseInt(model.courseUserDetails.user_id);
            if (model.reviewQuestions !== undefined) {
                if (model.reviewQuestions.length > 0) {
                    model.rateCourse.reviews = [];
                    angular.forEach(model.reviewQuestions, function (value) {
                        model.rateCourse.reviews.push({
                            "rate": value.rate,
                            "course_review_question_id": value.id
                        });
                    });
                }
            }
            CourseRatingAction.updaterating(model.rateCourse, function (response) {
                $state.reload();
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Review updated successfully.");
                    flash.set(succsMsg, 'success', false);
                }
            });
        }

        function deleteCourseRating(e) {
            e.preventDefault();
            $scope.ratingupDelete = true;
            CourseRatingDelete.deletecourserating({
                id: FeedbackID
            }, function (response) {
                $state.reload();
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Review deleted successfully.");
                    flash.set(succsMsg, 'success', false);
                }
            });
        }
        //conditional form submit function
        function ratingFormSubmit(value, action) {
            if (action === 'post') {
                postCourseRating(value);
            }
            if (action === 'edit') {
                updateCourseRating(value);
            }
        }
        //Course Review question
        function Coursereviewquestion() {
            CourseReviewQuestion.get(function (response) {
                if (response.data.length > 0) {
                    angular.forEach(response.data, function (value) {
                        value.rate = null;
                    });
                    model.reviewQuestions = response.data;
                }
            });
        }
        Coursereviewquestion();
    });
})(angular.module('ace.ratingAndReview'));

(function (module) {
    module.directive('ratingStars', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/RatingAndReview/ratingStars.tpl.html",
            link: linker,
            controller: 'ratingStarsController as model',
            bindToController: true,
            scope: {
                averageRating: '@averageRating',
            }
        };
    });
    module.controller('ratingStarsController', function () {
        var model = this;
    });

})(angular.module('ace.ratingAndReview'));

(function (module) {
    module.directive('studentSatisfaction', function () {
        var linker = function (scope, element, attrs) { };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/RatingAndReview/studentSatisfactionButton.tpl.html',
            link: linker,
            controller: 'studentSatisfactionButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('studentSatisfactionButtonController', function ($scope) {
        var model = this;
        $scope.courseID = model.courseId;
    });
    module.controller('studentSatisfactionController', function ($state, $scope, $rootScope, CourseFeedback, $filter, TokenServiceData) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Manage Course Student Satisfaction")+ " | " +$rootScope.settings['site.name'];
        model.userFeedback = [];
        model.course = [];
        $scope._metadata = [];

        function getCourseFeedbacks() {
            params = {};
            params.page = $scope._metadata.currentPage;
            FeedbackArr = {
                id: $state.params.id,
                filter: params,
                limit: 12,
                field: 'user_id,image_hash,displayname,rating,created,feedback'
            };
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                CourseFeedback.get(FeedbackArr).$promise
                    .then(function (response) {
                        if (response.data.length > 0) {
                            model.userFeedback = response.data;
                            $scope._metadata = response._metadata;
                            model.course.course_user_feedback_count = response._metadata.total_records;
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

        $scope.index = function () {
            $scope.currentPage = $state.params.page ? parseInt($state.params.page) : 1;
            getCourseFeedbacks();
        };
        $scope.index();
        $scope.paginate = function (pageno) {
            $scope.currentPage = parseInt($scope._metadata.currentPage);
            $scope.index();
        };
    });
    /** INSTRUCTOR DASHBOARD REVIEW LISTING CONTROLLER */
    module.controller('CourseReviewController', function ($state, $rootScope, $scope, $filter, TokenServiceData, CourseUserRating, $location, $timeout, Teaching, ConstDateFormat) {
        $rootScope.pageTitle = $filter("translate")("Reviews")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        /**VARIABLE DECLARATION  */
        $scope.messagesort = {};
        model.loader = true;
        model._metadata = [];
        model.stars = [];
        $scope.starSort = {};

        /**VARIABLE ASSIGNING  */
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'review';

        /**CREATING THE STAR FOR RATING FILTER */
        for (i = 1; i <= 5; i++) {
            model.stars.push({
                id: i,
                value: i
            });
        }
        /**GETTING THE FEEDBACK OF COURSES BASED ON THE FILTER */
        function getCoursesforum(element) {
            model.loader = true;
            params = {};
            $scope.messagesort.sortby = $state.params.ordering;
            $scope.ordering = $state.params.ordering;
            if ($state.params.star !== undefined && $state.params.star !== "") {
                params.rating = $state.params.star;
                var v = $state.params.star;
                v.split(',')
                    .forEach(function (e) {
                        $scope.starSort[e] = true;
                    });
            }
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
                params.sort_by = 'DESC';
            }
            if ($state.params.unread === '1') {
                params.is_read = 1;
                $scope.messagesort.no_unread = 1;
                params.sort_by = 'ASC';
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
                params.page = model._metadata.currentPage;
                params.id = $rootScope.auth.id;
                CourseUserRating.get(params).$promise.then(function (response) {
                    //Formatting the date with Current Country Zone
                    model.CoursesFeedbacks = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', ConstDateFormat.created_12);
                    angular.forEach(model.CoursesFeedbacks, function (course_feedback) {
                        if (angular.isDefined(course_feedback.course_review_answers) && course_feedback.course_review_answers !== null) {
                            if (course_feedback.course_review_answers.length > 0) {
                                angular.forEach(course_feedback.course_review_answers, function (review_answer) {
                                    review_answer.name = review_answer.course_review_questions[0].name;
                                    review_answer.info = review_answer.course_review_questions[0].info;
                                });
                            }
                        }
                    });
                    model._metadata = response._metadata;
                    model.loader = false;
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 2000, 'swing', false);
                    }
                });
            }, 100);
        }
        /**DECLARATION OF INIT FUNCTION TO CALL THE COURSE FEEDBACK  */
        $scope.index = function (element) {
            getCoursesforum(element);
        };
        /**SORTING FUNCTION OF COURSE FEEDBACK  */
        $scope.Sort = function (a) {
            if (a !== undefined && a !== null) {
                $scope.messagesort.sortby = a;
            }
            var checked_row = $scope.getChecked($scope.starSort);
            checked_row = (checked_row.length !== 0) ? checked_row.join() : null;
            $location
                .search('ordering', $scope.messagesort.sortby)
                .search('star', checked_row)
                .search('unresponded', $scope.messagesort.no_response);
            $timeout(function () {
                getCoursesforum(null);
            }, 1000);
        };

        /**FILTER FUNCTION OF COURSE FEEDBACK  */
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
        /**PAGINATION FUNCTION OF COURSE FEEDBACK  */
        $scope.paginate = function (element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
        /**RATING SORTING FUNCTION  */
        $scope.getChecked = function (obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push(key);
                }
            }
            return checked;
        };
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
        /***CALLING THE INITI FUNCTION  */
        $scope.index(null);
        getInstructorCourses();
    });
})(angular.module('ace.ratingAndReview'));
