'use strict';
/**
 * @module CypressJUnit
 */

const Mocha = require('mocha');
const xml2js = require('xml2js');
const builder = new xml2js.Builder({cdata: true});
const fs = require('fs');
const path = require('path');
const os = require('os');

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
var videosFolder;
var screenshotsFolder;

// Cypress Terminal plugin settings - https://github.com/archfz/cypress-terminal-report
var logsFolder;

// Reporter Setting
var resultsFolder;

/**
 * Process the Runner test object
 * @param {Object} test
 * @returns {testcase record object}
 */

var socketId;

function loadConfiguration(options) {

  console.debug('START: configuration & options:');

  resultsFolder = 'results';
  logsFolder = path.join('cypress', 'logs');

  const CONFIG_FILE = path.join(os.tmpdir(), "cypress-xml-reporter.config.json");
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error("This reporter requires to be configured as a plugin in 'cypress.config.js'");
  }

  const jsonConfig = fs.readFileSync(CONFIG_FILE);
  const objConfig = JSON.parse(jsonConfig);
  socketId = objConfig.socketId; // Unique file Id
  videosFolder = path.normalize(objConfig.resolved.videosFolder.value);
  screenshotsFolder = path.normalize(objConfig.resolved.screenshotsFolder.value);

  console.debug("  Testing Type:", objConfig.testingType);
  console.debug("  VideoFolder:", videosFolder);
  console.debug("  ScreenshotsFolder:", screenshotsFolder);
  console.debug("  Options:", options);
}

function createTestRecord(test, specRelativePath) {
  var testName;
  var testFullName; // Needed for Image File naming :<
  var className;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. activeDescribeCount == 0)
  if ( test.title == test.fullTitle() ) {
    testName = test.title;
    testFullName = test.title;
    className = path.basename(test.parent.file); // trimming off the path
  } else {
    let parentObj = test.parent;
    let theDescribeNames = [];
    while (parentObj.title != '') {
      theDescribeNames.push(parentObj.title);
      className = parentObj.title;
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
    var imageFile = path.join(screenshotsFolder, specRelativePath, imageBasename);
    var imageScreenshot = '[[ATTACHMENT|'+imageFile+']]';
    return {$: {name: testName, classname: className, time: test.duration/1000}, failure: failure, 'system-out': imageScreenshot};
  } else {
    return {$: {name: testName, classname: className, time: test.duration/1000}};
  }
}

function CypressXML(runner, options) {
  Mocha.reporters.Base.call(this, runner, options);

  loadConfiguration(options);

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
    console.debug('RUN END   ...', process.pid);

    var SPEC_FILE = path.join(os.tmpdir(), "cypress-xml-reporter.spec-relative-path."+socketId);
    const specRelativePath = path.normalize(fs.readFileSync(SPEC_FILE).toString());
    console.debug("specRelative:", specRelativePath);

    // Check if NO TESTS were executed
    if (suites.length == 0) return;

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
        testCases.push(createTestRecord(t, specRelativePath));
        if (t.state == 'failed') suiteStats.failures++;
      })

      var logFile = path.join(logsFolder, specRelativePath).replace('.js', '.txt');
      var logContent = '';
      if (fs.existsSync(logFile)) {
        logContent = fs.readFileSync(logFile, 'utf8');
      }
      var videoFile = path.join(videosFolder, specRelativePath)+'.mp4';
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

module.exports = CypressXML;