
angular.module('base')
    .factory('paymentGateway', ['$resource', function($resource) {
        return $resource('/api/v1/payment_gateway_settings/:id', {}, {
            update: {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            }
        });
}]);