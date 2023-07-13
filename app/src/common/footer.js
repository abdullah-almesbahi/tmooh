(function(module) {
    module.controller('footerController', function($state, $scope, $cookies, $uibModal, $location) {
        $scope.cdate = new Date();

        $scope.BecomeInstructor = function(){
            if (!$.cookie('refresh_token')) {
            var redirectto = '/courses/add';
              $cookies.put("redirect_url", redirectto, {
                    path: '/'
                });
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
                                    if (angular.isDefined(data['ace.socialLogin'])) {
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
                });
            } else{
                     $location.path("/courses/add");
            }
        };
    });
}(angular.module("ace.common")));
