/**
 * tmooh - v0.0.1 - 2017-05-01
 *
 * Copyright (c) 2017 Agriya
 */
(function (module) {


} (angular.module('ace.codingexercise', [
    'ui.router',
    'ngResource'
])));

(function (module) {
    module.directive('codingExerciseButton', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/CodingExercise/codingExerciseButton.tpl.html',
            link: linker,
            controller: 'codingExerciseButtonController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                lessonId: '@lessonId',
                updateparent: '&',
            }
        };
    });
    module.controller('codingExerciseButtonController', function ($rootScope, $scope, AddCourseQuiz, $filter, flash, OnlineCourseLessonsQuizUpdate, addOnlineCourseLessons) {
        var model = this;
    });
    //QUIZ QUESTION AND ANSWER GETTING FROM INTRUCTOR FORM
    module.directive('codingExerciseAdd', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/CodingExercise/CodingExerciseForm.tpl.html',
            link: linker,
            controller: 'ManageCodingExerciseController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                updateparent: '&',
                publishparent: '&'
            }
        };
    });
    module.controller('ManageCodingExerciseController', function ($scope, AddCodingExercise, $filter, flash, $rootScope, ProgrammingLanguage, $uibModal, $uibModalStack, $timeout, anchorSmoothScroll, SweetAlert, CreateOnlineCourseLesson) {
        var model = this;
        $scope.action = model.action;
        $scope.lessonID = model.lessonId;
        model.checkingprogramming = checkingprogramming;
        model.codingExercise = {};
        $scope.languagefileFormat = [];
        $rootScope.show_codingExercise = false;
        model.onAddFile = onAddFile;
        model.onclickStudentTab = onclickStudentTab;
        model.onclickSolutionTab = onclickSolutionTab;
        model.onclickEvaluationTab = onclickEvaluationTab;
        model.addcodingexercise = addcodingexercise;
        model.CheckUnpublishedLessons = CheckUnpublishedLessons;
        model.onRemoveFile = onRemoveFile;
        //Programming File Array
        function init() {
            $scope.languagefileFormat = [{
                "initial_files": [{
                    'filename': 'exercise.cpp'
                }, {
                        'filename': 'exercise.h',
                    }],
                "solution_files": [{
                    'filename': 'exercise.cpp',
                }, {
                        'filename': 'exercise.h',
                    }]
            },
                {
                    "initial_files": [{
                        'filename': 'exercise.cpp'
                    }, {
                            'filename': 'exercise.h',
                        }],
                    "solution_files": [{
                        'filename': 'exercise.cpp',
                    }, {
                            'filename': 'exercise.h',
                        }],
                    "evaluation_filename": 'evaluate.js',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.cs'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.cs',
                    }],
                    "evaluation_filename": ' Evaluate.cs',
                },
                {
                    "initial_files": [{
                        'filename': 'index.html'
                    }],
                    "solution_files": [{
                        'filename': 'index.html',
                    }],
                    "evaluation_filename": 'evaluation.js',
                },
                {
                    "initial_files": [{
                        'filename': 'index.js'
                    }],
                    "solution_files": [{
                        'filename': 'index.js',
                    }],
                    "evaluation_filename": 'evaluation.js',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.java'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.java',
                    }],
                    "evaluation_filename": 'Evaluate.java',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.php'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.php',
                    }],
                    "evaluation_filename": 'Evaluate.php',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.php'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.php',
                    }],
                    "evaluation_filename": 'Evaluate.php',
                },
                {
                    "initial_files": [{
                        'filename': 'exercise.py'
                    }],
                    "solution_files": [{
                        'filename': 'exercise.py',
                    }],
                    "evaluation_filename": 'evaluate.py',
                },
                {
                    "initial_files": [{
                        'filename': 'exercise.rb'
                    }],
                    "solution_files": [{
                        'filename': 'exercise.rb',
                    }],
                    "evaluation_filename": ' evaluate.rb',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.swift'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.swift',
                    }],
                    "evaluation_filename": 'Evaluate.swift',
                },
            ];
        }

        //Getting Programming languages
        function getProgrammingLanguage() {
            ProgrammingLanguage.get().$promise
                .then(function (response) {
                    model.programminglanguage = response.data;
                })
                .catch(function (error) { })
                .finally();
        }

        //Triggering the programming language model
        $scope.modalProgramming = function () {
            model.codingExercise = {};
            model.codingExercise.course_id = model.course;
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/CodingExercise/CodingProgramminLanguage.tpl.html',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.message']) && $ocLazyLoad.getModules().indexOf('ace.message') === -1) {
                                        requiredPlugins.push(data['ace.message']);
                                    }

                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
        getProgrammingLanguage();
        //Programmin language checking 
        function checkingprogramming() {
            init(); //resetting the language files 
            if (model.codingExercise.programming_language_id !== null && model.codingExercise.programming_language_id !== undefined) {
                model.disableProgramSave = true;
                CodingAnswerfield();
                $rootScope.show_codingExercise = true;
                $timeout(function () {
                    // anchorSmoothScroll.scrollTo('codingExerciseCreate');
                    model.disableProgramSave = false;
                    $uibModalStack.dismissAll();
                }, 500);
            } else {
                $scope.modalProgramming();
            }

        }
        //Fomatting the student and solution files
        function CodingAnswerfield() {
            model.files = [];
            model.files.push($scope.languagefileFormat[model.codingExercise.programming_language_id]);
            angular.forEach(model.files, function (value) {
                value.evaluation_answer = null;
                value.initial_files_Showing = true;
                value.solution_files_Showing = false;
                value.evaluation_files_Showing = false;
                value.file_count = null;
            });
            angular.forEach(model.files[0].initial_files, function (value) {
                value.answer = null;
                value.initialShow = false;
            });
            model.files[0].initial_files[0].initialShow = true;
            angular.forEach(model.files[0].solution_files, function (value) {
                value.solutionShow = false;
                value.answer = null;
            });
        }
        //Adding the additional files of student and solution files
        function onAddFile() {
            if (model.files[0].file_count !== null && model.files[0].file_count !== undefined) {
                model.files[0].file_count = model.files[0].file_count + 1;
            } else {
                var file_length = model.files[0].initial_files.length;
                model.files[0].file_count = file_length + 1;
            }

            model.files[0].initial_files.push({
                'filename': 'file' + model.files[0].file_count + '.txt',
                'answer': null,
                'initialShow': false,
                'is_delete': true
            });
            model.files[0].solution_files.push({
                'filename': 'file' + model.files[0].file_count + '.txt',
                'answer': null,
                'solutionShow': false,
                'is_delete': true

            });
        }
        //Removing the additional files of student and solution files
        function onRemoveFile(index) {
            SweetAlert.swal({
                title: "Are you sure want to delete " + model.files[0].initial_files[index].filename + "?",
                showCancelButton: true,
                confirmButtonColor: "#79d047",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                animation: false,
            }, function (isConfirm) {
                if (isConfirm) {
                    if (model.files[0].initial_files_Showing) {
                        if (model.files[0].initial_files[index].initialShow === true) {
                            model.files[0].initial_files[index - 1].initialShow = true;
                        }
                    }
                    if (model.files[0].solution_files_Showing) {
                        angular.forEach(model.files[0].initial_files, function (value) {
                            value.initialShow = false;
                        });
                        model.files[0].solution_files_Showing = false;
                        model.files[0].initial_files[index - 1].initialShow = true;
                        model.files[0].initial_files_Showing = true;
                    }

                    model.files[0].initial_files.splice(index, 1);
                    model.files[0].solution_files.splice(index, 1);
                }
            });

        }

        function onclickStudentTab(index, typeofupdate) {
            if (typeofupdate === 'change_tab') {
                model.files[0].solution_files_Showing = false;
                model.files[0].initial_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].initial_files, function (value) {
                    value.initialShow = false;
                });
                model.files[0].initial_files[index].initialShow = true;
            }
            if (typeofupdate === 'rename') {
                model.files[0].solution_files[index].filename = model.files[0].initial_files[index].filename;
            }

        }

        function onclickSolutionTab(index, typeofupdate) {
            if (typeofupdate === 'change_tab') {
                model.files[0].initial_files_Showing = false;
                model.files[0].solution_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].solution_files, function (value) {
                    value.solutionShow = false;
                });
                model.files[0].solution_files[index].solutionShow = true;
            }
            if (typeofupdate === 'rename') {
                model.files[0].initial_files[index].filename = model.files[0].solution_files[index].filename;
            }
        }

        function onclickEvaluationTab() {
            model.files[0].initial_files_Showing = false;
            model.files[0].solution_files_Showing = false;
            model.files[0].evaluation_files_Showing = true;
        }

        function CheckUnpublishedLessons($valid) {
            if ($valid) {
                var unpublished_lessons = model.publishparent();
                if (unpublished_lessons.length > 0) {
                    $scope.published_button = true;
                    addLessonDetail(unpublished_lessons);
                }
                if (unpublished_lessons.length === 0) {
                    addcodingexercise($valid);
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
                        addcodingexercise(true);
                    }
                }
            });
        }

        function addcodingexercise($valid) {
            if ($valid) {
                if (model.files[0].evaluation_answer !== null && model.files[0].evaluation_answer !== undefined && model.files[0].evaluation_answer !== '') {
                    model.formValid = true;
                } else {
                    model.formValid = false;
                    $scope.modalCodingError();
                    return false;
                }
                if (model.formValid) {
                    model.CodingSaveButton = true;
                    model.codingExercise.is_lesson_ready = 1;
                    model.codingExercise.evaluation_file = model.files[0].evaluation_answer;
                    model.codingExercise.files = [];
                    angular.forEach(model.files[0].initial_files, function (value) {
                        angular.forEach(model.files[0].solution_files, function (solutionvalue) {
                            if (value.filename === solutionvalue.filename) {
                                var filename = value.filename;
                                var obj = {};
                                obj[filename] = {
                                    "student_file": value.answer,
                                    "solution_file": solutionvalue.answer,
                                };
                                model.codingExercise.files.push(obj);
                            }
                        });
                    });
                    AddCodingExercise.create(model.codingExercise, function (response) {
                        if (response.error.code === 0) {
                            flashMessage = $filter("translate")("Coding Exercise lesson  has been added successfully.");
                            flash.set(flashMessage, 'success', false);
                            model.updateparent();
                            UpdateCourseStatus();
                            $rootScope.show_codingExercise = false;
                            model.codingExercise = {};
                        } else {
                            flash.set("Oops, an unexpected error has occurred while adding coding exercise. Please try again later.", 'error', false);
                        }
                        model.CodingSaveButton = false;
                    }, function (error) {
                        model.CodingSaveButton = false;
                        flashMessage = $filter("translate")("Oops, an unexpected error has occurred while adding coding exercise. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                    });
                }
            }

        }

        //Error model 
        $scope.modalCodingError = function () {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/CodingExercise/CodingExerciseErrormodel.tpl.html',
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };

        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();
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
    //QUIZ QUESTION AND ANSWER GETTING FROM INTRUCTOR FORM
    module.directive('codingExerciseEdit', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'AE',
            templateUrl: 'src/plugins/CodingExercise/CodingExerciseFormEdit.tpl.html',
            link: linker,
            controller: 'ManageCodingExerciseEditController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                action: '@action',
                lessonId: '@lessonId',
                updateparent: '&'
            }
        };
    });
    /***Coding exercise edit option */
    module.controller('ManageCodingExerciseEditController', function ($scope, AddCodingExercise, $filter, flash, $rootScope, GetCodingExercise, ProgrammingLanguage, $uibModal, $uibModalStack, $location, OnlineCourseLesson, $state, SweetAlert) {
        var model = this;
        $scope.action = model.action;
        model.edit_codingExercise = false;
        model.checkingprogramming = checkingprogramming;
        model.codingExercise = {};
        model.course_id = $state.params.id;
        model.onAddFile = onAddFile;
        model.onclickStudentTab = onclickStudentTab;
        model.onclickSolutionTab = onclickSolutionTab;
        model.onclickEvaluationTab = onclickEvaluationTab;
        model.editcodingexercise = editcodingexercise;
        model.onRemoveFile = onRemoveFile;
        model.getLessonDetails = getLessonDetails;
        //Getting the particular lessonID
        function getLessonDetails() {
            model.files = [];
            if (model.lessonId !== null && model.lessonId !== undefined) {
                OnlineCourseLesson.get({
                    id: model.lessonId
                }, function (response) {
                    if (response.data.length > 0) {
                        model.coding_lessondetails = response.data[0];
                        model.codingExercise.programming_language_id = response.data[0].programming_language_id;
                        model.codingExercise.title = response.data[0].title;
                        model.codingExercise.description = response.data[0].lesson_description;
                        model.files.push({
                            "initial_files": [],
                            "solution_files": [],
                            "evaluation_filename": 'evaluation.js',
                        });
                        //Getting the particular coding exercise
                        GetCodingExercise.get({
                            codingExerciseId: model.lessonId
                        }, function (coding_response) {
                            if (coding_response.data.length > 0) {
                                angular.forEach(coding_response.data, function (files) {
                                    model.files[0].initial_files.push({
                                        'id': files.id,
                                        'filename': files.filename,
                                        'answer': files.student_file,
                                        'initialShow': false
                                    });
                                    model.files[0].solution_files.push({
                                        'filename': files.filename,
                                        'answer': files.solution_file,
                                        'solutionShow': false
                                    });
                                });
                                angular.forEach(model.files, function (value) {
                                    value.evaluation_answer = model.coding_lessondetails.evaluation_file;
                                    value.initial_files_Showing = true;
                                    value.solution_files_Showing = false;
                                    value.evaluation_files_Showing = false;
                                    value.file_count = null;
                                });
                                angular.forEach(model.files[0].initial_files, function (value) {
                                    value.initialShow = false;
                                });
                                model.files[0].initial_files[0].initialShow = true;
                                model.edit_codingExercise = true;
                            } else {
                                getProgrammingLanguage();
                            }
                        });
                    }
                });
            }
        }
        if (model.action === 'edit') {
            getLessonDetails();
        }
        //Programming File Array
        function init() {
            $scope.languagefileFormat = [{
                "initial_files": [{
                    'filename': 'exercise.cpp'
                }, {
                        'filename': 'exercise.h',
                    }],
                "solution_files": [{
                    'filename': 'exercise.cpp',
                }, {
                        'filename': 'exercise.h',
                    }]
            },
                {
                    "initial_files": [{
                        'filename': 'exercise.cpp'
                    }, {
                            'filename': 'exercise.h',
                        }],
                    "solution_files": [{
                        'filename': 'exercise.cpp',
                    }, {
                            'filename': 'exercise.h',
                        }],
                    "evaluation_filename": 'evaluate.js',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.cs'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.cs',
                    }],
                    "evaluation_filename": ' Evaluate.cs',
                },
                {
                    "initial_files": [{
                        'filename': 'index.html'
                    }],
                    "solution_files": [{
                        'filename': 'index.html',
                    }],
                    "evaluation_filename": 'evaluation.js',
                },
                {
                    "initial_files": [{
                        'filename': 'index.js'
                    }],
                    "solution_files": [{
                        'filename': 'index.js',
                    }],
                    "evaluation_filename": 'evaluation.js',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.java'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.java',
                    }],
                    "evaluation_filename": 'Evaluate.java',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.php'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.php',
                    }],
                    "evaluation_filename": 'Evaluate.php',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.php'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.php',
                    }],
                    "evaluation_filename": 'Evaluate.php',
                },
                {
                    "initial_files": [{
                        'filename': 'exercise.py'
                    }],
                    "solution_files": [{
                        'filename': 'exercise.py',
                    }],
                    "evaluation_filename": 'evaluate.py',
                },
                {
                    "initial_files": [{
                        'filename': 'exercise.rb'
                    }],
                    "solution_files": [{
                        'filename': 'exercise.rb',
                    }],
                    "evaluation_filename": ' evaluate.rb',
                },
                {
                    "initial_files": [{
                        'filename': 'Exercise.swift'
                    }],
                    "solution_files": [{
                        'filename': 'Exercise.swift',
                    }],
                    "evaluation_filename": 'Evaluate.swift',
                },
            ];
        }

        //Getting Model Programmin laanguage
        function getProgrammingLanguage() {
            ProgrammingLanguage.get().$promise
                .then(function (response) {
                    model.programminglanguage = response.data;
                    $scope.modalProgramming();
                })
                .catch(function (error) {

                })
                .finally();

        }

        //Triggering the programming language model
        $scope.modalProgramming = function () {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/CodingExercise/CodingProgramminLanguage.tpl.html',
                    resolve: {
                        pageType: function () {
                            return "modal";
                        },
                        TokenServiceData: function ($ocLazyLoad, TokenService, $rootScope, $q) {
                            var promiseSettings = TokenService.promiseSettings;
                            return $q.all({
                                load: promiseSettings.then(function (data) {
                                    var requiredPlugins = [];
                                    if (angular.isDefined(data['ace.message']) && $ocLazyLoad.getModules().indexOf('ace.message') === -1) {
                                        requiredPlugins.push(data['ace.message']);
                                    }

                                    if (requiredPlugins.length > 0) {
                                        return $ocLazyLoad.load(requiredPlugins, {
                                            cache: true
                                        });
                                    } else {
                                        return '';
                                    }
                                })
                            });
                        }
                    }
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };
        // Programmin language checking 
        function checkingprogramming() {
            init(); //resetting the language files
            if (model.codingExercise.programming_language_id !== null && model.codingExercise.programming_language_id !== undefined) {
                $uibModalStack.dismissAll();
                CodingAnswerfield();
                model.edit_codingExercise = true;
            } else {
                $scope.modalProgramming();
            }

        }

        function CodingAnswerfield() {
            model.files = [];
            model.files.push($scope.languagefileFormat[model.codingExercise.programming_language_id]);
            angular.forEach(model.files, function (value) {
                value.evaluation_answer = null;
                value.initial_files_Showing = true;
                value.solution_files_Showing = false;
                value.evaluation_files_Showing = false;
                value.file_count = null;
            });
            angular.forEach(model.files[0].initial_files, function (value) {
                value.initialShow = false;
            });
            model.files[0].initial_files[0].initialShow = true;
            angular.forEach(model.files[0].solution_files, function (value) {
                value.solutionShow = false;
            });
        }

        function onAddFile() {
            if (model.files[0].file_count !== null && model.files[0].file_count !== undefined) {
                model.files[0].file_count = model.files[0].file_count + 1;
            } else {
                var file_length = model.files[0].initial_files.length;
                model.files[0].file_count = file_length + 1;
            }
            model.files[0].initial_files.push({
                'filename': 'file' + model.files[0].file_count + '.txt',
                'answer': null,
                'initialShow': false,
                'is_delete': true

            });
            model.files[0].solution_files.push({
                'filename': 'file' + model.files[0].file_count + '.txt',
                'answer': null,
                'solutionShow': false,
                'is_delete': true

            });
        }
        //Removing the additional files of student and solution files
        function onRemoveFile(index) {
            SweetAlert.swal({
                title: "Are you sure want to delete " + model.files[0].initial_files[index].filename + "?",
                showCancelButton: true,
                confirmButtonColor: "#79d047",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                animation: false,
            }, function (isConfirm) {
                if (isConfirm) {
                    if (model.files[0].initial_files_Showing) {
                        if (model.files[0].initial_files[index].initialShow === true) {
                            model.files[0].initial_files[index - 1].initialShow = true;
                        }
                    }
                    if (model.files[0].solution_files_Showing) {
                        angular.forEach(model.files[0].initial_files, function (value) {
                            value.initialShow = false;
                        });
                        model.files[0].solution_files_Showing = false;
                        model.files[0].initial_files[index - 1].initialShow = true;
                        model.files[0].initial_files_Showing = true;
                    }

                    model.files[0].initial_files.splice(index, 1);
                    model.files[0].solution_files.splice(index, 1);
                }
            });
        }

        function onclickStudentTab(index, typeofupdate) {
            if (typeofupdate === 'change_tab') {
                model.files[0].solution_files_Showing = false;
                model.files[0].initial_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].initial_files, function (value) {
                    value.initialShow = false;
                });
                model.files[0].initial_files[index].initialShow = true;
            }
            if (typeofupdate === 'rename') {
                model.files[0].solution_files[index].filename = model.files[0].initial_files[index].filename;
            }

        }

        function onclickSolutionTab(index, typeofupdate) {
            if (typeofupdate === 'change_tab') {
                model.files[0].initial_files_Showing = false;
                model.files[0].solution_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].solution_files, function (value) {
                    value.solutionShow = false;
                });
                model.files[0].solution_files[index].solutionShow = true;
            }
            if (typeofupdate === 'rename') {
                model.files[0].initial_files[index].filename = model.files[0].solution_files[index].filename;
            }
        }

        function onclickEvaluationTab() {
            model.files[0].initial_files_Showing = false;
            model.files[0].solution_files_Showing = false;
            model.files[0].evaluation_files_Showing = true;
        }

        function editcodingexercise($valid) {
            if ($valid) {
                if (model.files[0].evaluation_answer !== null && model.files[0].evaluation_answer !== undefined && model.files[0].evaluation_answer !== '') {
                    //Checking evalvation answer 
                    model.formValid = true;
                } else {
                    model.formValid = false;
                    $scope.modalCodingError();
                    return false;
                }
                if (model.formValid) {
                    model.CodingUpdateButton = true;
                    model.codingExercise.evaluation_file = model.files[0].evaluation_answer;
                    model.codingExercise.files = [];
                    angular.forEach(model.files[0].initial_files, function (value) {
                        angular.forEach(model.files[0].solution_files, function (solutionvalue) {
                            if (value.filename == solutionvalue.filename) {
                                var filename = value.filename;
                                var obj = {};
                                if (!angular.isDefined(value.id)) {
                                    obj[filename] = {
                                        "student_file": value.answer,
                                        "solution_file": solutionvalue.answer,
                                    };
                                } else {

                                    obj[filename] = {
                                        "id": value.id,
                                        "student_file": value.answer,
                                        "solution_file": solutionvalue.answer,
                                    };
                                }
                                model.codingExercise.files.push(obj);
                            }
                        });
                    });
                    GetCodingExercise.update({
                        codingExerciseId: model.lessonId
                    }, model.codingExercise, function (response) {
                        if (response.error.code === 0) {
                            flashMessage = $filter("translate")("Coding Exercise lesson has been updated successfully.");
                            flash.set(flashMessage, 'success', false);
                            model.updateparent();
                            UpdateCourseStatus(); /* Calling course status update func*/
                            model.edit_codingExercise = false;
                            model.codingExercise = {};
                        } else {
                            flash.set("Oops, an unexpected error has occurred while updating coding exercise. Please try again later.", 'error', false);
                        }
                        model.CodingUpdateButton = false;
                    }, function (error) {
                        flashMessage = $filter("translate")("Oops, an unexpected error has occurred while updating coding exercise. Please try again later.");
                        flash.set(flashMessage, 'error', false);
                        model.CodingUpdateButton = false;
                    });
                }
            }

        }

        //Error model 
        $scope.modalCodingError = function () {
            if (angular.isUndefined($rootScope.modal) || !$rootScope.modal) {
                $scope.modalInstance = $uibModal.open({
                    scope: $scope,
                    size: 'sm',
                    backdrop: 'static',
                    templateUrl: 'src/plugins/CodingExercise/CodingExerciseErrormodel.tpl.html',
                }).result.then(function (result) {
                    $rootScope.modal = false;
                }, function (result) {
                    $rootScope.modal = false;
                }).finally(function () {
                    $rootScope.modal = false;
                });
                $rootScope.modal = true;
            }
        };

        $scope.modalClose = function (e) {
            e.preventDefault();
            $uibModalStack.dismissAll();
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
    //LEARNING CODING EXERCISE FROM LEANER PAGE COURSE 
    module.directive('codingExerciseLearner', function () {
        var linker = function (scope, element, attrs) {
            // do DOM Manipulation here

        };
        return {
            restrict: 'E',
            templateUrl: 'src/plugins/CodingExercise/CodingExerciseLearner.tpl.html',
            link: linker,
            controller: 'CodingExerciseLearnerController as model',
            bindToController: true,
            transclude: true,
            scope: {
                course: '@course',
                lessonId: '@lessonId',
            }
        };
    });
    module.controller('CodingExerciseLearnerController', function (Course, $scope, AddCodingExercise, $filter, flash, $rootScope, GetCodingExercise, ProgrammingLanguage, $uibModal, $uibModalStack, $state, $location, OnlineCourseLesson, LearnerCodingCheck) {
        var model = this;
        $scope.loader = true;
        $scope.lessonID = model.lessonId;
        model.codingExercise = {};
        model.onclickStudentTab = onclickStudentTab;
        model.addcodingexercise = addcodingexercise;
        //Getting the particular lessonID
        model.files = [];

        if ($scope.lessonID !== null && $scope.lessonID !== undefined) {
            OnlineCourseLesson.get({
                id: $scope.lessonID
            }, function (response) {
                if (response.data.length > 0) {
                    model.coding_lessondetails = response.data[0];
                    model.codingExercise.programming_language_id = response.data[0].programming_language_id;
                    model.codingExercise.title = response.data[0].title;
                    model.codingExercise.description = response.data[0].lesson_description;
                    model.files.push({
                        "initial_files": [],
                        "solution_files": [],
                        "evaluation_filename": 'evaluation.js',
                    });
                    //Getting the particular coding exercise
                    GetCodingExercise.get({
                        codingExerciseId: $scope.lessonID
                    }, function (coding_response) {
                        if (coding_response.data.length > 0) {
                            angular.forEach(coding_response.data, function (files) {
                                model.files[0].initial_files.push({
                                    'id': files.id,
                                    'filename': files.filename,
                                    'answer': files.student_file,
                                    'initialShow': false
                                });
                                model.files[0].solution_files.push({
                                    'filename': files.filename,
                                    'answer': files.solution_file,
                                    'solutionShow': false
                                });
                            });
                            angular.forEach(model.files, function (value) {
                                value.evaluation_answer = model.coding_lessondetails.evaluation_file;
                                value.initial_files_Showing = true;
                                value.solution_files_Showing = false;
                                value.evaluation_files_Showing = false;
                            });
                            angular.forEach(model.files[0].initial_files, function (value) {
                                value.initialShow = false;
                            });
                            model.files[0].initial_files[0].initialShow = true;
                        }
                    });
                }
                $scope.loader = false;
            });
        }

        function onclickStudentTab(index, typeofupdate) {
            if (typeofupdate === 'change_tab' && $scope.showsolution) {
                model.files[0].solution_files_Showing = true;
                model.files[0].initial_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].initial_files, function (value) {
                    value.initialShow = false;
                });
                angular.forEach(model.files[0].solution_files, function (value) {
                    value.solutionShow = false;
                });
                model.files[0].initial_files[index].initialShow = true;
                model.files[0].solution_files[index].solutionShow = true;
            } else if (typeofupdate === 'change_tab' && !$scope.showsolution) {
                model.files[0].solution_files_Showing = false;
                model.files[0].initial_files_Showing = true;
                model.files[0].evaluation_files_Showing = false;
                angular.forEach(model.files[0].initial_files, function (value) {
                    value.initialShow = false;
                });
                model.files[0].initial_files[index].initialShow = true;
            }
        }

        function addcodingexercise() {
            model.check_disableButton = true;
            model.learnerCodingExercise = {};
            model.learnerCodingExercise.check = true;
            model.learnerCodingExercise.online_course_lesson_id = $scope.lessonID;
            model.learnerCodingExercise.files = [];
            angular.forEach(model.files[0].initial_files, function (value) {
                var filename = value.filename;
                var obj = {};
                obj[filename] = value.answer;
                model.learnerCodingExercise.files.push(obj);
            });
            LearnerCodingCheck.create(model.learnerCodingExercise, function (response) {
                if (response.error.code === 0) {
                    if (response.error.message === 'Failed') {
                        model.learnerCodingExercise.Checked_answer = 'Failed';
                    } else if (response.error.message === 'Passed') {
                        model.learnerCodingExercise.Checked_answer = 'Passed';
                    }
                } else {
                    model.learnerCodingExercise.Checked_answer = 'CodeError';
                    model.learnerCodingExercise.Checked_error = response.error.message;
                }
                model.learnerCodingExercise.isCheckedShow = true;
                model.check_disableButton = false;
            }, function (error) {
                model.learnerCodingExercise.isCheckedShow = true;
                model.learnerCodingExercise.Checked_answer = 'ServerError';
                model.check_disableButton = false;
            });

        }
    });
})(angular.module('ace.codingexercise'));

(function (module) {
    module.factory('AddCodingExercise', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/coding_exercises', {
                id: '@id'
            }, {
                create: {
                    method: 'POST'
                }
            }
        );
    });
    module.factory('GetCodingExercise', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/coding_exercises/:codingExerciseId', {
                codingExerciseId: '@codingExerciseId'
            }, {
                'update': {
                    method: 'PUT'
                }
            }
        );
    });

    module.factory('ProgrammingLanguage', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/programming_languages', {
                id: '@id'
            }
        );
    });
    module.factory('OnlineCourseLesson', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/online_course_lessons/:id', {
                id: '@id'
            }
        );
    });
    module.factory('LearnerCodingCheck', function ($resource, GENERAL_CONFIG) {
        return $resource(
            GENERAL_CONFIG.api_url + 'api/v1/course_user_coding_exercises', {
                id: '@id'
            }, {
                'create': {
                    method: 'POST'
                }
            }
        );
    });

})(angular.module('ace.codingexercise'));