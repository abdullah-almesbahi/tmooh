
angular.module('base')
    .controller('quickloginController', function ($rootScope, $scope,$state, $location, $http, $window, $timeout, progression, notification, $cookies, Login, $injector) {
      $http.get(admin_api_url + 'api/v1/admin/quicklogin',{params:{e:$state.params.e}}).success(function(response) {
        $scope.response = response;
        if (!angular.isUndefined($scope.response.error) && $scope.response.error.code === 0) {
          $scope.disableButton = false;
          Auth = {};
          Auth.id = $scope.response.user.id;
          Auth.providertype = $scope.response.user.providertype;
          Auth.accesstoken = $scope.response.user.accesstoken;
          Auth.displayname = $scope.response.user.displayname;
          Auth.designation = $scope.response.user.designation;
          Auth.headline = $scope.response.user.headline;
          Auth.sub_admin_id = $scope.response.user.sub_admin_id;
          Auth.user_image_hash = $scope.response.user.image_hash;
          Auth.token = $scope.response.user.token;
          Auth.available_credits = $scope.response.user.available_credits;
          Auth.email = $scope.response.user.email;
          _cookieAuth = {};
          _cookieAuth.id = Auth.id;
          _cookieAuth.providertype = Auth.providertype;
          _cookieAuth.accesstoken = Auth.accesstoken;
          _cookieAuth.displayname = Auth.displayname;
          _cookieAuth.token = Auth.token;
          _cookieAuth.designation = Auth.designation;
          _cookieAuth.sub_admin_id = $scope.response.user.sub_admin_id;
          _cookieAuth.headline = Auth.headline;
          _cookieAuth.userImageHash = Auth.user_image_hash;
           _cookieAuth.email = Auth.email;
          token = $scope.response.access_token;
           $rootScope.oauthscopes = [];
          $rootScope.sub_admin_id = $scope.response.user.sub_admin_id;
          if ($scope.response.user.sub_admin_id !== null && $scope.response.user.sub_admin_id !== undefined) {
              if ($scope.response.sub_admin_scopes !== null && $scope.response.sub_admin_scopes !== undefined) {
                  var oauthscopes = $scope.response.sub_admin_scopes.oauth_scopes.split(',');
                  $rootScope.oauthscopes = oauthscopes;
                  $rootScope.oauthscopes.sub_admin_id = $scope.response.user.sub_admin_id;
                  $window.localStorage.setItem('oauth_scopes', JSON.stringify(oauthscopes));
              }
          }

          $cookies.put('auth', JSON.stringify(_cookieAuth), {
              path: '/'
          });
          $cookies.put('token', token, {
              path: '/'
          });
          $cookies.put('refresh_token', $scope.response.refresh_token, {
              path: '/'
          });
          $rootScope.auth = Auth;
          $scope.isAuth = true;
          $rootScope.isAuth = true;
          $rootScope.isUser = false;
          $scope.$emit('updateParent', {
              isAuth: true,
              auth: Auth,
              isUser: $rootScope.isUser
          });
          // refreshing header and become an instructor
          $scope.$emit('refreshHeader', {
              isAuth: true,
          });
          $rootScope.$emit('checkIsTeacher', {

          });
          var redirectto = $location.absUrl().split('/#/');
          redirectto = redirectto[0].split('ag-admin');
          redirectto = redirectto[0];
          window.location.href = redirectto;
          // var redirectto = $location.absUrl().split('/');
          // if (Auth.providertype == "admin" || Auth.providertype == 3) {
          //     redirectpath = redirectto[0] + '/ag-admin';
          //     window.location.href = redirectpath;
          // } else {
          //     $state.reload();
          // }




            // $scope.disableButton = false;
            // SessionService.setUserAuthenticated(true);
            // Auth = {};
            // Auth.id = $scope.response.user.id;
            // Auth.providertype = $scope.response.user.providertype;
            // Auth.accesstoken = $scope.response.user.accesstoken;
            // Auth.displayname = $scope.response.user.displayname;
            // Auth.designation = $scope.response.user.designation;
            // Auth.headline = $scope.response.user.headline;
            // Auth.user_image_hash = $scope.response.user.image_hash;
            // Auth.token = $scope.response.user.token;
            // // Auth.site_url = GENERAL_CONFIG.api_url;
            // _cookieAuth = {};
            // _cookieAuth.id = Auth.id;
            // _cookieAuth.providertype = Auth.providertype;
            // _cookieAuth.accesstoken = Auth.accesstoken;
            // _cookieAuth.displayname = Auth.displayname;
            // _cookieAuth.token = Auth.token;
            // _cookieAuth.designation = Auth.designation;
            // _cookieAuth.headline = Auth.headline;
            // _cookieAuth.userImageHash = Auth.user_image_hash;
            //
            //
            // token = $scope.response.access_token;
            // var date = new Date();
    				// var minutes = 43800;
    				// var expireCookie = date.setTime(date.getTime() + (minutes * 60 * 1000));
            // $.cookie('auth', JSON.stringify(_cookieAuth), {
            //     expires: expireCookie,
            //     path: '/'
            // });
            // $.cookie('token', token, {
            //     expires: expireCookie,
            //     path: '/'
            // });
            // $.cookie('refresh_token', $scope.response.refresh_token, {
            //     expires: expireCookie,
            //     path: '/'
            // });
            // $rootScope.auth = Auth;
            // $scope.isAuth = true;
            // $rootScope.isAuth = true;
            // $rootScope.isUser = false;
            // $scope.$emit('updateParent', {
            //     isAuth: true,
            //     auth: Auth,
            //     isUser: $rootScope.isUser
            // });
            // // refreshing header and become an instructor
            // $scope.$emit('refreshHeader', {
            //     isAuth: true,
            // });
            // $rootScope.$emit('checkIsTeacher', {
            //
            // });

            // var redirectto = $location.absUrl().split('/#/');
            // redirectto = redirectto[0].split('ag-admin');
            // redirectto = redirectto[0];
            // window.location.href = redirectto;
        }
    });
});
