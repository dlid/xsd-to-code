
 function splitFPath(prefix, path) {
    var parts = path.split('/'),
        result = [];
    parts.forEach((part) => {
        if (!part.includes(':'))
            result.push(`${prefix}:${part}`);
        else 
            result.push(part);
    });
    return result;
}



/**
 * Utility method to traverse xml2js xml json nodes.
 * 
 * @param {object} xmlNode is the XmlNode (not an array) to start from
 * @param {*} path The xpath like path `nodeName/nodeName` etc
 * @param {*} cb The callback method
 */
function forEachInPath(xmlNode, path, cb) {
    var self = this, // XsdFile
        parts = typeof path === "string" ? splitFPath(self._.meta.xsdNsPrefix, path) : path,
        currentNode = xmlNode;
    part = parts.shift();
    if (currentNode[part]) {
        if (parts.length == 0) {
            currentNode[part].forEach((e, ix) => {
                cb(e,ix)
            });
        } else {
            var p = parts.slice();
            currentNode[part].forEach((elm) => {
                self.forEachInPath(elm, p, cb);
            });
        }
    }
}


module.exports = {
    forEachInPath : forEachInPath
}