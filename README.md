# Angular2 MEAN Starter #
MEAN starter with MongoDB, Express, Angular 2, and Node.

## Getting Started ##

### Prerequisites ###
1. MongoDB installed and running (http://mongodb.org)
1. Node.js and NPM installed (http://nodejs.org)
1. Gulp.js installed globally (http://gulpjs.com)
1. Bunyan.js installed globally (http://github.com/trentm/node-bunyan)


### Installation ###
1. Clone from Git
1. Run 'npm install' from the project directory


### Configuration ###
Application configuration is controlled by a combination of the 'NODE_ENV' environment variable, which specifies the name of the config file located under './config/env' which should be used by the application. That directory contains a 'development.template.js' file which you should rename to 'development.js' and use for development purposes as it is already ignored by the .gitignore file. To customize your environment for development, you can override any top-level property located in 'default.js'. Each property is documented in the default file.

### Running the Application ###
We use Gulp to build and run the application. There are several tasks in the gulpfile that can be used to build/run/test the application. See gulpfile.js (the 'Main Tasks' section near the bottom of the file) for the tasks that can be executed along with documentation for each.

To build the production application files, run the following command:

$ gulp build

To run the app in development mode (assuming you have development mode enabled in the configuration file), run the following command:

$ export NODE_ENV=development && gulp dev | bunyan

This will set the NODE_ENV environment variable to your config file (eg. 'development' or 'production'), run the 'dev' gulp task, and pipe the output to bunyan, which serializes your log output to human-readable form.
The 'dev' task starts the Node.js server on port 3000 (default). Node.js is run using nodemon, which will monitor the directory system for changes, restarting the app automatically on changes.

### Production vs Development Mode ###
To run the application in production mode:

1. Run the 'build' gulp task to generate the production assets.
1. Set the 'mode' environment configuration property to 'production'. This will make the application use the production assets loaded from the /public directory.
1. Run the server using either 'gulp dev' or 'node ./src/server/server.js'


To run the application in development mode:

1. Set the 'mode' environment configuration property to 'development'. This will make the application use the development assets loaded from the ./public/dev directory and from the Webpack dev middleware. 
1. Run the server using 'gulp dev' (without using gulp, watches on the style, server, and html files will not work)
1. Do your development. Changes to server files will cause a reload of the server. Changes to client styles will cause gulp to recompile the styles and, if enabled, livereload will reload the styles. Changes to Typescript files will be picked up and recompiled by Webpack and livereload will reload the client.

### Testing ###
To test the application:

Currently, we've only implemented server tests using Mocha. There are two relevant gulp tasks: 'test' and 'test-ci'.

#### Test ####
'gulp test'

Executes the tests using a watch on all server test and source files. The tests will re-execute upon any changes. Optionally, you can pass in either of two parameters:

1. '--bail': Pass this parameter to make the mocha tests stop on the first test failure. This can be useful if you want to speed up testing.
1. '--filter=regex': Pass this parameter with a valid request in string format to filter the tests to run by spec filename.

#### Test CI ####
'gulp test-ci'

This task is intended to be used by a continuous integration system. When run, it generates both a test report and a coverage report under a ./reports directory. The tests are run without a filesystem watch and will only run once.

## Adding External Modules ##
The easiest way to get external modules into the mean2 starter is to use npm. Server modules don't normally require anything more than adding the module to the package.json. Try to be consistent with semantic versioning (allow patch updates) when possible. The package.json file is organized to group related packages, avoid using --save and --save-dev when installing packages as this will rewrite the package.json file and destroy the organization.

Client modules can be more complicated for the following reasons:
* Packages are deployed using any number of module systems (e.g. amd, umd, es6, es2015, commonjs, etc).
* Packages may optionally include typings definitions (*.d.ts files), or you may need to import typings from @type
* Packages that exist on the global scope may need to be added using the Webpack provider plugin




### Server Modules ###
Server modules need to be packages deployed to npm. Use 'npm install' to install dependencies.
