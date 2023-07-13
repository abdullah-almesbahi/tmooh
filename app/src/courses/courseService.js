(function (module) {
    module.factory('Course', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('ViewCourse', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT',
                    id: '@id'
                }
            }
        );
    });
    module.factory('Teaching', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CourseCategory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/categories/:id/courses', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('UserTeachingCourse', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/courses/:course_id/related', {
                id: '@id',
                course_id: '@course_id'
            }
        );
    });
    module.factory('CategoriesRelatedCourse', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/categories/:id/courses/:course_id/related', {
                id: '@id'
            }
        );
    });
    module.factory('OnlineCourseLessons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/online_course_lessons', {
                id: '@id'
            }
        );
    });
    module.factory('OnlineCourseLessonsDelete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }, {
                'DeleteOnlineLesson': {
                    method: 'Delete'
                }
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('OnlineCourseLessonsUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('OnlineCourseLessonsNeighbour', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id/neighbours', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('addOnlineCourseLessons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CreateOnlineCourseLesson', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons', {
                id: '@id'
            }, {
                'create': {
                    method: 'POST'
                }
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('Learning', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/course_users', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('Wishlist', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/users/:id/course_favourites', {
                id: '@id'
            }
        );
    });
    module.factory('AddFavourite', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_favourites', {
                course_id: '@course_id'
            }, {
                addfav: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('DeleteFavourite', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_favourites/:id', {
                id: '@id'
            }, {
                'delfav': {
                    method: 'Delete'
                }
            }
        );
    });
    module.factory('DeleteFavouriteByCourseId', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/course_favourites', {
                id: '@id'
            }, {
                'deleteFavByCourseId': {
                    method: 'Delete'
                }
            }
        );
    });
    module.factory('CourseUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }, {
                remove: {
                    method: 'DELETE',
                }
            }
        );
    });
    module.factory('CourseUsersFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/course_user_feedbacks', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

    module.factory('CourseUserDetails', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    }
                }
            }
        );
    });
    module.factory('TakeCourse', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users', {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('InstructionLevels', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/instructional_levels'
        );
    });

    module.factory('GetLanguages', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/languages'
        );
    });
    module.factory('CourseUsers', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:id/course_users', {
                'get': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('ViewCourseUser', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('PayoutList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/payouts'
        );
    });
    module.factory('PayoutRedirect', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/payouts_connect', {
                id: '@id'
            }, {
                'getRedirectUri': {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('getGateways', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/get_gateways'
        );
    });
    module.factory('payNow', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/order/:id', {
                id: '@id'
            }, {
                paynowpost: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('Countries', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/countries'
        );
    });
    module.factory('Categories', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/categories/:id'
        );
    });
    module.factory('Archive', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users/:id/archive', {
                id: '@id'
            }
        );
    });
    module.factory('Unarchive', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users/:id/unarchive', {
                id: '@id'
            }
        );
    });

    module.factory('UpdateDispalyOrder', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/courses/:id/update_display_order', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('OnlineLessonViewPost', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lesson_views', {
                id: '@id'
            }, {
                lessonViewPost: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('OnlineLessonViewComplete', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lesson_views/:id', {
                id: '@id'
            }, {
                lessonViewComplete: {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('CategoriesList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/categories', {
                id: '@id'
            }
        );
    });
    module.factory('GetCourseUserEntry', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/courses/:course_id/users/:user_id/course_users', {
                course_id: '@course_id',
                user_id: '@user_id'
            }
        );
    });
    module.factory('UserSubscription', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/user_subscriptions', {

            }
        );
    });
    module.factory('InstructionLevelSubscription', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/instructional_levels_subscriptions', {
                subscription_id: '@subscription_id'
            }
        );
    });
    module.factory('H2kFeedbackList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_feedbacks', {}, {
                create: {
                    method: 'POST',
                }
            }

        );
    });
    module.factory('CourseH2kFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_feedbacks/:courseFeedbackId', {}, {
                update: {
                    method: 'PUT',
                    courseFeedbackId: '@courseFeedbackId'
                }
            }
        );
    });
    module.factory('CourseAnnoucementMessage', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('GetMicrophones', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/microphones', {}
        );
    });
    module.factory('GetLightings', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/lightings', {}
        );
    });
    module.factory('GetEditingSoftwares', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/editing_softwares', {}
        );
    });
    module.factory('GetCameras', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/cameras', {}
        );
    });
    module.factory('TimezoneList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/timezones', {}
        );
    });
    module.factory('CourseUserList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_users', {}
        );
    });
    module.factory('GetCurrencyList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/currencies', {}
        );
    });
    module.factory('GetReviewQuestions', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_review_questions', {}
        );
    });
    module.factory('GetCourseInstuctor', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_instructors', {}
        );
    });

    module.factory('GetUserFeedback', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_feedbacks', {}
        );
    });
    module.factory('GetCourseFeedbackQuestions', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_feedback_questions', {}
        );
    });
    module.factory('CourseTraffic', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_traffics', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('Groups', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/groups', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('MessageFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/messages/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    }
                }
            }, {
                remove: {
                    method: 'DELETE',
                    params: {
                        id: '@id'
                    }
                }
            }
        );
    });
    module.factory('DemoSession', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/demo_sessions', {
                id: '@id'
            }, {
                get: {
                    method: 'GET',
                },
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('DemoSessionUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/demo_sessions/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    }
                }
            }, {
                remove: {
                    method: 'DELETE',
                    params: {
                        id: '@id'
                    }
                }
            }
        );
    });
    module.factory('AssignmentDeleteFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/attachments/:id', {
                id: '@id'
            }, {
                'remove': {
                    method: 'DELETE'
                }
            }
        );
    });
    module.factory('CourseCoupons', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/coupons', {
                id: '@id'
            }
        );
    });
})(angular.module("ace.courses"));