(function(app) {
  var Auth = Array();
  app.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', '$ocLazyLoadProvider', 'GENERAL_CONFIG', 'isMobileProvider', function($stateProvider, $urlRouterProvider, $translateProvider, $ocLazyLoadProvider, GENERAL_CONFIG, isMobileProvider) {
    $urlRouterProvider.otherwise('/');
    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/js/l10n/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage(GENERAL_CONFIG.preferredLanguage);
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useLocalStorage(); // saves selected language to localStorage
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escape');
  }]);
  app.config(function($authProvider, GENERAL_CONFIG) {
    if (self !== top) {
      var url = GENERAL_CONFIG.api_url + 'api/v1/providers';
      var params = {};
      $.get(url, params, function(response) {
        var credentials = {};
        var url = GENERAL_CONFIG.api_url;
        angular.forEach(response.data, function(res, i) {
          credentials = {
            clientId: res.api_key,
            redirectUri: url + 'api/v1/auth?type=' + angular.lowercase(res.name)
          };
          if (res.name === 'Facebook') {
            $authProvider.facebook(credentials);
          }
          if (res.name === 'Google') {
            $authProvider.google(credentials);
          }
          if (res.name === 'LinkedIn') {
            $authProvider.linkedin(credentials);
          }
          if (res.name === 'Twitter') {
            $authProvider.twitter({
              url: url + 'api/v1/auth?type=' + angular.lowercase(res.name)
            });
          }
        });
      });
    }
  });
  /**
   *  Language
   *
   */
  // Service definition
  app.factory('Language', function($translate) {
    //add the languages you support here. ar stands for arabic
    var rtlLanguages = ['ar'];

    var isRtl = function() {
      var languageKey = $translate.use() || $translate.preferredLanguage();
      for (var i = 0; i < rtlLanguages.length; i += 1) {
        // You may need to change this logic depending on your supported languages (possible languageKey values)
        // This code will match both "ar", "ar-XXX" locales. It won't match any other languages as we only support en, es, ar.
        if (languageKey.indexOf(rtlLanguages[i]) > -1)
          return true;
      }
      return false;
    };

    //public api
    return {
      isRtl: isRtl
    };
  });

  app.run(['$rootScope', '$translate', 'SessionService', '$location', '$window', '$auth', '$timeout', 'GENERAL_CONFIG', 'ImgLazyLoad','Language','Slug', '$cookies', 'isMobile', function($rootScope, $translate, SessionService, $location, $window, $auth, $timeout, GENERAL_CONFIG, ImgLazyLoad, Language, Slug, $cookies, isMobile) {
    $rootScope.Language = Language;
    $rootScope.is_fresh_call = 1;
    $rootScope.ImgLazyLoad = ImgLazyLoad;
    $rootScope.GENERAL_CONFIG = GENERAL_CONFIG;

    $rootScope.slugify = function(input) {
        return Slug.slugify(input);
    };


    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.isAuth = $rootScope.isAuth;
      $rootScope.ld = undefined;
      $rootScope.pageBool = true;
      $rootScope.isMobile = isMobile.phone || isMobile.tablet;
      $rootScope.absUrl = decodeURI($location.absUrl());
      if (angular.isDefined(toState.url)) {
        $rootScope.isHome = false;
        $rootScope.isCourse = false;
        $rootScope.currentURL = toState.url;
        if (toState.url === '/?utm_source&utm_medium&utm_campaign') {
          $rootScope.isHome = true;
          //redirect to home, if user logged in
          // if ($rootScope.isAuth) {
          //   $rootScope.isHome = false;
          //   $location.path('/courses/search').replace();
          // }
        }
        if (toState.url === '/course/{id}/{slug}') {
          $rootScope.isCourse = true;
        }
      }
      if (toState.url.indexOf('/users/login') !== -1 || toState.url.indexOf('/users/forgot_password') !== -1) {
        if ($rootScope.isAuth) {
          $location.path('/');
        }
      }

      if (angular.isDefined(toState.data.activetab)) {
        $rootScope.activetab = toState.data.activetab;
      }
      if (angular.isDefined(toState.data.profile_activetab)) {
        $rootScope.profile_activetab = toState.data.profile_activetab;
      }
      $rootScope.status = '';
      $rootScope.is_home_page = false;
      $rootScope.currentState = toState.name

      if (toState.name === 'home') {
        $rootScope.is_home_page = true;
      }
      $rootScope.is_learn_page = false;
      if (toState.name === 'LearnCourse' || toState.name === 'LearnCourseEmpty') {
        $rootScope.is_learn_page = true;
      }

      var exception_arr = ['/', '/users/signup?subscription_id', '/course/{id}/{slug}?utm_source&utm_medium&utm_campaign&campaign_id', '/users/login', '/courses', '/users/activation/:id/:hash/:ex_token', '/users/forgot_password', '/courses/search?category_id&query&price&instructionLevel&language&sort&type&feature&page', '/subscribe/plans', '/users', '/user/{id}/{slug}', '/category/{category_id}/{slug}?query&price&instructionLevel&language&sort&type&feature&page', '/social-login', '/social-login/email', '/learn-course/{id:int}/{lesson:int}/{slug}?learn&is_preview', '/learn-course/{id:int}/{slug}?learn&is_preview', '/page/{slug}?language', '/contactus', '/error/:id', '/business', '/support/{type}?q', '/support/{Category_id}/content/{id}/{type}', '/support/Categories/{id}/{type}', '/get-quote', '/news', '/news/{id}', '/category/{id}/news', '/instructor/{id}/{slug}'];

      if (angular.isDefined(toState.url)) {
        if ($.inArray(toState.url, exception_arr) === -1 && !SessionService.getUserAuthenticated()) {
          $location.path('/');
        }
      }
      if (toState.url.indexOf('/users/signup?subscription_id') !== -1 || toState.url.indexOf('/users/login') !== -1 || toState.url.indexOf('/users/forgot_password') !== -1) {
        $rootScope.$broadcast('updateParent', {
          is_login: true
        });
      } else {
        $rootScope.$broadcast('updateParent', {
          is_login: false
        });
      }
    });

    $rootScope.$watch('pageTitle', function (value) {
      if(value != undefined && value != null && value != '' && $rootScope.ld == undefined){ 
        $rootScope.ld = {
            "@context":"https:/schema.org",
            "@type":"Organization",
            "url":$rootScope.site_url,
            "sameAs":[
              "https://www.facebook.com/tmoohco",
              "https://www.instagram.com/tmoohco/",
              // "https://www.linkedin.com/company/1414157/",
              "https://www.youtube.com/c/Tmoohco",
              "https://www.pinterest.com/tmoohco/",
              "https://plus.google.com/+Tmoohco",
              "https://twitter.com/tmoohco"
            ],
            "@id":$rootScope.site_url + "#organization",
            "name":$rootScope.settings['site.name'],
            "logo":$rootScope.site_url+ 'assets/apple-touch-icon-114x114.png'

        };
          // $rootScope.ld = {
          //   "@context": "http://schema.org/",
          //   "@type": $rootScope.isHome ? "WebSite" : "article",
          //   "name": 'Tmooh',
          //   "image": $rootScope.metaImage == undefined?$rootScope.site_url+ 'assets/apple-touch-icon-114x114.png' : $rootScope.site_url + $rootScope.metaImage,
          //   "description": $rootScope.metaDescription,
          //   "url": $rootScope.site_url,
          //   "title": $rootScope.pageTitle,
          // };
      }

    });

    //temp fix
    if(!$.cookie('tmp_fix1') ){
      var week = new Date();
      week.setDate(week.getDate() + 7);
      $cookies.put("tmp_fix1", 'nothing', {
          expires: week,
          path: '/',
          domain: 'tmooh.com',
      });
      $.removeCookie('CloudFront-Key-Pair-Id');
      $.removeCookie('CloudFront-Signature');
      $.removeCookie('CloudFront-Policy');
    }


    if(!$.cookie('referrer') && document.referrer && document.referrer != 'document.referrer '){
        if(document.referrer.indexOf('tmooh.com') === -1 && document.referrer.indexOf('tmooh.xtest') === -1){
            var year = new Date();
            year.setFullYear(new Date().getFullYear() + 1);
            $cookies.put("referrer", document.referrer, {
                expires: year,
                path: '/',
                // domain: 'tmooh.com',
            });
        }
    }





    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.success_state_name = toState.name;
      $rootScope.success_state_params = toParams;
    });
    $rootScope.$on('$viewContentLoaded', function() {
      if (!$('#preloader').hasClass('loadAG')) {
        $('#status').fadeOut(600);
        $('#preloader').delay(600).fadeOut(600 / 2);
      }
    });
    if (self !== top) {
      var url = GENERAL_CONFIG.api_url + 'api/v1/providers';
      var params = {};
      var clientId = '';
      $.get(url, params, function(response) {
        angular.forEach(response.data, function(res, i) {
          if (res.name === 'Facebook') {
            clientId = res.api_key;
          }
        });
        $window.fbAsyncInit = function() {
          FB.init({
            appId: clientId,
            channelUrl: 'app/channel.html',
            status: true,
            version: 'v2.5',
            cookie: true,
            xfbml: true
          });
          watchLoginChange();
        };
        (function(d) {
          // load the Facebook javascript SDK
          var js,
            id = 'facebook-jssdk',
            ref = d.getElementsByTagName('script')[0];

          if (d.getElementById(id)) {
            return;
          }
          js = d.createElement('script');
          js.id = id;
          js.async = true;
          js.src = "//connect.facebook.net/en_US/sdk.js";

          ref.parentNode.insertBefore(js, ref);

        }(document));

        watchLoginChange = function() {
          var _self = this;
          FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              if (!$.cookie('refresh_token')) {
                $auth.authenticate('facebook');
              }
            } else {
              if ($.cookie('refresh_token')) {
                SessionService.setUserAuthenticated(false);
                Auth = Array();
                $rootScope.isAuth = false;
                $.removeCookie('auth');
                $.removeCookie('token');
                $.removeCookie('refresh_token');
                $.removeCookie('isUser');
                $.removeCookie('enabled_plugins');
                location.reload(true);
              }
            }
          });
        };
      });
    }
  }]);

  app.controller('AppController', ['$scope', 'SessionService', '$rootScope', 'GENERAL_CONFIG', 'tmhDynamicLocale', '$translate', '$cookies', '$uibModal', '$uibModalStack', 'expireCookie', '$analytics', function($scope, SessionService, $rootScope, GENERAL_CONFIG, tmhDynamicLocale, $translate, $cookies, $uibModal, $uibModalStack, expireCookie, $analytics) {
    var currentLanguage = $translate.use() || $translate.storage().get($translate.storageKey()) || $translate.preferredLanguage();
    tmhDynamicLocale.set(currentLanguage);
    GENERAL_CONFIG.api_url = GENERAL_CONFIG.api_url.indexOf('http') >= 0 ?  GENERAL_CONFIG.api_url : window.location.protocol + '//' + window.location.host + GENERAL_CONFIG.api_url;
    // fetch the cookie value and set it back in Auth variable in each refresh of window
    if ($cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
      SessionService.setUserAuthenticated(true);
      $rootScope.isAuth = true;
      $rootScope.auth = JSON.parse($cookies.get("auth"));
      $analytics.setUsername($rootScope.auth.id);
      $analytics.setUserProperties($rootScope.auth);
        if(typeof zE !== "undefined"){
          zE(function() {
            zE.identify({
              id: $rootScope.auth.id,
              name: $rootScope.auth.displayname,
              email: $rootScope.auth.email,
            });
          });
        }
      
    }
    $rootScope.$on('updateAuthParent', function(event, args) {
      if (args.isAuth === true) {
        SessionService.setUserAuthenticated(true);
        $rootScope.isAuth = true;
        if (args.auth !== undefined) {
          $cookies.put('auth', JSON.stringify(args.auth), {
            path: '/'
          });
          $rootScope.auth = args.auth;
        }
      } else {
        $rootScope.isAuth = false;
      }
    });

    //Campaign Cookies Setting for 7 days
    $rootScope.$on('UpdateParentCampaign', function(event, args) {
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);
      $.cookie('campaign', JSON.stringify(args.campaign), {
        expires: expireDate,
        path: '/'
      });
    });
    /*if ($cookies.getObject('site_construction') === null || angular.isUndefined($cookies.getObject('site_construction'))) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'home/siteConstruction.tpl.html',
            size: 'lg',
            controller: function ($scope, $uibModalStack, $uibModal, $cookies) {
                $cookies.putObject('site_construction', 1);
                $scope.modalClose = function (e) {
                    e.preventDefault();
                    $scope.$close();
                };
            }
        });
    }*/
    $rootScope.site_url = GENERAL_CONFIG.api_url;
  }]);

  app.config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('interceptor');
      $httpProvider.interceptors.push('themeSwitchEngine');
      $httpProvider.interceptors.push('oauthTokenInjector');
      // to fix ie9 get request cache issues
      $httpProvider.defaults.headers.common = {};
      $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
      $httpProvider.defaults.headers.common.Pragma = "no-cache";
      $httpProvider.defaults.headers.common["If-Modified-Since"] = "0";
    }
  ]);

  app.factory('interceptor', ['$q', '$location', '$injector', '$rootScope', 'SessionService', 'flash', '$window', '$timeout', 'PendingRequestsService', 'GENERAL_CONFIG', '$filter', '$cookies', function($q, $location, $injector, $rootScope, SessionService, flash, $window, $timeout, PendingRequestsService, GENERAL_CONFIG, $filter, $cookies) {
    return {
      // On response success
      response: function(response) {
        if (angular.isDefined(response.data)) {
          if (angular.isDefined(response.data.error) && parseInt(response.data.error.code) === 1 && response.data.error.message === 'Authentication failed') {
            flash.set('Authentication failed. Pls try again later.', 'error', false);
          }
          // If thrid party network not return email address means we need to get it from user.
          if (angular.isDefined(response.data.thrid_party_login_no_email)) {
            $rootScope.$broadcast('getEmailFromUser', {
              thrid_party_profile: response.data,
            });
          }
          // For thrid party login
          if (angular.isDefined(response.data.thrid_party_login)) {
            if (angular.isDefined(response.data.error)) {
              if (angular.isDefined(response.data.error.code) && parseInt(response.data.error.code) === 0) {
                // If error code 0 means logined succesfully. So set the returned user details in Auth variable and also in cookies. So if you refresh the window means, Auth variable will reset. To handle this we fetch the cookies value and set it back to the Auth.
                var user_cokkies_details = ['id', 'providertype', 'accesstoken', 'displayname', 'designation', 'referral_earned_amount', 'headline', 'sub_admin_id', 'image_hash', 'token', 'email', 'available_credits', 'site_url','isemailverified'];

                SessionService.setUserAuthenticated(true);
                Auth = {};
                angular.forEach(response.data.user, function(value, key) {
                  if (user_cokkies_details.indexOf(key) > -1) {
                    if (key !== 'image_hash') {
                      Auth[key] = value;
                    } else {
                      Auth.user_image_hash = value;
                    }
                  }
                });
                Auth.site_url = GENERAL_CONFIG.api_url;
                /* Auth = {};
                 Auth.id = response.data.user.id;
                 Auth.providertype = response.data.user.providertype;
                 Auth.accesstoken = response.data.user.accesstoken;
                 Auth.displayname = response.data.user.displayname;
                 Auth.designation = response.data.user.designation;
                 Auth.headline = response.data.user.headline;
                 Auth.user_image_hash = response.data.user.image_hash;
                 Auth.token = response.data.user.token;
                 Auth.site_url = GENERAL_CONFIG.api_url;
                 _cookieAuth = {};
                 _cookieAuth.id = Auth.id;
                 _cookieAuth.providertype = Auth.providertype;
                 _cookieAuth.accesstoken = Auth.accesstoken;
                 _cookieAuth.displayname = Auth.displayname;
                 _cookieAuth.token = Auth.token;
                 _cookieAuth.designation = Auth.designation;
                 _cookieAuth.headline = Auth.headline;
                 _cookieAuth.userImageHash = Auth.user_image_hash;
                 token = response.data.access_token;*/
                $cookies.put('auth', JSON.stringify(Auth), {
                  path: '/'
                });
                $cookies.put('token', response.data.access_token, {
                  path: '/'
                });
                $cookies.put('refresh_token', response.data.refresh_token, {
                  path: '/'
                });
                $rootScope.$emit('updateParent', {
                  isAuth: true,
                  auth: Auth
                });
                $rootScope.auth = Auth;
                $rootScope.isAuth = true;
                $rootScope.isUser = false;
                // refreshing header and become an instructor
                $rootScope.$emit('refreshHeader', {
                  isAuth: true,
                });
                $rootScope.$emit('checkIsTeacher', {});
                var redirectto = $location.absUrl().split('/');
                if (Auth.providertype == "admin") {
                  redirectpath = redirectto[0] + '/ag-admin';
                  window.location.href = redirectpath;
                } else {
                  var promise;
                  promise = $.get(GENERAL_CONFIG.api_url + 'api/v1/settings', {
                    limit: 'all'
                  });
                  promise.then(function(settingsData) {
                    settingsResponse = angular.fromJson(settingsData);
                    if (settingsResponse.data) {
                      var enabledPlugins = '';
                      $.each(settingsResponse.data, function(i, settingData) {
                        if (settingData.name === 'site.enabled_plugins') {
                          enabledPlugins = settingData.value;
                        }
                      });
                      redirectpath = '/my-courses/learning';
                      var modalService = $injector.get('$uibModalStack');
                      modalService.dismissAll();

                      var currentPath = $location.path();
                      if (currentPath === "" || currentPath === "users/login" || currentPath === "users/forgot_password" || currentPath === "users/signup?subscription_id" || currentPath === "users/signup") {
                          $location.path('/my-courses/learning').replace();
                      } else {
                          $window.location.reload();
                      }
                      // $location.path(redirectpath).replace();
                    }
                  });
                }
              } else {
                flash.set(response.data.error.message, 'error', false);
              }
            }
          }
          // When the reseponse is returned from thrid party connection means we need to refresh the connection  icons in settings page .
          if (angular.isDefined(response.data.thrid_party_connection)) {
            if (angular.isDefined(response.data.error.code) && parseInt(response.data.error.code) === 0) {
              flash.set('Successfully connected to ' + response.data.provider_name, 'success', false);
              $rootScope.$broadcast('reloadConnectBlock', {
                update_profile_image: (parseInt(response.data.thrid_party_provider_id) === 1) ? true : false,
              });
            } else {
              flash.set(response.data.error.message, 'error', false);
            }
          }
        }
        PendingRequestsService.remove({
          url: response.config.url
        });
        // Return the response or promise.
        return response || $q.when(response);
      },

      // On response failture
      responseError: function(response) {
        // Return the promise rejection.
        if (response.status === 401) {
          if ($cookies.get("auth") !== null && $cookies.get("auth") !== undefined) {
            var auth = JSON.parse($cookies.get("auth"));
            var refresh_token = $cookies.get("refresh_token");
            if (refresh_token === null || refresh_token === '' || refresh_token === undefined) {
              SessionService.setUserAuthenticated(false);
              Auth = Array();
              token = '';
              $cookies.remove("cart_cookies", {
                path: "/"
              });
              $cookies.remove("auth", {
                path: "/"
              });
              $cookies.remove("token", {
                path: "/"
              });
              $cookies.remove("refresh_token", {
                path: "/"
              });
              $cookies.remove("enabled_plugins", {
                path: "/"
              });
              var redirectto = $location.absUrl().split('/');
              redirectto = redirectto[0] + '/users/login';
              window.location.href = redirectto;
              $rootScope.refresh_token_loading = false;
            } else {
              if ($rootScope.refresh_token_loading !== true) {
                $rootScope.refresh_token_loading = true;
                refresh_token = $cookies.get("refresh_token");
                $.get(GENERAL_CONFIG.api_url + 'api/v1/refresh_token?token=' + refresh_token, function(tokenData) {
                  tokenData = angular.fromJson(tokenData);
                  if (angular.isDefined(tokenData.access_token)) {
                    $rootScope.refresh_token_loading = false;
                    $cookies.put('token', tokenData.access_token, {
                      path: '/'
                    });
                    $cookies.put('refresh_token', tokenData.refresh_token, {
                      path: '/'
                    });
                    $timeout(function() {
                      $window.location.reload();
                    }, 1000);
                  } else {
                    $cookies.remove("auth", {
                      path: "/"
                    });
                    $cookies.remove("token", {
                      path: "/"
                    });
                    $cookies.remove("refresh_token", {
                      path: "/"
                    });
                    var refresh_redirectto = $location.absUrl().split('/');
                    refresh_redirectto = redirectto[0] + '/users/login';
                    $rootScope.refresh_token_loading = false;
                    window.location.href = refresh_redirectto;
                  }
                });
              }
            }
          } else {
            $cookies.remove("auth", {
              path: "/"
            });
            $cookies.remove("token", {
              path: "/"
            });
            $cookies.remove("refresh_token", {
              path: "/"
            });
            $location.path('/users/login');
            $timeout(function() {
              $window.location.reload();
            }, 1000);
          }
        }
        if (response.status !== 200) {
          $rootScope.$emit('websiteEmit', {
            errorNo: response.status
          });
        }
        return $q.reject(response);
      }
    };
  }]);

  app.factory('themeSwitchEngine', ['$rootScope', '$timeout', 'GENERAL_CONFIG',
    function($rootScope, $timeout) {
      var themeSwitchEngine = {
        request: function(config) {
          if (config.url.indexOf('.tpl.html') !== -1 && config.url.indexOf('plugins/') === -1) {
            config.url = 'themes/' + theme + '/views/' + config.url;
          }
          return config;
        }
      };
      return themeSwitchEngine;
    }
  ]);

  app.factory('oauthTokenInjector', ['$rootScope', '$timeout', '$q', 'PendingRequestsService', '$cookies',
    function($rootScope, $timeout, $q, PendingRequestsService, $cookies) {
      var oauthTokenInjector = {
        request: function(config) {
          if (config.url.indexOf('.html') === -1) {

            if (config.url !== 'https://tmooh-media.s3.amazonaws.com/' && config.url !== '//s3-eu-central-1.amazonaws.com/tmooh-media') {
              if ($cookies.get("token") !== null && $cookies.get("token") !== undefined) {
                var sep = config.url.indexOf('?') === -1 ? '?' : '&';
                config.url = config.url + sep + 'token=' + $cookies.get("token");
              }
            }
          }
          return config;
        }
      };
      return oauthTokenInjector;
    }
  ]);

  /**
   * @ngdoc service
   * @name PendingRequestsService
   * @description
   * To find how many request are pending and cancel the pending the request
   *
   *
   **/
  app.service('PendingRequestsService', function() {
    var pending = [];
    this.get = function() {
      return pending;
    };
    this.add = function(request) {
      pending.push(request);
    };
    this.remove = function(request) {
      angular.forEach(pending, function(p, i) {
        if (p.url === request.url) {
          pending.splice(i, 1);
        }
      });
    };
    this.cancelAll = function() {
      if (pending !== undefined) {
        angular.forEach(pending, function(p) {
          p.canceller.resolve();
        });
        pending = [];
      }
    };
  });
  /*  refresh token getting service*/
  app.factory('refreshToken', function($resource) {
    return $resource('/api/v1/refresh_token', {}, {
      get: {
        method: 'GET'
      }
    });
  });
  app.service('SessionService', ['$rootScope', function($rootScope) {
    var userIsAuthenticated = false;
    this.setUserAuthenticated = function(value) {
      userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function() {
      return userIsAuthenticated;
    };

    var unregisterUpdateParent = $rootScope.$on('updateParent', function(event, args) {
      if (args.isAuth !== undefined) {
        $rootScope.isAuth = args.isAuth;
      }
      if (args.menu) {
        $rootScope.menu = args.menu;
      }
      if (args.auth !== undefined) {
        $rootScope.auth = args.auth;
      }
      if (args.isShowDropMenu !== undefined) {
        $rootScope.isShowDropMenu = args.isShowDropMenu;
      }
      if (args.edit_temp !== undefined) {
        $rootScope.edit_temp = args.edit_temp;
      }
      if (args.isOn404 !== undefined) {
        $rootScope.isOn404 = args.isOn404;
      } else {
        $rootScope.isOn404 = false;
      }
      if (args.errorNo !== undefined) {
        $rootScope.errorNo = args.errorNo;
      }
      if (args.connect_flash_message !== undefined) {
        $rootScope.connect_flash_message = args.connect_flash_message;
      }
      if (args.parentGenres !== undefined) {
        if (parseInt(Auth.is_onboarding_showed) === 0) {

        }
      }
    });

  }]);
  /**
   * @ngdoc function
   * @name $growlProvider
   * @function
   *
   * @description
   * Automatic closing of notifications (timeout, ttl)
   *
   */
  app.config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(true);
    growlProvider.globalTimeToLive(10000);
    growlProvider.globalPosition('top-center');
    growlProvider.globalDisableCountDown(true);
  }]);

  app.config(function(ngJcropConfigProvider) {

    // [optional] To change the jcrop configuration
    // All jcrop settings are in: http://deepliquid.com/content/Jcrop_Manual.html#Setting_Options
    ngJcropConfigProvider.setJcropConfig({
      bgColor: 'black',
      bgOpacity: 0.4,
      aspectRatio: 750 / 350,
      maxWidth: 512,
      maxHeight: 288,
      allowSelect: false
    });
    ngJcropConfigProvider.setJcropConfig('upload', {
      bgColor: 'black',
      bgOpacity: 0.4,
      aspectRatio: 120 / 100,
      maxWidth: 400,
      maxHeight: 200,
      allowSelect: false
    });

  });

  app.config(function($provide) {
    $provide.decorator('$document', function($delegate) {
      $delegate.getReferrer = function() {
        return document.referrer;
      };

      // alternative you can create a property
      // Object.defineProperty($delegate, 'referrer', {
      //   get: function() { return document.referrer; }
      // });

      return $delegate;
    });
  });
  // flash message set & get
  app.factory('flash', ['$rootScope', 'growl', function($rootScope, growl) {
    return {
      set: function(message, type, isStateChange, flashtime) {
        //jshint unused:false
        if (type === 'success') {
          growl.success(message, {
            ttl: flashtime
          });
        } else if (type === 'error') {
          growl.error(message);
        } else if (type === 'info') {
          growl.info(message);
        } else if (type === 'Warning') {
          growl.warning(message);
        }
      }
    };
  }]);

  app.factory('AlertBox', ['$rootScope', 'SweetAlert', function($rootScope, SweetAlert) {
    return {
      confirm: function(message, callback) {
        SweetAlert.swal({
          title: message,
          showCancelButton: true,
          confirmButtonColor: "#79d047",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnConfirm: true,
          animation: false,
        }, function(isConfirm) {
          callback(isConfirm);
        });
      }
    };
  }]);
  /**
   * @ngdoc directive
   * @name match
   * @description
   *  To match the new password and  confirm password field text when typing on it
   *
   *
   **/
  app.directive('match', function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        match: '='
      },
      link: function(scope, elem, attrs, ctrl) {
        scope.$watch(function() {
          var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
          return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
        }, function(currentValue) {
          ctrl.$setValidity('match', currentValue);
        });
      }
    };
  });

  app.directive('header', function() {
    var linker = function(scope, element, attrs) {
      // do DOM Manipulation hereafter

    };
    return {
      link: function postLink($scope, element, attrs) {
        function runMmenu(){
          $('[data-toggle="offcanvas"]').on('click', function () {
            $('.offcanvas-collapse').toggleClass('open')
          });
          // var $menu = $("#main-menu").mmenu({
          //   rtl:true,
          //   wrappers: ["bootstrap4", 'angular'],
          //   navbars: [{
          //     content: ['searchfield']
          //   }],
          //   lazySubmenus: {
          //     load: true,
          //   },
          //   navbar: {
          //
          //   },
          //   "extensions": ["pagedimblack"],
          //   // counters: false,
          //   keyboardNavigation: {
          //     enable: true,
          //     enhance: true
          //   }
          // });
        }
        // $scope.$watch('isAuth', function(oldValue, newValue) {
        //   setTimeout(function() {
        //     runMmenu();
        //   }, 1000);
        // });

        setTimeout(function() {
          runMmenu();
        }, 1000);
      },
      restrict: 'A',
      templateUrl: 'common/header.tpl.html',
      // link: linker,
      controller: 'HeaderController as model',
      scope: {
        header: '=',
      }
    };
  });  
  app.directive('drawerContent', function() {
    var linker = function(scope, element, attrs) {
      // do DOM Manipulation hereafter

    };
    return {
      link: function postLink($scope, element, attrs) {
        
      },
      restrict: 'A',
      templateUrl: 'common/drawerContent.tpl.html',
      // link: linker,
      controller: 'DrawerContentController as model',
      scope: {
        drawer: '=',
      }
    };
  });
  app.directive('footer', function() {
    var linker = function(scope, element, attrs) {
      // do DOM Manipulation hereafter

    };
    return {
      restrict: 'A',
      templateUrl: 'common/footer.tpl.html',
      link: linker,
      controller: 'footerController as model',
      scope: {
        footer: '=',
      }
    };
  });
  app.filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);
  app.filter('escape', function() {
    return function(input) {
        if(input) {
            return window.encodeURIComponent(input.toLowerCase()); 
        }
        return "";
    }
  });

  app.service('TokenService', function($sce, $rootScope, $q, GENERAL_CONFIG, $ocLazyLoad, $window, md5, $cookies) {
    var promise;
    var promiseSettings;
    var isCheckAdmin = $rootScope.auth ? $rootScope.auth.providertype : '';
    var _params = {};
    /**Creating the Cookkies for cart */
    var new_hash = md5.createHash(Date());
    if ($cookies.getObject('cart_cookies') === null || angular.isUndefined($cookies.getObject('cart_cookies'))) {
      var new_cookie = {};
      new_cookie.hash = new_hash;
      $cookies.putObject('cart_cookies', new_cookie, {
        path: '/'
      });
    }
    /**Ending the Cookies  */
    if ($cookies.get("token") === null || $cookies.get("token") === undefined) {
      promise = $.get(GENERAL_CONFIG.api_url + 'api/v1/token', _params, function(tokenData) {
        tokenData = angular.fromJson(tokenData);
        if (angular.isDefined(tokenData.access_token)) {
          $cookies.put("token", tokenData.access_token, {
            path: '/'
          });
        }
      });

    } else {
      promise = true;
    }

    if ($rootScope.is_fresh_call) {
      if (angular.isUndefined($rootScope.settings)) {
        $rootScope.settings = {};
      }
      promiseSettings = $.get(GENERAL_CONFIG.api_url + 'api/v1/settings', {
        limit: 'all'
      }, function(settingsData) {
        settingsResponse = angular.fromJson(settingsData);
        if (settingsResponse._metadata !== null && settingsResponse._metadata !== undefined) {
          $rootScope.settings.geoIP = settingsResponse._metadata.geoIP;
          $rootScope.settings.site_promotions = settingsResponse._metadata.site_promotions;
          /*$rootScope.settings.geoIP = {
              "id": 4,
              "created": "2010-08-07 00:53:01",
              "modified": "2010-09-14 02:25:45",
              "name": "Japanese Yen",
              "code": "JPY",
              "symbol": "¥",
              "prefix": "¥",
              "suffix": "JPY",
              "decimals": 2,
              "dec_point": ".",
              "thousands_sep": ",",
              "is_active": true,
              "min_coupon_amount": "0",
              "iso2": "JP",
              "tier_conversion_rate": "1",
              'timezone': '-0300'
          };*/
          if ($rootScope.settings.geoIP !== null && $rootScope.settings.geoIP !== undefined) {
            if ($rootScope.settings.geoIP.symbol !== null && $rootScope.settings.geoIP.symbol !== undefined && $rootScope.settings.geoIP.symbol !== '') {
              $cookies.put("site_currency", $rootScope.settings.geoIP.symbol, {
                path: '/'
              });
            } else {
              $cookies.remove("site_currency", {
                path: "/"
              });
            }
          } else {
            $cookies.remove("site_currency", {
              path: "/"
            });
          }
          if ($rootScope.settings.geoIP !== null && $rootScope.settings.geoIP !== undefined) {
            if ($rootScope.settings.geoIP.timezone !== null && $rootScope.settings.geoIP.timezone !== undefined && $rootScope.settings.geoIP.timezone !== '') {
              $cookies.put("site_timezone", $rootScope.settings.geoIP.timezone, {
                path: '/'
              });
            } else {
              $cookies.remove("site_timezone", {
                path: "/"
              });
            }
          } else {
            $cookies.remove("site_timezone", {
              path: "/"
            });
          }
        }
        if (settingsResponse.data) {
          var enabledPlugins = '';
          $.each(settingsResponse.data, function(i, settingData) {
            $rootScope.settings[settingData.name] = settingData.value;
            if (settingData.name === 'site.enabled_plugins') {
              enabledPlugins = settingData.value;
              $rootScope.enabledPlugins = settingData.value;
            }
            if (settingData.name === 'theme.name') {
              enabledThemes = settingData.value;
              $rootScope.enabledTheme = settingData.value;
              $window.streetName = $rootScope.enabledTheme;
            }
          });
          // Checking whether multicurrency enabled and getting the multicurrency details.Currency can't able to set in cookies because it will too large '
          if (enabledPlugins.indexOf('MultiCurrency') > -1) {
            if (angular.isUndefined($rootScope.multicurrencies)) {
              $rootScope.multicurrencies = {};
            }
            $.get(GENERAL_CONFIG.api_url + 'api/v1/currencies', {
              limit: 'all'
            }, function(currencyData) {
              multicurrencyResponse = angular.fromJson(currencyData);
              $rootScope.multicurrencies = multicurrencyResponse.data;
            });
          }
          $.get(GENERAL_CONFIG.api_url + 'api/v1/channels', {
            limit: 'all'
          }, function(channelData) {
            channelResponse = angular.fromJson(channelData);
            if (angular.isUndefined($rootScope.channel)) {
              $rootScope.channel = {};
            }
            $.each(channelResponse.data, function(key, value) {
              $rootScope.channel[value.name] = value.id;
            });
          });

          if (enabledPlugins.indexOf('SocialLogins') > -1) {
            settingsResponse['ace.socialLogin'] = {
              serie: true,
              name: 'ace.socialLogin',
              files: ['src/plugins/SocialLogins/SocialLogins.js'],
              template: ['src/plugins/SocialLogins/socialLogins.tpl.html', 'src/plugins/SocialLogins/getEmailFromUser.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('CourseCheckout') > -1) {
            settingsResponse['ace.CourseCheckout'] = {
              serie: true,
              name: 'ace.CourseCheckout',
              files: ['src/plugins/CourseCheckout/CourseCheckout.js'],
              template: ['src/plugins/CourseCheckout/payment.tpl.html', 'src/plugins/CourseCheckout/buyButton.tpl.html', 'src/plugins/CourseCheckout/transactions.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('RatingAndReview') > -1) {
            settingsResponse['ace.ratingAndReview'] = {
              serie: true,
              name: 'ace.ratingAndReview',
              files: ['src/plugins/RatingAndReview/RatingAndReview.js'],
              template: ['src/plugins/RatingAndReview/courseFeedback.tpl.html', 'src/plugins/RatingAndReview/courseFeedback.tpl.html',
                'src/plugins/RatingAndReview/ratingAndReviewForm.tpl.html', 'src/plugins/RatingAndReview/studentSatisfaction.tpl.html',
                'src/plugins/RatingAndReview/ratingStars.tpl.html', 'src/plugins/RatingAndReview/studentSatisfactionButton.tpl.html', 'src/plugins/RatingAndReview/courseReview.tpl.html',
                'src/plugins/RatingAndReview/homeUserFeedback.tpl..html'
              ]
            };
          }
          if (enabledPlugins.indexOf('CourseCheckoutRevenueWithdrawal') > -1) {

            settingsResponse['ace.withdrawal'] = {
              serie: true,
              name: 'ace.withdrawal',
              files: ['src/plugins/CourseCheckoutRevenueWithdrawal/CourseCheckoutRevenueWithdrawal.js']
            };
          }
          if (enabledPlugins.indexOf('ArticleLessons') > -1) {
            settingsResponse['ace.articlelesson'] = {
              serie: true,
              name: 'ace.articlelesson',
              files: ['src/plugins/ArticleLessons/ArticleLessons.js'],
              template: ['src/plugins/ArticleLessons/articleLessonsForm.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('VideoLessons') > -1) {
            settingsResponse['ace.videolesson'] = {
              serie: true,
              name: 'ace.videolesson',
              files: ['src/plugins/VideoLessons/VideoLessons.js'],
              template: ['src/plugins/VideoLessons/videoLessonsForm.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('Quizz') > -1) {
            settingsResponse['ace.Quiz'] = {
              serie: true,
              name: 'ace.Quiz',
              files: ['src/plugins/Quizz/Quizz.js'],
              template: ['src/plugins/Quizz/QuizLessonsForm.tpl.html',
                'src/plugins/Quizz/AddQuizQuestionAnswerForm.tpl.html', 'src/plugins/Quizz/QuizQuestionList.tpl.html', 'src/plugins/Quizz/QuizExerciseLearner.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('PracticeTest') > -1) {
            settingsResponse['ace.practicetest'] = {
              serie: true,
              name: 'ace.practicetest',
              files: ['src/plugins/PracticeTest/PracticeTest.js'],
              template: ['src/plugins/PracticeTest/PracticeLessonsForm.tpl.html',
                'src/plugins/PracticeTest/AddPracticeQuestionAnswerForm.tpl.html', 'src/plugins/PracticeTest/PracticeQuestionList.tpl.html', 'src/plugins/PracticeTest/PracticeExerciseLearner.tpl.html',
                'src/plugins/PracticeTest/PracticeTestStartPage.tpl.html'

              ]
            };
          }
          if (enabledPlugins.indexOf('Assignment') > -1) {
            settingsResponse['ace.Assignment'] = {
              serie: true,
              name: 'ace.Assignment',
              files: ['src/plugins/Assignment/Assignment.js'],
              template: ['src/plugins/Assignment/AssignmentLessonsForm.tpl.html',
                'src/plugins/Assignment/AddAssignmentQuestionAnswerForm.tpl.html', 'src/plugins/Assignment/AssignmentQuestionList.tpl.html', 'src/plugins/Assignment/AssignmentExerciseLearner.tpl.html',
                'src/plugins/Assignment/AssignmentStartPage.tpl.html', 'src/plugins/Assignment/AssignmentInstructor.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('CodingExercise') > -1) {
            settingsResponse['ace.codingexercise'] = {
              serie: true,
              name: 'ace.codingexercise',
              files: ['src/plugins/CodingExercise/CodingExercise.js'],
              template: ['src/plugins/CodingExercise/CodingExerciseForm.tpl.html',
                'src/plugins/CodingExercise/codingExerciseButton.tpl.html', 'src/plugins/CodingExercise/CodingExerciseLearner.tpl.html', 'src/plugins/CodingExercise/CodingExerciseFormEdit.tpl.html', 'src/plugins/CodingExercise/CodingProgramminLanguage.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('DownloadableFileLessons') > -1) {
            settingsResponse['ace.downloadblefilelesson'] = {
              serie: true,
              name: 'ace.downloadblefilelesson',
              files: ['src/plugins/DownloadableFileLessons/DownloadableFileLessons.js'],
              template: ['src/plugins/DownloadableFileLessons/downloadableFileLessonsForm.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('VideoExternalEmbedLessons') > -1) {
            settingsResponse['ace.videoembedorexternallesson'] = {
              serie: true,
              name: 'ace.videoembedorexternallesson',
              files: ['src/plugins/VideoExternalEmbedLessons/VideoExternalEmbedLessons.js'],
              template: ['src/plugins/VideoExternalEmbedLessons/videoExternalEmbedLessonsForm.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('SocialShare') > -1) {
            settingsResponse['ace.socialShare'] = {
              serie: true,
              name: 'ace.socialShare',
              files: ['src/plugins/SocialShare/SocialShare.js'],
              template: ['src/plugins/SocialShare/socialShare.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('PaypalREST') > -1) {
            settingsResponse['ace.payPalREST'] = {
              serie: true,
              name: 'ace.payout',
              files: ['src/plugins/PaypalREST/PayPalREST.js'],
              template: ['src/plugins/PaypalREST/payPalRESTButton.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('PayPalREST') > -1) {
            settingsResponse['ace.payout'] = {
              serie: true,
              name: 'ace.payout',
              files: ['src/plugins/ZazPayPayout/ZazPayPayout.js'],
              template: ['src/plugins/ZazPayPayout/payout.tpl.html', 'src/plugins/ZazPayPayout/payoutButton.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('SEO') > -1) {
            settingsResponse['ace.seo'] = {
              serie: true,
              name: 'ace.seo',
              files: ['src/plugins/SEO/SEO.js'],
              template: ['src/plugins/SEO/userProfileSeo.tpl.html', 'src/plugins/SEO/courseSeo.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('CourseWishlist') > -1) {
            settingsResponse['ace.courseWishlist'] = {
              serie: true,
              name: 'ace.courseWishlist',
              files: ['src/plugins/CourseWishlist/CourseWishlist.js'],
              template: ['src/plugins/CourseWishlist/CourseWishlistByUser.tpl.html', 'src/plugins/CourseWishlist/courseWishlist.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('InstructorProfile') > -1) {
            settingsResponse['ace.userprofile'] = {
              serie: true,
              name: 'ace.userprofile',
              files: ['src/plugins/InstructorProfile/InstructorProfile.js'],
              template: ['src/plugins/InstructorProfile/InstructorProfile.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('Instructor') > -1 || isCheckAdmin === 'admin') {
            settingsResponse['ace.instructor'] = {
              serie: true,
              name: 'ace.instructor',
              files: ['src/plugins/Instructor/Instructor.js'],
              template: ['src/plugins/Instructor/InstructorCourses.tpl.html',
                'src/plugins/Instructor/InstructorCoursesButton.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('RevenueReports') > -1 || isCheckAdmin === 'admin') {
            settingsResponse['ace.revenue_report'] = {
              serie: true,
              name: 'ace.revenue_report',
              files: ['src/plugins/RevenueReports/RevenueReports.js'],
              template: ['src/plugins/RevenueReports/revenueReport.tpl.html',
                'src/plugins/RevenueReports/revenueBreakDownReport.tpl.html',
                'src/plugins/RevenueReports/revenueReportMonth.tpl.html'
              ]
            };
          }
            
          // if (enabledPlugins.indexOf('Analytics') > -1) {
          //   settingsResponse['ace.analytics'] = {
          //     serie: true,
          //     name: 'ace.analytics',
          //     files: ['src/plugins/Analytics/Analytics.js'],
          //     template: []
          //   };
          //   $rootScope.loadanalytics = settingsResponse['ace.analytics'];
          // }
          if (enabledPlugins.indexOf('Comments') > -1) {
            settingsResponse['ace.comments'] = {
              serie: true,
              name: 'ace.comments',
              files: ['src/plugins/Comments/Comments.js'],
              template: []
            };
          }
          if (enabledPlugins.indexOf('Coupons') > -1) {
            settingsResponse['ace.coupons'] = {
              serie: true,
              name: 'ace.coupons',
              files: ['src/plugins/Coupons/Coupons.js'],
              template: ['src/plugins/Coupons/courseCoupon.tpl.html', 'src/plugins/Coupons/courseCouponButton.tpl.html',
                'src/plugins/Coupons/courseCouponApply.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('Credit') > -1) {
            settingsResponse['ace.credit'] = {
              serie: true,
              name: 'ace.credit',
              files: ['src/plugins/Credit/Credit.js'],
              template: ['src/plugins/Credit/credit.tpl.html', 'src/plugins/Credit/creditButton.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('CourseBulkCheckout') > -1) {
            settingsResponse['ace.carts'] = {
              serie: true,
              name: 'ace.carts',
              files: ['src/plugins/CourseBulkCheckout/CourseBulkCheckout.js.js'],
              template: ['src/plugins/CourseBulkCheckout/carts.tpl.html', 'src/plugins/CourseBulkCheckout/cartButton.tpl.html',
                'src/plugins/CourseBulkCheckout/bulkCheckoutButton.tpl.html', 'src/plugins/CourseBulkCheckout/bulkFreeCheckout.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('Message') > -1) {
            settingsResponse['ace.message'] = {
              serie: true,
              name: 'ace.message',
              files: ['src/plugins/Message/Message.js'],
              template: ['src/plugins/Message/myMessage.tpl.html', 'src/plugins/Message/CourseBatchMessage.tpl.html', 'src/plugins/Message/CourseBatchMessageButton.tpl.html',
                'src/plugins/Message/Messagenotification.tpl.html', 'src/plugins/Message/ComposeMessage.tpl.html', 'src/plugins/Message/message_view.tpl.html'

              ]
            };
          }
          if (enabledPlugins.indexOf('QA') > -1) {
            settingsResponse['ace.question&answer'] = {
              serie: true,
              name: 'ace.question&answer',
              files: ['src/plugins/QA/QA.js'],
              template: ['src/plugins/QA/QuestionAnswers.tpl.html', 'src/plugins/QA/QuestionView.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('OfflineCourse') > -1) {
            settingsResponse['ace.offlineCourse'] = {
              serie: true,
              name: 'ace.offlineCourse',
              files: ['src/plugins/OfflineCourse/OfflineCourse.js'],
              template: ['src/plugins/OfflineCourse/offlineCourse.tpl.html',
                'src/plugins/OfflineCourse/offlineCourseButton.tpl.html',
                'src/plugins/OfflineCourse/offlineCourseBatch.tpl.html',
                'src/plugins/OfflineCourse/myCourseOfflineBatch.tpl.html'
              ]

            };
          }
          if (enabledPlugins.indexOf('WebinarCourses') > -1) {
            settingsResponse['ace.webinarCourse'] = {
              serie: true,
              name: 'ace.webinarCourse',
              files: ['src/plugins/WebinarCourses/WebinarCourses.js'],
              template: ['src/plugins/WebinarCourses/webinarCourse.tpl.html',
                'src/plugins/WebinarCourses/webinarCourseButton.tpl.html',
                'src/plugins/WebinarCourses/webinarCourseBatch.tpl.html',
                'src/plugins/WebinarCourses/myCourseWebianerBatch.tpl.html',
              ]
            };
          }
          if (enabledPlugins.indexOf('MultipleInstructor') > -1) {
            settingsResponse['ace.multipleInstructor'] = {
              serie: true,
              name: 'ace.multipleInstructor',
              files: ['src/plugins/MultipleInstructor/MultipleInstructor.js'],
              template: ['src/plugins/MultipleInstructor/multipleInstructor.tpl.html', 'src/plugins/MultipleInstructor/multipleInstructorShow.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('News') > -1) {
            settingsResponse['ace.news'] = {
              serie: true,
              name: 'ace.news',
              files: ['src/plugins/News/News.js'],
              template: ['src/plugins/News/newsButton.tpl.html',
                'src/plugins/News/newsListing.tpl.html', 'src/plugins/News/newsCategory.tpl.html', 'src/plugins/News/newView.tpl.html', 'src/plugins/News/categoryNewsListing.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('Banner') > -1) {
            settingsResponse['ace.banner'] = {
              serie: true,
              name: 'ace.banner',
              files: ['src/plugins/Banner/Banner.js'],
              template: ['src/plugins/Banner/banner.tpl.html']
            };
            if ($ocLazyLoad.getModules().indexOf('ace.banner') === -1) {
              $ocLazyLoad.load(settingsResponse['ace.banner'], {
                cache: true
              });
            }
          }
          if (enabledPlugins.indexOf('Translations') > -1) {
            settingsResponse['ace.translations'] = {
              serie: true,
              name: 'ace.translations',
              files: ['src/plugins/Translations/Translations.js'],
              template: ['src/plugins/Translations/languageTranslate.tpl.html']
            };
            // $rootScope.loadTranslations = settingsResponse['ace.translations'];
          }
          if (enabledPlugins.indexOf('CourseFlags') > -1) {
            settingsResponse['ace.courseflags'] = {
              serie: true,
              name: 'ace.courseflags',
              files: ['src/plugins/CourseFlags/CourseFlags.js'],
              template: ['src/plugins/CourseFlags/CourseFlags.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('Group') > -1) {
            settingsResponse['ace.group'] = {
              serie: true,
              name: 'ace.group',
              files: ['src/plugins/Group/Group.js'],
              template: ['src/plugins/Group/myCourseGroup.tpl.html',
                'src/plugins/Group/groupButton.tpl.html', 'src/plugins/Group/groupModel.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('Support') > -1) {
            settingsResponse['ace.support'] = {
              serie: true,
              name: 'ace.support',
              files: ['src/plugins/Support/Support.js'],
              template: ['src/plugins/Support/support.tpl.html', 'src/plugins/Support/supportContent.tpl.html',
                'src/plugins/Support/supportCategory.tpl.html'
              ]

            };
          }
          if (enabledPlugins.indexOf('CourseAnalytics') > -1) {
            settingsResponse['ace.courseanalytics'] = {
              serie: true,
              name: 'ace.courseanalytics',
              files: ['src/plugins/CourseAnalytics/CourseAnalytics.js'],
              template: ['src/plugins/CourseAnalytics/courseAnalytics.tpl.html',
                'src/plugins/CourseAnalytics/courseAnalyticsButton.tpl.html',
                'src/plugins/CourseAnalytics/EngagementAnalytics.tpl.html'
              ]
            };
          }
          if (enabledPlugins.indexOf('MultiCurrency') > -1) {
            settingsResponse['ace.multiCurrency'] = {
              serie: true,
              name: 'ace.multiCurrency',
              files: ['src/plugins/MultiCurrency/MultiCurrency.js'],
              template: ['src/plugins/MultiCurrency/multiCurrency.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('AmazonS3andRTMP') > -1) {
            settingsResponse['ace.amazonS3'] = {
              serie: true,
              name: 'ace.amazonS3',
              files: ['src/plugins/AmazonS3andRTMP/AmazonS3andRTMP.js'],
              template: ['src/plugins/AmazonS3andRTMP/amazonS3.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('OAuthClient') > -1) {
            settingsResponse['ace.oauth_client'] = {
              serie: true,
              name: 'ace.oauth_client',
              files: ['src/plugins/OAuthClient/OAuthClient.js'],
              template: ['src/plugins/OAuthClient/OAuthClient.tpl.html', 'src/plugins/OAuthClient/OAuthClientEdit.tpl.html']
            };
          }
          if (enabledPlugins.indexOf('BulkUploader') > -1) {
            settingsResponse['ace.bulkuploader'] = {
              serie: true,
              name: 'ace.bulkuploader',
              files: ['src/plugins/BulkUploader/BulkUploader.js'],
              template: ['src/plugins/BulkUploader/BulkUploader.tpl.html', 'src/plugins/BulkUploader/BulkUploaderButton.tpl.html']
            };
          }
        }
      });

    } else {
      promiseSettings = true;
    }
    return {
      promise: promise,
      promiseSettings: promiseSettings
    };
  });

  /**
   * @ngdoc module
   * @name HashBangURLs
   *
   * @description
   * To change location with #!
   *
   */
  angular.module('HashBangURLs', []).config(['$locationProvider', function($locationProvider) {
    // $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(true);
  }]);

  angular.module('OcLazyLoad', ['oc.lazyLoad']).config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      debug: false,
      cache: true,
      events: true
    });
  }]);
  /** to avoid autoscroll="true" issues when header is not fixed **/
  app.config(['$uiViewScrollProvider', function($uiViewScrollProvider) {
    $uiViewScrollProvider.useAnchorScroll();
  }]);

  /** sceDelegateProvider checking */
  app.config(['$sceDelegateProvider', function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://d1x94kqlp45as0.cloudfront.net/**'
    ]);
  }]);
  /** time ago filter using jquery timeago plugin **/
  app.filter("timeago", ['$rootScope', function($rootScope) {
    var timeZone = ($rootScope.settings['site.timezone']) ? $rootScope.settings['site.timezone'] : '+0000';
    return function(date) {
      jQuery.timeago.settings.strings = {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "a minute",
        minutes: "%d minutes",
        hour: "an hour",
        hours: "%d hours",
        day: "a day",
        days: "%d days",
        month: "a month",
        months: "%d months",
        year: "a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      };
      return jQuery.timeago(date + timeZone);
    };
  }]);
  app.service('anchorSmoothScroll', function() {
    this.scrollTo = function(eID) {
      // This scrolling function
      // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
      function currentYPosition() {
        // Firefox, Chrome, Opera, Safari
        if (self.pageYOffset) {
          return self.pageYOffset;
        }
        // Internet Explorer 6 - standards mode
        if (document.documentElement && document.documentElement.scrollTop) {
          return document.documentElement.scrollTop;
        }
        // Internet Explorer 6, 7 and 8
        if (document.body.scrollTop) {
          return document.body.scrollTop;
        }
        return 0;
      }

      function elmYPosition(eID) {
        var elm = document.getElementById(eID);
        var y = elm.offsetTop;
        var node = elm;
        while (node.offsetParent && node.offsetParent !== document.body) {
          node = node.offsetParent;
          y += node.offsetTop;
        }
        return y;
      }
      var startY = currentYPosition();
      var stopY = elmYPosition(eID);
      var distance = stopY > startY ? stopY - startY : startY - stopY;
      if (distance < 100) {
        scrollTo(0, stopY);
        return;
      }
      var speed = Math.round(distance / 100);
      if (speed >= 20) {
        speed = 20;
      }
      var step = Math.round(distance / 25);
      var leapY = stopY > startY ? startY + step : startY - step;
      var timer = 0;
      if (stopY > startY) {
        for (var i = startY; i < stopY; i += step) {
          setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
          leapY += step;
          if (leapY > stopY) {
            leapY = stopY;
          }
          timer++;
        }
        return;
      }
      for (var j = startY; j > stopY; j -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step;
        if (leapY < stopY) {
          leapY = stopY;
        }
        timer++;
      }
    };
  });
  app.config(
    ['$animateProvider',
      function($animateProvider) {
        $animateProvider.classNameFilter(/carousel/);
      }
    ]);
  app.factory('expireCookie', function() {
    return {
      getDate: function(str) {
        var date = new Date();
        var minutes = 43800;
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        return date;
      }
    };
  });
  app.filter('htmlToPlaintext', function() {
    return function(text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  });
  app.filter('truncate', function() {
    return function(val, limit) {
      if (!val) {
        return '';
      }
      return val.length > limit ? val.substr(0, limit) + '...' : val;
    };
  });
  app.filter('bytes', function() {
    return function(bytes, decimals) {
      if (bytes === 0) return '0 Bytes';
      var k = 1000,
        dm = decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
  });
  app.filter('validData', function() {
    return function(inputlist, fields) {
      var valid_data = [];
      if (inputlist) {
        if (typeof(fields) === 'string') {
          valid_data = $.grep(inputlist, function(e) {
            return (e[fields] !== null && e[fields] !== '' && e[fields] !== undefined);
          });
        } else {
          angular.forEach(inputlist, function(data) {
            angular.forEach(fields, function(field) {
              if (data[field] !== null && data[field] !== '' && data[field] !== undefined) {
                valid_data.push(data);
              }
            });
          });
        }
      }
      return valid_data;
    };
  });
  // Multicurrency filter commonly created for all the pages
  app.filter('multicurrency', function($rootScope, ConstCurrencies, $cookies) {
    return function(tier_id, amount, is_fixed) {
      var current_amount, multicurrencies = $rootScope.multicurrencies,
        currency_symbol;
      if ($rootScope.settings.geoIP.symbol !== null && $rootScope.settings.geoIP.symbol !== undefined && $rootScope.settings.geoIP.symbol !== '') {
        currency_symbol = $rootScope.settings.geoIP.symbol;
      } else if ($cookies.get("site_currency") !== null && $cookies.get("site_currency") !== undefined && $cookies.get("site_currency") !== '') {
        currency_symbol = $cookies.get("site_currency");
      } else {
        currency_symbol = ConstCurrencies.Default;
      }

      if (tier_id !== null && tier_id !== undefined && tier_id !== '') {
        angular.forEach(multicurrencies, function(currency) {
          if (currency.symbol === currency_symbol) {
            angular.forEach(currency.currencies_tiers, function(currency_tier) {
              if (parseInt(currency_tier.tier_id) === parseInt(tier_id)) {
                current_amount = currency_tier.amount;
              }
            });
          }
        });
      } else if (tier_id === null && is_fixed === 'yes') {
        current_amount = parseFloat(amount) * parseFloat($rootScope.settings.geoIP.tier_conversion_rate);
      } else {
        current_amount = amount;
      }
      return current_amount;
    };
  });  
  app.filter('multicurrencydiscount', function($rootScope, ConstCurrencies, $cookies) {
    return function(tier_id, amount, is_fixed) {
      var usd_tier_id, current_amount, multicurrencies = $rootScope.multicurrencies,
        currency_symbol;
      if ($rootScope.settings.geoIP.symbol !== null && $rootScope.settings.geoIP.symbol !== undefined && $rootScope.settings.geoIP.symbol !== '') {
        currency_symbol = $rootScope.settings.geoIP.symbol;
      } else if ($cookies.get("site_currency") !== null && $cookies.get("site_currency") !== undefined && $cookies.get("site_currency") !== '') {
        currency_symbol = $cookies.get("site_currency");
      } else {
        currency_symbol = ConstCurrencies.Default;
      }


      if( $rootScope.settings.geoIP.symbol !== '$' && tier_id === null && is_fixed === 'yes' ) {

        angular.forEach(multicurrencies, function(currency) {
          if (currency.symbol === '$') {
            angular.forEach(currency.currencies_discount_tiers, function(currency_tier) {
              if (parseInt(currency_tier.amount) === parseInt(amount)) {
                usd_tier_id = currency_tier.tier_id;
              }
            });
          }

        });        

        angular.forEach(multicurrencies, function(currency) {

          if (currency.symbol === currency_symbol) {
            angular.forEach(currency.currencies_discount_tiers, function(currency_tier) {
              if (parseInt(currency_tier.tier_id) === parseInt(usd_tier_id)) {
                current_amount = currency_tier.amount;
              }
            });
          }
        });

      } else {
        current_amount = amount;
      }
      return current_amount;
    };
  });
  //Timzone Filter
  app.filter('CountryTimezone', function($rootScope, $filter, ConstTimeZoneConversion, $cookies) {
    return function(inputlist, fields, type, format) {
      /*Getting User timezone*/
      var user_timeZone = new Date().toString().match(/([-\+][0-9]+)\s/)[1],
        site_timezone, tmp_date, tmp_date2;
      /*Getting the Site Timezone */
      if ($rootScope.settings.geoIP.timezone !== null && $rootScope.settings.geoIP.timezone !== undefined && $rootScope.settings.geoIP.timezone !== '') {
        site_timezone = $rootScope.settings.geoIP.timezone;
      } else if ($cookies.get("site_timezone") !== null && $cookies.get("site_timezone") !== undefined && $cookies.get("site_timezone") !== '') {
        site_timezone = $cookies.get("site_timezone");
      } else {
        site_timezone = user_timeZone;
      }
      /*Converting into timezone of Array of element*/
      if (typeof(inputlist) === 'object' && inputlist.length > 0) {
        angular.forEach(inputlist, function(data) {
          angular.forEach(fields, function(field) {
            if (data[field] !== null && data[field] !== undefined && data[field] !== '') {
              if (type === 'TimeZoneSet') {
                tmp_date = data[field].split('T');
                tmp_date2 = data[field].split(' ');
                if (tmp_date.length == 1 && tmp_date2.length == 1) {
                  data[field] = data[field] + 'T00:00:00';
                }
                data[field] = $filter('date')(Date.parse(data[field] + 'Z'), format, site_timezone);
              } else if (type === 'TimeZoneSessionSet') {
                if (parseInt(ConstTimeZoneConversion.UserTimezoneConversion) === 1) {
                  data.user_timezone = new Date().toString().match(/\(([A-Za-z\+\s].*)\)/)[1];
                  data['user_' + field] = $filter('date')(Date.parse(data[field] + 'Z'), format, user_timeZone);
                }
                data[field] = $filter('date')(Date.parse(data[field] + 'Z'), format, data.utc_offset);
              }
            }

          });
        });
      } else { /*Converting into timezone of Object of element*/
        if (inputlist !== null && inputlist !== undefined && inputlist !== '' && typeof(inputlist) !== 'object') {
          if (type === 'TimeZoneSet') {
            tmp_date = inputlist.split('T');
            tmp_date2 = inputlist.split(' ');
            if (tmp_date.length == 1 && tmp_date2.length == 1) {
              inputlist = inputlist + 'T00:00:00';
            }
            inputlist = $filter('date')(Date.parse(inputlist + 'Z'), format, site_timezone);
          } else if (type === 'TimeZoneSessionSet') {
            inputlist.demo_session_date = $filter('date')(Date.parse(inputlist.demo_session_date + 'Z'), format, inputlist.utc_offset);
          }
        }
      }
      return inputlist;
    };
  });
  app.config(function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('src/plugins/Translations/angular-i18n/angular-locale_{{locale}}.js');
  });

  angular.module('textAngularTest', ['textAngular'])
  .config(['$provide', function($provide) {
    // this demonstrates how to register a new tool and add it to the default toolbar
    $provide.decorator('taOptions', ['$delegate', function(taOptions) {
      // $delegate is the taOptions we are decorating
      // here we override the default toolbars and classes specified in taOptions.
      // taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
      // taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
      // taOptions.toolbar = [
      //  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      //  ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
      //  ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
      //  ['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
      // ];
      taOptions.classes = {
        focussed: 'focussed',
        toolbar: 'btn-toolbar',
        toolbarGroup: 'btn-group',
        toolbarButton: 'btn btn-outline-secondary',
        toolbarButtonActive: 'active',
        disabled: 'disabled',
        textEditor: 'form-control',
        htmlEditor: 'form-control'
      };
      return taOptions; // whatever you return will be the taOptions
    }]);
    // this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
    $provide.decorator('taTools', ['$delegate', function(taTools) {
      taTools.bold.iconclass = 'mdi-18px mdi mdi-format-bold';
      taTools.italics.iconclass = 'mdi-18px mdi mdi-format-italic';
      taTools.underline.iconclass = 'mdi-18px mdi mdi-format-underline';
      taTools.ul.iconclass = 'mdi-18px mdi mdi-format-list-bulleted';
      taTools.ol.iconclass = 'mdi-18px mdi mdi-format-list-numbers';
      taTools.undo.iconclass = 'mdi-18px mdi mdi-undo';
      taTools.redo.iconclass = 'mdi-18px mdi mdi-repeat';
      taTools.justifyLeft.iconclass = 'mdi-18px mdi mdi-format-align-left';
      taTools.justifyRight.iconclass = 'mdi-18px mdi mdi-format-align-right';
      taTools.justifyCenter.iconclass = 'mdi-18px mdi mdi-format-align-center';
      taTools.clear.iconclass = 'mdi-18px mdi mdi-cancel';
      taTools.insertLink.iconclass = 'mdi-18px mdi mdi-link';
      taTools.insertImage.iconclass = 'mdi-18px mdi mdi-image-plus';
      taTools.strikeThrough.iconclass = 'mdi-18px mdi mdi-format-strikethrough';
      taTools.outdent.iconclass = 'mdi-18px mdi mdi-format-indent-decrease';
      taTools.indent.iconclass = 'mdi-18px mdi mdi-format-indent-increase';
      // there is no quote icon in old font-awesome so we change to text as follows
      taTools.quote.iconclass = 'mdi-18px mdi mdi-format-quote-open';
      return taTools;
    }]);
  }]);

  app.directive('richcard', ['$filter','$sce','$compile', function ($filter,$sce,$compile) {
      return {
          restrict: 'EA',
          link: function (scope, element) {
              scope.$watch('ld', function (value) {
                  if(value == undefined){
                    return;
                  }
                  var val = $sce.trustAsHtml($filter('json')(value));
                  element.html('<script type="application/ld+json">'+ val + '</script>');
                  $compile(element.contents())(scope);
          
                  // element[0].outerHTML = '<script type="application/ld+json">'+ val + '</script>'
              });
          }
      };
  }]);

  app.service('languageList', function($sce, $rootScope, $q, GENERAL_CONFIG) {
      promise = $.get(GENERAL_CONFIG.api_url + 'api/v1/settings/site_languages?token=' + token, {
          limit: 'all'
      }, function(response) {});
      return {
          promise: promise
      };
  });

  app.service('LocaleService', function($translate, $rootScope, tmhDynamicLocale, GENERAL_CONFIG, languageList) {
        'use strict';
        var localesObj;
        var localesObj1 = {};
        localesObj1.locales = {};
        localesObj1.preferredLocale = {};
        var _LOCALES_DISPLAY_NAMES = [];
        var _LOCALES;

        var promiseSettings = languageList.promise;
        promiseSettings.then(function(response) {
            $.each(response.site_languages, function(i, data) {
                localesObj1.locales[data.iso2] = data.name;
            });
            localesObj1.preferredLocale = response.preferredLocale[0].iso2;
            localesObj = localesObj1.locales;
            // locales and locales display names
            _LOCALES = Object.keys(localesObj);
            if (!_LOCALES || _LOCALES.length === 0) {
                console.error('There are no _LOCALES provided');
            }
            _LOCALES.forEach(function(locale) {
                _LOCALES_DISPLAY_NAMES.push(localesObj[locale]);
            });
        });
        // STORING CURRENT LOCALE
        // var currentLocale = $translate.proposedLanguage(); // because of async loading - its some times returns browser language
     var currentLocale = $translate.use() ||$translate.storage().get($translate.storageKey()) || $translate.preferredLanguage();// because of async loading
        $.cookie('currentLocale', currentLocale, {
            path: '/'
        });
        // METHODS
        var checkLocaleIsValid = function(locale) {
            return _LOCALES.indexOf(locale) !== -1;
        };

        var setLocale = function(locale) {
            if (!checkLocaleIsValid(locale)) {
                console.error('Locale name "' + locale + '" is invalid');
                return;
            }
            currentLocale = locale; // updating current locale
            $.cookie('currentLocale', currentLocale, {
                path: '/'
            });
            // asking angular-translate to load and apply proper translations
            $translate.use(locale);
        };

        // EVENTS
        // on successful applying translations by angular-translate
        $rootScope.$on('$translateChangeSuccess', function(event, data) {
            document.documentElement.setAttribute('lang', data.language); // sets "lang" attribute to html
      $rootScope.$emit('changeLanguage', {
        currentLocale: data.language,
      });
            // asking angular-dynamic-locale to load and apply proper AngularJS $locale setting
            tmhDynamicLocale.set(data.language.toLowerCase().replace(/_/g, '-'));
        });

        return {
            getLocaleDisplayName: function() {
                return localesObj[currentLocale];
            },
            setLocaleByDisplayName: function(localeDisplayName) {
                setLocale(
                    _LOCALES[
                        _LOCALES_DISPLAY_NAMES.indexOf(localeDisplayName) // get locale index
                    ]
                );
            },
            getLocalesDisplayNames: function() {
                return _LOCALES_DISPLAY_NAMES;
            }
        };
    });

  /**
   * plyr
   */
  angular.module('ngPlyr', []);

  angular.module('ngPlyr').directive('plyr', function() {
    return {
      // template: '<video controls class="video-js" data-setup=\'{}\' crossorigin playsinline src="{{videourl}}"><source src="{{videourl}}" type="video/mp4" size="720"></video>',
      // template: '<video controls class="video-js" data-setup=\'{}\' crossorigin playsinline src="{{videourl}}"><source src="{{videourl}}" type="video/mp4" size="720"><source src="{{videourl480p}}" type="video/mp4" size="480"><source src="{{videourl360p}}" type="video/mp4" size="360"></video>',
      restrict: 'A',
      scope: {
        vurl: '@'
      },
      link: function(scope, element, attrs) {
        attrs.type = attrs.type || "video/mp4";
        // model = JSON.parse(attrs.data);
        var setup = {
          techOrder: ['html5'],
          controls: true,
          preload: 'auto',
          autoplay: false,
          height: 480,
          width: 854,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          plugins: {
            videoJsResolutionSwitcher: {
              default: 'high',
              dynamicLabel: true,
              ui: true,
            }
          }
        };

        var player = videojs(attrs.id, setup, function() {
          var source = ([{
              type: attrs.type,
              src: attrs.vurl,
              label: '720p',
              res: 720
            },
            {
              type: attrs.type,
              src: attrs.vurl + "/480p",
              label: '480p',
              res: 480
            },
            {
              type: attrs.type,
              src: attrs.vurl + "/360p",
              label: '360p',
              res: 360
            }
          ]);
          this.updateSrc(source);
        });

        player.on("useractive", function() {
          $(".header-player").fadeIn("slow");
        });
        player.on("userinactive", function() {
          $(".header-player").fadeOut("slow");
        });
        player.on('resolutionchange', function() {
          // console.info('Source changed to %s', player.src())
        });

        attrs.$observe('vurl', function(value) {
          var source = ([{
              type: attrs.type,
              src: value,
              label: '720p',
              res: 720
            },
            {
              type: attrs.type,
              src: value + "/480p",
              label: '480p',
              res: 480
            },
            {
              type: attrs.type,
              src: value + "/360p",
              label: '360p',
              res: 360
            }
          ]);
          player.updateSrc(source);
        });

        //destroy video when $scope is destroyed
        scope.$on('$destroy', function() {
          console.log('destroying video player');
          player.dispose();
        });

      }
    }
  });
 

} (angular.module("ace", [
    'ace.Constant',
    'ace.home',
    'templates-app',
    'templates-common',
    'ui.router.state',
    'ui.router',
    'ui.bootstrap',
    'pascalprecht.translate',
    'ace.common',
    'ace.courses',
    'ace.analytics',
    'ace.news',
    'ace.oauth_client',
    'HashBangURLs',
    'slugifier',
    'ace.users',
    'angular-growl',
    'vjs.video',
    'ngMessages',
    'ngSanitize',
    'ngCookies',
    'angular-md5',
    'nl2br',
    'http-auth-interceptor',
    'textAngular',
    'ui.sortable',
    'ngAnimate',
    'oc.lazyLoad',
    'satellizer',
    '720kb.socialshare',
    'ace.contactUs',
    'ace.pages',
    'ace.credit',
    'ace.multipleInstructor',
    'me-lazyload',
    'ace.instructor',
    'ace.offlineCourse',
    'ace.webinarCourse',
    'tmh.dynamicLocale',
    'ngFileUpload',
    'ismobile',
    'ace.message',
    // 'google.places',
    'angularMoment',
    'ngTagsInput',
    'angular-clipboard',
    'uiSwitch',
    'oitozero.ngSweetAlert',
    'ace.articlelesson',
    'ace.downloadblefilelesson',
    'ace.videolesson',
    'ace.videoembedorexternallesson',
    'ace.Quiz',
    'ace.Assignment',
    'ace.codingexercise',
    'ui.ace',
    'ace.group',
    'ace.carts',
    'ace.CourseCheckout',
    'ace.ratingAndReview',
    'ace.certificate',
    'payment',
    'ace.revenue_report',
    'ace.creditoffer',
    'ace.socialLogin',
    'ace.support',
    'ace.userprofile',
    'ace.courseanalytics',
    'ace.coupons',
    'ace.banner',
    'ace.seo',
    'ace.socialShare',
    'ace.withdrawal',
    'ace.courseWishlist',
    'ace.multiCurrency',
    'ace.amazonS3',
    'ace.translations',
    'ace.payPalREST',
    'ace.courseflags',
    'ace.comments',
    'ace.bulkuploader',
    'ace.question&answer',
    'angular-img-cropper',
    'ace.practicetest',
    'timer',
    'FBAngular',
    'ngJcrop',
    'angular-redactor',
    // 'ocNgRepeat',
    'textAngularTest',
    'thatisuday.dropzone'
])));