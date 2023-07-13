
angular.module('base')
    .controller('CurrencyTiersController', function ($scope, $http, notification, $state, $window) {
        $scope.currency_tiers = [];
        getTiers();
        $scope.tier = {};
        $scope.tier.tier_AddForm = false;
        function getTiers() {
            $http({
                url: admin_api_url + 'api/v1/tiers',
                method: "GET",
                params: { limit: 'all', sort: 'amount', sort_by: 'ASC' }
            }).success(function (response) {
                if (response.error.code === 0) {
                    $scope.default_tiers = response.data;
                    var tmp_tiers = [];
                    angular.forEach($scope.default_tiers, function (value) {
                        tmp_tiers.push({
                            'tier_id': value.id
                        });
                    });
                    var params = {};
                    params.limit = 'all';
                    $http({
                        url: admin_api_url + 'api/v1/currencies',
                        method: "GET",
                        params: { limit: 'all', sort: 'id', sort_by: 'ASC' }
                    }).success(function (response) {
                        $scope.currencies = response.data;
                        if (response.error.code === 0) {
                            angular.forEach($scope.currencies, function (currency) {
                                angular.forEach(tmp_tiers, function (tmp_tier) {
                                    if (currency.currencies_tiers === null || currency.currencies_tiers === undefined) {
                                        if (tmp_tier.currency === undefined) {
                                            tmp_tier.currency = [];
                                        }
                                        tmp_tier.currency.push({
                                            'Currency_code': currency.code,
                                            'Currency_id': currency.id,
                                            'amount': null
                                        });
                                    } else {
                                        var is_found = false;
                                        angular.forEach(currency.currencies_tiers, function (currencies_tier) {
                                            if (tmp_tier.tier_id == currencies_tier.tier_id) {
                                                amount = currencies_tier.amount;
                                                is_found = true;

                                            }
                                        });
                                        if (is_found) {
                                            if (tmp_tier.currency === undefined) {
                                                tmp_tier.currency = [];
                                            }
                                            tmp_tier.currency.push({
                                                'Currency_code': currency.code,
                                                'Currency_id': currency.id,
                                                'amount': amount
                                            });
                                        } else {
                                            if (tmp_tier.currency === undefined) {
                                                tmp_tier.currency = [];
                                            }
                                            tmp_tier.currency.push({
                                                'Currency_code': currency.code,
                                                'Currency_id': currency.id,
                                                'amount': null
                                            });
                                        }
                                    }
                                });
                                $scope.currencies_tier = tmp_tiers;
                            });
                        }
                    });
                }

            });
        }
        /**Crating the tier */
        $scope.TierSubmit = function () {
            var params = {};
            params.amount = $scope.tier.amount;
            $http.post(admin_api_url + 'api/v1/tiers', params).success(function (response) {
                if (angular.isDefined(response.error.code === 0)) {
                    getTiers();
                    $scope.tier.tier_AddForm = false;
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
        $scope.UpdateCurrencyTiers = function (parent_index, child_index, tier_id) {
            var params = {};
            params.tier_id = tier_id;
            params.currency_id = $scope.currencies_tier[parent_index].currency[child_index].Currency_id;
            params.amount = $scope.currencies_tier[parent_index].currency[child_index].amount;
            /* params.currency_id = $scope.currencies[parent_index].id;
             params.amount = $scope.currencies[parent_index].tiers[child_index].amount;*/
            $http.post(admin_api_url + 'api/v1/currencies_tiers', params).success(function (response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
    })
    .controller('DiscountCurrencyTiersController', function ($scope, $http, notification, $state, $window) {
        $scope.currency_tiers = [];
        getTiers();
        $scope.tier = {};
        $scope.tier.tier_AddForm = false;
        function getTiers() {
            $http({
                url: admin_api_url + 'api/v1/discount_tiers',
                method: "GET",
                params: { limit: 'all', sort: 'amount', sort_by: 'ASC' }
            }).success(function (response) {
                if (response.error.code === 0) {
                    $scope.default_tiers = response.data;
                    var tmp_tiers = [];
                    angular.forEach($scope.default_tiers, function (value) {
                        tmp_tiers.push({
                            'tier_id': value.id
                        });
                    });
                    var params = {};
                    params.limit = 'all';
                    $http({
                        url: admin_api_url + 'api/v1/currencies',
                        method: "GET",
                        params: { limit: 'all', sort: 'id', sort_by: 'ASC' }
                    }).success(function (response) {
                        $scope.currencies = response.data;
                        if (response.error.code === 0) {
                            angular.forEach($scope.currencies, function (currency) {
                                angular.forEach(tmp_tiers, function (tmp_tier) {
                                    if (currency.currencies_discount_tiers === null || currency.currencies_discount_tiers === undefined) {
                                        if (tmp_tier.currency === undefined) {
                                            tmp_tier.currency = [];
                                        }
                                        tmp_tier.currency.push({
                                            'Currency_code': currency.code,
                                            'Currency_id': currency.id,
                                            'amount': null
                                        });
                                    } else {
                                        var is_found = false;
                                        angular.forEach(currency.currencies_discount_tiers, function (currencies_tier) {
                                            if (tmp_tier.tier_id == currencies_tier.tier_id) {
                                                amount = currencies_tier.amount;
                                                is_found = true;

                                            }
                                        });
                                        if (is_found) {
                                            if (tmp_tier.currency === undefined) {
                                                tmp_tier.currency = [];
                                            }
                                            tmp_tier.currency.push({
                                                'Currency_code': currency.code,
                                                'Currency_id': currency.id,
                                                'amount': amount
                                            });
                                        } else {
                                            if (tmp_tier.currency === undefined) {
                                                tmp_tier.currency = [];
                                            }
                                            tmp_tier.currency.push({
                                                'Currency_code': currency.code,
                                                'Currency_id': currency.id,
                                                'amount': null
                                            });
                                        }
                                    }
                                });
                                $scope.currencies_tier = tmp_tiers;
                            });
                        }
                    });
                }

            });
        }
        /**Crating the tier */
        $scope.TierSubmit = function () {
            var params = {};
            params.amount = $scope.tier.amount;
            $http.post(admin_api_url + 'api/v1/discount_tiers', params).success(function (response) {
                if (angular.isDefined(response.error.code === 0)) {
                    getTiers();
                    $scope.tier.tier_AddForm = false;
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
        $scope.UpdateCurrencyTiers = function (parent_index, child_index, tier_id) {
            var params = {};
            params.tier_id = tier_id;
            params.currency_id = $scope.currencies_tier[parent_index].currency[child_index].Currency_id;
            params.amount = $scope.currencies_tier[parent_index].currency[child_index].amount;
            /* params.currency_id = $scope.currencies[parent_index].id;
             params.amount = $scope.currencies[parent_index].tiers[child_index].amount;*/
            $http.post(admin_api_url + 'api/v1/currencies_discount_tiers', params).success(function (response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
    });
