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
 * @fileoverview Rule to flag use of an empty block statement
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow empty block statements",
            category: "Possible Errors",
            recommended: true
        },

        schema: [{
            type: "object",
            properties: {
                allowEmptyCatch: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var options = context.options[0] || {},
            allowEmptyCatch = options.allowEmptyCatch || false;

        var sourceCode = context.getSourceCode();

        return {
            BlockStatement: function BlockStatement(node) {

                // if the body is not empty, we can just return immediately
                if (node.body.length !== 0) {
                    return;
                }

                // a function is generally allowed to be empty
                if (_astUtils2.default.isFunction(node.parent)) {
                    return;
                }

                if (allowEmptyCatch && node.parent.type === "CatchClause") {
                    return;
                }

                // any other block is only allowed to be empty, if it contains a comment
                if (sourceCode.getComments(node).trailing.length > 0) {
                    return;
                }

                context.report(node, "Empty block statement.");
            },
            SwitchStatement: function SwitchStatement(node) {

                if (typeof node.cases === "undefined" || node.cases.length === 0) {
                    context.report(node, "Empty switch statement.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
