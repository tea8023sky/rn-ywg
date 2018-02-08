import config from '../config';
import cache from './cache';
import axios from 'axios';
/**
 * 图片上传工具类
 *
 * @author zhengyeye
 * @export
 * @class UploadFile
 */
export default class UploadFile {
	/**
	 *
	 *
	 * @author zhengyeye
	 * @static
	 * @param {String} uri 一张图片地址
	 * @param {String} ziname:标识名称   ywg_user/ywg_dynamic/ywg_feedback/ywg_chat
	 * @returns
	 * @memberof UploadFile
	 */
	static async UploadImg(uri, ziname) {
		let formData = new FormData();
		let index = uri.uri.lastIndexOf('/');
		let name = uri.uri.substring(index + 1, uri.uri.length);
		let file = { uri: uri.uri, type: 'multipart/form-data', name: name };
		formData.append('file', file);

		//获取缓存中用户信息
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData != null) {
			userTokenid = userData.tokenid;
			userUid = userData.id;
		}

		formData.append('uid', userUid);
		formData.append('token', userTokenid);
		formData.append('ziname', ziname);

		let url = ''; //请求服务器地址
		if (!config.Release) {
			url = config.ApiBaseUrlTest + '/image/NewImgUpload'; //请求服务器地址(测试)
		} else {
			url = config.ApiBaseUrl + '/image/NewImgUpload'; //请求服务器地址(生产)
		}

		let result = await axios.post(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Accept: 'application/json',
				uid: userUid,
				ziname: ziname
			}
		});
		if (result.status != 200) {
			return null;
		}
		return result.data.data;
	}

	/**
	 *上传音频文件
	 *
	 * @author wuzhitao
	 * @static
	 * @param {String} filePath 文件路径
	 * @returns
	 * @memberof UploadFile
	 */
	static async UploadAudio(filePath) {
		let formData = new FormData();
		let index = filePath.lastIndexOf('/');
		let name = filePath.substring(index + 1, filePath.length);
		let file = { uri: 'file:///' + filePath, type: 'multipart/form-data', name: name };
		formData.append('file', file);

		//获取缓存中用户信息
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData != null) {
			userTokenid = userData.tokenid;
			userUid = userData.id;
		}

		formData.append('uid', userUid);
		formData.append('token', userTokenid);
		formData.append('ziname', '');

		let url = ''; //请求服务器地址
		if (!config.Release) {
			url = config.ApiBaseUrlTest + '/image/NewImgUpload'; //请求服务器地址(测试)
		} else {
			url = config.ApiBaseUrl + '/image/NewImgUpload'; //请求服务器地址(生产)
		}

		let result = await axios.post(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Accept: 'application/json',
				uid: userUid,
				ziname: ''
			}
		});
		if (result.status != 200) {
			return null;
		}
		return result.data.data;
	}
}
