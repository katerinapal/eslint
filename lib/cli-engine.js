"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = CLIEngine;

var _rules = require("./rules");

var _rules2 = _interopRequireDefault(_rules);

var _eslint = require("./eslint");

var _eslint2 = _interopRequireDefault(_eslint);

var _cliOptions = require("../conf/cli-options");

var _cliOptions2 = _interopRequireDefault(_cliOptions);

var _ignoredPaths = require("./ignored-paths");

var _ignoredPaths2 = _interopRequireDefault(_ignoredPaths);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _plugins = require("./config/plugins");

var _plugins2 = _interopRequireDefault(_plugins);

var _globUtil = require("./util/glob-util");

var _globUtil2 = _interopRequireDefault(_globUtil);

var _sourceCodeFixer = require("./util/source-code-fixer");

var _sourceCodeFixer2 = _interopRequireDefault(_sourceCodeFixer);

var _configValidator = require("./config/config-validator");

var _configValidator2 = _interopRequireDefault(_configValidator);

var _hash = require("./util/hash");

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Main CLI object.
 * @author Nicholas C. Zakas
 */

"use strict";

/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var fs = require("fs"),
    path = require("path"),
    fileEntryCache = require("file-entry-cache"),
    stringify = require("json-stable-stringify"),
    pkg = require("../package.json");

var debug = require("debug")("eslint:cli-engine");

//------------------------------------------------------------------------------
// Typedefs
//------------------------------------------------------------------------------

/**
 * The options to configure a CLI engine with.
 * @typedef {Object} CLIEngineOptions
 * @property {boolean} allowInlineConfig Enable or disable inline configuration comments.
 * @property {boolean|Object} baseConfig Base config object. True enables recommend rules and environments.
 * @property {boolean} cache Enable result caching.
 * @property {string} cacheLocation The cache file to use instead of .eslintcache.
 * @property {string} configFile The configuration file to use.
 * @property {string} cwd The value to use for the current working directory.
 * @property {string[]} envs An array of environments to load.
 * @property {string[]} extensions An array of file extensions to check.
 * @property {boolean} fix Execute in autofix mode.
 * @property {string[]} globals An array of global variables to declare.
 * @property {boolean} ignore False disables use of .eslintignore.
 * @property {string} ignorePath The ignore file to use instead of .eslintignore.
 * @property {string} ignorePattern A glob pattern of files to ignore.
 * @property {boolean} useEslintrc False disables looking for .eslintrc
 * @property {string} parser The name of the parser to use.
 * @property {Object} parserOptions An object of parserOption settings to use.
 * @property {string[]} plugins An array of plugins to load.
 * @property {Object<string,*>} rules An object of rules to use.
 * @property {string[]} rulePaths An array of directories to load custom rules from.
 */

/**
 * A linting warning or error.
 * @typedef {Object} LintMessage
 * @property {string} message The message to display to the user.
 */

/**
 * A linting result.
 * @typedef {Object} LintResult
 * @property {string} filePath The path to the file that was linted.
 * @property {LintMessage[]} messages All of the messages for the result.
 * @property {number} errorCount Number or errors for the result.
 * @property {number} warningCount Number or warnings for the result.
 * @property {string=} [source] The source code of the file that was linted.
 * @property {string=} [output] The source code of the file that was linted, with as many fixes applied as possible.
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * It will calculate the error and warning count for collection of messages per file
 * @param {Object[]} messages - Collection of messages
 * @returns {Object} Contains the stats
 * @private
 */
function calculateStatsPerFile(messages) {
    return messages.reduce(function (stat, message) {
        if (message.fatal || message.severity === 2) {
            stat.errorCount++;
        } else {
            stat.warningCount++;
        }
        return stat;
    }, {
        errorCount: 0,
        warningCount: 0
    });
}

/**
 * It will calculate the error and warning count for collection of results from all files
 * @param {Object[]} results - Collection of messages from all the files
 * @returns {Object} Contains the stats
 * @private
 */
function calculateStatsPerRun(results) {
    return results.reduce(function (stat, result) {
        stat.errorCount += result.errorCount;
        stat.warningCount += result.warningCount;
        return stat;
    }, {
        errorCount: 0,
        warningCount: 0
    });
}

/**
 * Performs multiple autofix passes over the text until as many fixes as possible
 * have been applied.
 * @param {string} text The source text to apply fixes to.
 * @param {Object} config The ESLint config object to use.
 * @param {Object} options The ESLint options object to use.
 * @param {string} options.filename The filename from which the text was read.
 * @param {boolean} options.allowInlineConfig Flag indicating if inline comments
 *      should be allowed.
 * @returns {Object} The result of the fix operation as returned from the
 *      SourceCodeFixer.
 * @private
 */
function multipassFix(text, config, options) {
    var MAX_PASSES = 10;
    var messages = [],
        fixedResult = void 0,
        fixed = false,
        passNumber = 0;

    /**
     * This loop continues until one of the following is true:
     *
     * 1. No more fixes have been applied.
     * 2. Ten passes have been made.
     *
     * That means anytime a fix is successfully applied, there will be another pass.
     * Essentially, guaranteeing a minimum of two passes.
     */
    do {
        passNumber++;

        debug("Linting code for " + options.filename + " (pass " + passNumber + ")");
        messages = _eslint2.default.verify(text, config, options);

        debug("Generating fixed text for " + options.filename + " (pass " + passNumber + ")");
        fixedResult = _sourceCodeFixer2.default.applyFixes(_eslint2.default.getSourceCode(), messages);

        // stop if there are any syntax errors.
        // 'fixedResult.output' is a empty string.
        if (messages.length === 1 && messages[0].fatal) {
            break;
        }

        // keep track if any fixes were ever applied - important for return value
        fixed = fixed || fixedResult.fixed;

        // update to use the fixed output instead of the original text
        text = fixedResult.output;
    } while (fixedResult.fixed && passNumber < MAX_PASSES);

    /*
     * If the last result had fixes, we need to lint again to be sure we have
     * the most up-to-date information.
     */
    if (fixedResult.fixed) {
        fixedResult.messages = _eslint2.default.verify(text, config, options);
    }

    // ensure the last result properly reflects if fixes were done
    fixedResult.fixed = fixed;
    fixedResult.output = text;

    return fixedResult;
}

/**
 * Processes an source code using ESLint.
 * @param {string} text The source code to check.
 * @param {Object} configHelper The configuration options for ESLint.
 * @param {string} filename An optional string representing the texts filename.
 * @param {boolean} fix Indicates if fixes should be processed.
 * @param {boolean} allowInlineConfig Allow/ignore comments that change config.
 * @returns {LintResult} The results for linting on this text.
 * @private
 */
function processText(text, configHelper, filename, fix, allowInlineConfig) {

    // clear all existing settings for a new file
    _eslint2.default.reset();

    var filePath = void 0,
        messages = void 0,
        fileExtension = void 0,
        processor = void 0,
        fixedResult = void 0;

    if (filename) {
        filePath = path.resolve(filename);
        fileExtension = path.extname(filename);
    }

    filename = filename || "<text>";
    debug("Linting " + filename);
    var config = configHelper.getConfig(filePath);

    if (config.plugins) {
        _plugins2.default.loadAll(config.plugins);
    }

    var loadedPlugins = _plugins2.default.getAll();

    for (var plugin in loadedPlugins) {
        if (loadedPlugins[plugin].processors && Object.keys(loadedPlugins[plugin].processors).indexOf(fileExtension) >= 0) {
            processor = loadedPlugins[plugin].processors[fileExtension];
            break;
        }
    }

    if (processor) {
        debug("Using processor");
        var parsedBlocks = processor.preprocess(text, filename);
        var unprocessedMessages = [];

        parsedBlocks.forEach(function (block) {
            unprocessedMessages.push(_eslint2.default.verify(block, config, {
                filename: filename,
                allowInlineConfig: allowInlineConfig
            }));
        });

        // TODO(nzakas): Figure out how fixes might work for processors

        messages = processor.postprocess(unprocessedMessages, filename);
    } else {

        if (fix) {
            fixedResult = multipassFix(text, config, {
                filename: filename,
                allowInlineConfig: allowInlineConfig
            });
            messages = fixedResult.messages;
        } else {
            messages = _eslint2.default.verify(text, config, {
                filename: filename,
                allowInlineConfig: allowInlineConfig
            });
        }
    }

    var stats = calculateStatsPerFile(messages);

    var result = {
        filePath: filename,
        messages: messages,
        errorCount: stats.errorCount,
        warningCount: stats.warningCount
    };

    if (fixedResult && fixedResult.fixed) {
        result.output = fixedResult.output;
    }

    if (result.errorCount + result.warningCount > 0 && typeof result.output === "undefined") {
        result.source = text;
    }

    return result;
}

/**
 * Processes an individual file using ESLint. Files used here are known to
 * exist, so no need to check that here.
 * @param {string} filename The filename of the file being checked.
 * @param {Object} configHelper The configuration options for ESLint.
 * @param {Object} options The CLIEngine options object.
 * @returns {LintResult} The results for linting on this file.
 * @private
 */
function processFile(filename, configHelper, options) {

    var text = fs.readFileSync(path.resolve(filename), "utf8"),
        result = processText(text, configHelper, filename, options.fix, options.allowInlineConfig);

    return result;
}

/**
 * Returns result with warning by ignore settings
 * @param {string} filePath - File path of checked code
 * @param {string} baseDir  - Absolute path of base directory
 * @returns {LintResult} Result with single warning
 * @private
 */
function createIgnoreResult(filePath, baseDir) {
    var message = void 0;
    var isHidden = /^\./.test(path.basename(filePath));
    var isInNodeModules = baseDir && /^node_modules/.test(path.relative(baseDir, filePath));
    var isInBowerComponents = baseDir && /^bower_components/.test(path.relative(baseDir, filePath));

    if (isHidden) {
        message = "File ignored by default.  Use a negated ignore pattern (like \"--ignore-pattern '!<relative/path/to/filename>'\") to override.";
    } else if (isInNodeModules) {
        message = "File ignored by default. Use \"--ignore-pattern '!node_modules/*'\" to override.";
    } else if (isInBowerComponents) {
        message = "File ignored by default. Use \"--ignore-pattern '!bower_components/*'\" to override.";
    } else {
        message = "File ignored because of a matching ignore pattern. Use \"--no-ignore\" to override.";
    }

    return {
        filePath: path.resolve(filePath),
        messages: [{
            fatal: false,
            severity: 1,
            message: message
        }],
        errorCount: 0,
        warningCount: 1
    };
}

/**
 * Checks if the given message is an error message.
 * @param {Object} message The message to check.
 * @returns {boolean} Whether or not the message is an error message.
 * @private
 */
function isErrorMessage(message) {
    return message.severity === 2;
}

/**
 * return the cacheFile to be used by eslint, based on whether the provided parameter is
 * a directory or looks like a directory (ends in `path.sep`), in which case the file
 * name will be the `cacheFile/.cache_hashOfCWD`
 *
 * if cacheFile points to a file or looks like a file then in will just use that file
 *
 * @param {string} cacheFile The name of file to be used to store the cache
 * @param {string} cwd Current working directory
 * @returns {string} the resolved path to the cache file
 */
function getCacheFile(cacheFile, cwd) {

    /*
     * make sure the path separators are normalized for the environment/os
     * keeping the trailing path separator if present
     */
    cacheFile = path.normalize(cacheFile);

    var resolvedCacheFile = path.resolve(cwd, cacheFile);
    var looksLikeADirectory = cacheFile[cacheFile.length - 1] === path.sep;

    /**
     * return the name for the cache file in case the provided parameter is a directory
     * @returns {string} the resolved path to the cacheFile
     */
    function getCacheFileForDirectory() {
        return path.join(resolvedCacheFile, ".cache_" + (0, _hash2.default)(cwd));
    }

    var fileStats = void 0;

    try {
        fileStats = fs.lstatSync(resolvedCacheFile);
    } catch (ex) {
        fileStats = null;
    }

    /*
     * in case the file exists we need to verify if the provided path
     * is a directory or a file. If it is a directory we want to create a file
     * inside that directory
     */
    if (fileStats) {

        /*
         * is a directory or is a file, but the original file the user provided
         * looks like a directory but `path.resolve` removed the `last path.sep`
         * so we need to still treat this like a directory
         */
        if (fileStats.isDirectory() || looksLikeADirectory) {
            return getCacheFileForDirectory();
        }

        // is file so just use that file
        return resolvedCacheFile;
    }

    /*
     * here we known the file or directory doesn't exist,
     * so we will try to infer if its a directory if it looks like a directory
     * for the current operating system.
     */

    // if the last character passed is a path separator we assume is a directory
    if (looksLikeADirectory) {
        return getCacheFileForDirectory();
    }

    return resolvedCacheFile;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the core CLI engine.
 * @param {CLIEngineOptions} options The options for this instance.
 * @constructor
 */
function CLIEngine(options) {

    options = Object.assign(Object.create(null), _cliOptions2.default, { cwd: process.cwd() }, options);

    /**
     * Stored options for this instance
     * @type {Object}
     */
    this.options = options;

    var cacheFile = getCacheFile(this.options.cacheLocation || this.options.cacheFile, this.options.cwd);

    /**
     * Cache used to avoid operating on files that haven't changed since the
     * last successful execution (e.g., file passed linting with no errors and
     * no warnings).
     * @type {Object}
     */
    this._fileCache = fileEntryCache.create(cacheFile);

    // load in additional rules
    if (this.options.rulePaths) {
        var cwd = this.options.cwd;

        this.options.rulePaths.forEach(function (rulesdir) {
            debug("Loading rules from " + rulesdir);
            _rules2.default.load(rulesdir, cwd);
        });
    }

    Object.keys(this.options.rules || {}).forEach(function (name) {
        _configValidator2.default.validateRuleOptions(name, this.options.rules[name], "CLI");
    }.bind(this));
}

/**
 * Returns the formatter representing the given format or null if no formatter
 * with the given name can be found.
 * @param {string} [format] The name of the format to load or the path to a
 *      custom formatter.
 * @returns {Function} The formatter function or null if not found.
 */
CLIEngine.getFormatter = function (format) {

    var formatterPath = void 0;

    // default is stylish
    format = format || "stylish";

    // only strings are valid formatters
    if (typeof format === "string") {

        // replace \ with / for Windows compatibility
        format = format.replace(/\\/g, "/");

        // if there's a slash, then it's a file
        if (format.indexOf("/") > -1) {
            var cwd = this.options ? this.options.cwd : process.cwd();

            formatterPath = path.resolve(cwd, format);
        } else {
            formatterPath = "./formatters/" + format;
        }

        try {
            return require(formatterPath);
        } catch (ex) {
            ex.message = "There was a problem loading formatter: " + formatterPath + "\nError: " + ex.message;
            throw ex;
        }
    } else {
        return null;
    }
};

/**
 * Returns results that only contains errors.
 * @param {LintResult[]} results The results to filter.
 * @returns {LintResult[]} The filtered results.
 */
CLIEngine.getErrorResults = function (results) {
    var filtered = [];

    results.forEach(function (result) {
        var filteredMessages = result.messages.filter(isErrorMessage);

        if (filteredMessages.length > 0) {
            filtered.push(Object.assign(result, {
                messages: filteredMessages,
                errorCount: filteredMessages.length,
                warningCount: 0
            }));
        }
    });

    return filtered;
};

/**
 * Outputs fixes from the given results to files.
 * @param {Object} report The report object created by CLIEngine.
 * @returns {void}
 */
CLIEngine.outputFixes = function (report) {
    report.results.filter(function (result) {
        return result.hasOwnProperty("output");
    }).forEach(function (result) {
        fs.writeFileSync(result.filePath, result.output);
    });
};

CLIEngine.prototype = {

    constructor: CLIEngine,

    /**
     * Add a plugin by passing it's configuration
     * @param {string} name Name of the plugin.
     * @param {Object} pluginobject Plugin configuration object.
     * @returns {void}
     */
    addPlugin: function addPlugin(name, pluginobject) {
        _plugins2.default.define(name, pluginobject);
    },

    /**
     * Resolves the patterns passed into executeOnFiles() into glob-based patterns
     * for easier handling.
     * @param {string[]} patterns The file patterns passed on the command line.
     * @returns {string[]} The equivalent glob patterns.
     */
    resolveFileGlobPatterns: function resolveFileGlobPatterns(patterns) {
        return _globUtil2.default.resolveFileGlobPatterns(patterns, this.options);
    },

    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {string[]} patterns An array of file and directory names.
     * @returns {Object} The results for all files that were linted.
     */
    executeOnFiles: function executeOnFiles(patterns) {
        var results = [],
            options = this.options,
            fileCache = this._fileCache,
            configHelper = new _config2.default(options);
        var prevConfig = void 0; // the previous configuration used

        /**
         * Calculates the hash of the config file used to validate a given file
         * @param  {string} filename The path of the file to retrieve a config object for to calculate the hash
         * @returns {string}         the hash of the config
         */
        function hashOfConfigFor(filename) {
            var config = configHelper.getConfig(filename);

            if (!prevConfig) {
                prevConfig = {};
            }

            // reuse the previously hashed config if the config hasn't changed
            if (prevConfig.config !== config) {

                /*
                 * config changed so we need to calculate the hash of the config
                 * and the hash of the plugins being used
                 */
                prevConfig.config = config;

                var eslintVersion = pkg.version;

                prevConfig.hash = (0, _hash2.default)(eslintVersion + "_" + stringify(config));
            }

            return prevConfig.hash;
        }

        /**
         * Executes the linter on a file defined by the `filename`. Skips
         * unsupported file extensions and any files that are already linted.
         * @param {string} filename The resolved filename of the file to be linted
         * @param {boolean} warnIgnored always warn when a file is ignored
         * @returns {void}
         */
        function executeOnFile(filename, warnIgnored) {
            var hashOfConfig = void 0,
                descriptor = void 0;

            if (warnIgnored) {
                results.push(createIgnoreResult(filename, options.cwd));
                return;
            }

            if (options.cache) {

                /*
                 * get the descriptor for this file
                 * with the metadata and the flag that determines if
                 * the file has changed
                 */
                descriptor = fileCache.getFileDescriptor(filename);
                var meta = descriptor.meta || {};

                hashOfConfig = hashOfConfigFor(filename);

                var changed = descriptor.changed || meta.hashOfConfig !== hashOfConfig;

                if (!changed) {
                    debug("Skipping file since hasn't changed: " + filename);

                    /*
                     * Add the the cached results (always will be 0 error and
                     * 0 warnings). We should not cache results for files that
                     * failed, in order to guarantee that next execution will
                     * process those files as well.
                     */
                    results.push(descriptor.meta.results);

                    // move to the next file
                    return;
                }
            } else {
                fileCache.destroy();
            }

            debug("Processing " + filename);

            var res = processFile(filename, configHelper, options);

            if (options.cache) {

                /*
                 * if a file contains errors or warnings we don't want to
                 * store the file in the cache so we can guarantee that
                 * next execution will also operate on this file
                 */
                if (res.errorCount > 0 || res.warningCount > 0) {
                    debug("File has problems, skipping it: " + filename);

                    // remove the entry from the cache
                    fileCache.removeEntry(filename);
                } else {

                    /*
                     * since the file passed we store the result here
                     * TODO: check this as we might not need to store the
                     * successful runs as it will always should be 0 errors and
                     * 0 warnings.
                     */
                    descriptor.meta.hashOfConfig = hashOfConfig;
                    descriptor.meta.results = res;
                }
            }

            results.push(res);
        }

        var startTime = Date.now();

        patterns = this.resolveFileGlobPatterns(patterns);
        var fileList = _globUtil2.default.listFilesToProcess(patterns, options);

        fileList.forEach(function (fileInfo) {
            executeOnFile(fileInfo.filename, fileInfo.ignored);
        });

        var stats = calculateStatsPerRun(results);

        if (options.cache) {

            // persist the cache to disk
            fileCache.reconcile();
        }

        debug("Linting complete in: " + (Date.now() - startTime) + "ms");

        return {
            results: results,
            errorCount: stats.errorCount,
            warningCount: stats.warningCount
        };
    },

    /**
     * Executes the current configuration on text.
     * @param {string} text A string of JavaScript code to lint.
     * @param {string} filename An optional string representing the texts filename.
     * @param {boolean} warnIgnored Always warn when a file is ignored
     * @returns {Object} The results for the linting.
     */
    executeOnText: function executeOnText(text, filename, warnIgnored) {

        var results = [],
            options = this.options,
            configHelper = new _config2.default(options),
            ignoredPaths = new _ignoredPaths2.default(options);

        // resolve filename based on options.cwd (for reporting, ignoredPaths also resolves)
        if (filename && !path.isAbsolute(filename)) {
            filename = path.resolve(options.cwd, filename);
        }

        if (filename && ignoredPaths.contains(filename)) {
            if (warnIgnored) {
                results.push(createIgnoreResult(filename, options.cwd));
            }
        } else {
            results.push(processText(text, configHelper, filename, options.fix, options.allowInlineConfig));
        }

        var stats = calculateStatsPerRun(results);

        return {
            results: results,
            errorCount: stats.errorCount,
            warningCount: stats.warningCount
        };
    },

    /**
     * Returns a configuration object for the given file based on the CLI options.
     * This is the same logic used by the ESLint CLI executable to determine
     * configuration for each file it processes.
     * @param {string} filePath The path of the file to retrieve a config object for.
     * @returns {Object} A configuration object for the file.
     */
    getConfigForFile: function getConfigForFile(filePath) {
        var configHelper = new _config2.default(this.options);

        return configHelper.getConfig(filePath);
    },

    /**
     * Checks if a given path is ignored by ESLint.
     * @param {string} filePath The path of the file to check.
     * @returns {boolean} Whether or not the given path is ignored.
     */
    isPathIgnored: function isPathIgnored(filePath) {
        var resolvedPath = path.resolve(this.options.cwd, filePath);
        var ignoredPaths = new _ignoredPaths2.default(this.options);

        return ignoredPaths.contains(resolvedPath);
    },

    getFormatter: CLIEngine.getFormatter

};
module.exports = exports.default;
