(function (module) {
    module.controller('UserReferralController', ['$scope', '$rootScope', 'flash', '$filter', 'GENERAL_CONFIG', 'User', 'ReferralTransferFactory', function ($scope, $rootScope, flash, $filter, GENERAL_CONFIG, User, ReferralTransferFactory) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("Refer & Earn")+ " | " +$rootScope.settings['site.name'];
        var site_url = $rootScope.site_url.slice(0, -1);
        function init() {
            if ($rootScope.auth) {
                model.referral_loader = true;
                User.getUser({
                    id: $rootScope.auth.id,
                    field: 'id,referral_earned_amount',
                }).$promise
                    .then(function (response) {
                        if (response !== null && response !== undefined) {
                            if (response.data !== null && response.data !== undefined) {
                                if (response.data.length > 0) {
                                    model.user_referral_amount = response.data[0].referral_earned_amount;
                                    model.original_amount = 0;
                                    if (model.user_referral_amount > $rootScope.settings.min_referral_earned_amount) {
                                        model.original_amount = parseFloat(model.user_referral_amount) - parseFloat($rootScope.settings.min_referral_earned_amount);
                                    }
                                    model.referral_loader = false;
                                }
                            }
                        }

                    });
            }
        }

        model.unique_url = site_url + '?utm_source=referral&utm_medium=site&utm_campaign=' + $rootScope.auth.id;
        $scope.success = function () {
            flashMessage = $filter("translate")("Your unique referral link URL copied.");
            flash.set(flashMessage, 'success', false);
        };

        $scope.fail = function (err) {
            flashMessage = $filter("translate")("Your unique referral link URL not copied.");
            flash.set(flashMessage, 'error', false);
        };
        $scope.transferReferral = function () {
            ReferralTransferFactory.get({ userId: $rootScope.auth.id }, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")(response.error.message);
                    flash.set(flashMessage, 'success', false);
                    init();
                } else {
                    flashMessage = $filter("translate")('Amount not moved to available balance.Because referral earned amount less than ' + $rootScope.settings.min_referral_earned_amount + '.');
                    flash.set(flashMessage, 'error', false);
                }
            }, function (error) {
                flashMessage = $filter("translate")('Error occured. While moving amount not available balance');
                flash.set(flashMessage, 'error', false);
            });
        };
        init();
    }]);
} (angular.module("ace.users")));
