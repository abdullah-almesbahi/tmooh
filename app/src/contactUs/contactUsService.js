(function(module) {
    module.factory('Contact', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/contacts', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('ContactH2k', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/contacts', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
})(angular.module("ace.contactUs"));
