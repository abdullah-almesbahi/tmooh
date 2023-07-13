(function(module) {
    module.factory('CreditOfferLogs', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/credit_offer_logs', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

})(angular.module("ace.creditoffer"));
