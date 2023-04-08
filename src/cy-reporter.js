'use strict';
/**
 * @module CypressJUnit
 */

const Mocha   = require('mocha');
const xml2js  = require('xml2js');
const builder = new xml2js.Builder({cdata: true});
const fs      = require('fs');
const path    = require('path');

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
var specRoot;      // specPattern - https://docs.cypress.io/guides/references/configuration#Testing-Type-Specific-Options
var videosFolder;
var screenshotsFolder;

// Logger Settings
var logsFolders;

// Reporter Setting
var resultsFolder;

/**
 * Process the Runner test object
 * @param {Object} test
 * @returns {testcase record object}
 */

function writeResults(resultsFilePath, xml) {
  var folder = path.dirname(resultsFilePath);
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder, { recursive: true}, (err) => {
      if (err) throw err;
    });
  }
  fs.writeFileSync(resultsFilePath, xml)
}

function createTestRecord(test) {
  var testName;
  var testFullName; // Needed for Image File naming :<
  var testFileName;
  var className;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. activeDescribeCount == 0)
  if ( test.title == test.fullTitle() ) {
    testName     = test.title;
    testFullName = test.title;
    testFileName = test.parent.file;

    className    = path.basename(test.parent.file); // trimming off the path
  } else {
    let parentObj = test.parent;
    let theDescribeNames = [];
    while (parentObj.title != '') {
      theDescribeNames.push(parentObj.title);
      className    = parentObj.title;
      testFileName = parentObj.parent.file
      parentObj    = parentObj.parent;
    }
    theDescribeNames.reverse()
    theDescribeNames.push(test.title);
    testFullName = theDescribeNames.join(' -- ');
    testName     = testFullName.replace(className+' -- ','');
  }

  if (test.state === 'failed') {
    var err = test.err;
    var aFailure        = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "
    const regex = /"|\//g; // replace certain symbols with a space
    var imageFileName   = path.join(testFileName.replace(specRoot, screenshotsFolder), testFullName.replaceAll(regex, ''))+' (failed).png';
    var imageScreenshot = '[[ATTACHMENT|'+imageFileName+']]';
    return {$: {name: testName, classname: className, time: test.duration/1000}, failure: aFailure, 'system-out': imageScreenshot};
  } else {
    return {$: {name: testName, classname: className, time: test.duration/1000}};
  }
}

function CypressJUnit(runner, options) {
  Mocha.reporters.Base.call(this, runner, options);

  console.debug('START: options:', options)

  // Default Settings
  specRoot          = path.join('cypress', 'e2e');
  resultsFolder     = path.join('cypress', 'results');
  videosFolder      = path.join('cypress', 'videos');
  screenshotsFolder = path.join('cypress', 'screenshots');
  logsFolders       = path.join('cypress', 'logs');

  // Variables
  var activeDescribes;   // 0 = ROOT, 1 = TESTSUITE, > 0 = NESTED
  var suites  = [];
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

    if ( activeDescribes == 0) {
      _suite.name      = 'Root Suite';
    //  _suite.file      = suite.file.replaceAll(path.sep, path.posix.sep);
      _suite.file      = suite.file;
      _suite.timestamp = Date.now();
      _activeTestFile  = _suite.file;
      suites.push({suite: _suite, tests: new Array()});
    } else if (activeDescribes == 1) {  // Parent Suite, any count above is considered a sub-suite
      _suite.name      = suite.title;
      //_suite.file      = suite.parent.file.replaceAll(path.sep, path.posix.sep);
      _suite.file      = suite.parent.file;
      _suite.timestamp = Date.now();
      _activeTestFile  = _suite.file;
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
    activeDescribes  = -1;
    suites = [];
  });

  runner.on(EVENT_RUN_END, function() {
    console.debug('RUN END   ...');

    var rootStats = {
      name: 'Cypress Tests',
      tests: stats.tests,
      failures: stats.failures,
      skipped:stats.tests - stats.failures - stats.passes,
      errors: 0,
      timestamp: new Date().toUTCString(),
      time: stats.duration / 1000
    };

    var testsuites = [];
    suites.forEach( function(s){
      var testcases = [];
      var tests     = 0;
      var failures  = 0;
      var skipped   = 0;
      var errors    = 0;
      s.tests.forEach( function(t){
        testcases.push(createTestRecord(t))
        tests++;
        if (t.state == 'failed') failures++;
      })

      var videoFile = path.join(videosFolder, path.basename(s.suite.file))+'.mp4'; // This will strip out and sub-folders
      var logFile   = s.suite.file.replace(specRoot, logsFolders).replace('.js', '.txt');
      var textFile       = '';
      if (fs.existsSync(logFile)) {
        textFile = fs.readFileSync(logFile, 'utf8');
      }
      var suiteAttachments = textFile + '[[ATTACHMENT|' + videoFile +']]';
      var timedelta = (Date.now() - s.suite.timestamp) / 1000;
      var timestamp = new Date(s.suite.timestamp).toUTCString(); // toISOString().slice(0, -5)
      if (s.tests.length == 0 ) {
        suiteAttachments = null; // If no test cases do NOT add attachments
        timedelta        = 0; // set time to Zero, no cases exist
      }
      var suite = {name: s.suite.name, tests: tests, failures: failures, errors: errors, skipped: skipped, timestamp: timestamp, time: timedelta, file: s.suite.file};
      var suiteRecord = {$: suite, testcase: testcases, 'system-out': suiteAttachments};
      testsuites.push(suiteRecord);
    })

    var results      = {testsuites: {$: rootStats, testsuite:testsuites} }
    var xml          = builder.buildObject(results);
    var xmlFilePath  = suites[0].suite.file.replace(specRoot, resultsFolder)+'.xml';
    writeResults(xmlFilePath, xml)
  });

}

module.exports = CypressJUnit;