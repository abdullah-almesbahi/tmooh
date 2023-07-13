(function(module) {
    module.factory('FreeTrailFormData', function($resource, GENERAL_CONFIG) {
        var savedData = [];

        function set(data) {
            savedData = data;
        }

        function get() {
            return savedData;
        }
        return {
            set: set,
            get: get
        };
    });
})(angular.module("ace.common"));
