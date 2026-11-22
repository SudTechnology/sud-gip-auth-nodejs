
/**
 * 认证码类
 */
class SudCode {
    /**
     * @param {string} code
     * @param {number} expireDate
     */
    constructor(code, expireDate) {
        this.code = code;
        this.expireDate = expireDate;
    }

    /**
     * @param {SdkTokenResponse} sdkTokenResponse
     * @returns {SudCode}
     */
    static createBySdkTokenResponse(sdkTokenResponse) {
        return new SudCode(sdkTokenResponse.token, sdkTokenResponse.expireDate);
    }
}

module.exports = SudCode;
