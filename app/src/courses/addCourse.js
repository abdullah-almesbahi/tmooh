(function (module) {
    module.controller('AddCourseController', function ($state, Course, $rootScope, $scope, $http, $location, $filter, TokenServiceData, flash, CourseType) {
        var model = this;
        $rootScope.pageTitle =  $filter("translate")("Add Course") + " | " +  $rootScope.settings['site.name'];
        model.course = new Course();
        model.coursetype = {};
        model.coursetype.video = true;
        model.save = save;
        var newCourseId = '';

        function save($valid, AddForm) {
            var courseChecked = false;
            angular.forEach(model.coursetype, function (course_type) { if (course_type === true) { courseChecked = true; } });
            if (!courseChecked) { model.Showerror = true; }
            if ($valid && courseChecked === true) {
                if ($rootScope.auth.providertype === 'admin') {
                    model.course.user_id = $rootScope.auth.id;
                }
                $scope.disableButton = true;
                /*Updating the type of the course with comma separated*/
                var checked = [];
                for (var key in model.coursetype) {
                    if (model.coursetype[key]) {
                        var value = CourseType[key];
                        checked.push(value);
                    }
                }
                model.course.course_options = checked.join();
                model.course.category_id = model.course.parent_category_id;
                model.course.$save()
                    .then(function (response) {
                        newCourseId = response.id;
                        if (angular.isDefined(newCourseId) && newCourseId !== 'null') {
                            AddForm.$setPristine();
                            AddForm.$setUntouched();
                            $rootScope.$emit('checkIsTeacher', {});
                            $state.go('manageCourseRoadmap', { id: newCourseId });
                        } else {
                            error_msg = $filter("translate")("Unable to add course, please try again later.");
                            flash.set(error_msg, 'error', false);
                        }
                        $scope.disableButton = false;
                    })
                    .catch(function (error) { })
                    .finally();
            }

        }
    });
} (angular.module("ace.courses")));
