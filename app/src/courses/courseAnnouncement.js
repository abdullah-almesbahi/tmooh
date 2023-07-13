(function (module) {
    module.controller('CourseAnnouncementController', function ($state, $rootScope, $scope, $filter, TokenServiceData, AnnouncementType, Teaching, CourseUserStatus, CourseAnnoucementMessage, flash, $timeout, ConstToolTipContent, ConstDateFormat) {
        $rootScope.pageTitle =  $filter("translate")("Annoucement") + " | " +  $rootScope.settings['site.name'];
        var model = this;
        $scope.ConstDateFormat = ConstDateFormat;
        $scope.tooltipContent = ConstToolTipContent;
        $rootScope.activeMenu = 'Dashboard';
        $scope.announcement = {};
        $scope.dates = {};
        $scope.course_use_status = {};
        $scope.CourseUserStatus = [];
        $scope.announcementypes = [];
        $scope.exclude_courses = [];
        $scope.include_courses = [];
        $scope.CourseUserStatus = CourseUserStatus;

        function DateInit() {
            var today = new Date();
            model.picker2 = {
                datepickerOptions: {
                    maxDate: today,
                    showWeeks: false,
                }
            };
            model.picker1 = {
                datepickerOptions: {
                    maxDate: today,
                    showWeeks: false,
                }
            };
            angular.forEach(CourseUserStatus, function (value, key) {
                $scope.course_use_status[value] = true;
            });
            $scope.announcement.type = 'Announcement';
            $scope.sort();
        }
        //ANNOUCEMENT TYPES
        angular.forEach(AnnouncementType, function (key, value) {
            $scope.announcementypes.push({
                'id': key,
                'name': value,
            });
        });
        $scope.announcement.type = 'Announcement';
        //EXCLUDE COURSES AUTOCOMPLETE AND MULTIPLE SELECTION
        $scope.excludeCourse = function (query) {
            model.error = false;
            return Teaching.get({
                id: $rootScope.auth.id,
                q: query,
            })
                .$promise.then(function (response) {
                    if (angular.isDefined(response.data) && response.data.length > 0) {
                        $scope.newEntry = [];
                        if($scope.include_courses !== null && $scope.include_courses !== undefined){
                            if($scope.include_courses.length > 0){
                            angular.forEach($scope.include_courses,function(include_course){
                                angular.forEach(response.data,function(course, key){
                                       if(parseInt(include_course.id) == parseInt(course.id) ){
                                           delete response.data[key];
                                       }
                                });
                            });
                        }
                    }
                        angular.forEach(response.data, function (tag) {
                            $scope.newEntry.push({
                                'id': tag.id,
                                'text': tag.title
                            });
                        });
                    } else {
                        $scope.newEntry = [];
                    }
                    return $scope.newEntry;
                });
        };
        //INCLUDE COURSES AUTOCOMPLETE AND MULTIPLE SELECTION
        $scope.includeCourse = function (query) {
            model.error = false;
            return Teaching.get({
                id: $rootScope.auth.id,
                q: query,
            })
                .$promise.then(function (response) {
                    if (angular.isDefined(response.data) && response.data.length > 0) {
                        $scope.newIncludeCourseEntry = [];
                         if($scope.exclude_courses !== null && $scope.exclude_courses !== undefined){
                            if($scope.exclude_courses.length > 0){
                            angular.forEach($scope.exclude_courses,function(include_course){
                                angular.forEach(response.data,function(course, key){
                                       if(parseInt(include_course.id) == parseInt(course.id) ){
                                           delete response.data[key];
                                       }
                                });
                            });
                        }
                    }
                        angular.forEach(response.data, function (tag) {
                            $scope.newIncludeCourseEntry.push({
                                'id': tag.id,
                                'text': tag.title
                            });
                        });
                    } else {
                        $scope.newIncludeCourseEntry = [];
                    }
                    return $scope.newIncludeCourseEntry;
                });
        };

        // watch min and max dates to calculate difference
        var unwatchMinMaxValues = $scope.$watch(function () {
            return [model.picker1, model.picker2];
        }, function () {
            // min max dates
            if (model.picker1.date !== undefined && model.picker1.date !== null) { model.picker2.datepickerOptions.minDate = model.picker1.date; }
            if (model.picker2.date !== undefined && model.picker2.date !== null) { model.picker1.datepickerOptions.maxDate = model.picker2.date; }
            $scope.announcement.enrolled_end_date = $filter('date')(Date.parse(model.picker2.date), $scope.ConstDateFormat.created);
            $scope.announcement.enrolled_start_date = $filter('date')(Date.parse(model.picker1.date), $scope.ConstDateFormat.created);
        }, true);
        //GETTING COURSE USER STATUS
        $scope.sort = function (a) {
            $scope.announcement.students_processed_percentage = [];
            checked_row = $scope.getChecked($scope.course_use_status);
            angular.forEach(checked_row, function (status) {
                $scope.announcement.students_processed_percentage.push(status);
            });
        };
        //CHECKED
        $scope.getChecked = function (obj) {
            var checked = [];
            for (var key in obj) {
                if (obj[key]) {
                    checked.push({
                        'status': key
                    });
                }
            }
            return checked;
        };
        //CREATING ANNOCEMENT
        $scope.createAnnoucement = function () {
            model.error = false;
            $scope.announcement.include_course_ids = [];
            $scope.announcement.exclude_course_ids = [];
            if($scope.exclude_courses.length === 0 && $scope.include_courses.length === 0 ){
                model.error = true;
                return true;
            }
            angular.forEach($scope.exclude_courses, function (exclude) {
                $scope.announcement.exclude_course_ids.push({
                    'id': exclude.id
                });
            });
            angular.forEach($scope.include_courses, function (include) {
                $scope.announcement.include_course_ids.push({
                    'id': include.id
                });
            });
            $scope.annoucement_disableButton = true;
            $scope.announcement.class = "Course";
            CourseAnnoucementMessage.create($scope.announcement, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Announcement has been made successfully.");
                    flash.set(flashMessage, 'success', false);
                    $scope.announcement = {};
                    DateInit();
                    $scope.course_use_status = {};
                    $scope.exclude_courses = [];
                    $scope.include_courses = [];
                } else {
                    flash.set(response.error.message, 'error', false);
                }
                $scope.annoucement_disableButton = false;
            }, function (error) {
                if (error.status === 404) {
                    flashMessage = $filter("translate")("Unable to make an announcement. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                } else {
                    flashMessage = $filter("translate")("Unable to make an announcement. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                }
                $scope.annoucement_disableButton = false;
            });
        };
        DateInit();
    });
} (angular.module("ace.courses")));
