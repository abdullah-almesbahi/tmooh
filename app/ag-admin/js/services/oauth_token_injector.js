angular.module('base')
    .factory('oauthTokenInjector', ['$cookies',
        function($cookies) {
            var oauthTokenInjector = {
                request: function(config) {
                    if (config.url.indexOf('.html') === -1) {
                        var token = $cookies.get("token");
                        if (token) {
                            if (config.params === undefined || config.params === null) {
                                config.params = {};
                            }
                            config.params.from = 'admin';
                            var sep = config.url.indexOf('?') === -1 ? '?' : '&';
                            config.url = config.url + '' + sep + 'token=' + token;
                        }
                        if (config.url.indexOf('oauth_clients') !== -1) {
                            config.url = config.url.replace('oauth_clients', 'oauth/clients');
                        }
                         if (config.url.indexOf('course_favorites') !== -1) {
                            config.url = config.url.replace('course_favorites', 'course_favourites');
                        }
                        if (config.url.indexOf('contacts_duplicate') !== -1) {
                            config.url = config.url.replace('contacts_duplicate_contact', 'contacts');
                            config.url = config.url.replace('contacts_duplicate_quote', 'contacts');
                            config.url = config.url.replace('contacts_duplicate_corporate', 'contacts');
                            config.url = config.url.replace('oauth_clients', 'oauth/clients');

                        }
                    }
                    return config;
                }
            };
            return oauthTokenInjector;
        }
    ]);