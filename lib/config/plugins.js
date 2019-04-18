"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _environments = require("./environments");

var _environments2 = _interopRequireDefault(_environments);

var _rules = require("../rules");

var _rules2 = _interopRequireDefault(_rules);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Plugins manager
 * @author Nicholas C. Zakas
 */
"use strict";

var debug = require("debug")("eslint:plugins");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var plugins = Object.create(null);

var PLUGIN_NAME_PREFIX = "eslint-plugin-",
    NAMESPACE_REGEX = /^@.*\//i;

/**
 * Removes the prefix `eslint-plugin-` from a plugin name.
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugin without prefix.
 */
function removePrefix(pluginName) {
    return pluginName.indexOf(PLUGIN_NAME_PREFIX) === 0 ? pluginName.substring(PLUGIN_NAME_PREFIX.length) : pluginName;
}

/**
 * Gets the scope (namespace) of a plugin.
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugins namepace if it has one.
 */
function getNamespace(pluginName) {
    return pluginName.match(NAMESPACE_REGEX) ? pluginName.match(NAMESPACE_REGEX)[0] : "";
}

/**
 * Removes the namespace from a plugin name.
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugin without the namespace.
 */
function removeNamespace(pluginName) {
    return pluginName.replace(NAMESPACE_REGEX, "");
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = {

    removePrefix: removePrefix,
    getNamespace: getNamespace,
    removeNamespace: removeNamespace,

    /**
     * Defines a plugin with a given name rather than loading from disk.
     * @param {string} pluginName The name of the plugin to load.
     * @param {Object} plugin The plugin object.
     * @returns {void}
     */
    define: function define(pluginName, plugin) {
        var pluginNamespace = getNamespace(pluginName),
            pluginNameWithoutNamespace = removeNamespace(pluginName),
            pluginNameWithoutPrefix = removePrefix(pluginNameWithoutNamespace),
            shortName = pluginNamespace + pluginNameWithoutPrefix;

        // load up environments and rules
        plugins[shortName] = plugin;
        _environments2.default.importPlugin(plugin, shortName);
        _rules2.default.importPlugin(plugin, shortName);

        // load up environments and rules for the name that '@scope/' was omitted
        // 3 lines below will be removed by 4.0.0
        plugins[pluginNameWithoutPrefix] = plugin;
        _environments2.default.importPlugin(plugin, pluginNameWithoutPrefix);
        _rules2.default.importPlugin(plugin, pluginNameWithoutPrefix);
    },

    /**
     * Gets a plugin with the given name.
     * @param {string} pluginName The name of the plugin to retrieve.
     * @returns {Object} The plugin or null if not loaded.
     */
    get: function get(pluginName) {
        return plugins[pluginName] || null;
    },

    /**
     * Returns all plugins that are loaded.
     * @returns {Object} The plugins cache.
     */
    getAll: function getAll() {
        return plugins;
    },

    /**
     * Loads a plugin with the given name.
     * @param {string} pluginName The name of the plugin to load.
     * @returns {void}
     * @throws {Error} If the plugin cannot be loaded.
     */
    load: function load(pluginName) {
        var pluginNamespace = getNamespace(pluginName),
            pluginNameWithoutNamespace = removeNamespace(pluginName),
            pluginNameWithoutPrefix = removePrefix(pluginNameWithoutNamespace),
            shortName = pluginNamespace + pluginNameWithoutPrefix,
            longName = pluginNamespace + PLUGIN_NAME_PREFIX + pluginNameWithoutPrefix;
        var plugin = null;

        if (pluginName.match(/\s+/)) {
            var whitespaceError = new Error("Whitespace found in plugin name '" + pluginName + "'");

            whitespaceError.messageTemplate = "whitespace-found";
            whitespaceError.messageData = {
                pluginName: longName
            };
            throw whitespaceError;
        }

        if (!plugins[shortName]) {
            try {
                plugin = require(longName);
            } catch (err) {
                debug("Failed to load plugin " + longName + ".");
                err.message = "Failed to load plugin " + pluginName + ": " + err.message;
                err.messageTemplate = "plugin-missing";
                err.messageData = {
                    pluginName: longName
                };
                throw err;
            }

            this.define(pluginName, plugin);
        }
    },

    /**
     * Loads all plugins from an array.
     * @param {string[]} pluginNames An array of plugins names.
     * @returns {void}
     * @throws {Error} If a plugin cannot be loaded.
     */
    loadAll: function loadAll(pluginNames) {
        pluginNames.forEach(this.load, this);
    },

    /**
     * Resets plugin information. Use for tests only.
     * @returns {void}
     */
    testReset: function testReset() {
        plugins = Object.create(null);
    }
};
;
module.exports = exports.default;
