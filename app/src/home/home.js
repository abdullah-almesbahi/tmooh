(function(module) {
    module.controller('HomeController', function($scope, $state, $rootScope, FreeTrailFormData, $location, TokenServiceData, $filter, $timeout, isMobile) {
        var model = this;
        $scope.isMobile = isMobile.phone || isMobile.tablet;
    
        function init() {
            if (angular.isUndefined($rootScope.channel)) {
                $timeout(function() {
                    init();
                }, 100);
            } else {
                if (($state.params.utm_source === 'referral') && ($state.params.utm_medium === 'site') && ($state.params.utm_campaign !== null && !angular.isUndefined($state.params.utm_campaign) && $state.params.utm_campaign !== "") && angular.isUndefined($state.params.campaign_id)) {
                    var course_campaign = { 'utm_campaign': $state.params.utm_campaign, 'utm_medium': $state.params.utm_medium, 'utm_source': $state.params.utm_source, 'type': 'referral', 'channel_id': $rootScope.channel.Referral };
                    $rootScope.$emit('UpdateParentCampaign', {
                        campaign: course_campaign,
                    });
                }
            }

        }
        $scope.CoursequerySearch = function (query) {
            if (query !== "undefined" && query !== null && query !== undefined) {
                query = query;
            } else {
                query = '';
            }
            $timeout(function () {
                $state.go('CourseSearch', {
                    query: encodeURIComponent(query),
                }, {
                        reload: true
                    });
            }, 100);
        };
        //Campaign Cookies updating parent
        model.freetrail = [];
        model.claimFreeTrail = claimFreeTrail;

        function claimFreeTrail(FreeTrailFormValues) {
            FreeTrailFormData.set(FreeTrailFormValues);
            $location.path('/users/signup');
        }

        $scope.goToState = function(state, params) {
            $state.go(state, params);
        };
        $rootScope.pageTitle =  $rootScope.settings['site.name'] +  " | " + $filter("translate")("Platform offer online courses in various fields") ;
        $rootScope.metaDescription = $rootScope.settings['meta.meta_description'];
        $rootScope.metaKeywords = $rootScope.settings['meta.keywords'];
        $rootScope.metaImage = 'assets/apple-touch-icon-114x114.png';
        $rootScope.ld = [{
            "@context": "http://schema.org/",
            "@type": "WebSite",
            "@id":"#website",
            "url": $rootScope.site_url,
            "name": $rootScope.settings['site.name'],
            "image": $rootScope.site_url+ 'assets/apple-touch-icon-114x114.png',
            "description": $rootScope.metaDescription,
            "potentialAction":{
                "@type":"SearchAction",
                "target":$rootScope.site_url + "courses/search?query={search_term_string}",
                "query-input":"required name=search_term_string"
            }
        },{
            "@context":"https://schema.org",
            "@type":"Organization",
            "url":$rootScope.site_url,
            "sameAs":[
              "https://www.facebook.com/tmoohco",
              "https://www.instagram.com/tmoohco/",
              // "https://www.linkedin.com/company/1414157/",
              "https://www.youtube.com/c/Tmoohco",
              "https://www.pinterest.com/tmoohco/",
              "https://plus.google.com/+Tmoohco",
              "https://twitter.com/tmoohco"
            ],
            "@id":$rootScope.site_url + "#organization",
            "name":$rootScope.settings['site.name'],
            "logo":$rootScope.site_url+ 'assets/apple-touch-icon-114x114.png'

        }];
        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.active = 0;
        init();

    });
    //Owl corrousel not working in angular.So we are triggering using the below directives
    //we need to write a individual directive then only owl corrousel will trigger.triggering using element  will not working
    // module.directive("owlCarousel", function() {
    //     return {
    //         restrict: 'E',
    //         transclude: false,
    //         link: function(scope) {
    //             $('#popularcourse').owlCarousel({
    //                     loop: true,
    //                     margin: 5,
    //                     responsiveClass: true,
    //                     responsive: {
    //                         0: {
    //                             items: 1,
    //                             nav: true,
    //                             dots: false,
    //                         },
    //                         600: {
    //                             items: 3,
    //                             nav: true,
    //                             dots: false,
    //                         },
    //                         1000: {
    //                             items: 6,
    //                             nav: true,
    //                             loop: false,
    //                             dots: false,
    //                         }
    //                     }
    //                 });
    //             /*    $(element).owlCarousel(defaultOptions);*/
    //         }
    //     };
    // });
    module.directive("owlCarouselReviews", function() {
        return {
            restrict: 'E',
            transclude: false,
            link: function(scope) {
                scope.initCarousel = function(element) {
                    var defaultOptions = {
                        loop: true,
                        responsiveClass: true,
                        margin: 22,
                        responsive: {
                            0: {
                                items: 1,
                                nav: true
                            },
                            600: {
                                items: 2,
                                nav: true
                            },
                            1000: {
                                items: 3,
                                nav: true,
                                loop: false
                            }
                        }
                    };
                    /*$(element).owlCarousel(defaultOptions);*/
                };

            }
        };
    });
    module.directive('owlCarouselItem', [function() {
        return {
            restrict: 'A',
            transclude: false,
            link: function(scope, element) {
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }]);
}(angular.module("ace.home")));
