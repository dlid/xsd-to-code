var xsd2code = require('./src/xsd2code');
var fs = require('fs');
var path = require('path');

var params = process.argv,
    nodeExecutable = params.shift(),
    scriptPath = path.dirname(params.shift()),
    outputPath = process.cwd(),
    inputFiles = [];

function handleXsdParameter(xsdParameter) {
    var foundFile;
    if (xsdParameter.toLowerCase().indexOf('http') == 0) {
        inputFiles.push(xsdParameter);
    } else {
        foundFile = resolveFilePath(xsdParameter);
        if (foundFile) {
            inputFiles.push(foundFile);
        } else {
            inputFiles.push(xsdParameter);
        }
    }
}

/**
 * Attempt to find the specified file using a number of ways.
 * First by `path.resolve` 
 * then in `working directory`
 * and last in `script directory`
 * @param {string} filename 
 * @returns {string}
 */
function resolveFilePath(filename) {
    var fullPath = path.resolve(filename);
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(process.cwd(), filename);
        if (!fs.existsSync(fullPath)) {
            fullPath = path.join(scriptPath, filename);
            if (!fs.existsSync(fullPath)) {
                fullPath = null;
            }
        }
    }
    return fullPath;
}

    do {
        if (params.length > 0) {
            var next = params.shift();
            if (next.toLowerCase().endsWith(".xsd")) {
                handleXsdParameter(next);
            } else if (next.toLowerCase() == "/o") {
                break;
            } else {
                console.error("Unknown parameter: " + next);
                break;
            }
        }
    } while (params.length > 0);



console.log("INPUTFILES", inputFiles);
console.log("OUTPUT PATH", outputPath);


xsd2code.convert({
    inputFiles : inputFiles
});