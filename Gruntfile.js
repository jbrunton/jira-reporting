module.exports = function(grunt) {

  grunt.initConfig({
    jasmine: {
      test: {
        src: 'build/main.js',
        options: {
          specs: 'build/test.js',
          outfile: 'build/test/SpecRunner.html'
        }
      }
    },
    
    copy: {
      main: {
        src: 'manifest.json',
        dest: 'build/'
      }
    },
    
    browserify: {
      release: {
        src: ['scripts/*.js'],
        dest: 'build/main.js',
        options: {
          bundleOptions: {
            debug: true
          }
        }
      },
      test: {
        src: 'test/*_spec.js',
        dest: 'build/test.js',
        options: {
          bundleOptions: {
            debug: true
          }
        }
      }
    },
    
    watch: {
      scripts: {
        files: ['scripts/**/*.js', 'test/**/*.js'],
        tasks: ['browserify', 'jasmine'],
        options: {
          spawn: false,
        },
      },
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
  grunt.registerTask('test:debug', ['copy:main', 'browserify:test', 'jasmine:test:build', 'shell:debug']);
  grunt.registerTask('build', ['copy:main', 'browserify:release']);
  
};
