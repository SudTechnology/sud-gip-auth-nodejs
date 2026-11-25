const SudGIPAuth = require('../src/api/SudGIPAuth');
const { ascSign } = SudGIPAuth;

// Independently computed fixtures shared across SDKs.
test.each([
    ['appId', 'appSecret', '1a5f39304181dbc2a7fe3c908acf5ef6'],
    ['应用ID', '应用密钥', '95216b1f04d8c9e8788a9ba35b11001d'],
    [' appId ', ' appSecret ', 'd963b97ffb9d6613b06d7931b6965684'],
    ['appId\n', 'appSecret', '5fa35ef2782656fe753e30f2dbbc1dfb'],
])('calculates the ASC fixed vector without transforming inputs', (id, secret, expected) => {
    expect(ascSign(id, secret)).toBe(expected);
});

test.each([null, undefined, '', 123, {}, Buffer.from('app'), '\ud800', '\udfff'])(
    'rejects invalid ASC input %p', (value) => {
        expect(() => ascSign(value, 'secret')).toThrow(TypeError);
        expect(() => ascSign('app', value)).toThrow(TypeError);
    }
);

test('preserves existing constructor and request signer exports', () => {
    expect(typeof SudGIPAuth).toBe('function');
    expect(typeof SudGIPAuth.RequestSigner).toBe('function');
});
