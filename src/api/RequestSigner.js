const { createHmac, timingSafeEqual } = require('node:crypto');

/** Check metadata without trimming or rewriting the caller's signed values. */
function validMetadata(value) {
    return typeof value === 'string' && value.length > 0 && !/[^\x21-\x7e]/.test(value)
        && !/[",\\]/.test(value);
}

/**
 * Shared Sud HTTP request signing, independent of JWT token authentication.
 * No freshness or replay policy is applied; callers implement those policies.
 */
class RequestSigner {
    /** @param {string} appId Application ID. @param {string} appSecret Original secret. */
    constructor(appId, appSecret) {
        if (!validMetadata(appId)) {
            throw new TypeError('Invalid appId');
        }
        if (typeof appSecret !== 'string' || appSecret.trim() === '') {
            throw new TypeError('Invalid appSecret');
        }
        this.appId = appId;
        this.appSecret = appSecret;
    }

    /**
     * Sign the exact transmitted bytes; strings are encoded as UTF-8 once.
     * Prefer Buffer for received bodies. NEVER parse/re-serialize JSON, trim,
     * normalize line endings, decode/re-encode, or decompress before verification.
     * @param {string} timestamp Timestamp text, preserved exactly.
     * @param {string} nonce Nonce text, preserved exactly.
     * @param {Buffer|string} rawBody Original body; use an empty Buffer for no body.
     * @returns {string} Lowercase hexadecimal HMAC-SHA1 signature.
     */
    generateSignature(timestamp, nonce, rawBody) {
        if (!validMetadata(timestamp) || !validMetadata(nonce)) {
            throw new TypeError('Invalid signature metadata');
        }
        if (!Buffer.isBuffer(rawBody) && typeof rawBody !== 'string') {
            throw new TypeError('rawBody must be a Buffer or string');
        }
        // Every field ends in LF, including the final (possibly empty) body.
        return createHmac('sha1', this.appSecret)
            .update(`${this.appId}\n${timestamp}\n${nonce}\n`, 'utf8')
            .update(rawBody)
            .update('\n')
            .digest('hex');
    }

    /** Validate untrusted callback fields and compare decoded digests in constant time. */
    verifySignature(appId, timestamp, nonce, rawBody, signature) {
        if (appId !== this.appId || !validMetadata(timestamp) || !validMetadata(nonce)
            || (!Buffer.isBuffer(rawBody) && typeof rawBody !== 'string')
            || typeof signature !== 'string' || signature.length !== 40 || !/^[0-9a-f]{40}$/.test(signature)) {
            return false;
        }
        const expected = this.generateSignature(timestamp, nonce, rawBody);
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    }

    /** Build a single-line Authorization value for outgoing Sud API requests. */
    generateAuthorization(timestamp, nonce, rawBody) {
        const signature = this.generateSignature(timestamp, nonce, rawBody);
        return `Sud-Auth app_id="${this.appId}",timestamp="${timestamp}",nonce="${nonce}",signature="${signature}"`;
    }
}

module.exports = RequestSigner;
