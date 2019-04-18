"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

/**
 * @fileoverview Rule to flag use of duplicate keys in an object.
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var GET_KIND = /^(?:init|get)$/;
var SET_KIND = /^(?:init|set)$/;

/**
 * The class which stores properties' information of an object.
 */

var ObjectInfo = function () {

    /**
     * @param {ObjectInfo|null} upper - The information of the outer object.
     * @param {ASTNode} node - The ObjectExpression node of this information.
     */
    function ObjectInfo(upper, node) {
        _classCallCheck(this, ObjectInfo);

        this.upper = upper;
        this.node = node;
        this.properties = new Map();
    }

    /**
     * Gets the information of the given Property node.
     * @param {ASTNode} node - The Property node to get.
     * @returns {{get: boolean, set: boolean}} The information of the property.
     */

    _createClass(ObjectInfo, [{
        key: "getPropertyInfo",
        value: function getPropertyInfo(node) {
            var name = _astUtils2.default.getStaticPropertyName(node);

            if (!this.properties.has(name)) {
                this.properties.set(name, { get: false, set: false });
            }
            return this.properties.get(name);
        }

        /**
         * Checks whether the given property has been defined already or not.
         * @param {ASTNode} node - The Property node to check.
         * @returns {boolean} `true` if the property has been defined.
         */

    }, {
        key: "isPropertyDefined",
        value: function isPropertyDefined(node) {
            var entry = this.getPropertyInfo(node);

            return GET_KIND.test(node.kind) && entry.get || SET_KIND.test(node.kind) && entry.set;
        }

        /**
         * Defines the given property.
         * @param {ASTNode} node - The Property node to define.
         * @returns {void}
         */

    }, {
        key: "defineProperty",
        value: function defineProperty(node) {
            var entry = this.getPropertyInfo(node);

            if (GET_KIND.test(node.kind)) {
                entry.get = true;
            }
            if (SET_KIND.test(node.kind)) {
                entry.set = true;
            }
        }
    }]);

    return ObjectInfo;
}();

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow duplicate keys in object literals",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {
        var info = null;

        return {
            ObjectExpression: function ObjectExpression(node) {
                info = new ObjectInfo(info, node);
            },
            "ObjectExpression:exit": function ObjectExpressionExit() {
                info = info.upper;
            },
            Property: function Property(node) {
                var name = _astUtils2.default.getStaticPropertyName(node);

                // Skip destructuring.
                if (node.parent.type !== "ObjectExpression") {
                    return;
                }

                // Skip if the name is not static.
                if (!name) {
                    return;
                }

                // Reports if the name is defined already.
                if (info.isPropertyDefined(node)) {
                    context.report({
                        node: info.node,
                        loc: node.key.loc,
                        message: "Duplicate key '{{name}}'.",
                        data: { name: name }
                    });
                }

                // Update info.
                info.defineProperty(node);
            }
        };
    }
};
;
module.exports = exports.default;
