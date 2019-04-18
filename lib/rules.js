"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loadRules = require("./load-rules");

var _loadRules2 = _interopRequireDefault(_loadRules);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Defines a storage for rules.
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Privates
//------------------------------------------------------------------------------

var rules = Object.create(null);

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Registers a rule module for rule id in storage.
 * @param {string} ruleId Rule id (file name).
 * @param {Function} ruleModule Rule handler.
 * @returns {void}
 */
function define(ruleId, ruleModule) {
    rules[ruleId] = ruleModule;
}

/**
 * Loads and registers all rules from passed rules directory.
 * @param {string} [rulesDir] Path to rules directory, may be relative. Defaults to `lib/rules`.
 * @param {string} cwd Current working directory
 * @returns {void}
 */
function load(rulesDir, cwd) {
    var newRules = (0, _loadRules2.default)(rulesDir, cwd);

    Object.keys(newRules).forEach(function (ruleId) {
        define(ruleId, newRules[ruleId]);
    });
}

/**
 * Registers all given rules of a plugin.
 * @param {Object} plugin The plugin object to import.
 * @param {string} pluginName The name of the plugin without prefix (`eslint-plugin-`).
 * @returns {void}
 */
function importPlugin(plugin, pluginName) {
    if (plugin.rules) {
        Object.keys(plugin.rules).forEach(function (ruleId) {
            var qualifiedRuleId = pluginName + "/" + ruleId,
                rule = plugin.rules[ruleId];

            define(qualifiedRuleId, rule);
        });
    }
}

/**
 * Access rule handler by id (file name).
 * @param {string} ruleId Rule id (file name).
 * @returns {Function} Rule handler.
 */
function getHandler(ruleId) {
    if (typeof rules[ruleId] === "string") {
        return require(rules[ruleId]);
    } else {
        return rules[ruleId];
    }
}

/**
 * Reset rules storage.
 * Should be used only in tests.
 * @returns {void}
 */
function testClear() {
    rules = Object.create(null);
}

exports.default = {
    define: define,
    load: load,
    importPlugin: importPlugin,
    get: getHandler,
    testClear: testClear,

    /**
     * Resets rules to its starting state. Use for tests only.
     * @returns {void}
     */
    testReset: function testReset() {
        testClear();
        load();
    }
};
;

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

// loads built-in rules
load();
module.exports = exports.default;
