/**
 * SDK Token响应类
 */
class SdkTokenResponse {
    /**
     * @param {string} token
     * @param {number} expireDate
     */
    constructor(token, expireDate) {
        this.token = token;
        this.expireDate = expireDate;
    }
}

module.exports = SdkTokenResponse;