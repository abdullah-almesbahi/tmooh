/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {

}(angular.module('ace.seo', [
    'ui.router',
    'ngResource'

])));

(function(module) {
    module.directive('courseSeo', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'A',
            template: '<a href="/manage-course/seo/{{courseID}}" class="" title="SEO">&nbsp; {{title}}</a>',
            link: linker,
            controller: 'CourseSeoController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('CourseSeoController', function($scope, $filter, $timeout) {
        var model = this;
            $scope.courseID = model.courseId;
        $scope.title = $filter("translate")("SEO");
    });
    module.controller('SeoUpdateController', function($scope, ViewCourse, $state, CourseUpdate, flash, $filter, $rootScope, TokenServiceData) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("Course SEO")+ " | " +$rootScope.settings['site.name'];
        model.seo = {};
        model.saveCourseSeo = saveCourseSeo;
        if (angular.isDefined($state.params.id) && $state.params.id !== '') {
            ViewCourse.get({
                    id: $state.params.id,
                    // field: 'id,meta_description,meta_keywords'
                }).$promise
                .then(function(response) {
                    if (response.data.length > 0) {
                        model.seo.meta_keywords = response.data[0].meta_keywords;
                        model.seo.meta_description = response.data[0].meta_description;
                    }
                    model.loading = false;
                }, function(error) {
                    if (error.status === 404) {
                        $scope.$emit('updateParent', {
                            isOn404: true,
                            errorNo: error.status
                        });
                    }
                });
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }

        function saveCourseSeo() {
            model.seo.id = $state.params.id;
            CourseUpdate.update(model.seo, function(response) {
                flashMessage = $filter("translate")("Course detail has been updated successfully.");
                flash.set(flashMessage, 'success', false);
                $state.reload();
            });
        }
    });

}(angular.module("ace.seo")));

(function(module) {
    module.factory('ViewCourse', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
                id: '@id'
            }
        );
    });
    module.factory('CourseUpdate', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('ViewUser', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id', {
                id: '@id'
            }
        );
    });
    module.factory('UserProfile', function($resource, GENERAL_CONFIG) {
        return $resource(GENERAL_CONFIG.api_url + 'api/v1/users/edit-profile', {}, {
            'update': {
                method: 'PUT'
            }
        });
    });
})(angular.module("ace.seo"));

(function(module) {
    module.directive('userProfileSeo', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/SEO/userProfileSeo.tpl.html',
            link: linker,
            controller: 'UserProfileSeoController as model',
            bindToController: true,
            scope: {}
        };
    });

    module.controller('UserProfileSeoController', function($state, $scope, $rootScope, ViewUser, UserProfile, flash, $filter) {
        var model = this;
        model.userSeo = {};
        model.saveUserSeo = saveUserSeo;
        ViewUser.get({
                id: $rootScope.auth.id,
                field: 'meta_keywords,meta_description'
            }).$promise
            .then(function(response) {
                model.userSeo.meta_keywords = response.data[0].meta_keywords;
                model.userSeo.meta_description = response.data[0].meta_description;
            });

        function saveUserSeo() {
            model.userSeo.id = $rootScope.auth.id;
            UserProfile.update(model.userSeo, function(response) {
                flashMessage = $filter("translate")("User profile has been updated successfully.");
                flash.set(flashMessage, 'success', false);
                $state.reload();
            });
        }
    });
})(angular.module('ace.seo'));
