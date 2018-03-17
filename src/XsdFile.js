var request = require('request');
var xml2js = require('xml2js');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var helpers = require('./helpers.js');
var xsdFileCache = require('./XsdFileCache.js');

function XsdFile(filenameOrUrl, xsdCache, uri) {


    //console.log("[XsdFile] " + filenameOrUrl );

    this._ = {
        _id : helpers.newid('schema'),
        uri : uri ? uri : filenameOrUrl.toLowerCase(),
        filename : filenameOrUrl,
        content : null, // The xsd file content as a string
        doc : null ,// The xsd as a parsed XML document
        all : {}
    };

    // Basic cache that does nothing, if no cache provider was given
    this.cache = {
        add : function() {},
        get : function() {},
        remove : function() {}
    };

    if (xsdCache) {
        this.cache = xsdCache;
    }

}

XsdFile.prototype.error = function() {

    var exceptionString;

    process.stdout.write("\n\n\x1b[1m\x1b[31mXsdFile - An error occured\x1b[0m\n")

    for(var i=0;i < arguments.length; i++) {
        if (typeof arguments[i] === "string" && i == 0) {
            exceptionString = arguments[i];
            process.stdout.write("\x1b[33m");
            process.stdout.write(arguments[i]);
            process.stdout.write("\n");
            process.stdout.write("\x1b[0m");
        }
    }

    return exceptionString;

}

/**
 * @description Get the ID:s of all Global xs:element items
 * @returns {string[]}
 */
XsdFile.prototype.getGlobalElements = function() {
    var globalElements = helpers.objectMap(this._.all, (key, value) => {
        if (value.path.length == 0 && value._id.indexOf('element/') == 0) {
            return key;
        }
    });
    return globalElements;
}

XsdFile.prototype.getAllComplexTypes = function() {
    var globalElements = helpers.objectMap(this._.all, (key, value) => {
        if (value._id.indexOf('complexType/') == 0) {
            return key;
        }
    });
    return globalElements;
}


/**
 * @description 
 */
XsdFile.prototype.parse = function() {
    var self = this,
        failed = false;


   

    return new Promise((resolve, reject) => {

    function fail(error) {
        if (!failed) {
            reject(self.error(error));
        }
        failed = true;
    }

    this.readXsdFileContent()
        .then(() => {return this.parseXsdContentAsXml();}, (msg) => { fail("Failed to load schema. " + msg); })
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

XsdFile.prototype.getById = function(id) {
    if (this._.all[id]) {
        return this._.all[id];
    }
    return null;
}

XsdFile.prototype.getByIds = function(ids) {
    var self = this;
    var result = [];
    ids.forEach((id) => {
        if (self._.all[id]) {
            result.push(self._.all[id]);
        }    
    })
    return result;
}


XsdFile.prototype.readXsdMetadata = function() {
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

XsdFile.prototype.readXsdGlobalTypes = function() {
    var self = this;
    return new Promise((resolve, reject) => {
        
        //console.log("[▶]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[ ]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[\x1b[1m\x1b[31mx\x1b[0m]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[\x1b[1m\x1b[32m✓\x1b[0m]\x1b[1m\x1b[33m Parse global types!\x1b[0m (3)")
        resolve();

    });
};

XsdFile.prototype.createAttributeFromXmlElement = function(attributeXmlNode, parentObject) {

    if (attributeXmlNode.$ && attributeXmlNode.$.ref) {
        throw "xs:attribute @ref attribute is not yet supported";
    }

    if (!attributeXmlNode.$ || !attributeXmlNode.$.name) {
        throw "xs:attribute requires a @name or @ref attribute";
    }

    var result = {
        _id : helpers.newid('attribute'),
        name : attributeXmlNode.$.name,
        path : []
    };

    if (parentObject) {
        result.path = parentObject.path.slice();
        result.path.push(parentObject._id);
    }

    return result;
}

XsdFile.prototype.createElementFromXmlElement = function(elementXmlNode, parentObject) {

    if (elementXmlNode.$ && elementXmlNode.$.ref) {
        throw "xs:element @ref attribute is not yet supported";
    }

    if (!elementXmlNode.$ || !elementXmlNode.$.name) {
        throw "xs:element requires a @name or @ref attribute";
    }

    var result = {
        _id : helpers.newid('element'),
       // _schema : this._._id,
        name : elementXmlNode.$.name,
        path : [] // When path is empty it's a global element
    };

    if (parentObject) {
        result.path = parentObject.path.slice();
        result.path.push(parentObject._id);
    }

    if (!elementXmlNode.$.type) {
        var complexTypes = elementXmlNode[`${this._.meta.xsdNsPrefix}:complexType`];
        if (complexTypes) {
            complexTypes.forEach((typeNode) => {
                // Create the local type and pass in the element as its parent
                var newComplexType = this.createComplexTypeFromXmlElement(typeNode, result);
                this._.all[newComplexType._id] = newComplexType;
                result.complexType = newComplexType._id; 
            });
        }

        var complexTypes = elementXmlNode[`${this._.meta.xsdNsPrefix}:simpleType`];
        if (complexTypes) {
            complexTypes.forEach((typeNode) => {
                // Create the local type and pass in the element as its parent
                result.simpleType =  this.createComplexTypeFromXmlElement(typeNode, result); 
            });
        }
    } else {
        if (elementXmlNode.$.type.includes(':') ) {
            if (elementXmlNode.$.type.indexOf(`${this._.meta.xsdNsPrefix}:`) === 0) {
                result.dataType = elementXmlNode.$.type;
            } else {
                result.type = "imported?"+elementXmlNode.$.type;
            }
        } else {
            result.type = "global?" + elementXmlNode.$.type;
        }
    }

    return result;
    
}

XsdFile.prototype.createComplexTypeFromXmlElement = function(typeXmlNode, parentObject) {

    var result = {
        _id : helpers.newid('complexType'),
        path : []
    };

    if (parentObject) {
        result.path = parentObject.path.slice();
        result.path.push(parentObject._id);
    }

    var sequences = typeXmlNode[`${this._.meta.xsdNsPrefix}:sequence`];
    if (sequences) {
        result.sequence = [];
        sequences.forEach((sequence) => {
            var elements = sequence[`${this._.meta.xsdNsPrefix}:element`];
            elements.forEach((elm) => {
                var newElement = this.createElementFromXmlElement(elm, result);
                if (newElement) {
                    this._.all[newElement._id] = newElement;
                    result.sequence.push(newElement._id);
                }
            })
        });
    }

    var attributes = typeXmlNode[`${this._.meta.xsdNsPrefix}:attribute`];
    if (attributes) {
        result.attributes = [];
        attributes.forEach((attrElm) => {
            var newAttribute = this.createAttributeFromXmlElement(attrElm, result);
            if (newAttribute) {
                this._.all[newAttribute._id] = newAttribute;
                result.attributes.push(newAttribute._id);
            }
        });
    }
    return result;
}

XsdFile.prototype.readXsdGlobalElements = function() {
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
                       //console.log("[XsdFile] Found global element " + element.name);
                       self._.all[element._id] = element;
                   }
                } catch (e) {
                    reject(e);
                    return;
                }

            });
        }

        //console.log(JSON.stringify(self._.all, null,2));
        resolve();

    });
};

XsdFile.prototype.readXsdIncludes = function() {
    var self = this;
    return new Promise((resolve, reject) => {
        resolve();
    });
};

XsdFile.prototype.readXsdImports = function() {
    var self = this;
    return new Promise((resolve, reject) => {
        resolve();
    });
};

XsdFile.prototype.parseXsdContentAsXml = function() {
    var self = this,
        content = this._.content;

        return new Promise((resolve, reject) => {
        xml2js.parseString(content, (err, result) => {
            if (err) {
                reject(err);
            } else {
                self._.doc = result;
                resolve();
            }
        });
    });
}

/**
 * @description Get the XML content of the schema file or URL
 */
XsdFile.prototype.readXsdFileContent = function() {
    var self = this,
        filename = this._.filename;

    return new Promise((resolve, reject) => {
        if (filename.indexOf('http') === 0) {
            
            // Read the schema from the URL
            request(filename, (err, response, body) => {
                if (err) {
                    reject("Request error " + err);
                }
                if (response.statusCode == 200) {
                    self._.content = body;
                    resolve();
                } else {
                    reject('Server returned ' + response.statusCode + ' ' + filename);
                }
            });
        } else {

            // Attempt to read the content from a file
            fs.readFile(filename, "utf-8", function(err, body) {
                if (!err) {
                    self._.content = body;
                    resolve();
                } else {
                    reject(err);
                }
            });
        }
    });
}

module.exports = XsdFile;