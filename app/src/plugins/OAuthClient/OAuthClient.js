/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.oauth_client', [
    'ui.router',
    'ngResource',
])));

(function (module) {

    module.controller('oAuthClientController', function (oAuthClientList, Settings, $location, $scope, $uibModal, $rootScope, $state, TokenService, User, $filter, flash, ConstApiClient, $timeout) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("API Clients")+ " | " +$rootScope.settings['site.name'];
        model.loader = true;
        $scope.$on('$locationChangeSuccess', function () {
            model.loader = true;
            get_oAuthClient();
        });

        model.loader = true;
        function get_oAuthClient() {
            model.loader = true;
            var promise = TokenService.promise;
            var promiseSettings = TokenService.promiseSettings;
            promiseSettings.then(function (data) {
                model.currentPage = ($state.params.page !== undefined) ? parseInt($state.params.page) : 1;
                var promise = TokenService.promise;
                var promiseSettings = TokenService.promiseSettings;
                var params = {};
                params.page = model.currentPage;
                params.sort = 'id';
                params.sort_by = 'DESC';
                oAuthClientList.get(params).$promise.then(function (response) {
                    model.currentPage = params.page;
                    if (angular.isDefined(response._metadata)) {
                        model.metadata = response._metadata;
                    }
                    if (angular.isDefined(response.data)) {
                        angular.forEach(response.data, function (api_client) {
                            if (parseInt(api_client.status) === parseInt(ConstApiClient.Pending)) {
                                api_client.status_name = "Pending";
                            } else if (parseInt(api_client.status) === parseInt(ConstApiClient.Rejected)) {
                                api_client.status_name = "Rejected";
                            } else if (parseInt(api_client.status) === parseInt(ConstApiClient.Approved)) {
                                api_client.status_name = "Approved";
                            } else {
                                api_client.status_name = "Pending";
                            }
                        });
                        model.oAuthClientLists = response.data;
                    }
                    model.loader = false;
                });
            });
        }
        $scope.paginate = function (currentPage) {
            model.currentPage = parseInt(currentPage);
            $location.search('page', model.currentPage);
        };
        $scope.addOauthClient = function ($valid) {
            if ($valid) {
                $scope.add_disableButton = true;
                oAuthClientList.add(model.oauth_client, function (response) {
                    if (response.id !== '' && response.id !== null) {
                        flashMessage = $filter("translate")("API client requested successfully.");
                        get_oAuthClient();
                        model.addform = false;
                        flash.set(flashMessage, 'success', false);
                        $location.path('/user/api-clients');
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.add_disableButton = false;
                });
            }

        };
        get_oAuthClient();
    });
    module.controller('oAuthClientEditController', function (Common, Settings, $location, $scope, $uibModal, $rootScope, $state, TokenService, User, oAuthClientUpdate, $filter, flash) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("API Clients")+ " | " +$rootScope.settings['site.name'];
        model.loading = false;
        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        if (angular.isDefined($state.params.id) && $state.params.id === '') {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
        $scope.editOauthClient = function ($valid) {
            if ($valid) {
                $scope.edit_disableButton = true;
                oAuthClientUpdate.update({
                    clientId: $state.params.id
                }, model.oauth_client, function (response) {
                    flashMessage = $filter("translate")("API client updated successfully.");
                    flash.set(flashMessage, 'success', false);
                    $location.path('/user/api-clients');
                    $scope.edit_disableButton = false;
                });
            }

        };
    });
} (angular.module("ace.oauth_client")));

(function (module) {

    module.factory('oAuthClientList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/oauth/clients', {}, {
                get: {
                    method: 'GET'
                },
                add: {
                    method: 'POST'

                }
            }
        );
    });
    module.factory('oAuthClientUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/oauth/clients/:clientId', {
                clientId: '@clientId'
            }, {
                update: {
                    method: 'PUT',
                    clientId: '@clientId'
                }
            }
        );
    });
})(angular.module("ace.oauth_client"));
