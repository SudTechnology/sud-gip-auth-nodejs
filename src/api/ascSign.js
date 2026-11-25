const { createHmac } = require('node:crypto');

/** Reject invalid Unicode instead of silently replacing unpaired surrogates. */
function validInput(value) {
    return typeof value === 'string' && value.length > 0
        && Buffer.from(value, 'utf8').toString('utf8') === value;
}

/**
 * Calculate the App Server Config (ASC) sign as 32 lowercase hex characters.
 * Use the original UTF-8 app ID as the message and original UTF-8 secret as key.
 * NEVER append a newline, trim, normalize, or pre-hash either input.
 * Existing whitespace is preserved. No HTTP I/O or caching is performed.
 * This HMAC-MD5 helper is separate from RequestSigner (HMAC-SHA1) and JWT;
 * the JWT HS256 32-byte secret minimum does not apply here.
 * @param {string} appId Original application ID.
 * @param {string} appSecret Original application secret.
 * @returns {string} ASC signature.
 * @throws {TypeError} For non-string, empty, or invalid Unicode inputs.
 */
function ascSign(appId, appSecret) {
    if (!validInput(appId) || !validInput(appSecret)) {
        throw new TypeError('Invalid ASC signing input');
    }
    return createHmac('md5', Buffer.from(appSecret, 'utf8'))
        .update(Buffer.from(appId, 'utf8')).digest('hex');
}

module.exports = ascSign;
