
angular.module('base')
    .controller('UsersLogoutCtrl', function ($scope, $location, $http, $window, $timeout, $cookies, adminTokenService, $q) {
        $http({
            method: 'GET',
            url: '/api/v1/users/logout'
        })
            .success(function (response) {
                $scope.response = response;
                if ($scope.response.error.code === 0) {
            $.get(admin_api_url + 'api/v1/token', function (data) {
                data = angular.fromJson(data);
                if (angular.isDefined(data.access_token)) {
                    $.removeCookie('auth');
                    $.removeCookie('token');
                    $.removeCookie('refresh_token');
                    $.removeCookie('enabled_plugins');
                    $.removeCookie('zazpay');
                    $window.localStorage.removeItem("oauth_scopes");
                    $cookies.put("token", data.access_token, {
                            path: '/'
                        });
                    if ($cookies.get("enabled_plugins") === undefined || $cookies.get("enabled_plugins") === null) {
                                var params = {};
                                params.fields = 'name,value';
                                params.limit = 'all';
                                params.sortby = 'asc';
                            $http({
                                    method: 'GET',
                                    url: '/api/v1/settings',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    params: params
                                })
                                    .success(function (settingsResponse) {
                                         var enabledPlugins = '';
                                            $.each(settingsResponse.data, function (i, settingData) {
                                                if (settingData.name === 'site.enabled_plugins') {
                                                    enabledPlugins = settingData.value;
                                                    $.cookie('enabled_plugins', enabledPlugins, {
                                                        path: '/'
                                                    });
                                                     $location.path('/users/login');
                    $timeout(function() {
                        $window.location.reload();
                    }, 50);
                                                }
                                            });
                                    });
                                  }
                }
            });

                }
            });
    });