/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.credit', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('credit', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'A',
            templateUrl: 'src/plugins/Credit/creditButton.tpl.html',
            link: linker,
            controller: 'creditButtonController as model',
            bindToController: true,
            scope: {
                position: '@position'
            }
        };
    });
    module.controller('creditButtonController', function ($rootScope) {
        var model = this;
        $rootScope.$broadcast("CreditPosition", model.position);
    });
    module.controller('creditController', function ($state, vaultList, vaultDelete, $location, $scope, flash, $filter, $rootScope, TokenServiceData, $interval, User, UserProfile, SweetAlert) {
        var model = this;
        $scope.$on('CreditPosition', function (evt, data) {
            model.position = data;
        });
        model.loader = true;
        model.VaultDelete = VaultDelete;
        model.editProfile = editProfile;
        $rootScope.pageTitle = $filter("translate")("Manage Credit Card")+ " | " +$rootScope.settings['site.name'];
        /*   getUser();

           function getUser() {
               if ($rootScope.auth) {
                   User.getUser({
                       id: $rootScope.auth.id,
                   }).$promise
                       .then(function (response) {
                           model.is_credit_card_use_for_purchases = response.data[0].is_credit_card_use_for_purchases;
                           if (model.is_credit_card_use_for_purchases === true) {
                               getVault();
                           } else {
                               model.loader = false;
                           }
                       });
               }
           }*/

        function editProfile() {
            UserProfile.update({
                is_credit_card_use_for_purchases: model.is_credit_card_use_for_purchases
            }, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("User profile has been updated successfully.");
                    flash.set(flashMessage, 'success', false);
                    /* location.reload(true);*/
                } else {
                    flash.set(response.error.message, 'error', false);
                }

            });
        }

        function getVault() {
            model.loader = true;
            /* if (angular.isDefined(model.is_credit_card_use_for_purchases) && model.is_credit_card_use_for_purchases == 1 && model.is_credit_card_use_for_purchases !== '') {*/
            if ($rootScope.auth) {
                vaultList.get({
                    user_handle: $rootScope.auth.id,
                }).$promise
                    .then(function (response) {
                        model.vault_lists = response.data;
                        model.loader = false;
                    });
            }

        }

        function VaultDelete(vault_id, index, event) {
            event.preventDefault();
            SweetAlert.swal({
                title: "Are you sure want to delete?",
                showCancelButton: true,
                confirmButtonColor: "#79d047",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                animation: false,
            }, function (isConfirm) {
                if (isConfirm) {
                    vaultDelete.deletevault({
                        vaultId: model.vault_lists[index].id,
                    }).$promise
                        .then(function (response) {
                            if (response.error.code === 0) {
                                model.vault_lists.splice(index, 1);
                                flash.set("Credit Card has been deleted successfully.", 'success', false);
                            } else {
                                flash.set(response.error.message, 'error', false);

                            }
                        });
                }
            });
        }
        var autoRefresh;
        $scope.autoReload = function () {
            autoRefresh = $interval(function () {
                $state.reload();
            }, 20000);
        };
        $scope.stopReload = function () {
            if (angular.isDefined(autoRefresh)) {
                $interval.cancel(autoRefresh);
                autoRefresh = undefined;
            }
        };
        $scope.$on('$destroy', function () {
            $scope.stopReload();
        });
        getVault();
    });
})(angular.module('ace.credit'));

(function (module) {

    module.factory('vaultList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/paypal/vaults', {
                user_handle: '@user_handle'
            }
        );
    });
    module.factory('vaultDelete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/paypal/vaults/:vaultId', {
                vaultId: '@vaultId'
            }, {
                deletevault: {
                    method: 'DELETE'
                }
            }
        );
    });
})(angular.module("ace.credit"));
