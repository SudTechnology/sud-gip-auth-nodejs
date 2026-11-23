const SudCode = require('./SudCode');
const SudSSToken = require('./SudSSToken');
const SudUid = require('./SudUid');
const TokenUtils = require('../auth/TokenUtils');

/**
 * GIP认证工具类
 */
class SudGIPAuth {
    static DEFAULT_MAX_CODE_EXPIRE_DURATION = 2 * 60 * 60 * 1000; // 2小时
    static DEFAULT_MIN_CODE_EXPIRE_DURATION = 30 * 60 * 1000; // 30分钟
    static DEFAULT_MIN_SSTOKEN_EXPIRE_DURATION = 2 * 60 * 60 * 1000; // 2小时

    /**
     * @param {string} appId
     * @param {string} appSecret
     */
    constructor(appId, appSecret) {
        TokenUtils.requireString(appId, 'appId');
        TokenUtils.requireString(appSecret, 'appSecret');
        this.appId = appId;
        this.appSecret = appSecret;
    }

    /**
     * 获取认证码
     *
     * @param {string} uid 用户ID
     * @param {number|null} expireDuration 过期时长（毫秒）
     * @returns {SudCode}
     */
    getCode(uid, expireDuration = null) {
        if (expireDuration !== null) {
            TokenUtils.validateDuration(expireDuration);
        }
        if (expireDuration === null) {
            expireDuration = SudGIPAuth.DEFAULT_MAX_CODE_EXPIRE_DURATION;
        } else if (expireDuration < SudGIPAuth.DEFAULT_MIN_CODE_EXPIRE_DURATION) {
            expireDuration = SudGIPAuth.DEFAULT_MIN_CODE_EXPIRE_DURATION;
        }

        const sdkTokenResponse = TokenUtils.token(
            this.appId,
            this.appSecret,
            uid,
            expireDuration
        );
        return SudCode.createBySdkTokenResponse(sdkTokenResponse);
    }

    /**
     * 获取服务器到服务器Token
     *
     * @param {string} uid 用户ID
     * @param {number|null} expireDuration 过期时长（毫秒）
     * @returns {SudSSToken}
     */
    getSSToken(uid, expireDuration = null) {
        if (expireDuration !== null) {
            TokenUtils.validateDuration(expireDuration);
        }
        if (expireDuration === null) {
            expireDuration = SudGIPAuth.DEFAULT_MIN_SSTOKEN_EXPIRE_DURATION;
        } else if (expireDuration < SudGIPAuth.DEFAULT_MIN_SSTOKEN_EXPIRE_DURATION) {
            expireDuration = SudGIPAuth.DEFAULT_MIN_SSTOKEN_EXPIRE_DURATION;
        }

        const sdkTokenResponse = TokenUtils.token(
            this.appId,
            this.appSecret,
            uid,
            expireDuration
        );
        return SudSSToken.createBySdkTokenResponse(sdkTokenResponse);
    }

    /**
     * 通过认证码获取用户ID
     *
     * @param {string} code 认证码
     * @returns {SudUid}
     */
    getUidByCode(code) {
        return this.getSdkUidResponse(code);
    }

    /**
     * 通过SSToken获取用户ID
     *
     * @param {string} ssToken SSToken
     * @returns {SudUid}
     */
    getUidBySSToken(ssToken) {
        return this.getSdkUidResponse(ssToken);
    }

    /**
     * 验证认证码
     *
     * @param {string} code 认证码
     * @returns {array} 错误码和消息
     */
    verifyCode(code) {
        return TokenUtils.verify(code, this.appSecret);
    }

    /**
     * 验证SSToken
     *
     * @param {string} token SSToken
     * @returns {array} 错误码和消息
     */
    verifySSToken(token) {
        return TokenUtils.verify(token, this.appSecret);
    }

    /**
     * 获取用户ID响应
     *
     * @param {string} token 认证码或SSToken
     * @returns {SudUid}
     */
    getSdkUidResponse(token) {
        const resp = new SudUid();
        const result = TokenUtils.verifyAndDecode(token, this.appSecret);
        resp.errorCode = result.error[0];
        resp.isSuccess = resp.errorCode === 0;
        if (resp.isSuccess) {
            resp.uid = result.payload.uid;
        }
        return resp;
    }
}

module.exports = SudGIPAuth;

// Additive named export; the default SudGIPAuth constructor remains compatible.
module.exports.RequestSigner = require('./RequestSigner');
