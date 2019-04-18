import load from "../lib/load-rules";
import rules from "../lib/rules";
/**
 * @fileoverview Config to enable all rules.
 * @author Robert Fletcher
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const enabledRules = Object.keys(load()).reduce((result, ruleId) => {
    if (!rules.get(ruleId).meta.deprecated) {
        result[ruleId] = "error";
    }
    return result;
}, {});

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

export default { rules: enabledRules };;
