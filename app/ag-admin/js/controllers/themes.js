
angular.module('base')
    .controller('themeController', function ($scope, $http, notification, $state, $window) {
        $scope.languageArr = [];
        getThemeDetails();
        function getThemeDetails() {
            $http.get(admin_api_url + 'api/v1/themes', {}).success(function (response) {
                $scope.all_themes = response.all_theme;
                $scope.enabled_themes = response.enabled_theme;
                enabledtheme = response.enabled_theme;
                $.cookie('enabled_themes', JSON.stringify(enabledtheme), {
                    path: '/'
                });
            }, function (error) { });
        }
        $scope.checkStatus = function (theme, enabled_theme) {
            if ($.inArray(theme, enabled_theme) > -1) {
                return true;
            } else {
                return false;
            }
        };
        $scope.updateThemeStatus = function (e, theme, status, hash) {
            e.preventDefault();
            var target = angular.element(e.target);
            checkDisabled = target.parent().hasClass('disabled');
            if (checkDisabled === true) {
                return false;
            }
            var params = {};
            var confirm_msg = '';
            params.theme_name = theme;
            params.is_enabled = status;
            confirm_msg = (status === 0) ? "Are you sure want to disable?" : "Are you sure want to enable?";
            notification_msg = (status === 0) ? "disabled" : "enabled";
            if (confirm(confirm_msg)) {
                $http.put(admin_api_url + 'api/v1/settings/themes', params).success(function (response) {
                    if (response.error.code === 0) {
                        notification.log(theme + ' theme ' + notification_msg + ' successfully.', { addnCls: 'humane-flatty-success' });
                        getThemeDetails();
                    }
                }, function (error) { });
            }
        };
        $scope.fullRefresh = function () {
            $window.location.reload();
        };

    });