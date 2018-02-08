//import { Alert } from 'react-native';

/**
 * 关闭页面navigation.goBack(pagekey) 用到的是页面的route.key而不是routename
 * 所以需要关闭多层页面的地方，在每次打开一个页面调用一次pushPageKey(pagename, pagekey)
 * 关闭的时候再通过getPageKey 取出pagekey，然后调用navigation.goBack(pagekey)
 * 
 * @author NongHuaQiang
 * @export
 * @class PageHelper
 */
export default class PageHelper {
	static pagekeyList = [];

	static pushPageKey(pagename, pagekey) {
		for (let i = 0; i < this.pagekeyList.length; i++) {
			if (this.pagekeyList[i].name == pagename) {
				this.pagekeyList.splice(i, 1);
				break;
			}
		}
		this.pagekeyList.push({ name: pagename, key: pagekey });
	}

	static getPageKey(pagename) {
		for (let i = 0; i < this.pagekeyList.length; i++) {
			if (this.pagekeyList[i].name == pagename) {
				return this.pagekeyList[i].key;
			}
		}
		return null;
	}

	static obj = { key: 'key' };
	static OpenPageVerification(pagename) {
		let now = new Date().getTime();
		let time = PageHelper.obj[pagename] && PageHelper.obj[pagename] ? PageHelper.obj[pagename] : 0;
		if (now - time > 1000) {
			PageHelper.obj[pagename] = now;
			return true;
		} else {
			return false;
		}
	}
}
