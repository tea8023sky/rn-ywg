import config from '../config';
import axios from 'axios';
import qs from 'qs';
import device from './device';
import Realm from 'realm';
import cache from './cache';
import user from './user';
import event from './event';
import Sound from 'react-native-sound';
import { Alert, Vibration, Platform } from 'react-native';
/**
 * 聊天相应操作类
 *
 * @author jyk
 * @export
 * @class Chat
 */
export default class Chat {
	/**
	 * 当前打开的聊天窗口信息
	 *
	 * @static
	 * @memberof Chat
	 */
	static openChatData = null;

	/**
	 * 唯一聊天客户端
	 *
	 * @static
	 * @memberof Chat
	 */
	static chatClient = null;

	/**
	 * 聊天客户端当前状态
	 *
	 * @static
	 * @memberof Chat
	 */
	static chatClientState = null;

	/**
	 * 正在播放的语音消息
	 * 
	 * @static
	 * @memberof Chat
	 */
	static playingAudioMsg = null;

	/**
	 * 获取当前唯一聊天客户端
	 *
	 * @static
	 * @returns
	 * @memberof Chat
	 */
	static getChatClient() {
		if (Chat.chatClient == null) {
			Chat.chatClient = new ChatClient();
			Chat.chatClient.initChatClient();
		}
		return Chat.chatClient;
	}

	/**
	 * 初始化聊天
	 *
	 * @author jyk
	 * @static
	 * @memberof Chat
	 */
	static async init() {
		await Chat.getChatClient().start();
	}

	/**
	 * 本地数据初始化
	 *
	 * @static
	 * @returns
	 * @memberof Chat
	 */
	static async initLocalData() {
		await ChatClient.initLocalData();
	}

	/**
	 * 加载聊天首页数据
	 *
	 * @static
	 * @returns
	 * @memberof Chat
	 */
	static async getChatIndexData() {
		return await ChatClient.getChatIndexData();
	}

	/**
	 * 删除聊天首页列表条目数据
	 *
	 * @static
	 * @param {ChatIndex} chatIndex
	 * @memberof Chat
	 */
	static async deleteFriend(chatIndex) {
		return await ChatClient.deleteChatIndex(chatIndex);
	}

	/**
	 * 清空聊天首页指定对话未读消息数
	 *
	 * @static
	 * @param {ChatIndex} chatIndex
	 * @memberof Chat
	 */
	static async clearChatIndexNumber(chatIndex) {
		await ChatClient.clearChatIndexNumber(chatIndex);
	}

	/**
	 * 发送消息给指定用户或群组
	 *
	 * @static
	 * @param {int} chatMessageType
	 * @param {int} target
	 * @param {string} content
	 * @param {int} contentType
	 * @memberof Chat
	 */
	static async sendMessage(chatMessageType, target, content, contentType) {
		return await ChatClient.sendMessage(chatMessageType, target, content, contentType);
	}

	/**
	 * 获取与指定用户或圈子的聊天消息
	 *
	 * @static
	 * @param {int} target 获取目标（圈子id或者用户id）
	 * @param {int} messageType 获取消息类型
	 * @param {int} lastId 当前显示数据的最后一条id
	 * @param {int} number 获取的数据条数,首次可传0
	 * @returns 聊天消息数组，可能为[]
	 * @memberof Chat
	 */
	static async getChatMessage(target, messageType, lastId, number) {
		return await ChatClient.getChatMessageDatas(target, messageType, lastId, number);
	}

	/**
	 * 获取当前用户uid
	 *
	 * @static
	 * @returns 当前用户uid，没有则返回0
	 * @memberof Chat
	 */
	static getUserUid() {
		if (ChatClient.uid != null && ChatClient.uid > 0) {
			return ChatClient.uid;
		}
		return 0;
	}

	/**
	 * 获取指定用户或群组信息
	 *
	 * @static
	 * @param {int} uid  用户或群组id
	 * @param {boolean} isRealTime  是否实时获取数据
	 * @returns 用户或群组信息
	 * @memberof Chat
	 */
	static async GetFullUserInfo(uid, isRealTime) {
		return await ChatClient.GetFullUserInfo(uid, isRealTime);
	}

	/**
	 * 获取完整群组信息
	 *
	 * @static
	 * @param {int} uid 群组编号
	 * @memberof Chat
	 */
	static async GetGroupInfo(uid) {
		return await ChatClient.getGroupInfo(uid);
	}

	/**
	 * 获取用户昵称
	 *
	 * @static
	 * @param {int} uid  用户id
	 * @returns
	 * @memberof Chat
	 */
	static async getNickName(uid) {
		return await ChatClient.getNickName(uid);
	}

	/**
	 * 修改昵称
	 *
	 * @static
	 * @param {int} uid 用户id
	 * @param {string} nickName 昵称
	 * @returns
	 * @memberof Chat
	 */
	static async setNickName(uid, nickName) {
		return await ChatClient.setNickName(uid, nickName);
	}

	/**
	 * 设置圈子消息提醒
	 *
	 * @static
	 * @param {int} groupId 圈子id
	 * @param {int} isPush 是否提醒，提醒（1），不提醒（0）
	 * @returns
	 * @memberof Chat
	 */
	static async setGroupRemind(groupId, isPush) {
		return await ChatClient.setGroupRemind(groupId, isPush);
	}

	/**
	 * 撤回消息
	 *
	 * @static
	 * @param {ChatMessage} chatMessage
	 * @returns
	 * @memberof Chat
	 */
	static async revokeMessage(chatMessage) {
		return await ChatClient.revokeMessage(chatMessage);
	}

	/**
	 * 状态码转换为提示语
	 *
	 * @static
	 * @param {int} code
	 * @returns
	 * @memberof Chat
	 */
	static sendResultToString(code) {
		switch (code) {
			case MessageResultCode.Failure:
				return '发送失败';
			case MessageResultCode.NoLogin:
				return '未登录';
			case MessageResultCode.LoginOnOther:
				return '当前账号已在其他设备登录';
			case MessageResultCode.UserNotInGroup:
				return '用户不在群中';
			case MessageResultCode.GroupNotExist:
				return '群不存在';
			case MessageResultCode.UserWasBanned:
				return '用户已被群禁用';
			case MessageResultCode.FriendsNotReceiveYourMessage:
				return '好友不接收您的消息';
			case MessageResultCode.SendMessageLimit:
				return '已达到当天发送上限';
			case MessageResultCode.UserIsDisabled:
				return '用户已被禁用';
			case MessageResultCode.UserRemoved:
				return '当前账号已被移除该群';
			case MessageResultCode.NetworkUnavailable:
				return '当前网络不可用';
			default:
				return '未知错误';
		}
	}

	/**
	 * 保存广告数据
	 * 
	 * @static
	 * @param {any} data 
	 * @memberof Chat
	 */
	static saveAdvertising(data) {
		ChatClient.insertAdvertising(data);
	}

	/**
	 * 删除广告数据
	 * 
	 * @static
	 * @memberof Chat
	 */
	static removeAdvertising() {
		ChatClient.deleteDataFormDB(Advertising.schema.name, '');
	}

	/**
	 * 获取广告数据
	 * 
	 * @static
	 * @returns 
	 * @memberof Chat
	 */
	static getAdvertising() {
		return ChatClient.getAdvertising();
	}

	/**
	 * 停止WebSocket聊天服务
	 * 
	 * @static
	 * @memberof Chat
	 */
	static async stopChatWebSocket() {
		await ChatClient.Stop();
	}

	/**
	 * 重启WebSocket聊天服务
	 * 
	 * @static
	 * @memberof Chat
	 */
	static async resetChatWebSocket() {
		let stop = await ChatClient.Stop();
		if (stop) {
			await ChatClient.connectWSAgain();
		}
	}
}

/**
 * 唯一聊天客户端
 *
 * @author ChatClient
 * @export
 * @class ChatClient
 */
class ChatClient {
	/**
	 * 聊天服务基础地址
	 *
	 * @static
	 * @returns
	 * @memberof ChatClient
	 */
	static baseServer() {
		if (!config.Release) {
			return config.ChatServerTest + '/v1';
		}
		return config.ChatServer + '/v1';
	}

	/**
	 * 聊天服务发消息地址
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static sendUrl = config.HttpScheme + ChatClient.baseServer() + '/message/Send';

	/**
	 * 获取聊天列表首页数据地址
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static getIndexDataUrl = config.HttpScheme + ChatClient.baseServer() + '/message/GetIndexData';

	/**
	 * 获取聊天离线消息地址
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static getOfflineMessageUrl = config.HttpScheme + ChatClient.baseServer() + '/message/GetOfflineMessage';

	/**
	 * 获取聊天数据服务接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static getChatDataUrl = config.HttpScheme + ChatClient.baseServer() + '/message/GetChatData';

	/**
	 * 获取用户信息接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static getUserInfoUrl = config.HttpScheme + ChatClient.baseServer() + '/message/GetNewUserInfo';

	/**
	 * 用户昵称设置接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static setNickNameUrl = config.HttpScheme + ChatClient.baseServer() + '/message/SetNickName';

	/**
	 * 群组消息是否接收设置接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static setGroupPushUrl = config.HttpScheme + ChatClient.baseServer() + '/message/SetGroupPush';

	/**
	 * 删除聊天列表回话接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static deleteFriendUrl = config.HttpScheme + ChatClient.baseServer() + '/message/DeleteFriend';

	/**
	 * 聊天服务连接接口
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static connUrl = 'ws://' + ChatClient.baseServer() + '/message/Conn';

	/**
	 * 当前用户token
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static token = null;

	/**
	 * 当前用户id
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static uid = null;

	/**
	 * WebSocket连接
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static webSocketConn = null;

	/**
	 * 聊天客户端当前状态
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static chatClientState = null;

	/**
	 * 声音提示音频文件
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static AudioFile = null;

	/**
	 * 初始化当前唯一聊天客户端
	 *
	 * @memberof ChatClient
	 */
	async initChatClient() {
		if (__DEV__) {
			console.log('\n初始化唯一聊天客户端\n');
		}
		//从本地缓存加载用户数据
		await ChatClient.loadLocalUserInfo();
		//状态初始化
		ChatClient.chatClientState = ClientState.Closed;
	}

	/**
	 * 读取本地缓存的用户数据
	 *
	 * @returns
	 * @memberof ChatClient
	 */
	static async loadLocalUserInfo() {
		let userdata = await user.GetUserInfo();
		if (userdata == null) {
			return;
		}
		ChatClient.uid = userdata.id;
		ChatClient.token = userdata.tokenid;
	}

	/**
	 * 用户登录状态获取
	 *
	 * @returns
	 * @memberof ChatClient
	 */
	static appLogin() {
		if (__DEV__) {
			console.log('ChatClient.uid:' + ChatClient.uid + '\nChat.token:' + ChatClient.token);
		}
		if (ChatClient.uid == null || ChatClient.token == null) {
			return false;
		}
		return true;
	}

	/**
	 * 启动聊天服务客户端,根据业务逻辑是否顺利会发出相应的Event订阅通知
	 *
	 * @static
	 * @returns
	 * @memberof ChatClient
	 */
	async start() {
		if (__DEV__) {
			console.log('\n启动聊天服务客户端\n');
		}
		//从本地缓存加载用户数据
		await ChatClient.loadLocalUserInfo();
		//判断登录状态
		if (!ChatClient.appLogin()) {
			ChatClient.chatClientState = ClientState.Closed;
			return false;
		}
		// //更改状态
		ChatClient.chatClientState = ClientState.Starting;
		//加载离线消息;
		if (!await ChatClient.initOfflineMessage()) {
			ChatClient.chatClientState = ClientState.Closed;
			return false;
		}
		//TODO:Event通知事件发送聊天离线消息加载完成通知，后续添加

		//连接WebSocket
		await ChatClient.connectWS();
		//刷新未读消息数
		await ChatClient.RefreshMessageCount();
		return true;
	}

	/**
	 *  撤回消息操作
	 *
	 * @static
	 * @param {ChatMessage} chatMessage 需要撤回的消息
	 * @returns true：撤回成功；false:撤回失败
	 * @memberof ChatClient
	 */
	static async revokeMessage(chatMessage) {
		if (chatMessage.source != ChatClient.uid) {
			return false;
		}
		//撤销消息请求
		let result = await ChatClient.sendMessage(
			chatMessage.messageType,
			chatMessage.target,
			chatMessage.id + '',
			ChatMessage.ContentType.Chat_Revoke
		);
		return result;
	}

	/**
	 * 消息发送操作
	 *
	 * @static
	 * @param {int} chatMessageType 消息类型,1为用户消息,2位群组消息,3位系统消息,使用ChatMessage.MessageType
	 * @param {int} target 消息目标,发给谁或者发给哪个群的
	 * @param {string} content 消息内容
	 * @param {int} contentType 内容类型,消息的内容类型，使用ChatMessage.ContentType
	 * @returns 消息请求状态，使用MessageResultCode
	 * @memberof ChatClient
	 */
	static async sendMessage(chatMessageType, target, content, contentType) {
		//TODO:网络状态判断
		let result = await ChatClient.chatHttpPost(ChatClient.sendUrl, {
			type: chatMessageType + '',
			target: target + '',
			content: content,
			contenttype: contentType + ''
		});
		if (typeof result.Code == 'undefined') {
			return MessageResultCode.Failure;
		}

		try {
			//发送成功
			if (result.Code == MessageResultCode.Success) {
				let message = result.Message;
				await ChatClient.refreshMessageList(message);
			} else if (result.Code == MessageResultCode.UserRemoved) {
				//用户被移除后初始化聊天数据
				//通知消息首页进行数据刷新
				event.Send(event.Events.chat.chatIndexChanged);
			}
			return result.Code;
		} catch (error) {
			if (__DEV__) {
				console.log(error);
			}
			return MessageResultCode.Failure;
		}
	}

	/**
	 *
	 *
	 * @static
	 * @param {ChatMessage} msg
	 * @memberof ChatClient
	 */
	static async refreshMessageList(msg) {
		//消息目标或者来源为打开窗口
		if (Chat.openChatData && (Chat.openChatData.id == msg.Target || Chat.openChatData.id == msg.Source)) {
			//通知消息列表数据刷新
			event.Send(event.Events.chat.sendMessageSuccess, msg);
		}
		//存储及离线消息处理
		await ChatClient.SaveSingleMessage(msg);
	}

	/**
	 * 获取聊天首页数据
	 *
	 * @static
	 * @returns
	 * @memberof ChatClient
	 */
	static async getChatIndexData() {
		let indexData = null;
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			indexData = db.objects(ChatIndex.schema.name);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		let indexDatas = ChatClient.convertDBData(indexData, ChatIndex.schema);
		//关闭数据库
		db.close();

		let chatIndexData = [];
		for (let i = 0; i < indexDatas.length; i++) {
			let chatIndex = indexDatas[i];
			if (chatIndex.content !== null && chatIndex.content !== undefined && chatIndex.content !== '') {
				let nick = await ChatClient.getNickName(chatIndex.id);
				if (nick != null && nick != '') {
					chatIndex.name = nick;
				}
				chatIndexData.push(chatIndex);
			}
		}

		return chatIndexData;
	}

	/**
	 * 初始化聊天数据
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async initLocalData() {
		//加载本地用户数据
		await ChatClient.loadLocalUserInfo();
		if (!ChatClient.appLogin) {
			return false;
		}
		let lastId = await ChatClient.getLastMessageId();
		//发送网络请求
		let result = await ChatClient.chatHttpPost(ChatClient.getIndexDataUrl, {
			lastid: lastId + ''
		});

		if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
			if (__DEV__) {
				console.log(result.error);
			}
			return false;
		}
		try {
			let nicknames = result.Nickname;
			if (nicknames != null && nicknames.length > 0) {
				//清空所有用户昵称数据
				ChatClient.deleteDataFormDB(ChatNickname.schema.name, '');
				for (let i = 0; i < nicknames.length; i++) {
					let element = nicknames[i];
					let nickname = new ChatNickname();
					nickname.targetUid = element.TargetUid; //目标用户id
					nickname.nickName = element.NickName; //修改昵称
					//存储所有用户数据
					// [{"Id":68,"Uid":53581,"TargetUid":52945,"NickName":"武"}]
					ChatClient.insertOrUpdateToChatNickname([ nickname ], false);
				}
			}
		} catch (error) {
			if (__DEV__) {
				console.log('\n初始化本地聊天首页数据异常：' + error);
			}
		}

		//服务器返回首页消息数据
		let chatMessages = result.IndexData;
		//本地数据库首页展现数据
		let indexData = null;
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			indexData = db.objects(ChatIndex.schema.name);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		let indexDatas = ChatClient.convertDBData(indexData, ChatIndex.schema);
		//关闭数据库
		db.close();
		//循环本地数据,如果本地数据在服务器返回数据中不存在,则删除本地数据
		if (typeof indexDatas != 'undefined' && indexDatas != null && indexDatas.length > 0) {
			for (let i = 0; i < indexDatas.length; i++) {
				let ci = indexDatas[i];
				let cm = null;
				if (ci.Type == ChatIndex.Type.Group) {
					cm = chatMessages.find((n) => n.Target == ci.id && n.MessageType == ci.type);
				} else {
					cm = chatMessages.find((n) => n.Source == ci.id && n.MessageType == ci.type);
				}
				if (typeof cm == 'undefined' || cm == null) {
					//从数据库删除
					ChatClient.deleteDataFormDB(ChatIndex.schema.name, "pk='" + ci.pk + "'");
				}
			}
		}
		//循环服务器返回数据,如果服务器返回数据在本地数据不存在则新增.存在的直接修改.
		if (typeof chatMessages != 'undefined' && chatMessages != null) {
			for (let i = 0; i < chatMessages.length; i++) {
				let cm = chatMessages[i];
				let id = cm.Target;
				if (cm.Source != ChatClient.uid && cm.MessageType == ChatMessage.MessageType.UserMessage) {
					id = cm.Source;
				}

				//根据消息来源及类型查询聊天首页数据是否存在符合条件数据
				let ci = indexDatas.find((n) => n.id == id && n.type == cm.MessageType);
				//不存在则新增
				if (typeof ci == 'undefined' || ci == null) {
					ci = new ChatIndex();
					ci.id = id;
					ci.type = cm.MessageType;
				}

				//聊天消息数据结构
				// {"Id":13698,"Source":1045,"Target":230,"MessageType":2,"Content":"a'sa's'da's'da's'da","ContentType":1,"SendTime":1511233290,
				// "UserInfo":"{\"id\":1045,\"name\":\"好家伙\",\"img\":\"image/user/2016/11/14/201611141701017318_z.png,image/user/2016/11/14/201611141701017318.png\",\"sex\":1}",
				// "GroupInfo":"{\"id\":230,\"name\":\"西安-石库\",\"img\":\"\",\"number\":4325,\"ispush\":0}"}

				//初始化消息发送人;
				let chatUser = null;
				if (cm.Source > 0 && cm.UserInfo != null && cm.UserInfo != '') {
					chatUser = new ChatUser();
					let userInfo = null;
					try {
						userInfo = JSON.parse(cm.UserInfo);
					} catch (error) {
						if (__DEV__) {
							console.log(error);
						}
					}
					if (userInfo != null) {
						chatUser.id = userInfo.id;
						chatUser.name = userInfo.name;
						chatUser.sex = userInfo.sex;
						chatUser.img = userInfo.img;
						chatUser.mobile = userInfo.mobile ? userInfo.mobile : '';
						chatUser.company = userInfo.company ? userInfo.company : '';
						chatUser.companyshort = userInfo.companyshort ? userInfo.companyshort : '';
						chatUser.groupnames = userInfo.groupnames ? userInfo.groupnames : '';
					}
					if (userInfo == null) {
						continue; //跳过
					}
				}

				//消息发送人昵称
				let nickname = null;
				//消息发送人名字或者昵称
				let chatIndexNickName = null;
				if (chatUser) {
					nickname = await ChatClient.getNickName(chatUser.id);
					chatIndexNickName = nickname ? nickname : chatUser.name;
				}

				//根据消息来源做相应处理
				if (
					cm.MessageType == ChatMessage.MessageType.GroupMessage &&
					cm.GroupInfo != null &&
					cm.GroupInfo != ''
				) {
					//消息来源为群组处理
					let chatGroup = new ChatGroup();
					let groupInfo = null;
					try {
						groupInfo = JSON.parse(cm.GroupInfo);
					} catch (error) {
						if (__DEV__) {
							console.log(error);
						}
					}

					if (groupInfo != null) {
						chatGroup.id = groupInfo.id;
						chatGroup.name = groupInfo.name;
						chatGroup.img = groupInfo.img;
						chatGroup.number = groupInfo.number ? groupInfo.number : 0;
						chatGroup.ispush = groupInfo.ispush;
						await ChatClient.saveGroupInfo(chatGroup);
						//首页数据字段更新
						ci.name = chatGroup.name;
						ci.img = chatGroup.img;
					}
				} else {
					//消息来源为用户处理
					let fromId = cm.Source; //消息来源
					if (fromId == ChatClient.uid) {
						//用户自己发送的消息
						fromId = cm.Target;
					}
					//从数据库查询消息来源用户信息
					let cu = ChatClient.GetUserInfo(fromId);

					//不论用户存不存在，保存最新用户信息
					ChatClient.SaveUserInfo(chatUser);

					ci.name = chatIndexNickName ? chatIndexNickName : chatUser.name;
					ci.img = chatUser.img;
					ci.sex = chatUser.sex;
				}

				ci.content = ChatClient.createContentText(cm, chatIndexNickName);
				if (ci.sendTime != cm.SendTime) {
					ci.number = ci.number ? ci.number + 1 : 0;
				} else {
					ci.number = ci.number ? ci.number : 0;
				}

				ci.sendTime = cm.SendTime;
				ci.lastid = cm.Id;

				ChatClient.insertOrUpdateToChatIndex([ ci ], true);
			}
		}
		return true;
	}

	/**
	 *
	 *
	 * @static
	 * @param {object} cm 首页消息
	 * @param {string} chatIndexNickname 消息发送人昵称，可能不存在
	 * @returns
	 * @memberof ChatClient
	 */
	static createContentText(cm, chatIndexNickname) {
		let contentText = '';
		if (cm.Id == 0 || cm.Source == 0) {
			return cm.Content;
		}

		if (cm.MessageType == ChatMessage.MessageType.GroupMessage) {
			if (cm.Source == ChatClient.uid) {
				contentText = '自己';
			} else {
				contentText = chatIndexNickname ? chatIndexNickname : '';
			}
		}

		switch (cm.ContentType) {
			case ChatMessage.ContentType.Chat_Audio:
				contentText += '发送了一段语音';
				break;
			case ChatMessage.ContentType.Chat_Image:
				contentText += '发送了一张图片';
				break;
			case ChatMessage.ContentType.Chat_Out:
				contentText += '被移出了该圈子';
				break;
			case ChatMessage.ContentType.Chat_Revoke:
				contentText += '撤回了一条消息';
				break;
			case ChatMessage.ContentType.Chat_Text:
				if (cm.MessageType == ChatMessage.MessageType.GroupMessage && cm.Source != 0) {
					contentText += ':';
				}
				contentText += cm.Content;
				break;
			case ChatMessage.ContentType.Chat_Video:
				contentText += '发送了一个视频';
				break;
			default:
				contentText += '未知类型,请升级您的业务GO软件';
				break;
		}
		return contentText;
	}

	/**
	 * 存储群组信息
	 *
	 * @static
	 * @param {ChatGroup} chatGroup 群组对象
	 * @memberof ChatClient
	 */
	static async saveGroupInfo(chatGroup) {
		//获取数据库对象
		let db = ChatClient.openDB();
		let cgroup = null;
		try {
			cgroup = db.objects(ChatGroup.schema.name).filtered('id=' + chatGroup.id);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatGroup.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		let cg = ChatClient.convertDBData(cgroup, ChatGroup.schema);
		//关闭数据库
		db.close();
		if (cg == null || cg.length == 0) {
			//不存在则插入
			ChatClient.insertOrUpdateToChatGroup([ chatGroup ], false);
		} else {
			//不存在则修改
			ChatClient.insertOrUpdateToChatGroup([ chatGroup ], true);
		}
	}

	/**
	 * 获取群组信息
	 *
	 * @static
	 * @param {int} id 群组id
	 * @memberof ChatClient
	 */
	static async getGroupInfo(id) {
		//获取数据库对象
		let db = ChatClient.openDB();
		let cgroup = null;
		try {
			cgroup = db.objects(ChatGroup.schema.name).filtered('id=' + id);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatGroup.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		let cg = ChatClient.convertDBData(cgroup, ChatGroup.schema);
		//关闭数据库
		db.close();
		if (cg != undefined && cg != null && cg.length > 0) {
			return cg[0];
		}
		return null;
	}
	/**
	 * 清空首页未读数
	 *
	 * @static
	 * @param {ChatIndex} chatIndex 聊天首页数据
	 * @memberof ChatClient
	 */
	static async clearChatIndexNumber(chatIndex) {
		//获取数据库对象
		let db = ChatClient.openDB();
		let chatIndexDatas = null;
		try {
			chatIndexDatas = db.objects(ChatIndex.schema.name).filtered("pk='" + chatIndex.pk + "'");
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		let chatIndexData = ChatClient.convertDBData(chatIndexDatas, ChatIndex.schema);
		//关闭数据库
		db.close();
		if (chatIndexData == null || chatIndexData.length == 0) {
			//不存在符合条件数据
			return;
		}
		//存在符合条件数据直接更改相应属性并更改数据库
		chatIndexData[0].number = 0;
		ChatClient.insertOrUpdateToChatIndex(chatIndexData, true);
	}
	/**
	 * 删除聊天首页数据
	 *
	 * @static
	 * @param {ChatIndex} chatIndex 聊天首页数据
	 * @memberof ChatClient
	 */
	static async deleteChatIndex(chatIndex) {
		if (chatIndex.type == ChatIndex.Type.User) {
			//发送网络请求
			let result = await ChatClient.chatHttpPost(ChatClient.deleteFriendUrl, {
				friendUid: chatIndex.id
			});
			if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
				if (__DEV__) {
					console.log(result.error);
				}
				return false;
			}
		}
		//数据库删除
		ChatClient.deleteDataFormDB(ChatIndex.schema.name, "pk='" + chatIndex.pk + "'");
		return true;
	}
	/**
	 * 获取聊天首页用户数据，如果不存在则新增
	 *
	 * @static
	 * @param {int} uid  用户id
	 * @returns  返回ChatIndex对象
	 * @memberof ChatClient
	 */
	static async GetUserIndexData(uid) {
		let chatIndex = null;
		//获取数据库对象
		let db = ChatClient.openDB();
		let chatIndexData = null;
		try {
			chatIndexData = db.objects(ChatIndex.schema.name).filtered("pk='" + uid + '_' + ChatIndex.Type.Use + "'");
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatIndex = ChatClient.convertDBData(chatIndexData, ChatIndex.schema);

		//获取完整数据
		let chatUser = await ChatClient.GetFullUserInfo(uid);
		if (chatIndex == null || chatIndex.length == 0) {
			chatIndex = new ChatIndex();
			chatIndex.id = chatUser.id;
			chatIndex.type = ChatIndex.Type.User;
			chatIndex.name = chatUser.name;
			chatIndex.content = '';
			chatIndex.img = chatUser.img;
			chatIndex.sex = chatUser.sex;
			chatIndex.lastid = 0;
			chatIndex.number = 0;
			chatIndex.sendTime = 0;
			ChatClient.insertOrUpdateToChatIndex([ chatIndex ], false);
			//重新查询数据库
			try {
				chatIndexData = db
					.objects(ChatIndex.schema.name)
					.filtered("pk='" + uid + '_' + ChatIndex.Type.Use + "'");
			} catch (error) {
				if (__DEV__) {
					console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
					console.log(error);
				}
			}
			//数据转换
			chatIndex = ChatClient.convertDBData(chatIndexData, ChatIndex.schema);
		}
		//关闭数据库
		db.close();

		return chatIndex;
	}

	/**
	 * 获取完整用户数据,如果本地不全会从远程服务器抓取完整数据
	 *
	 * @static
	 * @param {int} uid 用户编号
	 * @memberof ChatClient
	 */
	static async GetFullUserInfo(uid, isRealTime) {
		let chatUser = null;
		if (!isRealTime) {
			chatUser = await ChatClient.GetUserInfo(uid);
		}
		if (chatUser == null || chatUser.mobile == null || chatUser.mobile == '') {
			//发送请求获取完整获取完整数据
			let result = await ChatClient.chatHttpPost(ChatClient.getUserInfoUrl, {
				id: uid
			});
			if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
				if (__DEV__) {
					console.log(result.error);
				}
				return;
			}

			if (result.SimpleUser != null) {
				//数据转换
				chatUser = {
					id: result.SimpleUser.id, //用户id
					name: result.SimpleUser.name, //用户名称
					sex: result.SimpleUser.sex ? result.SimpleUser.sex : 1, //用户性别,1为男
					img: result.SimpleUser.img ? result.SimpleUser.img : '', //用户头像
					mobile: result.SimpleUser.mobile ? result.SimpleUser.mobile : '', //用户手机号
					company: result.SimpleUser.company ? result.SimpleUser.company : '', //用户所属公司
					companyshort: result.SimpleUser.companyshort ? result.SimpleUser.companyshort : '', //用户所属公司简称
					groupnames: result.SimpleUser.groupnames ? result.SimpleUser.groupnames : '' //用户所在圈子,名称字符串
				};
				//保存用户数据
				ChatClient.SaveUserInfo(chatUser);
			}

			// //保存后再次查询
			// chatUser = ChatClient.GetUserInfo(uid);
		}
		return chatUser;
	}

	/**
	 * 将用户数据保存到缓存及数据库中
	 *
	 * @static
	 * @param {object} chatUser
	 * @memberof ChatClient
	 */
	static SaveUserInfo(chatUser) {
		ChatClient.insertOrUpdateToChatUser([ chatUser ], true);
	}

	/**
	 * 从缓存或者数据库加载用户数据，查询不到返回null
	 *
	 * @static
	 * @param {int} uid 用户编号
	 * @memberof ChatClient
	 */
	static async GetUserInfo(uid) {
		//从数据库查询
		let db = ChatClient.openDB(); //获取数据库对象
		let chatUserData = null;
		let chatUser = null;
		try {
			chatUserData = db.objects(ChatUser.schema.name).filtered('id=' + uid);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatUser.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatUser = ChatClient.convertDBData(chatUserData, ChatUser.schema);
		//关闭数据库
		db.close();
		if (chatUser == null || chatUser.length == 0) {
			return null;
		}
		return chatUser[0];
	}

	/**
	 * 获取用户昵称
	 *
	 * @static
	 * @param {int} targetUid 目标id
	 * @returns
	 * @memberof ChatClient
	 */
	static async getNickName(targetUid) {
		let nickname = null;

		let db = ChatClient.openDB(); //获取数据库对象
		let chatNicknameData = null;
		let chatNickname = null;
		try {
			chatNicknameData = db.objects(ChatNickname.schema.name).filtered('targetUid=' + targetUid);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatNickname.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatNickname = ChatClient.convertDBData(chatNicknameData, ChatNickname.schema);
		//关闭数据库
		db.close();

		if (chatNickname != null && chatNickname.length > 0) {
			//发送网络请求
			nickname = chatNickname[0].nickName;
		}
		return nickname;
	}
	/**
	 * 设置用户昵称
	 *
	 * @static
	 * @param {int} targetUid 目标用户id
	 * @param {string} nickName 昵称
	 * @memberof ChatClient
	 */
	static async setNickName(targetUid, nickName) {
		let nickname = null;
		let isUpdate = true;

		let db = ChatClient.openDB(); //获取数据库对象
		let chatNicknameData = null;
		let chatNickname = null;
		try {
			chatNicknameData = db.objects(ChatNickname.schema.name).filtered('targetUid=' + targetUid);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatNickname.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatNickname = ChatClient.convertDBData(chatNicknameData, ChatNickname.schema);
		//关闭数据库
		db.close();

		//发送网络请求
		let result = await ChatClient.chatHttpPost(ChatClient.setNickNameUrl, {
			targetUid: targetUid,
			nickName: nickName
		});
		if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
			if (__DEV__) {
				console.log(result.error);
			}
			return false;
		}

		if (chatNickname == null || chatNickname.length == 0) {
			isUpdate = false;
		}
		nickname = new ChatNickname();
		nickname.targetUid = targetUid; //目标用户id
		nickname.nickName = nickName; //修改昵称
		ChatClient.insertOrUpdateToChatNickname([ nickname ], isUpdate);
		//通知消息首页进行数据刷新
		event.Send(event.Events.chat.chatIndexChanged);
		return true;
	}

	/**
	 * 设置圈子消息提醒
	 *
	 * @static
	 * @param {int} groupId 圈子id
	 * @param {int} isPush 是否提醒，提醒（1），不提醒（0）
	 * @returns
	 * @memberof ChatClient
	 */
	static async setGroupRemind(groupId, isPush) {
		let result = await ChatClient.chatHttpPost(ChatClient.setGroupPushUrl, {
			gid: groupId + '',
			ispush: isPush + ''
		});
		if (result && result.Code == 1) {
			let group = await ChatClient.getGroupInfo(groupId);
			//圈子存在
			if (group) {
				group.ispush = isPush;
				ChatClient.insertOrUpdateToChatGroup([ group ], true);
				return true;
			}
		}
		return false;
	}

	/**
	 * 停止聊天服务客户端,根据业务逻辑是否顺利会发出相应的Event订阅通知
	 *
	 * @static
	 * @returns
	 * @memberof ChatClient
	 */
	static async Stop() {
		ChatClient.chatClientState = ClientState.Closed;
		if (ChatClient.webSocketConn != null) {
			//关闭WebSocket连接
			ChatClient.webSocketConn.close();
		}
		//发送聊天服务关闭通知
		event.Send(event.Events.chat.chatServiceStatusChanged, false);
		return true;
	}

	/**
	 * 加载用户离线消息
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async initOfflineMessage() {
		if (__DEV__) {
			console.log('\n加载用户离线消息开始\n');
		}
		//用户设置的消息提醒方式获取 TODO:

		//获取最后一条消息id
		let lastid = await ChatClient.getLastMessageId();
		//加载离线数据返回数据结构
		//{"Code":1,"ChatData":[
		// {"Id":13174,"Source":1048,"Target":230,"MessageType":2,"Content":"AAAA","ContentType":2,"SendTime":1510135219,
		// "UserInfo":"{\"id\":1048,\"name\":\"李红阿\",\"img\":\"image/user/2016/11/22/201611221758175531_z.jpg,image/user/2016/11/22/201611221758175531.jpg\",\"sex\":2}",
		// "GroupInfo":""}]}
		let result = await ChatClient.chatHttpPost(ChatClient.getOfflineMessageUrl, {
			cmid: lastid + ''
		});
		if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
			if (__DEV__) {
				console.log(result.error);
			}
			return false;
		}

		let chatData = result.ChatData;
		//离线消息加载成功，相关数据处理
		if (chatData != null && chatData.length > 0) {
			//首页数据处理
			await ChatClient.setChatIndexData(chatData);
			//撤回消息的处理
			let newDate = await ChatClient.revokeChatMessage(chatData);
			//存储消息到数据库
			await ChatClient.insertOrUpdateToChatMessage(newDate, false);
		}
		if (__DEV__) {
			console.log('\n加载用户离线消息完成\n');
		}
		return true;
	}

	/**
	 * 获取与指定用户或圈子的聊天消息
	 *
	 * @static
	 * @param {int} target 获取目标（圈子id或者用户id）
	 * @param {int} messageType 获取消息类型
	 * @param {int} lastId 当前显示数据的最后一条id
	 * @param {int} number 获取的数据条数,首次可传0
	 * @returns 聊天消息数组，可能为[]
	 * @memberof ChatClient
	 */
	static async getChatMessageDatas(target, messageType, lastId, number) {
		let result = [];
		let chatMessagses = null;
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			if (messageType == ChatMessage.MessageType.GroupMessage) {
				let filterStr = 'target=' + target + ' AND messageType=' + messageType;
				if (lastId > 0) {
					filterStr += ' AND id<' + lastId;
				}
				//查询并按照升序排序
				chatMessagses = db.objects(ChatMessage.schema.name).filtered(filterStr).sorted('id', false);
			} else {
				let filterStr_1 =
					'target=' + target + ' AND source=' + ChatClient.uid + ' AND messageType=' + messageType;
				let filterStr_2 =
					'source=' + target + ' AND target=' + ChatClient.uid + ' AND messageType=' + messageType;
				if (lastId > 0) {
					filterStr_1 += ' AND id<' + lastId;
					filterStr_2 += ' AND id<' + lastId;
				}
				//查询并按照升序排序
				chatMessagses = db
					.objects(ChatMessage.schema.name)
					.filtered(filterStr_1 + ' OR ' + filterStr_2)
					.sorted('id', false);
			}
		} catch (error) {
			if (__DEV__) {
				console.log('获取聊天消息查询数据库' + ChatMessage.schema.name + '出错：' + error);
			}
			chatMessagses = null;
		}

		if (chatMessagses != null || chatMessagses.length > 0) {
			//获取指定条数的数据并进行转换
			result = ChatClient.convertDBData(
				chatMessagses.slice(chatMessagses.length - number, chatMessagses.length),
				ChatMessage.schema
			);
			//关闭数据库
			db.close();
		}

		//如果本地没有加载够需要的数据,从服务器端加载数据补全
		if ((result.length == 0 || result.length < number) && lastId == 0) {
			let cmid = 0;
			if (result.length > 0) {
				cmid = result[result.length - 1].id;
			}
			let serverData = await ChatClient.getChatDataFromServer(target, messageType, cmid); //降序排列
			if (serverData) {
				//数据转换
				for (let i = 0; i < serverData.length; i++) {
					let sMsg = serverData[i];
					let rMsgIndex = result.findIndex((n) => n.id == sMsg.Id);
					if (rMsgIndex == -1) {
						let chatMsg = new ChatMessage();
						chatMsg.id = sMsg.Id;
						chatMsg.source = sMsg.Source;
						chatMsg.target = sMsg.Target;
						chatMsg.messageType = sMsg.MessageType;
						chatMsg.content = sMsg.Content;
						chatMsg.contentType = sMsg.ContentType;
						chatMsg.sendTime = sMsg.SendTime;
						chatMsg.userInfo = sMsg.UserInfo ? sMsg.UserInfo : '';
						chatMsg.groupInfo = sMsg.GroupInfo ? sMsg.GroupInfo : '';
						result.unshift(chatMsg);
					}
				}
			}
		}
		return result;
	}

	/**
	 * 从服务器端加载聊天数据
	 *
	 * @static
	 * @param {int} id 用户或者群id
	 * @param {int} type 消息类型
	 * @param {int} cmid 当前消息数据中最早的消息id，可为0
	 * @returns
	 * @memberof ChatClient
	 */
	static async getChatDataFromServer(id, type, cmid) {
		let serverData = null;
		let result = await ChatClient.chatHttpPost(ChatClient.getChatDataUrl, {
			id: id + '',
			type: type + '',
			count: 20 + '',
			cmid: cmid + ''
		});
		if (typeof result.Code == 'undefined' || result.Code != MessageResultCode.Success) {
			if (__DEV__) {
				console.log(result.error);
			}
			return serverData;
		}
		if (result.ChatData) {
			serverData = result.ChatData;
			//撤回消息的处理
			let newDate = await ChatClient.revokeChatMessage(serverData);
			//存储消息到数据库
			await ChatClient.insertOrUpdateToChatMessage(newDate, true);
		}
		return serverData;
	}

	/**
	 * 根据指定数据对聊天首页数据进行相应的更新
	 *
	 * @static
	 * @param {Object} messageData 聊天消息
	 * @memberof ChatClient
	 */
	static async setChatIndexData(messageData) {
		//查询数据库ChatIndex表中保存的聊天首页数据
		let db = ChatClient.openDB(); //获取数据库对象
		let chatIndexListData = null;
		let chatIndexList = null;
		try {
			chatIndexListData = db.objects(ChatIndex.schema.name);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatIndexList = ChatClient.convertDBData(chatIndexListData, ChatIndex.schema);
		//关闭数据库
		db.close();

		if (chatIndexList == null || chatIndexList.length == 0) {
			return;
		}
		for (let i = 0; i < messageData.length; i++) {
			let element = messageData[i];
			let chatIndex = null;
			//用户消息
			if (element.MessageType == ChatMessage.MessageType.UserMessage) {
				let userInfo = null;
				try {
					userInfo = JSON.parse(element.UserInfo);
				} catch (error) {
					if (__DEV__) {
						console.log(error);
					}
				}

				if (userInfo != null) {
					let update = false;

					let pk = 0;
					if (element.Source == ChatClient.uid) {
						pk = element.Target;
					} else {
						pk = userInfo.id;
					}
					chatIndex = chatIndexList.find((n) => n.pk == pk + '_' + element.MessageType);

					if (typeof chatIndex != 'undefined' && chatIndex != null) {
						//已存在与该消息来源用户的对话,更新数据库
						update = true;
					} else {
						//不存在与该消息来源用户的对话，添加到数据库
						chatIndex = new ChatIndex();
						chatIndex.id = Number(pk);
						chatIndex.type = ChatIndex.Type.User;
					}

					let chatUser = null;
					if (element.Source == ChatClient.uid) {
						chatUser = await ChatClient.GetFullUserInfo(pk);
					}

					//消息发送人昵称
					let nickname = await ChatClient.getNickName(pk);
					chatIndex.name = nickname ? nickname : chatUser ? chatUser.name : userInfo.name;
					chatIndex.img = chatUser ? chatUser.img : userInfo.img;
					chatIndex.sex = chatUser ? chatUser.sex : userInfo.sex;
					chatIndex.content = ChatClient.createContentText(
						element,
						nickname ? nickname : chatUser ? chatUser.name : userInfo.name
					);
					let number = chatIndex.number ? chatIndex.number : 0;
					if (
						element.Source == ChatClient.uid ||
						(Chat.openChatData && Chat.openChatData.id == element.Source)
					) {
						//剔除用户自己发送的消息及会话打开时收到的消息
					} else {
						number += 1; //新增默认给1
					}
					chatIndex.number = number;
					chatIndex.lastid = element.Id;
					chatIndex.sendTime = element.SendTime;
					//数据库操作
					ChatClient.insertOrUpdateToChatIndex([ chatIndex ], update);
				}
			}

			//群组消息
			if (element.MessageType == ChatMessage.MessageType.GroupMessage) {
				let groupInfo = null;
				let userInfo = null;
				try {
					userInfo = JSON.parse(element.UserInfo);
					groupInfo = JSON.parse(element.GroupInfo);
				} catch (error) {
					if (__DEV__) {
						console.log(error);
					}
				}

				if (groupInfo == null) {
					//如果为空，数据库查找
					//"GroupInfo":"{\"id\":230,\"name\":\"西安-石库\",\"img\":\"\",\"number\":4336,\"ispush\":0}"}
					let db = ChatClient.openDB(); //获取数据库对象
					let Group = null;
					let GroupList = null;
					try {
						Group = db.objects(ChatGroup.schema.name).filtered('id=' + element.Target);
					} catch (error) {
						if (__DEV__) {
							console.log('\n查询数据表' + ChatGroup.schema.name + '出错:');
							console.log(error);
						}
					}
					//数据转换
					GroupList = ChatClient.convertDBData(Group, ChatGroup.schema);
					//关闭数据库
					db.close();
					if (GroupList && GroupList.length > 0) {
						groupInfo = GroupList[0];
					}
				}

				if (groupInfo != null) {
					let update = false;

					chatIndex = chatIndexList.find((n) => n.pk == groupInfo.id + '_' + element.MessageType);

					if (typeof chatIndex != 'undefined' && chatIndex != null) {
						update = true;
					} else {
						//不存在与该消息来源用户的对话，添加到数据库
						chatIndex = new ChatIndex();
						chatIndex.id = groupInfo.id;
						chatIndex.type = ChatIndex.Type.Group;
					}
					//消息发送人昵称
					let nickname = await ChatClient.getNickName(element.Source);
					chatIndex.name = groupInfo.name;
					chatIndex.img = groupInfo.img;
					chatIndex.sex = 0;
					chatIndex.content = ChatClient.createContentText(element, nickname ? nickname : userInfo.name);
					let number = chatIndex.number ? chatIndex.number : 0;
					if (
						element.Source == ChatClient.uid ||
						(Chat.openChatData && Chat.openChatData.id == element.Target)
					) {
						//剔除用户自己发送的消息及会话打开时收到的消息
					} else {
						number += 1; //新增默认给1
					}
					chatIndex.number = number;
					chatIndex.lastid = element.Id;
					chatIndex.sendTime = element.SendTime;
					//更新数据库
					ChatClient.insertOrUpdateToChatIndex([ chatIndex ], update);
				}
			}
		}
		//通知消息首页进行数据刷新
		event.Send(event.Events.chat.chatIndexChanged);
	}

	/**
	 * 对指定数据中的撤回消息进行处理
	 *
	 * @static
	 * @param {Object} messageData 聊天消息
	 * @memberof ChatClient
	 */
	static async revokeChatMessage(messageData) {
		let revokeList = [];
		//提取撤销通知消息
		for (let i = 0; i < messageData.length; i++) {
			if (messageData[i].ContentType == ChatMessage.ContentType.Chat_Revoke) {
				revokeList.push(messageData[i]);
			}
		}
		//撤销消息处理
		if (revokeList != null && revokeList.length > 0) {
			for (let i = 0; i < revokeList.length; i++) {
				let revokeMsg = revokeList[i];
				let index = messageData.findIndex((n) => n.Id == revokeMsg.Content);
				revokeMsg.Id = Number(revokeMsg.Content);
				revokeMsg.Content = config.RevokeMsgContent;
				if (index != -1) {
					//如果在数据内，直接删除
					messageData.splice(index, 1);
				} else {
					ChatClient.deleteDataFormDB(ChatMessage.schema.name, 'id=' + revokeMsg.Id);
				}
			}
		}
		return messageData;
	}

	/**
	 * 从数据库查询当前用户最后一条消息id
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async getLastMessageId() {
		if (__DEV__) {
			console.log('\n从数据库查询当前用户最后一条消息id开始\n');
		}
		//从数据库获取消息
		let chatMessagses = [];
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			//排序，默认为增序排列
			chatMessagses = db.objects(ChatMessage.schema.name).sorted('id');
		} catch (error) {
			if (__DEV__) {
				console.log('获取lastId查询数据库' + ChatMessage.schema.name + '出错：' + error);
			}
			chatMessagses = null;
		}
		if (__DEV__) {
			console.log('\n从数据库查询结束\n');
		}
		if (chatMessagses == null || chatMessagses.length == 0) {
			return 0;
		}
		// //数据转换
		let result = ChatClient.convertDBData([ chatMessagses[chatMessagses.length - 1] ], ChatMessage.schema);
		//关闭数据库
		db.close();
		//返回最后一条消息id
		if (result != null && result.length > 0) {
			let id = result[result.length - 1].id;
			return id;
		}
		return 0;
	}

	/**
	 * 连接WebSocket
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async connectWS() {
		if (ChatClient.webSocketConn != null) {
			if (ChatClient.webSocketConn.readyState == WebSocket.CLOSED) {
				ChatClient.webSocketConn.close();
			}
			//防止连接关闭后无法重新连接，所以Chat.webSocketConn重置为null
			ChatClient.webSocketConn = null;
		}
		ChatClient.webSocketConn = new WebSocket(ChatClient.connUrl, '', {
			headers: {
				token: ChatClient.token,
				uid: ChatClient.uid + '',
				version: device.GetVersion(),
				build: device.GetBuildNumber()
			}
		});

		ChatClient.webSocketConn.onopen = () => {
			console.log('WebSocket连接打开');
			//更改状态
			ChatClient.chatClientState = ClientState.Connected;
			//发送聊天服务关闭通知
			event.Send(event.Events.chat.chatServiceStatusChanged, true);
		};

		ChatClient.webSocketConn.onmessage = async (e) => {
			//处理消息
			await ChatClient.HandleMesssage(e.data);
		};

		ChatClient.webSocketConn.onerror = (e) => {
			ChatClient.chatClientState = ClientState.Closed;
			console.log('WebSocket 发生错误：' + e.message);
		};

		ChatClient.webSocketConn.onclose = async (e) => {
			ChatClient.chatClientState = ClientState.Closed;
			// 连接被关闭了
			console.log('WebSocket 连接被关闭了:' + e.code + '==' + e.reason);
			await ChatClient.connectWSAgain();
		};
	}

	/**
	 * 重连聊天服务
	 */
	static async connectWSAgain() {
		let userdata = await user.GetUserInfo();
		if (userdata == null) {
			return; //用户未登录
		}
		console.log('WebSocket重新连接');
		if (ChatClient.webSocketConn.readyState != WebSocket.OPEN) {
			//如果聊天服务未打开，再试一次
			await ChatClient.connectWS();
		}
	}

	/**
	 * WebSocket消息处理
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async HandleMesssage(msgStr) {
		// 接收到了一个消息
		try {
			console.log('接收到了消息:' + msgStr);
			let chatMessage = JSON.parse(msgStr);
			//Source //数据来源,谁发送的消息
			//Target //数据目标,发给谁或者发给哪个群的
			if (chatMessage.MessageType == ChatMessage.MessageType.GroupMessage) {
				//如果是群组，获取群组信息，优先根据用户群设置处理
				let groupInfo = await ChatClient.getGroupInfo(chatMessage.Target);
				if (groupInfo != undefined && groupInfo != null) {
					if (Chat.openChatData != null && Chat.openChatData.id == chatMessage.Target) {
						//当前对话框打开,直接将数据增加到列表显示
						ChatClient.refreshMessageList(chatMessage);
					} else {
						//存储消息
						await ChatClient.SaveSingleMessage(chatMessage);
						if (groupInfo.ispush == 1) {
							//消息提醒
							await ChatClient.MessageRemind();
						}
					}
				}
			} else if (chatMessage.MessageType == ChatMessage.MessageType.UserMessage) {
				if (Chat.openChatData != null && Chat.openChatData.id == chatMessage.Source) {
					//当前对话框打开，不做提醒,直接将数据增加到列表显示
					ChatClient.refreshMessageList(chatMessage);
				} else {
					//存储消息
					await ChatClient.SaveSingleMessage(chatMessage);
					//消息提醒
					await ChatClient.MessageRemind();
				}
			}
		} catch (error) {
			console.log('解析WebSocket消息出错:' + error);
			// ChatClient.Stop();
		}
	}

	/**
	 * 消息提醒
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async MessageRemind() {
		//读取用户设置的缓存
		let vibrate = await cache.LoadFromFile(config.UserShockState);
		let audio = await cache.LoadFromFile(config.UserVoiceState);

		let isVibrate = vibrate !== null ? vibrate : true; //震动提示默认打开
		let isAudio = audio !== null ? audio : false; //声音提示默认关闭

		if (isVibrate) {
			Vibration.vibrate();
		}
		if (isAudio) {
			await ChatClient.playAudioFile(); //播放音频文件
		}
	}

	/**
	 * 播放音频文件
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async playAudioFile() {
		let url = require('../sound/ring.mp3');
		const callback = (error, sound) => {
			if (error) {
				console.log(error);
				return;
			}
			sound.play(() => {});
		};
		const sound = new Sound(url, (error) => callback(error, sound));
	}

	/**
	 * 存储消息到数据库，并进行相应的处理
	 *
	 * @static
	 * @param {Object} chatMessage 需要存储的消息
	 * @memberof ChatClient
	 */
	static async SaveSingleMessage(chatMessage) {
		//刷新聊天列表页数据
		await ChatClient.setChatIndexData([ chatMessage ]);
		//撤销消息处理
		if (chatMessage && chatMessage.ContentType == ChatMessage.ContentType.Chat_Revoke) {
			chatMessage.Id = Number(chatMessage.Content);
			chatMessage.Content = config.RevokeMsgContent;
			//数据库删除原消息
			await ChatClient.deleteDataFormDB(ChatMessage.schema.name, 'id=' + chatMessage.Id);
			//存储到数据库
			await ChatClient.insertOrUpdateToChatMessage([ chatMessage ], false);
			return;
		}
		//存储到数据库
		await ChatClient.insertOrUpdateToChatMessage([ chatMessage ], false);
	}

	/**
	 * 刷新未读消息数，从数据库查询并通知更新聊天页面数据
	 *
	 * @static
	 * @memberof ChatClient
	 */
	static async RefreshMessageCount() {
		let number = 0;

		let db = ChatClient.openDB(); //获取数据库对象
		let chatIndexsData = null;
		let chatIndexs = null;
		try {
			chatIndexsData = db.objects(ChatIndex.schema.name);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + ChatIndex.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		chatIndexs = ChatClient.convertDBData(chatIndexsData, ChatIndex.schema);
		//关闭数据库
		db.close();

		if (chatIndexs != null && chatIndexs.length > 0) {
			for (let i = 0; i < chatIndexs.length; i++) {
				number = number + chatIndexs[i].number;
			}
		}
	}

	/**
	 * 聊天通用post请求,如果http状态为200返回结果,如果不为200则返回null
	 *
	 * @static
	 * @param {string} url 网络请求url
	 * @param {object} [postArgs=null] post传递的参数,对象属性代表key,属性值代表value
	 * @returns 请求的数据结果
	 * @memberof ChatClient
	 */
	static async chatHttpPost(url, postArgs = null) {
		let postData = qs.stringify(postArgs);
		if (__DEV__) {
			console.log('聊天post请求：,url:' + url + ',\ndata:' + postData);
		}

		let result = await axios.post(url, postData, {
			headers: {
				version: device.GetVersion(),
				build: device.GetBuildNumber(),
				token: ChatClient.token,
				uid: ChatClient.uid
			}
		});

		if (__DEV__) {
			console.log('聊天post请求结果：\n' + JSON.stringify(result.data));
		}

		if (result.status != 200) {
			Alert.alert('网络请求失败');
			return;
		}

		return result.data;
	}

	/**
	 * 打开数据库
	 *
	 * @static
	 * @returns 返回realm对象
	 * @memberof ChatClient
	 */
	static openDB() {
		let realm = new Realm({
			schema: [
				ChatGroup.schema,
				ChatIndex.schema,
				ChatNickname.schema,
				ChatUser.schema,
				ChatMessage.schema,
				Advertising.schema
			]
		});
		return realm;
	}

	/**
	 * 将数据库查询结果转换为可直接操作的非索引结果集，以提高性能
	 *
	 * @static
	 * @param {object} data 数据库查询结果
	 * @param {schema} schema
	 * @returns 转换后可自由操作的数据
	 * @memberof ChatClient
	 */
	static convertDBData(data, schema) {
		let result = [];
		try {
			if (typeof data == 'object') {
				for (let i = 0; i < data.length; i++) {
					let obj = {};
					for (let key in schema.properties) {
						obj[key] = data[i][key];
					}
					result.push(Object.create(obj));
				}
			}
		} catch (error) {
			if (__DEV__) {
				console.log(schema.name + '表数据转换出错：');
				console.log(error);
			}
		}
		return result;
	}

	/**
	 * 删除指定表内符合过滤条件的数据
	 *
	 * @static
	 * @param {string} table  数据表名称，不可缺省
	 * @param {string} filterStr  数据过滤条件，不可缺省，传''表示无过滤条件即删除整个指定表数据
	 * @returns
	 * @memberof ChatClient
	 */
	static deleteDataFormDB(table, filterStr) {
		//删除前查询数据库是否存在符合条件数据
		let deleteData = null;
		let db = ChatClient.openDB();
		try {
			if (filterStr == '') {
				deleteData = db.objects(table);
			} else {
				deleteData = db.objects(table).filtered(filterStr);
			}
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + table + '出错:');
				console.log(error);
			}
		}
		try {
			if (deleteData != null) {
				db.write(() => {
					db.delete(deleteData);
				});
			}
		} catch (error) {
			if (__DEV__) {
				console.log('\n数据表' + table + '删除数据出错:');
				console.log(error);
			}
		}

		db.close();
	}

	/**
	 * 将指定数据添加、更新到ChatGroup数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @param {Boolean} isUpdate  是否为更新数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertOrUpdateToChatGroup(data, isUpdate) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//事务写在最外层，提高效率
		let db = ChatClient.openDB();

		try {
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						ChatGroup.schema.name,
						{
							id: data[i].id, //群id
							name: data[i].name, //群名称
							img: data[i].img, //群头像
							number: data[i].number, //群人数
							ispush: data[i].ispush //是否接受该群的推送
						},
						isUpdate //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}

		db.close();
	}

	/**
	 * 将指定数据添加、更新到ChatIndex数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @param {Boolean} isUpdate  是否为更新数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertOrUpdateToChatIndex(data, isUpdate) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//事务写在最外层，提for
		let db = ChatClient.openDB();
		try {
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						ChatIndex.schema.name,
						{
							pk: data[i].pk + '', //数据主键
							id: data[i].id, //用户id或者群id
							type: data[i].type, //数据类型,1为用户,2为群,使用ChatIndex.Type的值
							name: data[i].name, //名称,用户名称或者群名称
							content: data[i].content, //显示的聊天内容
							img: data[i].img, //头像
							sex: data[i].sex ? data[i].sex : 0, //性别,只有数据为用户时起效,群组
							lastid: data[i].lastid, //相应的最后一条聊天数据的id
							number: data[i].number, //显示的未读数量
							sendTime: data[i].sendTime //消息发送时间,Unix时间戳
						},
						isUpdate //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}

		db.close();
	}

	/**
	 * 将指定数据添加、更新到ChatNickname数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @param {Boolean} isUpdate  是否为更新数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertOrUpdateToChatNickname(data, isUpdate) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//事务写在最外层，提高效率
		let db = ChatClient.openDB();
		try {
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						ChatNickname.schema.name,
						{
							targetUid: data[i].targetUid ? data[i].targetUid : 0, //目标用户id
							nickName: data[i].nickName ? data[i].nickName : '' //昵称
						},
						isUpdate //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}

		db.close();
	}

	/**
	 * 将指定数据添加、更新到ChatGroup数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @param {Boolean} isUpdate  是否为更新数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertOrUpdateToChatUser(data, isUpdate) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//事务写在最外层，提高效率
		let db = ChatClient.openDB();
		try {
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						ChatUser.schema.name,
						{
							id: data[i].id, //用户id
							name: data[i].name, //用户名称
							sex: data[i].sex, //用户性别,1为男
							img: data[i].img, //用户头像
							mobile: data[i].mobile, //用户手机号
							company: data[i].company ? data[i].company : '', //用户所属公司
							companyshort: data[i].companyshort ? data[i].companyshort : '', //用户所属公司简称
							groupnames: data[i].groupnames ? data[i].groupnames : '' //用户所在圈子,名称字符串
						},
						isUpdate //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}
		db.close();
	}

	/**
	 * 将指定数据添加、更新到ChatMessage数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @param {Boolean} isUpdate  是否为更新数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertOrUpdateToChatMessage(data, isUpdate) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			//事务写在最外层，提高效率
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						ChatMessage.schema.name,
						{
							id: data[i].Id ? data[i].Id : data[i].id ? data[i].id : 0, //消息id,与服务器数据保持一致
							source: data[i].Source ? data[i].Source : data[i].source ? data[i].source : 0, //数据来源,谁发送的消息
							target: data[i].Target ? data[i].Target : data[i].target ? data[i].target : 0, //数据目标,发给谁或者发给哪个群的
							messageType: data[i].MessageType ? data[i].MessageType : data[i].messageType, //消息类型,1为用户消息,2位群组消息,3位系统消息,使用ChatMessage.MessageType
							content: data[i].Content ? data[i].Content + '' : data[i].content + '', //消息内容
							contentType: data[i].ContentType ? data[i].ContentType : data[i].contentType, //内容类型,消息的内容类型
							sendTime: data[i].SendTime ? data[i].SendTime : data[i].sendTime ? data[i].sendTime : '', //消息发送时间,Unix时间戳
							userInfo: data[i].UserInfo ? data[i].UserInfo : data[i].userInfo ? data[i].userInfo : '', //附加的用户信息json字符串
							groupInfo: data[i].GroupInfo
								? data[i].GroupInfo
								: data[i].groupInfo ? data[i].groupInfo : '' //附加的群信息json字符串
						},
						isUpdate //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}
		db.close();
	}

	/**
	 * 将指定数据添加到Advertising数据表中
	 *
	 * @static
	 * @param {Array} data  需要保存的数据
	 * @returns
	 * @memberof ChatClient
	 */
	static insertAdvertising(data) {
		//判断参数有效性
		if (data == null || data.length <= 0) {
			return;
		}
		//获取数据库对象
		let db = ChatClient.openDB();
		try {
			//事务写在最外层，提高效率
			db.write(() => {
				for (let i = 0; i < data.length; i++) {
					db.create(
						Advertising.schema.name,
						{
							id: data[i].id, //广告id
							img: data[i].img, //广告图片地址
							name: data[i].name, //广告名称
							aid: data[i].aid ? data[i].aid : 0, //广告编号
							createtime: data[i].createtime ? data[i].createtime : 0, //广告创建时间，Unix时间戳
							ctime: data[i].ctime ? data[i].ctime : 0, //可跳过时间
							ptime: data[i].ptime ? data[i].ptime : 0, //展示时间
							etime: data[i].etime ? data[i].etime : 0, //结束展示时间，Unix时间戳
							stime: data[i].stime ? data[i].stime : 0, //开始展示时间，Unix时间戳
							uptime: data[i].uptime ? data[i].uptime : 0, //广告更新时间，Unix时间戳
							url: data[i].url //广告跳转url
						},
						false //是否为更新数据
					);
				}
			});
		} catch (error) {
			console.log(error);
		}
		db.close();
	}

	/**
	 * 查询广告数据
	 *
	 * @static
	 * @returns
	 * @memberof ChatClient
	 */
	static getAdvertising() {
		let db = ChatClient.openDB(); //获取数据库对象
		let advertisingData = null;
		let advertising = null;
		try {
			advertisingData = db.objects(Advertising.schema.name);
		} catch (error) {
			if (__DEV__) {
				console.log('\n查询数据表' + Advertising.schema.name + '出错:');
				console.log(error);
			}
		}
		//数据转换
		advertising = ChatClient.convertDBData(advertisingData, Advertising.schema);
		//关闭数据库
		db.close();
		return advertising;
	}
}

/**
 * 聊天客户端状态
 *
 * @author wuzhitao
 * @class ClientState
 */
class ClientState {
	/**
	 * 开始启动
	 *
	 * @static
	 * @memberof ClientState
	 */
	static Starting;

	/**
	 * 成功连接到聊天服务器
	 *
	 * @static
	 * @memberof ClientState
	 */
	static Connected;

	/**
	 * 未连接到聊天服务器
	 *
	 * @static
	 * @memberof ClientState
	 */
	static Closed;
}

/**
 * 消息请求状态
 *
 * @class MessageResultCode
 */
export class MessageResultCode {
	/**
	 * 请求失败
	 * code:0
	 */
	static Failure = 0;
	/**
	 * 请求成功
	 * code:1
	 */
	static Success = 1;
	/**
	 * 用户未登录
	 * code:2
	 */
	static NoLogin = 2;
	/**
	 * 账号在其他设备登录
	 * code:3
	 */
	static LoginOnOther = 3;
	/**
	 * 用户不在群中
	 * code:4
	 */
	static UserNotInGroup = 4;
	/**
	 * 群不存在
	 * code:5
	 */
	static GroupNotExist = 5;
	/**
	 * 用户被禁言
	 * code:-1
	 */
	static UserWasBanned = -1;
	/**
	 * 好友不接收你的消息
	 * code:-2
	 */
	static FriendsNotReceiveYourMessage = -2;
	/**
	 * 发送消息数量达到今日上限
	 * code:-3
	 */
	static SendMessageLimit = -3;
	/**
	 * 当前账号已被禁用
	 * code:-4
	 */
	static UserIsDisabled = -4;
	/**
	 * 当前账号已被移除出此群
	 * code:-5
	 */
	static UserRemoved = -5;
	/**
	 * 网络不可用
	 * code:-100
	 */
	static NetworkUnavailable = -100;
}

/**
 * 群信息
 *
 * @author jyk
 * @class ChatGroup
 */
export class ChatGroup {}
ChatGroup.schema = {
	name: 'ChatGroup', //存储名称
	primaryKey: 'id',
	properties: {
		id: 'int', //群id
		name: 'string', //群名称
		img: 'string', //群头像
		number: { type: 'int', default: 0 }, //群人数
		ispush: { type: 'int', default: 1 } //是否接受该群的推送
	}
};

/**
 * 聊天首页列表数据
 *
 * @author jyk
 * @class ChatIndex
 */
export class ChatIndex {
	get pk() {
		return this.id + '_' + this.type;
	}
	//聊天首页列表类型
	static Type = {
		User: 1,
		Group: 2
	};
}
ChatIndex.schema = {
	name: 'ChatIndex',
	primaryKey: 'pk',
	properties: {
		pk: 'string', //数据主键
		id: 'int', //用户id或者群id
		type: 'int', //数据类型,1为用户,2为群,使用ChatIndex.Type的值
		name: 'string', //名称,用户名称或者群名称
		content: 'string', //显示的聊天内容
		img: 'string', //头像
		sex: { type: 'int', default: 1 }, //性别,只有数据为用户时起效
		lastid: { type: 'int', default: 0 }, //相应的最后一条聊天数据的id
		number: { type: 'int', default: 0 }, //显示的未读数量
		sendTime: { type: 'int', default: 0 } //消息发送时间,Unix时间戳
	}
};

/**
 * 昵称
 *
 * @author jyk
 * @class ChatNickname
 */
export class ChatNickname {}
ChatNickname.schema = {
	name: 'ChatNickname',
	primaryKey: 'targetUid',
	properties: {
		targetUid: 'int', //目标用户id
		nickName: 'string' //昵称
	}
};

/**
 * 用户数据
 *
 * @author jyk
 * @class ChatUser
 */
export class ChatUser {}
ChatUser.schema = {
	name: 'ChatUser',
	primaryKey: 'id',
	properties: {
		id: 'int', //用户id
		name: 'string', //用户名称
		sex: { type: 'int', default: 1 }, //用户性别,1为男
		img: 'string', //用户头像
		mobile: 'string', //用户手机号
		company: 'string', //用户所属公司
		companyshort: 'string', //用户所属公司简称
		groupnames: 'string' //用户所在圈子,名称字符串
	}
};

/**
 * 聊天数据
 *
 * @author jyk
 * @class ChatMessage
 */
export class ChatMessage {
	static MessageType = {
		UserMessage: 1,
		GroupMessage: 2,
		SystemMessage: 3
	};
	static ContentType = {
		/// <summary>
		/// 撤回消息
		/// </summary>
		Chat_Revoke: -1,
		/// <summary>
		/// 文本消息
		/// </summary>
		Chat_Text: 1,
		/// <summary>
		/// 图片消息
		/// </summary>
		Chat_Image: 2,
		/// <summary>
		/// 音频消息
		/// </summary>
		Chat_Audio: 3,
		/// <summary>
		/// 视频消息
		/// </summary>
		Chat_Video: 4,
		/// <summary>
		/// 踢出消息
		/// </summary>
		Chat_Out: 5
	};
}
ChatMessage.schema = {
	name: 'ChatMessage',
	primaryKey: 'id',
	properties: {
		id: 'int', //消息id,与服务器数据保持一致
		source: { type: 'int', default: 0 }, //数据来源,谁发送的消息
		target: { type: 'int', default: 0 }, //数据目标,发给谁或者发给哪个群的
		messageType: 'int', //消息类型,1为用户消息,2位群组消息,3位系统消息,使用ChatMessage.MessageType
		content: 'string', //消息内容
		contentType: 'int', //内容类型,消息的内容类型
		sendTime: 'int', //消息发送时间,Unix时间戳
		userInfo: 'string', //附加的用户信息json字符串
		groupInfo: 'string' //附加的群信息json字符串
	}
};

/**
 * 广告数据
 *
 * @author jyk
 * @class ChatUser
 */
export class Advertising {}
Advertising.schema = {
	name: 'Advertising',
	primaryKey: 'id',
	properties: {
		id: 'int', //广告id
		img: 'string', //广告图片地址
		name: 'string', //广告名称
		aid: { type: 'int', default: 0 }, //广告编号
		createtime: { type: 'int', default: 0 }, //广告创建时间，Unix时间戳
		ctime: { type: 'int', default: 0 }, //可跳过时间
		ptime: { type: 'int', default: 0 }, //展示时间
		etime: { type: 'int', default: 0 }, //结束展示时间，Unix时间戳
		stime: { type: 'int', default: 0 }, //开始展示时间，Unix时间戳
		uptime: { type: 'int', default: 0 }, //广告更新时间，Unix时间戳
		url: 'string' //广告跳转url
	}
};
