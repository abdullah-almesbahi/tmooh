
angular.module('base')
    .factory('interceptor', ['$q', '$location', '$injector', '$window', '$rootScope', '$timeout', '$cookies', function ($q, $location, $injector, $window, $rootScope, $timeout, $cookies) {
        return {
            // On response success
            response: function (response) {
                if (angular.isDefined(response.data)) {
                    if (angular.isDefined(response.data.message) && parseInt(response.data.error) === 1 && response.data.message === 'Authentication failed') {
                        $cookies.remove('auth', {
                            path: '/'
                        });
                        $cookies.remove('token', {
                            path: '/'
                        });
                        $location.path('/users/login');
                    }
                }
                // Return the response or promise.
                return response || $q.when(response);
            },
            // On response failture
            responseError: function (response) {
                if (response.status === 401) {
                    var admin_api_url = '/';
                    if ($cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
                        var auth = JSON.parse($cookies.get("auth"));
                        var refresh_token = $cookies.get("refresh_token");
                        if (refresh_token === null || refresh_token === '' || refresh_token === undefined) {
                            $cookies.remove('auth', {
                                path: '/'
                            });
                            $cookies.remove('token', {
                                path: '/'
                            });
                            $location.path('/users/login');
                            $timeout(function () {
                                $window.location.reload();
                            }, 100);
                            $rootScope.refresh_token_loading = false;
                        } else {
                            if ($rootScope.refresh_token_loading !== true) {
                                //jshint unused:false
                                $rootScope.refresh_token_loading = true;
                                var params = {};
                                auth = JSON.parse($cookies.get("auth"));
                                var refreshToken = $injector.get('refreshToken');
                                $.get(admin_api_url + 'api/v1/refresh_token?token=' + refresh_token, function (tokenData) {
                                    tokenData = angular.fromJson(tokenData);
                                    if (angular.isDefined(tokenData.access_token)) {
                                        $rootScope.refresh_token_loading = false;
                                        $.cookie('token', tokenData.access_token, {
                                            path: '/'
                                        });
                                        $.cookie('refresh_token', tokenData.refresh_token, {
                                            path: '/'
                                        });
                                    }
                                    else {
                                        $cookies.remove('auth', {
                                            path: '/'
                                        });
                                        $cookies.remove('token', {
                                            path: '/'
                                        });
                                        $cookies.remove('refresh_token', {
                                            path: '/'
                                        });
                                        $location.path('/users/login');
                                        $rootScope.refresh_token_loading = false;
                                    }
                                    $timeout(function () {
                                        $window.location.reload();
                                    }, 100);
                                });
                            }
                        }
                    }
                }
                // Return the promise rejection.
                return $q.reject(response);
            },
            request: function (config) {
                var exceptional_array = ['/api/v1/stats', '/api/v1/settings', '/api/v1/users/logout', '/api/v1/oauth/refresh_token'];
                if ($cookies.get('auth') !== null && $cookies.get('auth') !== undefined) {
                    var auth = angular.fromJson($cookies.get('auth'));
                }
                if (/\/user_cash_withdrawals$/.test(config.url) && !config.params && config.method !== 'POST') {
                    config.url += '/2';
                }
                return config;
            },
        };
    }]);