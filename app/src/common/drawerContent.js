(function (module) {

    module.controller('DrawerContentController', function (Common, Settings, $location, $scope, $rootScope, $state, TokenService, User, $uibModal, $timeout, Slug, Language) {
        var model = this;
        model.loading = false;
        $rootScope.$on('updateParentSearchQuery', function (event, args) {
            if (args.Query !== "undefined" && args.Query !== null && args.Query !== undefined) {
                $scope.csearchVal = args.Query;
            } else {
                $scope.csearchVal = '';
            }
        });
        model.common = [];
        model.userDetails = [];
        $scope.slugify = function(input) {
            return  Slug.slugify(input); 
        };
        $scope.isAuth = $rootScope.isAuth;
        $scope.displayname = '';
        $scope.displayname = $rootScope.auth ? $rootScope.auth.displayname : '';
        $scope.user_id = $rootScope.auth ? $rootScope.auth.id : '';
        $scope.isRtl = Language.isRtl();
        $rootScope.$on('refreshHeader', function (event, args) {
            $scope.isAuth = args.isAuth;
            $scope.displayname = $rootScope.auth ? $rootScope.auth.displayname : '';
            $scope.user_id = $rootScope.auth ? $rootScope.auth.id : '';
        });
        $scope.current_category_id = parseInt($state.params.category_id);
        $scope.current_category_id = isNaN($scope.current_category_id) ? '' : $scope.current_category_id;
        $scope.contentInIframe = false;
        if (self !== top) {
            $scope.contentInIframe = true;
        }
        filter = model.filter;
        if (angular.isDefined(filter)) {
            filter_parent = filter;
        } else {
            filter_parent = "parent";
        }


        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        promiseSettings.then(function (data) {
            Common.get({
                category_type: filter_parent,
                available_courses: true,
                limit: "all",
                "filter": "active",
                field: "id,category_id,sub_category_name,sub_category,sub_category_name,available_courses"
            }).$promise.then(function (response) {
                model.common.parentCategories = response;
                $scope.expireIn = moment(new Date($rootScope.settings.site_promotions.end_date)).locale('ar').endOf('day').fromNow();
            });

        });

        $scope.currentDrawer = 0;
        $scope.setCurrentDrawer = function (i) {
            $scope.currentDrawer = i;
        }

        $rootScope.$on('checkIsTeacher', function (event, args) {
            if ($rootScope.isAuth) {
                $scope.auth_user_id = $rootScope.auth ? parseInt($rootScope.auth.id) : '';
                getUserParams = {
                    id: $scope.auth_user_id,
                    field: 'is_teacher'
                };
                User.get(getUserParams).$promise.then(function (response) {
                    model.userDetails = response.data[0];
                    $rootScope.is_teacher = response.data[0].is_teacher;
                });
            }
        });
        $rootScope.$emit('checkIsTeacher', {});
        $scope.admin_url = function () {
            location.replace('ag-admin/#/dashboard');
        };
        $scope.CoursequerySearch = function (query) {
            if (query !== "undefined" && query !== null && query !== undefined) {
                query = query;
            } else {
                query = '';
            }
            $timeout(function () {
                $state.go('CourseSearch', {
                    query: encodeURIComponent(query),
                    page: 1,
                }, {
                        reload: true
                    });
            }, 100);
        };
        $scope.modalLogin = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/login.tpl.html',
                    controller: 'userLoginController',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                        var module = data['ace.socialLogin'];
                                        return $ocLazyLoad.load(module, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
        $scope.modalSignup = function (e) {
            e.preventDefault();
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'users/signup.tpl.html',
                    controller: 'userSignupController as model',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                        requiredPlugins.push(data['ace.socialLogin']);
                                    }
                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
    });
} (angular.module("ace.common")));
