(function (module) {
    module.directive('homeCourse', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
            HeaderVideo.init({
              container: $('.header-video'),
              header: $('.header-video--media'),
              videoTrigger: $("#video-trigger"),
              autoPlayVideo: true
            });

        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/homeCourse.tpl.html',
            link: linker,
            controller: 'homeCourseController as model',
            bindToController: true,
            scope: {
                course: '=homeCourse',
                lookups: '=courseLookups',
                filter: '@filter',
                title: '@title',
                active: '@active',
                limit: '@limit'
            }
        };
    });

    module.directive('owlCarousel', function($rootScope, $timeout) {
      return {
        restrict: 'A',
        scope: {
          carouselInit: '&'
        },
        link: function(scope, element, attrs) {
          if ((scope.$parent != null) && scope.$parent.$last) {
            var main = $(element.parent());
            if(main.hasClass("notloaded")){
                $timeout(function() {
                      main.removeClass('notloaded').addClass('loaded');
                      main.owlCarousel({
                      // $($scope.idx).owlCarousel({
                        center: true,
                        items: 5,
                        loop: true,
                        // autoWidth:false,
                        // margin: 0,
                        rtl: true,
                        nav:true,
                        dots:false,
                        slideBy:5,
                        responsive: {
                          0: {
                            items: 2
                          },
                          767: {
                            items: 3
                          },
                          1000: {
                            items: 5
                          },
                          1400: {
                            items: 5
                          }
                        }
                      });
                      if($( ".loaded" ).length == 4){
                        $rootScope.status = 'ready';   
                      }       
                }, 1000);
              
            }
            // console.log("www",scope, element, attrs);
            // $(scope)
            // return scope.carouselInit()();
          }
        }
      };
    });

    module.controller('homeCourseController', function (Course, Common, $scope, $rootScope, AddFavourite, $filter) {
        var model = this;
        filter = model.filter;
        $scope.title = model.title;
        $scope.active = model.active;
        $scope.filter = model.filter;
        model.loader = true;
        limit = model.limit;
        model.common = [];
        params = {};

        function getHomeCourse(q) {
            model.loader = true;
            if (filter === 'most_popular') {
                params.sort = 'course_user_count';
                params.sort_by = 'DESC';
                params.limit = limit;
            }
            if (filter === 'learner_recommended') {
                params.sort = 'total_rating';
                params.sort_by = 'DESC';
                params.limit = limit;
            }
            if (filter === 'featured') {
                params.sort = 'is_featured';
                params.sort_by = 'DESC';
                params.limit = limit;
                // params.filter = 'is_featured';  
            }
            if (filter === 'new') {
                params.sort = 'id';
                params.sort_by = 'DESC';
                params.limit = limit;
            }
            params.field = 'id,title,slug,user_id,displayname,image_hash,is_from_mooc_affiliate,course_image,average_rating,currency_id,tier_id,price,course_view_count,course_campaigns,course_user_count,total_video_duration,subtitle';
            model.homeCourse = [];
            params.category_id = ($scope.category_id !== null && $scope.category_id !== undefined) ? $scope.category_id : null;
            if (q !== null && q !== undefined && q !== "") {
                angular.element('#js-search')
                    .addClass('loading');
                params.q = q;
            } else {
                params.q = null;
            }

            Course.get(params).$promise.then(function (response) {
                model.loader = false;
                model.homeCourse = response;
                angular.forEach(model.homeCourse.data, function (course) {
                    course.course_campaign = false;
                    if (course.course_campaigns !== null && course.course_campaigns !== undefined && course.price > 0) {
                        var FixedCampaignExist = false;
                        angular.forEach(course.course_campaigns, function (course_campaign) {
                            if (!FixedCampaignExist) {
                                /*Many campaign will occur and come in course_campaigns array. but for site promotion 'yes' and discont type='fixed or percentage' amount need change.if both fixed and percentage will occurred means priority given to fixed campaign.*/
                                if (course_campaign.discount_type === "percentage" && course_campaign.is_site_promotions === true) {
                                    if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                        /*Checking whether multicurrency  plugin is enabled*/
                                        course.price = $filter('multicurrency')(course.tier_id, course.price);
                                        course.original_price = parseFloat(course.price - percentCalculation(course.price, course_campaign.discounted_amount));
                                    } else {
                                        course.original_price = parseFloat(course.price - percentCalculation(course.price, course_campaign.discounted_amount));
                                    }
                                    course.course_campaign = true;
                                }
                                if (course_campaign.discount_type === 'fixed' && course_campaign.is_site_promotions === true) {
                                    if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                        /*Checking whether multicurrency  plugin is enabled*/
                                        course.original_price = $filter('multicurrencydiscount')(null, course_campaign.discounted_amount, 'yes');
                                    } else {
                                        course.original_price = course_campaign.discounted_amount;
                                    }
                                    course.course_campaign = true;
                                    FixedCampaignExist = true;
                                }
                            }

                        });
                    }
                });
                if (q !== null && q !== undefined && q !== "") {
                    angular.element('#js-search')
                        .removeClass('loading');
                }
            });
        }


        //Percentage calulcation
        function percentCalculation(a, b) {
            var c = (parseFloat(a) * parseFloat(b)) / 100;
            return parseFloat(c);
        }
        function getParentCategory() {
            filter_parent = "parent";
            Common.get({
                category_type: filter_parent,
                limit: "all",
                filter: "active",
                field: "id,sub_category_name"
            }).$promise.then(function (response) {
                model.common.parentCategories = response;
            });
        }

        $scope.CategoryFilter = function (id) {
            $scope.category_id = id;
            getHomeCourse(model.csearchVal);
        };
        $scope.myFunction = function (event) {
            if (event.keyCode === 13 || event.type === 'click') {
                getHomeCourse(model.csearchVal);
            }
        };
        // model.carouselInitializer = function() {
        //
        //     $(".owl-carousel").owlCarousel({
        //     // $($scope.idx).owlCarousel({
        //       // center: true,
        //       items: 5,
        //       // loop: true,
        //       // autoWidth:false,
        //       // margin: 0,
        //       rtl: true,
        //       nav:true,
        //       dots:false,
        //       slideBy:5,
        //       responsive: {
        //         0: {
        //           items: 2
        //         },
        //         767: {
        //           items: 3
        //         },
        //         1000: {
        //           items: 5
        //         },
        //         1400: {
        //           items: 5
        //         }
        //       }
        //     });
        //
        //
        // };
        /**Init function calling  */
        getParentCategory();
        getHomeCourse();
    });
})(angular.module('ace.courses'));
