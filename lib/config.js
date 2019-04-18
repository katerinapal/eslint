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

exports.default = Config;

var _configOps = require("./config/config-ops");

var _configOps2 = _interopRequireDefault(_configOps);

var _configFile = require("./config/config-file");

var _configFile2 = _interopRequireDefault(_configFile);

var _plugins = require("./config/plugins");

var _plugins2 = _interopRequireDefault(_plugins);

var _fileFinder = require("./file-finder");

var _fileFinder2 = _interopRequireDefault(_fileFinder);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Responsible for loading config files
 * @author Seth McLaughlin
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require("path"),
    userHome = require("user-home"),
    isResolvable = require("is-resolvable"),
    pathIsInside = require("path-is-inside");

var debug = require("debug")("eslint:config");

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var PERSONAL_CONFIG_DIR = userHome || null;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Check if item is an javascript object
 * @param {*} item object to check for
 * @returns {boolean} True if its an object
 * @private
 */
function isObject(item) {
    return (typeof item === "undefined" ? "undefined" : _typeof(item)) === "object" && !Array.isArray(item) && item !== null;
}

/**
 * Load and parse a JSON config object from a file.
 * @param {string|Object} configToLoad the path to the JSON config file or the config object itself.
 * @returns {Object} the parsed config object (empty object if there was a parse error)
 * @private
 */
function loadConfig(configToLoad) {
    var config = {},
        filePath = "";

    if (configToLoad) {

        if (isObject(configToLoad)) {
            config = configToLoad;

            if (config.extends) {
                config = _configFile2.default.applyExtends(config, filePath);
            }
        } else {
            filePath = configToLoad;
            config = _configFile2.default.load(filePath);
        }
    }

    return config;
}

/**
 * Get personal config object from ~/.eslintrc.
 * @returns {Object} the personal config object (null if there is no personal config)
 * @private
 */
function getPersonalConfig() {
    var config = void 0;

    if (PERSONAL_CONFIG_DIR) {
        var filename = _configFile2.default.getFilenameForDirectory(PERSONAL_CONFIG_DIR);

        if (filename) {
            debug("Using personal config");
            config = loadConfig(filename);
        }
    }

    return config || null;
}

/**
 * Determine if rules were explicitly passed in as options.
 * @param {Object} options The options used to create our configuration.
 * @returns {boolean} True if rules were passed in as options, false otherwise.
 */
function hasRules(options) {
    return options.rules && Object.keys(options.rules).length > 0;
}

/**
 * Get a local config object.
 * @param {Object} thisConfig A Config object.
 * @param {string} directory The directory to start looking in for a local config file.
 * @returns {Object} The local config object, or an empty object if there is no local config.
 */
function getLocalConfig(thisConfig, directory) {
    var localConfigFiles = thisConfig.findLocalConfigFiles(directory),
        numFiles = localConfigFiles.length,
        projectConfigPath = _configFile2.default.getFilenameForDirectory(thisConfig.options.cwd);
    var found = void 0,
        config = {},
        rootPath = void 0;

    for (var i = 0; i < numFiles; i++) {

        var localConfigFile = localConfigFiles[i];

        // Don't consider the personal config file in the home directory,
        // except if the home directory is the same as the current working directory
        if (path.dirname(localConfigFile) === PERSONAL_CONFIG_DIR && localConfigFile !== projectConfigPath) {
            continue;
        }

        // If root flag is set, don't consider file if it is above root
        if (rootPath && !pathIsInside(path.dirname(localConfigFile), rootPath)) {
            continue;
        }

        debug("Loading " + localConfigFile);
        var localConfig = loadConfig(localConfigFile);

        // Don't consider a local config file found if the config is null
        if (!localConfig) {
            continue;
        }

        // Check for root flag
        if (localConfig.root === true) {
            rootPath = path.dirname(localConfigFile);
        }

        found = true;
        debug("Using " + localConfigFile);
        config = _configOps2.default.merge(localConfig, config);
    }

    if (!found && !thisConfig.useSpecificConfig) {

        /*
         * - Is there a personal config in the user's home directory? If so,
         *   merge that with the passed-in config.
         * - Otherwise, if no rules were manually passed in, throw and error.
         * - Note: This function is not called if useEslintrc is false.
         */
        var personalConfig = getPersonalConfig();

        if (personalConfig) {
            config = _configOps2.default.merge(config, personalConfig);
        } else if (!hasRules(thisConfig.options) && !thisConfig.options.baseConfig) {

            // No config file, no manual configuration, and no rules, so error.
            var noConfigError = new Error("No ESLint configuration found.");

            noConfigError.messageTemplate = "no-config-found";
            noConfigError.messageData = {
                directory: directory,
                filesExamined: localConfigFiles
            };

            throw noConfigError;
        }
    }

    return config;
}

//------------------------------------------------------------------------------
// API
//------------------------------------------------------------------------------

/**
 * Config
 * @constructor
 * @class Config
 * @param {Object} options Options to be passed in
 */
function Config(options) {
    options = options || {};

    this.ignore = options.ignore;
    this.ignorePath = options.ignorePath;
    this.cache = {};
    this.parser = options.parser;
    this.parserOptions = options.parserOptions || {};

    this.baseConfig = options.baseConfig ? loadConfig(options.baseConfig) : { rules: {} };

    this.useEslintrc = options.useEslintrc !== false;

    this.env = (options.envs || []).reduce(function (envs, name) {
        envs[name] = true;
        return envs;
    }, {});

    /*
     * Handle declared globals.
     * For global variable foo, handle "foo:false" and "foo:true" to set
     * whether global is writable.
     * If user declares "foo", convert to "foo:false".
     */
    this.globals = (options.globals || []).reduce(function (globals, def) {
        var parts = def.split(":");

        globals[parts[0]] = parts.length > 1 && parts[1] === "true";

        return globals;
    }, {});

    var useConfig = options.configFile;

    this.options = options;

    if (useConfig) {
        debug("Using command line config " + useConfig);
        if (isResolvable(useConfig) || isResolvable("eslint-config-" + useConfig) || useConfig.charAt(0) === "@") {
            this.useSpecificConfig = loadConfig(useConfig);
        } else {
            this.useSpecificConfig = loadConfig(path.resolve(this.options.cwd, useConfig));
        }
    }
}

/**
 * Build a config object merging the base config (conf/eslint.json), the
 * environments config (conf/environments.js) and eventually the user config.
 * @param {string} filePath a file in whose directory we start looking for a local config
 * @returns {Object} config object
 */
Config.prototype.getConfig = function (filePath) {
    var directory = filePath ? path.dirname(filePath) : this.options.cwd;
    var config = void 0,
        userConfig = void 0;

    debug("Constructing config for " + (filePath ? filePath : "text"));

    config = this.cache[directory];

    if (config) {
        debug("Using config from cache");
        return config;
    }

    // Step 1: Determine user-specified config from .eslintrc.* and package.json files
    if (this.useEslintrc) {
        debug("Using .eslintrc and package.json files");
        userConfig = getLocalConfig(this, directory);
    } else {
        debug("Not using .eslintrc or package.json files");
        userConfig = {};
    }

    // Step 2: Create a copy of the baseConfig
    config = _configOps2.default.merge({}, this.baseConfig);

    // Step 3: Merge in the user-specified configuration from .eslintrc and package.json
    config = _configOps2.default.merge(config, userConfig);

    // Step 4: Merge in command line config file
    if (this.useSpecificConfig) {
        debug("Merging command line config file");

        config = _configOps2.default.merge(config, this.useSpecificConfig);
    }

    // Step 5: Merge in command line environments
    debug("Merging command line environment settings");
    config = _configOps2.default.merge(config, { env: this.env });

    // Step 6: Merge in command line rules
    if (this.options.rules) {
        debug("Merging command line rules");
        config = _configOps2.default.merge(config, { rules: this.options.rules });
    }

    // Step 7: Merge in command line globals
    config = _configOps2.default.merge(config, { globals: this.globals });

    // Only override parser if it is passed explicitly through the command line or if it's not
    // defined yet (because the final object will at least have the parser key)
    if (this.parser || !config.parser) {
        config = _configOps2.default.merge(config, {
            parser: this.parser
        });
    }

    if (this.parserOptions) {
        config = _configOps2.default.merge(config, {
            parserOptions: this.parserOptions
        });
    }

    // Step 8: Merge in command line plugins
    if (this.options.plugins) {
        debug("Merging command line plugins");
        _plugins2.default.loadAll(this.options.plugins);
        config = _configOps2.default.merge(config, { plugins: this.options.plugins });
    }

    // Step 9: Apply environments to the config if present
    if (config.env) {
        config = _configOps2.default.applyEnvironments(config);
    }

    this.cache[directory] = config;

    return config;
};

/**
 * Find local config files from directory and parent directories.
 * @param {string} directory The directory to start searching from.
 * @returns {string[]} The paths of local config files found.
 */
Config.prototype.findLocalConfigFiles = function (directory) {

    if (!this.localConfigFinder) {
        this.localConfigFinder = new _fileFinder2.default(_configFile2.default.CONFIG_FILES, this.options.cwd);
    }

    return this.localConfigFinder.findAllInDirectoryAndParents(directory);
};
module.exports = exports.default;
