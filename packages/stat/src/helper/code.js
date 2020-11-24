const Result = require('../lib/result')
module.exports = {
    SUCCESS:(()=>new Result(0, '', null))(),
    CHECK_AUTHENTIUCATED_FAIL: (() => new Result(-1, 'CheckAuthenticated Fail', null))(),
    PROJECT_NAME_EMPTY: (() => new Result(-2, "Project Name Empty!"))(),
    PROJECT_NAME_ERROR: (() => new Result(-3, "Project Name Error!"))(),
    CHAIN_ERROR: (() => new Result(-4, 'Chain Error!'))(),
    OUT_OF_LIMIT: (() => new Result(-5, "Out Of Limit!"))(),
    PROJECT_NOT_ACTIVE: (() => new Result(-6, "NotActive!"))(),
    RPC_ERROR: (() => new Result(-7, "RPC Error!"))(),
    PROJECT_ERROR: (() => new Result(-8, "Project  Error!"))(),
    NO_ACCESS_ALLOWED: (() => new Result(-9, "No Access Allowed!"))(),
    BLACK_UID:(() => new Result(-10, "Black Uid!"))()
}