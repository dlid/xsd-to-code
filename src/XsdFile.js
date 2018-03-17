var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var helpers = require('./helpers.js');
var xsdFileCache = require('./XsdFileCache.js');

var getFunctions = require('./XsdFile/GetFunctions.js');
var parseFunctions = require('./XsdFile/Parse.js');
var loadFunctions = require('./XsdFile/LoadFunctions.js');

var readFunctions = {
    readXsdMetadata : require('./XsdFile/Read-Metadata.js'),
    readXsdGlobalElements : require('./XsdFile/Read-GlobalElements.js'),
    readXsdGlobalTypes : require('./XsdFile/Read-GlobalTypes.js')
};
var utilityFunctions = require('./XsdFile/UtilityFunctions.js');

function XsdFile(filenameOrUrl, xsdCache, uri) {

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

// Setup functions used to load schema from file/url and parse it's XML content
XsdFile.prototype.loadXsdFileContent = loadFunctions.loadXsdFileContent;
XsdFile.prototype.loadXsdContentAsXml = loadFunctions.loadXsdContentAsXml;

// Functions to get artifacts
XsdFile.prototype.getGlobalElements = getFunctions.getGlobalElements;
XsdFile.prototype.getAllComplexTypes = getFunctions.getAllComplexTypes;
XsdFile.prototype.getById = getFunctions.getById;
XsdFile.prototype.getByIds = getFunctions.getByIds;

// Main functions - parse
XsdFile.prototype.parse = parseFunctions.parse;

// Functions that read the schema content and tries to interpet it
XsdFile.prototype.readXsdMetadata = readFunctions.readXsdMetadata;
XsdFile.prototype.readXsdGlobalElements = readFunctions.readXsdGlobalElements;
XsdFile.prototype.readXsdGlobalTypes = readFunctions.readXsdGlobalTypes;

XsdFile.prototype.forEachInPath = utilityFunctions.forEachInPath;



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

function ensureParent(child, parent) {
    child.path = [];
    if (parent) {
        child.path = parent.path.slice();
        child.path.push(parent._id);
    }
    return child;
}

XsdFile.prototype.createElementFromXmlElement = function(elementXmlNode, parentObject) {

    if (elementXmlNode.$ && elementXmlNode.$.ref) {
        throw "xs:element @ref attribute is not yet supported";
    }

    if (!elementXmlNode.$ || !elementXmlNode.$.name) {
        throw "xs:element requires a @name or @ref attribute";
    }

    var result = ensureParent({
        _id : helpers.newid('element'),
        name : elementXmlNode.$.name,
        path : [] // When path is empty it's a global element
    }, parentObject);

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

    var self = this,
        result = ensureParent({
            _id : helpers.newid('complexType'),
            path : []
        }, parentObject);


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


    self.forEachInPath(typeXmlNode, 'attribute', (attrElm) => {
        try {
            var newAttribute = self.createAttributeFromXmlElement(attrElm, result);
            if (newAttribute) {
                this._.all[newAttribute._id] = newAttribute;
                if (!result.attributes) result.attributes = [];
                result.attributes.push(newAttribute._id);
            }
         } catch (e) {
             reject(e);
             return;
         }
    });

    return result;
}


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

module.exports = XsdFile;