(function(module) {
    module.controller('CourseInstructorReviewController', function($state, $rootScope, $scope, $filter, TokenServiceData, GetUserFeedback, $location, $timeout) {
        $rootScope.pageTitle =  $filter("translate")("My Courses") + " | " + $rootScope.settings['site.name'];
        var model = this;
        $scope.messagesort = {};
        model._metadata = [];
        model.stars = [];
        $scope.starSort = {};
        $rootScope.activeMenu = 'dashboard';
        $rootScope.dasboardActivetab = 'instructor_reviews';
        for (i = 1; i <= 5; i++) {
            model.stars.push({
                id: i,
                name: i + 'Star'
            });
        }

        function getinstructorreview(element) {
            model.loading = true;
            params = {};
            $scope.messagesort.sortby = $state.params.ordering;
            $scope.ordering = $state.params.ordering;
            if ($state.params.star !== undefined && $state.params.star !== "") {
                params.star = $state.params.star;
                var v = $state.params.star;
                v.split(',')
                    .forEach(function(e) {
                        $scope.starSort[e] = true;
                    });
            }
            if ($scope.messagesort.sortby === 'created') {
                params.sort = 'id';
                params.sort_by = 'DESC';
            }
            if ($scope.messagesort.sortby === '-created') {
                params.sort = 'id';
                params.sort_by = 'ASC';
            }
            if ($state.params.sortby === 'rating') {
                params.sort = 'rating';
                params.sort_by = 'DESC';
            }
            if ($state.params.sortby === '-rating') {
                params.sort = 'rating';
                params.sort_by = 'ASC';
            }
            params.filter = 'all';
            $scope.filter = 'all';
            getUserParams = {
                filter: params,
                page: model._metadata.currentPage,
            };
            GetUserFeedback.get(getUserParams).$promise.then(function(response) {
                model.CoursesFeedbacks = response.data;
                model._metadata = response._metadata;
                model.loading = false;
                if (element !== null && angular.isDefined(element)) {
                    $('html, body').animate({
                        scrollTop: $(element).offset().top
                    }, 2000, 'swing', false);
                }
            });
        }
        $scope.index = function(element) {
            getinstructorreview(element);
        };
        $scope.Sort = function(a) {
            if (a !== undefined && a !== null) {
                $scope.messagesort.sortby = a;
            }
            var checked_row = $scope.getChecked($scope.starSort);
            checked_row = (checked_row.length !== 0) ? checked_row.join() : null;
            $location
                .search('ordering', $scope.messagesort.sortby);
            $timeout(function() {
                getinstructorreview(null);
            }, 1000);
        };
        $scope.index(null);
        $scope.paginate = function(element) {
            model._metadata.currentPage = parseInt(model._metadata.currentPage);
            $scope.index(element);
        };
        $scope.goToState = function(state, params) {
            $state.go(state, params);
        };
        $scope.getChecked = function(obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push(key);
                }
            }
            return checked;
        };
    });
}(angular.module("ace.courses")));
