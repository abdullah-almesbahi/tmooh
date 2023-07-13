/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.payPalREST', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('paypalRest', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/PaypalREST/payPalRESTButton.tpl.html',
            link: linker,
            controller: 'PayPalRESTButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('PayPalRESTButtonController', function ($scope, getGatewaysByUser, Countries, getPaPalVault, courseCheckoutFactory, $filter, $window, $state, $location, flash, $uibModalStack, $uibModal, $cookies, User, $rootScope, CartsService, md5) {
        var model = this;
        model.loading = true;
        $scope.payment_tab = "Paypal";
        $scope.buyer = {};
        $scope.courseID = model.courseId;
        $scope.paynow_is_disabled = false;
        /***FUNCTION ASSIGN WITH MODEL */
        model.courseCheckout = courseCheckout;

        //Getting the Already used vaults
        function getVaultList() {
            model.paypal_Vaults = [];
            getPaPalVault.get(function (response) {
                if (response.error.code === 0) {
                    model.paypal_Vaults = response.data;
                }
            });
        }
        // calling and getting the payment gateway list 
        function getGatewaysList() {
            model.loading = true;
            Countries.get({
                limit: 'all',
                sort: 'name',
                sort_by: 'ASC'
            }).$promise.then(function (response) {
                $scope.countries = response.data;
            });
            getGatewaysByUser.get({}, function (payment_response) {
                $scope.group_gateway_id = "";
                if (payment_response.error.code === 0) {
                    if (payment_response.PaypalREST !== null && payment_response.PaypalREST !== undefined) {
                        $scope.buyer.payment_gateway_id = payment_response.PaypalREST;
                    } else {
                        model.no_payment = true;
                    }
                    model.loading = false;
                }
            });
        }
        //  updating payment gatways assigning while changing the tab
        $scope.paymentGatewayUpdate = function (pane, form) {
            $scope.payment_tab = pane;
            form.$setPristine();
            form.$setUntouched();
        };
        //overall cart item checkout function 
        function courseCheckout(valid) {
            if (valid) {
                $scope.paynow_is_disabled = true;
                if ($scope.payment_tab === 'Credit') {
                    $scope.buyer.is_credit_card_payment = 1;
                }
                if (angular.isDefined($scope.buyer.credit_card_expired) && ($scope.buyer.credit_card_expired.month || $scope.buyer.credit_card_expired.year)) {
                    $scope.buyer.expire_month = $scope.buyer.credit_card_expired.month;
                    $scope.buyer.expire_year = $scope.buyer.credit_card_expired.year;
                }
                if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                    // assigning the session_id cart from cart cookies
                    var new_cookie1 = $cookies.getObject('cart_cookies');
                    $scope.buyer.session_id = new_cookie1.hash;
                }
                if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                    //Multicurrency is enabled. Sending the country currency details
                    $scope.buyer.currency_id = $rootScope.settings.geoIP.id;
                }
                courseCheckoutFactory.create($scope.buyer, function (response) {
                    if (response.error.code === 0) {
                        if (angular.isDefined(response.data.approval_link)) {
                            if (angular.isDefined(response.data.approval_link)) {
                                setNewCookieeSession();
                                $window.location.href = response.data.approval_link;
                            }
                        } else if (response.error.code === 0) {
                            setNewCookieeSession();
                            if (angular.isDefined(response.data.id)) {
                                $state.go('UserPurchaseOrderReceipt', { id: response.data.id });
                            } else {
                                $state.go('myCoursesLearning');
                            }

                            flashMessage = $filter("translate")("Your payment has been completed successfully.");
                            flash.set(flashMessage, 'success', true, 8000);
                        } else if (response.error.code === 512) {
                            flashMessage = $filter("translate")("Payment Failed. Please, try again.");
                            flash.set(flashMessage, 'error', false);
                        }
                    } else {
                        flashMessage = $filter("translate")("We are unable to place your order. Please try again.");
                        flash.set(flashMessage, 'error', false);
                    }
                    $uibModalStack.dismissAll();
                    $scope.paynow_is_disabled = true;

                }, function (error) {
                    if (error.status === 502) {
                        flashMessage = $filter("translate")("payment could not be completed.");
                        flash.set(flashMessage, 'error', false);
                        $uibModalStack.dismissAll();
                    } else {
                        flashMessage = $filter("translate")("payment could not be completed.Pls try again later");
                        flash.set(flashMessage, 'error', false);
                        $uibModalStack.dismissAll();
                        $scope.paynow_is_disabled = true;
                    }
                });
            }

        }
        function setNewCookieeSession() {
            var new_hash = md5.createHash(Date()), new_cookie = {};
            new_cookie.hash = new_hash;
            $cookies.putObject('cart_cookies', new_cookie, { path: '/' });
            Getcart();
        }
        function Getcart() {
            var getcart = {};
            if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                //Multicurrency is enabled. currency_id filter need applied 
                getcart.currency_id = $rootScope.settings.geoIP.id;
            }
            if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                var new_cookie1 = $cookies.getObject('cart_cookies');
                getcart.session_id = new_cookie1.hash;
            }
            getcart.sort = 'id';
            getcart.sortby = 'DESC';
            CartsService.get(getcart).$promise
                .then(function (response) {
                    $rootScope.$emit('updateCartParent', {
                        carts: response.data
                    });
                });
        }

        function init() {
            getGatewaysList();
            getVaultList();
        }
        init();
    });

})(angular.module('ace.payPalREST'));

(function (module) {

    module.factory('getGatewaysByUser', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/get_gateways', {
                user_id: '@user_id',
                gateway_type: '@gateway_type'
            }
        );
    });
    module.factory('Countries', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/countries'
        );
    });
    module.factory('getPaPalVault', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/paypal/vaults'
        );
    });

    module.factory('courseCheckoutFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/checkout', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('User', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/:id', {
            id: '@id'
        }, {
                'update': {
                    method: 'PUT'
                },
                'getUser': {
                    method: 'GET'
                }
            });
    });
})(angular.module("ace.payPalREST"));