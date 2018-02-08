import config from '../config';
import { Alert } from 'react-native';

//缓存操作类
export default class Cache {
	static async SaveToFile(key, data) {
		if (key == null) {
			return;
		}
		key = _filterkey(key);
		try {
			await storage.save({
				key: key, // 注意:请不要在key中使用_下划线符号!
				data: data
			});
		} catch (error) {
			Alert.alert('保存本地文件失败\nkey:' + key + '\nerror:' + error.message);
		}
	}

	static async LoadFromFile(key) {
		let result = null;
		if (key == null) {
			return result;
		}
		key = _filterkey(key);
		try {
			result = await storage.load({
				key: key,
				autoSync: false,
				syncInBackground: false
			});
		} catch (error) {}
		return result;
	}

	static async RemoveCache(key) {
		if (key == null) {
			return;
		}
		key = _filterkey(key);
		try {
			await storage.remove({
				key: key
			});
		} catch (error) {}
		return;
	}
}
_filterkey = function(key) {
	if (key.indexOf('_')) {
		return key.replaceAll('_', '');
	}
	return key;
};
