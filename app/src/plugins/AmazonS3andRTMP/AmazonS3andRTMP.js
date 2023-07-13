/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function (module) {



} (angular.module('ace.amazonS3', [
    'ui.router',
    'ngResource',
])));

(function (module) {
    module.directive('amazonUpload', function () {
        /**
         * @ngdoc directive
         * @name amazonUpload
         * @description
         * Amazon S3 uploader directive.
         *
         *
         **/
        var linker = function (scope, element, attrs) {

            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/AmazonS3andRTMP/amazonS3.tpl.html',
            link: linker,
            controller: 'amazonS3UploadController as model',
            bindToController: true,
            scope: {
                formName: '@formName',
                type: '@type',
                videoUrl: '@videoUrl',
                lessonId: '@lessonId',
                updateparent: '=method',
                width: '@width',
                height: '@height',
                mType: '@mType',
                mId: '@mId',
            }
        };
    });
    module.directive('dropzoneS3Button', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here
        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/AmazonS3andRTMP/DropzoneS3Button.tpl.html',
            link: linker,
            controller: 'amazonS3UploadController as model',
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
    module.controller('amazonS3UploadController', function ($state, AmazonS3Signature, $location, $scope, flash, $filter, $rootScope, $interval, Upload, GetCloudFrontSignature, $cookies, $timeout,addOnlineCourseLessons,Slug) {
        /**
         * @ngdoc controller
         * @name amazonS3UploadController
         * @description
         * User can upload the video any format to Amazon S3 server.
         *
         *
         **/
        var model = this;
        if (model.formName === 'edit_video' || model.formName === 'assigmentAddFrom') {
            model.required = false;
        } else {
            model.required = true;
        }
  
        model.getting_AmazonS3_Signature = getting_AmazonS3_Signature;
        //call back url to call the video files
        var USER_AGENT= navigator.userAgent;
        if ((/Trident/i).test(USER_AGENT)){
          videojs.options.hls.mode = 'flash';
        }



        videojs.options.hls.overrideNative = true;
        // videojs.options.hls.debug = true;
        // videojs.Hls.xhr.beforeRequest = function (opt) {
        //     opt.uri = opt.uri + '?Key-Pair-Id=' + $cookies.get("CloudFront-Key-Pair-Id") + '&Policy=' + $cookies.get("CloudFront-Policy") + '&Signature=' + $cookies.get("CloudFront-Signature");
        //     return opt;
        // };        

        function cleanFilename(file){
          var allowed_length = 100;
          var extension = file.split('.').pop();
          var file_without_extension = Slug.slugify(file.replace("." + extension , "").replace( /\d{2,8}/g, '').replace(/[^a-z0-9\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]/gi, ' ').toLowerCase().trim() ) ;
          if(file_without_extension.length > allowed_length){
            file_without_extension = file_without_extension.substring(0,allowed_length);
          }
          var cleaned_file = file_without_extension + '.' + extension;
          return cleaned_file;
        }

        function cleanTitleFromFilename(file){
          var x = file.replace("---", " ").replace("--", " ").replace("-", " ").replace(".", " ").replace("mp4", " ").replace(/[^a-z0-9\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]/gi, ' ').trim().split(' ');
          delete x[0];
          return x.join(' ');
        }

        // var filexx = '5b1a4b80e4bd8-1087882-01 - Introduction - (WLANs) الدورة العملية لاختبار اختراق الشبكات اللاسلكية.mp4';
        // var ee = cleanFilename(filexx);
        // console.log(cleanTitleFromFilename(ee));


        function getting_AmazonS3_Signature() {
            // *getting Amazon S3 signature for uploading the amazon s3 server function
            AmazonS3Signature.get(function (response) {
                if (response.error.code === 0) {
                    $scope.signature = response;
                }
            }, function (error) {
            });
        }


        $scope.showDropzone = false;
        $scope.dropzoneUploadConfigure = function (file) {
          $scope.showDropzone = true;
          path_dir = 'OnlineCourseLessonOrigin/'+model.courseId+'/';
          //Set options for dropzone
          //Visit http://www.dropzonejs.com/#configuration-options for more options
          $scope.dzOptions = {
            url : $scope.signature.formUrl,
            method : 'post',
            withCredentials : false,
            parallelUploads: 1,
            uploadMultiple : true,
            clickable : true,
            ignoreHiddenFiles : true,
            autoProcessQueue : true,
            autoQueue : true,
            paramName : 'attachment',
            params: {
              // "Content-Type": file.type !== '' ? file.type : 'application/octet-stream',
              'X-amz-algorithm' : $scope.signature.formInputs['X-amz-algorithm'],
              'X-amz-credential' : $scope.signature.formInputs['X-amz-credential'],
              'X-amz-date' : $scope.signature.formInputs['X-amz-date'],
              'X-amz-signature' : $scope.signature.formInputs['X-amz-signature'],
              'acl': $scope.signature.formInputs.acl,
              // key: path_dir + $scope.signature.uid + '-' + file.name,
              policy: $scope.signature.formInputs.policy,
              success_action_status: $scope.signature.formInputs.success_action_status,
              // file: file,
              // filename: path_dir + $scope.signature.uid + '-' + file.name
            },
            maxFilesize : '1000',
            acceptedFiles : 'video/mpeg4, video/mp4, video/wmv, video/x-ms-wmv, video/flv, video/x-flv, flv-application/octet-stream, application/octet-stream, video/3gpp, video/webm, video/mpeg, video/mov, video/quicktime, video/x-sgi-movie, video/avi, application/x-troff-msvideo, video/msvideo, video/x-msvideo',
            // headers: {
            //   // 'Content-Type': undefined,
            //   // 'Cache-Control': null,
            //   // 'X-Requested-With': null,
            // },
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
            sending : function(file, xhr, formData){
              formData.append('Content-Type', file.type !== '' ? file.type : 'application/octet-stream');
              // formData.append('key', path_dir + $scope.signature.uid + '-' + file.name);
              formData.append('key',  'VideoOriginal/'+$scope.signature.uid + '-' + cleanFilename(file.name));
              formData.append('file', file);
              // formData.append('filename', path_dir + $scope.signature.uid + '-' + file.name);
              formData.append('filename',$scope.signature.uid + '-' + cleanFilename(file.name));
              console.log("filename1",$scope.signature.uid + '-' + cleanFilename(file.name));
            },
            addedfile : function(file){
              $scope.newFile = file;
            },
            successmultiple : function(file, res){
                console.log("filename2",$scope.signature.uid + '-' + cleanFilename(file[0].name));
              //save video to the server
              saveVideo({
                filename:  cleanFilename(file[0].name),
                aws_url :  'VideoOriginal/'+ $scope.signature.uid + '-' + cleanFilename(file[0].name)
              });

            },
            queuecomplete : function(){
              $scope.showDropzone = false;
              $("#dropzoneModal").modal('hide');
              // model.updateparent();
            },
          };


          //Apply methods for dropzone
          //Visit http://www.dropzonejs.com/#dropzone-methods for more methods
          $scope.dzMethods = {};
          $scope.removeNewFile = function(){
            $scope.dzMethods.removeFile($scope.newFile); //We got $scope.newFile from 'addedfile' event callback
          }

          function saveVideo(response) {
            model.onlineVideoLesson = {};
            model.onlineVideoLesson = new addOnlineCourseLessons();
            model.onlineVideoLesson.is_active = 1;
            model.onlineVideoLesson.is_preview = 0;
            model.onlineVideoLesson.online_lesson_type_id = 3;
            // model.onlineVideoLesson.filename = response.filename;
            model.onlineVideoLesson.aws_url = response.aws_url;
            model.onlineVideoLesson.name = cleanTitleFromFilename(response.filename);
            model.onlineVideoLesson.course_id = parseInt(model.courseId);
            model.onlineVideoLesson.is_chapter = 0;
            model.onlineVideoLesson.$save()
            .then(function(response2) {
                if (response2.data) {
                    // $scope.showForm = false;
                    if (angular.isDefined(response2.data !== '' && response2.data !== "null")) {
                        succsMsg = $filter("translate")("Video added successfully.");
                        flash.set(succsMsg, 'success', false);
                    }
                    model.updateparent();
                }
            })
            .catch(function(error) {

            })
            .finally(function() {

            });
          }
        }


        $scope.upload = function (file) {
            $scope.progressPercentages = 0;
            model.error = "";
            model.max_error = '';
            if (file !== null && file !== undefined) {
                //  uploading  the video files to amazon server function
                $scope.file = file;
                angular.element('#js-amazon-progress').removeClass('hide');
                model.video_file_size = $filter('bytes')(file.size, 1);
                if ($rootScope.settings['video.max_size_to_allow_video_file'] !== null && $rootScope.settings['video.max_size_to_allow_video_file'] !== undefined && $rootScope.settings['video.max_size_to_allow_video_file'] !== '') {
                    if (file.size > $rootScope.settings['video.max_size_to_allow_video_file']) {
                        var tmp = $filter('bytes')($rootScope.settings['video.max_size_to_allow_video_file'], 1);
                        model.max_error = 'File size should be lesser than ' + tmp;
                        return true;
                    }
                }
                var get_response = false;
                var amazon_response = {};

                var path_dir = '';
                if( model.mType === 'promo' ) {
                  path_dir = 'CoursePromoVideoOrigin/'+model.mId+'/';
                } else if ( model.mType === 'singleVideo') {
                  path_dir = 'OnlineCourseLessonOrigin/'+model.mId+'/';
                }

                Upload.upload({
                    url:  $scope.signature.formUrl,
                    method: 'POST',
                    data: {
                      "Content-Type": file.type !== '' ? file.type : 'application/octet-stream',
                      'X-amz-algorithm' : $scope.signature.formInputs['X-amz-algorithm'],
                      'X-amz-credential' : $scope.signature.formInputs['X-amz-credential'],
                      'X-amz-date' : $scope.signature.formInputs['X-amz-date'],
                      'X-amz-signature' : $scope.signature.formInputs['X-amz-signature'],
                      'acl': $scope.signature.formInputs.acl,
                      key: path_dir + $scope.signature.uid + '-' + file.name,
                      policy: $scope.signature.formInputs.policy,
                      success_action_status: $scope.signature.formInputs.success_action_status,
                      file: file,
                      filename: path_dir + $scope.signature.uid + '-' + file.name

                        // key: 'VideoOriginal/' + $scope.signature.uid + '-' + file.name,
                        // AWSAccessKeyId: $scope.signature.AWS_ACCESS,
                        // acl: 'private',
                        // policy: $scope.signature.policy,
                        // "Signature": $scope.signature.signature,
                        // 'Credential' : `${$scope.signature.AWS_ACCESS}/${$scope.signature.short_date}/${$scope.signature.AWS_REGION}/s3/aws4_request`,
                        // 'Algorithm' : 'AWS4-HMAC-SHA256',
                        // 'Date' : `${$scope.signature.iso_date}`,
                        // "Content-Type": file.type !== '' ? file.type : 'application/octet-stream',
                        // filename: 'VideoOriginal/' + $scope.signature.uid + '-' + file.name,
                        // file: file
                    }
                }).then(function (response) {
                    get_response = true;
                    $scope.progressPercentages = 100;
                    amazon_response.error = false;
                    amazon_response.formName = model.formName;
                    amazon_response.aws_url = path_dir + $scope.signature.uid + '-' + $scope.file.name;
                    model.updateparent(amazon_response);
                }, function (error) {
                    get_response = true;
                    delete $scope.amazon_file;
                    model.error = "Sorry!. File not uploaded. Pls try again later";
                    $scope.progressPercentages = 0;
                    amazon_response.error = true;
                    model.updateparent(amazon_response);
                }, function (evt) {
                    if (parseInt(100.0 * evt.loaded / evt.total) === 100) {
                        if (get_response === false) {
                            $scope.progressPercentages = 99;
                        } else {
                            $scope.progressPercentages = 100;
                        }
                    } else {
                        $scope.progressPercentages = parseInt(100.0 * evt.loaded / evt.total);
                    }

                });
            }
        };

        function cloudFrontSignature() {
            // getting the cloud front signature details and stored as cookkies function
            //{"CloudFrontKeyPairId":"APKAJSZTOAA4O6SURFUQ","CloudFrontPolicy":"eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cDpcL1wvczJjaWhheTZ3cmc5Y3YuY2xvdWRmcm9udC5uZXRcL0NvdXJzZVByb21vVmlkZW9cLyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE1MjczMjg5Njd9fX1dfQ==","CloudFrontSignature":"h2zNCfW-srrA4PPpKCd~oYTB2ajQyl9TdjmawiLh-NzfZgeSWGcKTdkofN4iz7wWy3dKwnOMn0d6YyT-tjtPeaP3bwhxXd6o9eejUzJC8VJw3jgSZaRC-LsV5oEJdQHhKGNSvmSBsY2BsRqQdOCo9fGHfT8s8DYqvZerXsWWuRRYGyEXJ23VV3Ku0ZkEairsEtTxRQ9BknakvD-APZzQL~B4W6pfNIjeYzRYvb978FuLVltr5vkWIXslUhFZy7U1aae6zVDINp4nT2d32xYwao-qWWMjJI5d~~6dK99uzQpEIoMSOlvGY6-eRkXL5NtlDdSKrgn1~LSNRiQKfqu5fQ__","error":{"code":0,"message":"","fields":""}}
            if (($cookies.get("CloudFront-Key-Pair-Id") === null || $cookies.get("CloudFront-Key-Pair-Id") === undefined) || ($cookies.get("CloudFront-Policy") === null || $cookies.get("CloudFront-Policy") === undefined) || ($cookies.get("CloudFront-Signature") === null || $cookies.get("CloudFront-Signature") === undefined)) {
                var today = new Date();
                today.setDate(today.getDate() + 1);
                GetCloudFrontSignature.get(function (response) {
                    $cookies.put("CloudFront-Key-Pair-Id", response.CloudFrontKeyPairId, {
                        expires: today,
                        path: '/',
                        domain: 'tmooh.com',
                    });
                    $cookies.put("CloudFront-Signature", response.CloudFrontSignature, {
                        expires: today,
                        path: '/',
                        domain: 'tmooh.com',
                    });
                    $cookies.put("CloudFront-Policy", response.CloudFrontPolicy, {
                        expires: today,
                        path: '/',
                        domain: 'tmooh.com',
                    });
                    $timeout(function () {
                        VideoCreating();
                    }, 2000);

                });
            } else {
                VideoCreating();
            }
        }

        function VideoCreating() {
            // Video creating function  Note: After cloud signature setted in cokkies. Then only video will work
            if (model.videoUrl !== null && model.videoUrl !== undefined) {
                $scope.videoUrl = 'https://' + model.videoUrl.replace(/\.[^/.]+$/, "") ;
                // $scope.videoUrl = 'https://media.tmooh.com/OnlineCourseLesson/97/5b017a34f36fe-intro_1080';
                // $scope.videoUrl = 'https://d1b9j06rva8ip8.cloudfront.net/CoursePromoVideo/29/5affce1e7caac-intro_1080.mp4';
            }

            $scope.mediaToggle = {
                sources: [
                  {
                    src: $scope.videoUrl + '.m3u8',
                    type: 'application/x-mpegURL',
                  },
                ],
            };

            $scope.$on('initVideoJsAfter', function (e,player) {
                player.updateSrc([
                  {
                    src: $scope.videoUrl + '.m3u8',
                    type: 'application/x-mpegURL',
                    label: 'auto',
                    res: 1080
                    // type: 'video/mp4'
                  },
                  {
                    type: 'application/x-mpegURL',
                    src: $scope.videoUrl + '-720p.m3u8',
                    label: '720p',
                    res: 720
                  },
                  {
                    type: 'application/x-mpegURL',
                    src: $scope.videoUrl + "-480p.m3u8",
                    label: '480p',
                    res: 480
                  },
                  {
                    type: 'application/x-mpegURL',
                    src: $scope.videoUrl + "-360p.m3u8",
                    label: '360p',
                    res: 360
                  }
                ]);

                player.hotkeys({
                  volumeStep: 0.1,
                  seekStep: 5,
                  enableModifiersForNumbers: false,
                  alwaysCaptureHotkeys:true
                });

            });




        }

        // function to call intially
        cloudFrontSignature();
        getting_AmazonS3_Signature();
    });
})(angular.module('ace.amazonS3'));
/**
 * @ngdoc factory
 * @name AmazonS3Signature,GetCloudFrontSignature
 * @description
 * To get the details about the amazon s3 uploader.
 *
 *
 **/
(function (module) {
    module.factory('AmazonS3Signature', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/aws_signature', {}
        );
    });
    module.factory('GetCloudFrontSignature', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/cloudfront_signature', {}
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
})(angular.module("ace.amazonS3"));
