import { DeviceEventEmitter } from 'react-native';
/**
 * 事件处理类
 *
 * @author jyk
 * @export
 * @class Event
 */
export default class Event {
	/**
	 * 存放所有事件名称的地方
	 *
	 * @static
	 * @memberof Event
	 */
	static Events = {
		//用户相关
		user: {
			//用户登录
			login: 'E_userlogin',
			//用户退出
			logout: 'E_userlogout',
			//用户修改圈子
			updataCircles: 'E_userUpdataCircles',
			//更改资料
			upDataInfo: 'E_userUpDataInfo'
		},

		//工具事件
		tool: {
			steelSelect: 'E_toolsteelSelect',
			tradeSelect: 'E_tooltradeSelect',
			standardSelect: 'E_toolstandardSelect',
			weightProperySelect: 'E_toolweightProperySelect',
			clearTotalData: 'E_toolclearTotalData',
			citySelect: 'E_toolcitySelect',
			steelCollectGoBack: 'E_steelCollectGoBack',
			addEContract: 'E_tooladdEContract',
			saveOffer: 'E_toolsaveOffer',
			saveOfferImages: 'E_toolsaveOfferImages',
			stockSelect: 'E_toolstockSelect'
		},
		//标签编辑页的点击标签，切换新闻内容页
		news: {
			ChangeTabs: 'E_newsChangeTabs', //切换标签
			RebindTabs: 'E_newsRebindTabs', //重新绑定Tabs
			ClickTabsForRefresh: 'E_newsClickTabsForRefresh', //点击
			FontSizeChange: 'E_newsFontSizeChange' //字体大小变化，更新快讯字体
		},
		//动态相关:点击未读消息列表进入详情页后
		dynamic: {
			newsList: 'E_dynamicnewsList', //进入详情后返回到未读消息列表
			delImg: 'E_dynamicdelImg', //图片上传后点击大图查看后再删除
			giveZan: 'E_dynamicgiveZan' //进入详情点赞后返回到动态列表页
		},
		//聊天
		chat: {
			chatIndexChanged: 'E_chatIndexchanged', //聊天首页数据刷新
			sendMessageSuccess: 'E_sendMessageSuccess', //聊天消息发送成功
			chatServiceStatusChanged: 'E_chatServiceStatusChanged' //聊天服务状态更改
		},
		//我的-收藏
		collect: {
			mycollectsearch: 'E_mycollectsearchkey'
		},
		//首页
		main: {
			chatIconNum: 'E_chatIconNum'
		}
	};

	/**
	 * 订阅一个事件,一个组件对一个事件名称只能订阅一次,反复订阅会取消之前的订阅重新订阅.
	 *
	 * @author jyk
	 * @static
	 * @param {object} component 组件(页面)自身
	 * @param {string} eventName 事件名称
	 * @param {function} func 事件处理函数
	 * @memberof Event
	 */
	static Sub(component, eventName, func) {
		_checkEventArray(component);
		if (
			typeof component[_eventArrayName][eventName] != 'undefined' &&
			component[_eventArrayName][eventName] != null
		) {
			try {
				component[_eventArrayName][eventName].remove();
			} catch (error) {}
			component[_eventArrayName][eventName] = null;
		}
		component[_eventArrayName][eventName] = DeviceEventEmitter.addListener(eventName, func);
	}

	/**
	 * 取消订阅
	 *
	 * @author jyk
	 * @static
	 * @param {object} component 组件(页面)自身
	 * @param {string} [eventName=null] 事件名称,默认值为null,如果为null,则会取消当前组件的所有事件监听
	 * @returns
	 * @memberof Event
	 */
	static UnSub(component, eventName = null) {
		if (typeof component[_eventArrayName] == 'undefined') {
			return;
		}
		if (
			eventName != null &&
			typeof component[_eventArrayName][eventName] != 'undefined' &&
			component[_eventArrayName][eventName] != null
		) {
			try {
				component[_eventArrayName][eventName].remove();
			} catch (error) {}
			component[_eventArrayName][eventName] = null;
		} else {
			for (var key in component[_eventArrayName]) {
				if (component[_eventArrayName].hasOwnProperty(key)) {
					try {
						component[_eventArrayName][key].remove();
					} catch (error) {}
					component[_eventArrayName][eventName] = null;
				}
			}
		}
	}

	/**
	 * 触发一个事件
	 *
	 * @author jyk
	 * @static
	 * @param {string} eventName 事件名称
	 * @param {object} [data=null] 事件包含的数据
	 * @memberof Event
	 */
	static Send(eventName, data = null) {
		DeviceEventEmitter.emit(eventName, data);
	}
}

_eventArrayName = 'events';

_checkEventArray = function(component) {
	if (typeof component[_eventArrayName] == 'undefined') {
		component[_eventArrayName] = {};
	}
};
