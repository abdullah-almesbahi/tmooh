angular.module('base')
    .controller('UsersLoginCtrl', function($rootScope, $scope, $location, $http, $window, $timeout, progression, notification, $cookies, Login, $injector) {
        if ($cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
            $location.path('/dashboard');
        }
        if ($window.localStorage.getItem("oauth_scopes") !== null && $window.localStorage.getItem("oauth_scopes") !== undefined) {
            $rootScope.oauthscopes = JSON.parse($window.localStorage.getItem("oauth_scopes"));
        }
        $scope.save_btn = false;
        $scope.loginUser = function($valid) {
            if ($valid) {
                $scope.disableButton = true;
                Login.login($scope.user, function(response) {
                    $scope.response = response;
                    if (!angular.isUndefined($scope.response.error) && $scope.response.error.code === 0) {
                        if ($scope.response.user.providertype === "admin") {
                            $scope.disableButton = false;
                            Auth = {};
                            Auth.id = $scope.response.user.id;
                            Auth.providertype = $scope.response.user.providertype;
                            Auth.accesstoken = $scope.response.user.accesstoken;
                            Auth.displayname = $scope.response.user.displayname;
                            Auth.designation = $scope.response.user.designation;
                            Auth.headline = $scope.response.user.headline;
                            Auth.sub_admin_id = $scope.response.user.sub_admin_id;
                            Auth.user_image_hash = $scope.response.user.image_hash;
                            Auth.token = $scope.response.user.token;
                            Auth.available_credits = $scope.response.user.available_credits;
                            Auth.email = $scope.response.user.email;
                            _cookieAuth = {};
                            _cookieAuth.id = Auth.id;
                            _cookieAuth.providertype = Auth.providertype;
                            _cookieAuth.accesstoken = Auth.accesstoken;
                            _cookieAuth.displayname = Auth.displayname;
                            _cookieAuth.token = Auth.token;
                            _cookieAuth.designation = Auth.designation;
                            _cookieAuth.sub_admin_id = $scope.response.user.sub_admin_id;
                            _cookieAuth.headline = Auth.headline;
                            _cookieAuth.userImageHash = Auth.user_image_hash;
                             _cookieAuth.email = Auth.email;
                            token = $scope.response.access_token;
                             $rootScope.oauthscopes = [];
                            $rootScope.sub_admin_id = $scope.response.user.sub_admin_id;
                            if ($scope.response.user.sub_admin_id !== null && $scope.response.user.sub_admin_id !== undefined) {
                                if ($scope.response.sub_admin_scopes !== null && $scope.response.sub_admin_scopes !== undefined) {
                                    var oauthscopes = $scope.response.sub_admin_scopes.oauth_scopes.split(',');
                                    $rootScope.oauthscopes = oauthscopes;
                                    $rootScope.oauthscopes.sub_admin_id = $scope.response.user.sub_admin_id;
                                    $window.localStorage.setItem('oauth_scopes', JSON.stringify(oauthscopes));
                                }
                            }

                            $cookies.put('auth', JSON.stringify(_cookieAuth), {
                                path: '/'
                            });
                            $cookies.put('token', token, {
                                path: '/'
                            });
                            $cookies.put('refresh_token', $scope.response.refresh_token, {
                                path: '/'
                            });
                            $rootScope.auth = Auth;
                            $scope.isAuth = true;
                            $rootScope.isAuth = true;
                            $rootScope.isUser = false;
                            $scope.$emit('updateParent', {
                                isAuth: true,
                                auth: Auth,
                                isUser: $rootScope.isUser
                            });
                            // refreshing header and become an instructor
                            $scope.$emit('refreshHeader', {
                                isAuth: true,
                            });
                            $rootScope.$emit('checkIsTeacher', {

                            });
                            var redirectto = $location.absUrl().split('/');
                            if (Auth.providertype == "admin" || Auth.providertype == 3) {
                                redirectpath = redirectto[0] + '/ag-admin';
                                window.location.href = redirectpath;
                            } else {
                                $state.reload();
                            }
                        } else {
                            notification.log('Sorry, login failed. No rights to access this url.', {
                                addnCls: 'humane-flatty-error'
                            });
                        }

                    } else {
                        progression.done();
                        notification.log('Sorry, login failed. Your username or password are incorrect.', {
                            addnCls: 'humane-flatty-error'
                        });
                        $scope.user = {};
                        $scope.save_btn = false;
                    }
                });
            }


        };
    });