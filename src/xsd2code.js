var xsdParser = require('./XsdParser.js');

module.exports = {
    convert : function(options) {
        
        var xsd = xsdParser(options.inputFiles);

    }
}
