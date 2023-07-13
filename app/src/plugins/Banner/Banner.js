/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function(module) {

}(angular.module('ace.banner', [
    'ui.router',
    'ngResource'

])));

(function(module) {
    module.directive('banner', function() {
        var linker = function(scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/Banner/banner.tpl.html',
            link: linker,
            controller: 'bannerController as model',
            bindToController: true,
            scope: {
                position: '@position'
            }
        };
    });
    module.controller('bannerController', function($scope) {
        var model = this;
    });

}(angular.module("ace.banner")));
