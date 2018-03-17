/**
 * Tests of the padString method
 */
var xsdFile = require("../src/XsdFile.js");
var path = require('path');


describe("Test game.xsd", function() {

    var xFile,
        xFileParseError;

    // 
    beforeEach(function(done) {
        xFile = new xsdFile(path.join(__dirname, "test-schemas/game.xsd")),
        result = 'initial value';

        xFile.parse().then(() => {
            done();
        }, (e) => {
            xFile = null;
            xFileParseError = e;
            done();
        })

    })

    it("One Global Element with a local complexType", function() {
        expect(xFile).not.toBeNull('XsdFile parsing should not fail');
        if (xFile) {
            var globalElementIds = xFile.getGlobalElements();
            console.log(globalElementIds);
            expect(globalElementIds).toBeDefined('List of global elements should be defined');
            expect(globalElementIds).not.toBeNull('List of global elements should not be null');
            expect(globalElementIds.length).toEqual(1);

            
            var elm = xFile.getById("non-existing-item");
            expect(elm).toBeNull();

            // Get multiple elements
            elm = xFile.getByIds([globalElementIds[0], 'dummy-id']);
            expect(elm.length).toEqual(1);

            // Get one element
            elm = xFile.getById(globalElementIds[0]);
            expect(elm).not.toBeNull('Element fetched by ID should not be null');


            if (elm) {
                expect(elm.name).toEqual('game');
                expect(elm.complexType).toBeDefined();
                var ct = xFile.getById(elm.complexType);
                expect(ct).not.toBeNull();
                if (ct) {
                    // The complex type exist and should have the correct path (parent = global element id)
                    expect(ct.path.length).toEqual(1);
                    expect(ct.path[0]).toEqual(elm._id);
                    expect(ct.sequence).not.toBeDefined(); // No child elements
                }
            }
        }
    });

    it("hihi", function() {
    });


}); 