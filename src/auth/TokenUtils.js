const jwt = require('jsonwebtoken');
const ErrorCodeEnum = require('./ErrorCodeEnum');

/**
 * Token工具类
 */
class TokenUtils {
    static UID_KEY = "uid";
    static APP_ID_KEY = "app_id";

    /**
     * 生成Token
     *
     * @param {string} appId 应用ID
     * @param {string} appSecret 应用密钥
     * @param {string} uid 用户ID
     * @param {number} expireDuration 过期时长（毫秒）
     * @returns {SdkTokenResponse}
     */
    static token(appId, appSecret, uid, expireDuration) {
        const claimMap = {
            [this.UID_KEY]: uid,
            [this.APP_ID_KEY]: appId
        };
        return this.doCreateToken(appSecret, claimMap, expireDuration);
    }

    /**
     * 创建Token
     *
     * @param {string} appSecret 应用密钥
     * @param {object} claimMap 声明映射
     * @param {number} expireDuration 过期时长（毫秒）
     * @returns {SdkTokenResponse}
     */
    static doCreateToken(appSecret, claimMap, expireDuration) {
        try {
            const SdkTokenResponse = require('../api/SdkTokenResponse');
            const expireDate = Math.floor(Date.now() / 1000) + (expireDuration / 1000);
            const payload = { ...claimMap, exp: expireDate };

            const token = jwt.sign(payload, appSecret, {
                algorithm: 'HS256',
                header: { typ: 'JWT', alg: 'HS256' }
            });

            console.log(`Generated Token: ${token}`);
            return new SdkTokenResponse(token, expireDate * 1000);
        } catch (e) {
            console.error(`Token generation failed: ${e.message}`);
            return null;
        }
    }

    /**
     * 验证Token
     *
     * @param {string} token Token
     * @param {string} appSecret 应用密钥
     * @returns {array} 错误码和消息
     */
    static verify(token, appSecret) {
        if (!token) {
            return ErrorCodeEnum.TOKEN_INVALID;
        }
        if (!appSecret) {
            return ErrorCodeEnum.APP_DATA_INVALID;
        }

        try {
            this.doVerify(token, appSecret);
            return ErrorCodeEnum.SUCCESS;
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                return ErrorCodeEnum.TOKEN_EXPIRED;
            }
            return ErrorCodeEnum.TOKEN_VERIFY_FAILED;
        }
    }

    /**
     * 执行Token验证
     *
     * @param {string} token Token
     * @param {string} appSecret 应用密钥
     * @throws {Error}
     */
    static doVerify(token, appSecret) {
        try {
            const decoded = jwt.verify(token, appSecret, { algorithms: ['HS256'] });
            console.log(`Decoded Token: ${JSON.stringify(decoded)}`);
            return decoded;
        } catch (e) {
            console.error(`Token verification failed: ${e.message}`);
            throw e;
        }
    }

    /**
     * 从Token获取UID
     *
     * @param {string} token Token
     * @param {string} appSecret 应用密钥
     * @returns {string|null} UID
     */
    static getUID(token, appSecret) {
        return this.doGetValueFromToken(token, this.UID_KEY, appSecret);
    }

    /**
     * 从Token获取AppID
     *
     * @param {string} token Token
     * @param {string} appSecret 应用密钥
     * @returns {string|null} AppID
     */
    static getAppID(token, appSecret) {
        return this.doGetValueFromToken(token, this.APP_ID_KEY, appSecret);
    }

    /**
     * 从Token获取值
     *
     * @param {string} token Token
     * @param {string} key 键
     * @param {string} appSecret 应用密钥
     * @returns {string|null} 值
     */
    static doGetValueFromToken(token, key, appSecret) {
        try {
            const decoded = jwt.verify(token, appSecret, { algorithms: ['HS256'] });
            console.log(`Decoded token claims: ${JSON.stringify(decoded)}`);
            return decoded[key] || null;
        } catch (e) {
            console.error(`Failed to decode token: ${e.message}`);
            throw e;
        }
    }
}

module.exports = TokenUtils;