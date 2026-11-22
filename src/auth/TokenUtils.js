const jwt = require('jsonwebtoken');
const ErrorCodeEnum = require('./ErrorCodeEnum');
const SdkTokenResponse = require('../api/SdkTokenResponse');

/** JWT signing and validation. Never log credentials, tokens, or decoded claims. */
class TokenUtils {
    static UID_KEY = 'uid';
    static APP_ID_KEY = 'app_id';

    static requireString(value, name) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new TypeError(`${name} must be a non-empty string`);
        }
    }

    static validateDuration(duration) {
        if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
            throw new RangeError('expireDuration must be a positive finite number of milliseconds');
        }
        if (!Number.isSafeInteger(Math.ceil(Date.now() + duration))) {
            throw new RangeError('expireDuration exceeds the supported timestamp range');
        }
    }

    static token(appId, appSecret, uid, expireDuration) {
        this.requireString(appId, 'appId');
        this.requireString(appSecret, 'appSecret');
        this.requireString(uid, 'uid');
        this.validateDuration(expireDuration);
        return this.doCreateToken(appSecret, { uid, app_id: appId }, expireDuration);
    }

    static doCreateToken(appSecret, claimMap, expireDuration) {
        this.validateDuration(expireDuration);
        const exp = Math.floor(Date.now() / 1000) + expireDuration / 1000;
        try {
            const token = jwt.sign({ ...claimMap, exp }, appSecret, {
                algorithm: 'HS256',
                header: { typ: 'JWT', alg: 'HS256' }
            });
            return new SdkTokenResponse(token, exp * 1000);
        } catch (cause) {
            const error = new Error('Token creation failed');
            error.errorCode = ErrorCodeEnum.TOKEN_CREATE_FAILED[0];
            error.cause = cause;
            throw error;
        }
    }

    /** Verify once and retain the authenticated payload for UID extraction. */
    static verifyAndDecode(token, appSecret) {
        if (typeof token !== 'string' || !token.trim()) {
            return { error: ErrorCodeEnum.TOKEN_INVALID };
        }
        if (typeof appSecret !== 'string' || !appSecret.trim()) {
            return { error: ErrorCodeEnum.APP_DATA_INVALID };
        }
        try {
            return { error: ErrorCodeEnum.SUCCESS, payload: this.doVerify(token, appSecret) };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { error: ErrorCodeEnum.TOKEN_EXPIRED };
            }
            return { error: error.invalidClaims
                ? ErrorCodeEnum.TOKEN_INVALID : ErrorCodeEnum.TOKEN_VERIFY_FAILED };
        }
    }

    static verify(token, appSecret) {
        return this.verifyAndDecode(token, appSecret).error;
    }

    static doVerify(token, appSecret) {
        const payload = jwt.verify(token, appSecret, { algorithms: ['HS256'] });
        // A valid signature alone does not establish a usable SDK identity.
        if (!payload || typeof payload !== 'object'
            || typeof payload.uid !== 'string' || !payload.uid.trim()
            || typeof payload.app_id !== 'string' || !payload.app_id.trim()
            || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
            const error = new Error('Token is missing valid required claims');
            error.invalidClaims = true;
            throw error;
        }
        return payload;
    }

    static getUID(token, appSecret) {
        return this.doGetValueFromToken(token, this.UID_KEY, appSecret);
    }

    static getAppID(token, appSecret) {
        return this.doGetValueFromToken(token, this.APP_ID_KEY, appSecret);
    }

    static doGetValueFromToken(token, key, appSecret) {
        return this.doVerify(token, appSecret)[key] || null;
    }
}

module.exports = TokenUtils;
