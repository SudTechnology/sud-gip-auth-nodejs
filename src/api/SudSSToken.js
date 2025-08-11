const SdkTokenResponse = require('./SdkTokenResponse');

/**
 * 服务器到服务器Token类
 */
class SudSSToken {
    /**
     * @param {string} token
     * @param {number} expireDate
     */
    constructor(token, expireDate) {
        this.token = token;
        this.expireDate = expireDate;
    }

    /**
     * @param {SdkTokenResponse} sdkTokenResponse
     * @returns {SudSSToken}
     */
    static createBySdkTokenResponse(sdkTokenResponse) {
        return new SudSSToken(sdkTokenResponse.token, sdkTokenResponse.expireDate);
    }
}

module.exports = SudSSToken;