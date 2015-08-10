/*
 * dream-cheeky-big-red-button
 * https://github.com/atanarro/dream-cheeky-big-red-button
 *
 * Copyright (c) 2015 Alvaro Tanarro
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        '*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint']);

};
