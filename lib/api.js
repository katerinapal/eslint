import eslint_moduleDefault from "./eslint";
import cliengine_moduleDefault from "./cli-engine";
import utilsourcecode_moduleDefault from "./util/source-code";
/**
 * @fileoverview Expose out ESLint and CLI to require.
 * @author Ian Christian Myers
 */

"use strict";

export default {
    linter: eslint_moduleDefault,
    CLIEngine: cliengine_moduleDefault,
    RuleTester: require("./testers/rule-tester"),
    SourceCode: utilsourcecode_moduleDefault
};;
