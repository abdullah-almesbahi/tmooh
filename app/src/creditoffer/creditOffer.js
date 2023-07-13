(function (module) {

    module.controller('creditofferController', function ($scope, $rootScope, Contact, $filter, flash, TokenServiceData, $state, CreditOfferLogs, $location) {
        model = this;
        $rootScope.pageTitle = $filter("translate")("Credits")  + " | " + $rootScope.settings['site.name'];
        var successMessage;
        $scope.$on('$locationChangeSuccess', function () {
            model.loader = true;
            GetCreditOffer();
        });
        model.loader = true;
        function GetCreditOffer(element) {
            model.currentPage = ($state.params.page !== undefined) ? parseInt($state.params.page) : 1;
            model.loader = true;
            var params = {};
            params.sort = 'id';
            params.sort_by = 'DESC';
            params.page = model.currentPage;
            CreditOfferLogs.get(params).$promise
                .then(function (response) {
                    model.currentPage = params.page;
                    if (angular.isDefined(response._metadata)) {
                        model.metadata = response._metadata;
                    }
                    if (angular.isDefined(response.data)) {
                        model.credit_offer_logs = response.data;
                    }
                    model.loader = false;
                }, function (error) {
                    model.loader = false;
                });
        }

        $scope.paginate = function (currentPage) {
            model.currentPage = parseInt(currentPage);
            $location.search('page', model.currentPage);
        };
        /**FUNCTION CALLING  */
        GetCreditOffer();
    });

} (angular.module("ace.creditoffer")));
