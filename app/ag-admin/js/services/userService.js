
angular.module('base')
    .factory('Login', ['$resource', function ($resource) {
        return $resource('/api/v1/users/login', {}, {
            login: {
                method: 'POST'
            }
        });
    }])
    .factory('channelUpdate', ['$resource', function ($resource) {
        return $resource('/api/v1/channels/:id', {}, {
            update: {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            }
        });
    }]) 
    .factory('Campaign', ['$resource', function ($resource) {
        return $resource('/api/v1/campaigns/:id', {}, {
            update: {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
             get: {
                method: 'GET',
                params: {
                    id: '@id'
                }
            }
        });
    }]) .factory('Campaigns', ['$resource', function ($resource) {
        return $resource('/api/v1/campaigns', {}, {
            create: {
                method: 'POST',
            }
        });
    }]).factory('StatesFactory', ['$resource', function ($resource) {
        return $resource('/api/v1/states', {}, {
            create: {
                method: 'POST',
            }
        });
    }]);

    