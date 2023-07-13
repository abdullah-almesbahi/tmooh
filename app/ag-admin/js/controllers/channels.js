
angular.module('base')
    .controller('ChannelController', function ($scope, $http, notification, $state, $window, channelUpdate) {
        getChannelList();
        function getChannelList() {
            $http({
                url: admin_api_url + 'api/v1/channels',
                method: "GET",
                params: { limit: 'all' }
            }).success(function (response) {
                if (response.data.length > 0) {
                    $scope.channels = response.data;
                }

            });
        }
        $scope.UpdateChannel = function (parent_index) {
            var params = {};
            params = $scope.channels[parent_index];
            channelUpdate.update(params, function (response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
    });
