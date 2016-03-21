/*global module:false*/
module.exports = function(grunt) {

    var tsCommJs = grunt.file.readJSON("tsconfig.json")['compilerOptions'];
    tsCommJs['module'] = 'commonjs';

    var tsAMD = grunt.file.readJSON("tsconfig.json")['compilerOptions'];
    tsAMD['module'] = 'amd';

    var tsDist = grunt.file.readJSON("tsconfig.json")['compilerOptions'];

    var copyWebSrc = ['**/*.html','**/*.png','**/*.gif','**/*.css', '**/*.js'];

    grunt.initConfig({
        copy: {
            web: {
                cwd: 'src/',
                src: copyWebSrc,
                dest: 'web/',
                expand: true
            }
        },
        ts: {
            test: {
                src: [ 'src/**/*Test.ts' ],
                dest: 'test/',
                options: tsCommJs
            },
            web: {
                src: [ 'src/**/*.ts' ],
                dest: 'web/',
                options: tsAMD
            },
	        js: {
                src: ['src/minimalPerimeterTriangle.ts'],
                dest: 'dist',
                options: {
            	       declaration: true,
            		   module: 'commonjs',
                       target: 'es5',
                       noImplicitAny: true,
            		   sourceMap: false,
                       removeComments: true
            	}
            }
        },
        tslint:{
            all: {
                options: {
                    configuration: grunt.file.readJSON("tslint.json")
                },
                files: {
                    src: ['src/**/*.ts' ]
                }
            },
        },
        ava: {
            target: ['test/**/*Test.js']
        },
        connect: {
            server: {
                options: {
                    port: 8081,
                    //hostname: 'localhost',
		            hostname: '0.0.0.0',
                    base: './',
                    keepalive: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-ava');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['tslint', 'ts', 'copy', 'ava', 'connect']);
};
