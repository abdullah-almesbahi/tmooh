angular.module('base')
    .controller('RevenueReportController', function ($scope, $http, notification, $state, $window, ConstCourseType) {
        $scope.revenue_reports = {};
        $scope.revenue_reports = {};
        /***Instructor profit revenue report getting and with pagination  */
        function getRevenueReportInstructorDetails() {
            $scope.revenue_reports.instructor = [];
            var params = {
                type: "instructor",
                page: angular.isDefined($scope.instructor_currentPage) ? parseInt($scope.instructor_currentPage) : 1
            };
            $http({
                url: admin_api_url + 'api/v1/insights/revenue_reports',
                method: "GET",
                params: params
            }).success(function (response) {
                $scope.revenue_reports.instructor = response.data;
                $scope.Instructor_metadata = response._metadata;
            }, function (error) { });
        }
        $scope.instructorPaginate = function (pageno) {
            $scope.instructor_currentPage = parseInt($scope.instructor_currentPage);
            getRevenueReportInstructorDetails();
        };
        /***Course profit revenue report getting and with pagination  */
        function getRevenueReportCourseDetails() {
            $scope.revenue_reports.course = [];
            var params = {
                type: "course",
                page: angular.isDefined($scope.course_currentPage) ? parseInt($scope.course_currentPage) : 1
            };
            $http({
                url: admin_api_url + 'api/v1/insights/revenue_reports',
                method: "GET",
                params: params
            }).success(function (response) {
                $scope.revenue_reports.course = response.data;
                angular.forEach($scope.revenue_reports.course, function (revenue_report_course) {
                    if (revenue_report_course.course_batches !== null && revenue_report_course.course_batches !== undefined) {
                        angular.forEach(revenue_report_course.course_batches, function (batch) {
                            revenue_report_course.course_type = (!batch.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                        });
                    } else {
                        revenue_report_course.course_type = ConstCourseType.video;
                    }
                });
                $scope.course_metadata = response._metadata;
            }, function (error) { });
        }
        $scope.coursePaginate = function (pageno) {
            $scope.course_currentPage = parseInt($scope.course_currentPage);
            getRevenueReportCourseDetails();
        };
        /*Init function calling*/
        $scope.index = function () {
            getRevenueReportCourseDetails();
            getRevenueReportInstructorDetails();
        };
        $scope.index();
    })
    /*Payment report */
    .controller('PaymentReportController', function ($scope, $rootScope, $http, notification, $state, $window, md5, siteSettings, $filter, $location) {
        $scope.revenue_reports = {};

        function getPaymentReportDetails() {
            var params = {};
            params.page = angular.isDefined($scope.currentPage) ? parseInt($scope.currentPage) : 1;
            $http({
                url: admin_api_url + 'api/v1/insights/payment_reports',
                method: "GET",
                params: params
            }).success(function (response) {
                $scope.payment_reports = response.data;
                $scope._metadata = response._metadata;
            }, function (error) { });
        }
        $scope.index = function () {
            getPaymentReportDetails();
        };
        $scope.exportCSV = function () {
            var Sitename, url;
            Sitename = $filter('filter')(siteSettings.data, { 'name': 'site.name' });
            url = location.origin + '/download/' + md5.createHash('Export' + Sitename[0].value);
            $window.open(url, '_blank');
        };
        $scope.index();
        $scope.paginate = function (pageno) {
            $scope.currentPage = parseInt($scope.currentPage);
            getPaymentReportDetails();
        };

    })
    /*Payment report */
    .controller('ProfitReportController', function ($scope, $http, notification, $state, $window, ConstCourseType) {
        $scope.profit_reports = {};
        /***Instructor profit revenue report getting and with pagination  */
        function getProfitReportInstructorDetails() {
            $scope.profit_reports.instructor = [];
            var params = {
                type: "instructor",
                page: angular.isDefined($scope.instructor_currentPage) ? parseInt($scope.instructor_currentPage) : 1
            };
            $http({
                url: admin_api_url + 'api/v1/insights/profit_reports',
                method: "GET",
                params: params
            }).success(function (response) {
                $scope.profit_reports.instructor = response.data;
                $scope.Instructor_metadata = response._metadata;
            }, function (error) { });
        }
        $scope.instructorPaginate = function (pageno) {
            $scope.instructor_currentPage = parseInt($scope.instructor_currentPage);
            getProfitReportInstructorDetails();
        };
        /***Course profit revenue report getting and with pagination  */
        function getProfitReportCourseDetails() {
            $scope.profit_reports.course = [];
            var params = {
                type: "course",
                page: angular.isDefined($scope.course_currentPage) ? parseInt($scope.course_currentPage) : 1
            };
            $http({
                url: admin_api_url + 'api/v1/insights/profit_reports',
                method: "GET",
                params: params
            }).success(function (response) {
                $scope.profit_reports.course = response.data;
                angular.forEach($scope.profit_reports.course, function (profit_report_course) {
                    if (profit_report_course.course_batches !== null && profit_report_course.course_batches !== undefined) {
                        angular.forEach(profit_report_course.course_batches, function (batch) {
                            profit_report_course.course_type = (!batch.is_offline) ? ConstCourseType.online : ConstCourseType.onsite;
                        });
                    } else {
                        profit_report_course.course_type = ConstCourseType.video;
                    }
                });
                $scope.course_metadata = response._metadata;
            }, function (error) { });
        }
        $scope.coursePaginate = function (pageno) {
            $scope.course_currentPage = parseInt($scope.course_currentPage);
            getProfitReportCourseDetails();
        };
        /*Init function calling*/
        $scope.index = function () {
            getProfitReportCourseDetails();
            getProfitReportInstructorDetails();
        };
        $scope.index();
    })
    /*Demographic report */
    .controller('DemographicReportController', function ($scope, $http, notification, $state, $window) {
        $scope.demographic_reports = {};
        $scope.demographic_loading = true;
        $scope.demographic_age_range_loading = true;

        function getDemographicReportAgeRange() {
            $scope.demographic_age_range_loading = true;
            $scope.demographic_age_range_reports = [];
            $http({
                url: admin_api_url + 'api/v1/insights/demographic_reports',
                method: "GET",
                params: { type: "age_ranges" }
            }).success(function (response) {
                angular.forEach(response.data, function (value, key) {
                    $scope.demographic_age_range_reports.push({
                        "name": key,
                        "y": parseInt(value),
                        "sliced": true
                    });
                });
                $scope.demographic_age_range_loading = false;
            }, function (error) { });
        }
        /**Demographic column chart */
        function getDemographicReport() {
            $scope.demographic_loading = true;
            $scope.demographic_reports_series_data = [];
            $scope.demographic_reports_categories = [];
            var temp_Conversion_series_data = [];
            $scope.demographic_reports_yAxis_title = "Number of Visits";
            $http.get(admin_api_url + 'api/v1/insights/demographic_reports', {}).success(function (response) {
                angular.forEach(response.data, function (value, key) {
                    $scope.demographic_reports_categories.push(key);
                    var value1 = value;
                    temp_Conversion_series_data.push(value1);
                });
                $scope.demographic_reports_series_data.push({
                    "name": 'Register',
                    "data": temp_Conversion_series_data
                });
                $scope.demographic_loading = false;

            }, function (error) { });
        }
        $scope.index = function () {
            $scope.currentPage = $state.params.page ? parseInt($state.params.page) : 1;
            getDemographicReportAgeRange();
            getDemographicReport();
        };
        $scope.index();
        $scope.paginate = function (pageno) {
            $scope.currentPage = parseInt($scope._metadata.currentPage);
            $scope.index();
        };

    });