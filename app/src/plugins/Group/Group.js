/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module("ace.group", [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('groupButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/Group/groupButton.tpl.html',
            link: linker,
            controller: 'groupButtonController as model',
            bindToController: true,
            scope: {
                position: '@position',
                courseId: '@courseId',
                courseUserId: '@courseUserId',
                groupId: '@groupId',
                updateparent: '&',
                courseGroups: '@courseGroups',
                groupsList: '@groupsList'
            }
        };
    });
    module.controller('groupButtonController', function ($scope, $rootScope, $uibModal, $uibModalStack, Groups, CoursesGroups, flash, $filter, CoursesGroupDelete) {
        var model = this;
        /*Function Declaration*/
        if (model.courseGroups !== undefined && model.courseGroups !== null && model.courseGroups !== '') {
            model.course_groups = JSON.parse(model.courseGroups);
        }
        if (model.groupsList !== undefined && model.groupsList !== null && model.groupsList !== '') {
            model.groups_list = JSON.parse(model.groupsList);
            model.groups = [];
            if (model.course_groups !== undefined && model.course_groups !== null && model.course_groups !== '') {
                angular.forEach(model.groups_list, function (group) {
                    angular.forEach(model.course_groups, function (couregroup) {
                        if (group.id == couregroup.group_id) {
                            group.isadd = true;
                            group.course_group_id = couregroup.course_group_id;
                        }
                    });
                    model.groups.push(group);
                });
            } else {
                angular.forEach(model.groups_list, function (group) {
                    group.isadd = false;
                    model.groups.push(group);
                });
            }
        }
        model.AddGroup = AddGroup;
        model.AddCourseGroup = AddCourseGroup;
        model.DeleteCourseGroup = DeleteCourseGroup;
        /*Variable Declaration*/

        model.course_group = {};
        $scope.group = {};
        /*Value Assigning */
        $scope.First_get_Group = true;
        model.course_group.course_id = model.courseId;
        model.course_group.course_user_id = model.courseUserId;
        $scope.group.course_id = model.courseId;
        //TRIGGERING THE GROUP MODEL
        $scope.GroupAddModal = function () {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/Group/groupModel.tpl.html',
                    controller: function ($scope, action) {
                        var model = this;
                        $scope.action = action;
                    },
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        action: function () {
                            return "add";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.message']) && $ocLazyLoad.getModules().indexOf('ace.message') === -1) {
                                        requiredPlugins.push(data['ace.message']);
                                    }

                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
        // Getting groups
        /*function GetGroup() {
            model.groups = [];
            if ($scope.First_get_Group) {
                var params = {};
                params.user_id = $rootScope.auth.id;
                Groups.get(params, function (response) {
                    // model.groups = response.data;
                    if (model.course_groups !== undefined && model.course_groups !== null && model.course_groups !== '') {
                        angular.forEach(response.data, function (group) {
                            angular.forEach(model.course_groups, function (couregroup) {
                                if (group.id == couregroup.group_id) {
                                    group.isadd = true;
                                    group.course_group_id = couregroup.course_group_id;
                                }
                            });
                            model.groups.push(group);
                        });
                    } else {
                        angular.forEach(response.data, function (group) {
                            group.isadd = false;
                            model.groups.push(group);
                        });
                    }
                });
            }
        }*/
        // GetGroup();
        //ADDING GROUPS
        function AddGroup(valid) {
            if (valid) {
                $scope.disableButton = true;
                Groups.create($scope.group, function (response) {
                    if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                        succsMsg = $filter("translate")("Group has been Created and added successfully.");
                        flash.set(succsMsg, 'success', false);
                        model.updateparent();
                        $uibModalStack.dismissAll();
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.disableButton = false;
                }, function (error) {
                    $scope.disableButton = false;
                });
            }
        }

        //ADDDING COURSE GROUP
        function AddCourseGroup(group_id) {
            model.course_group.group_id = group_id;
            CoursesGroups.create(model.course_group, function (response) {
                if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                    succsMsg = $filter("translate")("Course has been added to Group successfully.");
                    flash.set(succsMsg, 'success', false);
                    model.updateparent();
                } else {
                    flash.set(response.error.message, 'error', false);
                }
            });
        }
        /**DELETING COURSE GROUP */
        function DeleteCourseGroup(index) {
            CoursesGroupDelete.remove({
                coursesGroupId: model.groups[index].course_group_id
            }, function (response) {
                if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                    succsMsg = $filter("translate")("Course has been removed from the Group");
                    flash.set(succsMsg, 'success', false);
                    model.updateparent();
                } else {
                    flash.set(response.error.message, 'error', false);
                }
            });
        }
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();
        };

    });
    module.controller('myCourseGroupController', function ($scope, $rootScope, $uibModal, $uibModalStack, Groups, CoursesGroups, flash, $filter, CoursesGroupDelete, GroupUpdate, $window, AlertBox, ConstDateFormat) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("My Groups")+ " | " +$rootScope.settings['site.name'];
        /*Function Declaration*/
        model.EditGroupUpate = EditGroupUpate;
        $scope.ConstDateFormat = ConstDateFormat;
        model.GroupDelete = GroupDelete;
        model.openWebinarCourseModal = openWebinarCourseModal;
        model.OpenWebinarWindow = OpenWebinarWindow;
        model.openOfflineCourseModal = openOfflineCourseModal;
        model.DeleteCourseGroup = DeleteCourseGroup;
        model.paginate = paginate;
        model.loader = true;
        /*Variable Declaration*/

        model.groups = [];
        /*Value Assigning */

        //TRIGGERING THE GROUP MODEL
        $scope.GroupeditModal = function () {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/Group/groupModel.tpl.html',
                    controller: function ($scope, action) {
                        $scope.action = action;
                        var model = this;
                    },
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        action: function () {
                            return "edit";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.message']) && $ocLazyLoad.getModules().indexOf('ace.message') === -1) {
                                        requiredPlugins.push(data['ace.message']);
                                    }

                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
        //Getting groups
        function GetGroup(element) {
            model.loader = true;
            var params = {};
            params.page = (model.currentPage !== undefined) ? parseInt(model.currentPage) : 1;
            params.user_id = $rootScope.auth ? $rootScope.auth.id : '';
            Groups.get(params, function (response) {
                model._metadata = response._metadata;
                model.groups = response.data;
                angular.forEach(model.groups, function (group) {
                    angular.forEach(group.courses_groups, function (course_group) {
                        angular.forEach(course_group.course_users, function (course_user) {
                            if (course_user.course_batches !== null && course_user.course_batch_id !== null) {
                                angular.forEach(course_user.course_batches, function (value) {
                                    var today = new Date(),
                                        currentdate = $filter('date')(Date.parse(today), "yyyy-MM-dd"),
                                        currenttime = $filter('date')(Date.parse(today), "HH:mm"),
                                        enddate = $filter('date')(Date.parse(value.end_date), "yyyy-MM-dd"),
                                        startdate = $filter('date')(Date.parse(value.start_date), "yyyy-MM-dd"),
                                        session_length = 0,
                                        session_share = 0;
                                    if (course_user.is_offline) {
                                        course_group.offline_course = true;
                                        //Formatting the Date of Offline Sessions
                                        if (value.course_offline_sessions !== undefined && value.course_offline_sessions !== null) {
                                            if (value.course_offline_sessions.length > 0) {
                                                value.course_offline_sessions = $filter('CountryTimezone')(value.course_offline_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
                                            }
                                        }
                                        if (currentdate > startdate && currentdate > enddate) {
                                            course_group.progess_percentage = 100;
                                        } else if (currentdate < startdate && currentdate < enddate) {
                                            course_group.progess_percentage = 0;
                                        } else if ((currentdate == startdate && currentdate < enddate) || (currentdate > startdate && currentdate < enddate) || (currentdate == startdate && currentdate == enddate) || (currentdate > startdate && currentdate == enddate)) {
                                            course_group.progess_percentage = 0;
                                            session_length = value.course_offline_sessions.length;
                                            session_share = Math.ceil((100 / parseInt(session_length)));
                                            for (i = 0; i < session_length; i++) {
                                                session_date = $filter('date')(Date.parse(value.course_offline_sessions[i].session_date), "yyyy-MM-dd");
                                                session_time = $filter('date')(Date.parse(value.course_offline_sessions[i].session_date), "HH:mm");
                                                if (session_date == currentdate && currenttime < session_time) {
                                                    course_group.progess_percentage += 0;
                                                } else if (session_date == currentdate && (currenttime == session_time || currenttime > session_time)) {
                                                    course_group.progess_percentage += session_share;
                                                } else if (session_date < currentdate) {
                                                    course_group.progess_percentage += session_share;

                                                } else if (session_date > currentdate) {
                                                    course_group.progess_percentage += 0;
                                                }
                                            }
                                        }
                                        if (course_group.progess_percentage > 100) {
                                            course_group.progess_percentage = 100;
                                        }
                                    }
                                    if (!course_user.is_offline) {
                                        course_group.webinar_course = true;
                                        value.course_webinar_sessions = $filter('CountryTimezone')(value.course_webinar_sessions, ['session_date', 'session_end_date'], 'TimeZoneSessionSet', ConstDateFormat.created_12);
                                        if (currentdate > startdate && currentdate > enddate) {
                                            course_group.progess_percentage = 100;
                                        } else if (currentdate < startdate && currentdate < enddate) {
                                            course_group.progess_percentage = 0;
                                        } else if ((currentdate == startdate && currentdate < enddate) || (currentdate > startdate && currentdate < enddate) || (currentdate == startdate && currentdate == enddate) || (currentdate > startdate && currentdate == enddate)) {
                                            course_group.progess_percentage = 0;
                                            session_length = value.course_webinar_sessions.length;
                                            session_share = Math.ceil((100 / parseInt(session_length)));
                                            for (i = 0; i < session_length; i++) {
                                                session_date = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "yyyy-MM-dd");
                                                session_time = $filter('date')(Date.parse(value.course_webinar_sessions[i].session_date), "HH:mm");
                                                if (session_date == currentdate && currenttime < session_time) {
                                                    course_group.progess_percentage += 0;
                                                } else if (session_date == currentdate && (currenttime == session_time || currenttime > session_time)) {
                                                    course_group.progess_percentage += session_share;
                                                } else if (session_date < currentdate) {
                                                    course_group.progess_percentage += session_share;
                                                } else if (session_date > currentdate) {
                                                    course_group.progess_percentage += 0;
                                                }
                                            }
                                        }
                                        if (course_group.progess_percentage > 100) {
                                            course_group.progess_percentage = 100;
                                        }
                                    }
                                });
                            } else {
                                course_group.vedio_course = true;
                            }
                        });
                    });
                });
                console.log(model.groups);
                model.loader = false;
                if (element !== null && angular.isDefined(element)) {
                    $('html, body').animate({
                        scrollTop: $(element).offset().top
                    }, 1500, 'swing', false);
                }
            }, function (error) {
                if (error.status === 404) {
                    $scope.$emit('updateParent', {
                        isOn404: true,
                        errorNo: error.status
                    });
                }
            });
        }
        GetGroup();
        //EDITING THE GROUP
        $scope.Groupedit = function (Group_id) {
            model.edit_group = {};
            GroupUpdate.get({
                groupId: Group_id
            }, function (response) {
                if (angular.isDefined(response.data[0].id !== '' && response.data[0].id !== "null")) {
                    model.group_id = response.data[0].id;
                    model.edit_group.name = response.data[0].name;
                    model.edit_group.description = response.data[0].description;
                    $scope.GroupeditModal();
                } else {
                    flash.set(response.error.message, 'error', false);
                }
            });
        };
        //UPDATING THE GROUP
        function EditGroupUpate(valid) {
            if (valid) {
                var group_id = model.group_id;
                model.edit_group.user_id = $rootScope.auth.id;
                GroupUpdate.update({
                    groupId: group_id
                }, model.edit_group, function (response) {
                    if (angular.isDefined(response.id !== '' && response.id !== "null")) {
                        succsMsg = $filter("translate")("Group has been updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        GetGroup();
                        $uibModalStack.dismissAll();

                    } else {
                        flash.set(response.error.message, 'error', false);
                    }

                });
            }
        }
        //DELETING THE GROUP
        function GroupDelete(index, group_id) {
            AlertBox.confirm('Are you sure you want to delete group?', function (isConfirmed) {
                if (isConfirmed) {
                    GroupUpdate.remove({
                        groupId: group_id
                    }, function (response) {
                        if (response.error.code === 0) {
                            succsMsg = $filter("translate")("Group has been deleted successfully.");
                            flash.set(succsMsg, 'success', false);
                            model.groups.splice(index, 1);
                        } else {
                            flash.set(response.error.message, 'error', false);
                        }

                    });
                }
            });
        }
        //DELETING COURSE GROUP
        function DeleteCourseGroup(parent_index, child_index, course_group_id) {
            AlertBox.confirm('Are you sure you want to remove course from this group?', function (isConfirmed) {
                if (isConfirmed) {
                    CoursesGroupDelete.remove({
                        coursesGroupId: course_group_id
                    }, function (response) {
                        if (response.error.code === 0) {
                            succsMsg = $filter("translate")("Course Succesfully removed from the group");
                            flash.set(succsMsg, 'success', false);
                            model.groups[parent_index].courses_groups.splice(child_index, 1);
                        } else {
                            flash.set(response.error.message, 'error', false);
                        }
                    });
                }
            });
        }
        //PAGINATE FUNCTION
        function paginate(element) {
            model.currentPage = parseInt(model.currentPage);
            GetGroup(element);
        }

        function openOfflineCourseModal(course_user) {
            $scope.batch_details = course_user[0].course_batches[0];
            if ($scope.batch_details.course_offline_sessions !== null) {
                angular.forEach($scope.batch_details.course_offline_sessions, function (offline_session) {
                    offline_session.format_session_date = $filter('date')(Date.parse(offline_session.session_date), ConstDateFormat.mediumDate);
                    $scope.batch_details.addresss = offline_session.address;
                    $scope.batch_details.city_name = offline_session.city_name;
                    $scope.batch_details.state_name = offline_session.state_name;
                    $scope.batch_details.country_name = offline_session.country_name;
                });
            }
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/OfflineCourse/myCourseOfflineBatch.tpl.html',
                size: 'lg',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        }

        function openWebinarCourseModal(course_user) {
            $scope.webinar_batch_details = course_user[0].course_batches[0];
            angular.forEach($scope.webinar_batch_details.course_webinar_sessions, function (webinar_session) {
                webinar_session.format_session_date = $filter('date')(Date.parse(webinar_session.session_date), ConstDateFormat.mediumDate);
            });
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'src/plugins/WebinarCourses/myCourseWebianerBatch.tpl.html',
                size: 'lg',
                resolve: {
                    pageType: function () {
                        return "modal";
                    }
                }
            });
        }

        function OpenWebinarWindow(index) {
            if ($scope.webinar_batch_details !== null && $scope.webinar_batch_details !== undefined) {
                if ($scope.webinar_batch_details.course_webinar_sessions !== null && $scope.webinar_batch_details.course_webinar_sessions !== undefined) {
                    if ($scope.webinar_batch_details.course_webinar_sessions[index].webinar_url !== null && $scope.webinar_batch_details.course_webinar_sessions[index].webinar_url !== undefined) {
                        var w = 1000,
                            h = 600,
                            left = (window.screen.width / 2) - ((w / 2) + 10),
                            top = (window.screen.height / 2) - ((h / 2) + 50);
                        var win = window.open($scope.webinar_batch_details.course_webinar_sessions[index].webinar_url, 'popupWindow',
                            "status=no,height=" + 600 + ",width=" + 1000 + ",resizable=yes,left=" +
                            left + ",top=" + top + ",screenX=" + left + ",screenY=" +
                            top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
                    }
                }
            }
        }
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();

        };

    });
})(angular.module("ace.group"));

(function (module) {

    module.factory('Groups', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/groups', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('GroupUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/groups/:groupId', {
                groupId: '@groupId'
            }, {
                update: {
                    method: 'PUT',
                    groupId: '@groupId',
                }
            }, {
                remove: {
                    method: 'DELETE',
                    groupId: '@groupId',
                }
            }
        );
    });
    module.factory('CoursesGroups', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses_groups', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('CoursesGroupDelete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses_groups/:coursesGroupId', {}, {
                remove: {
                    method: 'DELETE',
                    coursesGroupId: '@coursesGroupId',
                }
            }
        );
    });
})(angular.module("ace.group"));
