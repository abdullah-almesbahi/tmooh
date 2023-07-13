/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function (module) {
    module.config(function ($stateProvider) {

    });
} (angular.module('ace.revenue_report', [
    'ui.router',
    'ngResource'

])));

(function (module) {
    /**
     * @ngdoc directive
     * @name customHighChart
     * @description
     * Directive for Jquery High Chart Triggering
     *
     *
     **/
    module.directive('customHighChart', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            template: '<div></div>',
            link: linker,
            controller: 'HighChartController as model',
            bindToController: true,
            scope: {
                options: '@options',
                categories: '@categories',
                type: '@type',
                title: '@title',
                seriesData: '@seriesData'
            }
        };
    });
    module.controller('HighChartController', function ($element) {
        /**
         * @ngdoc controller
         * @name HighChartController
         * @description
         * formatting the data for high chart and triggering the high chart.
         *
         *
         **/
        var model = this;
        if (model.options !== undefined && model.options !== null && model.options !== '') {
            model.highoptions = JSON.parse(model.options);
        }
        if (model.categories !== undefined && model.categories !== null && model.categories !== '') {
            model.highChartCategories = JSON.parse(model.categories);
        }
        if (model.seriesData !== undefined && model.seriesData !== null && model.seriesData !== '') {
            model.highChartseriesData = JSON.parse(model.seriesData);
        }
        /**Area Chart plot option */
        if (model.type === "area") {
            Highcharts.chart($element[0], {
                chart: {
                    type: model.type,
                    width: 1140,
                    height: 350,
                    backgroundColor: '#f4f4f4',
                    zoomType: 'x',
                    panKey: 'shift',
                    panning: true,
                },
                title: {
                    text: model.title
                },
                xAxis: {
                    categories: model.highChartCategories,
                    labels: {
                        rotation: -50,
                        align: 'right',
                        style: {
                            fontSize: "14px"
                        }
                    }
                },
                yAxis: {
                    labels: {
                        format: '$ {value}',
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                    valueSuffix: '$',
                    shared: true
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        lineWidth: 4
                    }
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    layout: 'vertical',
                    x: 0,
                    y: 50,
                    padding: 3,
                    itemMarginTop: 5,
                    itemMarginBottom: 5,
                    symbolHeight: 14,
                    symbolWidth: 16,
                    symbolRadius: 0,
                    itemStyle: {
                        fontWeight: 'bold',
                        fontSize: "14px"
                    },
                    useHTML: true,
                    labelFormatter: function () {
                        return '<span title="' + this.name + '">' + this.name + '</span><a href="#" ng-click="OpenChannelModel()"> <i class="mdi-18px mdi mdi-information-outline" aria-hidden="true"></i></a>';
                    }
                },
                series: model.highChartseriesData
            });
        }
        /**Pie Chart plot option */
        if (model.type === 'pie') {
            Highcharts.chart($element[0], {
                chart: {
                    width: 300,
                    height: 530,
                    backgroundColor: '#f4f4f4',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: model.type
                },
                title: {
                    text: model.title
                },
                tooltip: {
                    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> <br> Amount: <b>{point.y}$<b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        size: 180,
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                legend: {
                    align: 'left',
                    itemMarginTop: 5,
                    itemMarginBottom: 5,
                    symbolHeight: 14,
                    symbolWidth: 16,
                    symbolRadius: 0,
                    useHTML: true,
                    itemStyle: {
                        fontWeight: 'bold',
                        fontSize: "14px"
                    },
                    labelFormatter: function () {
                        return '<span  class="legend-item__section legend-item__title" title="' + this.name + '">' + this.name + '</span>';
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Percentage',
                    colorByPoint: true,
                    data: model.highChartseriesData
                }]
            });
        }

    });

    module.controller('InstructorRevenueReportController', function ($state, $scope, RevenueReports, MonthRevenueReports, $cookies, MonthRevenueBeakDown, $filter, $rootScope, $location, md5) {
        /**
         * @ngdoc controller
         * @name InstructorRevenueReportController
         * @description
         * Revenue report of (teacher or Instructor)of he channels and month wise.
         *
         *
         **/
        var model = this;
        $rootScope.pageTitle = $filter("translate")("Revenue Report")+ " | " +$rootScope.settings['site.name'];
        $rootScope.dasboardActivetab = 'Revenue_report';
        //Assigning the value to the variable
        model.loader = true;
        model.DateFilterClose = DateFilterClose;
        //Declaring the Variable
        model.RevenueReportsValue = [];
        model._metadata = [];
        $scope.channel = {};
        var today = new Date();
        model.RevenueReportsUpdate = $filter('date')(Date.parse(today), "MMM d, y");

        function DateInit() {
            model.picker1 = {
                datepickerOptions: {
                    maxDate: new Date(),
                }
            };
            model.picker2 = {
                datepickerOptions: {
                    maxDate: new Date(),
                }
            };
        }

        function getRevenueReports() {
            //to get the revenue report for all channels
            model.ChannelAreaShow = false;
            $scope.categories = [];
            var checked = [],
                temp_Channel_Data = [],
                temp_channels = [];
            $scope.AreaSeriesData = [];
            model.loading = true;
            params = {};
            if ($scope.channel.start_date !== undefined && $scope.channel.start_date !== null && $scope.channel.end_date !== null && $scope.channel.end_date !== undefined) {
                params.start_date = $scope.channel.start_date;
                params.end_date = $scope.channel.end_date;
            }
            RevenueReports.get(params).$promise.then(function (response) {
                if (angular.isDefined(response.data)) {
                    model.RevenueReportsValue = response.data;
                    model.RevenueReportsTotalValue = response.metadata.lifetime;
                    angular.forEach(model.RevenueReportsValue.month, function (channel, month) {
                        $scope.categories.push(month);
                        angular.forEach(channel, function (value, key) {
                            if (!angular.isDefined(checked[key])) {
                                temp_channels.push(key);
                                checked[key] = [];
                                checked[key].data = [];
                                checked[key].data.push(parseFloat(value));
                            } else if (angular.isDefined(checked[key])) {
                                checked[key].data.push(parseFloat(value));
                            }
                        });
                    });
                    angular.forEach(temp_channels, function (value, key) {
                        temp_Channel_Data.push({
                            "name": value,
                            "data": checked[value].data
                        });
                    });

                    $scope.AreaSeriesData = temp_Channel_Data;
                    model.ChannelAreaShow = true;
                    model.loading = false;
                }
            });
        }

        function allRevenueMonth(element) {
            //to get the Revenue Breakdown of all Month
            model.loader = true;
            var params = {};
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            MonthRevenueReports.get(params).$promise.then(function (response) {
                model.months_revenuereport_list = response.data;
                angular.forEach(model.months_revenuereport_list, function (revenue_month) {
                    // Creating the month and year as id
                    var temp_month;
                    var temp_year;
                    if (parseInt(revenue_month.m) !== 12) {
                        temp_month = parseInt(revenue_month.m);
                        temp_year = parseInt(revenue_month.y);
                    } else {
                        temp_month = 0;
                        temp_year = parseInt(revenue_month.y) + 1;
                    }
                    revenue_month.Expected_date = $filter('date')(Date.parse(new Date(temp_year, temp_month, 15)), "MMM d, y");
                    revenue_month.id = revenue_month.m.split("").reverse().join("") + '' + revenue_month.y.split("").reverse().join("");
                });
                $scope._metadata = response._metadata;
                model.currentPage = response._metadata.currentPage;
                model.loader = false;
                if (element !== null && angular.isDefined(element)) {
                    $('html, body').animate({
                        scrollTop: $(element).offset().top
                    }, 1500, 'swing', false);
                }
            });
        }
        var unwatchMinMaxValues = $scope.$watch(function () {
            // to get the start and end date
            return [model.picker1, model.picker2];
        }, function () {
            if ((model.picker1.date !== null && model.picker1.date !== undefined) || (model.picker2.date !== undefined && model.picker2.date !== null)) {
                model.picker1.datepickerOptions.maxDate = model.picker2.date;
                model.picker2.datepickerOptions.minDate = model.picker1.date;
            }
            if (model.picker1.date !== null && model.picker2.date !== null && model.picker1.date !== undefined && model.picker2.date !== undefined) {
                $scope.channel.start_date = $filter('date')(Date.parse(model.picker1.date), 'yyyy-MM-dd');
                $scope.channel.end_date = $filter('date')(Date.parse(model.picker2.date), 'yyyy-MM-dd');
                getRevenueReports();
            }
        }, true);

        function DateFilterClose() {
            model.date_filter = false;
            DateInit();
            $scope.channel = {};
            getRevenueReports();
        }
        $scope.paginate = function (element) {
            // paginate for revenue report for month wise
            model.currentPage = parseInt(model.currentPage);
            allRevenueMonth(element);
        };
        $scope.index = function (element) {
            DateInit();
            getRevenueReports();
            allRevenueMonth(element);
        };

        //Init function
        $scope.index(null);


    });
    module.controller('InstructorRevenueReportMonth', function ($scope, $cookies, MonthRevenueReports, $uibModal, $filter, $rootScope, RevenueExport, flash, $state, User) {
        /**
         * @ngdoc controller
         * @name InstructorRevenueReportController
         * @description
         * Revenue report of particular month.
         *
         *
         **/
        $rootScope.pageTitle = $filter("translate")("Revenue Report")+ " | " +$rootScope.settings['site.name'];
        var model = this;
        model.export = {};
        model.currentSlide = 'Purchases';
        model.slideChange = slideChange;
        model.EarningReport_show = false;
        model.Show_exportform = false;
        model.Total_EarningspieData = [];
        model.Earning_Course_pieData = [];
        model.Total_promotion_pieData = [];
        var months = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'June', '07': 'July', '08': 'Aug', '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

        function totalEarningEachMonth(month, year) {
            // get the particular month from the cookies and getting the details based on the month
            if ($state.params.id !== null && $state.params.id !== undefined && $state.params.id !== '') {
                getUser();
                var revenue = $state.params.id;
                model.revenue_detail = {
                    'Month': revenue.slice(0, 2).split("").reverse().join(""),
                    'Year': revenue.slice(2).split("").reverse().join(""),
                    'MonthWord': months[revenue.slice(0, 2).split("").reverse().join("")]
                };
                if (model.revenue_detail.MonthWord === undefined || model.revenue_detail.MonthWord === null) {
                    $state.go("revenueReport");
                    return false;

                }
                var params = {};
                params.month = model.revenue_detail.Month;
                params.year = model.revenue_detail.Year;
                MonthRevenueReports.get(params).$promise.then(function (response) {
                    model.month_revenuereport = response.data;
                    if (response.error.code === 0) {
                        if (model.month_revenuereport.Total_Earnings !== undefined && model.month_revenuereport.Total_Earnings !== null) {
                            angular.forEach(model.month_revenuereport.Total_Earnings, function (Total_Earningvalue, Total_Earningkey) {
                                model.Total_EarningspieData.push({
                                    "name": Total_Earningkey,
                                    "y": parseFloat(Total_Earningvalue),
                                    // "sliced": true
                                });
                            });
                        }
                        if (model.month_revenuereport.Promotion_Activity !== undefined && model.month_revenuereport.Promotion_Activity !== null) {
                            angular.forEach(model.month_revenuereport.Promotion_Activity, function (Promotion_Activity_value, Promotion_Activitykey) {
                                model.Total_promotion_pieData.push({
                                    "name": Promotion_Activitykey,
                                    "y": parseFloat(Promotion_Activity_value),
                                    // "sliced": true
                                });
                            });
                            console.log();
                            if (model.Total_promotion_pieData.length > 0) {
                                model.promotion_activity_show = true;
                            } else {
                                model.promotion_activity_show = false;
                            }
                        }
                        if (model.month_revenuereport.Earning_Course !== undefined && model.month_revenuereport.Earning_Course !== null) {
                            angular.forEach(model.month_revenuereport.Earning_Course, function (Earning_Course_value, Earning_Course_key) {
                                model.Earning_Course_pieData.push({
                                    "name": Earning_Course_key,
                                    "y": parseFloat(Earning_Course_value),
                                    // "sliced": true
                                });
                            });
                        }
                        model.EarningReport_show = true;
                    } else {
                        model.EarningReport_show = false;
                    }

                });
            } else {
                $state.go("revenueReport");
            }

        }

        function getUser() {
            if ($rootScope.auth) {
                User.getUser({
                    id: $rootScope.auth.id,
                    field: 'id,email',
                }).$promise
                    .then(function (response) {
                        if (response !== null && response !== undefined) {
                            if (response.data !== null && response.data !== undefined) {
                                if (response.data.length > 0) {
                                    if (response.data[0].email !== null && response.data[0].email !== undefined) {
                                        model.export.email = response.data[0].email;
                                    }
                                }
                            }
                        }

                    });
            }
        }
        model.ExportCSV = function ($valid) {
            //export csv of revenue report to the mail
            if ($valid) {
                if ($scope.revenuecookie !== null && $scope.revenuecookie !== undefined) {
                    model.export.month = $scope.revenuecookie.revenue_month.m;
                    model.export.year = $scope.revenuecookie.revenue_month.y;
                }
                RevenueExport.Create(model.export).$promise
                    .then(function (response) {
                        if (response.error.code === 0) {
                            flash.set("Export CSV file has been Sent to mail.", 'success', false);
                            model.Show_exportform = false;
                        } else {
                            flash.set("CSV file couldn't be sended. Pls try again later", 'error', false);
                        }
                    }, function (error) {
                        flash.set("Error occurred while sending CSV file. Pls try again later", 'error', false);
                    });
            }
        };

        function slideChange(type) {
            //to change slide based in the type(refund,purchases,redeemptions)
            model.currentSlide = type;
        }
        //Init function
        totalEarningEachMonth();
    });
    /**Revenue Break Down Report Directive */
    module.directive('revenueBreakDown', function () {
        /**
         * @ngdoc directive
         * @name revenueBreakDown
         * @description
         * revenue BreakDown for purchases, refunds,redemptions.
         *
         *
         **/
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/RevenueReports/revenueBreakDownReport.tpl.html',
            link: linker,
            controller: 'RevenueReportBreakDownController as model',
            bindToController: true,
            scope: {
                type: '@type',
            }
        };
    });
    module.controller('RevenueReportBreakDownController', function ($scope, $cookies, MonthRevenueBeakDown, $uibModal, $filter, $rootScope, $state, ConstCourseType) {
        /**
         * @ngdoc controller
         * @name RevenueReportBreakDownController
         * @description
         * revenue BreakDown for purchases, refunds,redemptions.
         *
         *
         **/
        var model = this;
        $scope.type = model.type;
        var months = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'June', '07': 'July', '08': 'Aug', '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
        model.loader = true;
        $rootScope.pageTitle = $filter("translate")("Revenue Report")+ " | " +$rootScope.settings['site.name'];

        function RevenueBreakdownPurchase() {
            //to get revenue BreakDown for purchases, refunds,redemptions
            model.loader = true;
            if ($state.params.id !== null && $state.params.id !== undefined && $state.params.id !== '') {
                var revenue = $state.params.id;
                model.revenue_detail = {
                    'Month': revenue.slice(0, 2).split("").reverse().join(""),
                    'Year': revenue.slice(2).split("").reverse().join(""),
                    'Month-Word': months[revenue.slice(0, 2).split("").reverse().join("")]
                };
                var params = {};
                params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
                params.month = model.revenue_detail.Month;
                params.year = model.revenue_detail.Year;
                params.type = model.type;
                MonthRevenueBeakDown.get(params).$promise.then(function (response) {
                    response.data = $filter('CountryTimezone')(response.data, ['created', 'booked_date'], 'TimeZoneSet', 'MMM d, y HH:mm:ss');
                    //  Checking the revenue based on the course types
                    model.break_down_Reports = response.data;
                    angular.forEach(model.break_down_Reports, function (report) {
                        if (report.course_batch_id !== null && report.course_batch_id !== undefined) {
                            report.instructor_shared_percentage = (!report.is_offline) ? report.webinar_shared_percentage : report.offline_shared_percentage;
                            report.course_type = (!report.is_offline) ?  ConstCourseType.online : ConstCourseType.onsite;
                        } else {
                            report.course_type =  ConstCourseType.video;
                            if (report.channel_id !== null) {
                                if (report.additional_information !== null && report.additional_information !== undefined) {
                                    report.instructor_shared_percentage = report.additional_information.channel[report.channel_id];
                                }

                            }
                        }
                        report.created_at = $filter('date')(Date.parse(report.created), 'MMMM d, y');
                        report.price = parseFloat(report.price) - parseFloat(report.discount_amount);
                        /*Main Course Instructor*/
                        if (report.is_student === true) {
                            report.main_instructor = true;
                            /*Checking Multiple instructor concept*/
                            if (report.additional_information !== null && report.additional_information !== undefined) {
                                if (report.additional_information.instructor !== null && report.additional_information.instructor !== undefined && report.additional_information.instructor_user !== null && report.additional_information.instructor_user !== undefined) {
                                    var instuctor_share_length = Object.keys(report.additional_information.instructor).length;
                                    var instuctor_details_length = Object.keys(report.additional_information.instructor_user).length;
                                    if (parseInt(instuctor_share_length) === parseInt(instuctor_details_length)) {
                                        report.multiple_instructor = true;
                                        report.multiple_instructors = [];
                                        angular.forEach(report.additional_information.instructor, function (value, user_id) {
                                            report.multiple_instructors.push({
                                                'username': report.additional_information.instructor_user[user_id],
                                                'original_sharing_percentage': report.additional_information.instructor[user_id]
                                            });
                                        });
                                    }
                                } else {
                                    report.multiple_instructor = false;
                                }
                            } else {
                                report.multiple_instructor = false;
                            }
                        } else {
                            report.main_instructor = false;
                        }
                        /*Updating Referral user percentage*/
                        if (report.referral_user_id !== undefined && report.referral_user_id !== null) {
                            report.referred_user_percentage = report.additional_information.referral[report.referral_user_id];
                        }
                    });

                    $scope._metadata = response._metadata;
                    model.currentPage = response._metadata.currentPage;
                    model.loader = false;
                }).catch(function () {
                    model.loader = false;
                });
            }
        }
        $scope.paginate = function (element) {
            //  Paginate for revenue BreakDown of purchases, refunds,redemptions
            model.currentPage = parseInt(model.currentPage);
            RevenueBreakdownPurchase();
        };

        $scope.modalBreakDown = function (e, Batch) {
            //Opening the Report Break Down  Model
            e.preventDefault();
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/RevenueReports/breakDownRevenue.tpl.html',
                size: 'md',
                windowClass: "revenuemodal",
                resolve: {
                    Batch: function () {
                        return Batch;
                    }
                },
                controller: function (Batch, $scope, $rootScope, $uibModalStack, $filter) {
                    var model = this;
                    $scope.breakdown_report = {};
                    if (Batch !== null && Batch !== undefined) {
                        //Format the date in the controller Note: Template formatting not supporting
                        $scope.breakdown_report = Batch;
                        $scope.breakdown_report.booked_date_at = $filter('date')(Date.parse($scope.breakdown_report.booked_date), 'MMMM d, y hh:mm a');
                    } else {
                        $scope.iserror = true;
                    }
                    $scope.InstructorDetails = function () {
                        $scope.isShowInstructor = !$scope.isShowInstructor;
                    };
                    $scope.modalClose = function (e) {
                        //model closing
                        e.preventDefault();
                        $uibModalStack.dismissAll();
                    };
                },
            });
        };
        //Init function
        RevenueBreakdownPurchase();
    });
})(angular.module('ace.revenue_report'));

(function (module) {
    /**
     * @ngdoc factory
     * @name RevenueReports,MonthRevenueReports,MonthRevenueBeakDown,RevenueExport
     * @description
     * To get the details about the revenue report of particular (instructor or teacher).
     *
     *
     **/
    module.factory('RevenueReports', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/reports/revenue_by_channels', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('MonthRevenueReports', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/reports/revenue_by_months', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('MonthRevenueBeakDown', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/reports/revenue_breakdown_by_each_month', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('RevenueExport', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/reports/export', {
                id: '@id'
            }, {
                'Create': {
                    method: 'POST'
                }
            }
        );
    });
})(angular.module("ace.revenue_report"));
