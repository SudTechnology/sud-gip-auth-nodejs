const SudGIPAuth = require('../src/api/SudGIPAuth');
const { RequestSigner } = SudGIPAuth;

const signer = new RequestSigner('test-app', 'test-secret');
const timestamp = '1688464949817';
const nonce = 'fixed-nonce';

// Fixed protocol vectors generated independently, shared across SDK languages.
test.each([
    [Buffer.alloc(0), 'cb6d64fd0a3dfd78b19da2c7625ec2317b05ef8d'],
    [Buffer.from('{\r\n "message":"用户", "n":1\r\n}'), '0e6f9c9c7ba300bb03ec32277b497b67a62054bc'],
    [Buffer.from([0, 255, 10]), 'd2d001cfd566df480128991a0a124ea6b373727d']
])('signs original bytes using a fixed vector', (body, expected) => {
    expect(signer.generateSignature(timestamp, nonce, body)).toBe(expected);
    expect(signer.verifySignature('test-app', timestamp, nonce, body, expected)).toBe(true);
    expect(signer.verifySignature('other-app', timestamp, nonce, body, expected)).toBe(false);
    expect(signer.verifySignature('test-app', timestamp, nonce, Buffer.concat([body, Buffer.from(' ')]), expected)).toBe(false);
});

test('preserves the default constructor export and produces Authorization', () => {
    expect(typeof SudGIPAuth).toBe('function');
    expect(signer.generateAuthorization(timestamp, nonce, '')).toBe(
        'Sud-Auth app_id="test-app",timestamp="1688464949817",nonce="fixed-nonce",signature="cb6d64fd0a3dfd78b19da2c7625ec2317b05ef8d"');
    expect(signer.generateSignature(timestamp, nonce, '用户')).toBe(signer.generateSignature(timestamp, nonce, Buffer.from('用户')));
});

test.each(['', 'a b', 'a\n', 'a\nb', 'a\rb', 'a"b', 'a,b', 'a\\b', '用户', null, 123])('rejects unsafe metadata %p', value => {
    expect(() => new RequestSigner(value, 'secret')).toThrow(TypeError);
    expect(() => signer.generateAuthorization(value, nonce, '')).toThrow(TypeError);
    expect(() => signer.generateSignature(timestamp, value, '')).toThrow(TypeError);
    expect(signer.verifySignature('test-app', value, nonce, '', '0'.repeat(40))).toBe(false);
});

test('rejects malformed signatures, invalid bodies, empty keys and wrong keys', () => {
    for (const value of ['', ' ', null, 42]) {
        expect(() => new RequestSigner('test-app', value)).toThrow(TypeError);
    }
    for (const body of [null, undefined, {}, 42]) {
        expect(() => signer.generateSignature(timestamp, nonce, body)).toThrow(TypeError);
        expect(signer.verifySignature('test-app', timestamp, nonce, body, '0'.repeat(40))).toBe(false);
    }
    const signature = signer.generateSignature(timestamp, nonce, '');
    for (const value of [null, 42, signature.toUpperCase(), signature + '\n', signature + '0', 'g'.repeat(40), '0'.repeat(40)]) {
        expect(signer.verifySignature('test-app', timestamp, nonce, '', value)).toBe(false);
    }
    expect(new RequestSigner('test-app', 'wrong-key').verifySignature('test-app', timestamp, nonce, '', signature)).toBe(false);
});
