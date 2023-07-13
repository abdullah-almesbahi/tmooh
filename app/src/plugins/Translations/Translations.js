/**
 * ace - v0.0.1 - 2016-04-13
 *
 * Copyright (c) 2016 Agriya
 */
(function(module) {


}(angular.module('ace.translations', [
    'ngResource',
	'pascalprecht.translate',
	'tmh.dynamicLocale',
	'ngSanitize',
	'ngCookies'
])));

(function(module) {
    module.directive('languageSelect', function(LocaleService, languageList) {
        return {
            restrict: 'EA',
            link: function (scope, element) {
            },
            templateUrl: 'src/plugins/Translations/languageTranslate.tpl.html',
            controller: function($scope, $rootScope, $timeout, languageList, tmhDynamicLocale, $translate) {
                var promiseSettings = languageList.promise;
                promiseSettings.then(function(response) {
                    $scope.currentLocaleDisplayName = LocaleService.getLocaleDisplayName();
                    $scope.localesDisplayNames = LocaleService.getLocalesDisplayNames();
                    $scope.visible = $scope.localesDisplayNames &&
                        $scope.localesDisplayNames.length > 1;   

                });

                $scope.changeLanguage = function(locale) {
                    LocaleService.setLocaleByDisplayName(locale);
                    $scope.currentLocaleDisplayName = LocaleService.getLocaleDisplayName();
                };
            }
        };
    });
}(angular.module("ace.translations")));
