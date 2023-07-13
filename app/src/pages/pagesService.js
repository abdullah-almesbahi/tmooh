(function(module) {
    module.factory('Pages', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/page/:slug', {
                slug: '@slug'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

})(angular.module("ace.pages"));
