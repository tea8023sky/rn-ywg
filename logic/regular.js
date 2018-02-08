/**
 * 常用正册表达式
 * 
 * @author wuzhitao
 * @export
 * @class Regular
 */
export default class Regular {
	/**
     * 通过正则表达式判断输入字符串是否为手机号
     * 
     *@author wuzhitao
     * @static
     * @param {string} phoneNumber 
     * @returns 
     * @memberof Regular
     */
	static isPhoneNumber(phoneNumber) {
		const reg = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/;
		return reg.test(phoneNumber);
	}
	/**
     * 通过正则表达式判断输入字符串是否为链接地址
     * 
     * @author zhengyeye
     * @static
     * @param {string} url 
     * @returns 
     * @memberof Regular
     */
	static isUrl(url) {
		const reg = /^((http[s]?|ftp|mms):\/\/)*(\w+\.)+\w+[\w_.\/\w]*$/;
		return reg.test(url);
	}

	/**
     * 判断是否含有协议头http或者https
     * 
     * @author zhengyeye
     * @static
     * @param {string} url 
     * @returns 
     * @memberof Regular
     */
	static hasHttp(url) {
		const reg = /^(http:\/\/|https:\/\/).*$/;
		return reg.test(url);
	}

	/**
     * 判断是否是整数
     * 
     * @author NongHuaQiang
     * @static
     * @param {any} n 
     * @returns 
     * @memberof Regular
     */
	static IsInteger(n) {
		return /^\d+$/.test(n + '');
	}
}
