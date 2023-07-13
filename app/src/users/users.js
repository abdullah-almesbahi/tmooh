(function (module) {

    module.controller('UserProfileController', function ($state, User, UserProfile, $scope, $rootScope, $location, $http, $timeout, flash, $filter, TokenService, GENERAL_CONFIG, TokenServiceData, Upload, AlertBox, $cookies, ConstBirthdayYearAgo, UserPayPalAuthenticate, $window, ConstToolTipContent, Language) {
        var model = this;
        $scope.ConstToolTipContent = ConstToolTipContent;
        model.user_profile = {};
        model.is_dont_send_disable = false;
        $scope.obj = { src: "", selection: [], thumbnail: false };
        $scope.isRtl = Language.isRtl();
        var promise = TokenService.promise;
        var promiseSettings = TokenService.promiseSettings;
        promiseSettings.then(function (data) {
            if (angular.isDefined(data['ace.seo'])) {
                $scope.loadSeo = data['ace.seo'];
            }
        });
        var today = new Date();
        today.setFullYear(today.getFullYear() - ConstBirthdayYearAgo.yearago);
        model.picker1 = {
            datepickerOptions: {
                datepickerMode: 'year',
                maxDate: today.setDate(today.getDate()),
                showWeeks: false,
            }
        };
        $rootScope.activeMenu = 'settings';
        model.user_profile = getUser();
        var old_profile_data = {};

        function getUser() {
            if ($rootScope.auth) {
                User.getUser({
                    id: $rootScope.auth.id,
                    field: 'id,displayname,designation,headline,biography,first_name,youtube_profile_link,linkedin_profile_link,facebook_profile_link,twitter_profile_link,google_plus_profile_link,paypal_email,is_show_learning_courses_in_profile_page,is_show_profile_on_search_engines,is_disabled,qualification,experience,is_notify_special_promotion_by_h2k,is_notify_announcement_by_h2k,is_notify_new_message_by_user,is_do_not_send_emails,is_notify_progress_about_my_course,is_paid_course_terms_and_conditions,is_enable_courses_for_percentage_promotions,is_enable_courses_for_fixed_price_promotions,is_enable_courses_for_marketing_program,is_enable_courses_for_corporate_program,last_name,dob,gender_id,address1,image_hash,email',
                }).$promise
                    .then(function (response) {
                        if (response !== null && response !== undefined) {
                            if (response.data !== null && response.data !== undefined) {
                                if (response.data.length > 0) {
                                    if (response.data[0].paypal_email === null || response.data[0].paypal_email === undefined || parseInt(response.data[0].paypal_email) === 0) {
                                        response.data[0].paypal_email = null;
                                    }
                                    model.user_profile = response.data[0];
                                    if (model.user_profile.dob !== null && model.user_profile.dob !== undefined) {
                                        model.picker1.date = new Date(model.user_profile.dob);
                                    }
                                    model.place = model.user_profile.address1;
                                    //Saving the Previous User data
                                    angular.forEach(model.user_profile, function (value, key) {
                                        old_profile_data[key] = value;
                                    });
                                    if (model.user_profile) {
                                        $rootScope.pageTitle = $rootScope.settings['site.name'] + " | " + model.user_profile.displayname;
                                    } else {
                                        $rootScope.pageTitle = $rootScope.settings['site.name'] + " | " + $filter("translate")("User");
                                    }
                                    if ($state.current.name === 'UserPhoto' || $state.current.name === 'UserProfile') {
                                        if ($cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
                                            $rootScope.auth.displayname = model.user_profile.displayname;
                                            $rootScope.auth.designation = model.user_profile.designation;
                                            $rootScope.auth.headline = model.user_profile.headline;
                                            $rootScope.auth.email = model.user_profile.email;
                                            if (model.user_profile.image_hash !== null && model.user_profile.image_hash !== undefined) {
                                                $rootScope.auth.user_image_hash = model.user_profile.image_hash + '?rand=' + Math.random();
                                            } else {
                                                $rootScope.auth.user_image_hash = model.user_profile.image_hash;
                                            }
                                            $cookies.put('auth', JSON.stringify($rootScope.auth), { path: '/' });
                                        }
                                    }
                                    delete model.user_profile.user_image;

                                    if (!$.cookie('firsttime_promotional')) {
                                      model.user_profile.is_enable_courses_for_corporate_program = true;
                                      model.user_profile.is_enable_courses_for_fixed_price_promotions = true;
                                      model.user_profile.is_enable_courses_for_marketing_program = true;
                                      model.user_profile.is_enable_courses_for_percentage_promotions = true;
                                      model.user_profile.is_paid_course_terms_and_conditions = true;
                                    }
                                }
                            }
                        }

                    });
            }
        }
        function init() {
            $scope.progressPercentage = 0;
            $scope.obj = { src: "", 'selection': [0, 23, 512, 262, 200, 200], thumbnail: false };
            $scope.preview_picture_filename = '';
        }
        init();
        $scope.checknotification = function () {
            if (model.user_profile.is_notify_special_promotion_by_h2k === true || model.user_profile.is_notify_announcement_by_h2k === true || model.user_profile.is_notify_new_message_by_user === true) {
                model.is_dont_send_disable = true;
            } else {
                model.is_dont_send_disable = false;
            }
        };
        $scope.upload = function (file) {
            $scope.progressPercentage = 0;
            var flashMessage;
            $scope.file = file;
            if (file !== null && file !== undefined) {
                Upload.upload({
                    url: 'api/v1/image_upload',
                    data: {
                        file: file
                    }
                })
                    .then(function (response) {
                        if (response.data.error.code === 0) {
                            model.user_profile.user_image = response.data.filename;
                            $scope.preview_picture_filename = response.data.filename;
                            $scope.obj.src = $rootScope.site_url + 'img/original/UserPreview/' + model.user_profile.id + '.' + $scope.preview_picture_filename + '?rand=' + Math.random();
                        } else {
                            var errorMessage;
                            if (response.data.error.code === 1) {
                                delete (model.user_profile.user_image);
                                errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: mov, mpeg4, avi, wmv, mpeg, flv, 3gpp, webm, mp4.");
                            } else if (response.data.error.code === 2) {
                                errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: gif, jpeg, jpg, png.");
                            } else {
                                errorMessage = response.data.error.message;
                            }
                        }
                    }, function (resp) {
                        if (resp.status === 413) {
                            flashMessage = $filter("translate")("Unable to upload a image, Image size is too large. Please try with another image");
                            flash.set(flashMessage, 'error', false);
                        } else {
                            flashMessage = $filter("translate")("Oops, an error has occurred while trying to upload, please try again later.");
                            flash.set(flashMessage, 'error', false);
                        }
                        init();
                    }, function (evt) {
                        $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    }, function (error) {

                    });
            } else {
                $scope.preview_picture_filename = '';
                $scope.obj.src = '';
            }
        };
        /*Disabling and Enabling the Account */
        $scope.disableProfile = function (userprofile_disable) {
            if (userprofile_disable === 'true') {
                AlertBox.confirm('Are you sure you want to disable your account?', function (isConfirmed) {
                    if (isConfirmed) {
                        model.user_profile.is_disabled = 1;
                        $scope.editProfile(true);
                    }
                });

            } else {
                AlertBox.confirm('Are you sure you want to enable your account', function (isConfirmed) {
                    if (isConfirmed) {
                        model.user_profile.is_disabled = 0;
                        $scope.editProfile(true);
                    }
                });
            }
        };
        $scope.ChangeChecking = function () {
            $scope.value_changed = false;
            angular.forEach(old_profile_data, function (old_data, old_key) {
                if (model.user_profile[old_key] !== old_profile_data[old_key]) {
                    $scope.value_changed = true;
                }
            });
        };
        $scope.Paypalauthenticate = function () {
            UserPayPalAuthenticate.get(function (response) {
                if (response.error.code === 0) {
                    if (angular.isDefined(response.data.url)) {
                        $window.location.href = response.data.url;
                    }
                    console.log(response);
                } else {
                    flash.set(response.error.message, 'error', false);
                }
                $scope.paypal_disableButton = false;
            }, function (error) {
                $scope.paypal_disableButton = false;
            });
        };
        $scope.editProfile = function ($valid) {
            if ($valid) {
                $scope.disableSave = true;
                if (typeof (model.place) !== 'string' && model.place !== null && model.place !== undefined) {
                    model.user_profile.address1 = model.place.formatted_address;
                } else {
                    model.user_profile.address1 = model.place;
                }
                if ((model.user_profile.first_name !== null && model.user_profile.first_name !== undefined) && (model.user_profile.last_name !== null && model.user_profile.last_name !== undefined)) {
                    model.user_profile.displayname = model.user_profile.first_name + ' ' + model.user_profile.last_name;
                }
                if (model.picker1.date !== null && model.picker1.date !== undefined) {
                    model.user_profile.dob = $filter('date')(Date.parse(model.picker1.date), 'yyyy-MM-dd');
                }
                if ($state.current.name === 'PromotionalAgreements') {
                    model.user_profile.is_paid_agree = 1;
                }
                if ($scope.obj.selection[0] !== null && $scope.obj.selection[0] !== undefined && $scope.obj.selection[1] !== null && $scope.obj.selection[1] !== undefined && $scope.obj.selection[4] !== null && $scope.obj.selection[4] !== undefined && $scope.obj.selection[5] !== null && $scope.obj.selection[5] !== undefined) {
                    model.user_profile.x = $scope.obj.selection[0];
                    model.user_profile.y = $scope.obj.selection[1];
                    model.user_profile.width = $scope.obj.selection[4];
                    model.user_profile.height = $scope.obj.selection[5];
                }

                UserProfile.update(model.user_profile, function (response) {
                    if (response.error.code === 0) {
                        if ($state.current.name === 'UserProfile') {
                            flashMessage = $filter("translate")("Profile information has been updated successfully");
                            flash.set(flashMessage, 'success', false);
                        } else if ($state.current.name === 'UserPhoto') {
                            flashMessage = $filter("translate")("Profile photo has been updated successfully");
                            flash.set(flashMessage, 'success', false);
                        } else if ($state.current.name === 'PromotionalAgreements') {
                            $cookies.put('firsttime_promotional', 1, {path: '/'});
                            flashMessage = $filter("translate")("Promotional Agreements has been updated successfully");
                            flash.set(flashMessage, 'success', false);
                        } else if ($state.current.name === 'UserPrivacy') {
                            flashMessage = $filter("translate")("Privacy settings has been updated successfully");
                            flash.set(flashMessage, 'success', false);
                        } else if ($state.current.name === 'UserMessageSetting') {
                            flashMessage = $filter("translate")("notification settings has been updated successfully");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("User profile has been updated successfully.");
                            flash.set(flashMessage, 'success', false);
                        }
                        if ($state.params.course !== null && $state.params.course !== undefined) {
                            $state.go('manageCoursePrice', { id: $state.params.course });
                        } else {
                            getUser();
                            init();
                        }
                    } else if (response.error.code === 3) {
                        $('html, body').animate({
                            scrollTop: $('#paid_agree').offset().top
                        }, 2000, 'swing', false);
                        flashMessage = $filter("translate")("You must need to agree the Paid course agreement");
                        flash.set(flashMessage, 'error', false);
                    } else {
                        flash.set(response.error.message, 'error', false);
                    }
                    $scope.disableSave = false;
                });
            }
        };

    });
    module.controller('UserAllController', function (UserAll, $rootScope, $scope, $location, $state, $filter, TokenServiceData) {
        var model = this;
        $rootScope.pageTitle = $rootScope.settings['site.name'] + " | " + $filter("translate")("Instructors");
        model.userall = [];
        params = {};
        params.limit = 10;

        function getAllUser(element) {
            params.page = $scope.currentPage;
            params.sort_by = 'ASC';
            params.is_teacher = 1;
            params.field = "image_hash,displayname,user_id,designation,biography";
            UserAll.getUserAll(params).$promise.then(function (response) {
                model.userall = response;
                $scope._metadata = response._metadata;
            });
            if (element !== null && angular.isDefined(element)) {
                $('html, body').animate({
                    scrollTop: $(element).offset().top
                }, 2000, 'swing', false);
            }
        }
        $scope.index = function (element) {
            $scope.currentPage = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            getAllUser(element);
        };
        $scope.index(null);
        $scope.paginate = function (element) {
            $scope.currentPage = parseInt($scope.currentPage);
            $scope.index(element);
        };
    });
    module.controller('SubscribePlansController', function ($scope, $state, $rootScope, $filter, TokenServiceData) {
        var title = $filter("to_trusted")("Plans & Sign Up");
        $rootScope.pageTitle = $rootScope.settings['site.name'] + " | " + title;
    });

} (angular.module("ace.users")));
