
angular.module('base')
    .factory('getGateways', ['$resource', function($resource) {
        return $resource('/api/v1/get_gateways', {}, {
            get: {
                method: 'GET'
            }
        });
}]);