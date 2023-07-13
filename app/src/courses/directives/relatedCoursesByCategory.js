(function (module) {
    module.directive('relatedCoursesByCategory', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'E',
            templateUrl: 'courses/directives/relatedCoursesByCategory.tpl.html',
            link: linker,
            controller: 'relatedCoursesByCategory as model',
            bindToController: true,
            scope: {
                categoryId: '@',
                courseId: '@',
                limit: '@'
            }
        };
    });

    module.controller('relatedCoursesByCategory', function (Course, ViewCourse, CategoriesRelatedCourse, $state, $scope, $rootScope) {
        var model = this;
        if (angular.isDefined(model.limit)) {
            limit = model.limit;
        }
        model.relatedCoursesByCategory = [];
        //  model.relatedCoursesByCategory = [];
        courseId = model.courseId;
        var category_id = model.categoryId;
        var category_arr = {
            id: category_id,
            course_id: courseId,
            // limit: limit,
            sort_by: "DESC",
            field: "id,title,slug,price,image_hash,is_from_mooc_affiliate,course_image,average_rating,displayname,user_id,course_user_feedback_count,course_user_count,currency_id,tier_id"
        };
        CategoriesRelatedCourse.get(category_arr).$promise.then(function (response) {
            model.loading = false;
            model.related_courses_by_category_length = response.data.length;
            // model.relatedCoursesByCategory = response;
            var temp_comments = [];
            var i = 0;
            angular.forEach(response.data, function (category_course) {
                i++;
                temp_comments.push(category_course);
                if (temp_comments.length === 2 || i === response.data.length) {
                    model.relatedCoursesByCategory.push(temp_comments);
                    temp_comments = [];
                }
            });
            $rootScope.status = 'ready';            
        });

    });
})(angular.module('ace.courses'));
