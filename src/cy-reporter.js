'use strict';
/**
 * @module CypressJUnit
 */

const Mocha = require('mocha');
const xml2js = require('xml2js');
const builder = new xml2js.Builder({cdata: true});
const fs = require('fs');
const path = require('path');
const cyConfig = require(path.join(__dirname,"../cypress.config.js"));

// https://github.com/mochajs/mocha/wiki/Third-party-reporters
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants

// Cypress Settings
var specRoot;
var e2eSpecRoot;
var componentSpecRoot;
var videosFolder;
var screenshotsFolder;

// Logger plugin Settings
var logsFolders;

// Reporter Setting
var resultsFolder;

/**
 * Process the Runner test object
 * @param {Object} test
 * @returns {testcase record object}
 */

function setConfiguration(options) {

  console.debug('START: options:', options)

  // Set defaults - https://docs.cypress.io/guides/references/configuration#Testing-Type-Specific-Options
  e2eSpecRoot = path.join('cypress', 'e2e');
  componentSpecRoot = 'src';
  videosFolder = path.join('cypress', 'videos');
  screenshotsFolder = path.join('cypress', 'screenshots');

  logsFolders = path.join('cypress', 'logs');
  resultsFolder = 'results';

  if ('e2e' in cyConfig && 'specPattern' in cyConfig.e2e) {
    let specPattern = cyConfig.e2e.specPattern;
    let indx = specPattern.indexOf("/**/");
    let root = specPattern.substring(0,indx);
    e2eSpecRoot = path.normalize(root);
    console.debug("e2e config:", e2eSpecRoot);
  }
  if ('component' in cyConfig && 'specPattern' in cyConfig.component) {
    let specPattern = cyConfig.component.specPattern;
    let indx = specPattern.indexOf("/**/");
    let root = specPattern.substring(0,indx);
    componentSpecRoot = path.normalize(root);
    console.debug("component config:", componentSpecRoot);
  }
  if ('videosFolder' in cyConfig) {
    videosFolder = path.normalize(cyConfig.videosFolder)
    console.debug("videosFolder config:", videosFolder);
  }
  if ('screenshotsFolder' in cyConfig) {
    screenshotsFolder = path.normalize(cyConfig.screenshotsFolder);
    console.debug("screenshotsFolder config:", screenshotsFolder);
  }
}

function createTestRecord(test) {
  var testName;
  var testFullName; // Needed for Image File naming :<
  var testFileName;
  var className;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. activeDescribeCount == 0)
  if ( test.title == test.fullTitle() ) {
    testName = test.title;
    testFullName = test.title;
    testFileName = test.parent.file;
    className = path.basename(test.parent.file); // trimming off the path
  } else {
    let parentObj = test.parent;
    let theDescribeNames = [];
    while (parentObj.title != '') {
      theDescribeNames.push(parentObj.title);
      className = parentObj.title;
      testFileName = parentObj.parent.file
      parentObj = parentObj.parent;
    }
    theDescribeNames.reverse()
    theDescribeNames.push(test.title);
    testFullName = theDescribeNames.join(' -- ');
    testName = testFullName.replace(className+' -- ','');
  }

  if (test.state === 'failed') {
    var err = test.err;
    var failure = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "
    const unsafeRegex = /[^ A-Za-z0-9._-]/g;
    var imageBasename = testFullName.replaceAll(unsafeRegex, '').substring(0, 242)+' (failed).png';
    var imageFile = path.join(testFileName.replace(specRoot, screenshotsFolder), imageBasename);
    var imageScreenshot = '[[ATTACHMENT|'+imageFile+']]';
    return {$: {name: testName, classname: className, time: test.duration/1000}, failure: failure, 'system-out': imageScreenshot};
  } else {
    return {$: {name: testName, classname: className, time: test.duration/1000}};
  }
}

function CypressJUnit(runner, options) {
  Mocha.reporters.Base.call(this, runner, options);

  setConfiguration(options);

  // Variables
  var activeDescribes;   // 0 = ROOT, 1 = TESTSUITE, > 0 = NESTED
  var suites = [];
  const stats = runner.stats;

  runner.on(EVENT_TEST_PASS, function(test) {
    console.debug('       PASSS: %s', test.fullTitle())
    suites[suites.length-1].tests.push(test);  // alway use active suite
  });

  runner.on(EVENT_TEST_FAIL, function(test) {
    console.debug('       FAIL:  %s', test.fullTitle()); // err.message, err.name, err.stack
    suites[suites.length-1].tests.push(test);  // alway use active suite
  });

  runner.on(EVENT_SUITE_BEGIN, function(suite) {

    activeDescribes++;
    var _suite = {};
    var _activeTestFile = ".. refer to parent test file";

    if (activeDescribes == 0) {
      _suite.name = 'Root Suite';
      _suite.file = suite.file;
      _suite.timestamp = Date.now();
      _activeTestFile = _suite.file;
      suites.push({suite: _suite, tests: new Array()});
      specRoot = e2eSpecRoot;
      // Check if a Component spec is running
      if (suite.file.startsWith(componentSpecRoot)) {
        specRoot = componentSpecRoot;
      }
    } else if (activeDescribes == 1) {  // Parent Suite, any count above is considered a sub-suite
      _suite.name = suite.title;
      _suite.file = suite.parent.file;
      _suite.timestamp = Date.now();
      _activeTestFile = _suite.file;
      suites.push({suite: _suite, tests: new Array()})
    }
    console.debug('  SUITE BEGIN ...', _activeTestFile, activeDescribes);
  });

  runner.on(EVENT_SUITE_END, function() {
    console.debug('  SUITE END   ...', activeDescribes);
    activeDescribes--;
  });

  runner.on(EVENT_RUN_BEGIN, function() {
    console.debug('RUN BEGIN ...');
    activeDescribes = -1;
    suites = [];
  });

  runner.on(EVENT_RUN_END, function() {
    console.debug('RUN END   ...');

    // Check if NO TESTS were executed
    if (suites.length == 0 ) return;

    var rootStats = {
      name: 'Cypress Tests',
      tests: stats.tests,
      failures: stats.failures,
      skipped:stats.tests - stats.failures - stats.passes,
      errors: 0,
      timestamp: new Date().toUTCString(),
      time: stats.duration / 1000
    };

    var testSuites = [];
    suites.forEach( function(s){
      var suiteStats = {
        name: s.suite.name,
        tests: s.tests.length,
        failures: 0,
        skipped: 0,
        errors: 0,
        time: (Date.now() - s.suite.timestamp) / 1000,
        timestamp: new Date(s.suite.timestamp).toUTCString(),
        file: s.suite.file
      }
      var testCases = [];
      s.tests.forEach( function(t){
        testCases.push(createTestRecord(t));
        if (t.state == 'failed') suiteStats.failures++;
      })

      var logFile = s.suite.file.replace(specRoot, logsFolders).replace('.js', '.txt');
      var logContent = '';
      if (fs.existsSync(logFile)) {
        logContent = fs.readFileSync(logFile, 'utf8');
      }
      var videoFile = s.suite.file.replace(specRoot, videosFolder)+'.mp4';
      logContent += '[[ATTACHMENT|' + videoFile +']]';
      var suiteRecord = { $: suiteStats, testcase: testCases, 'system-out': logContent };
      testSuites.push(suiteRecord);
    })

    var results = {testsuites: {$: rootStats, testsuite: testSuites}}
    var xml = builder.buildObject(results);
    var xmlFile = path.join(resultsFolder, suites[0].suite.file)+'.xml';
    var folder = path.dirname(xmlFile);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
    fs.writeFileSync(xmlFile, xml)
  });

}

module.exports = CypressJUnit;