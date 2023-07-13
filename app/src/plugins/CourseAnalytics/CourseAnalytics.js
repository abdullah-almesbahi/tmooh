/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.courseanalytics', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.controller('CourseAnalyticsController', function ($rootScope, $state, $scope) {
        var model = this;
        model.slideChange = slideChange;
        model.currentSlide = 'Engagement';
        $scope.course_id = $state.params.id;

        function slideChange(type) {
            model.currentSlide = type;
        }
    });
    module.directive('conversionAnalytics', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/CourseAnalytics/conversionAnalytics.tpl.html',
            link: linker,
            controller: 'conversionAnalyticsController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
                type: '@type'
            }
        };
    });
    module.controller('conversionAnalyticsController', function ($state, $location, $scope, flash, $filter, $rootScope, AnalyticConversion) {
        $rootScope.pageTitle = $filter("translate")("Conversion Analytics")+ " | " +$rootScope.settings['site.name'];
        /**VARIABLE DECLARATION */
        var model = this;
        model.loading = true;
        model.coversion_analytics_loading = true;
        /**VARIABLE VALUE ASSIGNING  */
        $scope.course_id = model.courseId;

        /**FUNCTION ASSIGNING WITH MODEL */


        /**FUNCTION DECALARATION  */

        //init function to get the offline course listing ..
        $scope.init = function (element) {
            $scope.Conversion_categories = [];
            var temp_Conversion_series_data = [], temp_channels = [];
            $scope.Conversion_series_data = [];
            var params = {};
            params.course_id = $state.params.id;
            model.title = "Landing Page Visits By External Traffic Sources";
            model.yAxis_title = "Number of Visits";
            AnalyticConversion.get(params).$promise
                .then(function (response) {
                    angular.forEach(response.data, function (value, key) {
                        $scope.Conversion_categories.push(value.date_unit);
                        angular.forEach(value.y_objects, function (value, key) {
                            if (!angular.isDefined(temp_Conversion_series_data[value.key])) {
                                temp_channels.push(value.key);
                                temp_Conversion_series_data[value.key] = [];
                                temp_Conversion_series_data[value.key].data = [];
                                temp_Conversion_series_data[value.key].data.push(parseFloat(value.value));
                            } else if (angular.isDefined(temp_Conversion_series_data[value.key])) {
                                temp_Conversion_series_data[value.key].data.push(parseFloat(value.value));
                            }
                        });
                    });
                    angular.forEach(temp_channels, function (value, key) {
                        $scope.Conversion_series_data.push({
                            "name": value,
                            "data": temp_Conversion_series_data[value].data
                        });
                    });


                    model.coversion_analytics_loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });

        };

        /**FUNCTION CALLING  */

        $scope.init(null);
    });
    module.directive('engagementAnalytics', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/CourseAnalytics/EngagementAnalytics.tpl.html',
            link: linker,
            controller: 'EngagementAnalyticsController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
                type: '@type'
            }
        };
    });
    module.controller('EngagementAnalyticsController', function ($state, $location, $scope, flash, $filter, $rootScope, AnalyticEngagement, AnalyticEngagementLesson) {
        $rootScope.pageTitle = $filter("translate")("Engagement Analytics")+ " | " +$rootScope.settings['site.name'];
        /**VARIABLE DECLARATION */
        var model = this;
        model.angagement_analytics_loading = true;
        $scope.dates = {};
        $scope.dateFilter = {};
        /**VARIABLE VALUE ASSIGNING  */
        $scope.course_id = model.courseId;
        /**FUNCTION DECALARATION  */
        //init function to get the offline course listing ..
        $scope.init = function (element) {
            var params = {};
            params.course_id = $state.params.id;
            AnalyticEngagement.get(params).$promise
                .then(function (response) {
                    model.recent_average_ratings = response.data.recent_average_ratings;
                    model.content_consumed = response.data.content_consumed;
                    model.angagement_analytics_loading = false;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });

        };

        /**FUNCTION CALLING  */
        function engagementLesson() {
            model.engagement_lessons = {};
            var params = {};
            params.course_id = $state.params.id;
            if ($scope.dateFilter !== undefined && $scope.dateFilter !== null) {
                params.month = $scope.dateFilter.month;
                params.year = $scope.dateFilter.year;
            }
            AnalyticEngagementLesson.get(params).$promise
                .then(function (response) {
                    model.engagement_lessons = response.data;
                }, function (error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });
        }
        /***DATEWISE Filter */
        $scope.changeStartRangeMinMax = function () {
            if ($scope.dates.dateRangeStart !== undefined && $scope.dates.dateRangeStart !== null) {
                $scope.dateFilter.month = $filter('date')(Date.parse($scope.dates.dateRangeStart), 'dd');
                $scope.dateFilter.year = $filter('date')(Date.parse($scope.dates.dateRangeStart), 'yyyy');
                engagementLesson();
            }
        };
        /**INIT FUNCTION CALLING */
        $scope.init(null);
        engagementLesson();
    });
    module.directive('columnHighChart', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            template: '<div></div>',
            link: linker,
            controller: 'ColumnHighChartController as model',
            bindToController: true,
            scope: {
                categories: '@categories',
                type: '@type',
                title: '@title',
                seriesData: '@seriesData',
                yaxisTitle: '@yaxisTitle'
            }
        };
    });
    module.controller('ColumnHighChartController', function ($element) {
        var model = this;
        if (model.categories !== undefined && model.categories !== null && model.categories !== '') {
            model.highChartCategories = JSON.parse(model.categories);
        }
        if (model.seriesData !== undefined && model.seriesData !== null && model.seriesData !== '') {
            model.highChartseriesData = JSON.parse(model.seriesData);
        }
        /**Column Chart plot option */
        Highcharts.chart($element[0], {
            chart: {
                type: model.type,
                width: 900,
                height: 450,
                backgroundColor: '#ffffff',
            },
            title: {
                text: model.title
            },
            xAxis: {
                categories: model.highChartCategories,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: model.yaxisTitle
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
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
            series: model.highChartseriesData
        });
    });

})(angular.module('ace.courseanalytics'));

(function (module) {

    module.factory('AnalyticConversion', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/analytics/conversions', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('AnalyticEngagement', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/analytics/engagements?', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('AnalyticEngagementLesson', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/analytics/engagement_by_lessons?', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
})(angular.module("ace.courseanalytics"));
