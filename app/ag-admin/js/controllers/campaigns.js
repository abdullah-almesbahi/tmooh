
angular.module('base')
    .controller('CampaignController', function ($scope, $http, notification, $state, $window, $filter, Campaigns, $location, Campaign) {
        $scope.format = 'yyyy-MM-dd';
        $scope.campaign = {};
        $scope.channel_needed = true;
        $scope.opened = {};
        if ($state.params.id !== null && $state.params.id !== undefined && $state.params.id !== '') {
            $scope.edit_field = true;
            Campaign.get({ id: $state.params.id, sort: 'id', sort_by: 'DESC' }, function (response) {
                if (response.error.code === 0) {
                    $scope.campaign = response.data[0];
                    $scope.campaign.discounted_amount = parseInt(response.data[0].discounted_amount);
                    $scope.campaign.channel_id = parseInt(response.data[0].channel_id);
                    $scope.campaign.is_site_promotions = (response.data[0].is_site_promotions === true) ? 'true' : 'false';
                    $scope.campaign.is_course_campaigns_inserted = (response.data[0].is_course_campaigns_inserted === true) ? 'true' : 'false';
                    $scope.tmp_start_date = new Date(response.data[0].start_date);
                    $scope.tmp_end_date = new Date(response.data[0].end_date);
                    $scope.sitePromotionValidation();
                } else {
                    $location.path('/campaigns/list');
                }
            });
        } else {
            $scope.edit_field = false;
        }
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
        $scope.datePickerOpen = function (datepicker) {
            $scope.opened[datepicker] = true;
        };
        $scope.sitePromotionValidation = function () {
            if ($scope.campaign.is_site_promotions !== undefined && $scope.campaign.is_site_promotions !== null) {
                if ($scope.campaign.is_site_promotions == 'true') {
                    $scope.channel_needed = false;
                } else {
                    $scope.channel_needed = true;
                }
            }
        };
        $scope.CampaignSubmit = function ($valid) {
            if ($valid) {
                $scope.campaign.start_date = $filter('date')(Date.parse($scope.tmp_start_date), "yyyy-MM-dd");
                $scope.campaign.end_date = $filter('date')(Date.parse($scope.tmp_end_date), "yyyy-MM-dd");
                if ($scope.campaign.end_date >= $scope.campaign.start_date) {
                    if (!$scope.channel_needed) {
                        delete $scope.campaign.channel_id;
                    }
                    if ($state.params.id !== null && $state.params.id !== undefined && $state.params.id !== '') {
                        delete $scope.campaign.channel_name;
                        Campaign.update({ id: $state.params.id }, $scope.campaign, function (response) {
                            if (response.error.code === 0) {
                                notification.log('Data saved successfully', {
                                    addnCls: 'humane-flatty-success'
                                });
                                $location.path('/campaigns/list');
                            } else {
                                notification.log(response.error.message, {
                                    addnCls: 'humane-flatty-error'
                                });
                            }
                        });
                    } else {
                        Campaigns.create($scope.campaign, function (response) {
                            if (response.error.code === 0) {
                                notification.log('Data saved successfully', {
                                    addnCls: 'humane-flatty-success'
                                });
                                $location.path('/campaigns/list');
                            } else {
                                notification.log(response.error.message, {
                                    addnCls: 'humane-flatty-error'
                                });
                            }
                        });
                    }

                } else {
                    notification.log('Start Date should be equal (or) less than End date ', {
                        addnCls: 'humane-flatty-success'
                    });
                }
            }


        };
        getChannelList();
    });
