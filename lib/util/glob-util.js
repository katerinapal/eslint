"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _glob = require("./glob");

var _glob2 = _interopRequireDefault(_glob);

var _pathUtil = require("./path-util");

var _pathUtil2 = _interopRequireDefault(_pathUtil);

var _ignoredPaths2 = require("../ignored-paths");

var _ignoredPaths3 = _interopRequireDefault(_ignoredPaths2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Utilities for working with globs and the filesystem.
 * @author Ian VanSchooten
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var fs = require("fs"),
    path = require("path"),
    shell = require("shelljs");

var debug = require("debug")("eslint:glob-util");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks if a provided path is a directory and returns a glob string matching
 * all files under that directory if so, the path itself otherwise.
 *
 * Reason for this is that `glob` needs `/**` to collect all the files under a
 * directory where as our previous implementation without `glob` simply walked
 * a directory that is passed. So this is to maintain backwards compatibility.
 *
 * Also makes sure all path separators are POSIX style for `glob` compatibility.
 *
 * @param {Object}   [options]                    An options object
 * @param {string[]} [options.extensions=[".js"]] An array of accepted extensions
 * @param {string}   [options.cwd=process.cwd()]  The cwd to use to resolve relative pathnames
 * @returns {Function} A function that takes a pathname and returns a glob that
 *                     matches all files with the provided extensions if
 *                     pathname is a directory.
 */
function processPath(options) {
    var cwd = options && options.cwd || process.cwd();
    var extensions = options && options.extensions || [".js"];

    extensions = extensions.map(function (ext) {
        return ext.charAt(0) === "." ? ext.substr(1) : ext;
    });

    var suffix = "/**";

    if (extensions.length === 1) {
        suffix += "/*." + extensions[0];
    } else {
        suffix += "/*.{" + extensions.join(",") + "}";
    }

    /**
     * A function that converts a directory name to a glob pattern
     *
     * @param {string} pathname The directory path to be modified
     * @returns {string} The glob path or the file path itself
     * @private
     */
    return function (pathname) {
        var newPath = pathname;
        var resolvedPath = path.resolve(cwd, pathname);

        if (shell.test("-d", resolvedPath)) {
            newPath = pathname.replace(/[/\\]$/, "") + suffix;
        }

        return _pathUtil2.default.convertPathToPosix(newPath);
    };
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Resolves any directory patterns into glob-based patterns for easier handling.
 * @param   {string[]} patterns    File patterns (such as passed on the command line).
 * @param   {Object} options       An options object.
 * @returns {string[]} The equivalent glob patterns and filepath strings.
 */
function resolveFileGlobPatterns(patterns, options) {

    var processPathExtensions = processPath(options);

    return patterns.map(processPathExtensions);
}

/**
 * Build a list of absolute filesnames on which ESLint will act.
 * Ignored files are excluded from the results, as are duplicates.
 *
 * @param   {string[]} globPatterns            Glob patterns.
 * @param   {Object}   [options]               An options object.
 * @param   {string}   [options.cwd]           CWD (considered for relative filenames)
 * @param   {boolean}  [options.ignore]        False disables use of .eslintignore.
 * @param   {string}   [options.ignorePath]    The ignore file to use instead of .eslintignore.
 * @param   {string}   [options.ignorePattern] A pattern of files to ignore.
 * @returns {string[]} Resolved absolute filenames.
 */
function listFilesToProcess(globPatterns, options) {
    options = options || { ignore: true };
    var files = [],
        added = {};

    var cwd = options && options.cwd || process.cwd();

    /**
     * Executes the linter on a file defined by the `filename`. Skips
     * unsupported file extensions and any files that are already linted.
     * @param {string} filename The file to be processed
     * @param {boolean} shouldWarnIgnored Whether or not a report should be made if
     *                                    the file is ignored
     * @param {IgnoredPaths} ignoredPaths An instance of IgnoredPaths
     * @returns {void}
     */
    function addFile(filename, shouldWarnIgnored, ignoredPaths) {
        var ignored = false;
        var isSilentlyIgnored = void 0;

        if (ignoredPaths.contains(filename, "default")) {
            ignored = options.ignore !== false && shouldWarnIgnored;
            isSilentlyIgnored = !shouldWarnIgnored;
        }

        if (options.ignore !== false) {
            if (ignoredPaths.contains(filename, "custom")) {
                if (shouldWarnIgnored) {
                    ignored = true;
                } else {
                    isSilentlyIgnored = true;
                }
            }
        }

        if (isSilentlyIgnored && !ignored) {
            return;
        }

        if (added[filename]) {
            return;
        }
        files.push({ filename: filename, ignored: ignored });
        added[filename] = true;
    }

    debug("Creating list of files to process.");
    globPatterns.forEach(function (pattern) {
        var file = path.resolve(cwd, pattern);

        if (shell.test("-f", file)) {
            var ignoredPaths = new _ignoredPaths3.default(options);

            addFile(fs.realpathSync(file), !shell.test("-d", file), ignoredPaths);
        } else {

            // regex to find .hidden or /.hidden patterns, but not ./relative or ../relative
            var globIncludesDotfiles = /(?:(?:^\.)|(?:[/\\]\.))[^/\\.].*/.test(pattern);

            var _ignoredPaths = new _ignoredPaths3.default(Object.assign({}, options, { dotfiles: options.dotfiles || globIncludesDotfiles }));
            var shouldIgnore = _ignoredPaths.getIgnoredFoldersGlobChecker();
            var globOptions = {
                nodir: true,
                dot: true,
                cwd: cwd
            };

            new _glob2.default(pattern, globOptions, shouldIgnore).found.forEach(function (globMatch) {
                addFile(path.resolve(cwd, globMatch), false, _ignoredPaths);
            });
        }
    });

    return files;
}

exports.default = {
    resolveFileGlobPatterns: resolveFileGlobPatterns,
    listFilesToProcess: listFilesToProcess
};
;
module.exports = exports.default;
