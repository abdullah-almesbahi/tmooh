
angular.module('base')
    .service('adminTokenService', function ($rootScope, $http, $window, $q, $cookies, $timeout) {
        //jshint unused:false
        var promise;
        var promiseSettings;
        var deferred = $q.defer();
        if ($cookies.get("token") === null || $cookies.get("token") === undefined) {
            promise = $http({
                method: 'GET',
                url: '/api/v1/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    if (angular.isDefined(data.access_token)) {
                        $cookies.put("token", data.access_token, {
                            path: '/'
                        });
                        $timeout(function () {
                            if (angular.isUndefined($rootScope.settings)) {
                                $rootScope.settings = {};
                                var params = {};
                                params.fields = 'name,value';
                                params.limit = 'all';
                                params.sortby = 'asc';
                                promiseSettings = $http({
                                    method: 'GET',
                                    url: '/api/v1/settings',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    params: params
                                })
                                    .success(function (settingsResponse) {
                                        if (settingsResponse.data) {
                                            var enabledPlugins = '';
                                            $.each(settingsResponse.data, function (i, settingData) {
                                                if (settingData.name === 'site.enabled_plugins') {
                                                    enabledPlugins = settingData.value;
                                                    $.cookie('enabled_plugins', enabledPlugins, {
                                                        path: '/'
                                                    });
                                                }
                                            });
                                        }
                                    });
                            }
                        }, 100);
                    }
                });
        } else {
            promise = true;
        }
        return {
            promise: promise,
            promiseSettings: promiseSettings
        };
    });