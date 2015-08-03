var path = require('path');

module.exports = function(grunt) {

	// Load all grunt tasks, replaces need for individual grunt.loadNpmTasks('taskname')
	require('load-grunt-tasks')(grunt);

	// Run our local webserver
	grunt.initConfig({
		'develop': {
			server: {
				file: 'server.js',
				env: { NODE_ENV: 'development'}
			}
		},
		'babel': {
			options: {
				sourceMap: true,
				modules: 'amd',
				stage: '0'
			},
			build: {
				files: [{
					expand: true,
					cwd: 'assets/',
					src: ['app/**/*.js'],
					dest: 'assets/js',
					ext: '.js'
				}]
			}
		},
		'requirejs': {
			dev: {
				options: {
					baseUrl: 'assets/js/app',
					name: 'app',
					out: 'assets/js/bundle.js',
					optimize: 'none',
					include: ['almond'],
					insertRequire: ['app'],
					paths: {
						"almond": "../../bower_components/almond/almond"
					}
				}
			}
		},
		'postcss': {
			options: {
				processors: [
					require('pixrem')(),
					require('autoprefixer-core')({browsers: 'last 2 versions'})
				]
			},
			dist: {
				src: 'assets/css/*.css'
			}
		},
		'sass': {
			dist: {
				options: {
					style: 'expanded'
				},
				files: [{
					expand: true,
					cwd: 'assets/scss',
					src: ['*.scss'],
					dest: 'assets/css',
					ext: '.css'
				}]
			}
		},
		'jade': {
			dev: {
				options: {
					data: {
						debug: true
					},
					pretty: true
				},
				files: [{
					cwd: "templates",
					src: ["*.jade"],
					dest: "",
					expand: true,
					ext: ".html"
				}]
			},
			dist: {
				options: {
					data: {
						debug: false
					},
					pretty: true
				},
				files: [{
					cwd: "templates",
					src: ["*.jade"],
					dest: "build",
					expand: true,
					ext: ".html"
				}]
			}
		},
		uglify: {
			dist: {
				files: {
					'assets/js/bundle.min.js': ['assets/js/bundle.js']
				}
			}
		},
		watch: {
			options: {
				spawn: false,
				livereload: true
			},
			scripts: {
				files: ['assets/app/**/*.js'],
				tasks: ['scripts']
			},
			styles: {
				files: ['assets/scss/**/*.scss'],
				tasks: ['styles']
			},
			jade: {
				files: ['templates/**/*.jade'],
				tasks: ['templates']
			}
		},
	});

	// Register individual tasks
	grunt.registerTask('scripts', ['babel:build', 'requirejs:dev']);
	grunt.registerTask('styles', ['sass', 'postcss']);
	grunt.registerTask('templates', ['jade:dev']);

	// Development task
	grunt.registerTask('default', ['develop', 'styles', 'scripts', 'templates', 'watch']);

	// Production-ready task
	grunt.registerTask('build', ['styles', 'scripts', 'uglify', 'jade:dist']);
};
