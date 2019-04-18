"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _eslint = require("./eslint");

var _eslint2 = _interopRequireDefault(_eslint);

var _cliEngine = require("./cli-engine");

var _cliEngine2 = _interopRequireDefault(_cliEngine);

var _sourceCode = require("./util/source-code");

var _sourceCode2 = _interopRequireDefault(_sourceCode);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Expose out ESLint and CLI to require.
 * @author Ian Christian Myers
 */

"use strict";

exports.default = {
    linter: _eslint2.default,
    CLIEngine: _cliEngine2.default,
    RuleTester: require("./testers/rule-tester"),
    SourceCode: _sourceCode2.default
};
;
module.exports = exports.default;
