(function (module) {
    module.controller('UserPurchaseOrderReceiptController', ['$state', '$window', '$scope', 'SessionService', '$rootScope', '$location', 'flash', '$filter', '$uibModal', 'UserOrderFactory', 'TokenServiceData', 'UserProfile', 'ConstPaymentMode', 'ConstCourseType', 'ConstToolTipContent','$analytics', 'Slug', function ($state, $window, $scope, SessionService, $rootScope, $location, flash, $filter, $uibModal, UserOrderFactory, TokenServiceData, UserProfile, ConstPaymentMode, ConstCourseType, ConstToolTipContent,$analytics, Slug) {
        $scope.user = {};
        $scope.ConstPaymentMode= ConstPaymentMode;
        $scope.ConstToolTipContent = ConstToolTipContent;
        $scope.currentPageType = 'page';
        /** */
        if (parseInt($state.params.error_code) === 512) {
            flashMessage = $filter("translate")("Payment Failed. Please, try again.");
            flash.set(flashMessage, 'error', false);

        } else if (parseInt($state.params.error_code) === 0) {
            flashMessage = $filter("translate")("Payment successfully completed.");
            flash.set(flashMessage, 'success', false);
        }
        $scope.current_state = $state.current.name;
        $rootScope.pageTitle = $filter("translate")("Invoice")+ " | " +$rootScope.settings['site.name'];
        if ($state.params.id !== null && $state.params.id !== undefined && $state.params.id !== '') {
            $scope.order_voice = true;
            UserOrderFactory.get({
                id: $state.params.id
            }, function (response) {
                if (response.data.length > 0) {
                    $scope.sub_total_price = 0;
                    $scope.overall_discount_price = 0;
                    response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy hh:mm a');
                    $scope.order = response.data[0];
                    /*Payment Mode Assigning*/
                    if ($scope.order.is_credit_card_payment === true) {
                        $scope.order.payment_mode = ConstPaymentMode.payment_type1;
                        $scope.order.show_credit_card = false;
                        if (angular.isDefined($scope.order.credit_card_type) && $scope.order.credit_card_type !== null && angular.isDefined($scope.order.masked_cc) && $scope.order.masked_cc !== null) {
                            $scope.order.show_credit_card = true;
                        }
                    } else {
                        $scope.order.payment_mode = ConstPaymentMode.payment_type2;
                    }

                    /*Course Type assigning */
                    angular.forEach($scope.order.course_users, function (course_user) {
                        if (course_user.course_batches === null || course_user.course_batches === undefined) {
                            course_user.course_type = ConstCourseType.video;
                        } else if (course_user.course_batches !== null || course_user.course_batches !== undefined) {
                            angular.forEach(course_user.course_batches, function (batch) {
                                course_user.course_type = (!batch.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                            });
                        }
                        angular.forEach(course_user.courses, function (course) {
                            course_user.course_title = course.course_title;
                            course_user.course_image_hash = course.course_image_hash;

                        });

                        $scope.sub_total_price = parseFloat($scope.sub_total_price) + parseFloat(course_user.price);
                        /*Calculating Paid amount from discount amount */
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

                    //Analytics
                    var productsTitles = [];
                    var productsCategories = [];
                    var items = [];
                    var authors = [];
                    angular.forEach($scope.order.course_users, function (order) {
                        productsTitles.push(order.course_title);
                        productsCategories.push(order.courses[0].category_name);
                        authors.push(order.users[0].teacher_name);
                        items.push({
                            "$event_id" : order.id,
                            "SKU" : order.course_id,
                            "ProductName" : order.course_title,
                            "Quantity" : 1,
                            "ItemPrice" : order.paid_amount,
                            "RowTotal" : order.paid_amount*1,
                            "ProductURL" : order.course_url,
                            "ImageURL": $rootScope.site_url+'img/big_thumb/Course/'+order.course_image_hash,
                            "ProductURL": encodeURI($rootScope.site_url+'course/'+order.course_id+'/'+Slug.slugify(order.course_title).toLowerCase()),
                            "Categories" : [order.courses[0].category_name], 
                            "Categories_id" : [order.courses[0].category_id],
                            "Brand" : order.users[0].teacher_name
                        });
                    });

                    var item = {
                        "$event_id" : $scope.order.id, // The cart ID if you have it. Otherwise remove this line.
                        "$value" : $scope.order.amount,
                        "Categories" : productsCategories,
                        "ItemNames" : productsTitles,
                        "Brands" : authors,
                        // "Discount Code": "Free Shipping", // Discount code (if applicable)
                        // "Discount Value": 5, // Value of discount (if applicable)
                        "Items" : items
                    }
                    console.log($scope.order);
                    $analytics.eventTrack('Placed Order', item);
                }
            });
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: error.status
            });
        }
    }]);
} (angular.module("ace.users")));
