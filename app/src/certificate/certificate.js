(function(module) {

    module.controller('CourseCertificateController', ['$state', '$scope', '$rootScope', 'md5', '$window', '$uibModal', 'GENERAL_CONFIG', function($state, $scope, $rootScope, md5, $window, $uibModal, GENERAL_CONFIG) {
        /**VARIABLE DECALARATION */
        var model = this;
        /**VARIABLE ASSIGNING */
        model.CreateCertificate = CreateCertificate;
        model.courseUserId = $state.params.id;
        model.ShareModal = ShareModal;
        /**FUNCTION DECALARATION */
        function viewcertificateCreation() {
            var hash = md5.createHash('Certificate' + model.courseUserId + 'view' + encodeURI($rootScope.settings['site.name']));
            $scope.certificateview_image = 'certificate/' + model.courseUserId + '/' + hash + '/' + 'view';
        }

        function CreateCertificate(type) {
            var hash = md5.createHash('Certificate' + model.courseUserId + type + encodeURI($rootScope.settings['site.name']));
            model.url = 'certificate/' + model.courseUserId + '/' + hash + '/' + type;
            if (type !== 'share') {
                $window.open(model.url, '_blank');
            } else {
                ShareModal();
            }
        }

        function ShareModal() {
            $scope.modalInstance = $uibModal.open({
                scope: $scope,
                size: 'sm',
                template: '<div class="modal-login"><div class="center-form"><div class="panel-heading clearfix"><h3 class="text-center">{{"Share"|translate}}<a data-dismiss="modal" ng-click="modalClose($event)" class="modalClose">X</a></h3>	</div><div class="card-body"><div class="row"><div class="col-xs-12"><form method="post" name="groupForm"><div class="form-group has-feedback certificate-share"><social-share share-title="certificate" share-style="ListInline" ng-if="ShareUrl !== null" share-link="{{ShareUrl}}" share-type="certificate"></social-share></div><br/></form></div></div></div></div></div>',
                controller: function($scope, ShareUrl, GENERAL_CONFIG, $uibModalStack) {
                    $scope.ShareUrl = ShareUrl;
                    $scope.modalClose = function(e) {
                        e.preventDefault();
                        $uibModalStack.dismissAll();
                    };
                },
                resolve: {
                    ShareUrl: function() {
                        return model.url;
                    },
                }
            });
        }
        /**FUNCTION CALLLING */
        viewcertificateCreation();
    }]);
}(angular.module('ace.certificate')));
