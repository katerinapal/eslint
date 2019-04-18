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
 * @fileoverview Disallow Labeled Statements
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow labeled statements",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                allowLoop: {
                    type: "boolean"
                },
                allowSwitch: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var options = context.options[0];
        var allowLoop = Boolean(options && options.allowLoop);
        var allowSwitch = Boolean(options && options.allowSwitch);
        var scopeInfo = null;

        /**
         * Gets the kind of a given node.
         *
         * @param {ASTNode} node - A node to get.
         * @returns {string} The kind of the node.
         */
        function getBodyKind(node) {
            if (_astUtils2.default.isLoop(node)) {
                return "loop";
            }
            if (node.type === "SwitchStatement") {
                return "switch";
            }
            return "other";
        }

        /**
         * Checks whether the label of a given kind is allowed or not.
         *
         * @param {string} kind - A kind to check.
         * @returns {boolean} `true` if the kind is allowed.
         */
        function isAllowed(kind) {
            switch (kind) {
                case "loop":
                    return allowLoop;
                case "switch":
                    return allowSwitch;
                default:
                    return false;
            }
        }

        /**
         * Checks whether a given name is a label of a loop or not.
         *
         * @param {string} label - A name of a label to check.
         * @returns {boolean} `true` if the name is a label of a loop.
         */
        function getKind(label) {
            var info = scopeInfo;

            while (info) {
                if (info.label === label) {
                    return info.kind;
                }
                info = info.upper;
            }

            /* istanbul ignore next: syntax error */
            return "other";
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            LabeledStatement: function LabeledStatement(node) {
                scopeInfo = {
                    label: node.label.name,
                    kind: getBodyKind(node.body),
                    upper: scopeInfo
                };
            },
            "LabeledStatement:exit": function LabeledStatementExit(node) {
                if (!isAllowed(scopeInfo.kind)) {
                    context.report({
                        node: node,
                        message: "Unexpected labeled statement."
                    });
                }

                scopeInfo = scopeInfo.upper;
            },
            BreakStatement: function BreakStatement(node) {
                if (node.label && !isAllowed(getKind(node.label.name))) {
                    context.report({
                        node: node,
                        message: "Unexpected label in break statement."
                    });
                }
            },
            ContinueStatement: function ContinueStatement(node) {
                if (node.label && !isAllowed(getKind(node.label.name))) {
                    context.report({
                        node: node,
                        message: "Unexpected label in continue statement."
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
