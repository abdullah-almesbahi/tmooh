(function(module) {

    module.controller('pagesController', function($scope, $rootScope, Pages, $state, $filter, TokenServiceData, LocaleService, languageList) {
        model = this;
        model.page = [];
        var slugName = ($state.params.slug) ? $state.params.slug : '';
        var params = {};
        params.slug = slugName;
        params.iso2 = $.cookie("currentLocale");
        staticPages();

        if($state.params.language && $.cookie("currentLocale") != $state.params.language){
            var localesObj1 = [];
            var promiseSettings = languageList.promise;
            promiseSettings.then(function(response) {
                params.iso2 = $state.params.language;
                $.each(response.site_languages, function(i, data) {
                    localesObj1[data.iso2] = data.name;
                });
                LocaleService.setLocaleByDisplayName(localesObj1[$state.params.language]);
            });  
        }
        
        $rootScope.$on('changeLanguage', function(event, args) {
            params.iso2 = args.currentLocale;
            staticPages();
        });

        function staticPages() {
            Pages.get(params).$promise
                .then(function(response) {
                    model.page = response.data[0];
                    if (model.page) {
                        $rootScope.pageTitle = model.page.title  + " | " + $rootScope.settings['site.name'];
                        $rootScope.metaDescription = model.page.subtitle;
                    } else {
                        $rootScope.pageTitle = $filter("translate")(slugName)  + " | " + $rootScope.settings['site.name'];
                    }
                    $rootScope.status = 'ready';
                });
        }
    });

}(angular.module("ace.pages")));
