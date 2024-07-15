const expect = require("chai").expect;
const parseString = require('xml2js').parseString;
const path = require('path');
const fs = require('fs');

/**
 * Setting
 */
const testName = path.basename(__filename);
const testDataName = testName.replace('test.', 'data.').replace('.js', '.cy.js');

/**
 * Derived settings
 */
const testFile = path.join('cypress', 'e2e', testDataName);
const resultsFile = path.join('results', testFile)+'.xml';
const videoFile = path.join('cypress', 'videos', testDataName)+'.mp4';
const screenshotFile1 = path.join('cypress', 'screenshots', testDataName, 'TEST1 -- case3 (failed).png');
const screenshotFile2 = path.join('cypress', 'screenshots', testDataName, 'TEST2 -- case3 (failed).png');

/**
 * Globals
 */
var suites = [];

before( () => {
  var theFile = fs.readFileSync(resultsFile, 'utf-8');
  parseString(theFile, function (err, results) {
    suites = results.testsuites.testsuite;
    fs.writeFileSync('results.json', JSON.stringify(suites, null, 2));
  });
});

describe(testName, () => {
  describe('Root Suite', () => {
    it('Name', () => {
      expect(suites[0].$.name).to.equal('Root Suite');
    });
    it('Tests Count', () => {
      expect(suites[0].$.tests).to.equal('0');
    });
    it('File Name', () => {
      expect(suites[1].$.file).to.equal(testFile.replaceAll(path.sep, '/'));
    });
  });
  describe('TEST1', () => {
    it('Name', () => {
      expect(suites[1].$.name).to.equal('TEST1');
    });
    it('Tests Count', () => {
      expect(suites[1].$.tests).to.equal('3');
    });
    it('File Name', () => {
      expect(suites[1].$.file).to.equal(testFile.replaceAll(path.sep, '/'));
    });
    it('System-out', () => {
      var systemout = suites[1]['system-out'][0];
      expect(systemout).to.equal('[[ATTACHMENT|'+videoFile.replaceAll(path.sep, '/')+']]');
    });
    describe('Testcases', ()=> {
      var testcases;
      before(() => {
        testcases = suites[1]['testcase'];
      });
      it('"case1" name', () => {
        expect(testcases[0].$.name).to.equal('case1');
      });
      it('"case2" name', () => {
        expect(testcases[1].$.name).to.equal('case2');
      });
      it('"case3" name', () => {
        expect(testcases[2].$.name).to.equal('case3');
      });
      it('"case3" Failure', () => {
        var systemout = testcases[2]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile1.replaceAll(path.sep, '/')+']]');
      })
    });
  });
  describe('TEST2', () => {
    it('Name', () => {
      expect(suites[2].$.name).to.equal('TEST2');
    });
    it('Tests Count', () => {
      expect(suites[2].$.tests).to.equal('3');
    });
    it('File Name', () => {
      expect(suites[2].$.file).to.equal(testFile.replaceAll(path.sep, '/'));
    });
    it('System-out', () => {
      var systemout = suites[2]['system-out'][0];
      expect(systemout).to.equal('[[ATTACHMENT|'+videoFile.replaceAll(path.sep, '/')+']]');
    });
    describe('Testcases', ()=> {
      var testcases;
      before(() => {
        testcases = suites[2]['testcase'];
      });
      it('"case1" name', () => {
        expect(testcases[0].$.name).to.equal('case1');
      });
      it('"case2" name', () => {
        expect(testcases[1].$.name).to.equal('case2');
      });
      it('"case3" name', () => {
        expect(testcases[2].$.name).to.equal('case3');
      });
      it('"case3" Failure', () => {
        var systemout = testcases[2]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile2.replaceAll(path.sep, '/')+']]');
      })
    });
  });
});