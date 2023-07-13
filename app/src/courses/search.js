(function (module) {

    module.controller('searchController', ['$state', 'Course', '$scope', 'Common', 'InstructionLevels', 'GetLanguages', '$location', '$rootScope', '$filter', 'CourseType', '$timeout', 'Slug', function ($state, Course, $scope, Common, InstructionLevels, GetLanguages, $location, $rootScope, $filter, CourseType, $timeout, Slug) {
        var model = this;
        $scope.rendering = 0;
        $scope.categories_add = {};
        $scope.instruction_add = {};
        $scope.language_add = {};
        $scope.currentCategory = {};
        $scope.originalTitle = '';
        model.courses = [];
        model.common = [];
        $scope.noFiltersUsed = false;
        $scope.slug = '';
        $scope.hsearchVal = '';
        filter_parent = "parent";
        $scope.CourseType = CourseType;
        $rootScope.$emit('updateParentSearchQuery', {
            Query: decodeURIComponent($state.params.query)
        });

        if($rootScope.isMobile){

        }


        $scope.$on('$locationChangeSuccess', function () {
            model.loader = true;
            $scope.categories_add = {};
            $scope.instruction_add = {};
            $scope.language_add = {};
            $scope.searchingCourseCategory = $state.params.category_id ? parseInt($state.params.category_id) : '';
            $scope.searchingCoursePrice = $state.params.price ? $state.params.price : '';
            $scope.searchingCourseLanguage = $state.params.language ? parseInt($state.params.language) : '';
            $scope.searchingInstructionLevel = $state.params.instructionLevel ? parseInt($state.params.instructionLevel) : '';
            $scope.searchingText = $state.params.query ? decodeURIComponent($state.params.query) : '';
            $rootScope.activeMenu = 'library';
            $scope.sortValue = $state.params.sort ? $state.params.sort : '';
            $scope.query = $state.params.query ? $state.params.query : '';
            $scope.currentPage = ($state.params.page !== undefined) ? parseInt($state.params.page) : 1;
            $scope.index('#search_results');
        });

        //$rootScope.canonical = `${$rootScope.site_url}course/${model.course.id}/${model.course.slug}`;


        //SEO
        if($state.params.category_id != undefined && $state.params.slug != undefined){
          Common.get({
              id: $state.params.category_id,
              limit: "1",
              field: "id,name,description,parent_category_name"
          }).$promise.then(function (response) {

              if(response.data[0].parent_category_name != '' && response.data[0].parent_category_name != null && response.data[0].parent_category_name != undefined){
                $rootScope.pageTitle = $scope.title =  response.data[0].parent_category_name + ' - ' + response.data[0].name + " | " +  $rootScope.settings['site.name'];
                $scope.title = response.data[0].parent_category_name + ' - ' + response.data[0].name;
              } else {
                $rootScope.pageTitle = $scope.title = response.data[0].name + " | " +  $rootScope.settings['site.name'];
                $scope.title = response.data[0].name;
              }
              $scope.originalTitle = $rootScope.pageTitle;
              $scope.slug = Slug.slugify(response.data[0].name);
              $rootScope.metaDescription = response.data[0].description;
              $scope.currentCategory = response.data[0];
              updateSEO();

             
              $scope.description = response.data[0].description; 
              $scope.rendering++;
          });
        }

        Common.get({
            category_type: filter_parent,
            limit: "all",
            field: "id,sub_category_name"
        }).$promise.then(function (response) {
            model.common.parentCategories = response;
        });

        InstructionLevels.get({
            limit: 'all',
            field: 'name,id'
        }).$promise
            .then(function (response) {
                model.InstructionLevels = response.data;
            });

        GetLanguages.get({
            limit: 'all',
            field: 'name,id'
        }).$promise.then(function (response) {
            model.languages = response.data;
            $scope.rendering++;
                
        });

        $scope.$watch('rendering', function (value) {
          if(value >= 2){
            $rootScope.status = 'ready';  
          }
        });

        function updateSEO(){
            if($state.params.category_id == undefined && $state.params.slug == undefined){
                $('meta[name=robots]').remove();
                $('head').append('<meta name="robots" content="noindex,follow"/>');
                var que = $state.params.query ? decodeURIComponent($state.params.query) : '';
                if(que == ''){
                    $scope.originalTitle =  $filter("translate")("Browse all courses") +   " | " +  $rootScope.settings['site.name'];
                    $rootScope.pageTitle =  $scope.originalTitle;
                } else {
                    $scope.originalTitle =  $filter("translate")("You searched for")+ ' ' + que + " | " +  $rootScope.settings['site.name'];
                    $rootScope.pageTitle =  $scope.originalTitle;
                }


                if($scope._metadata){

                       // if first page and number of pages > 1 , show next  
                      if(parseInt($scope._metadata.currentPage)  == 1 && $scope._metadata.noOfPages > 1) {
                        $rootScope.canonical = encodeURI($rootScope.site_url + $state.href('CourseSearch').replace('/', '') );
                        $rootScope.prev = false;
                        $rootScope.next = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:2}).replace('/', '') );
                        $rootScope.pageTitle = $scope.originalTitle;
                      }

                      // if current page > 1 and current page < number of pages, show next and prev
                      if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) < $scope._metadata.noOfPages) {
                        $rootScope.canonical = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:parseInt($scope._metadata.currentPage)}).replace('/', '')  );
                        $rootScope.prev = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:(parseInt($scope._metadata.currentPage)-1)}).replace('/', '')  );
                        $rootScope.next = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:(parseInt($scope._metadata.currentPage)+1)}).replace('/', '') );   
                        $rootScope.pageTitle = $scope.originalTitle + " - " + $filter("translate")("Page") + " " + parseInt($scope._metadata.currentPage);
                      }   

                      // if current page > 1 and current page == number of pages, show prev
                      if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) == $scope._metadata.noOfPages) {
                        $rootScope.canonical = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:parseInt($scope._metadata.currentPage)}).replace('/', '')  );
                        $rootScope.prev = encodeURI($rootScope.site_url + $state.href('CourseSearch', {page:(parseInt($scope._metadata.currentPage)-1)}).replace('/', '')  );
                        $rootScope.next = false;
                        $rootScope.pageTitle = $scope.originalTitle + " - " + $filter("translate")("Page") + " " + parseInt($scope._metadata.currentPage);
                      }
                      
                } else {
                    $rootScope.canonical = encodeURI($rootScope.site_url + $state.href('CourseSearch').replace('/', '') );
                    $rootScope.pageTitle = $scope.originalTitle;
                }
                $rootScope.status = 'ready';

                return false;
            }

            if($scope._metadata){
                    // console.log("fired 2");
                  // if(parseInt($scope._metadata.currentPage)  > 1) {
                  //   $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name)+ '?page=' + parseInt($scope._metadata.currentPage) );
                  // } else {
                  //   $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) );
                  // }

                   // if first page and number of pages > 1 , show next  
                  if(parseInt($scope._metadata.currentPage)  == 1 && $scope._metadata.noOfPages > 1) {
                    $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) );
                    $rootScope.prev = false;
                    $rootScope.next = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) + '?page=2' );
                    $rootScope.pageTitle = $scope.originalTitle;
                  }
                  // if current page > 1 and current page < number of pages, show next and prev
                  if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) < $scope._metadata.noOfPages) {
                    $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name)+ '?page=' + parseInt($scope._metadata.currentPage) );
                    $rootScope.prev = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) + '?page=' + (parseInt($scope._metadata.currentPage)-1) );
                    $rootScope.next = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) + '?page=' + (parseInt($scope._metadata.currentPage)+1) );
                           
            
                    $rootScope.pageTitle = $scope.originalTitle + " - " + $filter("translate")("Page") + " " + parseInt($scope._metadata.currentPage);
              
                    
                  }              
                  // if current page > 1 and current page == number of pages, show prev
                  if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) == $scope._metadata.noOfPages) {
                    $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name)+ '?page=' + parseInt($scope._metadata.currentPage) );
                    $rootScope.prev = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) + '?page=' + (parseInt($scope._metadata.currentPage)-1) );
                    $rootScope.next = false;


                    $rootScope.pageTitle = $scope.originalTitle + " - " + $filter("translate")("Page") + " " + parseInt($scope._metadata.currentPage);
                       
                  }
            } else {
                $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + $scope.currentCategory.id +'/' + Slug.slugify($scope.currentCategory.name) );
                $rootScope.pageTitle = $scope.originalTitle;
            }
        }

        

        function getCourses(element) {
            model.loader = true;
            $scope.currentPage = ($state.params.page !== undefined) ? parseInt($state.params.page) : 1;
            $scope.filter = ($scope.filter !== undefined) ? $scope.filter : (($state.params.filter !== undefined) ? $state.params.filter : "");
            $scope.query = ($scope.query !== undefined) ? $scope.query : (($state.params.query !== undefined) ? $state.params.query : "");
            var params = {};
            params.page = $scope.currentPage;
            params.q = decodeURIComponent($scope.query);
            val = $state.params.query ? decodeURIComponent($state.params.query) : '';
            $scope.csearchVal = val;
            $scope.type = $state.params.type;
            $scope.feature = $state.params.feature;
            if ($state.params.category_id !== undefined && $state.params.category_id !== "") {
                params.category_id = $state.params.category_id;
                var c = $state.params.category_id;
                c.split(',')
                    .forEach(function (e) {
                        $scope.categories_add[e] = true;
                    });
            }
            if ($state.params.language !== undefined && $state.params.language !== "") {
                params.language_id = $state.params.language;
                var l = $state.params.language;
                l.split(',')
                    .forEach(function (e) {
                        $scope.language_add[e] = true;
                    });
            }
            if ($state.params.instructionLevel !== undefined && $state.params.instructionLevel !== "") {
                params.instructional_level_id = $state.params.instructionLevel;
                var i = $state.params.instructionLevel;
                i.split(',')
                    .forEach(function (e) {
                        $scope.instruction_add[e] = true;
                    });
            }
            if ($state.params.feature === 'closed_captions') {
                params.closed_captions = 1;
            } else if ($state.params.feature === 'quiz') {
                params.quiz = 1;

            } else if ($state.params.feature === 'coding_exercises') {
                params.coding_exercises = 1;
            } else if ($state.params.feature === 'assignment') {
                params.is_assignment = 1;
            } else if ($state.params.feature === 'practise_test') {
                params.is_practice_test = 1;
            }
            if ($state.params.sort) {
                if ($state.params.sort === 'reviews') {
                    params.sort = 'average_rating';
                    params.sort_by = 'DESC';
                }
                if ($state.params.sort === 'id') {
                    params.sort = 'id';
                    params.sort_by = 'DESC';
                }
                if ($state.params.sort === "ASC" || $state.params.sort === "DESC") {
                    params.sort = 'price';
                    params.sort_by = $state.params.sort;
                }
                if ($state.params.sort === 'popular') {
                    params.sort = 'course_user_count';
                    params.sort_by = 'DESC';
                }
                if ($state.params.sort === 'featured') {
                    params.filter = 'is_featured';
                    params.sort_by = 'DESC';
                }
            }
            if ($state.params.price) {
                params.priceType = $state.params.price;
            }
            if ($scope.searchingCourseCategory === '' && $scope.searchingCoursePrice === '' && $scope.searchingCourseLanguage === '' && $scope.searchingInstructionLevel === '' && $scope.searchingText === '') {
                $scope.noFiltersUsed = true;
            }
            params.course_type_id = $scope.CourseType[$state.params.type];
            params.limit = 15;
            params.is_frontend = 1;
            params.field = 'id,title,slug,subtitle,price,image_hash,user_id,displayname,is_from_mooc_affiliate,course_image,average_rating,active_online_course_lesson_count,instructional_level_name,user_image_hash,course_user_count,parent_category_name,category_name,category_id,parent_category_id,instructional_level_id,designation,currency_id,tier_id,course_campaigns,course_options';
            Course.get(params).$promise.then(function (response) {
                $scope.currentPage = params.page;
                if (response.data) {
                    model.courses = response;
                    angular.forEach(model.courses.data, function (course) {
                        course.coursetype = {};
                        if (course.course_options !== undefined && course.course_options !== null && course.course_options !== '') {
                            course.course_options.split(',')
                                .forEach(function (e) {
                                    if (e == CourseType.video) {
                                        course.coursetype.video = true;
                                    } else if (e == CourseType.onsite) {
                                        course.coursetype.onsite = true;
                                    } else if (e == CourseType.online) {
                                        course.coursetype.online = true;
                                    } else {
                                        course.coursetype = {};
                                    }
                                });
                        }
                        course.course_campaign = false;
                        if (course.course_campaigns !== null && course.course_campaigns !== undefined && course.coursetype.video === true && course.price > 0) {
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
                    $scope._metadata = response._metadata;
                    // if($scope._metadata) {

                    //   // if first page and number of pages > 1 , show next  
                    //   if(parseInt($scope._metadata.currentPage)  == 1 && $scope._metadata.noOfPages > 1) {
                    //     $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) );
                    //     $rootScope.prev = false;
                    //     $rootScope.next = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) + '?page=2' );
                    //   }
                    //   // if current page > 1 and current page < number of pages, show next and prev
                    //   if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) < $scope._metadata.noOfPages) {
                    //     $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name)+ '?page=' + parseInt($scope._metadata.currentPage) );
                    //     $rootScope.prev = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) + '?page=' + (parseInt($scope._metadata.currentPage)-1) );
                    //     $rootScope.next = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) + '?page=' + (parseInt($scope._metadata.currentPage)+1) );
                    //   }              
                    //   // if current page > 1 and current page == number of pages, show prev
                    //   if(parseInt($scope._metadata.currentPage) > 1 && parseInt($scope._metadata.currentPage) == $scope._metadata.noOfPages) {
                    //     $rootScope.canonical = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name)+ '?page=' + parseInt($scope._metadata.currentPage) );
                    //     $rootScope.prev = encodeURI($rootScope.site_url + 'category/' + response.data[0].id +'/' + Slug.slugify(response.data[0].name) + '?page=' + (parseInt($scope._metadata.currentPage)-1) );
                    //     $rootScope.next = false;
                    //   }
                    // }
                    
                    updateSEO();

                    model.courseLength = response.data.length;
                    model.loader = false;
                    if(model.courseLength > 0){
                        var courses = [];
                        response.data.map(function(course){
                            courses.push({
                                "@type":"Product",
                                "@id":encodeURI($rootScope.site_url+'course/'+course.id+'/'+course.slug.toLowerCase()),
                                "name":course.title,
                                "url":encodeURI($rootScope.site_url+'course/'+course.id+'/'+course.slug.toLowerCase())
                            });
                        });
                        // var BreadcrumbList = [];
                        // BreadcrumbList.push({
                        //     "@type":"ListItem",
                        //     "position":1,
                        //     "item":{
                        //         "@id":$rootScope.site_url,
                        //         "name":"Home"
                        //     }
                        // });                        
                        // BreadcrumbList.push({
                        //     {
                        //         "@type":"ListItem",
                        //         "position":2,
                        //         "item":{
                        //             "@id":$rootScope.site_url,
                        //             "name":"Home"
                        //         }
                        //     }
                        // });
                        $rootScope.ld = {
                            "@context":"https://schema.org/",
                            "@graph":[
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
                                // },
                                {
                                    "@context":"https://schema.org/",
                                    "@graph":courses
                                }
                            ]
                        };
                    }


                }
            }).then(function(){
                // if($rootScope.isMobile){
                //     var clone = $('aside').clone();
                //     if(clone.length > 0){
                //         $('aside').remove();
                //         $("#subMenu").html(clone);
                //     }
  
                // }
            });
        }
        /** For multiple option in check form */
        $scope.Searchcategory = function (type) {
            $scope.currentPage = 1;
            $scope.category_row = $scope.getChecked($scope.categories_add);
            $scope.category_row = ($scope.category_row.length !== 0) ? $scope.category_row.join() : null;
            $scope.instruction_row = $scope.getChecked($scope.instruction_add);
            $scope.instruction_row = ($scope.instruction_row.length !== 0) ? $scope.instruction_row.join() : null;
            $scope.language_row = $scope.getChecked($scope.language_add);
            $scope.language_row = ($scope.language_row.length !== 0) ? $scope.language_row.join() : null;
            $location.path('/courses/search')
                .search('page', $scope.currentPage)
                .search('category_id', $scope.category_row)
                .search('instructionLevel', $scope.instruction_row)
                .search('language', $scope.language_row);
        };
        $scope.getChecked = function (obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push(key);
                }
            }
            return checked;
        };
        //Percentage calulcation
        function percentCalculation(a, b) {
            var c = (parseFloat(a) * parseFloat(b)) / 100;
            return parseFloat(c);
        }
        $scope.index = function (element) {
            $scope.currentPage = 1;
            getCourses(element);
        };
        $scope.goToState = function (state, params) {
            $state.go(state, params);
        };
        $scope.paginate = function (element) {
            $scope.currentPage = parseInt($scope.currentPage);
            if ($scope.query !== undefined && $scope.query !== "") {
                $location.search('page', $scope.currentPage)
                    .search('query', $scope.query);
            } else {
                $location.search('page', $scope.currentPage);
            }
        };
        $scope.index(null);

        $scope.$on("$destroy", function(){
            delete $rootScope.prev;
            delete $rootScope.next;
        });
    }]);
} (angular.module("ace.courses")));
