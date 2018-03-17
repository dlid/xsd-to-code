var helpers = require('./../helpers.js');
var Promise = require('bluebird');
 
function readXsdGlobalElements() {
    var self = this;

    return new Promise((resolve, reject) => {
        
        var schema = self._.schemaElement,
            prefix = self._.meta.xsdNsPrefix,
            xsdElements = schema[`${prefix}:element`];
          
        if (xsdElements) {
            xsdElements.forEach((xsdElement) => {
                try {
                   var element = self.createElementFromXmlElement(xsdElement, null);
                   if (element) {
                       self._.all[element._id] = element;
                   }
                } catch (e) {
                   
                    reject(e);
                    return;
                }
            });
        }
        resolve();
    });
}

module.exports = readXsdGlobalElements;