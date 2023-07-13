(function (module) {
    module.controller('UserPurchaseController', ['$state', '$window', '$scope', 'SessionService', '$rootScope', '$location', 'flash', '$filter', '$uibModal', '$uibModalStack', 'UserPurchaseHistory', 'TokenServiceData', 'UserProfile', '$timeout', 'RefundDays', 'CourseUserList', 'ConstPaymentMode', 'ConstToolTipContent', 'ConstCourseType', function ($state, $window, $scope, SessionService, $rootScope, $location, flash, $filter, $uibModal, $uibModalStack, UserPurchaseHistory, TokenServiceData, UserProfile, $timeout, RefundDays, CourseUserList, ConstPaymentMode, ConstToolTipContent, ConstCourseType) {
        /**VARIABLE DECLARATION  */
        $rootScope.pageTitle = $filter("translate")("Purchase")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.refund_loader = true;
        model.loader = true;
        /**FUNCTION DECALARATION  */
        $scope.user = {};
        $scope.ConstToolTipContent = ConstToolTipContent;
        model.getPurchaseHistory = getPurchaseHistory;
        model.getRefundPurchaseHistory = getRefundPurchaseHistory;
        /**Getting the purchase hsitory */
        function getPurchaseHistory() {
            model.loader = true;
            var params = {};
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            params.page = $scope.currentPage;
            params.sort = 'id';
            params.sortby = 'DESC';
            params.is_paid = true;
            UserPurchaseHistory.get(params, function (response) {
                if (response.data.length > 0) {
                    /*Formatting the date with Current Country Zone*/
                    $scope.purchase_histories = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    /*Payment Mode Assigning*/
                    angular.forEach($scope.purchase_histories, function (pruchase_history) {
                        if (pruchase_history.is_credit_card_payment === true) {
                            pruchase_history.payment_mode = ConstPaymentMode.payment_type1;
                            pruchase_history.show_credit_card = false;
                            if (angular.isDefined(pruchase_history.credit_card_type) && pruchase_history.credit_card_type !== null && angular.isDefined(pruchase_history.masked_cc) && pruchase_history.masked_cc !== null) {
                                pruchase_history.show_credit_card = true;
                            }
                        } else {
                            pruchase_history.payment_mode = ConstPaymentMode.payment_type2;
                        }
                    });
                }
                $scope._metadata = response._metadata;
                model.loader = false;
            });
        }
        /** paginate function */
        $scope.paginate = function () {
            $scope.currentPage = parseInt($scope.currentPage);
            getPurchaseHistory();
        };
        /**Getting the Refunded purchase hsitory */
        function getRefundPurchaseHistory() {
            model.refund_loader = true;
            var params = {};
            $scope.refund_currentPage = ($scope.refund_currentPage !== undefined) ? parseInt($scope.refund_currentPage) : 1;
            params.page = $scope.refund_currentPage;
            params.filter = 'refunded';
            CourseUserList.get(params, function (response) {
                if (response.data.length > 0) {
                    $scope.refund_purchase_histories = $filter('CountryTimezone')(response.data, ['refunded_date'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    angular.forEach($scope.refund_purchase_histories, function (refund_history) {
                        if (refund_history.course_batch_id !== null && refund_history.course_batch_id !== undefined) {
                            angular.forEach(refund_history.course_batches, function (batch) {
                                refund_history.course_type = (!batch.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                            });
                        } else {
                            refund_history.course_type = ConstCourseType.video;
                        }
                    });
                }
                $scope.refund_metadata = response._metadata;
                model.refund_loader = false;
            });
        }
        /** Refunded paginate function */
        $scope.refund_paginate = function () {
            $scope.currentPage = parseInt($scope.refund_currentPage);
            getRefundPurchaseHistory();
        };
        /**Openingthe Receipt Model * */
        $scope.openReceiptModel = function (order) {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    templateUrl: 'users/user_purchase_receipt.tpl.html',
                    controller: function (Order, $scope, $uibModalStack, $uibModal, RefundDays, moment, $filter, ConstPaymentMode) {
                        var model = this;
                        $scope.ConstPaymentMode = ConstPaymentMode;
                        $scope.order = Order;
                        if ($scope.order.is_paid) {
                            $scope.sub_total_price = 0;
                            $scope.overall_discount_price = 0;
                            angular.forEach($scope.order.course_users, function (course_user) {
                                if (!course_user.is_refund_requested && course_user.refunded_date === null) {
                                    var today = new Date(),
                                        temp_refund,
                                        refund_last_date,
                                        currentdate = $filter('date')(Date.parse(today), "yyyy-MM-dd");
                                    if (course_user.course_batches === null || course_user.course_batches === undefined) {
                                        // For vedio  refund date calculating
                                        temp_refund = new Date(course_user.created);
                                        temp_refund.setDate(temp_refund.getDate() + parseInt(RefundDays.vedio));
                                        refund_last_date = $filter('date')(Date.parse(temp_refund), "yyyy-MM-dd");
                                        course_user.course_type = ConstCourseType.video;
                                    } else if (course_user.course_batches !== null || course_user.course_batches !== undefined) {
                                        angular.forEach(course_user.course_batches, function (batch) {
                                            course_user.course_type = (!batch.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                                            // For Offine refund date calculating
                                            if (batch.is_offline) {
                                                temp_refund = new Date(batch.start_date);
                                                temp_refund.setDate(temp_refund.getDate() + parseInt(RefundDays.Offline));
                                                refund_last_date = $filter('date')(Date.parse(temp_refund), "yyyy-MM-dd");

                                            }
                                            // For Webinar refund date calculating
                                            if (!batch.is_offline) {
                                                temp_refund = new Date(batch.start_date);
                                                temp_refund.setDate(temp_refund.getDate() + parseInt(RefundDays.Webinar));
                                                refund_last_date = $filter('date')(Date.parse(temp_refund), "yyyy-MM-dd");
                                            }
                                        });
                                    }
                                    if (currentdate == refund_last_date || currentdate < refund_last_date) {
                                        course_user.refund_allow = true;
                                    }
                                } else if (course_user.is_refund_requested && course_user.refunded_date === null) {
                                    course_user.refund_request_Calimed = true;
                                } else if (course_user.is_refund_requested && course_user.refunded_date !== null) {
                                    course_user.refund_Accepted = true;
                                } else if (!course_user.is_refund_requested && course_user.refunded_date !== null) {
                                    course_user.refund_Rejected = true;
                                }

                                angular.forEach(course_user.courses, function (course) {
                                    course_user.course_title = course.course_title;
                                    course_user.course_image_hash = course.course_image_hash;
                                });
                                course_user.paid_amount = course_user.price;
                                if (course_user.coupon_id !== null && course_user.coupon_id !== undefined) {
                                    angular.forEach(course_user.coupons, function (coupon) {
                                        course_user.coupon_code = coupon.coupon_code;
                                        course_user.paid_amount = parseFloat(course_user.price) - parseFloat(course_user.discount_amount);
                                        $scope.overall_discount_price = parseFloat($scope.overall_discount_price) + parseFloat(course_user.discount_amount);
                                    });
                                }
                                if (course_user.coupon_id === null || course_user.coupon_id === undefined && course_user.discount_amount !== null && course_user.discount_amount !== undefined) {
                                    course_user.paid_amount = parseFloat(course_user.price) - parseFloat(course_user.discount_amount);
                                    $scope.overall_discount_price = parseFloat($scope.overall_discount_price) + parseFloat(course_user.discount_amount);
                                }
                            });
                        }


                        $scope.refund_reason = function (course_user) {
                            $scope.modalInstance = $uibModal.open({
                                templateUrl: 'users/orderRefundReason.tpl.html',
                                controller: function (refund, $scope, $uibModalStack, $uibModal, flash, UserOrderRefundFactory) {
                                    $scope.refund = {};
                                    $scope.refund.id = refund.id;
                                    $scope.createOrderRefund = function ($valid) {
                                        if ($valid) {
                                            if ($scope.refund.id !== null && $scope.refund.id !== undefined) {
                                                var params = {};
                                                params.id = $scope.refund.id;
                                                params.refund_reason = $scope.refund.refund_reason;
                                                params.is_refund_requested = 1;
                                                UserOrderRefundFactory.create(params, function (response) {
                                                    if (response.error.code === 0) {
                                                        flashMessage = $filter("translate")('Order successfully Claimed for refund process');
                                                        flash.set(flashMessage, 'success', true);
                                                        $uibModalStack.dismissAll();
                                                        getPurchaseHistory();
                                                    } else {
                                                        flashMessage = $filter("translate")("Failed to claim the refund process");
                                                        flash.set(flashMessage, 'error', false);
                                                        $scope.$close();
                                                        getPurchaseHistory();
                                                    }
                                                }, function (error) {
                                                    flashMessage = $filter("translate")("Failed to claim the refund process");
                                                });

                                            }
                                        }

                                    };
                                    $scope.modalClose = function (e) {
                                        e.preventDefault();
                                        $scope.$close();
                                    };
                                },
                                resolve: {
                                    refund: function () {
                                        return course_user;
                                    }
                                }
                            });
                        };
                        //Modal Close function
                        $scope.modalClose = function (e) {
                            e.preventDefault();
                            $scope.$close();
                        };
                    },
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        Order: function () {
                            return order;
                        },
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
        /**Init function calling  */
        getPurchaseHistory();
        getRefundPurchaseHistory();
    }]);
} (angular.module("ace.users")));
