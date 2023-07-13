(function(module) {
    module.controller('UserAnnouncementController', ['$state', '$window', '$scope', '$rootScope', '$location', 'flash', '$filter', 'TokenServiceData', 'UserAnnouncements', 'UserAnnouncementFactory', function($state, $window, $scope, $rootScope, $location, flash, $filter, TokenServiceData, UserAnnouncements, UserAnnouncementFactory) {
        $scope.user = {};
        $rootScope.pageTitle = $filter("translate")("Annoucement")+ " | " +$rootScope.settings['site.name'];
        $scope.getAnnoucement = function() {
            var params = {};
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            params.page = $scope.currentPage;
            // params.type = 'sent';
            // params.message_type = 'Announcement';
            UserAnnouncements.get(params, function(response) {
                $scope.annoucements = response.data;
                $scope._metadata = response._metadata;
                angular.forEach($scope.annoucements, function(message) {
                    angular.forEach(message.other_user, function(other_user) {
                        message.other_user = other_user.username;
                    });
                    angular.forEach(message.user, function(user) {
                        message.user = user.username;
                    });
                });
            });
        };
        $scope.paginate = function() {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.getAnnoucement();
        };
        $scope.getAnnoucement();
        $scope.markAsRead = function(message_id) {
            UserAnnouncementFactory.update({
                messageId: message_id
            }, function(response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Annoucement has been updated successfully.");
                    flash.set(flashMessage, 'success', false);
                } else {
                    flashMessage = $filter("translate")("Annoucement could not be updated.Pls try again later");
                    flash.set(flashMessage, 'success', false);
                }

            }, function() {
                flashMessage = $filter("translate")("Annoucement could not be updated.Pls try again later");
                flash.set(flashMessage, 'success', false);
            });
        };
    }]);
}(angular.module("ace.users")));
