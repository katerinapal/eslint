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

var _rules = require("../rules");

var _rules2 = _interopRequireDefault(_rules);

var _environments = require("./environments");

var _environments2 = _interopRequireDefault(_environments);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Validates configs.
 * @author Brandon Mills
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var schemaValidator = require("is-my-json-valid"),
    util = require("util");

var validators = {
    rules: Object.create(null)
};

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * Gets a complete options schema for a rule.
 * @param {string} id The rule's unique name.
 * @returns {Object} JSON Schema for the rule's options.
 */
function getRuleOptionsSchema(id) {
    var rule = _rules2.default.get(id),
        schema = rule && rule.schema || rule && rule.meta && rule.meta.schema;

    // Given a tuple of schemas, insert warning level at the beginning
    if (Array.isArray(schema)) {
        if (schema.length) {
            return {
                type: "array",
                items: schema,
                minItems: 0,
                maxItems: schema.length
            };
        } else {
            return {
                type: "array",
                minItems: 0,
                maxItems: 0
            };
        }
    }

    // Given a full schema, leave it alone
    return schema || null;
}

/**
 * Validates a rule's options against its schema.
 * @param {string} id The rule's unique name.
 * @param {array|number} options The given options for the rule.
 * @param {string} source The name of the configuration source.
 * @returns {void}
 */
function validateRuleOptions(id, options, source) {
    var schema = getRuleOptionsSchema(id);
    var validateRule = validators.rules[id],
        severity = void 0,
        localOptions = void 0,
        validSeverity = true;

    if (!validateRule && schema) {
        validateRule = schemaValidator(schema, { verbose: true });
        validators.rules[id] = validateRule;
    }

    // if it's not an array, it should be just a severity
    if (Array.isArray(options)) {
        localOptions = options.concat(); // clone
        severity = localOptions.shift();
    } else {
        severity = options;
        localOptions = [];
    }

    validSeverity = severity === 0 || severity === 1 || severity === 2 || typeof severity === "string" && /^(?:off|warn|error)$/i.test(severity);

    if (validateRule) {
        validateRule(localOptions);
    }

    if (validateRule && validateRule.errors || !validSeverity) {
        var message = [source, ":\n", "\tConfiguration for rule \"", id, "\" is invalid:\n"];

        if (!validSeverity) {
            message.push("\tSeverity should be one of the following: 0 = off, 1 = warn, 2 = error (you passed '", util.inspect(severity).replace(/'/g, "\"").replace(/\n/g, ""), "').\n");
        }

        if (validateRule && validateRule.errors) {
            validateRule.errors.forEach(function (error) {
                message.push("\tValue \"", error.value, "\" ", error.message, ".\n");
            });
        }

        throw new Error(message.join(""));
    }
}

/**
 * Validates an environment object
 * @param {Object} environment The environment config object to validate.
 * @param {string} source The location to report with any errors.
 * @returns {void}
 */
function validateEnvironment(environment, source) {

    // not having an environment is ok
    if (!environment) {
        return;
    }

    if (Array.isArray(environment)) {
        throw new Error("Environment must not be an array");
    }

    if ((typeof environment === "undefined" ? "undefined" : _typeof(environment)) === "object") {
        Object.keys(environment).forEach(function (env) {
            if (!_environments2.default.get(env)) {
                var message = [source, ":\n", "\tEnvironment key \"", env, "\" is unknown\n"];

                throw new Error(message.join(""));
            }
        });
    } else {
        throw new Error("Environment must be an object");
    }
}

/**
 * Validates an entire config object.
 * @param {Object} config The config object to validate.
 * @param {string} source The location to report with any errors.
 * @returns {void}
 */
function validate(config, source) {

    if (_typeof(config.rules) === "object") {
        Object.keys(config.rules).forEach(function (id) {
            validateRuleOptions(id, config.rules[id], source);
        });
    }

    validateEnvironment(config.env, source);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = {
    getRuleOptionsSchema: getRuleOptionsSchema,
    validate: validate,
    validateRuleOptions: validateRuleOptions
};
;
module.exports = exports.default;
