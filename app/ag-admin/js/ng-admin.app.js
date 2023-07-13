var ngapp = angular.module('base', ['ng-admin', 'http-auth-interceptor', 'ui.bootstrap', 'ngCookies', 'ngResource', 'angular-md5']);
var admin_api_url = '/';
// var admin_api_url = 'http://18.184.10.189/';
// var admin_api_url = 'https://demo.tmooh.com/';
var limit_per_page = 20;
var site_settings;
var auth;
var site_timezone;
var enabledPlugins = '';
var $cookies;
angular.injector(['ngCookies'])
    .invoke(['$cookies', function (_$cookies_) {
        $cookies = _$cookies_;
    }]);

if ($cookies.get('SETTINGS') !== undefined && $cookies.get('SETTINGS') !== null) {
    site_settings = JSON.parse($cookies.get('SETTINGS'));
}
deferredBootstrapper.bootstrap({
    element: document.body,
    module: 'base',
    resolve: {
        CmsConfig: function ($http) {
            if ($cookies.get("token") !== null && $cookies.get("token") !== undefined) {
                return $http.get(admin_api_url + 'api/v1/admin-config?token=' + $cookies.get("token") + '&from=admin');
            } else {
                return $http.get(admin_api_url + 'api/v1/admin-config?');
            }
        },
        siteSettings: function ($http) {
            return $http.get(admin_api_url + 'api/v1/settings?fields=name,value&from=admin&limit=all&sortby=asc');
        },
    }
});
ngapp.constant('ConstCourseType', {
    'online': 'Instructor-led Live Online Training',
    'onsite': 'Instructor-led Live Onsite Training',
    'video': 'Video Based Training',
});
//plugins controller function

ngapp.config(function ($stateProvider) {
    var getToken = {
        'TokenServiceData': function (adminTokenService, $q) {
            return $q.all({
                AuthServiceData: adminTokenService.promise,
                SettingServiceData: adminTokenService.promiseSettings
            });
        }
    };
    $stateProvider.state('login', {
        url: '/users/login',
        templateUrl: '/ag-admin/tpl/users_login.html',
        resolve: getToken
    })
        .state('payment_gateways_edit', {
            parent: 'main',
            url: '/payment_gateways/:id/edit',
            controller: 'PaymentGatewayEditCtrl',
            controllerAs: 'controller',
            templateUrl: '/ag-admin/tpl/payment_gateway.html',
            resolve: getToken
        })
        .state('plugins', {
            parent: 'main',
            url: '/plugins',
            controller: 'pluginsController',
            controllerAs: 'controller',
            templateUrl: '/ag-admin/tpl/plugins.tpl.html',
            resolve: getToken
        })
        .state('themes', {
            parent: 'main',
            url: '/themes',
            controller: 'themeController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/themes.tpl.html',
            resolve: getToken
        })
        .state('revenue_reports', {
            parent: 'main',
            url: '/revenue_report',
            controller: 'RevenueReportController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/revenue_reports.tpl.html',
            resolve: getToken
        })
        .state('payment_reports', {
            parent: 'main',
            url: '/payment_report',
            controller: 'PaymentReportController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/payment_reports.tpl.html',
            resolve: getToken
        })
        .state('profit_reports', {
            parent: 'main',
            url: '/profit_report',
            controller: 'ProfitReportController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/profit_reports.tpl.html',
            resolve: getToken
        })
        .state('demographic_reports', {
            parent: 'main',
            url: '/demographic_report',
            controller: 'DemographicReportController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/demographic_reports.tpl.html',
            resolve: getToken
        })
        .state('Currency_tiers', {
            parent: 'main',
            url: '/currency_tier',
            controller: 'CurrencyTiersController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/Currency_tiers.tpl.html',

        })        
        .state('Discount_currency_tiers', {
            parent: 'main',
            url: '/discount_currency_tier',
            controller: 'DiscountCurrencyTiersController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/Discount_currency_tiers.tpl.html',

        })
        .state('Channels', {
            parent: 'main',
            url: '/list/channels',
            controller: 'ChannelController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/channels.tpl.html',

        })
        .state('Campaigns', {
            parent: 'main',
            url: '/create/campaigns',
            controller: 'CampaignController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/campaigns.tpl.html',

        })
        .state('Campaign_edit', {
            parent: 'main',
            url: '/campaigns/:id/edit',
            controller: 'CampaignController',
            controllerAs: 'controller',
            templateUrl: '../ag-admin/tpl/campaigns.tpl.html',

        })
        .state('permission', {
            parent: 'main',
            url: '/subadmin/authorize/:username/:userid',
            templateUrl: '../ag-admin/tpl/admin_permission.tpl.html',
            resolve: getToken
        })
        .state('logout', {
            url: '/users/logout',
            controller: 'UsersLogoutCtrl',
            resolve: getToken
        }).state('quicklogin', {
           parent: 'main',
           url: '/quicklogin/:e',
           params: {
               e: null
           },
           controller: 'quickloginController',
           controllerAs: 'controller',
           resolve: getToken
       })
});
ngapp.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('interceptor');
        $httpProvider.interceptors.push('oauthTokenInjector');
        menucollaps();
    }
]);
ngapp.directive('customHeader', ['$location', '$state', '$http', function ($location, $state, $http, $scope) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '../ag-admin/tpl/custom_header.html',
        link: function (scope) { }

    };
}]);
ngapp.filter('CountryTimezone', function (CmsConfig, $filter) {
    return function (inputlist, format) {
        if (typeof (inputlist) === 'object' && inputlist.length > 0) {
            angular.forEach(inputlist, function (data) {
                angular.forEach(fields, function (field) {
                    data[field] = $filter('date')(Date.parse(data[field] + 'Z'), format);
                });
            });
        } else {
            inputlist = $filter('date')(Date.parse(inputlist + 'Z'), format);
        }
        return inputlist;
    };
});
ngapp.directive('dashboardSummary', ['$location', '$state', '$http', '$rootScope', '$filter', '$cookies', function ($location, $state, $http, $rootScope, $filter, $cookies) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@",
            revenueDetails: "&"
        },
        templateUrl: '../ag-admin/tpl/dashboardSummary.html',
        link: function (scope) {
            scope.rangeVal = [{
                "key": "lastDays",
                "value": "Last 7 Days"
            }, {
                    "key": "lastWeeks",
                    "value": "Last 4 Weeks"
                }, {
                    "key": "lastMonths",
                    "value": "Last 3 Months"
                }, {
                    "key": "lastYears",
                    "value": "Last 3 Years"
                }];
            if (scope.rangeText === undefined) {
                scope.rangeText = "Last 7 Days";
            }
            scope.selectedRangeItem = function (rangeVal, rangeText) {
                $http.get(admin_api_url + 'api/v1/admin/stats', {}).success(function (response) {
                    scope.adminstats = response.data;
                    scope.rangeText = rangeText;
                });
            };
            if (($rootScope.oauthscopes.length > 0 && $rootScope.oauthscopes.indexOf('canListStat') > -1) || $rootScope.sub_admin_id === null) {
                $http.get(admin_api_url + 'api/v1/admin/stats').success(function (response) {
                    scope.adminstats = response.data;
                });
            }

            if (($rootScope.oauthscopes.length > 0 && $rootScope.oauthscopes.indexOf('canListActivitie') > -1) || $rootScope.sub_admin_id === null) {
                $http.get(admin_api_url + 'api/v1/admin/activities').success(function (response) {
                    scope.adminactivities = response.data;
                    angular.forEach(scope.adminactivities, function (value, key) {
                        if (value !== null) {
                            scope.adminactivities[key] = $filter('CountryTimezone')(scope.adminactivities[key], 'dd MMM yyyy hh:mm a');
                        }
                    });
                });
            }

            if (($rootScope.oauthscopes.length > 0 && $rootScope.oauthscopes.indexOf('canListOverview') > -1) || $rootScope.sub_admin_id === null) {
                $http.get(admin_api_url + 'api/v1/admin/overview').success(function (response) {
                    scope.adminoverview = response.data;
                    scope.adminoverview.revenue = parseFloat(scope.adminoverview.revenue).toFixed(2);
                });
            }
            if (site_timezone !== null && site_timezone !== undefined && site_timezone !== '') {
                scope.timeZone = site_timezone;
            } else if ($cookies.get("site_timezone") !== null && $cookies.get("site_timezone") !== undefined && $cookies.get("site_timezone") !== '') {
                scope.timeZone = $cookies.get("site_timezone");
            } else {
                scope.timeZone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
            }
            scope.enabledPlugins = $.cookie("enabled_plugins");
        }


    };
}]);


ngapp.directive('ngModelOnblur', function (notification) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModelCtrl) {
            if (attrs.type === 'radio' || attrs.type === 'checkbox') return;
            var expressionToCall = attrs.ngModelOnblur;
            var oldValue = null;
            elm.bind('focus', function () {
                scope.$apply(function () {
                    oldValue = elm.val();
                });
            })
            elm.bind('blur', function () {
                scope.$apply(function () {
                    var newValue = elm.val();
                    if (newValue != oldValue) {
                        scope.$eval(expressionToCall);
                    }
                });
            });
        }
    };
});
ngapp.directive('customHighChart', function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            categories: '@categories',
            type: '@type',
            title: '@title',
            seriesData: '@seriesData',
            yaxisTitle: '@yaxisTitle'
        },
        link: function (scope, element, attrs) {
            if (scope.categories !== undefined && scope.categories !== null && scope.categories !== '') {
                scope.highChartCategories = JSON.parse(scope.categories);
            }
            if (scope.seriesData !== undefined && scope.seriesData !== null && scope.seriesData !== '') {
                scope.highChartseriesData = JSON.parse(scope.seriesData);
            }
            /**Column Chart plot option */
            if (scope.type === 'column') {
                Highcharts.chart(element[0], {
                    chart: {
                        type: scope.type
                    },
                    title: {
                        text: scope.title
                    },
                    xAxis: {
                        categories: scope.highChartCategories,
                        crosshair: true
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: scope.yaxisTitle
                        }
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    },

                    credits: {
                        enabled: false
                    },
                    series: scope.highChartseriesData
                });
            }
            if (scope.type === 'pie') {
                Highcharts.chart(element[0], {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: scope.type
                    },
                    title: {
                        text: scope.title
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    series: [{
                        data: scope.highChartseriesData
                    }]
                });
            }
        }
    };
});
ngapp.directive('manageLesson', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-primary navbar-btn" ng-class="size ? \'btn-\' + size : \'\'" href="../manage-course/edit-getting-started/{{id}}" >\n<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
        }
    };
}]);
ngapp.directive('loadDependField', function ($http, StatesFactory) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&",
            action: "@"
        },
        link: function ($scope, elem, attrs) {
            $scope.countries = [];
            $scope.refreshCountries = function (address) {
                var param = {};
                param.limit = 'all';
                param.sortby = 'asc'
                param.q = address;
                param.sensor = false;
                return $http.get(admin_api_url + 'api/v1/countries', {
                    params: param
                })
                    .then(function (response) {
                        country_list = [];
                        $scope.countries = [];
                        angular.forEach(response.data.data, function (value, key) {
                            country_list.push({
                                'id': value.id,
                                'name': value.name
                            });
                            if (parseInt(country_list.length) === parseInt(response.data.data.length)) {
                                $scope.countries = country_list;
                            }
                        });
                        if ($scope.action === 'edit') {
                            angular.forEach($scope.countries, function (country) {
                                if (parseInt(country.id) === parseInt($scope.entry().values.country_id)) {
                                    $scope.country_id = country;
                                }
                            });
                            if ($scope.entry().values.state_id != null && $scope.entry().values.state_id != undefined) {
                                $scope.State_id = $scope.entry().values.state_id;
                                $scope.load_cities();
                            }
                        }
                    });
            };
            $scope.getcountry = function (item) {

                $scope.country_id = item;
                $scope.load_cities();
                $scope.entry()
                    .values.country_id = item.id;
            };
            $scope.setValues = function (id) {
                $scope.entry()
                    .values.state_id = id;
            };
            $scope.load_cities = function () {
                $scope.States = [];
                var params = {};
                params.limit = 'all';
                params.country_id = $scope.country_id.id;
                StatesFactory.get(params, function (response) {
                    if (angular.isDefined(response.data)) {
                        $scope.States = response.data;
                    }
                });
            };
        },
        template: '<ui-select ng-model="country_id" on-select="getcountry($item)" style="margin-bottom:10px;" required><ui-select-match>{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="restaurant in countries track by $index" refresh="refreshCountries($select.search)" refresh-delay="0"><div ng-bind-html="restaurant.name | highlight: $select.search"></div></ui-select-choices></ui-select><select ng-show="country_id" ng-change="setValues(State_id)" ng-model="State_id" ng-options="State.id as State.name for State in States" class="form-control" required><option value="" disabled selected>Please select state</option></select>'
    };
});

ngapp.directive('campaignCreate', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {},
        template: '<a class="btn btn-default" href="#/create/campaigns"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>&nbsp;<span class="hidden-xs ng-scope">Create</span></a>',
        link: function (scope) { }
    };
}]);
ngapp.directive('campaignsEdit', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-default btn-xs" href="#/campaigns/{{id}}/edit"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;<span class="hidden-xs ng-scope" >Edit</span></a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
        }
    };
}]);
ngapp.directive('apiClientStatus', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '{{status_name}}',
        link: function (scope) {
            if (parseInt(scope.entry().values.status) === 0) {
                scope.status_name = "Pending";
            } else if (parseInt(scope.entry().values.status) === 2) {
                scope.status_name = "Rejected";
            } else if (parseInt(scope.entry().values.status) === 3) {
                scope.status_name = "Approved";
            } else {
                scope.status_name = "Pending";
            }
        }
    };
}]);
ngapp.directive('customValidation', ['$location', function ($location) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        link: function (scope) {
            if (scope.entityName === 'users') {
                scope.entry().values['password'] = '';
            }

            scope.SetValue = function () {
                scope.entry().values['password'] = scope.value;
            }
        },
        template: '<div ng-form="namesForm"><input type="password" ng-pattern="/^(?=.*\\d)[A-Za-z\\d]{8,}$/" name="password" ng-model="value" ng-change="SetValue()" class="form-control" id="fix-place"  required="true"/><span class="error text-danger" ng-show="(namesForm.password.$error.pattern)">Password must minimum 8 characters including one digit</span></div>'
    };
}]);
ngapp.directive('customValidation2', ['$location', function ($location) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        link: function (scope) {
            if (scope.entityName === 'users') {
                scope.entry().values['password'] = '';
            }

            scope.SetValue = function () {
                scope.entry().values['password'] = scope.value;
            }
        },
        template: '<div ng-form="namesForm"><input type="password" ng-pattern="/^(?=.*\\d)[A-Za-z\\d]{8,}$/" name="password" ng-model="value" ng-change="SetValue()" class="form-control" id="fix-place" /><span class="error text-danger" ng-show="(namesForm.password.$error.pattern)">Password must minimum 8 characters including one digit</span></div>'
    };
}]);
ngapp.directive('userType', function () {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&"
        },
        link: function (scope, elem, attrs) {
            if (scope.entry()
                .values.sub_admin_id !== null && scope.entry()
                    .values.sub_admin_id !== undefined) {
                if (scope.entry().values.sub_admin !== null && scope.entry().values.sub_admin !== undefined) {
                    if (scope.entry().values.sub_admin.length > 0) {
                        scope.type = scope.entry().values.sub_admin[0].name;
                    }
                } else {
                    scope.type = 'Admin'
                }
            } else {

                if (scope.entry()
                    .values.providertype == "admin") {
                    scope.type = 'Admin'
                } else if (scope.entry()
                    .values.providertype == "userpass" && scope.entry()
                        .values.active_course_count == '0' && scope.entry()
                            .values.inactive_course_count == '0') {
                    scope.type = 'Student'
                } else if (scope.entry()
                    .values.providertype == "userpass" && scope.entry()
                        .values.course_user_count == '0' && (scope.entry()
                            .values.active_course_count != '0' || scope.entry()
                                .values.inactive_course_count != '0')) {
                    scope.type = 'Instructor'
                } else if (scope.entry()
                    .values.providertype == "userpass" && scope.entry()
                        .values.course_user_count !== '0' && (scope.entry()
                            .values.active_course_count != '0' || scope.entry()
                                .values.inactive_course_count != '0')) {
                    scope.type = 'Student/Instructor'
                }
            }

        },
        template: '{{type}}'
    };
});
ngapp.directive('dateFormat', function (CmsConfig, $filter, $cookies) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&",
            field: "@",
            type: "@"
        },
        link: function (scope, elem, attrs) {
            scope.formatted_date = null;
            if (site_timezone !== null && site_timezone !== undefined && site_timezone !== '') {
                convert_timezone = site_timezone;
            } else if ($cookies.get("site_timezone") !== null && $cookies.get("site_timezone") !== undefined && $cookies.get("site_timezone") !== '') {
                convert_timezone = $cookies.get("site_timezone");
            } else {
                convert_timezone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
            }
            var tmp_date = scope.entry().values[scope.field].split('T');
            var tmp_date2 = scope.entry().values[scope.field].split(' ');
            if (tmp_date.length == 1 && tmp_date2.length == 1) {
                scope.entry().values[scope.field] = scope.entry().values[scope.field] + 'T00:00:00';
            }
            if (scope.type === 'datetime') {
                scope.formatted_date = $filter('date')(Date.parse(scope.entry()
                    .values[scope.field] + 'Z'), 'yyyy-MM-dd HH:mm:ss', convert_timezone);
            } else if (scope.type === 'date') {
                scope.formatted_date = $filter('date')(Date.parse(scope.entry()
                    .values[scope.field] + 'Z'), 'yyyy-MM-dd', convert_timezone);
            }
            if (scope.formatted_date == 'Invalid Date') {
                scope.formatted_date = '-';
            }
        },
        template: '{{formatted_date}}'
    };
});
ngapp.directive('courseType', function ($filter, ConstCourseType) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&",
            field: "@",
            type: "@"
        },
        link: function (scope, elem, attrs) {
            if (scope.entry().values.course_batch_id !== null && scope.entry().values.course_batch_id !== undefined) {
                scope.course_type = (!scope.entry().values.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
            } else {
                scope.course_type = ConstCourseType.video;
            }
        },
        template: '{{course_type}}'
    };
});
ngapp.directive('transactionCourseType', function ($filter, ConstCourseType) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&",
            field: "@",
            type: "@"
        },
        link: function (scope, elem, attrs) {
            if (scope.entry().values.course_batch_id !== null && scope.entry().values.course_batch_id !== undefined) {
                scope.transaction_course_type = (!scope.entry().values.course_batch_is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
            } else {
                scope.transaction_course_type = ConstCourseType.video;
            }
        },
        template: '{{transaction_course_type}}'
    };
});
ngapp.directive('channelCampaigns', ['$location', '$state', '$http', function ($location, $state, $http) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '	<select class="form-control" name="category" ng-model="userSettings.language_id"><option value="">Filter values</option><option ng-selected="userSettings.language_id == channel.id" ng-repeat="channel in channels" ng-value="channel.id">{{channel.name}}</option></select>',
        controller: function ($scope, $http) {
            $scope.id = $scope.entry().values.id;

            function getChannelList() {
                $http({
                    url: admin_api_url + 'api/v1/channels',
                    method: "GET",
                    params: { limit: 'all' }
                }).success(function (response) {
                    if (response.data.length > 0) {
                        $scope.channels = response.data;
                    }

                });
            }
            getChannelList();
        }
    };
}]);

ngapp.directive('campaignDownload', ['$location', '$state', 'notification', '$window', '$http', 'siteSettings', function ($location, $state, notification, $window, $http, siteSettings) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<span class="download-csv" ng-if="showDownload_option === true"><a href="" ng-click="download(\'facebook\')" title="Download CSV in Facebook Ads Format">\n<i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i></a><a  href="" ng-click="download(\'google\')" title="Download CSV in Google Ads Format"> <i class="fa fa-google-plus-square fa-2x" aria-hidden="true"></i></a><a href="" ng-click="download(\'linkshare\')" title="Download CSV in Linkshare Ads Format"> <i class="fa fa-link fa-2x" aria-hidden="true"></i></a></span>',
        controller: function ($scope, $window, $http, notification, $rootScope) {
            $scope.settings = {};
            $http.get(admin_api_url + 'api/v1/settings?fields=name,value&from=admin&limit=all&sortby=asc').success(function (response) {
                angular.forEach(response.data,
                    function (value, key) {
                        $scope.settings[value.name] = value.value;
                    });
            });

            $scope.showDownload_option = false;
            var params = {};
            if ($scope.entry().values.channel_id !== null && parseInt($scope.entry().values.channel_id) !== 7 && $scope.entry().values.is_site_promotions === false) {
                $scope.showDownload_option = true;
                params.campaign_id = $scope.entry().values.id;
                params.type = 'Campaign';
            }
            $scope.download = function (source) {
                params.email = ($scope.settings['site.contact_email'] !== null) ? $scope.settings['site.contact_email'] : auth.email;
                params.campaign_type = source;
                $http.post(admin_api_url + 'api/v1/reports/export', params).success(function (response) {
                    if (angular.isDefined(response.error.code === 0)) {
                        notification.log("You should soon receive an email of CSV file. Please make sure to check your spam and trash if you can't find the email.", {
                            addnCls: 'humane-flatty-success'
                        });
                    } else {
                        notification.log('Error occured. While sending the CSV file.', {
                            addnCls: 'humane-flatty-error'
                        });
                    }
                });
            };
        }
    };
}]);
ngapp.directive('orderRefund', ['$location', '$state', function ($location, $state, $http, notification, $uibModal, $uibModalStack) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a  ng-if ="refundProcess.refund_request" class="btn btn-primary navbar-btn" ng-class="size ? \'btn-\' + size : \'\'" href="" ng-click = "RefundModelOpen()">Refund Requested</a>\n<a class="btn btn-danger navbar-btn"  ng-if="refundProcess.rejected" ng-class="size ? \'btn-\' + size : \'\'" href="" disabled > Refund Rejected\n</a>\n<a class="btn btn-info navbar-btn"  ng-if="refundProcess.approved" ng-class="size ? \'btn-\' + size : \'\'" href="" disabled > Refund Approved\n</a>',
        controller: function ($scope, $http, notification, $uibModal, $uibModalStack) {
            $scope.refundProcess = {};
            $scope.course_users = $scope.entry().values;
            if ($scope.entry().values.id !== null) {
                if ($scope.entry().values.is_refund_requested && $scope.entry().values.refunded_date === null) {
                    $scope.refundProcess.refund_request = true;
                } else if (!$scope.entry().values.is_refund_requested && $scope.entry().values.refunded_date === null) {
                    $scope.refundProcess.refund_request = false;
                }
                if ($scope.entry().values.is_refund_requested && $scope.entry().values.refunded_date !== null) {
                    $scope.refundProcess.approved = true;
                }
                if ($scope.entry().values.is_refund_requested === false && $scope.entry().values.refunded_date !== null) {
                    $scope.refundProcess.rejected = true;
                }

            }
            $scope.RefundModelOpen = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: '../ag-admin/tpl/orderRefundReason.tpl.html',
                    controller: function (course_users, $scope, $uibModalStack, $uibModal, notification, $timeout) {
                        $scope.refund = {};
                        $scope.course_users = course_users;
                        $scope.refund.id = course_users.id;
                        $scope.ClaimRefund = function () {
                            $scope.accept_disableButton = true;
                            var params = {};
                            params.id = $scope.refund.id;
                            params.is_refund_requested = true;
                            $http.post(admin_api_url + 'api/v1/paypal/refund/' + params.id, params).success(function (response) {
                                if (angular.isDefined(response.error.code === 0)) {
                                    notification.log('Refunded successfully', {
                                        addnCls: 'humane-flatty-success'
                                    });
                                    $scope.accept_disableButton = false;
                                    $timeout(function () {
                                        location.reload(true);
                                    }, 500)
                                } else {
                                    notification.log('Error occured. While Refunding.', {
                                        addnCls: 'humane-flatty-error'
                                    });
                                }
                            });
                        }
                        $scope.RejectClaimRefund = function () {
                            var params = {};
                            params.id = $scope.refund.id;
                            params.is_refund_requested = false;
                            params.admin_reject_reason = $scope.refund.refund_reason;
                            $http.post(admin_api_url + 'api/v1/paypal/refund/' + params.id, params).success(function (response) {
                                if (angular.isDefined(response.error.code === 0)) {
                                    notification.log('Refund rejected successfully', {
                                        addnCls: 'humane-flatty-success'
                                    });
                                    location.reload(true);
                                }
                            });
                        }
                        $scope.modalClose = function (e) {
                            e.preventDefault();
                            $scope.$close();
                        };
                    },
                    resolve: {
                        course_users: function () {
                            return $scope.entry().values;
                        }
                    }
                })
            }

        }
    };
}]);
ngapp.directive('createManageLesson', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-default" ng-class="size ? \'btn-\' + size : \'\'" href="../courses/add" >\n<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>&nbsp;<span class="hidden-xs"></span>\n</a>',
        link: function (scope) { }
    };
}]);
ngapp.directive('previewThisCourse', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-primary navbar-btn" ng-class="size ? \'btn-\' + size : \'\'" href="../course/{{id}}/{{slug}}" >\n<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
            scope.slug = scope.entry().values.slug;
        }
    };
}]);
ngapp.directive('previewLearnPage', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-primary navbar-btn" ng-class="size ? \'btn-\' + size : \'\'" href="../{{slug}}/learn/{{id}}" >\n<span class="glyphicon glyphicon-book" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
            scope.slug = scope.entry().values.slug;
        }
    };
}]);
ngapp.directive('courseFeedback', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn  btn-info" ng-class="size ? \'btn-\' + size : \'\'" href="../manage-course/edit-h2k-feedback/{{id}}" >\n<span class="glyphicon glyphicon-book" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
            scope.slug = scope.entry().values.slug;
        }
    };
}]);
ngapp.directive('paymentGatewaysEdit', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn  btn-info" ng-class="size ? \'btn-\' + size : \'\'" href="#/payment_gateways/{{id}}/edit">\n<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function (scope) {
            scope.id = scope.entry().values.id;
        }
    };
}]);

ngapp.directive('paymentGateways', ['$location', '$state', function ($location, $state, $http) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&"
        },
        controller: function ($rootScope, $scope, $location, notification, $http) {
            $scope.liveMode = false;
            $scope.test_mode_value = {};
            $scope.live_mode_value = {};
            $scope.save = function () {
                var params = {};
                // if ($scope.liveMode === false) {
                params.id = $scope.entry().values.id
                params.test_mode_value = $scope.test_mode_value;
                // params.test_mode_value.id = $scope.entry().values.id;
                // } else {
                params.live_mode_value = $scope.live_mode_value;
                // params.live_mode_value.id = $scope.entry().values.id;
                // }
                $http.put(admin_api_url + 'api/v1/payment_gateway_settings/' + params.id, params).success(function (response) {
                    if (angular.isDefined(response.error.code === 0)) {
                        notification.log('Data updated successfully', {
                            addnCls: 'humane-flatty-success'
                        });
                    }
                });
            };
            $scope.zazpay_synchronize = function () {
                $http.get(admin_api_url + 'api/v1/zazpay_synchronize', {}).success(function (response) {
                    if (angular.isDefined(response.error.code === 0)) {
                        notification.log('Synchronize with zazpay successfully', {
                            addnCls: 'humane-flatty-success'
                        });
                    }
                });
            };

            $scope.index = function () {
                if ($scope.entry().values.id === 3) {
                    $scope.paypal_rest = true;

                } else {
                    $scope.paypal_rest = false;
                }
                angular.forEach($scope.entry()
                    .values.payment_gateway_settings,
                    function (value, key) {
                        $scope.test_mode_value[value.name] = value.test_mode_value;
                        $scope.live_mode_value[value.name] = value.live_mode_value;
                    });
            };
            $scope.index();
        },
        template: '<div><input type="checkbox" ng-model="liveMode">&nbsp;&nbsp;Live Mode?</div><table><tr><th></th><th>Live Mode Credential</th><th>&nbsp;</th><th>Test Mode Credential</th></tr>{{paypal_rest}}<span ng-show="paypal_rest == true"><tr><td>Client ID &nbsp;&nbsp;</td><td><input type="text" ng-model="live_mode_value.CLIENT_ID" class="form-control" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" class="form-control" ng-model="test_mode_value.CLIENT_ID" style="margin-bottom:10px;"></td></tr><tr><td>Client Secret &nbsp;&nbsp;</td><td><input type="text" ng-model="live_mode_value.CLIENT_SECRET" class="form-control" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" class="form-control" ng-model="test_mode_value.CLIENT_SECRET" style="margin-bottom:10px;"></td></tr></span><tr ng-if="paypal_rest !== true"><td>Merchant ID &nbsp;&nbsp;</td><td><input type="text" ng-model="live_mode_value.zazpay_merchant_id" class="form-control" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" class="form-control" ng-model="test_mode_value.zazpay_merchant_id" style="margin-bottom:10px;"></td></tr><tr ng-if="paypal_rest !== true"><td>Website ID</td><td><input type="text" class="form-control" ng-model="live_mode_value.zazpay_website_id" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" class="form-control" ng-model="test_mode_value.zazpay_website_id" style="margin-bottom:10px;"></td></tr><tr ng-if="paypal_rest !== true"><td>Secret Key</td><td><input type="text" ng-model="live_mode_value.zazpay_secret_string" class="form-control" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" ng-model="test_mode_value.zazpay_secret_string" class="form-control" style="margin-bottom:10px;"></td></tr><tr ng-if="paypal_rest !== true"><td>API Key</td><td><input type="text" ng-model="live_mode_value.zazpay_api_key" class="form-control" style="margin-bottom:10px;"></td><td>&nbsp;</td><td><input type="text" ng-model="test_mode_value.zazpay_api_key" class="form-control" style="margin-bottom:10px;"></td></tr><tr><td>&nbsp;</td><td><button type="button" ng-click="save()" class="btn btn-primary"><span class="glyphicon glyphicon-ok"></span>&nbsp;<span class="hidden-xs">Save changes</span></button></td><td>&nbsp;</td><td><button type="button" ng-click="zazpay_synchronize()" class="btn btn-primary"><span class="glyphicon glyphicon-refresh"></span>&nbsp;<span class="hidden-xs">Sync with ZazPay</span></button></td></tr></table>',
    };
}]);
ngapp.directive('createPage', ['$location', '$state', function ($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-default" ng-class="size ? \'btn-\' + size : \'\'" href="#/pages/add" >\n<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>&nbsp;<span class="hidden-xs"></span>\n</a>',
        link: function (scope) {

        }
    };
}]);
ngapp.directive('batchDraft', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'draft' ? '1' : '1';
            var status_name = attrs.type == 'draft' ? 'Draft' : 'Draft';
            scope.icon = attrs.type == 'draft' ? 'glyphicon-envelope' : 'glyphicon-envelope';
            scope.label = attrs.type == 'draft' ? 'Draft' : 'Draft';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.course_status_id = status;
                            course.course_status_name = status_name;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('batchActive', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@',
            action: '@'
        },
        link: function (scope, element, attrs) {
            var status_name = attrs.type == 'active' ? 'Active' : 'Active';
            scope.icon = attrs.type == 'active' ? 'glyphicon-ok' : 'glyphicon-ok';
            scope.label = attrs.type == 'active' ? 'Active' : 'Active';
            scope.action = attrs.action;
            scope.updateStatus = function (action) {
                $q.all(scope.selection.map(function (e) {
                    var p = Restangular.one('/' + action + '/' + e.values.id);
                    if (scope.action == 'coupons') {
                        p.course_id = e.values.course_id;
                    }
                    p.is_active = 1;
                    p.put()
                        .then(function () {
                            $state.reload()
                        })
                }))
                    .then(function () {
                        notification.log(scope.selection.length + ' status changed to  ' + status_name, {
                            addnCls: 'humane-flatty-success'
                        });
                    })
            }
        },
        template: '<span ng-click="updateStatus(action)"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('batchDeactive', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@',
            action: '@'
        },
        link: function (scope, element, attrs) {
            var status_name = attrs.type == 'deactive' ? 'Deactive' : 'Deactive';
            scope.icon = attrs.type == 'deactive' ? 'glyphicon-remove' : 'glyphicon-remove';
            scope.label = attrs.type == 'deactive' ? 'Deactive' : 'Deactive';
            scope.action = attrs.action;
            scope.updateStatus = function (action) {
                $q.all(scope.selection.map(function (e) {
                    var p = Restangular.one('/' + action + '/' + e.values.id);
                    if (scope.action == 'coupons') {
                        p.course_id = e.values.course_id;
                    }
                    p.is_active = 0;
                    p.put()
                        .then(function () {
                            $state.reload()
                        })
                }))
                    .then(function () {
                        notification.log(scope.selection.length + ' status changed to  ' + status_name, {
                            addnCls: 'humane-flatty-success'
                        });
                    })
            }
        },
        template: '<span ng-click="updateStatus(action)"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);



ngapp.directive('coursebatchActive', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'active' ? '3' : '3';
            var status_name = attrs.type == 'active' ? 'Active' : 'Active';
            scope.icon = attrs.type == 'active' ? 'glyphicon-thumbs-up' : 'glyphicon-thumbs-up';
            scope.label = attrs.type == 'active' ? 'Active' : 'Active';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.course_status_id = status;
                            course.course_status_name = status_name;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
/*ngapp.directive('batchDeactive', ['$location', '$state', 'notification', '$q', 'Restangular', function($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function(scope, element, attrs) {
            // var status = attrs.type == 'deactive' ? '3' : '3';
            var status_name = attrs.type == 'deactive' ? 'Active' : 'Active';
            scope.icon = attrs.type == 'deactive' ? 'glyphicon-remove' : 'glyphicon-remove';
            scope.label = attrs.type == 'deactive' ? 'Deactive' : 'Deactive';
            scope.updateStatus = function() {
                $q.all(scope.selection.map(function(e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function(courseReponses) { return courseReponses.data; })
                        .then(function(course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.course_status_id = status;
                            course.course_status_name = status_name;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function() { $state.reload() })
                        .then(function() { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function() { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);*/
ngapp.directive('batchWaitingForApproval', ['$location', '$state', 'notification', '$$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'waiting' ? '2' : '2';
            var status_name = attrs.type == 'waiting' ? 'Waiting For Approval' : 'Waiting For Approval';
            scope.icon = attrs.type == 'waiting' ? 'glyphicon-thumbs-down' : 'glyphicon-thumbs-down';
            scope.label = attrs.type == 'waiting' ? 'Waiting For Approval' : 'Waiting For Approval';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.course_status_id = status;
                            course.course_status_name = status_name;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('batchSuspended', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'suspended' ? '4' : '4';
            var status_name = attrs.type == 'suspended' ? 'Suspended' : 'Suspended';
            scope.icon = attrs.type == 'suspended' ? 'glyphicon-ban-circle' : 'glyphicon-ban-circle';
            scope.label = attrs.type == 'suspended' ? 'Suspended' : 'Suspended';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.course_status_id = status;
                            course.course_status_name = status_name;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('batchFeatured', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'is_featured' ? true : true;
            var status_name = attrs.type == 'is_featured' ? 'Featured' : 'Featured';
            scope.icon = attrs.type == 'is_featured' ? 'glyphicon-leaf' : 'glyphicon-leaf';
            scope.label = attrs.type == 'is_featured' ? 'Featured' : 'Featured';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.is_featured = status;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('batchUnfeatured', ['$location', '$state', 'notification', '$q', 'Restangular', function ($location, $state, notification, $q, Restangular) {
    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            var status = attrs.type == 'is_featured' ? false : false;
            var status_name = attrs.type == 'is_featured' ? 'Unfeatured' : 'Unfeatured';
            scope.icon = attrs.type == 'is_featured' ? 'glyphicon-ban-circle' : 'glyphicon-ban-circle';
            scope.label = attrs.type == 'is_featured' ? 'Unfeatured' : 'Unfeatured';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(function (e) {
                    Restangular.one('/courses', e.values.id).get()
                        .then(function (courseReponses) { return courseReponses.data; })
                        .then(function (course) { // your API my support batch updates, this one doesn't, so we iterate
                            course.is_featured = status;
                            return course.put(); // course.put() is a promise
                        }) // this executes all put() promises in parallel and returns
                        .then(function () { $state.reload() })
                        .then(function () { notification.log(scope.selection.length + ' Courses status changed to  ' + status_name, { addnCls: 'humane-flatty-success' }); })
                        .catch(function () { notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }); })
                }))
            }
        },
        template: '<span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}]);
ngapp.directive('inputType', function () {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&"
        },
        link: function (scope, elem, attrs) {
            elem.bind('change', function () {
                scope.$apply(function () {
                    scope.entry()
                        .values.value = scope.value;
                    if (scope.entry()
                        .values.type === 'checkbox') {
                        scope.entry()
                            .values.value = scope.value ? 1 : 0;
                    }
                });
            });
        },
        controller: function ($scope) {
            $scope.text = true;
            $scope.value = $scope.entry()
                .values.value;
            if ($scope.entry()
                .values.type === 'checkbox') {
                $scope.text = false;
                $scope.value = Number($scope.value);
            }
        },
        template: '<textarea ng-model="$parent.value" id="value" name="value" class="form-control" ng-if="text"></textarea><input type="checkbox" ng-model="$parent.value" id="value" name="value" ng-if="!text" ng-true-value="1" ng-false-value="0" ng-checked="$parent.value == 1"/>'
    };
});
ngapp.directive('starRating', function () {
    return {
        restrict: 'E',
        scope: {
            stars: '@'
        },
        link: function (scope, elm, attrs, ctrl) {
            scope.starsArray = Array.apply(null, {
                length: parseInt(scope.stars)
            })
                .map(Number.call, Number);
        },
        template: '<i ng-repeat="star in starsArray"  class="glyphicon glyphicon-star"></i>'
    };
});
ngapp.directive('transactionDisplayType', function ($state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&"
        },
        link: function (scope, elem, attrs) {
            if (parseInt($state.params['search']['is_student']) === 1) {
                scope.type = scope.entry().values.displayname + ' ' + 'bought course of' + ' ' + scope.entry().values.course_title;
            } else {
                scope.type = scope.entry().values.displayname + ' ' + ' bought' + ' the ' + scope.entry().values.course_title + ' course of ' + scope.entry().values.teacher_displayname;
                if (scope.entry().values.is_student === true) {
                    scope.type = scope.type + ' - [Main Instructor]'
                } else {
                    scope.type = scope.type + ' - [Sub Instructor]'
                }
            }
        },
        template: '<p>{{type}}</p>'
    };
});
ngapp.directive('transactionDisplayAmount', function ($state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&"
        },
        link: function (scope, elem, attrs) {
            if (parseInt($state.params['search']['is_student']) === 1) {
                scope.amount = scope.entry().values.amount;
            } else {
                scope.amount = scope.entry().values.revenue_amount;
            }
        },
        template: '<p>{{amount| number:2}}</p>'
    };
});
ngapp.directive('transactionPaymentMode', function ($state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entry: "&"
        },
        link: function (scope, elem, attrs) {
            if (scope.entry().values.is_credit_card_payment === true) {
                scope.payment_type = 'Credit Cart';
            } else {
                scope.payment_type = 'PayPal';
            }
        },
        template: '<p>{{payment_type}}</p>'
    };
});
//quicklogin
ngapp.directive('quickLogin', ['$location', '$state', function($location, $state) {
    return {
        restrict: 'E',
        scope: {
            entity: "&",
            entityName: "@",
            entry: "&",
            size: "@",
            label: "@"
        },
        template: '<a class="btn btn-success btn-sm" target="_blank" ng-class="size ? \'btn-\' + size : \'\'" href="https://tmooh.com/api/v1/admin/quicklogin?e={{password}}" >\n<span class="fal fa-sign-in" aria-hidden="true"></span>&nbsp;<span class="hidden-xs">{{label}}</span>\n</a>',
        link: function(scope) {
		        scope.password =scope.entry().values.password;
        }
    };
}]);
ngapp.config(['RestangularProvider', function (RestangularProvider) {
    // use the custom query parameters function to format the API request correctly
    RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params) {
        // Added this filter param changes for admin and user end listing for same api call - for admin - we send filter=all param for display all active and inactive records
        if (operation === "getList" && (what == 'courses' || what == 'categories' || what == 'users' || what == 'cities' || what == 'states' || what == 'languages' || what == 'providers' || what == 'subscriptions' || what == 'transactions' || what == 'cameras' || what == 'lightings' || what == 'microphones' || what == 'editing_softwares' || what == 'currencies' || what == 'course_review_questions' || what == 'programming_languages' || what == 'help_topics')) {
            if (!params._filters) {
                params.filter = { 'filter': 'all' };
                if (what == 'users') {
                    params.filter = { 'filter': 'all', 'providertype': 'all' };
                }
                if (what == 'users') {
                    params.filter = { 'filter': 'all', 'providertype': 'all' };
                }
                delete params._filter;
            }
        }
        // custom pagination params
        if (params._sortField) {
            params.sort = params._sortField;
        }
        delete params._sortField;
        if (params._sortDir) {
            params.sort_by = params._sortDir;
        }
        delete params._sortDir;
        if (params._perPage !== null && params._perPage !== 'all' && params._page) {
            params._start = (params._page - 1) * params._perPage;
            params._end = params._page * params._perPage;
            //In REST file, we added page and limit query parameters for pagination
            //Get Reference from http://ng-admin-book.marmelab.com/doc/API-mapping.html
            //Keyword - pagination
            params.page = params._page;
            params.limit = params._perPage;
        }
        delete params._start;
        delete params._end;

        if (params._perPage === null) {
            params.limit = limit_per_page;
        }
        if (angular.isUndefined(params._perPage)) {
            params.limit = 'all';
        }
        //limit('all') is used for dropdown values, our api default limit value is '10', to show all the value we should pass string 'all' in limit parameter.
        if (params._perPage == 'all') {
            params.limit = 'all';
        }
        delete params._page;
        delete params._perPage;
        // custom sort params
        if (params._sortField) {
            delete params._sortField;
            delete params._sortDir;
        }
        // custom filters
        if (params._filters) {
            params.filter = params._filters;
            delete params._filters;
        }
        if (url.indexOf('contacts_duplicate_corporate') !== -1) {
            params.type = 'Corporate';
        }
        if (url.indexOf('contacts_duplicate_quote') !== -1) {
            params.type = 'Quote';
        }
        if (url.indexOf('contacts_duplicate_contact') !== -1) {
            params.type = 'Contact';
        }
        if ($cookies.get("token")) {
            var sep = url.indexOf('?') === -1 ? '?' : '&';
            url = url + sep + 'token=' + $cookies.get('token');
        }
        return {
            params: params,
            url: url
        };
    });
    //Total Number of Results
    //Our API doesn't return a X-Total-Count header, so we added a totalCount property to the response object using a Restangular response interceptor.
    //Removed metadata info from response
    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response) {
        if (operation === "getList") {
            var headers = response.headers();
            if (typeof response.data._metadata !== 'undefined' && response.data._metadata.total !== null) {
                response.totalCount = response.data._metadata.total_records;
            }
        }
        return data;
    });
    //To cutomize single view results, we added setResponseExtractor.
    //Our API Edit view results single array with following data format data[{}], Its not working with ng-admin format
    //so we returned data like data[0];
    RestangularProvider.setResponseExtractor(function (response, operation, what, url) {
        if (response.data) {
            if (operation === "getList") {
                // Use results as the return type, and save the result metadata
                var newResponse = response.data;
                newResponse._metadata = response._metadata;
                return newResponse;
            } else {
                newResponse = response.data[0];
            }
            return newResponse;
        } else {
            return response;
        }
    });


}]);
ngapp.filter("timeago", function () {
    //passed extra argument to get time zome
    return function (date, timeZone) {
        jQuery.timeago.settings.strings = {
            prefixAgo: null,
            prefixFromNow: null,
            suffixAgo: "ago",
            suffixFromNow: "from now",
            seconds: "a seconds",
            minute: "a minute",
            minutes: "%d minutes",
            hour: "an hour",
            hours: "%d hours",
            day: "a day",
            days: "%d days",
            month: "a month",
            months: "%d months",
            year: "a year",
            years: "%d years",
            wordSeparator: " ",
            numbers: []
        };
        return jQuery.timeago(date + timeZone);
    };
});

function truncate(value) {
    if (!value) {
        return '';
    }
    return value.length > 50 ? value.substr(0, 50) + '...' : value;
}
ngapp.config(['NgAdminConfigurationProvider', 'CmsConfig', function (NgAdminConfigurationProvider, CmsConfig) {
    var enabledPlugins = $.cookie("enabled_plugins");
    // var zazPayPlugin = enabledPlugins.replace("[", "");
    // zazPayPlugin = zazPayPlugin.replace("]", "");
    // zazPayPlugin = zazPayPlugin.split(',');
    //trunctate function to shorten text length.
    function truncate(value) {
        if (!value) {
            return '';
        }

        return value.length > 50 ? value.substr(0, 50) + '...' : value;
    }
    var nga = NgAdminConfigurationProvider;
    var admin = nga.application('Tambarani Admin')
        .baseApiUrl(admin_api_url + 'api/v1/'); // main API endpoint;
    /**Custom header Template */
    if ($cookies.get("auth") !== undefined && $cookies.get("auth") !== null) {

        var customHeaderTemplate = '<div class="navbar-header">' +
            '<button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '</button>' +
            '<a class="navbar-brand" href="#/dashboard" ng-click="appController.displayHome()">Admin Panel</a>' +
            '</div>' + '<custom-header></custom-header>'; //<custom-header></custom-header> this is custom directive
        admin.header(customHeaderTemplate);
        /**Menu configuration */
        admin.menu(nga.menu()
            .addChild(nga.menu()
                .title('Dashboard')
                .icon('<span class="glyphicon glyphicon-home"></span>')
                .link("/dashboard")));
        generateMenu(CmsConfig.menus);
        var dashboardTpl = '<content-top><div class="content-top clearfix"><h3 class="text-uppercse al-title ng-binding">Dashboard</h3><ul class="breadcrumb al-breadcrumb"><li class="ng-binding">Dashboard</li></ul></div></content-top>' +
            '<dashboard-summary></dashboard-summary>'
        /*var dashboardTpl = '<div class="row list-header"><div class="col-lg-12"><div class="page-header">' +
            '<h4><span>Dashboard</span></h4></div></div></div>' +
            '<dashboard-summary></dashboard-summary>';*/
        admin.dashboard(nga.dashboard()
            .template(dashboardTpl)
        );
    }
    var entities = {};
    if (angular.isDefined(CmsConfig.tables)) {
        angular.forEach(CmsConfig.tables, function (v, table) {
            var listview = {},
                editionview = {},
                creationview = {},
                showview = {},
                editViewCheck = false,
                editViewFill = "",
                showViewCheck = false,
                showViewFill = "";
            listview.fields = [];
            editionview.fields = [];
            creationview.fields = [];
            listview.filters = [];
            listview.listActions = [];
            listview.batchActions = [];
            listview.actions = [];
            showview.fields = [];
            listview.infinitePagination = "",
                listview.perPage = 10;
            entities[table] = nga.entity(table);

            if (angular.isDefined(v.listview)) {
                angular.forEach(v.listview, function (v1, k1) {
                    if (k1 == 'fields') {
                        angular.forEach(v1, function (v2, k2) {
                            var field = nga.field(v2.name, v2.type);
                            if (angular.isDefined(v2.label)) {
                                field.label(v2.label);
                            }
                            if (angular.isDefined(v2.format)) {
                                field.format(v2.format);
                            }
                            if (angular.isDefined(v2.isDetailLink)) {
                                field.isDetailLink(v2.isDetailLink);
                            }
                            if (angular.isDefined(v2.detailLinkRoute)) {
                                field.detailLinkRoute(v2.detailLinkRoute);
                            }
                            if (angular.isDefined(v2.template)) {
                                field.template(v2.template);
                            }
                            if (angular.isDefined(v2.permanentFilters)) {
                                field.permanentFilters(v2.permanentFilters);
                            }
                            if (angular.isDefined(v2.infinitePagination)) {
                                field.infinitePagination(v2.infinitePagination);
                            }
                            if (angular.isDefined(v2.singleApiCall)) {
                                if (angular.isDefined(v2.targetEntity)) {
                                    field.targetEntity(nga.entity(v2.targetEntity));
                                }
                                if (angular.isDefined(v2.targetField)) {
                                    field.targetField(nga.field(v2.targetField));
                                }
                            }
                            if (angular.isDefined(v2.singleApiCall)) {
                                field.singleApiCall(v2.singleApiCall);
                            }
                            if (angular.isDefined(v2.batchActions)) {
                                field.batchActions(v2.batchActions);
                            }
                            if (angular.isDefined(v2.stripTags)) {
                                field.stripTags(v2.stripTags);
                            }
                            if (angular.isDefined(v2.exportOptions)) {
                                field.exportOptions(v2.exportOptions);
                            }
                            if (angular.isDefined(v2.remoteComplete)) {
                                field.remoteComplete(true, {
                                    searchQuery: function (search) {
                                        return {
                                            q: search,
                                            autocomplete: true
                                        };
                                    }
                                });
                            }
                            if (angular.isDefined(v2.map)) {
                                angular.forEach(v2.map, function (v2m, k2m) {
                                    field.map(eval(v2m));
                                });
                            }
                            listview.fields.push(field);
                        });
                    }
                    if (k1 == 'filters') {
                        angular.forEach(v1, function (v3, k3) {
                            var field;
                            if (v3.type === "template") {
                                field = nga.field(v3.name);
                            } else {
                                field = nga.field(v3.name, v3.type);
                            }
                            if (angular.isDefined(v3.label)) {
                                field.label(v3.label);
                            }
                            if (angular.isDefined(v3.format)) {
                                field.format(v3.format);
                            }
                            if (angular.isDefined(v3.choices)) {
                                field.choices(v3.choices);
                            }
                            if (angular.isDefined(v3.pinned)) {
                                field.pinned(v3.pinned);
                            }
                            if (angular.isDefined(v3.template) && v3.template !== "") {
                                field.template(v3.template);
                            }
                            if (angular.isDefined(v3.targetEntity)) {
                                field.targetEntity(nga.entity(v3.targetEntity));
                            }
                            if (angular.isDefined(v3.targetField)) {
                                field.targetField(nga.field(v3.targetField));
                            }
                            if (angular.isDefined(v3.remoteComplete)) {
                                field.remoteComplete(true, {
                                    searchQuery: function (search) {
                                        return {
                                            q: search,
                                            autocomplete: true
                                        };
                                    }
                                });
                            }
                            /* if (angular.isDefined(v3.map)) {
                                 angular.forEach(field.map, function (v2m, k2m) {
                                     field.map(eval(v2m));
                                 });
                             }*/
                            listview.filters.push(field);
                        });
                    }
                    if (k1 == 'listActions') {
                        if (Array.isArray(v1) === true) {
                            angular.forEach(v1, function (v3, k3) {
                                if (v3 === "edit") {
                                    editViewCheck = true;
                                }
                                if (v3 === "show") {
                                    showViewCheck = true;
                                }
                                listview.listActions.push(v3);
                            });
                        } else if (v1 !== "") {
                            listview.listActions.push(v1);
                        }
                    }
                    if (k1 == 'batchActions') {
                        if (Array.isArray(v1) === true) {
                            angular.forEach(v1, function (v3, k3) {
                                listview.batchActions.push(v3);
                            });
                        } else if (v1 !== "") {
                            listview.batchActions.push(v1);
                        }
                    }
                    if (k1 == 'actions') {
                        if (Array.isArray(v1) === true) {
                            angular.forEach(v1, function (v3, k3) {
                                listview.actions.push(v3);
                            });
                        } else if (v1 !== "") {
                            listview.actions.push(v1);
                        }
                    }
                    if (k1 == 'infinitePagination') {
                        listview.infinitePagination = v1;
                    }
                    if (k1 == 'perPage') {
                        listview.perPage = v1;
                    }
                });
                if (angular.isDefined(v.creationview)) {
                    editViewFill = generateFields(v.creationview.fields);
                    creationview.fields.push(editViewFill);
                    if (editViewCheck === true && !angular.isDefined(v.editionview)) {
                        editionview.fields.push(editViewFill);
                    } else if (angular.isDefined(v.editionview)) {
                        editionview.fields.push(generateFields(v.editionview.fields));
                    }
                }
            }
            if (angular.isDefined(v.editionview)) {
                angular.forEach(v.editionview, function (v1, k1) {
                    if (k1 == 'actions') {
                        if (Array.isArray(v1) === true) {
                            editionview.actions = [];
                            angular.forEach(v1, function (v3, k3) {
                                editionview.actions.push(v3);
                            });
                        } else if (v1 !== "") {
                            editionview.actions.push(v1);
                        }
                    }
                });
            }
            if (angular.isDefined(v.showview)) {
                showview.fields.push(generateFields(v.showview.fields));
            } else if (showViewCheck === true) {
                showview.fields.push(listview.fields);
            }
            if (angular.isDefined(v.showview)) {
                angular.forEach(v.showview, function (v1, k1) {
                    if (k1 == 'actions') {
                        if (Array.isArray(v1) === true) {
                            showview.actions = [];
                            angular.forEach(v1, function (v3, k3) {
                                showview.actions.push(v3);
                            });
                        } else if (v1 !== "") {
                            showview.actions.push(v1);
                        }
                    }
                });
            }
            admin.addEntity(entities[table]);
            entities[table].listView()
                .title(v.listview.title)
                .fields(listview.fields)
                .listActions(listview.listActions)
                .batchActions(listview.batchActions)
                .infinitePagination(listview.infinitePagination)
                .perPage(parseInt(listview.perPage))
                .actions(listview.actions)
                .filters(listview.filters);
            if (angular.isDefined(v.creationview)) {
                entities[table].creationView()
                    .title(v.creationview.title)
                    .fields(creationview.fields)
                    .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function (progression, notification, $state, entry, entity) {
                        progression.done();
                        var Entity_Name;
                        if (entity.name() === 'help_topic_contents') {
                            Entity_Name = 'FAQ topic content'
                        }
                        if (entity.name() === 'help_topics') {
                            Entity_Name = 'FAQ topic'
                        }
                        if (entity.name() !== 'help_topic_contents' && entity.name() !== 'help_topics') {
                            Entity_Name = toUpperCase(entity.name()).replace(/_/g, " ");
                        }
                        if (entry.values['error.code'] === 0 || entry.values['error.code'] === undefined) {
                            notification.log(Entity_Name + ' added successfully', {
                                addnCls: 'humane-flatty-success'
                            });
                        } else {
                            notification.log(entry.values['error.message'], {
                                addnCls: 'humane-flatty-error'
                            });
                        }

                        $state.go($state.get('list'), {
                            entity: entity.name()
                        });
                        return false;
                    }]);
            }
            if (angular.isDefined(v.editionview) || editViewCheck === true) {
                var editTitle;
                if (editViewCheck === true && angular.isDefined(v.editionview)) {
                    editTitle = v.editionview.title;
                } else if (angular.isDefined(v.creationview)) {
                    editTitle = v.creationview.title;
                } else {
                    editTitle = 'Edit';
                }
                entities[table].editionView()
                    .title(editTitle)
                    .fields(editionview.fields)
                    .actions(editionview.actions)
                    .onSubmitSuccess(['progression', 'notification', '$location', '$state', 'entry', 'entity', function (progression, notification, $location, $state, entry, entity) {
                        progression.done();
                        var Entity_Name;
                        if (entity.name() === 'help_topic_contents') {
                            Entity_Name = 'FAQ topic content'
                        }
                        if (entity.name() === 'help_topics') {
                            Entity_Name = 'FAQ topic'
                        }
                        if (entity.name() === 'course_users') {
                            Entity_Name = 'Course Booking'
                        }
                        if (entity.name() !== 'help_topic_contents' && entity.name() !== 'help_topics' && entity.name() !== 'course_users') {
                            Entity_Name = toUpperCase(entity.name()).replace(/_/g, " ");
                        }
                        /* notification.log(Entity_Name + ' updated successfully', {
                             addnCls: 'humane-flatty-success'
                         });*/
                        if (entry.values['error.code'] === 0 || entry.values['error.code'] === undefined) {
                            notification.log(Entity_Name + ' updated successfully', {
                                addnCls: 'humane-flatty-success'
                            });
                        } else {
                            notification.log(entry.values['error.message'], {
                                addnCls: 'humane-flatty-error'
                            });
                        }
                        if (entity.name() === 'settings') {
                            var category_id = entry.values['response.setting_category_id'];
                            $location.path('/setting_categories/show/' + category_id);
                        } else {

                            $state.go($state.get('list'), {
                                entity: entity.name()
                            });
                        }
                        return false;
                    }])
                    .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
                        angular.forEach(error.data.errors, function (value, key) {
                            if (this[key]) {
                                this[key].$valid = false;
                            }
                        }, form);
                        progression.done();
                        notification.log(error.data.message, {
                            addnCls: 'humane-flatty-error'
                        });
                        return false;
                    }]);
            }
            if (angular.isDefined(v.showview) || showViewCheck === true) {
                if (showViewCheck === true) {
                    entities[table].showView().title(v.listview.title);
                } else if (angular.isDefined(v.showview) && angular.isDefined(v.showview.title)) {
                    entities[table].showView().title(v.showview.title);
                }
                entities[table].showView().fields(showview.fields).actions(showview.actions);
            }
        });
    }

    function generateMenu(menus) {
        angular.forEach(menus, function (menu_value, menu_keys) {
            var menus;
            if (angular.isDefined(menu_value.link)) {
                menusIndex = nga.menu();
                if (angular.isDefined(menu_value.linkFunction)) {
                    menusIndex.link(menu_value.link + eval(menu_value.linkFunction));
                } else {
                    menusIndex.link(menu_value.link);
                }
            } else if (angular.isDefined(menu_value.child_sub_menu)) {
                menusIndex = nga.menu();
            } else {
                menusIndex = nga.menu(nga.entity(menu_keys));
            }
            if (angular.isDefined(menu_value.title)) {
                menusIndex.title(menu_value.title);
            }
            if (angular.isDefined(menu_value.icon_template)) {
                menusIndex.icon(menu_value.icon_template);
            }
            if (angular.isDefined(menu_value.child_sub_menu)) {
                angular.forEach(menu_value.child_sub_menu, function (val, key) {
                    var child = nga.menu(nga.entity(key));
                    if (angular.isDefined(val.title)) {
                        child.title(val.title);
                    }
                    if (angular.isDefined(val.icon_template)) {
                        child.icon(val.icon_template);
                    }
                    if (angular.isDefined(val.link)) {
                        if (angular.isDefined(val.linkFunction)) {
                            child.link(val.link + eval(val.linkFunction));
                        } else {
                            child.link(val.link);
                        }
                    }
                    menusIndex.addChild(child);
                });
            }
            admin.menu().addChild(menusIndex);
        });
    }

    function generateFields(fields) {
        var generatedFields = [];
        angular.forEach(fields, function (targetFieldValue, targetFieldKey) {
            var field = nga.field(targetFieldValue.name, targetFieldValue.type),
                fieldAdd = true;
            if (angular.isDefined(targetFieldValue.label)) {
                field.label(targetFieldValue.label);
            }
            if (angular.isDefined(targetFieldValue.isDetailLink)) {
                field['_detailLink'] = targetFieldValue.isDetailLink;
            }
            if (angular.isDefined(targetFieldValue.choices)) {
                field.choices(targetFieldValue.choices);
            }
            if (angular.isDefined(targetFieldValue.editable)) {
                field.editable(targetFieldValue.editable);
            }
            if (angular.isDefined(targetFieldValue.attributes)) {
                field.attributes(targetFieldValue.attributes);
            }
            if (angular.isDefined(targetFieldValue.targetEntity)) {
                field.targetEntity(nga.entity(targetFieldValue.targetEntity));
            }
            if (angular.isDefined(targetFieldValue.targetReferenceField)) {
                field.targetReferenceField(targetFieldValue.targetReferenceField);
            }
            if (angular.isDefined(targetFieldValue.targetField)) {
                field.targetField(nga.field(targetFieldValue.targetField));
            }
            if (angular.isDefined(targetFieldValue.map)) {
                angular.forEach(targetFieldValue.map, function (v2m, k2m) {
                    field.map(eval(v2m));
                });
            }
            if (angular.isDefined(targetFieldValue.perPage)) {
                field.perPage(targetFieldValue.perPage);
            }
            if (angular.isDefined(targetFieldValue.listActions)) {
                field.listActions(targetFieldValue.listActions);
            }
            if (angular.isDefined(targetFieldValue.format)) {
                field.format(targetFieldValue.format);
            }
            if (angular.isDefined(targetFieldValue.template)) {
                field.template(targetFieldValue.template);
            }
            if (angular.isDefined(targetFieldValue.permanentFilters)) {
                field.permanentFilters(targetFieldValue.permanentFilters);
            }
            if (angular.isDefined(targetFieldValue.defaultValue)) {
                field.defaultValue(targetFieldValue.defaultValue);
            }
            if (angular.isDefined(targetFieldValue.validation)) {
                field.validation(eval(targetFieldValue.validation));
            }
            if (angular.isDefined(targetFieldValue.remoteComplete)) {
                field.remoteComplete(true, {
                    searchQuery: function (search) {
                        return {
                            q: search,
                            autocomplete: true
                        };
                    }
                });
            }
            if (angular.isDefined(targetFieldValue.uploadInformation) && angular.isDefined(targetFieldValue.uploadInformation.url) && angular.isDefined(targetFieldValue.uploadInformation.apifilename)) {
                field.uploadInformation({
                    'url': admin_api_url + targetFieldValue.uploadInformation.url,
                    'apifilename': targetFieldValue.uploadInformation.apifilename
                });
            }
            if (targetFieldValue.type === "file" && (!angular.isDefined(targetFieldValue.uploadInformation) || !angular.isDefined(targetFieldValue.uploadInformation.url) || !angular.isDefined(targetFieldValue.uploadInformation.apifilename))) {
                fieldAdd = false;
            }
            if (angular.isDefined(targetFieldValue.targetFields) && (targetFieldValue.type === "embedded_list" || targetFieldValue.type === "referenced_list")) {
                var embField = generateFields(targetFieldValue.targetFields);
                field.targetFields(embField);
            }
            if (fieldAdd === true) {
                generatedFields.push(field);
            }
        });
        return generatedFields;
    }
    nga.configure(admin);

    function authuser(Ids) {
        return {
            "id[]": Ids
        };
    }
}]);
ngapp.run(['$rootScope', '$location', '$window', '$state', '$cookies', 'siteSettings', function ($rootScope, $location, $window, $state, $cookies, siteSettings) {
    $rootScope.$on('$viewContentLoaded', function () {
        $('body').removeClass('site-loading');
        $('div.js-loader').hide();
    });
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        var url = toState.name;
        var exception_arr = ['login', 'logout'];
        if (siteSettings !== null && siteSettings !== undefined) {
            angular.forEach(siteSettings.data,
                function (value, key) {
                    if (value.name === "SITE_IS_ENABLE_ZAZPAY_PLUGIN") {
                        var zazPay = value.value;
                        $.cookie('zazpay', JSON.stringify(zazPay), {
                            path: '/'
                        });
                    }
                });
            if (siteSettings._metadata.geoIP !== null && siteSettings._metadata.geoIP !== undefined) {
                if (siteSettings._metadata.geoIP.symbol !== null && siteSettings._metadata.geoIP.symbol !== undefined && siteSettings._metadata.geoIP.symbol !== '') {
                    $cookies.put("site_currency", siteSettings._metadata.geoIP.symbol, {
                        path: '/'
                    });
                }
            } else {
                $cookies.remove("site_currency", { path: "/" });
            }
            timeZone = siteSettings._metadata.geoIP.timezone;
            if (timeZone !== null && timeZone !== undefined && timeZone !== '') {
                $cookies.put("site_timezone", timeZone, {
                    path: '/'
                });
            } else {
                $cookies.remove("site_timezone", { path: "/" });
            }
            site_timezone = timeZone;
        }
        if (($cookies.get("auth") === null || $cookies.get("auth") === undefined) && exception_arr.indexOf(url) === -1) {
            $location.path('/users/login');
        }
        if (exception_arr.indexOf(url) === 0 && $cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
            $location.path('/dashboard');
        }
        $rootScope.oauthscopes = [];
        if ($window.localStorage.getItem("oauth_scopes") !== null && $window.localStorage.getItem("oauth_scopes") !== undefined) {
            $rootScope.oauthscopes = JSON.parse($window.localStorage.getItem("oauth_scopes"));
        }
        if ($cookies.get('auth') !== undefined && $cookies.get('auth') !== null) {
            auth = JSON.parse($cookies.get('auth'));
            $rootScope.sub_admin_id = auth.sub_admin_id;
            if (auth.role_id === 2) {
                $location.path('/users/logout');
            }
        }
        trayOpen();

    });
}]);

function addFields(getFields) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function trayOpen() {
    setTimeout(function () {
        /* For open sub-menu tray */
        if ($('.active')
            .parents('.with-sub-menu')
            .attr('class')) {
            $('.active')
                .parents('.with-sub-menu')
                .addClass('ba-sidebar-item-expanded');
        }
        /* For open collaps menu when menu in collaps state */
        $('.al-sidebar-list-link')
            .click(function () {
                if ($('.js-collaps-main')
                    .hasClass('menu-collapsed')) {
                    $('.js-collaps-main')
                        .removeClass('menu-collapsed');
                }
            });
    }, 100);
}

function menucollaps() {
    setTimeout(function () {
        /* For menu collaps and open */
        $('.collapse-menu-link')
            .click(function () {
                if ($('.js-collaps-main')
                    .hasClass('menu-collapsed')) {
                    $('.js-collaps-main')
                        .removeClass('menu-collapsed');
                } else {
                    $('.js-collaps-main')
                        .addClass('menu-collapsed');
                }
            });
    }, 1000);
}

function toUpperCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
