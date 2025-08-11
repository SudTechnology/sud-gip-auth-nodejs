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
npm install sudtechnology/sud-gip-auth-nodejs
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

console.log('Code:', code.code);
console.log('Expire Date:', code.expireDate);
```


### Get Server-to-Server Token (SSToken)
```js
const uid = 'user_id';
const ssToken = auth.getSSToken(uid);

console.log('SSToken:', ssToken.token);
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

