/**
 * @description A cache for processed files so they are not processed multiple times.
 */

function XsdFileCache() {
    this.data = {};


    this.add = function(key, value) {
        this.data[key] = value;
    }

    this.remove = function(key) {
        if (this.data[key])
            delete this.data[key];
    }

    this.get = function(key, defaultValue) {
        if (this.data[key])
            return this.data[key];
        return typeof defaultValue !== "undefined" ? defaultValue : undefined;
    }    

}

module.exports = XsdFileCache;