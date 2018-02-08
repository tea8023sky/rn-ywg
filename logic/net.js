import config from '../config';
import axios from 'axios';
import qs from 'qs';
import device from './device';
import user from './user';
import cache from './cache';
/**
 * 网络请求,使用axios库进行
 *
 * @author jyk
 * @export
 * @class Net
 */
export default class Net {
	/**
	 * get方式请求接口,如果http状态为200返回结果,如果不为200则返回null
	 *
	 * @author jyk
	 * @static
	 * @param {string} c 控制器名
	 * @param {string} a 方法名
	 * @param {object} getArgs get传递的参数,对象属性代表key,属性值代表value
	 * @returns 请求的数据结果
	 * @memberof Net
	 */
	static async ApiGet(c, a, getArgs) {
		var url = _createUrl(c, a, getArgs);
		var result = await axios.get(url, {
			headers: {
				version: device.GetVersion(),
				build: device.GetBuildNumber()
			}
		});
		if (result.status != 200) {
			return null;
		}
		return result.data;
	}

	/**
	 * post方式请求接口,如果http状态为200返回结果,如果不为200则返回null
	 *
	 * @author jyk
	 * @static
	 * @param {string} c 控制器名
	 * @param {string} a 方法名
	 * @param {object} [postArgs=null] post传递的参数,对象属性代表key,属性值代表value
	 * @param {object} [getArgs=null] get传递的参数,对象属性代表key,属性值代表value
	 * @returns 请求的数据结果
	 * @memberof Net
	 */
	static async ApiPost(c, a, postArgs = null, getArgs = null) {
		let url = _createUrl(c, a, getArgs);
		let postData = qs.stringify(postArgs);
		if (__DEV__) {
			console.log('发送post求情,url:' + url + ',\ndata:' + postData);
		}
		let userTokenid = '';
		let userUid = '';

		//用户已登录
		let IsLogin = await user.IsLogin();
		if (IsLogin) {
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData != null) {
				userTokenid = userData.tokenid;
				userUid = userData.id;
			}
		} else {
			let userData = await cache.LoadFromFile(config.NewUserInfoSaveKey);
			if (userData != null) {
				userTokenid = userData.token;
				userUid = userData.id;
			}
		}

		let result = await axios.post(url, postData, {
			headers: {
				version: device.GetVersion(),
				build: device.GetBuildNumber(),
				tokenid: userTokenid,
				uid: userUid
			}
		});
		if (result.status != 200) {
			return null;
		}
		return result.data;
	}

	/**
	 * 材质书请求
	 *
	 *
	 * @author NongHuaQiang
	 * @static
	 * @param {string} c 控制器名
	 * @param {string} a 方法名
	 * @param {object} [postArgs=null] post传递的参数,对象属性代表key,属性值代表value
	 * @param {object} [getArgs=null] get传递的参数,对象属性代表key,属性值代表value
	 * @returns 请求的数据结果
	 * @memberof Net
	 */
	static async MaterialPost(c, postArgs = null, getArgs = null) {
		//let url = _createUrl(c, a, getArgs);
		let url = config.getMaterialUrl() + '/' + c;
		var urlArgs = '';
		for (var key in getArgs) {
			if (getArgs.hasOwnProperty(key)) {
				var element = getArgs[key];
				urlArgs += '&' + key + '=' + element;
			}
		}
		if (urlArgs.length > 0) {
			url = url + '?' + urlArgs.substr(1);
		}

		let postData = qs.stringify(postArgs);
		let userTokenid = '';
		let userUid = '';

		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData != null) {
			userTokenid = userData.tokenid;
			userUid = userData.id;
		}

		let result = await axios.post(url, postData, {
			headers: {
				version: device.GetVersion(),
				build: device.GetBuildNumber(),
				tokenid: userTokenid,
				uid: userUid
			}
		});
		if (result.status != 200) {
			return null;
		}
		return result.data;
	}

	/**
	 *  百度合成语音接口
	 *
	 * @author NongHuaQiang
	 * @static
	 * @param {any} postArgs
	 * @returns
	 * @memberof Net
	 */
	static async BaiduTTSPost(postArgs) {
		let url = config.BaidTTSApiUrl;
		let postData = qs.stringify(postArgs);
		let result = axios.post(url, postData, {
			responseType: 'stream'
		});
		// .then(function(response) {
		// 	response.data.pipe();
		// });
		if (result.status != 200) {
			return null;
		}
		return result.data;
	}
}

/**
 * 创建url
 *
 * @param {string} c
 * @param {string} a
 * @param {object} args
 * @returns  创建好的url
 */
_createUrl = function(c, a, args) {
	var url = ''; //请求服务器地址
	if (!config.Release) {
		url = config.ApiBaseUrlTest + '/' + c + '/' + a; //请求服务器地址(测试)
	} else {
		url = config.ApiBaseUrl + '/' + c + '/' + a; //请求服务器地址(生产)
	}

	var urlArgs = '';
	for (var key in args) {
		if (args.hasOwnProperty(key)) {
			var element = args[key];
			urlArgs += '&' + key + '=' + element;
		}
	}
	if (urlArgs.length > 0) {
		url = url + '?' + urlArgs.substr(1);
	}
	return url;
};
