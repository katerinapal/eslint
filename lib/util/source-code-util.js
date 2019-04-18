"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _cliEngine = require("../cli-engine");

var _cliEngine2 = _interopRequireDefault(_cliEngine);

var _eslint = require("../eslint");

var _eslint2 = _interopRequireDefault(_eslint);

var _globUtil = require("./glob-util");

var _globUtil2 = _interopRequireDefault(_globUtil);

var _cliOptions = require("../../conf/cli-options");

var _cliOptions2 = _interopRequireDefault(_cliOptions);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Tools for obtaining SourceCode objects.
 * @author Ian VanSchooten
 */

"use strict";

var debug = require("debug")("eslint:source-code-util");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Get the SourceCode object for a single file
 * @param   {string}     filename The fully resolved filename to get SourceCode from.
 * @param   {Object}     options  A CLIEngine options object.
 * @returns {Array}               Array of the SourceCode object representing the file
 *                                and fatal error message.
 */
function getSourceCodeOfFile(filename, options) {
    debug("getting sourceCode of", filename);
    var opts = Object.assign({}, options, { rules: {} });
    var cli = new _cliEngine2.default(opts);
    var results = cli.executeOnFiles([filename]);

    if (results && results.results[0] && results.results[0].messages[0] && results.results[0].messages[0].fatal) {
        var msg = results.results[0].messages[0];

        throw new Error("(" + filename + ":" + msg.line + ":" + msg.column + ") " + msg.message);
    }
    var sourceCode = _eslint2.default.getSourceCode();

    return sourceCode;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------


/**
 * This callback is used to measure execution status in a progress bar
 * @callback progressCallback
 * @param {number} The total number of times the callback will be called.
 */

/**
 * Gets the SourceCode of a single file, or set of files.
 * @param   {string[]|string}  patterns   A filename, directory name, or glob,
 *                                        or an array of them
 * @param   {Object}           [options]  A CLIEngine options object. If not provided,
 *                                        the default cli options will be used.
 * @param   {progressCallback} [cb]       Callback for reporting execution status
 * @returns {Object}                      The SourceCode of all processed files.
 */
function getSourceCodeOfFiles(patterns, options, cb) {
    var sourceCodes = {};
    var opts = void 0;

    if (typeof patterns === "string") {
        patterns = [patterns];
    }

    var defaultOptions = Object.assign({}, _cliOptions2.default, { cwd: process.cwd() });

    if (typeof options === "undefined") {
        opts = defaultOptions;
    } else if (typeof options === "function") {
        cb = options;
        opts = defaultOptions;
    } else if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
        opts = Object.assign({}, defaultOptions, options);
    }
    debug("constructed options:", opts);
    patterns = _globUtil2.default.resolveFileGlobPatterns(patterns, opts);

    var filenames = _globUtil2.default.listFilesToProcess(patterns, opts).reduce(function (files, fileInfo) {
        return !fileInfo.ignored ? files.concat(fileInfo.filename) : files;
    }, []);

    if (filenames.length === 0) {
        debug("Did not find any files matching pattern(s): " + patterns);
    }
    filenames.forEach(function (filename) {
        var sourceCode = getSourceCodeOfFile(filename, opts);

        if (sourceCode) {
            debug("got sourceCode of", filename);
            sourceCodes[filename] = sourceCode;
        }
        if (cb) {
            cb(filenames.length); // eslint-disable-line callback-return
        }
    });
    return sourceCodes;
}

exports.default = {
    getSourceCodeOfFiles: getSourceCodeOfFiles
};
;
module.exports = exports.default;
