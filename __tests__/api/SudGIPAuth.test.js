const jwt = require('jsonwebtoken');
const SudGIPAuth = require('../../src/api/SudGIPAuth');
const TokenUtils = require('../../src/auth/TokenUtils');

const secret = 'local-test-secret-0123456789abcdef';
const auth = new SudGIPAuth('test-app', secret);
const claims = () => ({ uid: 'test-user', app_id: 'test-app', exp: Math.floor(Date.now() / 1000) + 3600 });
const sign = payload => jwt.sign(payload, secret, { algorithm: 'HS256' });

afterEach(() => jest.restoreAllMocks());

test('Code and SSToken round trips preserve UID and expiration units', () => {
    const code = auth.getCode('test-user');
    const token = auth.getSSToken('test-user');
    expect(auth.getUidByCode(code.code)).toMatchObject({ uid: 'test-user', isSuccess: true, errorCode: 0 });
    expect(auth.getUidBySSToken(token.token)).toMatchObject({ uid: 'test-user', isSuccess: true, errorCode: 0 });
    expect(jwt.decode(code.code).exp * 1000).toBe(code.expireDate);
    expect(jwt.decode(token.token).exp * 1000).toBe(token.expireDate);
});

test.each([undefined, null, '', ' ', 42, {}])('rejects invalid UID %p', uid => {
    expect(() => auth.getCode(uid)).toThrow(TypeError);
    expect(() => auth.getSSToken(uid)).toThrow(TypeError);
});

test.each(['', ' ', null, 42])('rejects invalid configuration %p', value => {
    expect(() => new SudGIPAuth(value, secret)).toThrow(TypeError);
    expect(() => new SudGIPAuth('app', value)).toThrow(TypeError);
});

test.each([NaN, Infinity, -Infinity, 0, -1, '1000', {}, Number.MAX_VALUE])('rejects invalid duration %p', duration => {
    expect(() => auth.getCode('user', duration)).toThrow(RangeError);
    expect(() => auth.getSSToken('user', duration)).toThrow(RangeError);
});

test('preserves default and minimum lifetimes', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1800000000000);
    expect(auth.getCode('user').expireDate).toBe(Date.now() + 7200000);
    expect(auth.getCode('user', 1).expireDate).toBe(Date.now() + 1800000);
    expect(auth.getSSToken('user', 1).expireDate).toBe(Date.now() + 7200000);
});

test.each(['uid', 'app_id', 'exp'])('rejects missing required claim %s', field => {
    const payload = claims();
    delete payload[field];
    expect(auth.getUidByCode(sign(payload))).toMatchObject({ isSuccess: false, errorCode: 1004 });
});

test.each(['', ' ', 42, {}, null])('rejects invalid signed UID %p', uid => {
    expect(auth.getUidByCode(sign({ ...claims(), uid }))).toMatchObject({ isSuccess: false, errorCode: 1004 });
});

test('rejects expired, malformed, wrong-key and wrong-algorithm tokens', () => {
    expect(auth.verifyCode(sign({ ...claims(), exp: 1 }))[0]).toBe(1005);
    expect(auth.verifyCode('invalid-token')[0]).toBe(1002);
    expect(auth.verifyCode(jwt.sign(claims(), 'other-secret'))[0]).toBe(1002);
    expect(auth.verifyCode(jwt.sign(claims(), secret, { algorithm: 'HS384' }))[0]).toBe(1002);
    expect(auth.verifyCode('')[0]).toBe(1004);
});

test('UID extraction verifies once, including at the expiration boundary', () => {
    const token = sign(claims());
    const originalVerify = jwt.verify;
    const verify = jest.spyOn(jwt, 'verify').mockImplementationOnce((...args) => originalVerify(...args))
        .mockImplementation(() => { throw new jwt.TokenExpiredError('expired', new Date()); });
    expect(auth.getUidByCode(token).isSuccess).toBe(true);
    expect(verify).toHaveBeenCalledTimes(1);
});

test('signing failure exposes errorCode and original cause', () => {
    const cause = new Error('signing failed');
    jest.spyOn(jwt, 'sign').mockImplementation(() => { throw cause; });
    try {
        auth.getCode('user');
        throw new Error('Expected signing failure');
    } catch (error) {
        expect(error.errorCode).toBe(1001);
        expect(error.cause).toBe(cause);
    }
});

test('all signing and verification paths are silent', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const code = auth.getCode('user');
    auth.getUidByCode(code.code);
    TokenUtils.getUID(code.code, secret);
    auth.verifyCode('bad');
    auth.verifyCode(sign({ ...claims(), exp: 1 }));
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
});
