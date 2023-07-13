(function(module) {
    module.directive('profileName', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'users/directives/profileName.tpl.html',
            link: linker,
            controller: 'UserProfileNameController as model',
            bindToController: true,
            scope: {
                userProfileId: '=userProfileId',
                userDesignation: '@userDesignation',
                userNameClass: '@userNameClass',
                loggedUser: '@loggedUser',
                profileWithLabel: '@profileWithLabel',
                userMenuItem: '@UserMenuItem',
                userDisplayName: '=userDisplayName',
                userDesignationText: '@userDesignationText',
                userBiographyText: '@userBiographyText',
                userSmallText: '@userSmallText',
                is_instructor: "=instructor"
            }
        };
    });

    module.controller('UserProfileNameController', function($state, $scope, $rootScope, User, TokenService) {
        var model = this;
        UserNameDetails = model.userProfileId;
        UserType = model.is_instructor;
        $scope.is_instructor = UserType;
        $scope.user_id = UserNameDetails;
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
