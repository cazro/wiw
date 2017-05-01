module.exports = function(grunt) {

	var jsVendorFiles = [
		'bower_components/jquery/dist/jquery.js',
		'bower_components/angular/angular.js',
		'bower_components/jquery-ui/jquery-ui.js',
		'bower_components/bootstrap/dist/js/bootstrap.js',
		'bower_components/angular-animate/angular-animate.js',
		'bower_components/angular-aria/angular-aria.js',
		'bower_components/angular-messages/angular-messages.js',
		'bower_components/angular-material/angular-material.js',
		'bower_components/angular-resource/angular-resource.js',
		'bower_components/angular-cookies/angular-cookies.js',
		'bower_components/angular-ui-router/release/angular-ui-router.js',
		'bower_components/angular-ui-bootstrap/dist/ui-bootstrap.js',
		'bower_components/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
		'bower_components/angular-bootstrap-contextmenu/contextMenu.js',
		'bower_components/angular-ui-grid/ui-grid.js',
		'bower_components/angular-sanitize/angular-sanitize.js',
		'node_modules/sprintf-js/dist/sprintf.js',
		'node_modules/sprintf-js/dist/angular-sprintf.js',
		'bower_components/angular-material-icons/angular-material-icons.js'
		
	];
	var jquery = [
		'bower_components/jquery/dist/jquery.js'
	];
	
	var angular = [
		'bower_components/angular/angular.js',
		'bower_components/jquery-ui/jquery-ui.js',
		'bower_components/angular-animate/angular-animate.js',
		'bower_components/angular-aria/angular-aria.js',
		'bower_components/angular-messages/angular-messages.js',
		'bower_components/angular-material/angular-material.js',
		'bower_components/angular-resource/angular-resource.js',
		'bower_components/angular-cookies/angular-cookies.js',
		'bower_components/angular-ui-router/release/angular-ui-router.js',
		'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
		'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
		'bower_components/angular-bootstrap-contextmenu/contextMenu.js',
		'node_modules/angular-ui-grid/ui-grid.js',
		'bower_components/angular-sanitize/angular-sanitize.js',
		'bower_components/angular-material-icons/angular-material-icons.js'
	];
	var other = [
		'node_modules/sprintf-js/dist/sprintf.js',
		'node_modules/sprintf-js/dist/angular-sprintf.js',
		'bower_components/bootstrap/dist/js/bootstrap.js'
	];
	var jsAppFiles = [
		'src/js/app.js',
		'src/js/var/wiw.js',
		'src/js/services/AuthFactory.js',
		'src/js/controllers/AuthCtrl.js',
		'src/js/services/SchedFactory.js',
		'src/js/controllers/SchedCtrl.js',
		'src/js/controllers/GridCtrl.js'
	];
	
	var cssVendorFiles = [
		'bower_components/angular-ui-grid/ui-grid.css',
		'bower_components/angular-material/angular-material.css',
		'bower_components/bootstrap/dist/css/bootstrap.css',
		'bower_components/jquery-ui/themes/humanity/theme.css'
	];
	
	var cssAppFiles = [
		'src/css/style.css'
	];
	
	var jsSrcFiles = jsVendorFiles.concat(jsAppFiles);
	
	var cssSrcFiles = cssVendorFiles.concat(cssAppFiles);
	// Project configuration.
	grunt.initConfig({
	  
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			prod:{
				files:[
					{
						src: 'build/<%= pkg.name %>.js',
						dest: 'public/js/<%= pkg.name %>.min.js'
					},
					{
						src: 'build/jquery.js',
						dest: 'public/js/wiw.jquery.min.js'
					},
					{
						src: 'build/angular.js',
						dest: 'public/js/wiw.angular.min.js'
					},
					{
						src: 'build/other.js',
						dest: 'public/js/wiw.other.min.js'
					}
				]
			}
		},

		concat: {
			dev:{
				files: [
					{
						src: jsAppFiles,
						dest: 'build/<%= pkg.name %>.js'
					},
					{
						src: jquery,
						dest: 'build/jquery.js'
					},
					{
						src: angular,
						dest: 'build/angular.js'
					},
					{
						src: other,
						dest: 'build/other.js'
					}
				]
			}
		},
		
		cssmin: {
			options: {
			  shorthandCompacting: false,
			  roundingPrecision: -1
			},
			target: {
			  files: {
				'public/stylesheets/<%= pkg.name %>.min.css': cssSrcFiles
			  }
			}
		  }
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	// Default task(s).
	grunt.registerTask('default', ['concat:dev','uglify:prod','cssmin']);
	grunt.registerTask('build-prod',['uglify:prod']);
};