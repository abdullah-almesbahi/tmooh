/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {

}(angular.module('ace.socialShare', [
    'ngResource'
])));

(function(module) {
    module.directive('socialShare', function() {
        var linker = function(scope, element, attrs) {};
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/SocialShare/socialShare.tpl.html',
            link: linker,
            controller: 'SocialShareController as model',
            bindToController: true,
            scope: {
                shareLink: '@shareLink',
                shareStyle: '@shareStyle',
                shareTitle: '@shareTitle',
                shareType: '@shareType',
            }
        };
    });

    module.controller('SocialShareController', function($state, $scope, $rootScope, GENERAL_CONFIG) {
        var model = this;
        if (model.shareType === 'referral') {
            $scope.share = model.shareLink;
        } else {
            $scope.share = GENERAL_CONFIG.api_url + '' + model.shareLink;
        }
        $scope.shareTitle = model.shareTitle;
        if (model.shareStyle === 'ListInline') {
            $scope.shareClassName = 'list-inline';
            $scope.iconSize = 'fa-2x';
        } else {
            $scope.shareClassName = 'list-unstyled';
            $scope.iconSize = 'fa-3x';
        }
    });
})(angular.module('ace.socialShare'));

(function(module) {

})(angular.module('ace.socialShare'));