"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Rule to require object keys to be sorted
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var naturalCompare = require("natural-compare");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Gets the property name of the given `Property` node.
 *
 * - If the property's key is an `Identifier` node, this returns the key's name
 *   whether it's a computed property or not.
 * - If the property has a static name, this returns the static name.
 * - Otherwise, this returns null.
 *
 * @param {ASTNode} node - The `Property` node to get.
 * @returns {string|null} The property name or null.
 * @private
 */
function getPropertyName(node) {
    return _astUtils2.default.getStaticPropertyName(node) || node.key.name || null;
}

/**
 * Functions which check that the given 2 names are in specific order.
 *
 * Postfix `I` is meant insensitive.
 * Postfix `N` is meant natual.
 *
 * @private
 */
var isValidOrders = {
    asc: function asc(a, b) {
        return a <= b;
    },
    ascI: function ascI(a, b) {
        return a.toLowerCase() <= b.toLowerCase();
    },
    ascN: function ascN(a, b) {
        return naturalCompare(a, b) <= 0;
    },
    ascIN: function ascIN(a, b) {
        return naturalCompare(a.toLowerCase(), b.toLowerCase()) <= 0;
    },
    desc: function desc(a, b) {
        return isValidOrders.asc(b, a);
    },
    descI: function descI(a, b) {
        return isValidOrders.ascI(b, a);
    },
    descN: function descN(a, b) {
        return isValidOrders.ascN(b, a);
    },
    descIN: function descIN(a, b) {
        return isValidOrders.ascIN(b, a);
    }
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require object keys to be sorted",
            category: "Stylistic Issues",
            recommended: false
        },
        schema: [{
            enum: ["asc", "desc"]
        }, {
            type: "object",
            properties: {
                caseSensitive: {
                    type: "boolean"
                },
                natural: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        // Parse options.
        var order = context.options[0] || "asc";
        var options = context.options[1];
        var insensitive = (options && options.caseSensitive) === false;
        var natual = Boolean(options && options.natural);
        var isValidOrder = isValidOrders[order + (insensitive ? "I" : "") + (natual ? "N" : "")];

        // The stack to save the previous property's name for each object literals.
        var stack = null;

        return {
            ObjectExpression: function ObjectExpression() {
                stack = {
                    upper: stack,
                    prevName: null
                };
            },
            "ObjectExpression:exit": function ObjectExpressionExit() {
                stack = stack.upper;
            },
            Property: function Property(node) {
                if (node.parent.type === "ObjectPattern") {
                    return;
                }

                var prevName = stack.prevName;
                var thisName = getPropertyName(node);

                stack.prevName = thisName || prevName;

                if (!prevName || !thisName) {
                    return;
                }

                if (!isValidOrder(prevName, thisName)) {
                    context.report({
                        node: node,
                        loc: node.key.loc,
                        message: "Expected object keys to be in {{natual}}{{insensitive}}{{order}}ending order. '{{thisName}}' should be before '{{prevName}}'.",
                        data: {
                            thisName: thisName,
                            prevName: prevName,
                            order: order,
                            insensitive: insensitive ? "insensitive " : "",
                            natual: natual ? "natural " : ""
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
