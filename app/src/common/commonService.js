(function(module) {
    module.factory('Common', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/categories', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('Settings', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/settings'
        );
    });
})(angular.module("ace.common"));
