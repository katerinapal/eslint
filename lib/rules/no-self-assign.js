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
 * @fileoverview Rule to disallow assignments where both sides are exactly the same
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var SPACES = /\s+/g;

/**
 * Checks whether the property of 2 given member expression nodes are the same
 * property or not.
 *
 * @param {ASTNode} left - A member expression node to check.
 * @param {ASTNode} right - Another member expression node to check.
 * @returns {boolean} `true` if the member expressions have the same property.
 */
function isSameProperty(left, right) {
    if (left.property.type === "Identifier" && left.property.type === right.property.type && left.property.name === right.property.name && left.computed === right.computed) {
        return true;
    }

    var lname = _astUtils2.default.getStaticPropertyName(left);
    var rname = _astUtils2.default.getStaticPropertyName(right);

    return lname !== null && lname === rname;
}

/**
 * Checks whether 2 given member expression nodes are the reference to the same
 * property or not.
 *
 * @param {ASTNode} left - A member expression node to check.
 * @param {ASTNode} right - Another member expression node to check.
 * @returns {boolean} `true` if the member expressions are the reference to the
 *  same property or not.
 */
function isSameMember(left, right) {
    if (!isSameProperty(left, right)) {
        return false;
    }

    var lobj = left.object;
    var robj = right.object;

    if (lobj.type !== robj.type) {
        return false;
    }
    if (lobj.type === "MemberExpression") {
        return isSameMember(lobj, robj);
    }
    return lobj.type === "Identifier" && lobj.name === robj.name;
}

/**
 * Traverses 2 Pattern nodes in parallel, then reports self-assignments.
 *
 * @param {ASTNode|null} left - A left node to traverse. This is a Pattern or
 *      a Property.
 * @param {ASTNode|null} right - A right node to traverse. This is a Pattern or
 *      a Property.
 * @param {boolean} props - The flag to check member expressions as well.
 * @param {Function} report - A callback function to report.
 * @returns {void}
 */
function eachSelfAssignment(left, right, props, report) {
    if (!left || !right) {

        // do nothing
    } else if (left.type === "Identifier" && right.type === "Identifier" && left.name === right.name) {
        report(right);
    } else if (left.type === "ArrayPattern" && right.type === "ArrayExpression") {
        var end = Math.min(left.elements.length, right.elements.length);

        for (var i = 0; i < end; ++i) {
            var rightElement = right.elements[i];

            eachSelfAssignment(left.elements[i], rightElement, props, report);

            // After a spread element, those indices are unknown.
            if (rightElement && rightElement.type === "SpreadElement") {
                break;
            }
        }
    } else if (left.type === "RestElement" && right.type === "SpreadElement") {
        eachSelfAssignment(left.argument, right.argument, props, report);
    } else if (left.type === "ObjectPattern" && right.type === "ObjectExpression" && right.properties.length >= 1) {

        // Gets the index of the last spread property.
        // It's possible to overwrite properties followed by it.
        var startJ = 0;

        for (var _i = right.properties.length - 1; _i >= 0; --_i) {
            if (right.properties[_i].type === "ExperimentalSpreadProperty") {
                startJ = _i + 1;
                break;
            }
        }

        for (var _i2 = 0; _i2 < left.properties.length; ++_i2) {
            for (var j = startJ; j < right.properties.length; ++j) {
                eachSelfAssignment(left.properties[_i2], right.properties[j], props, report);
            }
        }
    } else if (left.type === "Property" && right.type === "Property" && !left.computed && !right.computed && right.kind === "init" && !right.method && left.key.name === right.key.name) {
        eachSelfAssignment(left.value, right.value, props, report);
    } else if (props && left.type === "MemberExpression" && right.type === "MemberExpression" && isSameMember(left, right)) {
        report(right);
    }
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow assignments where both sides are exactly the same",
            category: "Best Practices",
            recommended: true
        },

        schema: [{
            type: "object",
            properties: {
                props: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();
        var options = context.options[0];
        var props = Boolean(options && options.props);

        /**
         * Reports a given node as self assignments.
         *
         * @param {ASTNode} node - A node to report. This is an Identifier node.
         * @returns {void}
         */
        function report(node) {
            context.report({
                node: node,
                message: "'{{name}}' is assigned to itself.",
                data: {
                    name: sourceCode.getText(node).replace(SPACES, "")
                }
            });
        }

        return {
            AssignmentExpression: function AssignmentExpression(node) {
                if (node.operator === "=") {
                    eachSelfAssignment(node.left, node.right, props, report);
                }
            }
        };
    }
};
;
module.exports = exports.default;
