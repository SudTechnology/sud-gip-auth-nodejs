/**
 * 错误码信息定义
 */
class ErrorCodeEnum {
    static SUCCESS = [0, "成功"];
    static TOKEN_CREATE_FAILED = [1001, "Token创建失败"];
    static TOKEN_VERIFY_FAILED = [1002, "Token校验失败"];
    static TOKEN_DECODE_FAILED = [1003, "Token解析失败"];
    static TOKEN_INVALID = [1004, "Token非法"];
    static TOKEN_EXPIRED = [1005, "Token过期"];
    static APP_DATA_INVALID = [1101, "App数据非法"];
    static UNDEFINE = [9999, "未知错误"];

    static getMessage(code) {
        const constants = Object.values(ErrorCodeEnum);
        for (const constant of constants) {
            if (Array.isArray(constant) && constant[0] === code) {
                return constant[1];
            }
        }
        return null;
    }
}

module.exports = ErrorCodeEnum;