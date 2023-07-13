/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function (module) {



} (angular.module('ace.bulkuploader', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('bulkUploaderButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/BulkUploader/BulkUploaderButton.tpl.html',
            link: linker,
            controller: 'bulkuploaderButtonController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId'
            }
        };
    });
    module.controller('bulkuploaderButtonController', function ($rootScope, $scope, BulkUploaderFactory, flash, $filter) {
        var model = this;
        model.showPicker = function () {
            var client = filestack.init('AE1tpWHrRZOFl7VusR9Y3z');
            client.pick({
                // onOpen: function () { },
                // onClose: function () { },
                storeTo: {
                    location: 's3',
                    path: '/VideoOriginal/',
                    region: 'eu-central-1',
                    container: 'tmooh-media',
                    access: 'private',

                },
                uploadConfig: {
                  intelligent:false,
                },
                accept: ['video/*'],
                maxFiles: 5,
                minFiles: 1,
                exposeOriginalFile: false,
                fromSources:["url","googledrive","dropbox","onedrive","clouddrive"],
            }).then(function (result) {
                AddBulkUploaderAttachment(result);
            });
        };

        function AddBulkUploaderAttachment(bulk_response) {
            var params = {};
            params.attachment = [];
            console.log("cool",JSON.stringify(bulk_response.filesUploaded))
            angular.forEach(bulk_response.filesUploaded, function (element) {
                if (element.status === 'Stored' || element.status === 'InTransit') {
                    params.attachment.push({
                        "filename": element.filename,
                        "aws_url": element.key,
                        "size": element.size,
                        "type": element.mimetype
                    });
                }
            });
            BulkUploaderFactory.create(params, function (response) {
                if (response.error.code === 0) {
                    flashMessage = $filter("translate")("Video has been uploaded sucessfully.");
                    flash.set(flashMessage, 'success', false);
                } else {
                    flashMessage = $filter("translate")("Unable to upload video, please try again later.");
                    flash.set(flashMessage, 'error', false);
                }
            });
        }
    });
    module.directive('bulkUploader', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/BulkUploader/BulkUploader.tpl.html',
            link: linker,
            controller: 'bulkUploaderController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                videoAction: '@videoAction',
                lessonId: '@lessonId',
                lessonTypeId: '@lessonTypeId',
                updateparent: '&',
                publishparent: '&'
            }
        };
    });
    module.controller('bulkUploaderController', function ($rootScope, $scope, AddCourseQuiz, $filter, flash, OnlineCourseLessonsUpdate, addOnlineCourseLessons, anchorSmoothScroll, $timeout, CreateOnlineCourseLesson, BulkUploaderFactory, BulkUploaderUpdateFactory, AlertBox) {
        var model = this;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        model.deleteAttachment = deleteAttachment;

        function getBulkFiles() {
            BulkUploaderFactory.get(params, function (response) {
                if (response.error.code === 0) {
                    response.data = $filter('CountryTimezone')(response.data, ['created'], 'TimeZoneSet', 'dd MMM yyyy');
                    model.AttachmentFiles = response.data;
                } else {
                    flashMessage = $filter("translate")("unable to add the video. Please try again.");
                    flash.set(flashMessage, 'error', false);
                }
            }, function (error) {
                flashMessage = $filter("translate")("unable to add the video. Please try again.");
                flash.set(flashMessage, 'error', false);
            });
        }
        getBulkFiles();

        function deleteAttachment(index) {
            AlertBox.confirm('Are you sure you want to delete a video?', function (isConfirmed) {
                if (isConfirmed) {
                    BulkUploaderUpdateFactory.remove({ id: model.AttachmentFiles[index].id }, function (response) {
                        if (response.error.code === 0) {
                            model.AttachmentFiles.splice(index, 1);
                            flashMessage = $filter("translate")("video has been deleted successfully.");
                            flash.set(flashMessage, 'success', false);
                        } else {
                            flashMessage = $filter("translate")("Unable to delete video, please try again later.");
                            flash.set(flashMessage, 'error', false);
                        }
                    }, function (error) {
                        flashMessage = $filter("translate")("Unable to delete video, please try again later.");
                        flash.set(flashMessage, 'error', false);
                    });
                }
            });

        }

        function CheckUnpublishedLessons(index) {
            if (model.videoAction === 'AssignmentAdd') {
                $rootScope.Assignment_bulk_uploader_id = model.AttachmentFiles[index].id;
            } else {
                var unpublished_lessons = model.publishparent();
                angular.forEach(unpublished_lessons, function (lessons) {
                    if (lessons.is_chapter === 0) {
                        lessons.online_lesson_type_id = 3;
                        lessons.is_lesson_ready = 1;
                        lessons.assignment_instruction_videos = [];
                        lessons.assignment_instruction_videos.push({
                            "id": model.AttachmentFiles[index].id
                        });
                    }
                });
                if (unpublished_lessons.length > 0) {
                    addLessonDetail(unpublished_lessons);
                }
                if (unpublished_lessons.length === 0) {
                    $scope.UpdateVideodetails(index);
                }
            }

        }

        function addLessonDetail(lessons) {
            var lessondetails = lessons.shift();
            CreateOnlineCourseLesson.create(lessondetails, function (response) {
                if (response.data) {
                    if (lessons.length > 0) {
                        addLessonDetail(lessons);
                    } else {
                        succsMsg = $filter("translate")("Video has been updated successfully.");
                        flash.set(succsMsg, 'success', false);
                        model.updateparent();
                        UpdateCourseStatus();
                    }
                } else {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating video. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                }
            }, function (error) {
                flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating video. Please try again later.");
                flash.set(flashMessage, 'error', false);
            });
        }

        $scope.UpdateVideodetails = function (index) {
            var params = {};
            params.assignment_instruction_videos = [];
            params.assignment_instruction_videos.push({
                "id": model.AttachmentFiles[index].id
            });
            params.is_lesson_ready = 1;
            params.id = model.lessonId;
            params.online_lesson_type_id = model.lessonTypeId;
            OnlineCourseLessonsUpdate.update(params, function (response) {
                if (response.error.code === 0) {
                    succsMsg = $filter("translate")("Video updated successfully.");
                    flash.set(succsMsg, 'success', false);
                    model.updateparent();
                    UpdateCourseStatus();
                } else {
                    flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating video. Please try again later.");
                    flash.set(flashMessage, 'error', false);
                }
            }, function (error) {
                flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating video. Please try again later.");
                flash.set(flashMessage, 'error', false);
            });
        };
        //Updating the course status to daft mode
        function UpdateCourseStatus() {
            $scope.$emit('updateCourseStatus', {
                status: 'draft',
                statusCode: 3,
                flash_message: 0
            });
        }
    });

    module.directive('dropzoneButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/BulkUploader/DropzoneButton.tpl.html',
            link: linker,
            controller: 'videoDropzoneFormController as model',
            bindToController: true,
            scope: {
                courseId: '@courseId',
                course: '@course',
                action: '@action',
                lessonId: '@lessonId',
                updateparent: '&'
            }
        };
    });
    // module.directive('videoDropzoneForm', function() {
    //     var linker = function(scope, element, attrs) {
    //         // do DOM Manipulation here
    //
    //     };
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'src/plugins/BulkUploader/videoDropzoneForm.tpl.html',
    //         link: linker,
    //         controller: 'videoDropzoneFormController as model',
    //         bindToController: true,
    //         transclude: true,
    //         scope: {
    //             course: '@course',
    //             action: '@action',
    //             lessonId: '@lessonId',
    //             updateparent: '&'
    //         }
    //     };
    // });
    module.controller('videoDropzoneFormController', ['Course', '$scope', 'addOnlineCourseLessons', '$http', 'OnlineCourseLessons', 'OnlineCourseLessonsUpdate', 'flash', '$filter', 'GENERAL_CONFIG', '$rootScope', function(Course, $scope, addOnlineCourseLessons, $http, OnlineCourseLessons, OnlineCourseLessonsUpdate, flash, $filter, GENERAL_CONFIG, $rootScope) {
      var model = this;
      var uploadUrl = GENERAL_CONFIG.api_url + 'api/v1/image_upload?token='+$.cookie('token');
      var courseID = model.courseId;
      $scope.action = model.action;
      $scope.lessonID = model.lessonId;
      $scope.showForm = false;
      $scope.editForm = false;
      $scope.label = $filter("translate")("Add Multiple Videos");

      //Set options for dropzone
      //Visit http://www.dropzonejs.com/#configuration-options for more options
      $scope.dzOptions = {
        url : uploadUrl,
        method : 'post',
        withCredentials : true,
        uploadMultiple : true,
        clickable : true,
        ignoreHiddenFiles : true,
        autoProcessQueue : true,
        autoQueue : true,
        paramName : 'attachment',
        params: {
          type : 'video'
        },
        maxFilesize : '1000',
        acceptedFiles : 'video/mpeg4, video/mp4, video/wmv, video/x-ms-wmv, video/flv, video/x-flv, flv-application/octet-stream, application/octet-stream, video/3gpp, video/webm, video/mpeg, video/mov, video/quicktime, video/x-sgi-movie, video/avi, application/x-troff-msvideo, video/msvideo, video/x-msvideo',
        headers: {
          'Content-Type': undefined
        },
        addRemoveLinks : true,

        //translations
        dictDefaultMessage : $filter("translate")("Drop files here to upload"),
        dictFallbackMessage : $filter("translate")("Your browser dose not support this feature"),
        dictCancelUpload : $filter("translate")("Cancel upload"),
        dictUploadCanceled : $filter("translate")("Upload is canceled"),
        dictRemoveFile : $filter("translate")("Remove file"),
      };


      //Handle events for dropzone
      //Visit http://www.dropzonejs.com/#events for more events
      $scope.dzCallbacks = {
        addedfile : function(file){
          // console.log("addedfile",file);
          $scope.newFile = file;
        },
        successmultiple : function(file, res){
          var files = JSON.parse(res);
          files.map( function(response) {

              if (response.error.code === 0) {
                  //save video to the server
                  saveVideo(response);

              } else {
                  if ($scope.action === 'edit') {
                      delete(model.editOnlineVideoLesson.filename);
                  } else {
                      delete(model.onlineVideoLesson.filename);
                  }
                  $("#inputTaskAttachments").val("");
                  if (response.error.code === 1) {
                      errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: mov, mpeg4, avi, wmv, mpeg, flv, 3gpp, webm, mp4.");
                  } else if (response.error.code === 2) {
                      errorMessage = $filter("translate")("File couldn't be uploaded. Allowed extensions: gif, jpeg, jpg, png.");
                  } else if (response.error.code === 3) {
                      errorMessage = $filter("translate")("The uploaded file size exceeds the allowed size.");
                  } else {
                      errorMessage = response.error.message;
                  }
                  flash.set(errorMessage, 'error', false);
              }
          });
        },
        queuecomplete : function(){
          $scope.showForm = false;
          model.updateparent();
        },
      };


      //Apply methods for dropzone
      //Visit http://www.dropzonejs.com/#dropzone-methods for more methods
      $scope.dzMethods = {};
      $scope.removeNewFile = function(){
        $scope.dzMethods.removeFile($scope.newFile); //We got $scope.newFile from 'addedfile' event callback
      }


      $scope.uploadConfigure = function() {
          //to close all forms and show current form
          $scope.$emit('closeLessons', {});
          $scope.showForm = true;
          model.editOnlineVideoLesson = {};
          model.onlineVideoLesson = {};
          model.onlineVideoLesson = new addOnlineCourseLessons();
          model.onlineVideoLesson.is_active = 0;
          model.onlineVideoLesson.is_preview = 0;
      };
      $scope.hideForm = function(e) {
          e.preventDefault();
          $scope.showForm = false;
          $scope.editForm = false;
      };
      //to close all forms and show current form
      $rootScope.$on('closeLessons', function(event, args) {
          $scope.showForm = false;
      });


      function saveVideo(response) {
        model.onlineVideoLesson = {};
        model.onlineVideoLesson = new addOnlineCourseLessons();
        model.onlineVideoLesson.is_active = 1;
        model.onlineVideoLesson.is_preview = 0;
        model.onlineVideoLesson.online_lesson_type_id = 3;
        model.onlineVideoLesson.filename = response.filename;
        model.onlineVideoLesson.name = response.filename.replace("---", " ").replace("--", " ").replace("-", " ").replace(".", " ").replace("mp4", " ").replace( /\d{2,8}/g, '');
        model.onlineVideoLesson.course_id = parseInt(courseID);
        model.onlineVideoLesson.is_chapter = 0;
        model.onlineVideoLesson.$save()
        .then(function(response2) {
            if (response2.id) {
                // $scope.showForm = false;
                if (angular.isDefined(response2.id !== '' && response2.id !== "null")) {
                    succsMsg = $filter("translate")("Video added successfully.");
                    flash.set(succsMsg, 'success', false);
                }
                // model.updateparent();
            }
        })
        .catch(function(error) {

        })
        .finally(function() {

        });
      }

  }]);
})(angular.module('ace.bulkuploader'));
/**
 * @ngdoc factory
 * @name AmazonS3Signature,GetCloudFrontSignature
 * @description
 * To get the details about the amazon s3 uploader.
 *
 *
 **/
(function (module) {
    module.factory('BulkUploaderFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/attachments', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });

    module.factory('BulkUploaderUpdateFactory', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/attachments/:id', {
                id: '@id'
            }, {
                'remove': {
                    method: 'DELETE'
                }
            }
        );
    });
    module.factory('OnlineCourseLessonsUpdate', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });
    module.factory('addOnlineCourseLessons', ['$resource', 'GENERAL_CONFIG', function($resource, GENERAL_CONFIG) {
      return $resource(
          GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons', {
              id: '@id'
          }, {
              'update': {
                  method: 'PUT'
              }
          }
      );
  }]);
})(angular.module("ace.bulkuploader"));
