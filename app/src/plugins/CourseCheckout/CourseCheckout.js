/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {

} (angular.module('ace.CourseCheckout', [
    'ui.router',
    'ngResource',
    'ace.users'
])));

(function (module) {
    module.directive('buyButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/CourseCheckout/buyButton.tpl.html",
            link: linker,
            controller: 'buyButtonController as model',
            bindToController: true,
            scope: {
                coursePrice: '@',
                courseId: '@',
                courseStatus: '@',
                buyButtonText: '@buyButtonText',
                btnClassName: '@btnClassName',
                modalSize: '@modalSize'
            }
        };
    });

    module.controller('buyButtonController', function ($scope, $uibModal, $rootScope, $filter) {
        var model = this;
        $scope.course_id = model.courseId;
        $scope.course_status = model.courseStatus;
        $scope.course_price = model.coursePrice;
        model.modalSize = model.modalSize ? model.modalSize : 'lg';
        $scope.btnText = model.buyButtonText ? model.buyButtonText : $filter("translate")("Take This Course");
        $scope.btnClass = model.btnClassName ? model.btnClassName : 'btn-primary btn-lg ';
        model.takeCourseClick = takeCourseClick;

        function takeCourseClick(e) {
            e.preventDefault();
            if (!$.cookie('refresh_token')) {
                if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                    $scope.modalInstance = $uibModal.open({
                        scope: $scope,
                        templateUrl: 'users/login.tpl.html',
                        controller: 'userLoginController',
                        size: 'lg',
                        resolve: {
                            pageType: function () {
                                return "modal";
                            },
                            TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                                var promiseSettings = TokenService.promiseSettings;
                                return $q.all({
                                    load: promiseSettings.then(function (data) {
                                        if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                            var module = data['ace.socialLogin'];
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
                        // handle finally
                    });
                    $rootScope.modal = true;
                }
            } else {
                if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                    $scope.modalInstance = $uibModal.open({
                        scope: $scope,
                        templateUrl: 'src/plugins/CourseCheckout/payment.tpl.html',
                        controller: 'paymentController as model',
                        size: model.modalSize,
                        resolve: {
                            pageType: function () {
                                return "modal";
                            },
                            TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                                var promiseSettings = TokenService.promiseSettings;
                                return $q.all({
                                    load: promiseSettings.then(function (data) {
                                        if (angular.isDefined(data['ace.CourseCheckout']) && $ocLazyLoad.getModules().indexOf('ace.CourseCheckout') === -1) {
                                            var module = data['ace.CourseCheckout'];
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
                        // handle finally
                    });
                    $rootScope.modal = true;
                }
            }
        }
    });
})(angular.module('ace.CourseCheckout'));

(function (module) {

    module.controller('paymentController', function ($scope, getGatewaysByUser, $sce, Countries, payNow, ViewCourse, $state, $window, $location, flash, $filter, $rootScope, TokenServiceData, pageType, $uibModalStack) {
        var model = this;
        if (pageType === "page") {
            $rootScope.pageTitle = $filter("translate")("Payment")+ " | " +$rootScope.settings['site.name'];
        }
        $scope.currentPageType = pageType;
        model.course = [];
        $scope.gatewayError = '';
        model.loading = true;
        model.coupon = {};

        // ViewCourse.get({
        //         id: $state.params.id,
        //         // field: 'id,title,slug,price'
        //     }).$promise
        //     .then(function(response) {
        //         model.course.id = response.data[0].id;
        //         model.course.title = response.data[0].title;
        //         model.course.price = response.data[0].price;
        // 		model.course.slug = response.data[0].slug;
        //         getGatewaysList(response.data[0].user_id);
        //     });

        $scope.IsCouponFormVisible = false;
        $scope.ShowHideCouponForm = function (e) {
            e.preventDefault();
            $scope.IsCouponFormVisible = $scope.IsCouponFormVisible ? false : true;
        };

        $scope.paynow_is_disabled = false;
        $scope.validation_msg = '';
        $scope.coupon_validation_msg = '';
        $scope.modalClose = function (e) {
            e.preventDefault();
            $scope.$close();
        };
        getGatewaysList();

        function getGatewaysList(user_id) {
            getGatewaysByUser.get({
                // user_id: user_id,
                // gateway_type: 'payment'
            }).$promise
                .then(function (res) {
                    model.loading = false;
                    if (angular.isDefined(res.paypal)) {
                        //if paypal enabled
                        if (res.paypal.error.code === 0) {
                            response = res.paypal;
                            if (response.paypal_enabled === true) {
                                $scope.paypal_enabled = true;
                            } else {
                                $scope.paypal_enabled = false;
                            }
                        }
                        if (res.paypal.error.code === 1) {
                            $scope.paypal_enabled = false;
                        }
                    }
                    if (angular.isDefined(res.zazpay)) {
                        if (res.zazpay.error.code === 1) {
                            if (res.zazpay.error.message) {
                                $scope.gatewayError = $filter("translate")(res.zazpay.error.message);
                            }
                        }
                        //if zazpay enabled
                        if (res.zazpay.error.code === 0) {
                            response = res.zazpay;
                            $scope.gateway_groups = response.gateway_groups;
                            $scope.payment_gateways = response.payment_gateways;
                            $scope.templates = response.templates;
                            $scope.form_fields_tpls = response.form_fields_tpls;
                            $scope.selected_payment_gateway_id = response.selected_payment_gateway_id;
                            $scope.gateway_instructions = response.gateway_instructions;
                            $scope.gateway_settings_options = response.gateway_settings_options;
                            $scope.gateways = response.selected_payment_gateway_id;
                            $scope.form_fields = [];
                            $scope.show_form = [];
                            $scope.countries = [];
                            Countries.get({
                                limit: 'all'
                            }).$promise.then(function (response) {
                                $scope.countries = response.data;
                                angular.forEach($scope.form_fields_tpls, function (key, value) {
                                    var str = '';
                                    var replaceStr = '';
                                    var replacingStr = '';

                                    if (value == "credit_card") {
                                        str = key._html5;
                                        replaceStr = '<img alt="[Image: Credit Cards]" src="img/credit-detail.png">';
                                        if (str.indexOf(replaceStr)) {
                                            replacingStr = '<img alt="[Image: Credit Cards]" src="assets/img/credit-detail.png">';
                                            str = str.replace(replaceStr, replacingStr);
                                            key._html5 = str;
                                        }
                                    }
                                    if (value == "buyer") {
                                        str = key._html5;
                                        replaceStr = '<input name="buyer_country"id="buyer_country" type="text" data-validate="{required:true,messages:{"required":"Required"}}" required  placeholder="ISO2 Country Code" />';
                                        if (str.indexOf(replaceStr)) {
                                            replacingStr = '<select name="buyer_country" id="buyer_country" data-validate="{required:true,messages:{"required":"Required"}}"><option value="">Please Select</option>';
                                            angular.forEach($scope.countries, function (key, value) {
                                                replacingStr = replacingStr + '<option value="' + key.iso2 + '">' + key.name + '</option>';
                                            });
                                            replacingStr = replacingStr + '</select>';
                                            str = str.replace(replaceStr, replacingStr);
                                            key._html5 = str;
                                        }
                                    }
                                    $scope.form_fields[value] = $sce.trustAsHtml(key._html5);
                                    $scope.show_form[value] = false;
                                    $scope.reset_forms();
                                });

                            }).finally(function () {
                                setTimeout(function () {
                                    xload(false);
                                }, 1000);
                            });
                        }
                    }
                });
        }

        $scope.reset_forms = function () {
            angular.forEach($scope.form_fields_tpls, function (key, value) {
                $scope.show_form[value] = false;
            });
            setTimeout(function () {
                $('.tab-pane.ng-scope input').removeAttr("required");
                $('.tab-pane.ng-scope select').removeAttr("required");
                $('.tab-pane.ng-scope textarea').removeAttr("required");
                $('.tab-pane.ng-scope.active input').attr("required", true);
                $('.tab-pane.ng-scope.active select').attr("required", true);
                $('.tab-pane.ng-scope.active textarea').attr("required", true);
                $('.tab-pane.ng-scope .active .radio_buttons input[type="radio"]').removeAttr("required");
            }, 50);
        };
        $scope.paneChanged = function (pane) {
            $scope.reset_forms();
            $scope.defaultselect(pane);
            setTimeout(function () {
                $('.tab-pane.ng-scope input').removeAttr("required");
                $('.tab-pane.ng-scope select').removeAttr("required");
                $('.tab-pane.ng-scope textarea').removeAttr("required");
                $('.tab-pane.ng-scope.active input').attr("required", true);
                $('.tab-pane.ng-scope.active select').attr("required", true);
                $('.tab-pane.ng-scope.active textarea').attr("required", true);
                $('.tab-pane.ng-scope .active .radio_buttons input[type="radio"]').removeAttr("required");

            }, 50);
        };
        $scope.defaultselect = function (pane) {
            var selectedTab, selectedPayment;
            $scope.gateways = [];
            var keepGoing = true;
            angular.forEach($scope.gateway_groups, function (res) {
                if (keepGoing) {
                    if (res.display_name == pane) {
                        selectedTab = res;
                        $scope.selectedTab = res;
                        keepGoing = false;
                    }
                }
            });
            keepGoing = true;
            angular.forEach($scope.payment_gateways, function (res) {
                if (keepGoing) {
                    if (res.group_id == selectedTab.id) {
                        selectedPayment = res;
                        keepGoing = false;
                        $scope.rdoclick(selectedPayment.id, selectedPayment.form_fields);
                    }
                }
            });
            $scope.gateways = "sp_" + selectedPayment.id;
        };
        $scope.rdoclick = function (res, res1) {
            $scope.gateways = "sp_" + res;
            $scope.array = res1.split(',');
            $scope.reset_forms();
            $scope.paynow_is_disabled = false;
            $scope.validation_msg = '';
            angular.forEach($scope.array, function (value) {
                $scope.show_form[value] = true;
            });
        };

        // Here we use normal jquery method to fetch data since we cant able to put ng-model in input fields(since fields are came from json)
        $scope.payNowClick = function () {
            if ($scope.gateways) {
                gateways_id = $scope.gateways.split('_')[1];
            }
            $scope.zazpay_data = {};
            $scope.zazpay_data.buyer_email = $('.tab-pane.active').find('#buyer_email').val();
            $scope.zazpay_data.buyer_address = $('.tab-pane.active').find('#buyer_address').val();
            $scope.zazpay_data.buyer_city = $('.tab-pane.active').find('#buyer_city').val();
            $scope.zazpay_data.buyer_state = $('.tab-pane.active').find('#buyer_state').val();
            $scope.zazpay_data.buyer_country = $('.tab-pane.active').find('#buyer_country').val();
            $scope.zazpay_data.buyer_zip_code = $('.tab-pane.active').find('#buyer_zip_code').val();
            $scope.zazpay_data.buyer_phone = $('.tab-pane.active').find('#buyer_phone').val();
            $scope.zazpay_data.credit_card_number = $('.tab-pane.active').find('#credit_card_number').val();
            $scope.zazpay_data.credit_card_expire = $('.tab-pane.active').find('#credit_card_expire').val();
            $scope.zazpay_data.credit_card_name_on_card = $('.tab-pane.active').find('#credit_card_name_on_card').val();
            $scope.zazpay_data.credit_card_code = $('.tab-pane.active').find('#credit_card_code').val();
            $scope.zazpay_data.payment_note = $('.tab-pane.active').find('#payment_note').val();
            $scope.zazpay_data.gateway_id = gateways_id;
            $scope.zazpay_data.id = model.course.id;
            $scope.zazpay_data.zazpay_gateway_id = gateways_id;
            $scope.paynow_is_disabled = true;
            payNow.paynowpost($scope.zazpay_data, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Your payment successfully completed.");
                    flash.set(flashMessage, 'success', false);
                    courseTitle = model.course.slug;
                    $scope.paynow_is_disabled = false;
                    $uibModalStack.dismissAll();
                    if ($state.current.name === 'LearnCourse' || $state.current.name === 'LearnCourseEmpty') {
                        $state.reload();
                    } else {
                        $location.path("/learn-course/" + model.course.id + "/" + courseTitle);
                        $scope.$apply();
                    }
                } else if (response.error.code === -4 && response.gateway_callback_url !== '') {
                    window.location.href = response.gateway_callback_url;
                } else if (response.error.code >= 0) {
                    $scope.validation_msg = response.error.message;
                    $scope.error_id = response.error.code;
                    flashMessage = $filter("translate")("Payment couldn\'t be completed. Please recheck the payment form again.");
                    flash.set(flashMessage, "error", false);
                    $scope.paynow_is_disabled = false;
                } else {
                    $scope.paynow_is_disabled = false;
                    $scope.validation_msg = response.error.message;
                    $scope.error_id = response.error.code;
                }
            });
        };
        //for coupon form
        $scope.payCouponClick = function () {
            model.coupon.id = model.course.id;
            if (model.coupon.coupon_code === '' || model.coupon.coupon_code === undefined) {
                $scope.coupon_validation_msg = $filter("translate")("Please Enter Coupon Code");
                return;
            }
            $scope.coupon_is_disabled = true;
            payNow.paynowpost(model.coupon, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Coupon successfully applied.");
                    flash.set(flashMessage, 'success', false);
                    courseTitle = model.course.slug;
                    $location.path("/learn-course/" + model.course.id + "/" + courseTitle);
                } else {
                    $scope.coupon_is_disabled = false;
                    $scope.coupon_validation_msg = response.error.message;
                    $scope.coupon_error_id = response.error.code;
                }
            });
        };
        //for paypal form
        // $scope.payNowPayPalClick = function() {
        //     $scope.paypal_data = {};
        //     $scope.paypal_data.paypal_gateway_enabled = true;
        //     $scope.paypal_data.id = model.course.id;
        //     $scope.paynow_is_disabled = true;
        //     payNow.paynowpost($scope.paypal_data, function(response) {
        //         if (response.error.code === -4 && response.gateway_callback_url !== '') {
        //             window.location.href = response.gateway_callback_url;
        //         } else if (response.error.code >= 0) {
        //             $scope.validation_msg = response.error.message;
        //             $scope.error_id = response.error.code;
        //             flashMessage = $filter("translate")("Payment couldn\'t be completed. Please try again later.");
        //             flash.set(flashMessage, "error", false);
        //             $scope.paynow_is_disabled = false;
        //         } else {
        //             $scope.paynow_is_disabled = false;
        //             $scope.validation_msg = response.error.message;
        //             $scope.error_id = response.error.code;
        //         }
        //     });
        // };

    });

} (angular.module("ace.CourseCheckout")));

(function (module) {

    module.controller('transactionsController', function (TransactionList, $scope, $rootScope, User, $filter, TokenServiceData, $state, ConstCourseType) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("Transactions")+ " | " +$rootScope.settings['site.name'];
        model.loader = true;
        model.transactionsList = [];
        $scope.currentuserId = $rootScope.auth ? $rootScope.auth.id : '';

        function getTransactionList(element) {
            model.loader = true;
            params = {};
            params.page = $scope.currentPage;
            TransactionList.get({
                filter: params
            }).$promise
                .then(function (response) {
                    model.transactionsList = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    angular.forEach(model.transactionsList, function (transaction) {
                        if (transaction.referral_commission_amount !== undefined && transaction.referral_commission_amount !== null) {
                            if (transaction.transaction_type_id == '1' && $scope.currentuserId !== transaction.teacher_user_id) {
                                transaction.amount = parseFloat(transaction.amount) + parseFloat(transaction.referral_commission_amount);
                            }
                        }
                        if (transaction.course_batch_id !== null && transaction.course_batch_id !== undefined) {
                            transaction.course_type = (!transaction.course_batch_is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                        } else {
                            transaction.course_type =  ConstCourseType.video;
                        }
                        /*Instructor Message Dynamically Forming */
                        if (parseInt($scope.currentuserId) === parseInt(transaction.teacher_user_id) && transaction.classname !== 'user_cash_withdrawals') {
                            transaction.teacher_message = transaction.displayname + " bought your course - " + transaction.course_title;
                            if (transaction.is_student === true) {
                                /*Checking Multiple instructor concept*/
                                if (transaction.additional_information !== null && transaction.additional_information !== undefined) {
                                    if (transaction.additional_information.instructor !== null && transaction.additional_information.instructor !== undefined && transaction.additional_information.instructor_user !== null && transaction.additional_information.instructor_user !== undefined) {
                                        var instuctor_share_length = Object.keys(transaction.additional_information.instructor).length;
                                        var instuctor_details_length = Object.keys(transaction.additional_information.instructor_user).length;
                                        if (parseInt(instuctor_share_length) === parseInt(instuctor_details_length)) {
                                            transaction.teacher_message += '-Amount shared to';
                                            angular.forEach(transaction.additional_information.instructor, function (value, user_id) {
                                                console.log(user_id);
                                                transaction.teacher_message += ' ' + transaction.additional_information.instructor_user[user_id] + ' of ' + transaction.additional_information.instructor[user_id] + '%';
                                            });
                                        }
                                    }
                                }
                            }
                            if (parseInt(transaction.referral_commission_amount) !== 0) {
                                if (transaction.additional_information !== null && transaction.additional_information !== undefined) {
                                    if (transaction.additional_information.referral !== null && transaction.additional_information.referral !== undefined) {
                                        transaction.teacher_message += transaction.displayname + " bought your course - " + transaction.course_title + ".  " + transaction.referral_commission_amount +'$ amount Shared for Referring';
                                    }
                                }
                            }
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
        }
        User.getUser({
            id: $scope.currentuserId,
            field: 'available_balance'
        }).$promise
            .then(function (response) {
                if (angular.isDefined(response.data[0])) {
                    model.user_available_balance = response.data[0].available_balance;
                }
            });
        $scope.index = function (element) {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            getTransactionList(element);
        };
        $scope.index(null);
        $scope.paginate = function (element) {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.index(element);
        };
    });

} (angular.module("ace.CourseCheckout")));
(function (module) {
    // module.factory('ViewCourse', function($resource, GENERAL_CONFIG) {
    //     return $resource(
    //         GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
    //             id: '@id'
    //         }, {
    //             'update': {
    //                 method: 'PUT'
    //             }
    //         }
    //     );
    // });
    module.factory('getGatewaysByUser', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/get_gateways', {
                user_id: '@user_id',
                gateway_type: '@gateway_type'
            }
        );
    });
    module.factory('payNow', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/order/:id', {
                id: '@id'
            }, {
                paynowpost: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('Countries', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/countries'
        );
    });
    module.factory('TransactionList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/transactions', {
                id: '@id'
            }
        );
    });
})(angular.module("ace.CourseCheckout"));
