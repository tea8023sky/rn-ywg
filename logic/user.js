import config from '../config';
import device from './device';
import net from './net';
import cache from './cache';
import event from './event';
import md5 from 'crypto-js/md5';
import { Location } from '../pages/news/newsIndex';
/**
 * 用户操作和当前状态获取
 *
 * @export
 * @class User
 */
export default class User {
	/**
	 * 登录方法,请求网络接口进行登录,并保存用户相应的状态信息
	 * @author jyk
	 * @static
	 * @param {string} mobile 11位长度的手机号
	 * @param {string} pwd 账户密码
	 * @memberof User
	 */
	static async Login(mobile, pwd) {
		let result = await net.ApiPost('index', 'LoginInfoRN', {
			mobile: mobile,
			password: md5(pwd).toString(),
			devid: device.GetDeviceID(),
			pushid: Location.registrationid //推送id
		});
		if (__DEV__) {
			console.log(Location.registrationid + '用户登录接口:' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '登录时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			await _saveUserInfo(result.data);
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 * 用户退出登录网络请求
	 * @author wuzhitao
	 * @static
	 * @returns
	 * @memberof User
	 */
	static async LoginOut() {
		let userInfo = await cache.LoadFromFile(config.UserInfoSaveKey);
		let result = await net.ApiPost('index', 'LoginOut', {
			mobile: userInfo.mobile,
			pushid: Location.registrationid //推送id
		});
		if (__DEV__) {
			console.log('用户退出接口:' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '退出时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 * 新用户注册方法，请求网络接口进行注册
	 *
	 * @author wuzhitao
	 * @static
	 * @param {string} mobile  手机号
	 * @param {string} code  用户获取到的验证码
	 * @param {string} pwd  用户设置的登录密码
	 * @param {string} invitCode  邀请码
	 * @memberof User
	 */
	static async Register(mobile, code, pwd, invitCode) {
		let result = await net.ApiPost('user', 'AddUsersRN', {
			mobile: mobile,
			code: code,
			password: md5(pwd).toString(),
			invite: invitCode
		});
		if (__DEV__) {
			console.log('用户注册接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '注册时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			//存储新增用户信息
			await cache.SaveToFile(config.NewUserInfoSaveKey, result.data);
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 *
	 *  新用户完善资料方法，请求网络接口进行资料完善
	 *
	 * @author wuzhitao
	 * @static
	 * @param {string} name  用户姓名
	 * @param {string} sex 用户性别
	 * @param {string} companyshort  用户公司简称
	 * @param {string} cidlist 用户圈子数据
	 * @param {string} pushid 推送id
	 * @memberof User
	 */
	static async PerfectUserInfo(name, sex, companyshort, cidlist) {
		let result = await net.ApiPost('user', 'UpdateUsersCircle', {
			name: name,
			sex: sex,
			companyshort: companyshort,
			cidlist: cidlist,
			pushid: Location.registrationid //推送id
		});
		if (__DEV__) {
			console.log('用户完善资料接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '完善资料时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			await _saveUserInfo(result.data);
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 *
	 *  用户忘记密码后重置密码方法，请求网络接口进行密码重置
	 *
	 * @author wuzhitao
	 * @static
	 * @param {string} mobile  手机号
	 * @param {string} password  密码
	 * @memberof User
	 * */
	static async ForgetPassWord(mobile, password) {
		let result = await net.ApiPost('user', 'UpdatePassRN', {
			mobile: mobile,
			password: md5(password).toString()
		});
		if (__DEV__) {
			console.log('用户忘记密码后重置密码接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '重置密码时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}
	/**
	 * 用户修改密码前检查用户状态
	 *
	 * @author wuzhitao
	 * @static
	 * @memberof User
	 */
	static async CheckUserState() {
		let result = await net.ApiPost('user', 'CheckUserState', {});
		if (__DEV__) {
			console.log('修改密码前检查用户状态接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '访问服务器失败' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 *
	 *  用户修改密码网络请求接口
	 *
	 * @author wuzhitao
	 * @static
	 * @param {string} mobile  手机号
	 * @param {string} oldpassword  旧密码
	 * @param {string} password  新密码
	 * @memberof User
	 * */
	static async UpdataPassWord(mobile, oldpassword, password) {
		let result = await net.ApiPost('user', 'UpdatePasswordRN', {
			mobile: mobile,
			oldpassword: md5(oldpassword).toString(),
			password: md5(password).toString()
		});
		if (__DEV__) {
			console.log('用户修改密码网络请求接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '修改密码时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 * 判断用户是否登录
	 *
	 * @author jyk
	 * @static
	 * @returns
	 * @memberof User
	 */
	static async IsLogin() {
		let result = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (result == null) {
			return false;
		}
		return true;
	}

	/**
	 * 用户是否加入圈子,用此来判断用户是否已经完善资料
	 * *如果用户没有登录,则此方法直接返回false*
	 * @author jyk
	 * @static
	 * @returns
	 * @memberof User
	 */
	static async IsJoinCircle() {
		let login = await User.IsLogin();
		if (!login) {
			return false;
		}
		let result = await cache.LoadFromFile(config.UserCirclesInfoSaveKey);
		if (result == null) {
			return false;
		}
		return result.length > 0;
	}

	/**
	 * 获取当前用户的登录信息
	 *
	 * @author jyk
	 * @static
	 * @returns
	 * @memberof User
	 */
	static async GetUserInfo() {
		return await cache.LoadFromFile(config.UserInfoSaveKey);
	}

	/**
	 * 获取当前用户已经加入的圈子
	 *
	 * @author jyk
	 * @static
	 * @returns
	 * @memberof User
	 */
	static async GetUserJoinCircles() {
		return await cache.LoadFromFile(config.UserCirclesInfoSaveKey);
	}

	/**
	 * 获取用户标签
	 *
	 * @author NongHuaQiang
	 * @static
	 * @memberof User
	 */
	static async GetUserTag() {
		let array = new Array();
		var json = {};
		//获取省份 城市
		let result = await net.ApiPost('index', 'GetUserTag', {});
		if (result && result.status == 1 && result.data) {
			for (let i = 0; i < result.data.length; i++) {
				if (!json[result.data[i].name]) {
					array.push(result.data[i].name);
					json[result.data[i].name] = 1;
				}
			}
		}
		//获取圈子id
		let Circles = await cache.LoadFromFile(config.UserCirclesInfoSaveKey);
		if (Circles && Circles.length > 0) {
			for (let i = 0; i < Circles.length; i++) {
				array.push(Circles[i].id + '');
			}
		}
		return array;
	}
}

// 本地存储用户数据结构
let demodata = {
	user: {
		id: 1056,
		name: '甲鲲',
		img:
			'http://static.test.gangguwang.com/image/user/2016/11/09/201611091804305863_z.jpg,http://static.test.gangguwang.com/image/user/2016/11/09/201611091804305863.jpg',
		mobile: '18092205880',
		sex: 1,
		company: '',
		companyshort: '钢谷网',
		state: 1,
		uptime: 0,
		createtime: 0,
		stname: '',
		sname: '',
		site: '',
		phone: '',
		tokenid: 'e5ff6dcd62f01730e8ed55959825317c',
		stids: '',
		sids: '',
		uccount: 3
	},
	circles: [
		{
			id: 301,
			name: '钢谷测试圈',
			pinyin: 'gangguceshiquan',
			zimu: 'ggcsq',
			createtime: 1478685570,
			img:
				'http://static.test.gangguwang.com/image/portrait/2016/11/16/1479290323406_z.png,http://static.test.gangguwang.com/undefined',
			state: 1,
			userscount: 246,
			ispush: 0,
			isgag: 0
		}
	]
};

/**
 * 保存用户相应信息
 *
 * @param {object} data
 */
_saveUserInfo = async function(data) {
	//存储用户信息数据
	await cache.SaveToFile(config.UserInfoSaveKey, data.user);
	event.Send(event.Events.user.login, data.user);
	///DeviceEventEmitter.emit('xxxName', data.user);
	//如果用户已经加入圈子,保存圈子数据
	if (typeof data.circles != 'undefined' && data.circles != null && data.circles.length > 0) {
		await cache.SaveToFile(config.UserCirclesInfoSaveKey, data.circles);
	}
};
