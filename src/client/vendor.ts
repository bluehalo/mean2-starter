/**
 * Vendor Imports
 *
 *   This entry point is used by Webpack to place vendor code into it's own bundle during the build. This has the
 *   benefit of separating application code from vendor code, allowing better caching for code that changes less
 *   often and allowing parallel downloading of the two primary code bundles for the application. Follow the
 *   commented organization pattern for adding new dependencies.
 *
 *   Polyfills - Should only be imported in this file, not directly by the application
 *
 *   Global Imports - Dependencies that are not polyfills, but are not directly imported elsewhere in the app
 *
 *   Angular2 Imports - All @angular dependencies
 *
 *   Angular2 Third-Party - All angular-specific third-party dependencies
 *
 *   Other Dependencies - All other third-party dependencies
 */

// Polyfills
import 'core-js/es6';
import 'core-js/es7/reflect';
import 'classlist.js';
import 'console-polyfill';
import 'reflect-metadata';
import 'zone.js';


// Global Imports
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'font-awesome/css/font-awesome.css';
import 'angular2-toaster/toaster.css';


// Angular2 Imports
import '@angular/common';
import '@angular/core';
import '@angular/forms';
import '@angular/http';
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/router';


// Angular2 Third-Party
import 'angular2-modal';
import 'angular2-toaster';
import 'ng2-bootstrap';


// Other Dependencies
import 'lodash';
import 'moment';
import 'rxjs';
