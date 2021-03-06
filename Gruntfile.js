module.exports = function(grunt) {
  
  grunt.initConfig({
    jasmine: {
      test: {
        src: 'build/test.js',
        options: {
          outfile: 'build/test/SpecRunner.html',
          keepRunner: true
        }
      }
    },
    
    copy: {
      manifest: {
        src: 'manifest.json',
        dest: 'build/'
      }
    },
    
    browserify: {
      options: {
        transform: ['hbsfy'],
        bundleOptions: {
          debug: true
        }
      },
      debug: {
        src: ['vendor/**/*.js', 'scripts/**/*.js', 'scripts/**/*.hbs'],
        dest: 'build/main.js'
      },
      release: {
        src: ['vendor/**/*.js', 'scripts/**/*.js', 'scripts/**/*.hbs'],
        dest: 'build/main.js',
        options: {
          bundleOptions: {
            debug: false
          }
        }
      },
      test: {
        src: ['test/**/*.js'],
        dest: 'build/test.js'
      }
    },
    
    watch: {
      scripts: {
        files: ['Gruntfile.js', 'manifest.json', 'vendor/**/*.js', 'scripts/**/*.js', 'scripts/**/*.hbs', 'test/**/*.js'],
        tasks: ['copy', 'browserify:debug', 'browserify:test', 'jasmine'],
        options: {
          spawn: false
        }
      }
    },
    
    shell: {
      debug: {
        command: "open build/test/SpecRunner.html"
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('test', ['browserify:test', 'jasmine']);
  grunt.registerTask('test:debug', ['browserify:test', 'jasmine:test:build', 'shell:debug']);
  grunt.registerTask('build', ['copy', 'browserify:release']);
  
};
