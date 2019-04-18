"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _environments = require("../../conf/environments");

var _environments2 = _interopRequireDefault(_environments);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Environments manager
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var environments = new Map();

/**
 * Loads the default environments.
 * @returns {void}
 * @private
 */
function load() {
    Object.keys(_environments2.default).forEach(function (envName) {
        environments.set(envName, _environments2.default[envName]);
    });
}

// always load default environments upfront
load();

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = {

    load: load,

    /**
     * Gets the environment with the given name.
     * @param {string} name The name of the environment to retrieve.
     * @returns {Object?} The environment object or null if not found.
     */
    get: function get(name) {
        return environments.get(name) || null;
    },

    /**
     * Defines an environment.
     * @param {string} name The name of the environment.
     * @param {Object} env The environment settings.
     * @returns {void}
     */
    define: function define(name, env) {
        environments.set(name, env);
    },

    /**
     * Imports all environments from a plugin.
     * @param {Object} plugin The plugin object.
     * @param {string} pluginName The name of the plugin.
     * @returns {void}
     */
    importPlugin: function importPlugin(plugin, pluginName) {
        if (plugin.environments) {
            Object.keys(plugin.environments).forEach(function (envName) {
                this.define(pluginName + "/" + envName, plugin.environments[envName]);
            }, this);
        }
    },

    /**
     * Resets all environments. Only use for tests!
     * @returns {void}
     */
    testReset: function testReset() {
        environments = new Map();
        load();
    }
};
;
module.exports = exports.default;
