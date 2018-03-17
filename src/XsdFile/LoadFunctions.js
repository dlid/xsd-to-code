var helpers = require('./../helpers.js');
var Promise = require('bluebird');
var fs = require('fs');
var request = require('request');
var xml2js = require('xml2js');


/**
 * Load content from the given `url`.
 * @param {string} url 
 * @returns {Promise}
 */
function loadFromUrl(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, response, body) => {
            if (err) {
                reject("Request error " + err);
            }
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject('Server returned ' + response.statusCode + ' ' + url);
            }
        });
    });
}

/**
 * Load content from the given `filename`
 * @param {string} filename 
 * @return {Promise}
 */
function loadFromFile(filename) {
    return new Promise((resolve, reject) => {
          fs.readFile(filename, "utf-8", function(err, body) {
            if (!err) {
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Load the current schema from URL or filename
 */
function loadXsdFileContent() {
    var self = this,
        filename = this._.filename;

    return new Promise((resolve, reject) => {
        if (filename.indexOf('http') === 0) {
            loadFromUrl(filename).then(body => {
                self._.content = body;
                resolve();
            }, reject);
        } else {
            loadFromFile(filename).then(body => {
                self._.content = body;
                resolve();
            }, reject);
        }
    });
}

/**
 * Attempt to load the content from loadXsdFileContent as an XML Document
 */
function loadXsdContentAsXml() {
    var self = this, // XsdFile instance
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