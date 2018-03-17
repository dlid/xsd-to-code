var helpers = require('./../helpers.js');
var Promise = require('bluebird');
 
function readXsdGlobalTypes() {
    var self = this;
    return new Promise((resolve, reject) => {
        //console.log("[▶]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[ ]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[\x1b[1m\x1b[31mx\x1b[0m]\x1b[1m\x1b[33m Parse global types!\x1b[0m")
        //console.log("[\x1b[1m\x1b[32m✓\x1b[0m]\x1b[1m\x1b[33m Parse global types!\x1b[0m (3)")
        resolve();

    });
};

module.exports = readXsdGlobalTypes;