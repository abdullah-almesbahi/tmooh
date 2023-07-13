/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {

} (angular.module('ace.userprofile', [
    'ngResource'
])));

(function (module) {

    module.controller('InstructorController', function (UserDetail, $rootScope, UserLearning, UserTeaching, $scope, $location, $state, TokenService, $filter, TokenServiceData, ConstProfileSocialLink, InstructorStatsFactory, Slug) {
        $scope.state = $state.current.name;
        var model = this;
        model.loading = true;
        model.user = [];
        model.teachingCourses = [];
        params = {};
        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        promiseSettings.then(function (data) {
            if (angular.isDefined(data['ace.courseWishlist'])) {
                $scope.loadCourseWishlist = data['ace.courseWishlist'];
            }
        });
        /*Error function */
        function error() {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
        userID = $state.params.id ? parseInt($state.params.id) : '';
        $scope.auth_user_id = $rootScope.auth ? parseInt($rootScope.auth.id) : '';
        $scope.user_id = userID;
        $scope.currentUrl = $location.absUrl();
        $rootScope.activeMenu = 'settings';
        getUserParams = {
            id: userID,
            field: 'id,biography,displayname,Headline,image_hash,is_teacher,course_user_count,course_favourites_count,designation,twitter_profile_link,google_plus_profile_link,facebook_profile_link,youtube_profile_link,website,linkedin_profile_link,experience,active_course_count,review_count'
        };
        params.id = userID;
        params.page = $scope.currentPage;
        params.limit = 12;
        params.field = "course_image_hash,is_from_mooc_affiliate,course_title,course_slug,course_id,course_image,teacher_user_id,teacher_name,average_rating,price,course_price";
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            UserDetail.get(getUserParams).$promise.then(function (response) {
                if (angular.isDefined(response.data)) {
                    if (response.data.length > 0) {
                        model.user = response.data[0];
                        $rootScope.is_instructor_name = model.user.is_teacher;
                        if (model.user) {
                            if (model.user.facebook_profile_link !== null && model.user.facebook_profile_link !== undefined) {
                                model.user.facebook_profile_link = ConstProfileSocialLink.facebook + '' + model.user.facebook_profile_link;
                            }
                            if (model.user.twitter_profile_link !== null && model.user.twitter_profile_link !== undefined) {
                                model.user.twitter_profile_link = ConstProfileSocialLink.twitter + '' + model.user.twitter_profile_link;
                            }
                            if (model.user.google_plus_profile_link !== null && model.user.google_plus_profile_link !== undefined) {
                                model.user.google_plus_profile_link = ConstProfileSocialLink.google + '' + model.user.google_plus_profile_link;
                            }
                            if (model.user.linkedin_profile_link !== null && model.user.linkedin_profile_link !== undefined) {
                                model.user.linkedin_profile_link = ConstProfileSocialLink.linkedin + '' + model.user.linkedin_profile_link;
                            }
                            if (model.user.youtube_profile_link !== null && model.user.youtube_profile_link !== undefined) {
                                model.user.youtube_profile_link = ConstProfileSocialLink.youtube + '' + model.user.youtube_profile_link;
                            }
                            $rootScope.pageTitle = model.user.displayname + " | " + $rootScope.settings['site.name'];
                            var des = model.user.biography == '' || model.user.biography == null ? model.user.designation : model.user.biography;
                            $rootScope.metaDescription = $filter('limitTo')(des, 250);
                            if(model.user.is_teacher){
                              $rootScope.canonical = $rootScope.site_url+'instructor/' + model.user.id + '/' + window.encodeURIComponent(Slug.slugify(model.user.displayname.toLowerCase()));
                            } else {
                              $rootScope.canonical =$rootScope.site_url+'user/' + model.user.id + '/' + window.encodeURIComponent(Slug.slugify(model.user.displayname.toLowerCase()));
                            }
                        } else {
                            $rootScope.pageTitle = model.user.displayname + " | " + $filter("translate")("Instructor");
                        }
                    } else {
                        error();
                    }

                } else {
                    error();
                }
                model.loading = false;
            }, function (error) {
                if (error.status === 404) {
                    error();
                }
            });
            InstructorStatsFactory.get({ userId: $state.params.id }, function (response) {
                $scope.Instructor_Status = response.data;
                $rootScope.status = 'ready';
            });
        } else {
            error();
        }

        function getLearningCourses() {
            UserLearning.get(params).$promise.then(function (response) {
                model.learningCourses = response;
                $scope._metadata = response._metadata;
            });
        }
        var teachParams = {};
        teachParams.id = userID;
        teachParams.limit = 12;
        teachParams.field = 'id,title,slug,price,image_hash';

        function getTeachingCourses() {
            teachParams.page = $scope.currentTeachPage;
            teachParams.course_status_id = 3;
            UserTeaching.get(teachParams).$promise.then(function (response) {
                model.teachingCourses = response.data;
                model.teachingCourses._metadata = response._metadata;
            });
        }
        $scope.index = function () {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                getLearningCourses();
            }
        };
        $scope.teachIndex = function () {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                getTeachingCourses();
            }
        };
        $scope.index();
        $scope.teachIndex();
        $scope.paginate = function (pageno) {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.index();
        };
        $scope.paginateTeaching = function (pageno) {
            $scope.currentTeachPage = parseInt($scope.currentTeachPage);
            $scope.teachIndex();
        };
    });
} (angular.module("ace.userprofile")));

(function (module) {
    module.factory('UserDetail', function ($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/:id', {
            id: '@id'
        }, {
                'update': {
                    method: 'PUT'
                },
                'getUser': {
                    method: 'GET'
                }
            });
    });
    module.factory('UserTeaching', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('UserLearning', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/course_users', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
})(angular.module('ace.userprofile'));
