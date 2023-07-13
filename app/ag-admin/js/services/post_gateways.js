
angular.module('base')
    .factory('postGateways', ['$resource', function($resource) {
        return $resource('/api/v1/post_gateways', {}, {
            save: {
                method: 'POST'
            }
        });
}]);