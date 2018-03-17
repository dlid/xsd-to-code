var helpers = require('./../helpers.js');
var Promise = require('bluebird');
 
 function readXsdMetadata() {
    var self = this,
        doc = this._.doc;

        return new Promise((resolve, reject) => {
        
        var keys = Object.keys(doc);
            if (keys[0].endsWith(':schema')) {
                var xsdNsKey = helpers.findByValue(doc[keys[0]].$, 'http://www.w3.org/2001/XMLSchema', true);
                if (xsdNsKey) {
                    self._.meta = {
                        xsdNsPrefix : xsdNsKey.split(':')[1],
                        xsdNs : doc[keys[0]].$[xsdNsKey],
                        targetNamespace : doc[keys[0]].$.targetNamespace ? doc[keys[0]].$.targetNamespace : "",
                        xmlns : doc[keys[0]].$.xmlns ? doc[keys[0]].$.xmlns : "",
                        elementFormDefault:null,
                        attributeFormDefault:null
                    };
                    self._.schemaElement = doc[keys[0]];
                    resolve();
                } else {
                    reject("Could not find schema namespace attribute in " + keys[0]);
                }
            } else {
                reject("Unexpected root element");
            }
    });
};

module.exports = readXsdMetadata;