# Tmooh web-portal project

Build an online learning marketplace capable of holding plentiful online resources

### Server Requirements

- PHP Version - 5.4+ (preferably 5.4.7)
  - Extensions
    - GD Version - 2.x+
    - PCRE Version - 7.x+
    - cURL version - 7.x+
    - JSON version - 1.x+
    - Freetype
    - mbstring
    - ffmpeg (https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu)
    - pdo_pgsql should enabled
  - php.ini settings
    - max_execution_time - 180 (not mandatory)
    - max_input_time - 6000 (not mandatory)
    - memory_limit - 128M (at least 32M)
    - safe_mode - off
    - open_basedir - No Value
    - display_error = On
    - magic_quotes_gpc = Off
- PostgreSQL Version - 9.3+ (preferably 9.3)
- Nginx OR Apache - 1+ (preferably 2+)
  - Apache - Modules
    - mod_rewrite
    - mod_deflate (not mandatory, but highly recommended for better performance--gzip)
    - mod_expires (not mandatory, but highly recommended for better performance--browser caching)
- Recommended Linux distributions: Centos / Ubuntu / RedHat

### Used Technologies

- AngularJS 1.5.2
- PHP
- PostgreSQL
- Twitter Bootstrap 3.1.1

### Database setup

    * 'sql/course_with_empty_data.sql' - Database generation script, import the database through phpPgAdmin or command.

```
psql -h ec2-79-125-4-72.eu-west-1.compute.amazonaws.com -p 5432 -d ddg6l59oijsqdt -U jsuhjiwglvfvbl  -W -f backup.sql
psql -h 192.168.0.190 -p 5432 -d <dbname> -U <username> -W -f mydump.dump



  psql -d your_db_name -f /your_server_path/sql/course_with_empty_data.sql
  psql -U postgres -h localhost -d homestead -f Code/tmooh.test/sql/course_with_empty_data.sql
  pg_dump -U postgres -h localhost teacher > outfile.sql
```

    * '/server/php/config.inc.php' - For database and other configurations.

```
(
  define('R_DB_HOST', 'localhost');
  define('R_DB_USER', 'ENTER DB USER HERE');
  define('R_DB_PASSWORD', 'ENTER DB PASSWORD HERE');
  define('R_DB_NAME', 'ENTER DB NANE HERE');
)
```

### File permission setup

- Make sure the permission as read, write and executable as **recursively** for the below directories. (Need write permission 777)

* /media
* /tmp
* /client/assets
* /client/src/app/themes
* /server/php/plugins/Subscriptions/shell
* /server/php/plugins/VideoLessons/shell

### Cron setup

    Setup the cron with the following command
        * For VideoLessons

```
	 */2 * * * * /$root_path/server/php/plugins/VideoLessons/shell/convert_video.sh 1>> /$root/tmp/logs/shell.log 2>> /$root/tmp/logs/shell.log
```

        * For Subscriptions - its application only if subscriptions plugin is available.

```
	*/2 * * * * /$root_path/server/php/plugins/Subscriptions/shell/update_subscription_status.sh 1>> /$root/tmp/logs/shell.log 2>> /$root/tmp/logs/shell.log
```

### directory structure

```
	- /public  (folder has the minified client side files.)
	- /media
	- /sample
	- /app     (folder has the original client side files.)
	- /server
	- /sql
	- /tmp
	- .htaccess
	- nginx-conf-file.conf
```

### Installation guide

To run the project locally, Open terminal or shell and go to /app folder and run the following code

```
cd $root_path\app
npm install
```

Note: before run this command in the above mentioned path please ensure that you are installed the node.js, npm and grunt in your system.

```
npm install -g grunt-cli
npm install -g bower
```

- More abount GruntJS, please refer: http://gruntjs.com/
- For sample gruntfile.js please refer http://gruntjs.com/sample-gruntfile

### Build for local system

In order to run the project in local system we need to build the script via below command.

```
cd $root_path\app
grunt build
```

This command will generate app/index.html, app/ag-admin/index.html, app/templates-app.js, app/templates-common.js and css files for frontend and backend. Set the path upto /app and run the project in the local system.

### Compile for live sever

To getting minified script you should run the below command.

```
cd $root_path\app
grunt compile
```

This command will produce the new '/public' folder with the minified script.
The above command will minified all the .css, .js, .html files. Inside the '/public' folder you will get the minified scripts. The folder structure will be like the below.

```
 - /public
	 - ag-admin
	 - /assets (You will get the minified files with the theme name and version of the project)
		 - /css
		 - /fonts
		 - /img
		 - /js
		 - apple-touch-icon.png
		 - apple-touch-icon-72x72.png
		 - apple-touch-icon-114x114.png
		 - favicon.ico
		 - tmooh-admin-v1.0b1.css   -- admin css minified file
		 - tmooh-admin-v1.0b1.js    -- admin .js minified script
		 - tmooh-v1.0b1.css         -- user side css minified file
		 - tmooh-v1.0b1.js          -- user side .js minified script
	 - /src
	 - /ag-admin
	 - /app
		 - /plugins      ---- it has the available plugin's minified script
	 - index.html
```

To run project in local system we should change root paths in .htaccess(for windows), nginx.conf(for linux).

### extracting new strings to en.json

```
cd $root_path\app
grunt translate
```

### Gruntfile libraries

#### grunt-html2js

- Grunt wrapper for ng-html2js that turns the Angular templates into JavaScript.
  <code>
  npm install grunt-ng-html2js --save
  </code>
- Once the plugin has been installed, it may be enabled inside the Gruntfile with this line of JavaScript.
  <code>
  grunt.loadNpmTasks('grunt-ng-html2js');
  </code>
- In the below example, the default options are used and will take src/template.html and compile it to dest/template.js.
  <code>
  grunt.initConfig({
  ng_html2js: {
  files: {
  'client/template.app.js': 'src/template.html',
  },
  },
  });
  </code>

- In the above code we mentioned the original source html file 'src/template.html' which is yet to converted into java script. Should add all the .html files separated by comma here.
- Also we mentioned the destination files 'client/template.app.js' which is stored all the given html content as the java script content.
- For more details please refer https://www.npmjs.com/package/grunt-ng-html2js

#### grunt-contrib-concat

- The grunt-contrib-concat is used to concatenate the source files.
- Run this command for installing the plugin.

```
npm install grunt-contrib-concat --save
```

- Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```
grunt.loadNpmTasks('grunt-contrib-concat');
```

```
// Project configuration.
grunt.initConfig({
  concat: {
    options: {
       separator: ';',
    },
    dist: {
       src: ['src/intro.js', 'src/project.js', 'src/outro.js'],
       dest: 'dist/built.js',
    },
  },
});
```

- In this example, running grunt concat:dist (or grunt concat because concat is a multi task) will concatenate the three specified source files (in order), joining files with ; and writing the output to dist/built.js.
- For more details please refer https://www.npmjs.com/package/grunt-contrib-concat

#### grunt-contrib-uglify

- The grunt-contrib-uglify is used to minify JavaScript files. This removes all the unnecessary whitespace that the source code has, and renames the variables and functions consistently to use a name as short as possible.
- Run this command for installing the plugin.

```
   npm install grunt-contrib-uglify --save
```

- Once the plugin has been installed, it may be enabled inside the Gruntfile with this line of JavaScript:

```
   grunt.loadNpmTasks('grunt-contrib-uglify');
```

- In this example, running grunt uglify:my_target (or grunt uglify because uglify is a [multi task][]) will mangle and compress the input files using the default options.

```
    grunt.initConfig({
       uglify: {
          my_target: {
             files: {
               'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
             }
          }
       }
    });
```

- The above code tells grunt-contrib-uglify to create a file within dist/ that contains the result of minifying the JavaScript files. Here we use <%= concat.dist.dest %> so uglify will minify the file that the concat task produces.
- To know more about this plugin please refer https://www.npmjs.com/package/grunt-jw-uglify

#### grunt-contrib-htmlmin

- Grunt-contrib-htmlmin is an official plugin from the grunt-js to minify the project's html source code files.
- Can install it from the below command line

```
    npm install grunt-contrib-htmlmin --save
```

- Once the plugin has been installed, it may be enabled inside the Gruntfile with this line of JavaScript:

```
   grunt.loadNpmTasks('grunt-contrib-htmlmin');
```

- This grunt-contrib-htmlmin is used to minify the project's index.html.

```
    grunt.initConfig({
       htmlmin: {                                     // Task
          dist: {                                      // Target
             options: {                                 // Target options
                removeComments: true,
                collapseWhitespace: true
             },
             files: {                                   // Dictionary of files
               'dist/index.html': 'src/index.html',     // 'destination': 'source'
             }
         }
       }
   });
```

- For more details please refer https://www.npmjs.com/package/grunt-contrib-htmlmin

#### grunt-contrib-less

- grunt-contrib-less handles our LESS compilation and uglification automatically.
- Only our 'main.less' file is included in compilation, all other files must be imported from this file.
- Run the below command to install the grunt-contrib-less package

```
npm install grunt-contrib-less --save
```

- Once the plugin has been installed, it may be enabled inside the Gruntfile with this line of JavaScript.

```
 grunt.loadNpmTasks('grunt-contrib-less');
```

```
less: {
        build: {
            files: {
                'build/result.css':['src/path/to/main.less']
            }
        }
      }
```

- For more details please refer https://www.npmjs.com/package/grunt-contrib-less

#### Task to build and compile

- Add the tasks in gruntfile.js for the task to build and compile.

```
grunt.task.run(['htmlmin', 'html2js', 'uglify', 'less:build']);
```

- For detailed information please refer http://gruntjs.com/api/grunt.task

#### Minify the plugins

- If you want to customize the plugins script at '/script/client/src/app/plugins', we can make changes in the original (un-minified) files and make it as minify and we replace it running version.
- Once changes done should do the same thing which we mentioned above for minifying both javascript and html files.

#### Replaced the minified script

- Once done all the above things need to replaced the current minified files with the existing minified files. (/client).
- In case of any changes made in '/script/client/src/app/plugins' need to do same thing which is mention above for /client scripts.


     ====== JS should be in the following order ======
     <code>
      - vendor/jquery/dist/jquery.js
      - vendor/jquery/dist/jquery.timeago.js
      - vendor/jquery/dist/jquery.cookie.js
      - vendor/angular/angular.js
      - vendor/angular-sanitize/angular-sanitize.js
      - vendor/angular-resource/angular-resource.js
      - vendor/angular-bootstrap/ui-bootstrap-tpls.min.js
      - vendor/angular-animate/angular-animate.js
      - vendor/angular-ui-router/src/angular-ui-router.js
      - vendor/angular-translate/angular-translate.min.js
     vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.m - in.js
      - vendor/angular-dynamic-locale/tmhDynamicLocale.min.js
      - vendor/angular-cookies/angular-cookies.js
      - vendor/angular-translate-storage-cookie/angular-translate-storage-cookie.js
      - vendor/angular-translate-handler-log/angular-translate-handler-log.js
      - vendor/angular-translate-storage-local/angular-translate-storage-local.min.js
      - vendor/angular-slugify/angular-slugify.js
      - vendor/angular-http-auth/src/http-auth-interceptor.js
      - vendor/angular-growl/build/angular-growl.js
      - vendor/angular-messages/angular-messages.js
      - vendor/angular-nl2br/angular-nl2br.js
      - vendor/satellizer/satellizer.js
      - vendor/bootstrap/js/collapse.js
      - vendor/bootstrap/js/dropdown.js
      - vendor/bootstrap/js/tab.js
      - vendor/bootstrap/js/alert.js
      - vendor/bootstrap/js/scrollspy.js
      - vendor/bootstrap/js/affix.js
      - vendor/textangular/dist/textAngular-rangy.min.js
      - vendor/textangular/dist/textAngular-sanitize.min.js
      - vendor/textangular/dist/textAngular.min.js
      - vendor/jquery-ui/jquery-ui.min.js
      - vendor/angular-ui-sortable/sortable.js
      - vendor/OcLazyLoad/ocLazyLoad.js
      - vendor/angular-socialshare/dist/angular-socialshare.min.js
      - vendor/angulartics/dist/angulartics.min.js
      - vendor/angulartics-google-analytics/dist/angulartics-google-analytics.min.js
      - vendor/angulartics-facebook-pixel/dist/angulartics-facebook-pixel.min.js
      - vendor/img-lazyload/imglazyload.js
      - vendor/ng-repeat-owl-carousel/dist/ngRepeatOwlCarousel.min.js
      - src/app/common/common.module.js
      - src/app/contactUs/contactUs.module.js
      - src/app/courses/courses.module.js
      - src/app/home/home.module.js
      - src/app/pages/pages.module.js
      - src/app/users/users.module.js
      - src/ag-admin/js/ng-admin.app.js
      - src/app/app.js
      - src/app/common/commonService.js
      - src/app/common/footer.js
      - src/app/common/header.js
      - src/app/constant.js
      - src/app/contactUs/contactUS.js
      - src/app/contactUs/contactUsService.js
      - src/app/courses/addCourse.js
      - src/app/courses/courseService.js
      - src/app/courses/courses.js
      - src/app/courses/directives/amountDisplay.js
      - src/app/courses/directives/categoriesList.js
      - src/app/courses/directives/courseCategory.js
      - src/app/courses/directives/homeCourse.js
      - src/app/courses/directives/manageCourseNavbar.js
      - src/app/courses/directives/onlineLessons.js
      - src/app/courses/directives/paymentButtons.js
      - src/app/courses/directives/relatedCoursesByCategory.js
      - src/app/courses/directives/relatedCoursesByUser.js
      - src/app/courses/learnCourse.js
      - src/app/courses/learning.js
      - src/app/courses/manageCourse.js
      - src/app/courses/search.js
      - src/app/courses/teaching.js
      - src/app/courses/viewCourse.js
      - src/app/courses/wishlist.js
      - src/app/home/home.js
      - src/app/home/homeService.js
      - src/app/pages/pages.js
      - src/app/pages/pagesService.js
      - src/app/plugins/ArticleLessons/ArticleLessons.js
      - src/app/plugins/Coupons/Coupons.js
      - src/app/plugins/CourseCheckout/CourseCheckout.js
      - src/app/plugins/CourseWishlist/CourseWishlist.js
      - src/app/plugins/Instructor/Instructor.js
      - src/app/plugins/RatingAndReview/RatingAndReview.js
      - src/app/plugins/SEO/SEO.js
      - src/app/plugins/SocialLogins/SocialLogins.js
      - src/app/plugins/SocialShare/SocialShare.js
      - src/app/plugins/Translations/Translations.js
      - src/app/plugins/UserProfile/UserProfile.js
      - src/app/plugins/VideoLessons/VideoLessons.js
      - src/app/plugins/Withdrawal/Withdrawal.js
      - src/app/themes/tmooh/assets/js/common.js
      - src/app/themes/tmooh/assets/js/libs/jquery.payment.js
      - src/app/users/activation.js
      - src/app/users/change_password.js
      - src/app/users/directives/customPopover.js
      - src/app/users/directives/passwordMatch.js
      - src/app/users/directives/profileImage.js
      - src/app/users/directives/profileName.js
      - src/app/users/forget_password.js
      - src/app/users/login.js
      - src/app/users/logout.js
      - src/app/users/signup.js
      - src/app/users/users.js
      - src/app/users/usersService.js
      - templates-common.js
      - templates-app.js
     </code>

### install geoip

sudo apt-get -y install gcc make autoconf libc-dev pkg-config
sudo apt-get -y install libgeoip-dev geoip-bin geoip-database php-geoip
pecl channel-update pecl.php.net
sudo pecl install geoip-beta
You should add "extension=geoip.so" to php.ini
wget http://geolite.maxmind.com/download/geoip/database/GeoLiteCity.dat.gz
gunzip GeoLiteCity.dat.gz
sudo mkdir -v /usr/share/GeoIP
sudo mv -v GeoLiteCity.dat /usr/share/GeoIP/GeoIPCity.dat

### SEO

npm install html-minifier -g
export PHANTOM_JS="phantomjs-2.1.1-linux-x86_64"
wget https://bitbucket.org/ariya/phantomjs/downloads/$PHANTOM_JS.tar.bz2
sudo tar xvjf $PHANTOM_JS.tar.bz2
sudo mv $PHANTOM_JS /usr/local/share
sudo ln -sf /usr/local/share/\$PHANTOM_JS/bin/phantomjs /usr/local/bin

### configure new server for converting

1- establish new EC2 from forge
2- point domain from route 53 to the new domain
3- add server ip to VPC to allow access to RDS
4- create website for it
5- install free ssl
6- add ssh to bitbucket
7- clone repository git@bitbucket.org:tmooh/web.git
8- cp server/php/config.inc.php.tmpl server/php/config.inc.php
9- cd server/php/ && composer install
10- mount efs

```
  sudo apt-get -y install nfs-common
  cd c1.tmooh.com
  sudo mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 fs-c5d5259c.efs.eu-central-1.amazonaws.com:/ /home/forge/c4.tmooh.com/media

  #auto mount when restart ec2
  /etc/fstab
  fs-c5d5259c.efs.eu-central-1.amazonaws.com:/ /home/forge/c3.tmooh.com/media nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,_netdev 0 0

```

11- install ffmpeg

```
  chmod +x server/install_ffmpeg_ubuntu.sh
  cd server && ./install_ffmpeg_ubuntu.sh
```

11- cp ~/bin/\* /usr/local/bin/
10- add cron from forge

```
/home/forge/c4.tmooh.com/server/php/plugins/VideoLessons/shell/convert_video.sh
```
