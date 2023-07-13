/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {



}(angular.module('ace.news', [
    'ui.router',
    'ngResource',
])));

(function(module) {
    module.directive('newsButton', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/News/newsButton.tpl.html',
            link: linker,
            controller: 'newsButtonController as model',
            bindToController: true,
            scope: {
                position: '@position'
            }
        };
    });
    module.controller('newsButtonController', function($rootScope) {
        var model = this;
    });
    module.controller('newsController', function($state, $location, $scope, flash, $filter, $rootScope, TokenServiceData, $interval, User, GetNewsList) {
        var model = this;
        model.loader = true;
        $rootScope.pageTitle = $filter("translate")("News")+ " | " +$rootScope.settings['site.name'];
        getnews();

        function getnews(element) {
            model.loader = true;
            var params = {};
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            GetNewsList.get(params).$promise
                .then(function(response) {
                    model.news_list = response.data;
                    model._metadata = response._metadata;
                    model.loader = false;
                    if (element !== null && angular.isDefined(element)) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, 1500, 'swing', false);
                    }

                });
        }
        $scope.paginate = function(element) {
            model.currentPage = parseInt(model.currentPage);
            getnews(element);
        };
        var autoRefresh;
        $scope.autoReload = function() {
            autoRefresh = $interval(function() {
                $state.reload();
            }, 20000);
        };
        $scope.stopReload = function() {
            if (angular.isDefined(autoRefresh)) {
                $interval.cancel(autoRefresh);
                autoRefresh = undefined;
            }
        };
        $scope.$on('$destroy', function() {
            $scope.stopReload();
        });

    });
    module.controller('newsViewController', function($state, $location, $scope, flash, $filter, $rootScope, TokenServiceData, $interval, User, ViewNews) {
        var model = this;
        model.loading = true;
        $rootScope.pageTitle = $filter("translate")("News View")+ " | " +$rootScope.settings['site.name'];

        function viewNews() {
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                var params = {};
                params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
                ViewNews.get({
                        id: $state.params.id,
                    }, params).$promise
                    .then(function(response) {
                        model.news = response.data[0];
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
        }
        viewNews();

    });
    module.controller('categoryNewsController', function($state, $location, $scope, flash, $filter, $rootScope, TokenServiceData, $interval, User, GetNewsList, GetCategory) {
        var model = this;
        model.loader = true;
        $rootScope.pageTitle = $filter("translate")("News View")+ " | " +$rootScope.settings['site.name'];

        function getCategoryNews(element) {
            model.loader = true;
            var params = {};
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            if (angular.isDefined($state.params.id) && $state.params.id !== '') {
                GetCategory.get({ newsCategoryId: $state.params.id }, function(response) {
                    model.categoryDetails = response.data[0];
                });
                GetNewsList.get({
                        category_id: $state.params.id,
                    }, params).$promise
                    .then(function(response) {
                        model.news_list = response.data;
                        //Template date formattin not supporting sometiems
                        model._metadata = response._metadata;
                        model.loader = false;
                        if (element !== null && angular.isDefined(element)) {
                            $('html, body').animate({
                                scrollTop: $(element).offset().top
                            }, 1500, 'swing', false);
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
        }

        $scope.paginate = function() {
            model.currentPage = parseInt(model.currentPage);
            getCategoryNews(element);
        };
        getCategoryNews(null);

    });
})(angular.module('ace.news'));

(function(module) {

    module.factory('GetNewsList', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/news', {}
        );
    });
    module.factory('ViewNews', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/news/:id', {
                id: '@id'
            }
        );
    });
    module.factory('GetCategory', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/news_categories/:newsCategoryId', {
                newsCategoryId: '@newsCategoryId'
            }
        );
    });
})(angular.module("ace.news"));

(function(module) {
    module.directive('newsCategoryButton', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/News/newsCategory.tpl.html',
            link: linker,
            controller: 'newsCategoyButtonController as model',
            bindToController: true,
            scope: {
                position: '@position'
            }
        };
    });
    module.controller('newsCategoyButtonController', function($rootScope, GetNewsCategoryList, $state) {
        var model = this;
        model.loader = true;
        getnewscategory();
        if ($state.current.name === 'Categorynews') {
            model.category_id = $state.params.id;
        }

        function getnewscategory() {
            model.loader = true;
            var params = {};
            params.limit = 'all';
            GetNewsCategoryList.get(params).$promise
                .then(function(response) {
                    model.news_categories = response.data;
                    model.loader = false;
                });
        }
    });
})(angular.module('ace.news'));

(function(module) {
    module.factory('GetNewsCategoryList', function($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/news_categories', {}
        );
    });
})(angular.module("ace.news"));
