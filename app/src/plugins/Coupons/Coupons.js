/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {

}(angular.module('ace.coupons', [
    'ui.router',
    'ngResource'

])));

(function(module) {
    module.factory('Coupons', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/coupons', {
                id: '@id'
            }
        );
    });
    module.factory('CouponDetail', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/coupons/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CouponCartServiceUpdate', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/carts/:id', {}, {
                update: {
                    method: 'PUT'
                }
            }
        );
    });
})(angular.module("ace.coupons"));

(function(module) {
    module.directive('courseCoupon', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'A',
            templateUrl: 'src/plugins/Coupons/courseCouponButton.tpl.html',
            link: linker,
            controller: 'CourseCouponButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('CourseCouponButtonController', function($scope) {
        var model = this;
        $scope.courseID = model.courseId;
    });
    module.controller('CouponController', function($scope, $state, flash, $filter, Coupons, CouponDetail, $rootScope, TokenServiceData, $location) {
        $rootScope.pageTitle = $filter("translate")("Manage Coupons")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.loading = true;
        model.course = [];
        model._metadata = [];
        model.existingCoupons = [];
        model.updateCoupons = {};
        model.coupon = new Coupons();
        $scope.data = {};
        model.couponSave = couponSave;
        model.getExistingCoupons = getExistingCoupons;
        model.changeCouponStatus = changeCouponStatus;
        //Initial date setting for expire date
        function DateFormatting() {
            var Today = new Date();
            var yesterday = Today.setDate(Today.getDate() + 1);
            model.picker1 = {
                date: new Date(),
                datepickerOptions: {
                    showWeeks: false,
                    minDate: new Date(),
                }
            };
        }


        function couponSave($valid, CouponForm) {
            // model.coupon.teacher_user_id = $rootScope.auth.id;
            if ($valid) {
                model.coupon.course_id = $state.params.id;
                if (model.coupon.error !== null && model.coupon.error !== undefined) {
                    delete model.coupon.error;
                }
                model.coupon.$save()
                    .then(function(response) {
                        if (response.id !== null && response.id !== '' && response.id !== undefined) {
                            success_msg = $filter("translate")("Coupon Code created successfully");
                            CouponForm.$setPristine();
                            CouponForm.$setUntouched();
                            flash.set(success_msg, "success", false);
                            DateFormatting();
                            getExistingCoupons();
                            if (model.NextButtonVal === 'next') {
                                $location.path('/manage-course/edit-management/' + $state.params.id);
                            }
                        }
                        if (response.error !== null && response.error !== '' && response.error !== undefined) {
                            success_msg = $filter("translate")(response.error.message);
                            flash.set(success_msg, "error", false);
                        }
                    })
                    .catch(function(error) {

                    })
                    .finally();
            }
        }

        //Date Fomatting function  Datepicker open and button configuration
        model.openCalendar = function(e, picker) {
            model[picker].open = true;
        };

        // watch min and max dates to calculate difference
        var unwatchMinMaxValues = $scope.$watch(function() {
            return [model.picker1];
        }, function() {
            // min max dates
            model.coupon.coupon_end_date = model.picker1.date;
        }, true);

        function getExistingCoupons(element) {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                Coupons.get({
                        course_id: $state.params.id,
                        page: model._metadata.currentPage,
                    }).$promise
                    .then(function(response) {
                        model._metadata = response._metadata;
                        model.existingCoupons = $filter('CountryTimezone')(response.data, ['created', 'coupon_end_date'], 'TimeZoneSet', 'dd MMM yyyy');
                        model.loading = false;
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }

        function changeCouponStatus(status, coupon_id) {
            model.updateCoupons.id = coupon_id;
            model.updateCoupons.course_id = $state.params.id;
            model.updateCoupons.is_active = status;
            CouponDetail.update(model.updateCoupons, function(response) {
                if (response.error.code !== 1) {
                    flash.set("Updated Successfully", 'success', false);
                    getExistingCoupons();
                }
            });
        }
        $scope.index = function(element) {
            DateFormatting();
            getExistingCoupons(element);
        };
        $scope.index(null);
        $scope.paginate = function(element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
    });
    //View Course Coupon Applied
    module.directive('courseCouponApply', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/Coupons/courseCouponApply.tpl.html',
            link: linker,
            controller: 'courseCouponApplyController as model',
            bindToController: true,
            scope: {
                cartId: '@cartId',
                updateparent: '&',
                courseId: '@courseId'
            }
        };
    });
    module.controller('courseCouponApplyController', function($scope, CouponCartServiceUpdate, $rootScope, $uibModal, $state, flash) {
        var model = this;
        model.cart = {};
        /**Variable Assigning  */
        var userID = $rootScope.auth ? $rootScope.auth.id : '';
        /**Function Declaration */
        model.applyDiscount = applyDiscount;
        /**Applying Discount Function  and Add to the Cart */
        function applyDiscount(Coupon_code) {
            if (!$.cookie('refresh_token')) {
                if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                    model.ischeckout = false;
                    $scope.modalInstance = $uibModal.open({
                        scope: $scope,
                        templateUrl: 'users/login.tpl.html',
                        controller: 'userLoginController',
                        size: 'lg',
                        resolve: {
                            pageType: function() {
                                return "modal";
                            },
                            TokenServiceData: function($ocLazyLoad, TokenService, $rootScope, $q) {
                                var promiseSettings = TokenService.promiseSettings;
                                return $q.all({
                                    load: promiseSettings.then(function(data) {
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
                    }).result.then(function(result) {
                        $rootScope.modal = false;
                    }, function(result) {
                        $rootScope.modal = false;
                    }).finally(function() {
                        $rootScope.modal = false;
                    });
                    $rootScope.modal = true;
                }
            } else {
                model.cart.coupon_code = Coupon_code;
                model.cart.course_id = model.courseId;
                $scope.coupon_disableButton = true;
                //Coupon code applying for differenet course type batches
                if (model.courseBatchId !== undefined && model.courseBatchId !== null) {
                    model.course_batch_id = model.courseBatchId;
                }
                //If MultiCurrency is enabled - coupon code applied based on country currency
                if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                    model.cart.currency_id = $rootScope.settings.geoIP.id;
                }
                CouponCartServiceUpdate.update({ id: model.cartId }, model.cart).$promise
                    .then(function(response) {
                        if (response.error.code === 0) {
                            flash.set("Coupon Code has been successfully added", 'success', true);
                            model.updateparent();
                        } else {
                            flash.set(response.error.message, 'error', true);

                        }
                        $scope.coupon_disableButton = false;
                    }, function(error) {
                        $scope.coupon_disableButton = false;
                    });
            }
        }
    });
}(angular.module("ace.coupons")));
