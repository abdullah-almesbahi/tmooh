angular.module('base')
    .controller('PermissionCtrl', function($rootScope, $scope, $location, $http, $window, $stateParams, notification) {
        $scope.index = function() {
            $scope.state_user_id = $stateParams.userid;
            $scope.username = $stateParams.username;
            //$scope.get_sub_admin();
            $scope.user_scopes = [];
             $scope.user_scopes_list = [];
            $scope.user_auth_scopes = {};
            if ($stateParams.userid !== undefined) {
                $scope.get_outh_scopes();
            }
        };
        $scope.get_outh_scopes = function() {
            $scope.permissions = [];
            $http.get('/api/v1/sub_admin_oauth_scopes?sub_admin_id=' + $scope.state_user_id)
                .success(function(response) {
                    $scope.response = response.data[0];
                    if (angular.isDefined($scope.response) && $scope.response !== null) {
                        $scope.permissions = $scope.response.oauth_scopes.split(',');
                        $scope.user_scopes = $scope.permissions;
                    }
                });
        };
        /**
         * Save selected scopes 
         */
        $scope.saveScope = function(scope) {
            var id = $scope.user_scopes.indexOf(scope);
            if (id > -1) {
                $scope.user_scopes.splice(id, 1);
            } else {
                $scope.user_scopes.push(scope);
            }
        };
        $scope.save_user_scopes = function() {
            if ($scope.user_scopes.length === 0) {
                $scope.user_scopes_list = [{
                    scope: ''
                }];
            }
            angular.forEach($scope.user_scopes, function(value) {
                $scope.user_scopes_list.push({
                    'scope': value
                });
            });
            $scope.user_auth_scopes = {
                sub_admin_id: $scope.state_user_id,
                oauth_scopes: $scope.user_scopes_list
            };
            $http.post('/api/v1/sub_admin_oauth_scopes', $scope.user_auth_scopes)
                .success(function(response) {
                    $location.path('/sub_admins/list');
                    notification.log('Authorization changed successfully.', {
                        addnCls: 'humane-flatty-success'
                    });
                });
        };
        $scope.index();
    });