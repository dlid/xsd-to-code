// var fs = require('fs');
// var path = require('path');
// var xml2js = require('xml2js');
// var extend = require('extend');
// var uuid = require('uuid/v4');
// var request = require('request');

// var XsdParserx = (function() {

//     var defaultOptions = {
//         filename : null,
//         xsdStringContent : null,
//         log : function() {}
//     },
//         idlist = [];

//     function objectMap(obj, cb) {
//         var allKeys = Object.keys(obj),
//             result = [];

//         for(var i=0; i < allKeys.length; i++) {
//             var key = allKeys[i],
//                 item = obj[key],
//                 r = cb(key, item);
            
//             if (typeof r !== "undefined" && r!==null) 
//                 result.push(r);
//         }
//         return result;
//     }

//     function newid() {
//         var id;
        
//         do {
//             id = uuid();
//         } while (idlist.indexOf() !== -1)

//         return id;
//     }

//     function fixOptions(o) {
//         o = extend({}, defaultOptions, o);
//         if (typeof o.log !== "function")
//             o.log = function() {};
//         return o;
//     }

//     function findKeyByValue(element, value) {
//         var keys = Object.keys(element);
//         for (i=0; i < keys.length; i++) {
//             if (element[keys[i]] == value) {
//                 return keys[i];
//             }
//         }
//         return null;
//     }

//     function getXmlSchemaPrefix(doc) {
//         var rootElementName = Object.keys(doc)[0];

//         if (doc[rootElementName]) {
//             if (rootElementName.endsWith(':schema')) {
//                 var rootElement = doc[rootElementName],
//                     schemaPrefix = findKeyByValue(rootElement.$, 'http://www.w3.org/2001/XMLSchema');
//                 if (schemaPrefix && schemaPrefix.includes(':')) schemaPrefix = schemaPrefix.split(':')[1];
//                 return schemaPrefix;
//             } else {
//                 console.log("ERR Wrong root element name");
//             }
//         } else {
//             console.log("ERR xsd:schema element not found")
//         }
//         return null;
//     }

//     function parse(options, callback) {
//         var schema = {
//                 _all : {},
//                 attributes : {},
//                 elements : [],
//                 complexTypes : {},
//                 simpleTypes : {},
//                 includes : {},
//                 imports : {}
//             },
//             doc = null,
//             xsdNs;

//         options = fixOptions(options);

//         function getElementReference(name) {
//             if (schema.elements[name]) {
//                 console.log("RESOLVE ELM ", name);
//             }
//         }

//         function getAttributeReference(name) {
//             if (schema.attributes[name]) {
//                 console.log("RESOLVE ATTR ", name);
//             }
//         }

//         function findType(typeName) {
//             if (schema.complexTypes[typeName]) {
//                 console.log("FOUND COMPLEX TYPE ", typeName);
//             } else if (schema.simpleTypes[typeName]) {
//                 console.log("FOUND SIMPLE TYPE ", typeName);
//             } else {
//                 console.log("RESOLVE TYPE", typeName);
//             }
//         }

//         function createTypeFromXsdObject(object, parent) {
//             var xsdType,
//                 xsSequence = object[`${xsdNs}:sequence`];

//                 xsdType = {
//                 _id : 'type/' + newid(),
//                 _type : 'type',
//                 path : []
//             }
        
//             if (parent) {
//                 xsdType.path = parent.path.slice();
//                 xsdType.path.push(parent._id);
//             }
        
//             if (xsSequence) {
//                 var xsElements = xsSequence[0][`${xsdNs}:element`];
//                 xsdType.sequence = [];
//                 if (xsElements) {
//                     xsElements.forEach((elm) => {
//                         var newElement = parseXsdElementObject( elm, xsdType );
//                         if (newElement) {
//                             // Add all elements to global list and point using id reference
//                             schema._all[newElement._id] = newElement;
//                             xsdType.sequence.push(newElement._id);
//                         } else {
//                             console.log(elm);
//                             throw "COULD NOT PARSE ELEMENT";
//                         }
//                     })
//                 }
//             }

//             return xsdType;
//         }

//         function parseXsdElementObject(object, parent) {

//             var elm = null;

//             if (object && object.$ && (object.$.name || object.$.ref)) {

//                 elm = {
//                     _id : 'element/' + newid(),
//                     _type : 'element',
//                     name : object.$.name ? object.$.name : null,
//                     path : []
//                 };

//                 if (parent) {
//                     elm.path = parent.path.slice();
//                     elm.path.push(parent._id);
//                 }

//                 if (object.$.ref) {
//                     console.log("IS A REFRENCE TO GLOBAL ELEMENT!");
//                     console.log("MAKE SURE GLOBAL ELEMENT EXISTS AND REF TO IT");
                    
//                     if (object.$.ref.includes(`:`)) {
//                         console.log("WOAOAA OTHER");
//                     }

//                     var ge = findGlobalElementByName(object.$.ref);
//                     if (!ge) {
//                         console.log("GLOBAL ELEMENT NOT FOUND", object.$.ref);

//                         schemaElm[`${xsdNs}:element`].forEach(function(val){
//                             console.log(object.$.ref, val.$.name);
//                             if (object.$.ref == val.$.name) {
//                                 var e = parseXsdElementObject(val);
//                                 if (e) {
//                                     schema._all[e._id] = e;
//                                     ge = e._id;
//                                 }
//                             }
//                         })
//                         console.log("CREATED ROOT ELEMENT ", ge);

//                     } else {
//                         console.log("FOUND ELEMENT", ge);
//                     }

//                     return ge;

//                 } else if (object[`${xsdNs}:complexType`]) {
//                     var complexType = createTypeFromXsdObject(object[`${xsdNs}:complexType`][0], elm);
//                     schema._all[complexType._id] = complexType;
//                     elm.complexType = complexType._id;
//                 } else {
//                    elm.simpleType = {yes : true};
//                 }
//             }

//             return elm;
//         }
        

//         /**
//         * Get list of ID's for global elements
//         */
//         function getElementIds() {
//             return objectMap(schema._all, (key, item) => {
//                 if (item._type == "element" && item.path.length == 0) {
//                     return key;
//                 }
//             });
//         }

//          /**
//         * Get list of ID's for global elements
//         */
//         function findGlobalElementByName(name) {
//             var globalElementIds = getElementIds(),
//                 elementId;
//             globalElementIds.forEach((val) => {
//                 if (val && val.name == name) {
//                     elementId = val._id;
//                 }
//             });           
//             return elementId; 
//         }

//         function includeSchemas(doc, cb) {
//             var i = 0;
//             if (schemaElm[`${xsdNs}:include`]) {
//                 schemaElm[`${xsdNs}:include`].forEach(function(val){
//                     if (val.$.schemaLocation.indexOf('http') !== -1) 
//                         throw "remote schema location not supported yet";
//                     filename = path.join(path.dirname(options.filename), val.$.schemaLocation);
//                     i++;
//                     console.log("#",i, filename);
//                     fs.readFile(filename, function(err, data) {
//                         var p = XsdParser.parse({
//                             xsdStringContent : data,
//                             filename : filename
//                         }, function(err, data) {
//                             console.log("#######################");
//                             console.log(data);
//                             console.log("#######################");
//                             i--;
//                             if (i==0) {
//                                 cb();
//                             }
//                         });
//                     });
//                 })
//             } else{
//                 cb();
//             }
//     }

//         function importSchemas(doc, cb) {
//             // console.log("?", schemaElm);
//             // if (schemaElm[`${xsdNs}:import`]) {
//             //     console.log("IMPORT");
//             //     return;
//             //     schemaElm[`${xsdNs}:import`].forEach(function(val){
//             //         if (val.$.schemaLocation.indexOf('http') !== -1)  {
                        
//             //             request
//             //                 .get(val.$.schemaLocation)
//             //                 .on('response', function(response) {
//             //                     console.log(response.statusCode) // 200
//             //                     console.log(response.headers['content-type']) // 'image/png'
//             //                 })
                        
//             //             return;
//             //             //    throw "remote import of schema  not supported yet";
//             //         }
//             //             else 
//             //             throw "import not supported yet";

//             //     })
//             // } else {
//             //     hejhej();
//             // }

//             cb();
//         }


//         var schemaElm;

//         xml2js.parseString(options.xsdStringContent, (err, xmlResult) => {
//             doc = xmlResult;

//             if (!err) {
//                     xsdNs = getXmlSchemaPrefix(doc); // Find schema prefix
//                     schemaElm = doc[`${xsdNs}:schema`]; // Schema element

//                     includeSchemas(doc, (err) => {
//                         importSchemas(doc, (err) => {

//                             if (schemaElm) {
//                                 schema.targetNamespace = schemaElm.$.targetNamespace ? schemaElm.$.targetNamespace : null;
//                             }
        
//                             if (schemaElm[`${xsdNs}:complexType`]) {
//                                 schemaElm[`${xsdNs}:complexType`].forEach(function(val){
//                                     createTypeFromXsdObject(val);
//                                 })
//                             }
        
//                             schemaElm[`${xsdNs}:element`].forEach(function(val){
//                                 if (!findGlobalElementByName(val.$.name)) {
//                                     var e = parseXsdElementObject(val);
//                                     if (e) {
//                                         schema._all[e._id] = e;
//                                         schema.elements.push(e._id);
//                                     }
//                                 }
//                             })
        
//                             console.log("-----");
//                         console.log(JSON.stringify(schema, null, 2));
        
                        
        
                            
        
//                             callback(null, {
//                                 getElementIds : getElementIds,
//                                 getTypeIds : function() {return [];},
//                                 getById : function(id) {
//                                     if (typeof schema._all[id] !== "undefined") 
//                                         return schema._all[id];
//                                     return null;
//                                 }
//                             });

//                         })
//                     })





               
//             } else {
//                 callback(err);
//             }
//         });
//     }
    

//     return {
//         parse : parse
//     }
// }());


// //namespaces!
// //xsd:include and xsd:import 


// module.exports = {
//     convert : function(options) {
        
//         options.inputFiles.forEach((filename, index, array) => {
//             console.log(filename);
//             fs.readFile(filename, function(err, data) {
//                 var p = XsdParser.parse({
//                     xsdStringContent : data,
//                     filename : filename
//                 }, function(err, data) {
                    
//                     var elements = data.getElementIds(),
//                         types = data.getTypeIds();
// console.log("ids", elements);
//                     for(var i=0; i < elements.length; i++) {
//                         var e = data.getById(elements[i]);
//                         if (e.complexType) {
//                             var t = data.getById(e.complexType);
//                             console.log( "public class " + e.name  + " {");
//                             if (t.sequence) {
//                                 for (var j=0; j < t.sequence.length; j++) {
//                                     var se = data.getById(t.sequence[j]);
//                                     console.log(se.name);
//                                 }
//                             }
//                            // console.log(e, t);

//                             console.log( "}");
//                         }
//                     }

//                 });
//             });
//         });


//     }
// }

// // var parser = require('xml2js');


// // for(var i=0; i < inputFiles.length; i++) {
// //     fs.readFile(inputFiles[i], function(err, data) {
// //         parser.parseString(data, function (err, result) {
// //             console.dir(result);
// //             console.log('Done');

// //             var schema = result['xs:schema'],
// //                 includes = schema['xs:include'],
// //                 elements = schema['xs:element'];

// //                 console.log("-----------------");
// //                 elements.forEach((xsdElement, index, array) => {
                    
// //                     console.log("<" +xsdElement.$.name + ">");

// //                 });
                
            
// //                 console.log(includes);

// //         });
// //     });
// // }
