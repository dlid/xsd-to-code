var uuid = require('uuid/v4');

var idlist = [];

function newid(prefix) {
    var id;
    do {
        id = uuid();
    } while (idlist.indexOf() !== -1)

    idlist.push(id);

    if (prefix) {
        id = prefix + '/' + id;
    }


    return id;
}

function findByValue(haystack, needle, toLower) {

    if (typeof haystack === "undefined" || haystack === null) {
        return null;
    }

    var keys = objectMap(haystack, (key, val) => {
        if (toLower) {
            if (typeof val === "string" && typeof needle === "string") {
                if (val.toLowerCase() === needle.toLowerCase()) {
                    return key;
                }
            }
        }
        if (val === needle) {
            return key;
        }
    });
    if (keys.length > 0) 
        return keys[0];
    return null;
}

function objectMap(obj, cb) {
    var allKeys = Object.keys(obj),
        result = [];

    for(var i=0; i < allKeys.length; i++) {
        var key = allKeys[i],
            item = obj[key],
            r = cb(key, item);
        
        if (typeof r !== "undefined" && r!==null) 
            result.push(r);
    }
    return result;
}

function isElement(id) {
    return id && id.indexOf('element/') === 0;
}

function isComplexType(id) {
    return id && id.indexOf('complexType/') === 0;
}

function isSimpleType(id) {
    return id && id.indexOf('simpleType/') === 0;
}

function isAttribute(id) {
    return id && id.indexOf('attribute/') === 0;
}

module.exports = {
    findByValue : findByValue,
    newid : newid,
    objectMap : objectMap,
    isElement : isElement,
    isAttribute : isAttribute,
    isSimpleType : isSimpleType,
    isComplexType : isComplexType
};