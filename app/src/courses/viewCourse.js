(function (module) {
    module.controller('ViewCourseController', function ($state, $window, ViewCourse, User, $rootScope, TakeCourse, $location, Slug, $scope, $uibModal, $anchorScroll, flash, $filter, AddFavourite, DeleteFavouriteByCourseId, $sce, $document, CourseTraffic, ManageCoursePrivacy, $uibModalStack, GetCourseUserEntry, CourseType, ConstProfileSocialLink, $analytics, ConstCurrencies) {
        var model = this;
        /*Checking Whether Course Valid and returning to error page */
        if (angular.isDefined($state.params.id) && $state.params.id !== '' && !isNaN(parseInt($state.params.id))) {
            model.courseValid_id = true;
        } else {
            model.courseValid_id = false;
            $location.path('/error/404');
        }
        model.input_type = "password";
        var referrer = $document.getReferrer();
        model.loader = true;
        model.CoursePaswordSubmit = CoursePaswordSubmit;
        model.course = {};
        model.loading = true;
        $scope.WhatActionsStudentsHaveToPerformBeforeBegin = [];
        $scope.whoShouldTakeThisCourseAndWhoShouldNot = [];
        $scope.studentsWillBeAbleTo = [];

        model.startCollapsed = {
            'Description': true,
            'Feature': true,
            'Certificate': true,
            'Reviews': true,
            'FAQ': true,
            'Instructor': true,
            'Projects': true,
            'Curriculum': true
        };
        $rootScope.activeMenu = 'library';
        userID = $rootScope.auth ? $rootScope.auth.id : '';
        $scope.currentUrl = $location.absUrl();

        function init() {
            getCourseDetails();
            course_user();
            Course_Traffic();
        }

        function course_user() {
            if ($rootScope.isAuth) {
                GetCourseUserEntry.get({
                    course_id: $state.params.id,
                    user_id: userID
                }).$promise
                    .then(function (response) {
                        if (response.data.length > 0) {
                            model.couse_users = response.data;
                            var sucesscount = 0;
                            angular.forEach(model.couse_users, function (course_user) {
                                if (sucesscount < 1) {
                                    if (parseInt(course_user.course_id) === parseInt($state.params.id)) {
                                        if (course_user.course_batch_id === null || course_user.course_batch_id === undefined) {
                                            model.course_pruchased = true;
                                            model.course_user_id = course_user.id;
                                            sucesscount++;
                                        } else {
                                            model.course_pruchased = false;
                                        }
                                    }
                                }
                            });
                        } else {
                            model.course_pruchased = false;
                        }
                    });
            }
        }

        function getCourseDetails() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                ViewCourse.get({
                    id: $state.params.id,
                }).$promise
                    .then(function (response) {
                        if (response.data.length > 0) {
                            if (response.data[0].privacy_id === ManageCoursePrivacy.Protected) {
                                $scope.modalPasswordModel();
                            } else {
                                model.course = getCourse();
                            }
                        } else {
                            $location.path('/error/404');
                        }
                    });
            }
        }

        function CoursePaswordSubmit($valid) {
            if ($valid) {
                getCourse('password');
            }
        }
        // Converting the video timing
        function secondsToTime(secs) {
            var times = secs.toString().split(".");
            var cminutes = times[0];
            var cseconds = times[1];
            secs = parseInt(cseconds, 10) + (parseInt(cminutes, 10) * 60);

            var hours = Math.floor(secs / (60 * 60));
            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            var obj = {
                "h": hours,
                "m": minutes,
                "s": seconds
            };
            return obj;
        }

        function getCourse(type) {
            model.loader = true;
            var current_date = new Date();
            var current_month = current_date.getMonth();
            var current_year = current_date.getFullYear();
            model.loading = true;
            var Coursepassword = (model.password !== null && model.password !== undefined) ? model.password : null;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                ViewCourse.get({
                    id: $state.params.id,
                    password: Coursepassword
                }).$promise
                    .then(function (response) {
                        if (response.error.code === 0 && response.data.length > 0) {
                            model.course = response.data[0];
                            model.course.modified = $filter('CountryTimezone')(model.course.modified, null, 'TimeZoneSet');
                            $uibModalStack.dismissAll();
                            if (angular.isUndefined(response.data[0].id)) {
                                $location.path('/error/404');
                            }
                            if (angular.isDefined(response.data[0].video_url)) {
                                model.course.video_url = response.data[0].video_url;
                            }
                            //Checking the Video duration
                            if (model.course.total_video_duration !== null && model.course.total_video_duration !== undefined && model.course.total_video_duration !== 0) {
                                var videodetails = secondsToTime(model.course.total_video_duration);
                                var times = model.course.total_video_duration.toString().split(".");
                                var cminutes = times[0];
                                var cseconds = times[1];
                                secs = parseInt(cseconds, 10) + (parseInt(cminutes, 10) * 60);
                                if (secs < 60) {
                                    model.course.video_duration = videodetails.s + ' '+$filter("translate")("seconds");
                                } else if (secs > 60 && secs < 3600) {
                                    model.course.video_duration = videodetails.m + '.' + videodetails.s + ' '+$filter("translate")("minutes");
                                } else {
                                    model.course.video_duration = videodetails.h + '.' + videodetails.m + ' '+$filter("translate")("hours");
                                }
                            } else {
                                model.course.video_duration = 0;
                            }
                            model.course.coursetype = {};
                            if (response.data[0].course_options !== undefined && response.data[0].course_options !== null && response.data[0].course_options !== '') {
                                response.data[0].course_options.split(',')
                                    .forEach(function (e) {
                                        if (e == CourseType.video) {
                                            model.course.coursetype.video = true;
                                        } else if (e == CourseType.onsite) {
                                            model.course.coursetype.onsite = true;
                                        } else if (e == CourseType.online) {
                                            model.course.coursetype.online = true;
                                        } else {
                                            model.course.coursetype = {};
                                        }
                                    });
                            }
                            //SEO
                            $rootScope.pageTitle = model.course.title + " | " + $rootScope.settings['site.name'];
                            $rootScope.metaDescription = model.course.meta_description == '' || model.course.meta_description == null? model.course.subtitle : model.course.meta_description;
                            $rootScope.metaKeywords = model.course.meta_keywords;
                            $rootScope.metaImage = 'img/big_thumb/Course/'+model.course.image_hash;
                            $rootScope.canonical = $rootScope.site_url+'course/'+model.course.id+'/'+encodeURI(model.course.slug.toLowerCase());
                            
                            var audienceList = [];
                            $(model.course.who_should_take_this_course_and_who_should_not).find('li').each(function( index ) {
                                audienceList.push($( this ).text());
                            });                                                              

                            if( audienceList.length == 0 ){
                                var audience = model.course.who_should_take_this_course_and_who_should_not.replace(/<\/?[^>]+(>|$)/g, "");
                            } else {
                                var audience = audienceList;
                            }
                            var dl = [{
                                "isAccessibleForFree":model.course.price == 0?true:false,
                                "inLanguage":model.course.language_name == 'Arabic'?'ar':'en',
                                "name": model.course.title,
                                "image": $rootScope.site_url+ 'img/big_thumb/Course/'+model.course.image_hash,
                                "provider":{
                                    "name":model.course.displayname,
                                    "@type":"Organization",
                                    "sameAs": $rootScope.site_url + "instructor/"+ model.course.user_id+"/"+window.encodeURIComponent(Slug.slugify(model.course.displayname.toLowerCase()))
                                },
                                "audience":{
                                    "@type":"Audience",
                                    "audienceType":audience
                                },
                                "@context": "http://schema.org/",
                                "creator":[
                                    {
                                    "name":model.course.displayname,
                                    "@type":"Person"
                                    }
                                ],
                                "publisher":{
                                    "name":$rootScope.settings['site.name'],
                                    "@type":"Organization",
                                    "sameAs":$rootScope.site_url
                                },
                                "@type":"Course",
                                "about":{
                                    "name":model.course.parent_category_name
                                },
                                "description":model.course.meta_description == '' || model.course.meta_description == null? model.course.subtitle : model.course.meta_description,
                                "@id":encodeURI($rootScope.site_url+'course/'+model.course.id+'/'+model.course.slug.toLowerCase())
                            },{
                                "description":model.course.meta_description == '' || model.course.meta_description == null? model.course.subtitle : model.course.meta_description,
                                "name":model.course.title,
                                "@type":"Product",
                                "@context":"http://schema.org"
                            }];
                            if(model.course.total_rating > 0){
                                dl[0].aggregateRating = {
                                    "worstRating":0.5,
                                    "reviewCount":model.course.total_rating,
                                    "bestRating":5,
                                    "ratingValue":model.course.average_rating,
                                    "@type":"AggregateRating"
                                };                               
                                dl[1].aggregateRating = {
                                    "worstRating":0.5,
                                    "reviewCount":model.course.total_rating,
                                    "bestRating":5,
                                    "ratingValue":model.course.average_rating,
                                    "@type":"AggregateRating"
                                };
                            } 
          
                            $rootScope.ld = dl;


                            // {
                                
                            //     "@context":"https://schema.org",
                            //     "@type":"BreadcrumbList",
                            //     "itemListElement":[{
                            //         "@type":"ListItem",
                            //         "position":1,
                            //         "item":{
                            //             "@id":$rootScope.site_url,
                            //             "name":"Home"
                            //         }
                            //     },
                            //     {
                            //         "@type":"ListItem",
                            //         "position":2,
                            //         "item":{
                            //             "@id":$rootScope.site_url + 'category/'+ model.course.category_id + '/'+ window.encodeURIComponent(Slug.slugify(model.course.parent_category_name.toLowerCase())),
                            //             "name":model.course.parent_category_name
                            //         }
                            //     },
                            //     {
                            //         "@type":"ListItem",
                            //         "position":3,
                            //         "item":{
                            //             "@id":encodeURI($rootScope.site_url+'course/'+model.course.id+'/'+model.course.slug),
                            //             "name":model.course.title
                            //         }
                            //     }]

                            // }
                            $scope.studentsWillBeAbleTo = (response.data[0].students_will_be_able_to) ? response.data[0].students_will_be_able_to : '';
                            $scope.whoShouldTakeThisCourseAndWhoShouldNot = (response.data[0].who_should_take_this_course_and_who_should_not) ? response.data[0].who_should_take_this_course_and_who_should_not : '';
                            $scope.WhatActionsStudentsHaveToPerformBeforeBegin = (response.data[0].what_actions_students_have_to_perform_before_begin) ? response.data[0].what_actions_students_have_to_perform_before_begin : '';
                            model.course.course_campaign = false;
                            if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1 && model.course.coursetype.video === true) {
                                /*Checking whether campaign plugin is enabled*/
                                if (model.course.course_campaigns !== null && model.course.course_campaigns !== undefined && model.course.price > 0) {
                                    var FixedCampaignExist = false;
                                    angular.forEach(model.course.course_campaigns, function (course_campaign) {
                                        /*Many campaign will occur and come in course_campaigns array. but for site promotion 'yes' and discont type='fixed or percentage' amount need change.if both fixed and percentage will occurred means priority given to fixed campaign.*/
                                        if (!FixedCampaignExist) {
                                            if (course_campaign.discount_type === "percentage" && course_campaign.is_site_promotions === true) {
                                                if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                                    /*Checking whether multicurrency  plugin is enabled*/
                                                    model.course.price = $filter('multicurrency')(model.course.tier_id, model.course.price);
                                                    model.course.original_price = parseFloat(model.course.price - percentCalculation(model.course.price, course_campaign.discounted_amount));
                                                } else {
                                                    model.course.original_price = parseFloat(model.course.price - percentCalculation(model.course.price, course_campaign.discounted_amount));
                                                }
                                                model.course.course_campaign = true;
                                                model.course.campaign_id = course_campaign.id;
                                            }
                                            if (course_campaign.discount_type === 'fixed' && course_campaign.is_site_promotions === true) {
                                                if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                                    /*Checking whether multicurrency  plugin is enabled*/
                                                    model.course.original_price = $filter('multicurrencydiscount')(null, course_campaign.discounted_amount, 'yes');
                                                } else {
                                                    model.course.original_price = course_campaign.discounted_amount;
                                                }
                                                model.course.course_campaign = true;
                                                model.course.campaign_id = course_campaign.id;
                                                FixedCampaignExist = true;
                                            }
                                        }

                                    });
                                }
                            }

                            //Analytics
                            var item = {
                               category: model.course.category_name, 
                               title: model.course.title,
                               id: model.course.id,
                               image_url: $rootScope.site_url+'img/big_thumb/Course/'+model.course.image_hash,
                               url: encodeURI($rootScope.site_url+'course/'+model.course.id+'/'+model.course.slug.toLowerCase()),
                               author: model.course.displayname
                            };


                            //if discount is avilable 
                            if(model.course.course_campaign) {
     
                                if($rootScope.settings.geoIP.symbol && $rootScope.settings.geoIP.symbol != ConstCurrencies.Default){
                                    item.price = model.course.price*parseFloat($rootScope.settings.geoIP.rate);
                                    item.original_price = model.course.original_price*parseFloat($rootScope.settings.geoIP.rate);
                                } else {
                                    item.price = model.course.price;
                                    item.original_price = model.course.original_price;
                                }
                            } else {
                                if($rootScope.settings.geoIP.symbol && $rootScope.settings.geoIP.symbol != ConstCurrencies.Default){
                                  item.price = model.course.price*parseFloat($rootScope.settings.geoIP.rate);
                                } else {
                                  item.price = model.course.price;
                                }
                                
                            }
                            $analytics.eventTrack('Viewed Product', item);


                            $scope.disqusConfig = {
                                disqus_shortname: $rootScope.settings['disqus.comments.shortname'],
                                disqus_identifier: model.course.id,
                                disqus_title: model.course.title,
                                disqus_url: $scope.currentUrl
                            };
                            model.loading = false;
                            if (angular.isDefined(model.course.user_id)) {
                                User.getUser({
                                    id: model.course.user_id,
                                    field: 'twitter_profile_link,google_plus_profile_link,facebook_profile_link,youtube_profile_link,website,linkedin_profile_link,biography'
                                }).$promise
                                    .then(function (response) {
                                        if (response !== null && response !== undefined) {
                                            if (response.data !== null && response.data !== undefined) {
                                                if (angular.isDefined(response.data[0])) {
                                                    if (response.data.length > 0) {
                                                        model.user_profile = response.data[0];
                                                        if (model.user_profile.facebook_profile_link !== null && model.user_profile.facebook_profile_link !== undefined) {
                                                            model.user_profile.facebook_profile_link = ConstProfileSocialLink.facebook + '' + model.user_profile.facebook_profile_link;
                                                        }
                                                        if (model.user_profile.twitter_profile_link !== null && model.user_profile.twitter_profile_link !== undefined) {
                                                            model.user_profile.twitter_profile_link = ConstProfileSocialLink.twitter + '' + model.user_profile.twitter_profile_link;
                                                        }
                                                        if (model.user_profile.google_plus_profile_link !== null && model.user_profile.google_plus_profile_link !== undefined) {
                                                            model.user_profile.google_plus_profile_link = ConstProfileSocialLink.google + '' + model.user_profile.google_plus_profile_link;
                                                        }
                                                        if (model.user_profile.linkedin_profile_link !== null && model.user_profile.linkedin_profile_link !== undefined) {
                                                            model.user_profile.linkedin_profile_link = ConstProfileSocialLink.linkedin + '' + model.user_profile.linkedin_profile_link;
                                                        }
                                                        if (model.user_profile.youtube_profile_link !== null && model.user_profile.youtube_profile_link !== undefined) {
                                                            model.user_profile.youtube_profile_link = ConstProfileSocialLink.youtube + '' + model.user_profile.youtube_profile_link;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                    });
                            }
                        } else {
                            if (type === 'password') {
                                flashMessage = $filter("translate")("Invalid password. Please enter valid password.");
                                flash.set(flashMessage, 'error', false);
                            } else {
                                $location.path('/error/404');
                            }
                        }
                        model.loader = false;
                    }, function (error) {
                        if (error.status === 404) {
                            $scope.$emit('updateParent', {
                                isOn404: true,
                                errorNo: error.status
                            });
                        } else {
                            if (type === 'password') {
                                flashMessage = $filter("translate")("Oops, there seems to be an unknown error. Please try again later.");
                                flash.set(flashMessage, 'error', false);
                            }
                        }
                    });
            } else {
                $scope.$emit('updateParent', {
                    isOn404: true,
                    errorNo: 404
                });
            }
        }
        $scope.AddBatch = function (batch_id, index) {
            if (model.course.course_batches !== undefined && model.course.course_batches !== null) {
                angular.forEach(model.course.course_batches, function (batch) {
                    batch.is_enrolled = false;
                });
            }
            model.course.course_batches[index].is_enrolled = true;
            model.batch_id = batch_id;
        };
        $scope.gotoAnchorLink = function (id) {
            /*e.preventDefault();*/
            /*var old = $location.hash();*/
            $location.hash(id);
            $anchorScroll();
           /* $location.hash(old);*/
        };
        $scope.startCollapsed = function (type) {
            angular.forEach(model.startCollapsed, function (value, key) {
                model.startCollapsed[key] = true;
            });
            model.startCollapsed[type] = false;
        };
        //Percentage calulcation
        function percentCalculation(a, b) {
            var c = (parseFloat(a) * parseFloat(b)) / 100;
            return parseFloat(c);
        }

        function Course_Traffic() {
            if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1) {
                //Campaigns plugin is enabled. Sending the campaign details
                if (($state.params.utm_source !== null && !angular.isUndefined($state.params.utm_source) && $state.params.utm_source !== "") && ($state.params.utm_medium !== null && !angular.isUndefined($state.params.utm_medium) && $state.params.utm_medium !== "") && ($state.params.utm_campaign !== null && !angular.isUndefined($state.params.utm_campaign) && $state.params.utm_campaign !== "") && ($state.params.campaign_id !== null && !angular.isUndefined($state.params.campaign_id) && $state.params.campaign_id !== "")) {
                    var course_campaign = { 'utm_campaign': $state.params.utm_campaign, 'utm_medium': $state.params.utm_medium, 'utm_source': $state.params.utm_source, 'campaign_id': $state.params.campaign_id, 'type': 'others', 'course_id': $state.params.id };
                    $rootScope.$emit('UpdateParentCampaign', {
                        campaign: course_campaign,
                    });
                }

            }


            //Getting the traffix using JQUERY Referrer segment
            course_traffic = { course_id: $state.params.id, url: referrer, utm_source: $state.params.utm_source, utm_medium: $state.params.utm_medium, utm_term: $state.params.term, utm_content: $state.params.content, utm_campaign: $state.params.campaign, utm_segment: $state.params.gclid };

            // course_traffic = { course_id: $state.params.id, url: referrer, utm_source: source, utm_medium: medium, utm_term: term, utm_content: content, utm_campaign: campaign, utm_segment: gclid };
            if (angular.isDefined($.cookie('campaign'))) {
                course_traffic = JSON.parse($.cookie('campaign'));
                course_traffic.course_id = $state.params.id;
                if (course_traffic.type == 'referral') {
                    delete course_traffic.channel_id;
                }
                delete course_traffic.type;
            }
            CourseTraffic.create(course_traffic).$promise
                .then(function (response) { })
                .catch(function (error) { })
                .finally();
        }
        $scope.modalPasswordModel = function (e) {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: 'courses/coursePassword.tpl.html',
                    size: 'sm',
                    windowClass: "custombackdrop",
                    backdrop: 'static',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                        var module = data['ace.socialLogin'];
                                        return $ocLazyLoad.load(module, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;

                }, function (result) {
                    $rootScope.modal = false;

                }).finally(function () {
                    $rootScope.modal = false;
                    // handle finally
                });
                $rootScope.modal = true;
            }
        };
        if (model.courseValid_id === true) {
            init();
        }
    });
    module.directive("owlCarouselReleated", function () {
        return {
            restrict: 'E',
            transclude: false,
            link: function (scope) {
                scope.initCarousel = function (element) {
                    // provide any default options you want
                    var defaultOptions = {
                        responsiveClass: true,
                        margin: 30,
                        responsive: {
                            0: {
                                items: 1,
                                nav: false,
                                dots: true,
                            },
                            600: {
                                items: 1,
                                nav: false,
                                dots: true,
                            },
                            1000: {
                                items: 1,
                                nav: false,
                                loop: false,
                                dots: true,

                            }
                        }
                    };
                    $(element).owlCarousel(defaultOptions);
                    $('#Couse_category').owlCarousel({
                        loop: true,
                        margin: 40,
                        responsiveClass: true,
                        responsive: {
                            0: {
                                items: 1,
                                nav: false
                            },
                            600: {
                                items: 1,
                                nav: false
                            },
                            1000: {
                                items: 1,
                                nav: false,
                                loop: false
                            }
                        }
                    });
                };

            }
        };
    });
    module.directive('owlCarouselItemReleated', [function () {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element) {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }]);
} (angular.module("ace.courses")));
