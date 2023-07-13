(function (module) {

    module.controller('errorController', function ($rootScope, $filter) {
        var model = this;
        model.loading = false;
        $rootScope.pageTitle =   $filter("translate")("The page you requested was not found") +  " | " +  $rootScope.settings['site.name'];
        $rootScope.metaDescription = $filter("translate")("Unfortunately the file you were looking for was not found on this site. Please make sure you followed the correct link. If you believe you got this message in error, please notify us so we can fix it. Thank you!");
        $rootScope.status = 'ready';
       
    });
} (angular.module("ace.common")));
