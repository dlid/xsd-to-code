/**
 * Tests of the padString method
 */
var xsdFile = require("../src/XsdFile.js");
var xsdFileCache = require("../src/XsdFileCache.js");
var path = require('path');


describe("XsdFile File Load Errors", function() {

    var xFile,
        xFileParseError,
        cache;

    beforeEach(function(done) {
        var filename = path.join(__dirname, "test-schemas/file-not-found.xsd");
        cache = new xsdFileCache();
        xFile = new xsdFile(filename, cache, filename.toLowerCase());
        result = 'initial value';
        xFile.parse().then(() => {
            done();
        }, (e) => {
            xFile = null;
            xFileParseError = e;
            console.log("ERROR",e);
            done();
        })

    })

    it("Missing file", function() {
        expect(xFileParseError.includes('Failed to load schema')).toEqual(true);
    });

}); 

describe("XsdFile URL Load Errors", function() {

    var xFile,
        xFileParseError;

    beforeEach(function(done) {
        xFile = new xsdFile("http://www.example.org/schema/xsd/1.0/example"),
        result = 'initial value';
        xFile.parse().then(() => {
            done();
        }, (e) => {
            xFile = null;
            xFileParseError = e;
            console.log("ERROR",e);
            done();
        })

    })

    it("404 Error", function() {
        expect(xFileParseError.includes('Failed to load schema')).toEqual(true);
    });

}); 

describe("XsdFile Load XML with wrong root element", function() {

    var xFile,
        xFileParseError;

    beforeEach(function(done) {
        xFile = new xsdFile(path.join(__dirname, "test-schemas/errorous-schema.xsd"));
        result = 'initial value';
        xFile.parse().then(() => {
            done();
        }, (e) => {
            xFile = null;
            xFileParseError = e;
            done();
        })

    })

    it("Fail when root element is wrong", function() {
        expect(xFileParseError.includes('Error when parsing XSD metadata. Unexpected root element')).toEqual(true);
    });
}); 

describe("XsdFile Load XML with no xs namespace", function() {

    var xFile,
        xFileParseError;

    beforeEach(function(done) {
        xFile = new xsdFile(path.join(__dirname, "test-schemas/errorous-schema-no-xs-ns.xsd"));
        result = 'initial value';
        xFile.parse().then(() => {
            done();
        }, (e) => {
            xFile = null;
            xFileParseError = e;
            done();
        })

    })

    it("Fail when XSD namespace is not found", function() {
        expect(xFileParseError.includes('rror when parsing XSD metadata. Could not find schema namespace attribute')).toEqual(true);
    });
}); 


