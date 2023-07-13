/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function (module) {



} (angular.module('ace.carts', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('cartButtons', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/CourseBulkCheckout/cartButton.tpl.html',
            link: linker,
            controller: 'cartButtonController as model',
            bindToController: true,
            scope: {
                batchPrice: '@batchPrice',
                courseId: '@courseId',
                courseUserId: '@courseUserId',
                userId: '@userId',
                courseBatchId: '@courseBatchId',
                position: '@position',
                type: '@type',
                slug: '@slug',
                courseType: '@courseType',
                // campaignId: '@campaignId',
                batchPruchased: '@batchPruchased'
            }
        };
    });
    module.controller('cartButtonController', function ($rootScope, $state, $cookies, md5, CartsService, flash, $filter, $scope, TakeCourse, $uibModal, $location, $uibModalStack, isMobile, PlateForm, $timeout, GetCourseInstuctor, ConstToolTipContent) {
        /**VARIABLE DECLARATION */
        var model = this;
        $scope.ConstToolTipContent = ConstToolTipContent;
        model.cart = {};
        model.loader = true;
        model.takeCourse = new TakeCourse();
        /**VALUE ASSIGNING*/
        model.userId = parseInt(model.userId);
        var userID = $rootScope.auth ? $rootScope.auth.id : '';
        $scope.auth_id = parseInt(userID);
        var courseID = ($state.params.id) ? $state.params.id : model.courseId;
        model.AddCart = AddCart;
        model.cart.course_id = model.courseId;
        model.cart.course_batch_id = model.courseBatchId;
        model.cart.price = model.batchPrice;
        model.startLearnCourse = startLearnCourse;
        /**FUNCTION DECLARATION*/

        if (model.type === 'Count' && model.position === 'Header') {
            Getcart();
        }


        /*Checking Multiple instructor concept */
        if ($rootScope.isAuth) {
            if ((model.userId !== parseInt($rootScope.auth.id)) && $rootScope.settings['site.enabled_plugins'].indexOf('MultipleInstructor') > -1) {
                model.loader = true;
                model.multipleInstructor = {};
                GetCourseInstuctor.get({
                    course_id: courseID,
                    user_id: $rootScope.auth.id,
                }).$promise
                    .then(function (response) {
                        if (response.data.length > 0) {
                            model.multipleInstructor.owner = true;
                            if (response.data[0].is_editable === true) {
                                model.multipleInstructor.editable = true;
                            } else {
                                model.multipleInstructor.editable = false;
                            }
                        } else {
                            model.multipleInstructor.owner = false;
                        }
                        model.loader = false;
                    }, function (error) {
                        model.loader = false;
                        model.multipleInstructor.owner = false;
                    });
            } else {
                model.loader = false;
            }
        } else {
            model.loader = false;
        }


        $rootScope.$on('updateCartParent', function (event, args) {
            model.cart_loader = false;
            /**
             *Amount_display variable is added.AmountDisplay directive will need
             * to trigger when amount changes
             */
            $scope.amount_display = "disabled";
            var tmp_carts = {};
            if (args.carts !== null && args.carts !== undefined) {
                if (args.carts.length > 0) {
                    $scope.total_amount = 0;
                    model.original_amount = 0;
                    model.discount_trigger = false;
                    angular.forEach(args.carts, function (cart) {
                        cart.original_price = null;
                        if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1) {
                            if (cart.campaign_id !== null && cart.campaign_id !== undefined) {
                                if (cart.discount_type === 'fixed') {
                                    model.discount_trigger = true;
                                    if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                        cart.original_price = $filter('multicurrencydiscount')(null, cart.discounted_amount, 'yes');
                                        cart.price = $filter('multicurrency')(cart.tier_id, cart.price);
                                    } else {
                                        cart.original_price = cart.discounted_amount;
                                    }
                                }
                            }
                        }
                        if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1 && cart.discount_type !== 'fixed') {
                            if (cart.course_batch_id !== null && cart.course_batches_tier_id !== null) {
                                cart.tier_id = cart.course_batches_tier_id;
                            }
                            cart.price = $filter('multicurrency')(cart.tier_id, cart.price);
                        }
                        //Checking Whether discount type is fixed
                        $scope.total_amount += parseFloat(cart.price);
                        model.original_amount += parseFloat(cart.price);
                        if (cart.discount_amount !== null && cart.discount_amount !== undefined && parseFloat(cart.discount_amount) !== 0) {
                            model.discount_trigger = true;
                            cart.original_price = (parseFloat(cart.price) - parseFloat(cart.discount_amount));
                            $scope.total_amount -= parseFloat(cart.discount_amount);
                        }
                    });
                    model.carts = {
                        'list': args.carts,
                        'count': args.carts.length,
                    };
                } else {
                    model.carts = {
                        'list': [],
                        'count': 0
                    };
                }
            } else {
                model.carts = {
                    'list': [],
                    'count': 0
                };
            }
            $timeout(function () {
                $scope.amount_display = "enabled";
            }, 500);
            model.cart_loader = true;


        });

        function Getcart() {
            var getcart = {};
            if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                //Multicurrency is enabled. currency_id filter need applied
                getcart.currency_id = $rootScope.settings.geoIP.id;
            }
            if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                var new_cookie1 = $cookies.getObject('cart_cookies');
                getcart.session_id = new_cookie1.hash;
                $scope.SessionID = new_cookie1.hash;
            }
            getcart.sort = 'id';
            getcart.sortby = 'DESC';
            CartsService.get(getcart).$promise
                .then(function (response) {
                    $rootScope.$emit('updateCartParent', {
                        carts: response.data
                    });
                });
        }

        function setCartCookies() {
            var new_hash = md5.createHash(Date());
            if ($cookies.getObject('cart_cookies') === null || angular.isUndefined($cookies.getObject('cart_cookies'))) {
                var new_cookie = {};
                new_cookie.hash = new_hash;
                $cookies.putObject('cart_cookies', new_cookie);
                model.cart.session_id = new_hash;
            } else {
                var cart_session_id = $cookies.getObject('cart_cookies');
                model.cart.session_id = cart_session_id.hash;
            }
        }

        function AddCart(type) {
            if (isMobile.phone) {
                //To get the plateform detail whether website,phone. etc
                model.cart.platform_id = PlateForm.Mobile;
            } else if (!isMobile.phone) {
                model.cart.platform_id = PlateForm.Web;
            }
            if (model.courseBatchId !== undefined && model.courseBatchId !== null) {
                model.course_batch_id = model.courseBatchId;
            }
            if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                //Multicurrency is enabled. Sending the country currency details
                model.cart.currency_id = $rootScope.settings.geoIP.id;
            }
            if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1) {
                //Campaigns is enabled. Sending the campaign details
                if (angular.isDefined($.cookie('campaign')) && $.cookie('campaign') !== null) {
                    cookie_campaign = JSON.parse($.cookie('campaign'));
                    if (cookie_campaign.type === 'others') {
                        //Affialate,Advertisement,Corporate,Customized percentage sharing
                        if (parseInt(cookie_campaign.course_id) === parseInt($state.params.id)) {
                            model.cart.campaign_id = cookie_campaign.campaign_id;
                        }
                    } else if (cookie_campaign.type === 'referral') {
                        //Referal
                        $.each(cookie_campaign, function (key, value) {
                            model.cart[key] = value;
                        });
                        delete model.cart.type;
                    }
                }
                /* if (model.campaignId !== null && !angular.isUndefined(model.campaignId) &&
                     model.campaignId !== "" && model.courseType === "vedio") {
                     model.cart.campaign_id = model.campaignId;
                 }*/
            }
            CartsService.create(model.cart).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        if (response.error.message !== 'Already in Cart') {
                            $state.go('Carts');
                            flash.set($filter("translate")("Course has been added to cart."), 'success', false);
                        } else {
                            flash.set($filter("translate")("Course already in cart."), 'info', false);
                        }
                    } else {
                        flash.set($filter("translate")("Course couldn't be added to cart."), 'error', false);
                    }
                }, function (error) {
                    flash.set($filter("translate")("Error occurred while adding course to cart."), 'error', false);

                });
        }

        function startLearnCourse(e, purchseStatus) {
            if (!$rootScope.isAuth || $rootScope.isAuth === false) {
                var url = '/course/' + $state.params.id + '/' + $state.params.slug;
                $cookies.put('redirect_url', url);
            }
            e.preventDefault();
            if (!$.cookie('refresh_token')) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    // templateUrl: 'users/login.tpl.html',
                    // controller: 'userLoginController',
                    templateUrl: 'users/signup.tpl.html',
                    controller: 'userSignupController as model',
                    size: 'lg',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    if (angular.isDefined(data['ace.socialLogin'])) {
                                        var module = data['ace.socialLogin'];
                                        return $ocLazyLoad.load(module, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                });
            } else {
                if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1) {
                    //Campaigns is enabled. Sending the campaign details
                    if (angular.isDefined($.cookie('campaign')) && $.cookie('campaign') !== null) {
                        cookie_campaign = JSON.parse($.cookie('campaign'));
                        if (cookie_campaign.type === 'others') {
                            //Affialate,Advertisement,Corporate,Customized percentage sharing
                            if (parseInt(cookie_campaign.course_id) === parseInt($state.params.id)) {
                                model.takeCourse.campaign_id = cookie_campaign.campaign_id;
                            }
                        } else if (cookie_campaign.type === 'referral') {
                            //Referal
                            $.each(cookie_campaign, function (key, value) {
                                model.takeCourse[key] = value;
                            });
                            delete model.takeCourse.type;
                        }
                    }
                }
                model.takeCourse.course_id = courseID;
                model.takeCourse.user_id = $rootScope.auth ? $rootScope.auth.id : '';
                if (model.batchPruchased === 'false') {
                    model.takeCourse.$save()
                        .then(function (response) {
                            if (response.id && response.id !== null) {
                                $state.go('LearnCourseview', { course_user_id: response.id, type: 'overview' });
                            } else {
                                flashMessage = $filter("translate")("You can\'t read this course.");
                                flash.set(flashMessage, 'error', false);
                            }
                        })
                        .catch(function (error) {

                        })
                        .finally();
                } else {
                    $state.go('LearnCourseview', { course_user_id: model.courseUserId, type: 'overview' });
                }
            }
        }
        /**FUNCTION CALLING*/
        setCartCookies();


    });
    module.controller('CourseCartController', function ($state, vaultList, vaultDelete, $location, $scope, flash, $filter, $rootScope, TokenServiceData, $interval, User, UserProfile, CartsService, $cookies, CartServiceFactory, CouponRemoveFactory, $analytics, ConstCurrencies) {
        $rootScope.pageTitle = $filter("translate")("My Cart")+ " | " +$rootScope.settings['site.name'];
        /**VARIABLE DECLARATION */
        var model = this;
        /**VALUE ASSIGNING*/

        model.loader = true;
        model.removeCart = removeCart;
        model.removeCoupon = removeCoupon;
        model.Getcart = Getcart;
        /**FUNCTION DECLARATION*/

        function Getcart(element) {
            model.loader = true;
            var getcart = {};
            model.cartlists = [];
            if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                var new_cookie1 = $cookies.getObject('cart_cookies');
                getcart.session_id = new_cookie1.hash;
                $scope.SessionID = new_cookie1.hash;
            }
            getcart.page = ($scope.currentPage !== undefined) ? parseInt($scope.currentPage) : 1;
            if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                //Multicurrency is enabled. currency_id filter need applied
                getcart.currency_id = $rootScope.settings.geoIP.id;
            }
            getcart.sort = 'id';
            getcart.sortby = 'DESC';
            CartsService.get(getcart).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        $rootScope.$emit('updateCartParent', {
                            carts: response.data
                        });
                        $scope.Total_amount = 0;
                        model.original_amount = 0;
                        model.discount_trigger = false;
                        model.cartlists = response.data;
                        model.hund_pre_exist = 'disable';
                        var productsTitles = [];
                        var items = [];
                        angular.forEach(model.cartlists, function (cart) {
                            cart.original_price = null;
                            if ($rootScope.settings['site.enabled_plugins'].indexOf('Campaigns') > -1) {
                                if (cart.campaign_id !== null && cart.campaign_id !== undefined) {
                                    if (cart.discount_type === 'fixed') {
                                        model.discount_trigger = true;
                                        if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                            cart.original_price = $filter('multicurrencydiscount')(null, cart.discounted_amount, 'yes');
                                            cart.price = $filter('multicurrency')(cart.tier_id, cart.price);
                                        } else {
                                            cart.original_price = cart.discounted_amount;
                                        }
                                    }
                                }
                            }
                            if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1 && cart.discount_type !== 'fixed') {
                                if (cart.course_batch_id !== null && cart.course_batches_tier_id !== null) {
                                    cart.tier_id = cart.course_batches_tier_id;
                                }
                                cart.price = $filter('multicurrency')(cart.tier_id, cart.price);
                            }
                            $scope.Total_amount += parseFloat(cart.price);
                            model.original_amount += parseFloat(cart.price);
                            if ($rootScope.settings['site.enabled_plugins'].indexOf('Coupons') > -1) {
                                if (cart.coupon_id !== null && cart.coupon_id !== undefined) {
                                    var HundredPercentageExists = false;
                                    if (!HundredPercentageExists && parseFloat(cart.discount_percentage) >= 100) {
                                        HundredPercentageExists = true;
                                        model.hund_pre_exist = 'enable';
                                    }
                                }
                                if (cart.discount_amount !== null && cart.discount_amount !== undefined && parseFloat(cart.discount_amount) !== 0) {
                                    model.discount_trigger = true;
                                    cart.original_price = (parseFloat(cart.price) - parseFloat(cart.discount_amount));
                                    $scope.Total_amount -= parseFloat(cart.discount_amount);
                                }
                            }

                            //For analystics
                            productsTitles.push(cart.course_title);
                            var _price = 0;
                            _price = $rootScope.settings.geoIP.symbol && $rootScope.settings.geoIP.symbol != ConstCurrencies.Default ? cart.price*parseFloat($rootScope.settings.geoIP.rate) : cart.price;
                            items.push({
                                "SKU" : cart.course_id,
                                "ProductName" : cart.course_title,
                                "Quantity" : 1,
                                "ItemPrice" : _price,
                                "RowTotal" : _price*1,
                                "ProductURL" : encodeURI($rootScope.site_url+'course/'+cart.course_id+'/'+cart.course_slug.toLowerCase()),
                                "ImageURL" : $rootScope.site_url+'img/big_thumb/Course/'+cart.course_image_hash,
                                "ProductCategories" : [cart.category_name] 
                            });
                        });


                        //Analystics
                        var item = {
                            "$event_id" : model.cartlists[0].session_id, // The cart ID if you have it. Otherwise remove this line.
                            "ItemNames" : productsTitles,
                            "CheckoutURL": $rootScope.site_url + "cart",
                            "Items" : items
                        }

                        if($rootScope.settings.geoIP.symbol && $rootScope.settings.geoIP.symbol != ConstCurrencies.Default){
                            item.$value = model.original_amount*parseFloat($rootScope.settings.geoIP.rate);
                        } else {
                            item.$value = model.original_amount;
                        }
                        $analytics.eventTrack('Started Checkout', item);

                        $scope._metadata = response._metadata;
                        if (element !== null && angular.isDefined(element)) {
                            $('html, body').animate({
                                scrollTop: $(element).offset().top
                            }, 1500, 'swing', false);
                        }
                    } else {
                        flash.set(response.error.message, 'error', false);

                    }
                    model.loader = false;
                });
        }

        function removeCart(index) {
            var params = {};
            params.cartId = model.cartlists[index].id;
            params.userId = ($cookies.get("auth") !== null && angular.isDefined($cookies.get("auth"))) ? $rootScope.auth.id : $scope.SessionID;
            CartServiceFactory.remove(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        Getcart();
                        flash.set("Course has been removed from cart.", 'success', false);
                    } else {
                        flash.set("Course couldn't be removed from cart.", 'error', false);

                    }
                }, function (error) {
                    flash.set("Error occurred while removing course to cart.", 'error', false);
                });
        }

        function removeCoupon(index) {
            var params = {};
            params.id = model.cartlists[index].id;
            CouponRemoveFactory.get(params).$promise
                .then(function (response) {
                    if (response.error.code === 0) {
                        Getcart();
                        flash.set("Coupon has been removed from course.", 'success', false);
                    } else {
                        flash.set("Course couldn't be removed from course.", 'error', false);

                    }
                }, function (error) {
                    flash.set("Error occurred while removing course to course.", 'error', false);
                });
        }
        $scope.paginate = function (element) {
            $scope.currentPage = parseInt($scope.currentPage);
            Getcart(element);
        };
        var autoRefresh;
        $scope.autoReload = function () {
            autoRefresh = $interval(function () {
                $state.reload();
            }, 20000);
        };
        $scope.stopReload = function () {
            if (angular.isDefined(autoRefresh)) {
                $interval.cancel(autoRefresh);
                autoRefresh = undefined;
            }
        };
        $scope.$on('$destroy', function () {
            $scope.stopReload();
        });
        /**FUNCTION CALLING*/
        Getcart(null);
    });
    //Payment controller
    module.directive('bulkCheckout', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: "src/plugins/CourseBulkCheckout/bulkCheckoutButton.tpl.html",
            link: linker,
            controller: 'bulkCheckoutButtonController as model',
            bindToController: true,
            scope: {
                type: '@type',
                totalAmount: '@totalAmount',
                hundrePercentage: '@hundrePercentage'
            }
        };
    });
    module.controller('bulkCheckoutButtonController', function ($scope, $uibModal, $rootScope, $filter, $cookies, SweetAlert, courseCheckoutFactory, $window, $location, User) {
        var model = this;
        $scope.bulk_condition = {};
        $scope.bulk_condition.ischeckout = false;
        $scope.bulk_condition.freecheckout_modal = false;
        $scope.bulk_condition.referral_loader = false;
        model.takeCourseClick = takeCourseClick;
        $scope.bulk_condition.freecheckout_modal = false;
        $scope.bulk_condition.referral_loader = true;
        if ($rootScope.auth) {
            //Getting referral amount for each users
            User.getUser({
                id: $rootScope.auth.id,
                field: 'id,referral_earned_amount',
            }).$promise
                .then(function (response) {
                    $scope.bulk_condition.referral_loader = true;
                    if (response !== null && response !== undefined) {
                        if (response.data !== null && response.data !== undefined) {
                            if (response.data.length > 0) {
                                model.user_referral_amount = response.data[0].referral_earned_amount;
                                if (parseFloat(model.user_referral_amount) >= parseFloat(model.totalAmount)) {
                                    $scope.bulk_condition.freecheckout_modal = true;
                                }
                            }
                        }
                    }
                    $scope.bulk_condition.referral_loader = false;
                }).catch(function (error) {
                    $scope.bulk_condition.referral_loader = false;
                })
                .finally();

        }

        function takeCourseClick(e, type) {
            $scope.bulk_condition.ischeckout = true;
            e.preventDefault();
            if (!$.cookie('refresh_token')) {
                if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                    $scope.bulk_condition.ischeckout = false;
                    $scope.modalInstance = $uibModal.open({
                        scope: $scope,
                        templateUrl: 'users/login.tpl.html',
                        controller: 'userLoginController',
                        size: 'lg',
                        resolve: {
                            pageType: function () {
                                return "modal";
                            },
                            TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                                var promiseSettings = TokenService.promiseSettings;
                                return $q.all({
                                    load: promiseSettings.then(function (data) {
                                        if (angular.isDefined(data['ace.socialLogin']) && $ocLazyLoad.getModules().indexOf('ace.socialLogin') === -1) {
                                            var module = data['ace.socialLogin'];
                                            return $ocLazyLoad.load(module, {
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
                        // handle finally
                    });
                    $rootScope.modal = true;
                }
            } else {
                if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                    $scope.bulk_condition.ischeckout = false;
                    if (type === 'Free') {
                        /**
                         * Directly  pruchase the course with 3 cases
                         * case1: Referral amount greater or equal to Total amount,
                         * case2: If Total amount equal to 0,
                         * case3: 100% coupon applied and Total amount equal to 0;
                         */
                        $scope.modalInstance = $uibModal.open({
                            scope: $scope,
                            templateUrl: 'src/plugins/CourseBulkCheckout/bulkFreeCheckout.tpl.html',
                            controller: function ($scope, $uibModalStack, referralAmount, TotalAmount, $location, $cookies, courseCheckoutFactory, $rootScope, flash, HundredPercentageCoupon, $state) {
                                var model = this;
                                $scope.Checking_condition = {};
                                $scope.Checking_condition.referral_pruchase = false;
                                $scope.Checking_condition.hundre_coupon_pruchase = false;
                                $scope.TotalAmount = TotalAmount;
                                model.user_referral_amount = referralAmount;
                                if (HundredPercentageCoupon == 'enable' && parseFloat(TotalAmount) === 0) {
                                    $scope.Checking_condition.hundre_coupon_pruchase = true;
                                } else if (referralAmount > 0) {
                                    if (parseFloat(referralAmount) >= parseFloat(TotalAmount)) {
                                        $scope.Checking_condition.referral_pruchase = true;
                                    }
                                }
                                $scope.courseCheckout = function () {
                                    $scope.confirm_is_disabled = true;
                                    $scope.buyer = {};
                                    $scope.buyer.payment_gateway_id = 3;
                                    if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                                        // assigning the session_id cart from cart cookies
                                        var new_cookie1 = $cookies.getObject('cart_cookies');
                                        $scope.buyer.session_id = new_cookie1.hash;
                                    }
                                    if ($rootScope.settings['site.enabled_plugins'].indexOf('MultiCurrency') > -1) {
                                        //Multicurrency is enabled. Sending the country currency details
                                        $scope.buyer.currency_id = $rootScope.settings.geoIP.id;
                                    }
                                    courseCheckoutFactory.create($scope.buyer, function (response) {
                                        if (response.error.code === 0) {
                                            if (angular.isDefined(response.data)) {
                                                if (angular.isDefined(response.data.approval_link)) {
                                                    $window.location.href = response.data.approval_link;
                                                }
                                            } else if (response.error.code === 0) {
                                                flashMessage = $filter("translate")("Your have enrolled the  courses successfully.");
                                                flash.set(flashMessage, 'success', false);
                                                if (angular.isDefined(response.id)) {
                                                    $state.go('UserPurchaseOrderReceipt', { id: response.id });
                                                } else {
                                                    $state.go('myCoursesLearning');
                                                }
                                            } else if (response.error.code === 512) {
                                                flashMessage = $filter("translate")("Enrolled Failed. Please, try again.");
                                                flash.set(flashMessage, 'error', false);
                                            }
                                        } else {
                                            flashMessage = $filter("translate")("We are unable to enroll the courses. Please try again.");
                                            flash.set(flashMessage, 'error', false);
                                        }
                                        $uibModalStack.dismissAll();
                                        $scope.confirm_is_disabled = true;

                                    }, function (error) {
                                        if (error.status === 502) {
                                            flashMessage = $filter("translate")("Enroll process could not be completed.");
                                            flash.set(flashMessage, 'error', false);
                                        } else {
                                            flashMessage = $filter("translate")("Enroll process could not be completed.Pls try again later");
                                            flash.set(flashMessage, 'error', false);
                                        }
                                        $uibModalStack.dismissAll();
                                        $scope.confirm_is_disabled = true;
                                    });
                                };

                                //payment from closing
                                $scope.modalClose = function (e) {
                                    e.preventDefault();
                                    $uibModalStack.dismissAll();
                                };
                            },
                            resolve: {
                                referralAmount: function () {
                                    return model.user_referral_amount;
                                },
                                TotalAmount: function () {
                                    return model.totalAmount;
                                },
                                HundredPercentageCoupon: function () {
                                    return model.hundrePercentage;
                                }
                            },
                            size: 'lg',
                        }).result.then(function (result) {
                            $rootScope.modal = false;
                        }, function (result) {
                            $rootScope.modal = false;
                        }).finally(function () {
                            $rootScope.modal = false;
                        });
                    } else if (type === 'Cost') {
                        //go to payment for purchasing the courses
                        $scope.modalInstance = $uibModal.open({
                            scope: $scope,
                            templateUrl: 'src/plugins/CourseBulkCheckout/bulkCheckoutPayment.tpl.html',
                            controller: 'CheckoutpaymentController as model',
                            size: 'lg',
                            resolve: {
                                TotalAmount: function () {
                                    return model.totalAmount;
                                },
                                referralAmount: function () {
                                    return model.user_referral_amount;
                                },
                            }
                        }).result.then(function (result) {
                            $rootScope.modal = false;
                        }, function (result) {
                            $rootScope.modal = false;
                        }).finally(function () {
                            $rootScope.modal = false;
                            // handle finally
                        });
                    }
                    $rootScope.modal = true;
                }
            }
        }
    });

    module.controller('CheckoutpaymentController', function ($scope, getGatewaysByUser, $sce, Countries, payNow, ViewCourse, $state, $window, $location, flash, $filter, $rootScope, $uibModalStack, $cookies, courseCheckoutFactory, TotalAmount, User, referralAmount, ConstCurrencies) {
        var model = this;
        $rootScope.pageTitle = $filter("translate")("Payment")+ " | " +$rootScope.settings['site.name'];
        /**VARIABLE DECLARATION */
        model.course = [];
        $scope.gatewayError = '';
        model.loading = true;
        model.coupon = {};
        $scope.buyer = {};
        /**VARIABLE VALUE ASSIGN  */
        $scope.TotalAmount = TotalAmount;
        $scope.isUsd = true;
        if($rootScope.settings.geoIP.symbol && $rootScope.settings.geoIP.symbol != ConstCurrencies.Default){
          $scope.isUsd = false;
          $scope.TotalAmountDollar = $filter('number')(TotalAmount*parseFloat($rootScope.settings.geoIP.rate), 2);
          $scope.rate = parseFloat($rootScope.settings.geoIP.rate);
        }
        $scope.paynow_is_disabled = false;
        $scope.payment_note_enabled = false;
        $scope.payer_form_enabled = true;
        $scope.save_btn = false;
        $scope.first_gateway_id = "";
        $scope.is_wallet_page = true;
        $scope.is_show_pay = false;
        /***FUNCTION ASSIGN WITH MODEL */
        model.courseCheckout = courseCheckout;
        model.user_referral_amount = referralAmount;
        // calling and getting the payment gateway list
        function getGatewaysList() {
            Countries.get({
                limit: 'all'
            }).$promise.then(function (response) {
                $scope.countries = response.data;
            });
            $scope.is_show_pay = true;
            var payment_gateways = [];
            getGatewaysByUser.get({}, function (payment_response) {
                $scope.group_gateway_id = "";
                if (payment_response.error.code === 0 && payment_response.zazpay) {
                    delete payment_response.zazpay.gateways[3];
                    angular.forEach(payment_response.zazpay.gateways, function (gateway_group_value, gateway_group_key) {
                        if (gateway_group_key === 0) {
                            $scope.group_gateway_id = gateway_group_value.id;
                            $scope.first_gateway_id = gateway_group_value.id;
                        }
                        //jshint unused:false
                        angular.forEach(gateway_group_value.gateways, function (payment_geteway_value, payment_geteway_key) {
                            var payment_gateway = {};
                            var suffix = 'sp_';
                            if (gateway_group_key === 0) {
                                $scope.sel_payment_gateway = 'sp_' + payment_geteway_value.id;
                            }
                            suffix += payment_geteway_value.id;
                            payment_gateway.id = payment_geteway_value.id;
                            payment_gateway.payment_id = suffix;
                            payment_gateway.group_id = gateway_group_value.id;
                            payment_gateway.display_name = payment_geteway_value.display_name;
                            payment_gateway.thumb_url = payment_geteway_value.thumb_url;
                            payment_gateway.suffix = payment_geteway_value._form_fields._extends_tpl.join();
                            payment_gateway.form_fields = payment_geteway_value._form_fields._extends_tpl.join();
                            payment_gateway.instruction_for_manual = payment_geteway_value.instruction_for_manual;
                            payment_gateways.push(payment_gateway);
                        });
                    });
                    $scope.gateway_groups = payment_response.zazpay.gateways;
                    $scope.payment_gateways = payment_gateways;
                    $scope.form_fields_tpls = payment_response.zazpay._form_fields_tpls;
                    $scope.show_form = [];
                    $scope.form_fields = [];
                    angular.forEach($scope.form_fields_tpls, function (key, value) {
                        if (value === 'buyer') {
                            $scope.form_fields[value] = 'buyer.html';
                        }
                        if (value === 'credit_card') {
                            $scope.form_fields[value] = 'credit_card.html';
                        }
                        if (value === 'manual') {
                            $scope.form_fields[value] = 'manual.html';
                        }
                        $scope.show_form[value] = true;
                    });
                    $scope.gateway_id = 1;
                    model.loading = false;
                }
            });
        }
        //  updating payment gatways assigning while changing the tab
        $scope.paymentGatewayUpdate = function (pane) {
            if (pane === 'Manual / Offline') {
                $scope.payment_note_enabled = true;
            }
            var keepGoing = true;
            $scope.buyer = {};
            $scope.PaymentForm.$setPristine();
            $scope.PaymentForm.$setUntouched();
            angular.forEach($scope.form_fields_tpls, function (key, value) {
                $scope.show_form[value] = false;
            });
            $scope.gateway_id = 1;
            angular.forEach($scope.gateway_groups, function (res) {
                if (res.display_name === pane && pane !== 'Wallet') {
                    var selPayment = '';
                    angular.forEach($scope.payment_gateways, function (response) {
                        if (keepGoing) {
                            if (response.group_id === res.id) {
                                selPayment = response;
                                keepGoing = false;
                                $scope.paymentFormUpdate(selPayment.id, selPayment.form_fields);
                            }
                        }
                    });
                    $scope.sel_payment_gateway = "sp_" + selPayment.id;
                    $scope.group_gateway_id = selPayment.group_id;
                }
            });
        };
        $scope.paymentFormUpdate = function (res, res1) {
            $scope.paynow_is_disabled = false;
            $scope.sel_payment_gateway = "sp_" + res;
            $scope.array = res1.split(',');
            angular.forEach($scope.array, function (value) {
                $scope.show_form[value] = true;
            });
        };
        //overall cart item checkout function
        function courseCheckout(valid) {
            $scope.paynow_is_disabled = true;
            $scope.buyer.payment_gateway_id = $scope.gateway_id;
            if ($scope.sel_payment_gateway) {
                $scope.buyer.gateway_id = $scope.sel_payment_gateway.split('_')[1];
            }
            if (angular.isDefined($scope.buyer.credit_card_expired) && ($scope.buyer.credit_card_expired.month || $scope.buyer.credit_card_expired.year)) {
                $scope.buyer.credit_card_expire = $scope.buyer.credit_card_expired.month + "/" + $scope.buyer.credit_card_expired.year;
            }
            // assigning the session_id from the cart
            if ($cookies.getObject('cart_cookies') !== null && $cookies.getObject('cart_cookies') !== undefined) {
                var new_cookie1 = $cookies.getObject('cart_cookies');
                $scope.buyer.session_id = new_cookie1.hash;
            }
            courseCheckoutFactory.create($scope.buyer, function (response) {
                if (response.error.code === -4) {
                    if (angular.isDefined(response.gateway_callback_url)) {
                        $window.location.href = response.gateway_callback_url;
                    }
                }
                if (response.error.code === 0) {
                    if (angular.isDefined(response.gateway_callback_url)) {
                        $window.location.href = response.gateway_callback_url;
                    } else if (response.status === 'Pending' && response.error.code === 0) {
                        flashMessage = $filter("translate")("Your payment is in pending.");
                        flash.set(flashMessage, 'error', false);
                    } else if (response.status === 'Captured' && response.error.code === 0) {
                        flashMessage = $filter("translate")("Your order placed successfully.");
                        flash.set(flashMessage, 'success', false);
                    } else if (response.error.code === 0 && response.status === 'Completed') {
                        flashMessage = $filter("translate")("Payment successfully completed.");
                        flash.set(flashMessage, 'success', false);
                    } else if (response.error.code === 512) {
                        flashMessage = $filter("translate")("Payment Failed. Please, try again.");
                        flash.set(flashMessage, 'error', false);
                    }
                } else {
                    flashMessage = $filter("translate")("We are unable to place your order. Please try again.");
                    flash.set(flashMessage, 'error', false);
                }
                $state.go('myCoursesLearning');
                $uibModalStack.dismissAll();
                $scope.paynow_is_disabled = true;

            }, function (error) {
                if (error.status === 502) {
                    flashMessage = $filter("translate")("payment could not be completed.");
                    flash.set(flashMessage, 'error', false);
                    $uibModalStack.dismissAll();
                } else {
                    flashMessage = $filter("translate")("payment could not be completed.Pls try again later");
                    flash.set(flashMessage, 'error', false);
                    $uibModalStack.dismissAll();
                }

            });
        }
        //payment from closing
        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();
        };
        //for coupon form  enabled
        $scope.IsCouponFormVisible = false;
        $scope.ShowHideCouponForm = function (e) {
            e.preventDefault();
            $scope.IsCouponFormVisible = $scope.IsCouponFormVisible ? false : true;
        };
        //for coupon form
        $scope.payCouponClick = function () {
            model.coupon.id = model.course.id;
            if (model.coupon.coupon_code === '' || model.coupon.coupon_code === undefined) {
                $scope.coupon_validation_msg = $filter("translate")("Please Enter Coupon Code");
                return;
            }
            $scope.coupon_is_disabled = true;
            payNow.paynowpost(model.coupon, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Coupon successfully applied.");
                    flash.set(flashMessage, 'success', false);
                    courseTitle = model.course.slug;
                    $location.path("/learn-course/" + model.course.id + "/" + courseTitle);
                } else {
                    $scope.coupon_is_disabled = false;
                    $scope.coupon_validation_msg = response.error.message;
                    $scope.coupon_error_id = response.error.code;
                }
            });
        };
        /***FUNCTION CALLING WITH MODEL */
        getGatewaysList();

    });
})(angular.module('ace.carts'));

(function (module) {

    module.factory('CartsService', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/carts', {}, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('CartServiceFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/carts/:cartId/:userId', {
                cartId: '@cartId'
            }, {
                remove: {
                    method: 'DELETE',
                    params: {
                        userId: '@userId',
                        cartId: '@cartId',
                    }
                }
            }
        );
    });
    //payment
    module.factory('getGatewaysByUser', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/get_gateways', {
                user_id: '@user_id',
                gateway_type: '@gateway_type'
            }
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
    module.factory('courseCheckoutFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/checkout', {
                id: '@id'
            }, {
                create: {
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
    module.factory('CouponRemoveFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/carts/:id/coupon_cancel?', {
                id: '@id'
            }
        );
    });
    module.factory('TransactionList', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/transactions', {
                id: '@id'
            }
        );
    });
})(angular.module("ace.carts"));
