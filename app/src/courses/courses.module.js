(function(module) {
    module.config(function($stateProvider, $analyticsProvider) {
        var getToken = {
            'TokenServiceData': ['TokenService',function(TokenService) {
                return TokenService.promiseSettings;
            }]
        };
        $stateProvider
            .state('courses', {
                url: '/courses',
                views: {
                    'main@': {
                        controller: 'CoursesController as model',
                        templateUrl: 'courses/courses.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.courseWishlist']) && $ocLazyLoad.getModules().indexOf('ace.courseWishlist') === -1) {
                                    requiredPlugins.push(data['ace.courseWishlist']);
                                }
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('addCourse', {
                url: '/courses/add',
                views: {
                    'main@': {
                        controller: 'AddCourseController as model',
                        templateUrl: 'courses/addCourse.tpl.html'
                    }
                },
                data: {

                },
                resolve: getToken
            })
            .state('viewCourse', {
                url: '/course/{id}/{slug}?utm_source&utm_medium&utm_campaign&campaign_id',
                views: {
                    'main@': {
                        controller: 'ViewCourseController as model',
                        templateUrl: 'courses/viewCourse.tpl.html'
                    }
                },
                data: {
                    activetab: 'viewCourse'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.socialShare']) && $ocLazyLoad.getModules().indexOf('ace.socialShare') === -1) {
                                    requiredPlugins.push(data['ace.socialShare']);
                                }
                                if (angular.isDefined(data['ace.courseWishlist']) && $ocLazyLoad.getModules().indexOf('ace.courseWishlist') === -1) {
                                    requiredPlugins.push(data['ace.courseWishlist']);
                                }
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.CourseCheckout']) && $ocLazyLoad.getModules().indexOf('ace.CourseCheckout') === -1) {
                                    requiredPlugins.push(data['ace.CourseCheckout']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (angular.isDefined(data['ace.comments']) && $ocLazyLoad.getModules().indexOf('ace.comments') === -1) {
                                    requiredPlugins.push(data['ace.comments']);
                                }
                                if (angular.isDefined(data['ace.courseflags']) && $ocLazyLoad.getModules().indexOf('ace.courseflags') === -1) {
                                    requiredPlugins.push(data['ace.courseflags']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('browseCourse', {
                url: '/category/{category_id}/{slug}?query&price&instructionLevel&language&sort&type&feature&page',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'searchController as model',
                        templateUrl: 'courses/courses.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.courseWishlist']) && $ocLazyLoad.getModules().indexOf('ace.courseWishlist') === -1) {
                                    requiredPlugins.push(data['ace.courseWishlist']);
                                }
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('CourseSearch', {
                url: '/courses/search?category_id&query&price&instructionLevel&language&sort&type&feature&page',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'searchController as model',
                        templateUrl: 'courses/search.tpl.html'
                    }
                },
                data: {

                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('LearnCourse', {
                url: '/learn-course/{id:int}/{lesson:int}/{slug}?learn&is_preview',
                // url: '/{slug}/learn/{id}?lesson&learn&is_preview',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'learnCourseController as model',
                        templateUrl: 'courses/learnCourse.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.paymentandcart']) && $ocLazyLoad.getModules().indexOf('ace.paymentandcart') === -1) {
                                    requiredPlugins.push(data['ace.paymentandcart']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('LearnCourseEmpty', {
                url: '/learn-course/{id:int}/{slug}?learn&is_preview',
                // url: '/{slug}/learn/{id}?lesson&learn&is_preview',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'learnCourseController as model',
                        templateUrl: 'courses/learnCourse.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.paymentandcart']) && $ocLazyLoad.getModules().indexOf('ace.paymentandcart') === -1) {
                                    requiredPlugins.push(data['ace.paymentandcart']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })

            .state('myCoursesLearning', {
                url: '/my-courses/learning?ordering&type&q&feature&instructor&category_id',
                views: {
                    'main@': {
                        controller: 'learningController as model',
                        templateUrl: 'courses/learning.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('myCoursesTeaching', {
                url: '/my-courses/teaching?ordering&type&q',
                views: {
                    'main@': {
                        controller: 'teachingController as model',
                        templateUrl: 'courses/teaching.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('StudentFeedback', {
                url: '/my-courses/student-feedback',
                views: {
                    'main@': {
                        controller: 'studenFeedbackController as model',
                        templateUrl: 'courses/studentFeedback.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'student_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('CourseForum', {
                url: '/my-courses/forum?ordering&unanswered&unread&course_id',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'CourseForumController as model',
                        templateUrl: 'courses/courseForum.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'student_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('CourseReview', {
                url: '/my-courses/reviews?ordering&star&course_id$filter',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'CourseReviewController as model',
                        templateUrl: 'src/plugins/RatingAndReview/courseReview.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'student_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('CourseInstructorReview', {
                url: '/my-courses/instructor-reviews?ordering',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'CourseInstructorReviewController as model',
                        templateUrl: 'courses/courseInstructorReview.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'instructor_reviews'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('myCoursesWishlist', {
                url: '/my-courses/wishlist',
                views: {
                    'main@': {
                        controller: 'wishlistController as model',
                        templateUrl: 'courses/wishlist.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.courseWishlist']) && $ocLazyLoad.getModules().indexOf('ace.courseWishlist') === -1) {
                                    requiredPlugins.push(data['ace.courseWishlist']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('myCoursesgroup', {
                url: '/my-courses/groups',
                views: {
                    'main@': {
                        controller: 'myCourseGroupController as model',
                        templateUrl: 'src/plugins/Group/myCourseGroup.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.ratingAndReview']) && $ocLazyLoad.getModules().indexOf('ace.ratingAndReview') === -1) {
                                    requiredPlugins.push(data['ace.ratingAndReview']);
                                }
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.courseWishlist']) && $ocLazyLoad.getModules().indexOf('ace.courseWishlist') === -1) {
                                    requiredPlugins.push(data['ace.courseWishlist']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourse', {
                url: '/manage-course/add/{id}/{slug}',
                views: {
                    'main@': {
                        controller: 'manageCourseController as model',
                        templateUrl: 'courses/manageCourse.tpl.html'
                    }

                },
                data: {
                    activetab: 'course_roadmap'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseRoadmap', {
                url: '/manage-course/edit-getting-started/{id}',
                views: {
                    'main@': {
                        controller: 'manageCourseController as model',
                        templateUrl: 'courses/manageCourse.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_roadmap'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseFeedback', {
                url: '/manage-course/edit-status/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseFeedbackController as model',
                        templateUrl: 'courses/manageCourseFeedback.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseManagement', {
                url: '/manage-course/edit-management/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseManagementController as model',
                        templateUrl: 'courses/manageCourseManagement.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_management'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseSchedule', {
                url: '/manage-course/schedule/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseScheduleController as model',
                        templateUrl: 'courses/manageCourseSchedule.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_schedule'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageOfflineCourse', {
                url: '/manage-course/onsite-schedule/{id}',
                views: {
                    'main@': {
                        controller: 'offlineCourseController as model',
                        templateUrl: 'src/plugins/OfflineCourse/offlineCourse.tpl.html'
                    }
                },
                data: {
                    activetab: 'onsite_schedule'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageWebinarCourse', {
                url: '/manage-course/online-schedule/{id}',
                views: {
                    'main@': {
                        controller: 'webinarCourseController as model',
                        templateUrl: 'src/plugins/WebinarCourses/webinarCourse.tpl.html'
                    }
                },
                data: {
                    activetab: 'online_schedule'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageDemoSessionCourse', {
                url: '/manage-course/demo-schedule/{id}',
                views: {
                    'main@': {
                        controller: 'demoSessionCourseController as model',
                        templateUrl: 'courses/manageCourseDemoSession.tpl.html'
                    }
                },
                data: {
                    activetab: 'demo_schedule'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageH2kFeedbackCourse', {
                url: '/manage-course/edit-h2k-feedback/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseh2kFeedbackController as model',
                        templateUrl: 'courses/manageCourseH2kFeedback.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_h2k_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseGoals', {
                url: '/manage-course/edit-goals-and-audience/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseGoalsController as model',
                        templateUrl: 'courses/manageCourseGoals.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_goals'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseCurriculum', {
                url: '/manage-course/edit-curriculum/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseCurriculumController as model',
                        templateUrl: 'courses/manageCourseCurriculum.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_curriculum'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.articlelesson']) && $ocLazyLoad.getModules().indexOf('ace.articlelesson') === -1) {
                                    requiredPlugins.push(data['ace.articlelesson']);
                                }
                                if (angular.isDefined(data['ace.videolesson']) && $ocLazyLoad.getModules().indexOf('ace.videolesson') === -1) {
                                    requiredPlugins.push(data['ace.videolesson']);
                                }
                                if (angular.isDefined(data['ace.downloadblefilelesson']) && $ocLazyLoad.getModules().indexOf('ace.downloadblefilelesson') === -1) {
                                    requiredPlugins.push(data['ace.downloadblefilelesson']);
                                }
                                if (angular.isDefined(data['ace.videoembedorexternallesson']) && $ocLazyLoad.getModules().indexOf('ace.videoembedorexternallesson') === -1) {
                                    requiredPlugins.push(data['ace.videoembedorexternallesson']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseCurriculumCodingExercise', {
                url: '/manage-course/edit-curriculum/{id}/add-Coding-exercise',
                views: {
                    'main@': {
                        controller: 'ManageCodingExerciseController as model',
                        templateUrl: 'src/plugins/CodingExercise/CodingExerciseForm.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_curriculum'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.articlelesson']) && $ocLazyLoad.getModules().indexOf('ace.articlelesson') === -1) {
                                    requiredPlugins.push(data['ace.articlelesson']);
                                }
                                if (angular.isDefined(data['ace.videolesson']) && $ocLazyLoad.getModules().indexOf('ace.videolesson') === -1) {
                                    requiredPlugins.push(data['ace.videolesson']);
                                }
                                if (angular.isDefined(data['ace.downloadblefilelesson']) && $ocLazyLoad.getModules().indexOf('ace.downloadblefilelesson') === -1) {
                                    requiredPlugins.push(data['ace.downloadblefilelesson']);
                                }
                                if (angular.isDefined(data['ace.videoembedorexternallesson']) && $ocLazyLoad.getModules().indexOf('ace.videoembedorexternallesson') === -1) {
                                    requiredPlugins.push(data['ace.videoembedorexternallesson']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseCurriculumEditCodingExercise', {
                url: '/manage-course/edit-curriculum/{id}/edit-Coding-exercise/{lesson_id}',
                views: {
                    'main@': {
                        controller: 'ManageCodingExerciseEditController as model',
                        templateUrl: 'src/plugins/CodingExercise/CodingExerciseFormEdit.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_curriculum'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.articlelesson']) && $ocLazyLoad.getModules().indexOf('ace.articlelesson') === -1) {
                                    requiredPlugins.push(data['ace.articlelesson']);
                                }
                                if (angular.isDefined(data['ace.videolesson']) && $ocLazyLoad.getModules().indexOf('ace.videolesson') === -1) {
                                    requiredPlugins.push(data['ace.videolesson']);
                                }
                                if (angular.isDefined(data['ace.downloadblefilelesson']) && $ocLazyLoad.getModules().indexOf('ace.downloadblefilelesson') === -1) {
                                    requiredPlugins.push(data['ace.downloadblefilelesson']);
                                }
                                if (angular.isDefined(data['ace.videoembedorexternallesson']) && $ocLazyLoad.getModules().indexOf('ace.videoembedorexternallesson') === -1) {
                                    requiredPlugins.push(data['ace.videoembedorexternallesson']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseBasics', {
                url: '/manage-course/edit-basics/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseBasicsController as model',
                        templateUrl: 'courses/manageCourseBasics.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_basics'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseSummary', {
                url: '/manage-course/edit-details/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseSummaryController as model',
                        templateUrl: 'courses/manageCourseSummary.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_summary'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseImage', {
                url: '/manage-course/edit-image/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseImageController as model',
                        templateUrl: 'courses/manageCourseImage.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_image'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCoursePromoVideo', {
                url: '/manage-course/edit-promo-video/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCoursePromoVideoController as model',
                        templateUrl: 'courses/manageCoursePromoVideo.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_promo_video'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCoursePrice', {
                url: '/manage-course/edit-price-and-promotions/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCoursePriceController as model',
                        templateUrl: 'courses/manageCoursePrice.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_price'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }

                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseDangerZone', {
                url: '/manage-course/edit-danger-zone/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseDangerZoneController as model',
                        templateUrl: 'courses/manageCourseDangeZone.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_danger_zone'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })

        .state('manageCourseHelp', {
                url: '/manage-course/edit-help/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseHelpController as model',
                        templateUrl: 'courses/manageCourseHelp.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_help'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseEnrolled', {
                url: '/manage-course/enrolled-students/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseEnrolledController as model',
                        templateUrl: 'courses/manageCourseEnrolled.tpl.html'
                    }
                },
                data: {
                    activetab: 'students_enrolled'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseAutomatedMessage', {
                url: '/manage-course/edit-automated-message/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseAutomatedMessageController as model',
                        templateUrl: 'courses/manageCourseAutomatedMessage.tpl.html'
                    }
                },
                data: {
                    activetab: 'automated_message'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('CourseAnnouncement', {
                url: '/courses/announcement',
                views: {
                    'main@': {
                        controller: 'CourseAnnouncementController as model',
                        templateUrl: 'courses/courseAnnouncement.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseStudentList', {
                url: '/manage-course/edit-Student-list/{id}',
                views: {
                    'main@': {
                        controller: 'ManageCourseStudentListController as model',
                        templateUrl: 'courses/manageCourseStudentList.tpl.html'
                    }
                },
                data: {
                    activetab: 'student_list'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('manageCourseAnalytics', {
                url: '/manage-course/edit-course-analaytics/{id}',
                views: {
                    'main@': {
                        controller: 'CourseAnalyticsController as model',
                        templateUrl: 'src/plugins/CourseAnalytics/courseAnalytics.tpl.html'
                    }
                },
                data: {
                    activetab: 'course_analytics'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('InstructorRevenueReportMonth', {
                url: '/Revenue-Report/:id',
                views: {
                    'main@': {
                        controller: 'InstructorRevenueReportMonth as model',
                        templateUrl: 'src/plugins/RevenueReports/revenueReportMonth.tpl.html'
                    }
                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.revenue_report']) && $ocLazyLoad.getModules().indexOf('ace.revenue_report') === -1) {
                                    requiredPlugins.push(data['ace.revenue_report']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            //Learning page modules
            .state('LearnCourseview', {
                url: '/learn/{course_user_id}/{type}',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'learnerCourseDashboardController as model',
                        templateUrl: 'courses/learnerCourseDashboard.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.paymentandcart']) && $ocLazyLoad.getModules().indexOf('ace.paymentandcart') === -1) {
                                    requiredPlugins.push(data['ace.paymentandcart']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            })
            .state('LearnQuestionView', {
                url: '/learn/{course_user_id}/{type}/{question_id}',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'QuestionAnswerViewController as model',
                        templateUrl: 'src/plugins/QA/QuestionView.tpl.html'
                    }

                },
                data: {},
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.paymentandcart']) && $ocLazyLoad.getModules().indexOf('ace.paymentandcart') === -1) {
                                    requiredPlugins.push(data['ace.paymentandcart']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            }).state('InstructorQuestions', {
                url: '/teaching/qa?ordering&unanswered&unread&course_id&unresponded',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'InstructorQuestionsController as model',
                        templateUrl: 'src/plugins/QA/InstructorQuestion.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'student_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            }).state('AssignmentInstructor', {
                url: '/teaching/assignment?course_id&ordering&filter',
                reloadOnSearch: false,
                views: {
                    'main@': {
                        controller: 'AssignmentInstructor as model',
                        templateUrl: 'src/plugins/Assignment/AssignmentInstructor.tpl.html'
                    }
                },
                data: {
                    dasboardActivetab: 'assignment_feedback'
                },
                resolve: {
                    TokenServiceData: ['$ocLazyLoad', 'TokenService', '$rootScope', '$q', function($ocLazyLoad, TokenService, $rootScope, $q) {
                        var promise = TokenService.promise;
                        var promiseSettings = TokenService.promiseSettings;
                        return $q.all({
                            TokenServiceData: TokenService.promise,
                            load: promiseSettings.then(function(data) {
                                var requiredPlugins = [];
                                if (angular.isDefined(data['ace.userprofile']) && $ocLazyLoad.getModules().indexOf('ace.userprofile') === -1) {
                                    requiredPlugins.push(data['ace.userprofile']);
                                }
                                if (angular.isDefined(data['ace.instructor']) && $ocLazyLoad.getModules().indexOf('ace.instructor') === -1) {
                                    requiredPlugins.push(data['ace.instructor']);
                                }
                                if (requiredPlugins.length > 0) {
                                    return $ocLazyLoad.load(requiredPlugins, {
                                        cache: true
                                    });
                                } else {
                                    return '';
                                }
                            })
                        });
                    }]
                }
            });
    });
}(angular.module('ace.courses', [
    'ui.router',
    'ngResource',
    'ace.common',
    'OcLazyLoad',
    'angulartics',
    'angulartics.klaviyo',
    'angulartics.google.analytics',
    // 'angulartics.google.tagmanager',
    // 'angulartics.facebook.pixel',
    'ace.home'
])));
