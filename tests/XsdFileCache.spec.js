/**
* Tests of the padString method
*/
var xsdFileCache = require("../src/XsdFileCache.js");


describe("Test XsdFileCache", function() {
    
    var testStringValue = 'this is a test string value';
    var testNumericValue = 42;
    
    it("Basic functions", function() {
        var x = new xsdFileCache();
        
        expect(x.add).toBeDefined();
        expect(x.get).toBeDefined();
        expect(x.remove).toBeDefined();
        
        x.add('test', testStringValue);
        expect(x.get('test')).toEqual(testStringValue);
        
        x.add('test', testNumericValue);
        expect(x.get('test')).toEqual(testNumericValue);
        
        x.remove('test')
        expect(x.get('test')).not.toBeDefined();
        
    });
    
}); 