import config from '../config';
import cache from './cache';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'Geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

//设备信息和操作
//获取软件和设备信息,引用react-native-device-info组件
export default class Device {
	//获取设备id,ios在卸载软件后会变化
	static GetDeviceID() {
		return DeviceInfo.getUniqueID();
	}

	//获取软件版本(如:2.3.19)
	static GetVersion() {
		return DeviceInfo.getVersion();
	}

	//获取软件编译号(如:2319)
	static GetBuildNumber() {
		return DeviceInfo.getBuildNumber();
	}
	//获取完整软件发布版本名称(如 2.3.19.2319)
	static GetReadableVersion() {
		return DeviceInfo.getReadableVersion();
	}
	//获取经纬度（经度：location.coords.longitude纬度：location.coords.latitude）
	//IsLastPosition ==true 获取上一次定位的数据  ==false 获取最新位置
	static async GetCurrentPosition(IsLastPosition) {
		if (Platform.OS == 'android') {
			//检查是否拥有定位权限
			let isgetLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
			if (!isgetLocation) {
				return { coords: { latitude: config.DefaultLatitude, longitude: config.DefaultLongitude } }; //返回默认位置
			}
		}

		let LastPosition = null;
		if (IsLastPosition) {
			LastPosition = await cache.LoadFromFile(config.Positionkey);
		}
		return await new Promise(function(resolve, reject) {
			if (IsLastPosition) {
				if (LastPosition) {
					resolve(LastPosition); //返回上一次定位位置
				} else {
					reject({ coords: { latitude: config.DefaultLatitude, longitude: config.DefaultLongitude } }); //返回默认位置
				}
			} else {
				navigator.geolocation.getCurrentPosition(
					(Position) => {
						if (__DEV__) {
							console.log(Position);
						}
						resolve(Position); //成功后调用
						cache.SaveToFile(config.Positionkey, Position); //缓存最新位置
					},
					(error) => {
						if (__DEV__) {
							// 1为用户拒绝定位请问
							// 2暂时获取不到位置信息
							// 3为请求超时
							// 4未知错误
							console.log('获取位置信息失败：' + JSON.stringify(error));
						}
						reject(null); //失败后调用
					},
					// enableHighAccuracy——指示浏览器获取高精度的位置，默认为false。当开启后，可能没有任何影响，也可能使浏览器花费更长的时间获取更精确的位置数据。
					// timeout——指定获取地理位置的超时时间，默认不限时。单位为毫秒。
					// maximumAge——最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。默认为0，表示浏览器需要立刻重新计算位置
					{ enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 }
				);
			}
		});
	}
}
