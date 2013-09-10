/*global module:false*/
module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        // Task configuration.

        jshint: {
            files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
                ignores: ['.git', 'node_modules']
            }
        },

        vows: {
            all: {
                src: ['test/*.js']
            }
        },

        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                src: ['bin/cleancss', 'dist/clean-css-standalone.js'],
                dest: 'dist/clean-css-standalone.js'
          }
        },

        uglify: {
            options: {
                compress: true,
                mangle: true,
                preserveComments: false,
                report: 'min'
            },
            minify: {
                files: {
                  'dist/clean-css-standalone.js': ['lib/**/*.js']
                }
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-vows');

    // Default task.
    grunt.registerTask('default', ['jshint', 'vows']);
    grunt.registerTask('standalone', ['uglify', 'concat']);
    grunt.registerTask('test', ['jshint', 'vows']);

};
