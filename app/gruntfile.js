var taskName = '';
module.exports = function(grunt) {

  var _ = require('lodash');

  // Load required Grunt tasks. These are installed based on the versions listed
  // * in 'package.json' when you do 'npm install' in this directory.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-angular-translate');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-phplint');
  grunt.registerTask('pre-commit', ['jsbeautifier', 'exec', 'phplint']);
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-multi');
  grunt.loadNpmTasks('grunt-ng-html2js');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-cache-breaker');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-aws');

  /** ********************************************************************************* */
  /** **************************** File Config **************************************** */
  var fileConfig = {
    build_dir: '../build',
    compile_dir: '../compile',

    /**
     * This is a collection of file patterns for our app code (the
     * stuff in 'src/'). These paths are used in the configuration of
     * build tasks. 'js' is all project javascript, except tests.
     * 'commonTemplates' contains our reusable components' ('src/common')
     * template HTML files, while 'appTemplates' contains the templates for
     * our app's code. 'html' is just our main HTML file. 'less' is our main
     * stylesheet, and 'unit' contains our app's unit tests.
     */
    app_files: {
      js: ['./src/**/*.module.js', 'src/**/*.js', '!src/assets/**/*.js', '!src/themes/**/assets/js/libs/*.js', '!src/plugins/Analytics/*.js', '!src/plugins/Translations/**/*.js', '!src/plugins/Comments/**/*.js', '!src/themes/**/assets/js/*.js', '!src/ag-admin/js/ng-admin.app.js', '!src/plugins/Comments/*.js', 'templates-common.js', 'templates-app.js'],
      appTemplates: ['src/themes/tmooh/views/**/*.tpl.html'],
      commonTemplates: ['src/common/**/*.tpl.html'],
      pluginTemplates: ['src/plugins/**/*.tpl.html'],

      html: ['index.html'],
      less: ['src/themes/tmooh/assets/css/main.less'],
      scss: 'src/themes/tmooh/assets/scss/mystyle.scss',
    },
    admin_files: {
      js: [
        'lib/jquery/dist/jquery.timeago.js',
        'lib/jquery/dist/jquery.cookie.js',
        // 'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'lib/bootstrap/dist/js/bootstrap.js',
        'lib/angular-bootstrap/ui-bootstrap-tpls.js',
        // 'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
        'lib/angular-cookies.min.js',
        'vendor/angular-http-auth/src/http-auth-interceptor.js',
        'vendor/angular-resource/angular-resource.min.js',
        'vendor/bootstrap/js/dropdown.js',//no
        'vendor/angular-deferred-bootstrap/angular-deferred-bootstrap.min.js',//no
        'vendor/highcharts/highcharts.js',//no
        'vendor/angular-md5/angular-md5.min.js',
        'ag-admin/js/*.js',
        'ag-admin/js/controllers/*.js',
        'ag-admin/js/services/*.js'
      ],
      less: ['ag-admin/css/bootstrap.less']
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
      js: []
    },

    /**
     * This is the same as 'app_files', except it contains patterns that
     * reference vendor code ('vendor/') that we need to place into the build
     * process somewhere. While the 'app_files' property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in 'vendor_files.js'.
     *
     * The 'vendor_files.js' property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The 'vendor_files.css' property holds any CSS files to be automatically
     * included in our app.
     *
     * The 'vendor_files.assets' property holds any assets to be copied along
     * with our app's assets. This structure is flattened, so it is not
     * recommended that you use wildcards.
     */
    vendor_files: {
      js: [
        'vendor/jquery/dist/jquery.min.js',
        // 'lib/jquery/dist/jquery.js',
        'lib/jquery/dist/jquery.timeago.js',
        'lib/jquery/dist/jquery.cookie.js',
        'vendor/jquery-ui/jquery-ui.min.js',
        'vendor/ace-builds/src-min-noconflict/ace.js', // new
        // 'src/themes/tmooh/assets/js/mmenu.js',
        // 'vendor/angular/angular.js',
        'vendor/angular/angular.min.js',
        'vendor/angular-sanitize/angular-sanitize.min.js',
        'vendor/angular-resource/angular-resource.min.js',
        'node_modules/ui-bootstrap4/dist/ui-bootstrap-tpls.js',
        'vendor/angular-animate/angular-animate.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.min.js',
        'vendor/angular-translate/angular-translate.min.js',
        'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
        'vendor/angular-dynamic-locale/tmhDynamicLocale.min.js',
        'vendor/angular-cookies/angular-cookies.min.js',
        'vendor/angular-md5/angular-md5.min.js',
        'vendor/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
        'vendor/angular-translate-handler-log/angular-translate-handler-log.min.js',
        'vendor/angular-translate-storage-local/angular-translate-storage-local.min.js',
        'lib/angular-slugify.js',
        'vendor/angular-http-auth/src/http-auth-interceptor.js',
        'vendor/angular-growl-v2/build/angular-growl.min.js',
        'vendor/angular-messages/angular-messages.min.js',
        'vendor/angular-nl2br/angular-nl2br.min.js',
        'lib/satellizer/satellizer.js',
        'vendor/bootstrap/assets/js/vendor/popper.min.js',
        'vendor/bootstrap/dist/js/bootstrap.min.js',
        'lib/bootstrap-material-design.js',
        // 'vendor/bootstrap/js/collapse.js',
        // 'vendor/bootstrap/js/dropdown.js',
        // 'vendor/bootstrap/js/tab.js',
        // 'vendor/bootstrap/js/alert.js',
        // 'vendor/bootstrap/js/scrollspy.js',
        // 'vendor/bootstrap/js/affix.js',
        'vendor/textAngular/dist/textAngular-rangy.min.js',
        'vendor/textAngular/dist/textAngular-sanitize.min.js',
        'vendor/textAngular/dist/textAngular.min.js',
        'vendor/angular-ui-sortable/sortable.min.js',
        'vendor/oclazyload/dist/ocLazyLoad.min.js',
        'lib/angular-socialshare/dist/angular-socialshare.min.js',
        'vendor/angulartics/dist/angulartics.min.js',
        'lib/angulartics-klaviyo.js',
        'lib/angulartics-ga.js',
        // 'lib/analytics.js',
        // 'vendor/angulartics-facebook-pixel/dist/angulartics-facebook-pixel.min.js',
        'vendor/me-lazyload/me-lazyload.js',
        'vendor/ng-file-upload/ng-file-upload.min.js',
        'vendor/ng-file-upload/ng-file-upload-shim.min.js',
        'vendor/angular-img-cropper/dist/angular-img-cropper.min.js',
        'vendor/ng-tags-input/ng-tags-input.min.js',
        'vendor/moment/min/moment-with-locales.min.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-ui-ace/ui-ace.min.js',
        'vendor/ace-builds/src-min-noconflict/ext-language_tools.js',
        'lib/enscroll-0.6.1.min.js',
        'vendor/angular-payment/dist/angular-payment-tpls-0.3.0.min.js',
        'vendor/highcharts/highcharts.js',
        'node_modules/video.js/dist/video.min.js',
        'node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.min.js',
        'node_modules/videojs-youtube/dist/Youtube.min.js',
        'node_modules/videojs-hotkeys/videojs.hotkeys.min.js',
        // 'lib/videojs.browserQA.js',
        'lib/videojs.persistvolume.js',
        'vendor/angular-ismobile/dist/angular-ismobile.min.js',
        // 'vendor/vjs-video/dist/vjs-video.min.js',
        'vendor/sweetalert/dist/sweetalert.min.js',
        'vendor/ngSweetAlert/SweetAlert.min.js',
        'vendor/angular-clipboard/angular-clipboard.js',
        'vendor/angular-ui-switch/angular-ui-switch.min.js',
        'vendor/angular-timer/dist/angular-timer.min.js',
        'vendor/angular-fullscreen/src/angular-fullscreen.js',
        'vendor/jcrop/js/jquery.Jcrop.min.js',
        'vendor/ng-jcrop/ng-jcrop.js',
        'vendor/owl.carousel/dist/owl.carousel.min.js',
        // 'vendor/ng-repeat-owl-carousel/dist/ngRepeatOwlCarousel.min.js',
        'lib/redactor/redactor/redactor.min.js',
        'lib/redactor/redactor/angular-redactor-2.js',
        // 'node_modules/video.js/dist/video.js',
        'lib/videojs-resolution-switcher.js',
        // 'node_modules/video.js/dist/video.min.js',
        'vendor/dropzone/dist/dropzone.js',
        'vendor/ng-dropzone/dist/ng-dropzone.min.js',

        //new updates

      ],
      css: [],
      assets: [],
    },
    theme_files: {
      custom_js: [
        'src/themes/tmooh/assets/js/*.js'
      ],
      lib_js: [
        'src/themes/tmooh/assets/js/libs/*.js'
      ]
    },
    admin_vendor_files: {
      js: [
        'vendor/jquery/dist/jquery.min.js',
        'vendor/ng-admin/build/ng-admin.min.js'
        // 'lib/jquery/dist/jquery.timeago.js',
        // 'lib/jquery/dist/jquery.cookie.js',
        // 'lib/ng-admin/build/ng-admin.min.js',
        // 'vendor/angular-http-auth/src/http-auth-interceptor.js',
        // 'vendor/bootstrap/js/dropdown.js'
      ],
      css: [],
      assets: []
    }
  };

  /** ********************************************************************************* */
  /** **************************** Task Config **************************************** */
  var taskConfig = {
    pkg: grunt.file.readJSON("package.json"),
    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the 'less than percent equals'
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner: '/**\n' +
        ' * tmooh - v1.0b1 - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n'
    },

    /**
     * Uploading public/* files to s3 to serve it as web static via cloudfront
     */
    aws: grunt.file.readJSON("credentials.json"),
    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        bucket: "tmooh-web",
        region: "eu-central-1",
        gzip: true,
      },
      build: {
        cwd: "../public/",
        src: "**"
      }
    },

    /**
     * The directories to delete when 'grunt clean' is executed.
     */
    clean: {
      options: {
        force: true,
      },
      build: [
        '<%= build_dir %>',
      ],
      compile: [

        '<%= compile_dir %>'
      ],
      removepublic: [
        '../public'
      ],
      vendor: [
        '<%= build_dir %>/vendor/'
      ],
      index: ['<%= build_dir %>/index.html'],
      plugin: ['<%= build_dir %>/src/plugins']
    },

    /**
     * The 'copy' task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * 'build_dir', and then to copy the assets to 'compile_dir'.
     */
    copy: {

      //build
      build_assets: {
        files: [{
          src: ['**'],
          dest: '<%= build_dir %>/assets/',
          cwd: 'src/themes/tmooh/assets',
          expand: true
        }]
      },
      build_ng_admin: {
        files: [{
          src: ['**'],
          dest: '<%= build_dir %>/ag-admin/',
          cwd: 'ag-admin',
          expand: true
        }, ]
      },
      build_plugins: {
        files: [{
          src: ['**'],
          dest: '<%= build_dir %>/src/plugins/',
          cwd: 'src/plugins',
          expand: true
        }, ]
      },
      build_plugins_for_frontend: {
        files: [{
          src: ['ArticleLessons/**', 'Coupons/**', 'CourseCheckout/**', 'CourseWishlist/**', 'Instructor/**', 'RatingAndReview/**', 'SEO/**', 'SocialLogins/**', 'SocialShare/**', 'Translations/**', 'UserProfile/**', 'VideoLessons/**', 'VideoDropzone/**', 'Withdrawal/**'], // Add required plugins
          dest: '<%= build_dir %>/src/plugins/',
          cwd: 'src/plugins',
          expand: true
        }, ]
      },
      build_vendor_assets: {
        files: [{
          src: ['<%= vendor_files.assets %>'],
          dest: '<%= build_dir %>/assets/',
          cwd: '.',
          expand: true,
          flatten: true
        }]
      },
      build_appjs: {
        files: [{
          src: ['<%= app_files.js %>'],
          dest: '<%= build_dir %>/',
          cwd: '.',
          expand: true
        }]
      },
      build_vendorjs: {
        files: [{
          src: ['<%= vendor_files.js %>', '<%= theme_files.custom_js %>', '<%= theme_files.lib_js %>', '<%= admin_vendor_files.js %>', '<%= admin_files.js %>'],
          dest: '<%= build_dir %>/',
          cwd: '.',
          expand: true
        }]
      },
      build_vendorcss: {
        files: [{
          src: ['<%= vendor_files.css %>'],
          dest: '<%= build_dir %>/',
          cwd: '.',
          expand: true
        }]
      },
      build_admin_vendorcss: {
        files: [{
          src: ['<%= admin_vendor_files.css %>'],
          dest: '<%= build_dir %>/',
          cwd: '.',
          expand: true
        }]
      },

      //Compile
      compile_assets: {
        files: [{
          src: ['*.png', '*.jpg', '*.gif', '*.ico', 'fonts/**', 'js/**', 'img/**'],
          dest: '<%= compile_dir %>/assets/',
          cwd: 'src/themes/tmooh/assets',
          expand: true
        },{
          src: ['manifest.json','robots.txt'],
          dest: '<%= compile_dir %>',
          cwd: './',
          expand: true
        }]
      },
      compile_ng_admin: {
        files: [{
            src: ['fonts/**', 'tpl/**', 'index.html'],
            dest: '<%= compile_dir %>/ag-admin',
            cwd: 'ag-admin',
            expand: true
          }
          //  ,
          // {
          // 	  src: [ '<%= admin_vendor_files.js %>',  '<%= admin_files.js %>'],
          //     dest: '<%= compile_dir %>',
          //     cwd: '.',
          //     expand: true,
          // } ,
          // {
          // 	src: [ '<%= admin_vendor_files.css %>' ],
          //   dest: '<%= compile_dir %>',
          //   cwd: '.',
          //   expand: true,
          // }
        ]
      },
      // compile_plugins_for_frontend: {
      //   files: [{
      //     src: ['ArticleLessons/**', 'Coupons/**', 'CourseCheckout/**', 'CourseWishlist/**', 'Instructor/**', 'RatingAndReview/**', 'SEO/**', 'SocialLogins/**', 'SocialShare/**', 'Translations/**', 'UserProfile/**', 'VideoLessons/**', 'VideoDropzone/**', 'Withdrawal/**'], // Add required plugins
      //     dest: '<%= compile_dir %>/src/plugins/',
      //     cwd: 'src/plugins',
      //     expand: true
      //   }, ]
      // },
      compile_plugins: {
        files: [{
          src: ['**'],
          dest: '<%= compile_dir %>/src/plugins/',
          cwd: 'src/plugins',
          expand: true
        }, ]
      }
    },
    /**
     * 'grunt concat' concatenates multiple source files into a single file.
     */
    concat: {
      // The 'compile_js' target concatenates app and vendor js code together.
      compile_js: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          'src/**/*.module.js',
          'src/**/*.js',
          '!src/plugins/Translations/angular-i18n/*.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/tmooh-v1.0b1.js'
      },
      // The 'compile_admin_js' target concatenates admin js code together.
      compile_admin_js: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= admin_vendor_files.js %>',
          '<%= admin_files.js %>'
        ],
        dest: '<%= compile_dir %>/assets/tmooh-admin-v1.0b1.js'
      }
    },
    // https://www.npmjs.com/package/grunt-multi
    multi: {
        // Also you can specify a list.
        minify_plugin_js: {
            options: {
                vars: {
                    plugin_list: ['AmazonS3andRTMP', 'Analytics', 'ArticleLessons','Assignment', 'Banner', 'CodingExercise', 'Comments', 'Coupons', 'CourseAnalytics', 'CourseBulkCheckout', 'CourseCheckout', 'CourseFlags', 'CourseWishlist', 'DownloadableFileLessons', 'Instructor', 'Credit', 'Group', 'CourseCheckout', 'ZazPayPayout', 'RatingAndReview', 'SEO', 'SocialLogins', 'SocialShare', 'Subscriptions', 'Translations', 'InstructorProfile', 'Message', 'MultiCurrency', 'VideoExternalEmbedLessons', 'VideoLessons', 'CourseCheckoutRevenueWithdrawal', 'MultipleInstructor', 'News', 'OfflineCourse', 'PaypalREST','PracticeTest', 'Quizz', 'RevenueReports', 'Support', 'WebinarCourses', 'OAuthClient', 'QA', 'BulkUploader', 'SubAdmin']
                },
                config: {
                    PluginName: '<%= plugin_list %>'
                },
                tasks: ['uglify:plugin_compile']
            }
        },
    },

    /**
     * 'ng-annotate' annotates the sources for safe minification. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      build: {
        files: [{
          src: ['<%= app_files.js %>'],
          cwd: '<%= build_dir %>',
          dest: '<%= build_dir %>',
          expand: true
        }, ]
      },
      compile: {
        files: [{
          src: ['**/*.js'],
          // src: [ '<%= app_files.js %>'],
          cwd: '<%= compile_dir %>',
          dest: '<%= compile_dir %>',
          expand: true
        }, ]
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          // banner: '<%= meta.banner %>',
          compress: true,
          output: {
            comments : false,
          },
          mangle: true //minified JS not working when we apply resolve values in each page routing. (It resolves the issues with minification )
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>',
        }
      },
      admin_compile: {
        options: {
          banner: '<%= meta.banner %>',
          mangle: false //minified JS not working in admin side. So we added this option. (It works for front end compressed js)
        },
        files: {
          '<%= concat.compile_admin_js.dest %>': '<%= concat.compile_admin_js.dest %>'
        }
      },
      plugin_compile: {
        options: {
          mangle: true //minified JS not working when we apply resolve values in each page routing. (It resolves the issues with minification )
        },
        files: {
          '<%= compile_dir %>/src/plugins/<%= PluginName %>/<%= PluginName %>.js': '<%= compile_dir %>/src/plugins/<%= PluginName %>/<%= PluginName %>.js',
        }
      }
    },

    /**
     * `grunt-contrib-less` handles our LESS compilation and uglification automatically.
     * Only our 'main.less' file is included in compilation; all other files
     * must be imported from this file.
     */
    sass: { // Task

      build: { // Target
        options: { // Target options
          style: 'expanded',
          // tell Sass to look in the Bootstrap stylesheets directory when compiling
          loadPath: 'vendor/bootstrap/scss'
        },
        files: { // Dictionary of files
          'src/themes/tmooh/assets/tmooh-v1.0b1.css': '<%= app_files.scss %>'
        }
      },
      compile: {
        files: {
          '<%= compile_dir %>/assets/tmooh-v1.0b1.css': '<%= app_files.scss %>'
        },
        options: {
          // tell Sass to look in the Bootstrap stylesheets directory when compiling
          loadPath: 'vendor/bootstrap/scss',
          style: 'compressed',
          // sourcemap: 'none'
        }
      }
    },
    less: {
      build: {
        options: {
          sourceMap: true,
          sourceMapFilename: 'src/themes/tmooh/assets/tmooh-v1.0b1.css.map',
          sourceMapURL: 'tmooh-v1.0b1.css.map',
          sourceMapBasepath: 'app/src/themes/tmooh/assets/css/',
          sourceMapFileInline: true
        },
        files: {
          // '<%= build_dir %>/assets/tmooh-v1.0b1.css': '<%= app_files.less %>',
          'src/themes/tmooh/assets/tmooh-v1.0b1.css': '<%= app_files.less %>'
        }
      },
      admin_build: {
        options: {
          sourceMap: true,
          sourceMapFilename: 'src/themes/tmooh/assets/tmooh-admin-v1.0b1.css.map',
          sourceMapURL: 'tmooh-admin-v1.0b1.css.map',
          // sourceMapBasepath:'app/src/themes/tmooh/assets/css/',
          sourceMapFileInline: true
        },
        files: {
          'src/themes/tmooh/assets/tmooh-admin-v1.0b1.css': '<%= admin_files.less %>'
        }
      },
      compile: {
        files: {
          '<%= compile_dir %>/assets/tmooh-v1.0b1.css': '<%= app_files.less %>'
        },
        options: {
          cleancss: true,
          compress: true,
        }
      },
      admin_compile: {
        files: {
          '<%= compile_dir %>/assets/tmooh-admin-v1.0b1.css': '<%= admin_files.less %>'
        },
        options: {
          cleancss: true,
          compress: true
        }
      }
    },
    'string-replace': {
      dist: {
        files: {
          'src/themes/tmooh/assets/tmooh-v1.0b1.css.map': 'src/themes/tmooh/assets/tmooh-v1.0b1.css.map',
        },
        options: {
          replacements: [{
            // pattern: 'src/themes/tmooh/assets/',
            pattern: /src\/app\/themes\/tmooh\/assets\//ig,
            replacement: ''
          }]
        }
      }
    },

    /**
     * 'jshint' defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in 'options'. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside 'src/'.
     */
    jshint: {
      src: ['<%= app_files.js %>', '<%= theme_files.custom_js %>'],
      test: [],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        reporterOutput: "",
      }
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      // These are the templates from 'src'.
      app: {
        options: {
          base: 'src'
        },
        src: ['<%= app_files.appTemplates %>'],
        dest: 'templates-app.js'
      },

      // These are the templates from 'src/common'.
      common: {
        options: {
          base: 'src/common'
        },
        src: ['<%= app_files.commonTemplates %>'],
        dest: 'templates-common.js'
      }
    },

    /**
     * The 'index' task compiles the 'index.html' file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the '<head>' of 'index.html'. The
       * 'src' property contains the list of included files.
       */
      build: {
        appName: 'ace',
        build: true,
        dir: '.',
        src: [
          '<%= vendor_files.js %>',
          'src/**/*.module.js',
          'src/**/*.js',
          '!src/plugins/Translations/angular-i18n/*.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'src/themes/tmooh/assets/tmooh-v1.0b1.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        appName: 'ace',
        build: false,
        dir: '<%= compile_dir %>',
        src: [
          '<%= compile_dir %>/assets/tmooh-v1.0b1.js',
          '<%= compile_dir %>/assets/tmooh-v1.0b1.css'
        ]
      }
    },

    /**
     * The ng-admin 'index' task compiles the 'ng-admin/index.html' file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    admin_index: {
      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the '<head>' of 'index.html'. The
       * 'src' property contains the list of included files.
       */
      build: {
        appName: 'ace',
        dir: '.',
        src: [
          '<%= admin_vendor_files.js %>',
          '<%= admin_files.js %>',
          'src/themes/tmooh/assets/tmooh-admin-v1.0b1.css'
        ]
      },
      compile_admin: {
        appName: 'ace',
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compile_admin_js.dest %>',
          '<%= compile_dir %>/assets/tmooh-admin-v1.0b1.css'
        ]
      }
    },


    usemin: {
      html: ['index.html']
    },

    htmlmin: {
      main: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          '../compile/index.html': '../compile/index.html'
        }
      },
      templates: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'src/themes/tmooh',
          src: '**/*.tpl.html',
          dest: 'src/themes/tmooh'
        }]
      }
    },
    phplint: {
        all: ['../server/php/libs/Providers/*.php', '../server/php/libs/*.php', '../server/php/Slim/*.php', '../server/php/shell/**/*.php', '../server/php/*.php']
    },
    jsbeautifier: {
        app: {
            src: ['<%= app_files.js %>']
        },
        'pre-merge': {
            src: ['<%= app_files.js %>'],
            options: {
                mode: 'VERIFY_ONLY'
            }
        }
    },
    exec: {
        cmd: [
            'php beautifier.php ../server/php/Slim/public',
            'php beautifier.php ../server/php/plugins',
            'php beautifier.php ../server/php/constants.php',
            'php beautifier.php ../server/php/bootstrap.php',
            'php beautifier.php ../server/php/libs/core.php',
            'php beautifier.php ../server/php/libs/inflector.php',
            'php beautifier.php ../server/php/libs/Providers',
            'php beautifier.php ../server/php/Slim/shell',
        ].join('&&')
    },
    /**
     * i18nextract build json lang files
     */
    i18nextract: {
      // Getting all translate key to json files
      default_language: {
        suffix: '.json',
        src: ['index.html', 'src/*.js', 'src/**/*.*', 'src/**/**/*.*', 'src/themes/tmooh/views/*.*', 'src/themes/tmooh/views/**/*.*'],
        lang: ['en', 'ja', 'tr', 'ar'],
        defaultLang: 'en',
        // nullEmpty:true,
        dest: 'src/themes/tmooh/assets/js/l10n'
      },
      // For filling dafault english value to fr_FR and ja-JP's value
      // default_exists_i18n : {
      // 	suffix:   '.json',
      // 	nullEmpty: true,
      // 	src:      [ 'index.html', 'src/*.js', 'src/**/*.*', 'src/**/**/*.*', 'src/themes/tmooh/views/*.*', 'src/themes/tmooh/views/**/*.*' ],
      // 	lang:     ['fr', 'ja', 'ar'],
      // 	dest:     'src/themes/tmooh/assets/js/l10n/',
      // 	source:   'src/themes/tmooh/assets/js/l10n/en.json' // Use to generate different output file
      // } ,
    },
    rename: {
      main: {
        files: [{
          src: ['<%= compile_dir %>'],
          dest: '../public'
        }, ]
      }
    },
    cachebreaker: {
      build: {
        options: {
          match: [ 'tmooh-v1.0b1.css'],
        },
        files: {
          src: ['index.html']
        }
      },
      compile: {
        options: {
          match: ['assets/tmooh-v1.0b1.js', 'assets/tmooh-v1.0b1.css'],
          src: {
            path: '<%= compile_dir %>/assets/tmooh-v1.0b1.js'
          },
          // position: 'overwrite'
        },
        files: {
          src: ['<%= compile_dir %>/index.html']
        }
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       * We also want to copy vendor files and rebuild index.html in case
       * vendor_files.js was altered (list of 3rd party vendor files installed by bower)
       */
      // gruntfile: {
      //     files: 'Gruntfile.js',
      //     tasks: [  'index:build' ],
      //     // tasks: [ 'clean:vendor', 'copy:build_vendorjs', 'copy:build_vendorcss', 'copy:build_admin_vendorcss', 'index:build' ],
      //     // tasks: [ 'jshint:gruntfile', 'clean:vendor', 'copy:build_vendorjs', 'copy:build_vendorcss', 'copy:build_admin_vendorcss', 'index:build' ],
      //     options: {
      //         livereload: false
      //     }
      // },

      /**
       * When index.html changes, we need to compile it.
       */
      // html: {
      //     files: [ '<%= app_files.html %>' ],
      //     tasks: [ 'index:build' ]
      // },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= app_files.appTemplates %>',
          '<%= app_files.commonTemplates %>'
        ],
        tasks: ['html2js']
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      less: {
        files: ['src/**/*.less'],
        tasks: ['less:build', 'less:admin_build', 'index:build', 'cachebreaker:build']
      },
      sass: {
        files: ['src/**/*.scss'],
        tasks: ['sass:build', 'index:build', 'cachebreaker:build']
      }
    }
  };


  /** ********************************************************************************* */
  /** **************************** Project Configuration ****************************** */
  // The following chooses some watch tasks based on whether we're running in mock mode or not.
  //  Our watch (delta above) needs to run a different index task and copyVendorJs task
  //  in several places if "grunt watchmock" is run.
  taskName = grunt.cli.tasks[0]; // the name of the task from the command line (e.g. "grunt watch" => "watch")
  // taskConfig.delta.gruntfile.tasks = [ 'jshint:gruntfile', 'clean:vendor', 'copy:build_vendorjs', 'copy:build_vendorcss', 'copy:build_admin_vendorcss', 'index:build' ];

  // taskConfig.delta.gruntfile.tasks = [  'clean:vendor', 'copy:build_vendorjs', 'copy:build_vendorcss', 'copy:build_admin_vendorcss', 'index:build' ];
  // taskConfig.delta.jssrc.tasks = ['copy:build_appjs', 'index:build' ];
  // taskConfig.delta.html.tasks = [ 'index:build' ];

  // Take the big config objects we defined above, combine them, and feed them into grunt
  grunt.initConfig(_.assign(taskConfig, fileConfig));

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', ['delta']);
  grunt.registerTask('translate', ['i18nextract']);

  grunt.registerTask('compile', [
    'html2js',
    'clean:compile',
    'copy:compile_assets', // copy  <%= build_dir %>/assets to <%= compile_dir %>/assets
    'copy:compile_ng_admin',
    'copy:compile_plugins', // copy <%= build_dir %>/src/plugins/ to <%= compile_dir %>/src/plugins/
    'concat:compile_js', // output <%= compile_dir %>/assets/tmooh-v1.0b1.js
    'concat:compile_admin_js', //output <%= compile_dir %>/assets/tmooh-admin-v1.0b1.js
    'sass:compile', //output tmooh-v1.0b1.css
    'less:admin_compile', //output tmooh-admin-v1.0b1.css
    'ngAnnotate:compile',
    'uglify:compile', // minify tmooh-v1.0b1.js
    'uglify:admin_compile', // minify tmooh-admin-v1.0b1.js
    'multi:minify_plugin_js', // minify plugins JavaScript files
    'index:compile',
    'admin_index:compile_admin',
    'cachebreaker:compile',
    'htmlmin:main',
    'clean:removepublic',
    'rename'
  ]);

  grunt.registerTask('upload', ['s3']);
  grunt.registerTask('build', [
    'html2js',
    'sass:build',
    'index:build',
    // 'cachebreaker:build',
  ]);
  grunt.registerTask('build-admin', [
    'less:admin_build',
    'admin_index:build',
    'cachebreaker:build',
  ]);

  // A utility function to get all app JavaScript sources.
  function filterForJS(files) {
    return files.filter(function(file) {
      return file.match(/\.js$/);
    });
  }

  // A utility function to get all app CSS sources.
  function filterForCSS(files) {
    return files.filter(function(file) {
      return file.match(/\.css$/);
    });
  }

  // The index.html template includes the stylesheet and javascript sources
  // based on dynamic names calculated in this Gruntfile. This task assembles
  // the list into variables for the template to use and then runs the
  // compilation.
  grunt.registerMultiTask('index', 'Process index.html template', function() {
    var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|src/themes/tmooh/assets/|' + grunt.config('compile_dir') + ')\/', 'g');

    // this.fileSrc comes from either build:src, compile:src, or karmaconfig:src in the index config defined above
    // see - http://gruntjs.com/api/inside-tasks#this.filessrc for documentation

    var jsFiles = filterForJS(this.filesSrc).map(function(file) {
      return '/' + file.replace(dirRE, '');
    });

    var jsNgAdminFiles = filterForJS(this.filesSrc).map(function(file) {
      return '/' + file.replace(dirRE, '');
    });

    var cssFiles = filterForCSS(this.filesSrc).map(function(file) {
      return '/' + file.replace(dirRE, '');
    });

    var app = this.data.appName;


    // this.data.dir comes from either build:dir, compile:dir, or karmaconfig:dir in the index config defined above
    // see - http://gruntjs.com/api/inside-tasks#this.data for documentation
    grunt.file.copy(this.data.build?'index-build.jst':'index.jst', this.data.dir + '/index.html', {
      process: function(contents, path) {
        // These are the variables looped over in our index.html exposed as "scripts", "styles", and "version"
        return grunt.template.process(contents, {
          data: {
            appName: app,
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config('v1.0b1'),
            author: grunt.config('pkg.author'),
            date: grunt.template.today("yyyy")
          }
        });
      }
    });
  });

  // The index.html template includes the stylesheet and javascript sources
  // based on dynamic names calculated in this Gruntfile. This task assembles
  // the list into variables for the template to use and then runs the
  // compilation.
  grunt.registerMultiTask('admin_index', 'Process ag-admin/index.html template', function() {

    var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
    // this.fileSrc comes from either build:src, compile:src, or karmaconfig:src in the index config defined above
    // see - http://gruntjs.com/api/inside-tasks#this.filessrc for documentation
    var jsNgAdminFiles = filterForJS(this.filesSrc).map(function(file) {
      return '../' + file.replace(dirRE, '');
    });
    var cssAdminFiles = filterForCSS(this.filesSrc).map(function(file) {
      return '../' + file.replace(dirRE, '');
    });


    var app = this.data.appName;

    // this.data.dir comes from either build:dir, compile:dir, or karmaconfig:dir in the index config defined above
    // see - http://gruntjs.com/api/inside-tasks#this.data for documentation
    grunt.file.copy('ag-admin/index.jst', this.data.dir + '/ag-admin/index.html', {
      process: function(contents, path) {
        // These are the variables looped over in our index.html exposed as "scripts", "styles", and "version"
        return grunt.template.process(contents, {
          data: {
            appName: app,
            ngAdminScripts: jsNgAdminFiles,
            styles: cssAdminFiles,
            version: grunt.config('v1.0b1'),
            author: grunt.config('pkg.author'),
            date: grunt.template.today("yyyy")
          }
        });
      }
    });
  });


};
