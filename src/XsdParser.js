var xsdFile = require('./XsdFile.js');
var xsdFileCache = require('./XsdFileCache.js');

function XsdParser(files) {

    // The cache will store parsed schemas so they are only parsed one
    // If schemas include or import the same schemas they will be re-used
    var cache = new xsdFileCache(),
        schemas = [],
        ix = -1;


    var processFiles = function(cb) {
        ix++;
        if (ix >= files.length) {
            cb();
            return;
        }
        var filename = files[ix];
        var xsdF = cache.get(filename.toLowerCase()); // Attempt to get from cache first
        
        if (!xsdF) {
            xsdF = new xsdFile(filename, cache);
            xsdF.parse().then(function() {
                schemas.push(xsdF);
                processFiles(cb);
            })
        } else {
            processFiles(cb);
        }
    }

    processFiles(() => {
        console.log("Parsed",schemas.length,"schemas");
    });
}

module.exports = function(files) {
    return new XsdParser(files);
};