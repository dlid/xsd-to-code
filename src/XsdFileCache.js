/**
 * A cache for processed files so they are not processed multiple times.
 */

function addToCache(key, value) {
    this.data[key] = value;
}

function removeFromCache(key) {
    if (this.data[key])
        delete this.data[key];
}

function getFromCache(key, defaultValue) {
    if (this.data[key])
        return this.data[key];
    return typeof defaultValue !== "undefined" ? defaultValue : undefined;
}   

function XsdFileCache() {
    this.data = {};
    this.add = addToCache;
    this.remove = removeFromCache;
    this.get = getFromCache; 
}

module.exports = XsdFileCache;