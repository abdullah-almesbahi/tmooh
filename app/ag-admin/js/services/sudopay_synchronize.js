
angular.module('base')
    .factory('sudopaySynchronize', ['$resource', function($resource) {
        return $resource('/api/v1/payment_gateways/sudopay_synchronize', {}, {
            get: {
                method: 'GET'
            }
        });
}]);