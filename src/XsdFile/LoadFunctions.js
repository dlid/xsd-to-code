var helpers = require('./../helpers.js');
var Promise = require('bluebird');
var fs = require('fs');
var request = require('request');
var xml2js = require('xml2js');

/**
 * @description Load the current schema from URL or filename
 */
function loadXsdFileContent() {
    var self = this,
        filename = this._.filename;

    return new Promise((resolve, reject) => {
        if (filename.indexOf('http') === 0) {
            
            // Read the schema from the URL
            request(filename, (err, response, body) => {
                if (err) {
                    reject("Request error " + err);
                }
                if (response.statusCode == 200) {
                    self._.content = body;
                    resolve();
                } else {
                    reject('Server returned ' + response.statusCode + ' ' + filename);
                }
            });
        } else {

            // Attempt to read the content from a file
            fs.readFile(filename, "utf-8", function(err, body) {
                if (!err) {
                    self._.content = body;
                    resolve();
                } else {
                    reject(err);
                }
            });
        }
    });
}

/**
 * @description Attempt to load the content from loadXsdFileContent as an XML Document
 */
function loadXsdContentAsXml() {
    var self = this,
        content = this._.content;

        return new Promise((resolve, reject) => {
        xml2js.parseString(content, (err, result) => {
            if (err) {
                reject(err);
            } else {
                self._.doc = result;
                resolve();
            }
        });
    });
}

module.exports = {
    loadXsdFileContent : loadXsdFileContent,
    loadXsdContentAsXml : loadXsdContentAsXml
}