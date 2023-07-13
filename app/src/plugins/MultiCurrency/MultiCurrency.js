/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.multiCurrency', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('multiCurrency', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/MultiCurrency/multiCurrency.tpl.html',
            link: linker,
            controller: 'multiCurrencyController as model',
            bindToController: true,
            scope: {
                position: '@position',
                paidAgree: '@paidAgree',
                paypalEmail: '@paypalEmail'

            }
        };
    });
    module.controller('multiCurrencyController', function ($state, ViewCourse, GetCurrencyList, $location, $scope, flash, $filter, $rootScope, $interval, User, SweetAlert, ConstToolTipContent) {
        /**Variable declaration */
        var model = this;
        model.coursePrice = {};
        /**Function declaration */
        model.CurrencyTireFilter = CurrencyTireFilter;
        model.TireFilter = TireFilter;
        model.priceSave = priceSave;
        model.loading = true;
        /**Getting the course details and curreency detail */
        function getCourseDetails() {
            model.loading = true;
            $scope.$on("CourseDetails", function (evt, data) {
                model.loading = true;
                if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                    model.course = data;
                    model.coursePrice.price = data.price;
                    if (model.course !== null && model.course !== undefined) {
                        GetCurrencyList.get({
                            limit: 'all',
                            sort_by: 'ASC',
                            sort: 'code',
                        }).$promise
                            .then(function (response) {
                                model.currencies = response.data;
                                if (model.course.currency_id !== null && model.course.currency_id !== undefined) {
                                    angular.forEach(model.currencies, function (currency) {
                                        if (model.course.currency_id === currency.id) {
                                            $scope.selected = currency;
                                            model.coursePrice.currency_id = currency.id;
                                            if (currency.currencies_tiers !== null) {
                                                model.currencies_tiers = currency.currencies_tiers;
                                                if (model.course.tier_id !== null && model.course.tier_id !== undefined) {
                                                    angular.forEach(model.currencies_tiers, function (tier) {
                                                        if (tier.tier_id === model.course.tier_id) {
                                                            $scope.tier_selected = tier;
                                                        }
                                                    });
                                                } else {
                                                    $scope.tier_selected = {};
                                                    $scope.tier_selected.amount = 'Free';
                                                    model.coursePrice.tier_id = null;
                                                    model.coursePrice.price = 0;
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    angular.forEach(model.currencies, function (currency) {
                                        if ($rootScope.settings['site.currency_code'] === currency.code) {
                                            $scope.selected = currency;
                                            model.coursePrice.currency_id = currency.id;
                                            if (currency.currencies_tiers !== null) {
                                                model.currencies_tiers = currency.currencies_tiers;
                                            }
                                        }
                                    });
                                }

                            }, function (error) {
                                if (error.status === 404) {
                                    $scope.$emit('updateParent', {
                                        isOn404: true,
                                        errorNo: error.status
                                    });
                                }
                            });
                    }
                    model.loading = false;


                } else {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: 404
                    });
                }
            });

        }

        /**Currency filter */
        function CurrencyTireFilter(index) {
            $scope.selected = model.currencies[index];
            model.coursePrice.currency_id = $scope.selected.id;
            if (model.currencies[index].currencies_tiers !== null) {
                model.currencies_tiers = model.currencies[index].currencies_tiers;
                if ($scope.tier_selected !== null && $scope.tier_selected !== undefined) {
                    if (model.currencies_tiers) {
                        angular.forEach(model.currencies_tiers, function (tier) {
                            if ($scope.tier_selected.tier_id === tier.tier_id) {
                                $scope.tier_selected = tier;
                                model.coursePrice.tier_id = tier.tier_id;
                                model.coursePrice.price = $scope.tier_selected.amount;
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
        function TireFilter(tier) {
            model.coursePrice.is_price = 1;
            if (tier === 'Free') {
                $scope.tier_selected = {};
                $scope.tier_selected.amount = 'Free';
                model.coursePrice.tier_id = null;
                model.coursePrice.price = 0;
            } else {
                var tier_index = model.currencies_tiers.indexOf(tier);
                if (tier_index !== null && tier_index !== undefined) {
                    $scope.tier_selected = model.currencies_tiers[tier_index];
                    model.coursePrice.tier_id = $scope.tier_selected.tier_id;
                    model.coursePrice.price = $scope.tier_selected.amount;
                }
            }
        }

        /**Course currency, tier and amount updating  */
        function priceSave($valid) {
            if ($valid) {
                if (model.coursePrice.tier_id !== null && model.coursePrice.tier_id !== undefined && $rootScope.auth.providertype != 'admin') {
                    if (model.paidAgree !== 'true') {
                    // if (model.paidAgree !== 'true' || (model.paypalEmail === undefined || model.paypalEmail === null || model.paypalEmail === '')) {
                        SweetAlert.swal(ConstToolTipContent.PaidCourseAlert);
                        return true;
                    }
                }
                model.coursePrice.id = $state.params.id;
                ViewCourse.update(model.coursePrice, function (response) {
                    if (response.error.code === 0) {
                        flashMessage = $filter("translate")("Price has been updated successfully.");
                        flash.set(flashMessage, 'success', false);
                        if (model.NextButtonVal === 'next') {
                            if (model.course.coursetype.online === true || model.course.coursetype.onsite === true) {
                                $state.go('manageDemoSessionCourse', { id: $state.params.id });
                            } else {
                                $state.go('manageCourseAutomatedMessage', { id: $state.params.id });
                            }
                        } else {
                            $rootScope.$emit('updateCourseParent', {});
                        }
                        UpdateCourseStatus();
                    } else {
                        flashMessage = $filter("translate")("Oops, an error has occurred while updating course price. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    }
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while updating course price. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                });
            }


        }
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
        /*Init function*/
        getCourseDetails();

    });
})(angular.module('ace.multiCurrency'));

(function (module) {

    module.factory('GetCurrencyList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/currencies', {}
        );
    });
    module.factory('ViewCourse', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT',
                    id: '@id'
                }
            }
        );
    });
})(angular.module("ace.multiCurrency"));
