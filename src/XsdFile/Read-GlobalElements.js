var helpers = require('./../helpers.js');
var Promise = require('bluebird');
 

function readXsdGlobalElements() {
    var self = this;

    return new Promise((resolve, reject) => {
        
        var schema = self._.schemaElement,
            prefix = self._.meta.xsdNsPrefix;
        
        self.forEachInPath(schema, 'element', (xsdElement) => {
            try {
                var element = self.createElementFromXmlElement(xsdElement, null);
                if (element) {
                    self._.all[element._id] = element;
                }
             } catch (e) {
                 console.log(e);
                 reject(e);
                 return;
             }
        });
        resolve();
    });
}

module.exports = readXsdGlobalElements;