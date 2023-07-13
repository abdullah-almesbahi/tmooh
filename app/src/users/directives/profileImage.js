(function(module) {
    module.directive('profileImage', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'users/directives/profileImage.tpl.html',
            link: linker,
            controller: 'UserProfileImageController as model',
            bindToController: true,
            scope: {
                userProfileId: '=userProfileId',
                userProfileThumb: '@userProfileThumb',
                imageType: '@imageType',
                loggedUser: '@loggedUser',
                userHeader: '@userHeader',
                userImageHash: '=userImageHash',
                userDisplayName: '@userDisplayName',
                is_instructor: '=instructor'

            }
        };
    });

    module.controller('UserProfileImageController', function($state, $scope, $rootScope, User, TokenService) {
        var model = this;
        UserDetails = model.userProfileId;
        $scope.user_id = UserDetails;
        UserType = model.is_instructor;
        $scope.is_instructor = UserType;
        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        promiseSettings.then(function(data) {
            if (angular.isDefined(data['ace.courseWishlist'])) {
                $scope.loadCourseWishlist = data['ace.courseWishlist'];
            }
        });
        model.profileUrl = "user";
        if (angular.isDefined($scope.is_instructor) && ($scope.is_instructor === true)) {
            model.profileUrl = "instructor";
        }
    });
})(angular.module('ace.users'));
