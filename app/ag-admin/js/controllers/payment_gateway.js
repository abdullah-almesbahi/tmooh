angular.module('base')
    .controller('PaymentGatewayCtrl', function($scope, getGateways, postGateways, notification) {
        $scope.payment_gateways = [];
        $scope.payment_gateways_values = {};
        $scope.payment_gateways_values.test_mode_value = {};
        $scope.payment_gateways_values.live_mode_value = {};
        $scope.index = function() {
            var params = {};
            getGateways.get(params, function(response) {
                angular.forEach(response.data, function(g_value, g_key) {
                    $scope.payment_gateway = {};
                    $scope.payment_gateway.gateway_name = g_value.name;
                    $scope.payment_gateway.gateway_id = g_value.id;
                    $scope.payment_gateway.fields = [];
                    $scope.payment_gateways_values.test_mode_value[g_value.id] = {};
                    $scope.payment_gateways_values.live_mode_value[g_value.id] = {};
                    angular.forEach(g_value.test_mode_value, function(value, key) {
                        $scope.fields = {};
                        $scope.fields.field_name = key;
                        $scope.fields.fields = value;
                        $scope.payment_gateways_values.test_mode_value[g_value.id][key] = value.value;
                        $scope.payment_gateway.fields.push($scope.fields);
                    });
                    angular.forEach(g_value.live_mode_value, function(value, key) {
                        $scope.payment_gateways_values.live_mode_value[g_value.id][key] = value.value;
                    });
                    $scope.payment_gateways.push($scope.payment_gateway);
                });
            });
        };
        $scope.save = function() {
            postGateways.save($scope.payment_gateways_values, function(response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Data saved successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
        $scope.index();
    }).controller('PaymentGatewayEditCtrl', function($scope, getGateways, postGateways, notification, $http, $state, $location) {
        $scope.liveMode = false;
        $scope.test_mode_value = {};
        $scope.live_mode_value = {};
        $scope.save = function() {
            var params = {};
            params.id = $scope.entry.id;
            params.test_mode_value = $scope.test_mode_value;
            params.live_mode_value = $scope.live_mode_value;
            $http.put(admin_api_url + 'api/v1/payment_gateway_settings/' + params.id, params).success(function(response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Data updated successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                    $location.path('/payment_gateways/list');
                }
            });
        };
        $scope.zazpay_synchronize = function() {
            $http.get(admin_api_url + 'api/v1/zazpay_synchronize', {}).success(function(response) {
                if (angular.isDefined(response.error.code === 0)) {
                    notification.log('Synchronize with zazpay successfully', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            });
        };
        $scope.index = function() {
            $http.get(admin_api_url + 'api/v1/payment_gateways/' + $state.params.id).success(function(response) {
                if (angular.isDefined(response.error.code === 0)) {
                    $scope.entry = response.data[0];
                    if (parseInt($scope.entry.id) === 3) {
                        $scope.paypal_rest = true;

                    } else {
                        $scope.paypal_rest = false;
                    }
                    angular.forEach($scope.entry.payment_gateway_settings,
                        function(value, key) {
                            $scope.test_mode_value[value.name] = value.test_mode_value;
                            $scope.live_mode_value[value.name] = value.live_mode_value;
                        });
                }
            });
        };
        $scope.index();
    });