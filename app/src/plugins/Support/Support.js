/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module("ace.support", [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.controller('supportsController', function ($scope, $rootScope, $uibModal, $uibModalStack, HelpTopics, CoursesGroups, flash, $filter, $state, HelpTopicContents) {
        var model = this;
        /*Variable Declaration*/
        $rootScope.pageTitle = $filter("translate")("FAQ") + " | " +$rootScope.settings['site.name'];
        model.content_loader = true;
        model.content_topic_loader = true;
        model.help_topics = [];
        //Getting groups
        if ($state.params.type !== null && $state.params.type !== '' && $state.params.type !== undefined) {
            model.state_type = $state.params.type;
            if (model.state_type === 'student') {
                $scope.supportNavbartab = 'student_topic';
                model.type = 'Student';
            } else if (model.state_type === 'instructor') {
                $scope.supportNavbartab = 'Instructor_topic';
                model.type = 'Instructor';
            }
            getHelpTopics('#help_topics');
            getHelpTopicsContent();
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: error.status
            });
        }
        function getHelpTopicsContent() {
            var params = {};
            params.limit = 'all';
            params.type = model.type;
            HelpTopicContents.get(params, function (response) {
                model.help_topic_contents = [];
                angular.forEach(response.data, function (help_content) {
                    if (help_content.is_faq && help_content.is_active) {
                        model.help_topic_contents.push(help_content);
                    }
                });
                model.content_loader = false;
            }, function (error) {

            });
        }
        function getHelpTopics(element) {
            model.content_topic = true;
            var params = {};
            params.page = params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            params.type = model.type;
            if ($state.params.q !== null & $state.params.q !== undefined) {
                params.q = $state.params.q;
                $scope.hsupportVal = $state.params.q;
            }
            params.is_faq = true;
            HelpTopics.get(params, function (response) {
                model.help_topics = response.data;
                $scope._metadata = response._metadata;
                model.content_topic_loader = false;
            });

        }
        $scope.paginate = function (element) {
            model.currentPage = parseInt(model.currentPage);
            getHelpTopics(element);
        };
    });
    module.controller('supportsContentController', function ($scope, $rootScope, $uibModal, $uibModalStack, HelpTopicContent, CoursesGroups, flash, $filter, CoursesGroupDelete, $state, $location, HelpTopic, HelpTopics) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("FAQ") + " | " +$rootScope.settings['site.name'];
        /*Variable Declaration*/
        model.content_loader = true;
        model.course_group = {};
        $scope.group = {};
        /**Getting the help topic type and help topic content id  */
        if ($state.params.Category_id !== null && $state.params.Category_id !== '' && $state.params.Category_id !== undefined && $state.params.id !== null && $state.params.id !== '' && $state.params.id !== undefined &&
            $state.params.type !== null && $state.params.type !== '' && $state.params.type !== undefined) {
            // model.type = $state.params.type;
            model.bread_type = $state.params.type;
            if ($state.params.type === 'student') {
                model.type = 'Student';
            } else if ($state.params.type === 'instructor') {
                model.type = 'Instructor';

            }
            model.help_topic_id = $state.params.Category_id;
            getHelpTopic();
            getHelpTopics();
            getHelpTopicContent();
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
        /**Getting the particular Help topic*/
        function getHelpTopic() {
            HelpTopic.get({
                id: model.help_topic_id
            }, function (response) {
                model.help_topic = response.data[0];
            });
        }
        /**Getting the Help topics*/
        function getHelpTopics() {
            var params = {};
            params.page = params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            params.type = model.type;
            if ($state.params.q !== null & $state.params.q !== undefined) {
                params.q = $state.params.q;
                $scope.hsupportVal = $state.params.q;
            }
            params.is_faq = true;
            HelpTopics.get(params, function (response) {
                model.help_topics = response.data;
                $scope._metadata = response._metadata;
            });
        }
        /**Getting the Particular support content */
        function getHelpTopicContent() {
            HelpTopicContent.get({ id: $state.params.id }, function (response) {
                model.help_topic_content = response.data[0];
                model.content_loader = false;
            }, function (error) {
                if (error.status === 500) {
                    flashMessage = $filter("translate")("Sorry! Content is not available. Pls try again latet");
                    flash.set(flashMessage, 'error', false);
                    $location.path('/support/' + $state.params.type);
                }
            });
        }
    });
    module.controller('supportsCategoryController', function ($scope, $rootScope, $uibModal, $uibModalStack, HelpTopicContents, CoursesGroups, flash, $filter, CoursesGroupDelete, $state, $location, HelpTopics, HelpTopic) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("FAQ") + " | " +$rootScope.settings['site.name'];
        model.content_loader = true;
        /*Variable Declaration*/
        model.course_group = {};
        $scope.group = {};
        /**Getting the help topic type and help topic id  */
        if ($state.params.id !== null && $state.params.id !== '' && $state.params.id !== undefined &&
            $state.params.type !== null && $state.params.type !== '' && $state.params.type !== undefined) {
            model.bread_type = $state.params.type;
            if ($state.params.type === 'student') {
                model.type = 'Student';
            } else if ($state.params.type === 'instructor') {
                model.type = 'Instructor';

            }
            model.help_topic_id = $state.params.id;
            getHelpTopic();
            getHelpTopicsContent();
            getHelpTopics();
        } else {
            $scope.$emit('updateParent', {
                isOn404: true,
                errorNo: 404
            });
        }
        /**Getting the particular Help topic*/
        function getHelpTopic() {
            HelpTopic.get({
                id: $state.params.id
            }, function (response) {
                model.help_topic = response.data[0];
            });
        }
        /**Getting the Help topics*/
        function getHelpTopics() {
            var params = {};
            params.page = params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            params.type = model.type;
            if ($state.params.q !== null & $state.params.q !== undefined) {
                params.q = $state.params.q;
                $scope.hsupportVal = $state.params.q;
            }
            params.is_faq = true;
            HelpTopics.get(params, function (response) {
                model.help_topics = response.data;
                $scope._metadata = response._metadata;
            });
        }
        /**Getting the Help topic Content Based on help Topic id */
        function getHelpTopicsContent() {
            var params = {};
            params.help_topic_id = $state.params.id;
            HelpTopicContents.get(params, function (response) {
                model.help_topic_contents = response.data;
                model.content_loader = false;
            }, function (error) {
                if (error.status === 500) {
                    flashMessage = $filter("translate")("Sorry! Content is not available. Pls try again latet");
                    flash.set(flashMessage, 'error', false);
                    $location.path('/support/' + $state.params.type);
                }
            });
        }
    });
})(angular.module("ace.support"));
(function (module) {

    module.factory('HelpTopics', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/help_topics', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('HelpTopic', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/help_topics/:id', {}, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            }
        );
    });

    module.factory('HelpTopicContents', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/help_topic_contents', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('HelpTopicContent', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/help_topic_contents/:id', {}, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            }
        );
    });
})(angular.module("ace.support"));
