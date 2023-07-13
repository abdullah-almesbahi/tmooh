(function(module) {

    module.controller('studenFeedbackController', function($state, Course, $scope, Learning, $rootScope, AddFavourite, Archive, flash, $filter, TokenServiceData, CourseUserList, CourseUserDetails, CourseAnnoucementMessage) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("Feedback") + " | " + $rootScope.settings['site.name'];
        $scope.tags = [];
        $rootScope.dasboardActivetab = 'Student_feedback';
        $scope.feedbackLimit = 12;
        model.sendFeedback = sendFeedback;

        $scope.loadCoursUsers = function(query) {
            return CourseUserList.get({
                    q: query,
                    type: 'Student'
                })
                .$promise.then(function(response) {
                    if (angular.isDefined(response.data) && response.data.length > 0) {
                        $scope.newEntry = [];
                        angular.forEach(response.data, function(tag) {
                            $scope.newEntry.push({
                                'id': tag.id,
                                'text': tag.learner_name
                            });

                        });
                    } else {
                        $scope.newEntry = [];
                    }
                    return $scope.newEntry;
                });
        };

        function sendFeedback($valid, feedbackForm) {
            if($valid){
                  $scope.message_disableButton = true;
            angular.forEach($scope.tags, function(tag) {
                model.instructor_feedback.course_user_id = tag.id;
            });
            CourseAnnoucementMessage.create(model.instructor_feedback, function(response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Feedback has been saved successfully.");
                    flash.set(flashMessage, 'success', false);
                    $scope.tags = [];
                    model.instructor_feedback = '';
                    feedbackForm.$setPristine();
                    feedbackForm.$setUntouched();
                } else {
                    flash.set("Feedback couldn't be saved.", 'error', false);
                }
                $scope.message_disableButton = false;
            }, function(error) {
                flash.set("Error occurred while saving feedback.", 'error', false);

                $scope.message_disableButton = false;
            });
            }

        }
    });
}(angular.module("ace.courses")));
