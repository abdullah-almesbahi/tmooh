(function (module) {
    module.factory('User', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/:id', {
            id: '@id'
        }, {
                'update': {
                    method: 'PUT'
                },
                'getUser': {
                    method: 'GET'
                }
            });
    });
    module.factory('UserProfile', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/edit-profile', {}, {
            'update': {
                method: 'PUT'
            }
        });
    });
    module.factory('Login', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/login', {}, {
            login: {
                method: 'POST'
            }
        });
    });
    module.factory('Signup', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/register', {}, {
            register: {
                method: 'POST'
            }
        });
    });
    module.factory('Logout', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/logout', {}, {
            logout: {
                method: 'GET'
            }
        });
    });
    module.factory('UserActivation', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/activations', {}, {
            activation: {
                method: 'PUT'
            }
        });
    });
    module.factory('ForgotPassword', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/forgotpassword', {}, {
            forgot_password: {
                method: 'POST'
            }
        });
    });
    module.factory('ChangePassword', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/changepassword', {}, {
            change_password: {
                method: 'POST'
            }
        });
    });
    module.factory('UserAll', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users', {}, {
            'getUserAll': {
                method: 'GET'
            }
        });
    });
    module.factory('Subscriptions', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/subscriptions', {}, {
            'getSubscriptions': {
                method: 'GET'
            }
        });
    });
    module.factory('UserPurchaseHistory', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/orders', {}, {
            get: {
                method: 'GET'
            }
        });
    });
    module.factory('UserAnnouncements', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/messages', {}, {
            get: {
                method: 'GET'
            }
        });
    });
    module.factory('UserAnnouncementFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/messages/:messageId', {}, {
            update: {
                method: 'PUT',
                messageId: '@messageId'
            }
        });
    });
    module.factory('UserOrderFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/orders/:id', {}, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    });
    module.factory('UserOrderRefundFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/paypal/refund/:id', {}, {
            create: {
                method: 'POST',
                params: {
                    id: '@id'
                }
            }
        });
    });
    module.factory('CartsService', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/carts', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('ReferralTransferFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:userId/referral_earned_amount', {}, {
                get: {
                    method: 'GET',
                    params: {
                        userId: '@userId'
                    }
                }
            }
        );
    });
    module.factory('InstructorStatsFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/me/course/stats/:userId', {}, {
                get: {
                    method: 'GET',
                    params: {
                        userId: '@userId'
                    }
                }
            }
        );
    });
    module.factory('UserPayPalAuthenticate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/paypal_email', {}, {
                get: {
                    method: 'GET',
                }
            }
        );
    });
})(angular.module("ace.users"));
