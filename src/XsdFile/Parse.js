var helpers = require('./../helpers.js');
var Promise = require('bluebird');

/**
 * @description Attempt to parse the given schema
 * @returns {Promise}
 */
function parse() {
    var self = this,
        failed = false;

    return new Promise((resolve, reject) => {

        function fail(error) {
            if (!failed) {
                reject(self.error(error));
            }
            failed = true;
        }

        this.loadXsdFileContent()
            .then(() => {return this.loadXsdContentAsXml();}, (msg) => { fail("Failed to load schema. " + msg); })
            .then(() => {return this.readXsdMetadata();}, (msg) => { fail("Failed to parse schema as XML. " + msg); })        
            .then(() => {return this.readXsdIncludes();}, (msg) => { fail("Error when parsing XSD metadata. " + msg); })
            .then(() => {return this.readXsdImports();}, (msg) => { fail("Error when reading XSD includes. " + msg); })
            .then(() => {return this.readXsdGlobalTypes();}, (msg) => { fail("Error when reading XSD imports. " + msg); })
            .then(() => {return this.readXsdGlobalElements();}, (msg) => { fail("Error when reading XSD global types. " + msg); })
            
            .then(function() {

                self.getAllComplexTypes().forEach((id) => {
                    var v = self.getById(id);
                    
                    var path =self.getByIds(v.path)
                        .filter(obj => helpers.isElement(obj._id))
                        .map((v) => { return v.name; });

                    resolve();

                })

            }, (e) => { fail("Error when reading global elements", e); })
    });
}


module.exports = {
    parse : parse
}