(function (module) {
    module.directive('amountDisplay', function () {
        var linker = function (scope, element, attrs) { };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/amountDisplay.tpl.html',
            link: linker,
            controller: 'amountDisplayController as model',
            bindToController: true,
            scope: {
                amount: '@amount',
                fraction: '@fraction',
                isCoursePrice: '@isCoursePrice',
                tierId: '@tierId',
                instructorDashboard: '@instructorDashboard',
                instructorCurrencyCode: '@instructorCurrencyCode',
                instructorCurrencySymbol: '@instructorCurrencySymbol'
            }
        };
    });
    module.controller('amountDisplayController', function ($state, $scope, $rootScope, GetCurrencyList, expireCookie, $cookies, $filter, ConstCurrencies) {
        var model = this;
        $scope.isCoursePrice = model.isCoursePrice;
        model.current_amount = 0;
        /*Setting Checking condition*/
        if ($rootScope.settings.geoIP.symbol !== null && $rootScope.settings.geoIP.symbol !== undefined && $rootScope.settings.geoIP.symbol !== '') {
            $scope.Currency = $rootScope.settings.geoIP.symbol;
        } else if ($cookies.get("site_currency") !== null && $cookies.get("site_currency") !== undefined && $cookies.get("site_currency") !== '') {
            $scope.Currency = $cookies.get("site_currency");
        }
        else {
            $scope.Currency = ConstCurrencies.Default;
        }
        /*Mutlicurrency checking condition*/
        if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1 && model.tierId !== null && model.tierId !== undefined && model.tierId !== '' && model.instructorDashboard !== 'enable') {
            model.current_amount = $filter('multicurrency')(model.tierId, model.amount);
        } else {
            model.current_amount = model.amount;
        }

        /*Instructor Dashboard Amount Displaying Condition*/
        if (model.instructorDashboard === 'enable' && $rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
            if (model.instructorCurrencySymbol !== null && model.instructorCurrencySymbol !== undefined && model.instructorCurrencySymbol !== '') {
                model.Instuctor_currency = model.instructorCurrencySymbol;
            } else if (model.instructorCurrencyCode !== null && model.instructorCurrencyCode !== undefined && model.instructorCurrencyCode !== '') {
                model.Instuctor_currency = model.instructorCurrencyCode;
            } else {
                model.Instuctor_currency = $scope.Currency;
            }
            if (model.tierId !== null && model.tierId !== undefined && model.tierId !== '') {
                angular.forEach($rootScope.multicurrencies, function (currency) {
                    if (currency.code === model.instructorCurrencyCode || currency.symbol === model.instructorCurrencySymbol) {
                        angular.forEach(currency.currencies_tiers, function (currency_tier) {
                            if (parseInt(currency_tier.tier_id) === parseInt(model.tierId)) {
                                model.current_amount = currency_tier.amount;
                            }
                        });
                    }
                });
            }
        }
    });
})(angular.module('ace.courses'));
