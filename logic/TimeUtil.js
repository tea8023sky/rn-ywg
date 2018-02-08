export default class TimeUtil {
	/**
     * 时间格式化
     * 
     * @author NongHuaQiang
     * @static
     * @param {any} ts 
     * @param {any} format 
     * @returns 
     * @memberof TimeUtil
     */
	static getTime(ts, format) {
		var t;
		t = ts ? new Date(Number(ts) * 1000) : new Date();
		var o = {
			'M+': t.getMonth() + 1, // month
			'd+': t.getDate(), // day
			'h+': t.getHours(), // hour
			'm+': t.getMinutes(), // minute
			's+': t.getSeconds(), // second
			'q+': Math.floor((t.getMonth() + 3) / 3), // quarter
			S: t.getMilliseconds() // millisecond
		};
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp('(' + k + ')').test(format)) {
				format = format.replace(
					RegExp.$1,
					RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
				);
			}
		}
		return format;
	}

	/**
     * 
     * 语音播报时间格式转换00：00
     * 
     * @author NongHuaQiang
     * @static
     * @param {any} time 
     * @memberof TimeUtil
     */
	static getAudioTime(time) {
		let min = Math.floor(time / 60);
		let sec = Math.floor(time % 60);
		return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
	}

	/**
	 * 保留N 位小数
	 * @author NongHuaQiang
	 * @static
	 * @memberof TimeUtil
	 */
	static getFloat = function(number, n) {
		n = n ? parseInt(n) : 0;
		if (n <= 0) return Math.round(number);
		number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
		return number;
	};

	/**
	 * 获取聊天首页显示时间
	 * 
	 * @static
	 * @param {string} timeStr 
	 * @memberof TimeUtil
	 */
	static getChatIndexTime(timeStr) {
		let nowDate = new Date().getTime() / 1000;
		if (TimeUtil.getTime(timeStr, 'yyyy年MM月dd日') == TimeUtil.getTime(nowDate, 'yyyy年MM月dd日')) {
			return TimeUtil.getTime(timeStr, 'hh:mm');
		} else if (TimeUtil.getTime(timeStr, 'yyyy年') == TimeUtil.getTime(nowDate, 'yyyy年')) {
			return TimeUtil.getTime(timeStr, 'MM月dd日');
		} else {
			return TimeUtil.getTime(timeStr, 'yyyy年MM月');
		}
	}

	/**
	 * 获取分隔时间（比如：10分钟前、1小时前...）
	 * 
	 * @static
	 * @memberof TimeUtil
	 */
	static getSeparateDate(time) {
		let result = '';
		let nowDate = new Date().getTime() / (1000 * 60); //分钟
		let oldtime = time / 60; //分钟
		let mt = nowDate - oldtime;
		if ((mt > 0 && mt < 60) || Math.abs(mt) < 10) {
			if (Math.ceil(mt / 10) * 10 == 60) {
				result = '1小时前';
			} else if (Math.ceil(mt / 10) * 10 == 0) {
				result = '10分钟前';
			} else {
				result = Math.ceil(mt / 10) * 10 + '分钟前';
			}
		} else if (mt >= 60 && mt <= 60 * 23) {
			result = Math.ceil(mt / 60) + '小时前';
		} else {
			result = TimeUtil.getTime(time, 'yyyy-MM-dd');
		}

		return result;
	}

	/**
	 * 返回 n个空格
	 * 
	 * @author NongHuaQiang
	 * @static
	 * @param {any} n 
	 * @returns 
	 * @memberof TimeUtil
	 */
	static Nspace(n) {
		let res = '';
		for (let i = 0; i < n; i++) {
			res = res + ' ';
		}
		return res;
	}
}
