(function (module) {

    module.controller('contactUsController', function ($scope, $rootScope, Contact, $filter, flash, TokenServiceData, $state, ContactH2k) {
        model = this;
        if ($state.current.name === "contact") {
            $rootScope.pageTitle =  $filter("translate")("Contact Team Tmooh") + " | " +  $rootScope.settings['site.name'];
            $rootScope.metaDescription = $filter("translate")("Get in touch with the Tmooh team for more information about our Tmooh or our Tmooh courses.");
        } else if ($state.current.name === "H2kforcorporate") {
            $rootScope.pageTitle =  $filter("translate")("Business") + " | " + $rootScope.settings['site.name'];
            $rootScope.metaDescription = $filter("translate")("Get in touch with the Tmooh team for more information about our business subscription or our business courses.");
        } else if ($state.current.name === "Quote") {
            $rootScope.pageTitle =  $filter("translate")("Get Quote") + " | " + $rootScope.settings['site.name'];
            $rootScope.metaDescription = $filter("translate")("Get in touch with the Tmooh team for more information about our Tmooh or our Tmooh courses and quote.");
        }
        $rootScope.status = 'ready';

        $scope.hstep = 1;
        $scope.mstep = 15;
        model.contactForm = {};
        model.quotecontactvalue = {};
        var successMessage;
        model.contactFormSubmit = contactFormSubmit;
        model.contactForm = new Contact();
        model.H2kcontactFormSubmit = H2kcontactFormSubmit;
        model.QuotecontactFormSubmit = QuotecontactFormSubmit;

        function DateInit() {
            var Today = new Date(),
                tommorrow = Today.setDate(Today.getDate() + 1);
            model.picker2 = {
                datepickerOptions: {
                    minDate: new Date(tommorrow),
                }
            };
        }
        var unwatchMinMaxValues = $scope.$watch(function () {
            return [model.picker2];
        }, function () {
            model.quotecontactvalue.expected_date_time_to_start = $filter('date')(Date.parse(model.picker2.date), 'yyyy-MM-dd') + ' ' + $filter('date')(Date.parse(model.picker2.time), 'HH:mm:ss');
        }, true);

        function contactFormSubmit() {
            $scope.disableButton = true;
            model.contactForm.type = 'Contact';
            model.contactForm.$save()
                .then(function (response) {
                    if (response.id) {
                        successMessage = $filter("translate")("Thank you for contacting us.");
                        flash.set(successMessage, 'success', false);
                        model.contactForm = new Contact();
                    } else {
                        successMessage = $filter("translate")("Unable to contact. Please try again later");
                        flash.set(successMessage, 'success', false);
                    }
                    $scope.disableButton = false;
                })
                .catch(function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while trying to contact us, please try again later.");
                    flash.set(flashMessage, 'error', false);
                    $scope.disableButton = false;
                })
                .finally();
        }

        function H2kcontactFormSubmit($valid, form) {
            if ($valid) {
                $scope.disableButton = true;
                model.h2kcontactvalue.type = 'Corporate';
                ContactH2k.create(model.h2kcontactvalue, function (response) {
                    if (response.id) {
                        successMessage = $filter("translate")("Thank you for contacting us.");
                        flash.set(successMessage, 'success', false);
                        model.h2kcontactvalue = {};
                        form.$setPristine();
                        form.$setUntouched();
                    } else {
                        successMessage = $filter("translate")("Unable to contact. Please try again later");
                        flash.set(successMessage, 'success', false);
                    }
                    $scope.disableButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while trying to contact us, please try again later.");
                    flash.set(flashMessage, 'error', false);
                    $scope.disableButton = false;
                });
            }

        }

        function QuotecontactFormSubmit($valid, form) {
            if ($valid) {
                $scope.disableButton = true;
                model.quotecontactvalue.type = 'Quote';
                ContactH2k.create(model.quotecontactvalue, function (response) {
                    if (response.id) {
                        successMessage = $filter("translate")("Quote has been raised successfully.");
                        flash.set(successMessage, 'success', false);
                        model.quotecontactvalue = {};
                        DateInit();
                        form.$setPristine();
                        form.$setUntouched();
                    } else {
                        successMessage = $filter("translate")("Unable to add a quote. Please try again later");
                        flash.set(successMessage, 'success', false);
                    }
                    $scope.disableButton = false;
                }, function (error) {
                    flashMessage = $filter("translate")("Oops, an error has occurred while trying to Quote us, please try again later.");
                    flash.set(flashMessage, 'error', false);
                    $scope.disableButton = false;
                });
            }

        }
        DateInit();

    });


} (angular.module("ace.contactUs")));
