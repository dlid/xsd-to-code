var helpers = require('./../helpers.js');

/**
 * @description Get the ID:s of all Global xs:element items
 * @returns {string[]}
 */
function getGlobalElements() {
    var globalElements = helpers.objectMap(this._.all, (key, value) => {
        if (value.path.length == 0 && value._id.indexOf('element/') == 0) {
            return key;
        }
    });
    return globalElements;
}

/**
 * @description Get all complex types - local and global
 */
function getAllComplexTypes() {
    var globalElements = helpers.objectMap(this._.all, (key, value) => {
        if (value._id.indexOf('complexType/') == 0) {
            return key;
        }
    });
    return globalElements;
}

/**
 * @description Get a schema artifact by id
 * @param {string} id 
 */
function getById(id) {
    if (this._.all[id]) {
        return this._.all[id];
    }
    return null;
}

/**
 * @description Get multiple schema artifacts by their id:s
 * @param {string[]} ids 
 */
function getByIds(ids) {
    var self = this;
    var result = [];
    ids.forEach((id) => {
        if (self._.all[id]) {
            result.push(self._.all[id]);
        }    
    })
    return result;
}

module.exports = {
    getGlobalElements : getGlobalElements,
    getAllComplexTypes : getAllComplexTypes,
    getById : getById,
    getByIds : getByIds
}