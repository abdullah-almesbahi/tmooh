(function (module) {
    module.directive('courseNavbar', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/manageCourseNavbar.tpl.html',
            link: linker,
            controller: 'courseNavbarController as model',
            bindToController: true,
            scope: {}
        };
    });

    module.controller('courseNavbarController', function (Course, $scope, $rootScope, ViewCourse, $state, $uibModal, $timeout, TokenService, CourseUpdate, $filter, flash, $location, GetCourseInstuctor, CourseType, $uibModalStack, ConstToolTipContent, SweetAlert, CourseCoupons) {
        var model = this;
        model.loadingNavBar = true;
        model.publishCourse = publishCourse;
        model.coursePublish = {};

        function init() {
            model.required_field = {
                // "Basic": ['title', 'subtitle', 'language_id', 'parent_category_id', 'category_id', 'course_options', 'description', 'projects', 'certificate', 'faq'],
                "Basic": ['title', 'subtitle', 'language_id', 'parent_category_id', 'category_id', 'course_options', 'description'],
                "Goals": ['instructional_level_id', 'students_will_be_able_to', 'who_should_take_this_course_and_who_should_not', 'what_actions_students_have_to_perform_before_begin', 'category_id', 'course_options'],
                "Image": ['course_image', 'image_hash'],
                // "Promo_video": ['aws_job_id', 'embed_code'],
                "Curriculum": ['online_course_lesson_count', 'is_lesson_ready_count'],
                "Price": ['currency_id', 'tier_id'],
                "Automated_message": ['welcome_message', 'congratulation_message'],
                "Demo_schedule": ['demo_session_count'],
                "Online_schedule": ['webinar_course_batch_count'],
                "Onsite_schedule": ['offline_course_batch_count'],
                "Settings": ['privacy_id'],
            };

            if ($rootScope.settings['site.enabled_plugins'].indexOf('AmazonS3andRTMP') === -1) {
                model.required_field.Promo_video = ['video_url', 'promo_video'];
            }
        }

        function error() {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        function publishCourse(type, flash_message) {
            model.coursePublish.id = $state.params.id;
            if (type === 'publish') {
                if (model.manageCourseOption.SubmitForReview === false) {
                    errorSubmitForReview();
                    return true;
                }
                model.coursePublish.course_status_id = 3;
                flashMessage = $filter("translate")("Course published successfully.");
            } else if (type === 'waiting') {
                if (model.manageCourseOption.SubmitForReview === false && $rootScope.auth.providertype != 'admin') {
                    errorSubmitForReview();
                    return true;
                }
                flashMessage = $filter("translate")("Course submitted to review successfully.");
                model.coursePublish.course_status_id = 2;
            } else if (type === 'draft' && $rootScope.auth.providertype != 'admin') {
                flashMessage = $filter("translate")("Course is successfully move to unpublished status.");
                model.coursePublish.course_status_id = 1;
            }
            CourseUpdate.update(model.coursePublish, function (response) {
                getCourseDetails();
                if (parseInt(flash_message) === 1) {
                    flash.set(flashMessage, 'success', false);
                }
                if (type === 'draft') {
                    SweetAlert.swal(ConstToolTipContent.UnpublishedAlert);
                }
            });
        }

        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        promiseSettings.then(function (data) {
            if (angular.isDefined(data['ace.ratingAndReview'])) {
                $scope.loadRatingAndReview = data['ace.ratingAndReview'];
            }
            if (angular.isDefined(data['ace.payout'])) {
                $scope.loadPayout = data['ace.payout'];
            }
            if (angular.isDefined(data['ace.seo'])) {
                $scope.loadSeo = data['ace.seo'];
            }
            if (angular.isDefined(data['ace.coupons'])) {
                $scope.loadCoupons = data['ace.coupons'];
            }
        });

        $scope.activetab = $rootScope.activetab;
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            init();
            getCourseDetails();
        }
        $scope.admin_url = function () {
            location.replace('ag-admin/#/courses/list');
        };

        function getCourseDetails() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                ViewCourse.get({
                    id: $state.params.id,
                }).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            if (response.data.length > 0) {
                                model.manageCourseOption = response.data[0];
                                /*Checking the type of the course*/
                                model.manageCourseOption.coursetype = {};
                                if (response.data[0].course_options !== undefined && response.data[0].course_options !== null && response.data[0].course_options !== '') {
                                    response.data[0].course_options.split(',')
                                        .forEach(function (e) {
                                            if (e == CourseType.video) {
                                                model.manageCourseOption.coursetype.video = true;
                                            } else if (e == CourseType.onsite) {
                                                model.manageCourseOption.coursetype.onsite = true;
                                            } else if (e == CourseType.online) {
                                                model.manageCourseOption.coursetype.online = true;
                                            } else {
                                                model.manageCourseOption.coursetype = {};
                                            }
                                        });
                                }
                                //Delete the unwanted fields for course type
                                if (!model.manageCourseOption.coursetype.online) {
                                    delete model.required_field.Online_schedule;
                                }
                                if (!model.manageCourseOption.coursetype.onsite) {
                                    delete model.required_field.Onsite_schedule;
                                }
                                if (!model.manageCourseOption.coursetype.onsite && !model.manageCourseOption.coursetype.online) {
                                    delete model.required_field.Demo_schedule;
                                }
                                if (!model.manageCourseOption.coursetype.video) {
                                    delete model.required_field.Promo_video;
                                    delete model.required_field.Curriculum;
                                    delete model.required_field.Price;
                                }
                                /*Checking the required fields for menus and submit for review  */
                                var tmp_SubmitForReviewcheck = [],
                                    SubmitForReviewcheck = [];
                                angular.forEach(model.required_field, function (menu_value, menu_key) {
                                    if (menu_key != 'Price') {
                                        model.manageCourseOption[menu_key] = CheckingField(menu_key);
                                        tmp_SubmitForReviewcheck.push({ checked: CheckingField(menu_key) });
                                    } else if (menu_key == 'Price') {
                                        if (model.manageCourseOption.currency_id !== null && model.manageCourseOption.currency_id !== undefined && model.manageCourseOption.currency_id !== '') {
                                            tmp_SubmitForReviewcheck.push({ checked: true });
                                            if (model.manageCourseOption.tier_id !== null && model.manageCourseOption.tier_id !== undefined && model.manageCourseOption.tier_id !== '') {
                                                model.manageCourseOption.Price = true;
                                                tmp_SubmitForReviewcheck.push({ checked: true });
                                            } else {
                                                if (model.manageCourseOption.tier_id === null && model.manageCourseOption.is_free_course === true) {
                                                    tmp_SubmitForReviewcheck.push({ checked: true });
                                                    model.manageCourseOption.Price = true;
                                                } else {
                                                    model.manageCourseOption.Price = false;
                                                    tmp_SubmitForReviewcheck.push({ checked: false });
                                                }
                                            }
                                        } else {
                                            model.manageCourseOption.Price = false;
                                            tmp_SubmitForReviewcheck.push({ checked: false });
                                        }
                                    }

                                });
                                SubmitForReviewcheck = $filter('filter')(tmp_SubmitForReviewcheck, { 'checked': true });
                                /*&& parseInt(model.manageCourseOption.unfixed_course_feedback_count) === 0*/
                                if (SubmitForReviewcheck.length == tmp_SubmitForReviewcheck.length) {
                                    model.manageCourseOption.SubmitForReview = true;
                                } else {
                                    model.manageCourseOption.SubmitForReview = false;
                                }
                                //Dynamically changing the image without reloading the site

                                if (model.manageCourseOption.Image === true) {
                                    model.manageCourseOption.course_image = model.manageCourseOption.course_image + '?rand=' + Math.random();
                                    model.manageCourseOption.image_hash = model.manageCourseOption.image_hash + '?rand=' + Math.random();
                                }
                                $rootScope.course = response.data[0];
                                $timeout(function () {
                                    $rootScope.$broadcast("CourseDetails", model.manageCourseOption);
                                }, 1000);
                                if (parseInt($rootScope.auth.id) === parseInt(response.data[0].user_id) || $rootScope.auth.providertype === 'admin') {
                                    model.course_owner = true;
                                } else {
                                    GetCourseInstuctor.get({
                                        course_id: $state.params.id,
                                        user_id: $rootScope.auth.id,
                                    }).$promise
                                        .then(function (response) {
                                            if (response.data.length > 0) {
                                                model.course_owner = true;
                                                if (response.data[0].is_editable === true) {
                                                    model.course_owner = true;
                                                } else {
                                                    flashMessage = $filter("translate")("Sorry, You have no write access  for the course.");
                                                    flash.set(flashMessage, 'error', false);
                                                    model.course_owner = false;
                                                    $location.path('/error/404');
                                                }
                                            } else {
                                                $location.path('/error/404');
                                            }
                                        }, function (error) {
                                            model.course_owner = false;
                                        });
                                }
                            }
                        } else {
                            error();
                        }
                        model.loadingNavBar = false;
                    }, function (error) {
                        if (error.status === 404) {
                            error();
                        }
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }
        $rootScope.$on('updateCourseParent', function (event, args) {
            getCourseDetails();
            init();
        });
        //Course Status Need to update
        $rootScope.$on('updateCourseStatus', function (event, args) {
            if (parseInt(model.manageCourseOption.course_status_id) !== 1) {
                publishCourse(args.status, args.flash_message);
            }
        });

        function CheckingField(menu) {
            var surveyArrays = [],
                checked = [];
            angular.forEach(model.required_field[menu], function (value, key) {
                var count_field = value.split("_").pop();
                if (count_field === 'count') {
                    if (parseInt(model.manageCourseOption[value]) > 0) {
                        surveyArrays.push({ checked: true });
                    } else {
                        surveyArrays.push({ checked: false });
                    }
                } else {
                    if (model.manageCourseOption[value] !== null && model.manageCourseOption[value] !== undefined && model.manageCourseOption[value] !== "") {
                        surveyArrays.push({ checked: true });
                    } else {
                        surveyArrays.push({ checked: false });
                    }
                }

            });
            checked = $filter('filter')(surveyArrays, { 'checked': true });
            if (surveyArrays.length == checked.length) {
                return true;
            } else {
                return false;
            }
        }
        /*Opening submit for review error model */
        function errorSubmitForReview() {
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                size: 'lg',
                templateUrl: 'courses/submitReviewErrorModal.tpl.html',
                resolve: {
                    pageType: function () {
                        return "modal";
                    },
                }
            });
        }
        /*Model closing */
        $scope.modalClose = function () {
            $uibModalStack.dismissAll();
        };

        function getExistingCoupons() {
            model.coupon_valid = false;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                CourseCoupons.get({
                    course_id: $state.params.id,
                    limit: 'all',
                }).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            if (response.data.length > 0) {
                                model.coupon_valid = true;
                            }
                        }
                    });
            }
        }
        getExistingCoupons();
    });
})(angular.module('ace.courses'));
