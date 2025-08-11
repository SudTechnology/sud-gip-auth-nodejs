/**
 * 用户ID响应类
 */
class SudUid {
    /**
     * @param {string|null} uid
     * @param {boolean} isSuccess
     * @param {number} errorCode
     */
    constructor(uid = null, isSuccess = false, errorCode = 0) {
        this.uid = uid;
        this.isSuccess = isSuccess;
        this.errorCode = errorCode;
    }
}

module.exports = SudUid;