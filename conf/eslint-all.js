"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loadRules = require("../lib/load-rules");

var _loadRules2 = _interopRequireDefault(_loadRules);

var _rules = require("../lib/rules");

var _rules2 = _interopRequireDefault(_rules);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Config to enable all rules.
 * @author Robert Fletcher
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var enabledRules = Object.keys((0, _loadRules2.default)()).reduce(function (result, ruleId) {
    if (!_rules2.default.get(ruleId).meta.deprecated) {
        result[ruleId] = "error";
    }
    return result;
}, {});

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = { rules: enabledRules };
;
module.exports = exports.default;
