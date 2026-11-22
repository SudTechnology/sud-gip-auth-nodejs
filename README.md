# Sud GIP Auth Node.js SDK

## Introduction
The Sud GIP Auth Node.js SDK is a Node.js library designed for implementing the Sud GIP authentication system, with support for JWT (JSON Web Token) authentication. This SDK provides functions such as generating authentication codes, server-to-server tokens (SSTokens), verifying tokens, and retrieving user IDs, making it convenient for developers to integrate Sud GIP's authentication services into Node.js projects.

## Features
- Token Generation: Supports generating authentication codes and SSTokens, with the ability to set expiration durations.
- Token Verification: Verifies the validity of authentication codes and SSTokens.
- User ID Retrieval: Retrieves user IDs using authentication codes or SSTokens.

## Installation
You can install this SDK using npm. Run the following command in your project's root directory:
```bash
npm install sud-gip-auth-nodejs
```

## Usage
### Initialization
First, you need to instantiate the SudGIPAuth class and pass in your application ID and application secret:
```js
const SudGIPAuth = require('sud-gip-auth-nodejs');

const appId = 'your_app_id';
const appSecret = 'your_app_secret';

const auth = new SudGIPAuth(appId, appSecret);
```

### Get Authentication Code
```js
const uid = 'user_id';
const code = auth.getCode(uid);

// Send code.code to the authenticated client. Do not log tokens.
console.log('Expire Date:', code.expireDate);
```


### Get Server-to-Server Token (SSToken)
```js
const uid = 'user_id';
const ssToken = auth.getSSToken(uid);

// Return ssToken.token to the caller. Do not log tokens.
console.log('Expire Date:', ssToken.expireDate);
```

### Get User ID by Authentication Code
```js
const code = 'your_auth_code';
const uidResponse = auth.getUidByCode(code);

if (uidResponse.isSuccess) {
  console.log('User ID:', uidResponse.uid);
} else {
  console.log('Error Code:', uidResponse.errorCode);
}
```

### Get User ID by SSToken
```js
const ssToken = 'your_sstoken';
const uidResponse = auth.getUidBySSToken(ssToken);

if (uidResponse.isSuccess) {
    console.log('User ID:', uidResponse.uid);
} else {
    console.log('Error Code:', uidResponse.errorCode);
}
```

## Error Codes
| Error Code | Description          |
|------------|----------------------|
| 0          | 成功                 |
| 1001       | Token创建失败        |
| 1002       | Token校验失败        |
| 1003       | Token解析失败        |
| 1004       | Token非法            |
| 1005       | Token过期            |
| 1101       | App数据非法          |
| 9999       | 未知错误             |


## Runtime and validation

Node.js 18 or later is required. Use a maintained Node.js release in production.
App ID, AppSecret, and UID must be non-empty strings. Use your issued AppSecret
unchanged; do not pad or hash it locally. The SDK does not log tokens or claims.

Optional expiration durations are positive finite numbers in **milliseconds**.
Code defaults to two hours, with a minimum of 30 minutes. SSToken defaults to
and has a minimum of two hours. Smaller positive durations are raised to the
minimum. `expireDate` is a Unix timestamp in milliseconds; JWT `exp` is seconds.

Invalid configuration or UID throws `TypeError`; invalid duration throws
`RangeError`. Signing failures throw an error with `errorCode: 1001` and the
original `cause`. Callers should catch signing errors without logging secrets.
Verification methods return `[errorCode, message]`; UID methods return
`{ uid, isSuccess, errorCode }`. Invalid tokens do not throw from these methods.
Verification requires a valid HS256 signature, expiration, and non-empty string
`uid` and `app_id` claims. Missing required claims return 1004; expired tokens
return 1005; signature or parsing failures return 1002.

Code and SSToken share the token format. This SDK does not enforce token purpose
or compare the token app ID against the constructor app ID. Use a distinct issued
secret per application and perform any additional application policy checks in
your server.

### Compatibility notes

Validation is stricter: empty or non-string identifiers, invalid durations, and
tokens without required claims are rejected. Existing valid tokens retain their
format and signing algorithm. Code that previously relied on unchecked inputs
must handle these errors before upgrading.

## Development

```bash
npm ci
npm test -- --runInBand
npm run lint
npm audit --omit=dev
npm pack --dry-run
```
