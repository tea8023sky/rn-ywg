/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PureComponent } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	StatusBar,
	FlatList,
	Image,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	TextInput,
	Linking,
	Switch,
	Platform,
	PermissionsAndroid,
	Modal,
	Clipboard
} from 'react-native';
import user from '../../logic/user';
import skin from '../../style';
import chat, { ChatIndex, ChatMessage, MessageResultCode } from '../../logic/chat';
import Header from '../header';
import { SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import event from '../../logic/event';
import image from '../../logic/image';
import TimeUtil from '../../logic/TimeUtil';
import net from '../../logic/net';
import Dynamic from './dynamic';
import Toast from 'react-native-root-toast';
import config from '../../config';
import ImagePicker from 'react-native-syan-image-picker';
import Upload from '../../logic/imgUtil';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Sound from 'react-native-sound';
import Dimensions from 'Dimensions';
import StringUtil from '../../logic/stringUtil';
let { width, height } = Dimensions.get('window');

//聊天列表图片消息数据
let sChatImages,
	bChatImages = null;

/**
 * 聊天首页列表页面
 *
 * @export
 * @class ChatIndexView
 * @extends {Component}
 */
export default class ChatIndexView extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			loginState: 0, //登录状态,默认为0用于界面显示加载中,1界面显示已经登录,-1界面显示未登录,提示用户登录
			refreshing: false,
			list: [],
			isLogin: false, //是否已登录
			isJoinCircle: false, //是否加入圈子
			chatServiceOpen: false //聊天服务是否打开
		};
		this.data = {
			chatIndex: null //ChatIndex对象
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: (headerProps) => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} backgroundColor={skin.activeTint} />
					<Header />
					<View
						style={{
							flexDirection: 'row',
							height: 60,
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: skin.activeTint
						}}
					>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'flex-end',
								alignItems: 'center'
							}}
						>
							<TouchableHighlight
								onPress={() => navigation.state.params.clickChat(navigation.state.params.chatSelected)}
								activeOpacity={1}
								underlayColor={skin.tint}
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									height: 32,
									paddingLeft: 1,
									backgroundColor: skin.tint
								}}
							>
								<View
									style={{
										backgroundColor: skin.main,
										justifyContent: 'center',
										alignItems: 'center',
										height: 30,
										width: 60,
										backgroundColor: navigation.state.params.chatSelected
											? skin.tint
											: skin.activeTint
									}}
								>
									<Text
										style={{
											color: navigation.state.params.chatSelected ? skin.activeTint : skin.tint,
											fontSize: 14,
											fontWeight: navigation.state.params.chatSelected ? 'bold' : 'normal'
										}}
									>
										聊天
									</Text>
								</View>
							</TouchableHighlight>
						</View>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center'
							}}
						>
							<TouchableHighlight
								onPress={() => navigation.state.params.clickDy(navigation.state.params.dySelected)}
								activeOpacity={1}
								underlayColor={skin.tint}
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									height: 32,
									paddingRight: 1,
									backgroundColor: skin.tint
								}}
							>
								<View
									style={{
										backgroundColor: skin.main,
										justifyContent: 'center',
										alignItems: 'center',
										height: 30,
										width: 60,
										backgroundColor: navigation.state.params.dySelected
											? skin.tint
											: skin.activeTint
									}}
								>
									<Text
										style={{
											color: navigation.state.params.dySelected ? skin.activeTint : skin.tint,
											fontSize: 14,
											fontWeight: navigation.state.params.dySelected ? 'bold' : 'normal'
										}}
									>
										动态
									</Text>
								</View>
							</TouchableHighlight>

							<TouchableHighlight
								onPress={() => navigation.state.params.clickPosted(navigation.state.params.dySelected)}
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								style={{
									flexDirection: 'row',
									flex: 1,
									justifyContent: 'flex-end',
									alignItems: 'center',
									height: 44,
									marginRight: 10
								}}
							>
								<View
									style={{
										backgroundColor: skin.main,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text style={{ color: skin.tint, fontSize: 14 }}>
										{navigation.state.params.dySelected ? '发表' : ''}
									</Text>
								</View>
							</TouchableHighlight>
						</View>
					</View>
				</View>
			);
		}
	});

	/**
   * 顶部聊天按钮事件
   *
   * @memberof ChatIndexView
   */
	chatClick = (select) => {
		//聊天按钮未选中时响应
		if (!select) {
			this.props.navigation.setParams({
				chatSelected: true,
				dySelected: false
			});
			console.log('聊天');
		}
	};

	/**
   * 顶部动态按钮事件
   *
   * @memberof ChatIndexView
   */
	dyClick = (select) => {
		//动态按钮未选中时响应
		if (!select) {
			this.props.navigation.setParams({
				chatSelected: false,
				dySelected: true
			});
			if (__DEV__) {
				console.log('切换到动态');
			}
		} else {
			if (__DEV__) {
				console.log('刷新动态');
			}
			this.refs.dynamicView.Refresh();
		}
	};

	/**
   * 顶部发表按钮事件
   *
   * @memberof ChatIndexView
   */
	postedClick = (dyelect) => {
		//动态按钮选中时响应
		if (dyelect) {
			this.nav.navigate('publish');
		}
	};

	//组件初始化完毕
	componentDidMount() {
		let params = this.props.navigation.state.params;
		let chatSelecte = true;
		let dySelecte = false;
		if (params != undefined && params != null) {
			chatSelecte = params.chatSelected;
			dySelecte = params.dySelected;
		}
		//传参给页面导航栏
		this.props.navigation.setParams({
			chatSelected: chatSelecte, //聊天选中状态
			dySelected: dySelecte, //动态选中状态
			clickChat: this.chatClick, //聊天按钮点击事件
			clickDy: this.dyClick, //动态按钮点击事件
			clickPosted: this.postedClick, //发表按钮点击事件
			myNavigation: this.nav //页面重定向传递参数
		});

		//订阅用户登录事件,以便刷新界面数据
		event.Sub(this, event.Events.user.login, this.initUI);
		this.initUI(); //加载界面
		//订阅聊天首页数据刷新通知
		event.Sub(this, event.Events.chat.chatIndexChanged, this.resetChatIndexData);
		// //订阅聊天服务打开或关闭操作
		event.Sub(this, event.Events.chat.chatServiceStatusChanged, this.changeChatServiceStatus);
	}

	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	changeChatServiceStatus = (status) => {
		this.setState({ chatServiceOpen: status });
	};

	/**
   * 添加数据
   *
   * @param {Array} chatIndexData 首页ChatIndex数据数组
   * @memberof ChatIndexView
   */
	setChatIndexData = (chatIndexData) => {
		let indexList = [];
		let groupList = [];
		let userList = [];
		let numbers = 0;
		if (chatIndexData != undefined && chatIndexData != null && chatIndexData.length > 0) {
			for (let i = 0; i < chatIndexData.length; i++) {
				chatIndexData[i].key = chatIndexData[i].pk + ':' + new Date().getTime();
				numbers += chatIndexData[i].number;
				if (chatIndexData[i].type == ChatIndex.Type.Group) {
					groupList.push(chatIndexData[i]);
				} else {
					userList.push(chatIndexData[i]);
				}
			}
			indexList = groupList
				.sort(function(obj1, obj2) {
					return obj1.sendTime - obj2.sendTime;
				})
				.reverse()
				.concat(
					userList
						.sort(function(obj1, obj2) {
							return obj1.sendTime - obj2.sendTime;
						})
						.reverse()
				);
			this.setState({ list: indexList });
		}

		let numStr = '';
		if (numbers > 0 && numbers <= 99) {
			numStr = numbers + '';
		} else if (numbers > 99) {
			numStr = '99+';
		}

		if (this.state.chatServiceOpen == true) {
			event.Send(event.Events.main.chatIconNum, numStr);
		}
	};

	/**
   * 聊天列表分割线
   *
   * @memberof ChatIndexView
   */
	chatIndexItemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: skin.darkSeparate }} />;
	};

	//条目视图
	chatItemView = ({ item }) => {
		if (item != undefined && item != null) {
			return <ChatIndexItem navigation={this.props.navigation} data={item} />;
		}
	};

	/**
   * 聊天首页页面初始化
   *
   * @memberof ChatIndexView
   */
	initUI = async () => {
		let logined = await user.IsLogin(); //获取当前用户登录状态
		let isJoinCircle = await user.IsJoinCircle(); //是否加入圈子
		if (logined && isJoinCircle) {
			//数据加载完成前提示加载中
			this.setState({ loginState: 0, isLogin: true, isJoinCircle: true });
			//开启聊天服务
			await chat.init();
			//本地数据初始化
			await chat.initLocalData();
			//数据加载完成后刷新界面
			this.setState({ loginState: 1 });
			//获取数据
			this.refreshChatIndexData();
		} else {
			this.setState({ loginState: -1 });
		}
	};

	/**
     * 首页数据刷新
     *
     * @memberof ChatIndexView
     */
	refreshChatIndexData = async () => {
		this.setState({ refreshing: true });
		//本地数据初始化
		//await chat.initLocalData();
		//加载首页数据
		let chatIndexData = await chat.getChatIndexData();
		this.setChatIndexData(chatIndexData);
		this.setState({ refreshing: false });
	};

	/**
     * 重置数据
     *
     * @memberof ChatIndexView
     */
	resetChatIndexData = async () => {
		//本地数据初始化
		await chat.initLocalData();
		//加载首页数据
		let chatIndexData = await chat.getChatIndexData();
		this.setChatIndexData(chatIndexData);
	};

	render() {
		if (this.state.loginState == 0) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text>数据加载中...</Text>
				</View>
			);
		} else if (this.state.loginState == 1) {
			return this.chatView();
		} else {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text>
						{this.state.isLogin == false ? (
							'您未登录，请先登录'
						) : this.state.isJoinCircle == false ? (
							'您的资料尚未完善，请先完善资料'
						) : (
							''
						)}
					</Text>
				</View>
			);
		}
	}

	/**
   * 聊天首页视图
   *
   * @returns
   * @memberof ChatIndexView
   */
	chatView() {
		if (this.props.navigation.state.params.chatSelected && !this.props.navigation.state.params.dySelected) {
			return this.chatIndexView();
		} else if (!this.props.navigation.state.params.chatSelected && this.props.navigation.state.params.dySelected) {
			return this.dynamicView();
		} else {
			return null;
		}
	}

	/**
   * 聊天首页聊天列表
   *
   * @returns
   * @memberof ChatIndexView
   */
	chatIndexView() {
		return (
			<View
				style={{
					backgroundColor: skin.background,
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'flex-start'
				}}
			>
				{/* <TouchableHighlight onPress={this.searchUser} activeOpacity={1} underlayColor={skin.transparentColor}>
					<View>
						<SearchBar
							containerStyle={{
								backgroundColor: skin.tint,
								borderTopColor: skin.tint
							}}
							inputStyle={{
								backgroundColor: skin.lightSeparate
							}}
							lightTheme
							placeholder={'搜索姓名、公司名、手机号'}
							editable={false}
						/>
					</View>
				</TouchableHighlight> */}
				<TouchableHighlight
					onPress={() => this.searchUser()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							margin: 6,
							backgroundColor: skin.lightSeparate,
							borderRadius: 3
						}}
					>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Icon name="ios-search" size={18} color={skin.subtitle} />
						</View>
						<Text
							style={{
								flex: 9,
								color: skin.messageTextColor,
								padding: 10,
								paddingBottom: 10
							}}
						>
							搜索姓名、公司名、手机号
						</Text>
					</View>
				</TouchableHighlight>
				<View
					style={{
						height: 1,
						backgroundColor: skin.darkSeparate
					}}
				/>
				<FlatList
					ItemSeparatorComponent={this.chatIndexItemSeparator}
					ListFooterComponent={this.chatIndexItemSeparator}
					data={this.state.list}
					extraData={this.state}
					refreshing={this.state.refreshing}
					renderItem={this.chatItemView}
				/>
			</View>
		);
	}

	/**
   * 聊天首页聊天列表顶部搜索框点击事件
   *
   * @memberof ChatIndexView
   */
	searchUser = async () => {
		//跳转到
		this.nav.navigate('searchChatUser');
	};

	/**
   * 聊天首页动态列表
   *
   * @returns
   * @memberof ChatIndexView
   */
	dynamicView() {
		return (
			<View style={{ flex: 1 }}>
				<Dynamic ref="dynamicView" navigation={this.props.navigation} />
			</View>
		);
	}
}

/**
 * 聊天首页列表视图
 *
 * @export
 * @class ChatIndexItem
 * @extends {PureComponent}
 */
export class ChatIndexItem extends PureComponent {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			chatIndex: this.props.data //需要展示的信息
		};
		this.state = {
			img: image.DefaultAvatar.man, //默认头像
			name: '', //圈子名字或个人名字（昵称）
			content: '', //显示的聊天内容
			time: '', //显示的最后一条消息发送时间
			number: 0 //显示的未读消息数
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.initChatIndexData();
	}

	/**
   * 初始化相关数据
   *
   * @memberof ChatIndexItem
   */
	initChatIndexData = () => {
		let chatIndex = this.data.chatIndex;
		if (chatIndex != undefined && chatIndex != null) {
			this.getChatIndexImage(chatIndex);
			this.setState({
				number: chatIndex.number,
				name: chatIndex.name,
				content: chatIndex.content
			});
			this.getSendTime();
		}
	};

	/**
   *  聊天列表数据条目点击事件
   *
   * @memberof ChatIndexItem
   */
	chatIndexItemPress = async () => {
		if (__DEV__) {
			console.log('点击了' + this.state.name);
		}

		let result = null;
		if (this.data.chatIndex.type == ChatIndex.Type.User) {
			result = await chat.GetFullUserInfo(this.data.chatIndex.id, true);
		} else if (this.data.chatIndex.type == ChatIndex.Type.Group) {
			result = await chat.GetGroupInfo(this.data.chatIndex.id);
		}
		//进入聊天对话页面
		this.nav.navigate('chatView', {
			chatIndex: this.data.chatIndex,
			userOrGroupInfo: result
		});
	};

	/**
   * 聊天列表数据条目长按事件
   *
   * @memberof ChatIndexItem
   */
	chatIndexItemLongPress = () => {
		if (__DEV__) {
			console.log('长按了' + this.state.name);
		}
		if (this.data.chatIndex.type == ChatIndex.Type.User) {
			Alert.alert('是否删除与' + this.state.name + '的聊天？', '', [
				{
					text: '是',
					onPress: async () => {
						let result = await chat.deleteFriend(this.data.chatIndex);
						if (result) {
							//通知聊天首页数据刷新
							let chatIndexData = await chat.getChatIndexData();
							event.Send(event.Events.chat.chatIndexChanged, chatIndexData);
						}
					}
				},
				{ text: '否' }
			]);
		}
	};

	/**
   * 未读消息数显示视图
   *
   * @memberof ChatIndexItem
   */
	getNumberView() {
		if (this.state.number > 0) {
			return (
				<View
					style={{
						width: 16,
						height: 16,
						borderRadius: 8,
						backgroundColor: skin.red,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							fontSize: this.getNumberFontSize(this.state.number),
							color: skin.tint,
							textAlign: 'center',
							textAlignVertical: 'center'
						}}
					>
						{this.state.number > 99 ? 99 + '+' : this.state.number}
					</Text>
				</View>
			);
		} else {
			return null;
		}
	}

	/**
   * 根据未读消息数设置字体大小
   *
   * @memberof ChatIndexItem
   */
	getNumberFontSize(number) {
		if (Platform.OS == 'ios') {
			if (number > 99) {
				return 7;
			} else if (number > 9) {
				return 9;
			} else {
				return 10;
			}
		} else {
			if (number > 99) {
				return 8;
			} else {
				return 10;
			}
		}
	}

	/**
   * 消息发送时间转换
   *
   * @memberof ChatIndexItem
   */
	getSendTime() {
		let sendTime = '';
		let timeStr = this.data.chatIndex.sendTime;
		if (timeStr != null && timeStr != '') {
			sendTime = TimeUtil.getChatIndexTime(timeStr);
		}
		this.setState({ time: sendTime });
	}
	/**
   * 聊天首页用户头像处理
   *
   * @returns
   * @memberof ChatIndexItem
   */
	getChatIndexImage(chatIndex) {
		let avatarSource = image.GetSmallImageSource(chatIndex.img);
		if (avatarSource == image.ErrorImg.default) {
			switch (this.data.chatIndex.sex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		this.setState({ img: avatarSource });
	}

	render() {
		if (this.data.chatIndex != undefined && this.data.chatIndex != null) {
			return (
				<TouchableHighlight
					onPress={() => {
						this.chatIndexItemPress();
					}}
					onLongPress={() => {
						this.chatIndexItemLongPress();
					}}
					delayLongPress={1000}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 60,
							flex: 1,
							backgroundColor: skin.tint
						}}
					>
						<Image
							style={{
								position: 'absolute',
								height: 40,
								width: 40,
								marginHorizontal: 10,
								borderRadius: 20
							}}
							source={this.state.img}
						/>
						<View
							style={{
								width: 60,
								height: 60,
								paddingRight: 5,
								paddingBottom: 25,
								justifyContent: 'center',
								alignItems: 'flex-end'
							}}
						>
							{this.getNumberView()}
						</View>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'flex-start',
								height: 60,
								marginRight: 10,
								backgroundColor: skin.tint
							}}
						>
							<Text
								numberOfLines={1}
								style={{
									color: skin.messageTextColor,
									fontSize: 16,
									textAlign: 'left',
									marginBottom: 3
								}}
							>
								{this.state.name}
							</Text>
							<Text numberOfLines={1} style={{ color: '#898E91', fontSize: 14, textAlign: 'left' }}>
								{this.state.content}
							</Text>
						</View>
						<View
							style={{
								justifyContent: 'flex-start',
								height: 60,
								paddingVertical: 10,
								marginRight: 10,
								backgroundColor: skin.tint
							}}
						>
							<Text
								style={{
									color: skin.subtitle,
									fontSize: 12,
									textAlign: 'right'
								}}
							>
								{this.state.time}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			);
		}
		return null;
	}
}

/**
 * 聊天对话页面
 *
 * @export
 * @class ChatView
 * @extends {Component}
 */
export class ChatView extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			groupNumber: 0, //群组人数
			chatIndex: null, //从聊天列表传过来的信息
			searchUser: null, //从用户搜索页面传过来的信息
			msgContent: '', //文本消息输入框内容
			chatName: '', //群或者用户名
			audioPath: '', //录音文件路径
			titleName: '', //标题名称
			emojiIcon: [
				'😠',
				'😩',
				'😲',
				'😞',
				'😵',
				'😰',
				'😒',
				'😍',
				'😅',
				'😂',
				'😢',
				'😭',
				'😨',
				'😱',
				'🙅',
				'🙆',
				'🙏',
				'💪',
				'✊',
				'✋',
				'✌',
				'👎',
				'❤',
				'🎉',
				'☀',
				'💋',
				'🙌',
				'⛄',
				'⚡',
				'🌹',
				'🎁'
			] //emoji数组
		};
		this.state = {
			userOrGroupInfo: null, //用户或者圈子详细信息
			searchUser: null, //从用户搜索页面传过来的信息
			chatIndex: null, //传递给聊天对话列表的信息
			recordingshow: false, //录音按钮是否显示
			emojiShow: false, //表情选择视图是否显示
			name: '', //导航栏显示的名字
			recordBtnStr: '按住 说话', //录音按钮显示文字
			sending: false, //标记是否正在发送消息
			sendBtnStr: '确定', //确认发送按钮显示文字
			recording: false, //是否录音中
			recordinged: false, //是否完成录音
			currentTime: 0, //开始录音到现在的持续时间
			isOnFocus: false, //消息编辑文本框是否获得焦点
			textValue: '',
			keyboardHeight: 0
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		title: navigation.state.params.titleName ? navigation.state.params.titleName : '',
		headerRight: (
			<TouchableHighlight
				onPress={() => navigation.state.params.rightClick(navigation.state.params.isUser)}
				activeOpacity={1}
				underlayColor={skin.transparentColor}
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					marginHorizontal: 20
				}}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: skin.main,
						justifyContent: 'center',
						alignItems: 'center',
						height: 40
					}}
				>
					<Icon
						name={navigation.state.params.rightIcon}
						style={{ marginLeft: 20 }}
						size={25}
						color={skin.tint}
					/>
				</View>
			</TouchableHighlight>
		)
	});

	/**
   * 导航栏右侧按钮事件
   *
   * @memberof UpdataInfo
   */
	rightClick = async (isUser) => {
		if (isUser) {
			Alert.alert('点击确定给' + this.state.name + '拨打电话', '', [
				{
					text: '取消'
				},
				{
					text: '确定',
					onPress: () => {
						this.callPhoneNumber();
					}
				}
			]);
		} else {
			//跳转圈子设置界面
			this.nav.navigate('groupSetting', {
				groupInfo: this.state.userOrGroupInfo
			});
		}
	};

	/**
   * 拨打电话
   *
   * @memberof ChatView
   */
	callPhoneNumber() {
		if (this.state.userOrGroupInfo != null) {
			let phone = this.state.userOrGroupInfo.mobile ? this.state.userOrGroupInfo.mobile : null;
			if (phone != null) {
				let url = 'tel: ' + phone;
				Linking.canOpenURL(url)
					.then((supported) => {
						if (!supported) {
							Alert.alert('您的设备不支持该功能');
						} else {
							return Linking.openURL(url);
						}
					})
					.catch((err) => console.log(err));
			} else {
				Alert.alert('未获取到用户手机号');
			}
		} else {
			Alert.alert('用户资料获取失败');
		}
	}

	//组件初始化完毕
	componentDidMount() {
		//聊天列表首页
		this.data.chatIndex = this.props.navigation.state.params.chatIndex
			? this.props.navigation.state.params.chatIndex
			: null;

		//用户搜索列表
		this.data.searchUser = this.props.navigation.state.params.searchUser
			? this.props.navigation.state.params.searchUser
			: null;

		//用户或者群组资料
		let userOrGroupInfo = this.props.navigation.state.params.userOrGroupInfo
			? this.props.navigation.state.params.userOrGroupInfo
			: null;

		if (userOrGroupInfo != undefined && userOrGroupInfo != null) {
			this.setState({ userOrGroupInfo: userOrGroupInfo });
			this.data.groupNumber = userOrGroupInfo.number ? userOrGroupInfo.number : 0;
		}

		if (this.data.chatIndex != null && this.data.searchUser == null) {
			//保存当前打开的聊天窗口
			chat.openChatData = this.data.chatIndex;
			this.setState({ chatIndex: this.data.chatIndex });
			let titleName = '';
			let rightIcon = '';
			let isUser = true;
			if (this.data.chatIndex.type == ChatIndex.Type.User) {
				titleName = this.data.chatIndex.name;
				this.data.chatName = titleName;
				this.setState({ name: titleName });
				rightIcon = 'ios-call-outline';
			} else if (this.data.chatIndex.type == ChatIndex.Type.Group) {
				isUser = false;
				titleName = this.data.chatIndex.name;
				this.data.chatName = titleName;
				rightIcon = 'ios-settings-outline';
			}

			if (this.data.groupNumber > 0) {
				titleName += '(' + this.data.groupNumber + ')';
			}
			this.data.titleName = titleName;
			this.props.navigation.setParams({
				rightClick: this.rightClick,
				isUser: isUser,
				titleName: titleName,
				rightIcon: rightIcon
			});
		} else if (this.data.chatIndex == null && this.data.searchUser != null) {
			//保存当前打开的聊天窗口
			chat.openChatData = this.data.searchUser;
			this.setState({ searchUser: this.data.searchUser });
			let nick = this.data.searchUser.nick;
			let titleName = '';
			if (nick != undefined && nick != null && nick != '') {
				titleName = nick;
			} else {
				titleName = this.data.searchUser.name;
			}
			this.data.chatName = titleName;
			this.data.titleName = titleName;
			this.setState({ name: titleName });
			this.props.navigation.setParams({
				rightClick: this.rightClick,
				isUser: true,
				titleName: titleName,
				rightIcon: 'ios-call-outline'
			});
		}

		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
	}

	//在组件销毁的时候要将订阅移除
	componentWillUnmount() {
		// event.UnSub(this);
		//清空保存当前打开的聊天窗口
		chat.openChatData = null;
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	_keyboardDidShow(e) {
		this.setState({
			// keyboardHeight:e.startCoordinates.height
			keyboardHeight: e.endCoordinates.height
		});
	}

	_keyboardDidHide(e) {
		this.setState({
			keyboardHeight: 0
		});
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'flex-end',
					backgroundColor: skin.chatBackground
				}}
			>
				<ChatMessageList
					navigation={this.props.navigation}
					chatIndex={this.state.chatIndex}
					chatUser={this.state.searchUser}
					dismissEmoji={() => this.dismissEmojiView()}
				/>

				<View
					style={{
						height: 1,
						backgroundColor: skin.darkSeparate
					}}
				/>
				{this.sendMsgView()}
			</View>
		);
	}

	/**
   * emoji表情输入视图消失
   *
   * @memberof ChatView
   */
	dismissEmojiView = () => {
		if (this.state.emojiShow) {
			this.setState({ emojiShow: false, recordingshow: false });
		}
	};

	/**
   * 消息发送视图
   *
   * @returns
   * @memberof ChatView
   */
	sendMsgView() {
		if (Platform.OS == 'ios') {
			return (
				// <KeyboardAvoidingView behavior="padding">
				<View>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 50,
							backgroundColor: skin.chatBackground
						}}
					>
						<TouchableHighlight
							onPress={() => this.changInputType()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									marginHorizontal: 5
								}}
							>
								<Image
									style={{
										height: 30,
										width: 30
									}}
									source={this.state.recordingshow ? image.chat.keybord : image.chat.voice}
								/>
							</View>
						</TouchableHighlight>
						{this.inputOrRecordingView()}
						<TouchableHighlight
							onPress={() => this.selectImage()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									marginHorizontal: 5
								}}
							>
								<Image
									style={{
										height: 30,
										width: 30
									}}
									source={image.chat.camera}
								/>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.changEmojiView()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{
										height: 30,
										width: 30
									}}
									source={this.state.emojiShow ? image.chat.keybord : image.chat.emoji}
								/>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.sendMessage()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 38,
									width: 50,
									marginHorizontal: 5,
									backgroundColor: skin.activeTint,
									borderRadius: 5
								}}
							>
								<Text style={{ color: skin.tint, fontSize: 14 }}>{this.state.sendBtnStr}</Text>
							</View>
						</TouchableHighlight>
					</View>
					{this.emojiView()}
					{this.state.isOnFocus == true ? <View style={{ height: this.state.keyboardHeight }} /> : null}
				</View>
				// </KeyboardAvoidingView>
			);
		}
		return (
			<View>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'flex-start',
						alignItems: 'center',
						height: 50,
						backgroundColor: skin.chatBackground
					}}
				>
					<TouchableHighlight
						onPress={() => this.changInputType()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								marginHorizontal: 5
							}}
						>
							<Image
								style={{
									height: 30,
									width: 30
								}}
								source={this.state.recordingshow ? image.chat.keybord : image.chat.voice}
							/>
						</View>
					</TouchableHighlight>
					{this.inputOrRecordingView()}
					<TouchableHighlight
						onPress={() => this.selectImage()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								marginHorizontal: 5
							}}
						>
							<Image
								style={{
									height: 30,
									width: 30
								}}
								source={image.chat.camera}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => this.changEmojiView()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Image
								style={{
									height: 30,
									width: 30
								}}
								source={this.state.emojiShow ? image.chat.keybord : image.chat.emoji}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => this.sendMessage()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								height: 38,
								width: 50,
								marginHorizontal: 5,
								backgroundColor: skin.activeTint,
								borderRadius: 5
							}}
						>
							<Text style={{ color: skin.tint, fontSize: 14 }}>{this.state.sendBtnStr}</Text>
						</View>
					</TouchableHighlight>
				</View>
				{this.emojiView()}
			</View>
		);
	}

	/**
   * 选择图片
   *
   * @memberof ChatView
   */
	selectImage = async () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}

		if (this.state.sending) {
			//正在发送时不响应该事件
			return;
		}
		this.setState({ sending: true, sendBtnStr: '发送中' }); //更改状态

		if (this.refs.textInput) {
			this.refs.textInput.blur(); //让文本输入框失去焦点
		}

		//消息类型
		let msgType = ChatMessage.MessageType.UserMessage; //默认为用户消息
		if (this.state.chatIndex != null) {
			if (this.state.chatIndex.type == ChatIndex.Type.Group) {
				msgType = ChatMessage.MessageType.GroupMessage;
			}
		}

		//发送目标
		let target = 0;
		if (this.state.chatIndex != null) {
			target = this.state.chatIndex.id;
		}
		if (this.state.searchUser != null) {
			target = this.state.searchUser.id;
		}

		if (target == chat.getUserUid()) {
			Alert.alert('不能给自己发送消息');
			this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
			return;
		}

		//消息内容类型
		let contentType = ChatMessage.ContentType.Chat_Image; //图片类型

		let imglens = 9; //限制每次选择图片数量为最多9张
		//调用相册上传图片（selectedPhotos为选中的图片数组）
		ImagePicker.showImagePicker(image.ImagePickerMultiOptions(imglens), async (err, selectedPhotos) => {
			if (err) {
				// 取消选择
				return;
			}
			for (let i = 0; i < selectedPhotos.length; i++) {
				//上传图片
				let uploadres = await Upload.UploadImg(selectedPhotos[i], 'ywg_chat');

				if (selectedPhotos.length > 1) {
					this.props.navigation.setParams({
						titleName: i + 1 + '/' + selectedPhotos.length
					});
				}

				if (uploadres) {
					//发送消息
					let result = await chat.sendMessage(msgType, target, uploadres, contentType);
					if (result != MessageResultCode.Success) {
						if (
							msgType == ChatMessage.MessageType.GroupMessage &&
							result == MessageResultCode.UserRemoved
						) {
							Alert.alert('', '您被踢出' + this.data.chatName + '圈子,如有疑问请联系管理员', [
								{
									text: '确定',
									onPress: () => {
										this.nav.goBack();
									}
								}
							]);
						} else {
							let toastStr = chat.sendResultToString(result);
							Toast.show(toastStr, {
								duration: Toast.durations.SHORT,
								position: Toast.positions.BOTTOM
							});
						}
					}
				}
			}

			if (selectedPhotos.length > 1) {
				this.props.navigation.setParams({ titleName: this.data.titleName });
			}
		});

		this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
	};

	/**
   * 发送消息
   *
   * @memberof ChatView
   */
	sendMessage = async () => {
		if (this.state.sending) {
			//正在发送时不响应该事件
			return;
		}
		this.setState({ sending: true, sendBtnStr: '发送中' }); //更改状态
		//消息类型
		let msgType = ChatMessage.MessageType.UserMessage; //默认为用户消息
		if (this.state.chatIndex != null) {
			if (this.state.chatIndex.type == ChatIndex.Type.Group) {
				msgType = ChatMessage.MessageType.GroupMessage;
			}
		}
		//发送目标
		let target = 0;
		if (this.state.chatIndex != null) {
			target = this.state.chatIndex.id;
		}
		if (this.state.searchUser != null) {
			target = this.state.searchUser.id;
		}

		if (target == chat.getUserUid()) {
			Alert.alert('不能给自己发送消息');
			this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
			return;
		}

		//消息内容类型
		let contentType = ChatMessage.ContentType.Chat_Text; //默认为文本类型

		let content = ''; //消息内容

		if (this.data.msgContent != '') {
			content = this.data.msgContent.toString().trim();
		}

		if (target <= 0 || content == '') {
			this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
			return;
		}

		let result = await chat.sendMessage(msgType, target, content, contentType);
		if (result == MessageResultCode.Success) {
			this.refs.textInput.clear();
			this.setState({ textValue: '' });
			this.data.msgContent = '';
		} else {
			if (msgType == ChatMessage.MessageType.GroupMessage && result == MessageResultCode.UserRemoved) {
				Alert.alert('', '您被踢出' + this.data.chatName + '圈子,如有疑问请联系管理员', [
					{
						text: '确定',
						onPress: () => {
							this.nav.goBack();
						}
					}
				]);
			} else {
				let toastStr = chat.sendResultToString(result);
				Toast.show(toastStr, {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		}
		this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
	};

	/**
   * 表情或者文本输入切换按钮事件
   *
   * @memberof ChatView
   */
	changEmojiView = () => {
		if (this.refs.textInput) {
			this.refs.textInput.blur(); //让文本输入框失去焦点
		}

		if (this.state.emojiShow) {
			this.setState({ emojiShow: false, recordingshow: false });
		} else {
			Keyboard.dismiss(); //隐藏键盘
			this.setState({ emojiShow: true, recordingshow: false });
		}
	};

	/**
   * emoji表情点击操作
   *
   * @memberof ChatView
   */
	emojiPress = (emojiStr) => {
		let value = this.state.textValue;
		this.setState({ textValue: value ? value + emojiStr : emojiStr });
		this.data.msgContent = value ? value + emojiStr : emojiStr;
	};

	/**
   * emoji表情输入界面删除按钮操作
   *
   * @memberof ChatView
   */
	deletePress = () => {
		let value = this.state.textValue;
		if (value && value.length > 0) {
			let newValue = null;
			let hasEmoji = false;
			for (let i = 0; i < this.data.emojiIcon.length; i++) {
				hasEmoji = value.endsWith(this.data.emojiIcon[i]); //判断是否以emoji表情结尾
				if (hasEmoji) {
					let emoji_index = value.lastIndexOf(this.data.emojiIcon[i]); //获取最后一个emoji表情下标
					newValue = value.substring(0, emoji_index);
					break; //找到就停止循环
				}
			}
			if (!hasEmoji) {
				//非emoji表情结尾
				newValue = value.substring(0, value.length - 1);
			}
			this.data.msgContent = newValue;
		}
		this.setState({ textValue: this.data.msgContent });
	};

	/**
   * emoji表情选择输入视图
   *
   * @returns
   * @memberof ChatView
   */
	emojiView() {
		if (this.state.emojiShow) {
			let emojiViewWidth = (width - 10) / 8;
			return (
				<View
					style={{
						justifyContent: 'flex-start',
						alignItems: 'center',
						height: 160,
						backgroundColor: skin.tint
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 40,
							marginHorizontal: 5,
							backgroundColor: skin.tint
						}}
					>
						<TouchableHighlight
							onPress={() => this.emojiPress('😠')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😠</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('😩')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😩</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😲')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😲</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😞')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😞</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😵')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😵</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('😰')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😰</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😒')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😒</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😍')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😍</Text>
							</View>
						</TouchableHighlight>
					</View>

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 40,
							marginHorizontal: 5,
							backgroundColor: skin.tint
						}}
					>
						<TouchableHighlight
							onPress={() => this.emojiPress('😅')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😅</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('😂')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😂</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😢')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😢</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😭')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😭</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('😨')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😨</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('😱')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>😱</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('🙅')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🙅</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('🙆')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🙆</Text>
							</View>
						</TouchableHighlight>
					</View>

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 40,
							marginHorizontal: 5,
							backgroundColor: skin.tint
						}}
					>
						<TouchableHighlight
							onPress={() => this.emojiPress('🙏')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🙏</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('💪')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>💪</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('✊')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>✊</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('✋')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>✋</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('✌')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>✌</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('👎')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>👎</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('❤')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>❤</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('🎉')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🎉</Text>
							</View>
						</TouchableHighlight>
					</View>

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 40,
							marginHorizontal: 5,
							backgroundColor: skin.tint
						}}
					>
						<TouchableHighlight
							onPress={() => this.emojiPress('☀')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>☀</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('💋')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>💋</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('🙌')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🙌</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('⛄')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>⛄</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('⚡')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>⚡</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							onPress={() => this.emojiPress('🌹')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🌹</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.emojiPress('🎁')}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Text style={{ fontSize: 15, color: skin.yellow }}>🎁</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							onPress={() => this.deletePress()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: emojiViewWidth
								}}
							>
								<Icon
									name="ios-backspace-outline"
									style={{ color: skin.darkSeparate }}
									size={25}
									color={skin.tint}
								/>
							</View>
						</TouchableHighlight>
					</View>
				</View>
			);
		} else {
			return null;
		}
	}

	/**
   * 录音或者输入文本切换按钮事件
   *
   * @memberof ChatView
   */
	changInputType = () => {
		if (this.state.recordingshow) {
			this.setState({ recordingshow: false, emojiShow: false, isOnFocus: false });
		} else {
			this.setState({ recordingshow: true, emojiShow: false, isOnFocus: false });
		}
	};

	/**
   * 文本输入框失去焦点回调
   *
   * @memberof ChatView
   */
	textInputBlur = () => {
		this.setState({ isOnFocus: false });
	};

	/**
   * 文本输入框获得焦点回调
   *
   * @memberof ChatView
   */
	textInputFocus = () => {
		this.setState({ isOnFocus: true, recordingshow: false, emojiShow: false });
	};

	/**
   * 按住录制音频事件
   *
   * @memberof ChatView
   */
	recordingLongPress = async () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}

		if (this.state.sending) {
			//正在发送时不响应该事件
			return;
		}
		//权限验证
		let recordPermission = await this.checkPermission().then((hasPermission) => {
			if (__DEV__) {
				console.log(hasPermission);
			}
			if (hasPermission == true || hasPermission == PermissionsAndroid.RESULTS.GRANTED) {
				return true;
			} else {
				Toast.show('没有授权录音', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return false;
			}
		});

		if (!recordPermission) {
			Alert.alert('录音需要使用您的存储和麦克风权限,请设置系统权限.');
			return;
		}
		//音频文件保存目录
		let audioPath = AudioUtils.DocumentDirectoryPath + '/' + new Date().valueOf() + '.aac';

		if (__DEV__) {
			console.log('audioPath:' + audioPath);
		}

		this.prepareRecordingPath(audioPath);

		AudioRecorder.onProgress = async (data) => {
			if (__DEV__) {
				console.log('当前录音时长：' + data.currentTime);
			}
			this.setState({ currentTime: Math.floor(data.currentTime) });
			if (Math.floor(data.currentTime) == 50) {
				Toast.show('还可以说10秒钟', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}

			if (Math.floor(data.currentTime) == 55) {
				Toast.show('还可以说5秒钟', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}

			if (Math.floor(data.currentTime) >= 60) {
				await this.recordingPressOut(); //60秒自动停止录音并发送
			}
		};

		try {
			//开始录音
			await AudioRecorder.startRecording();
			this.setState({ recording: true, recordBtnStr: '松开 发送' });
		} catch (error) {
			this.setState({ recording: false, recordBtnStr: '按住 说话' });
			Toast.show('录音出错，请重试', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			if (__DEV__) {
				console.log(error);
			}
		}
	};

	/**
   * 松开录制音频事件
   *
   * @memberof ChatView
   */
	recordingPressOut = async () => {
		if (!this.state.recording) {
			return;
		}
		try {
			//停止录制操作
			let filePath = await AudioRecorder.stopRecording();

			if (__DEV__) {
				console.log(filePath);
			}
			//语音消息不小于1秒
			if (this.state.currentTime < 1) {
				this.setState({
					recording: false,
					recordinged: false,
					recordBtnStr: '按住 说话'
				}); //更改状态
				return;
			}

			this.setState({
				recording: false,
				recordinged: true,
				recordBtnStr: '发送中...'
			});

			if (Platform.OS === 'ios') {
				filePath = this.data.audioPath;
			}

			//上传文件
			let uploadres = await Upload.UploadAudio(filePath);

			if (uploadres) {
				//消息类型
				let msgType = ChatMessage.MessageType.UserMessage; //默认为用户消息
				if (this.state.chatIndex != null) {
					if (this.state.chatIndex.type == ChatIndex.Type.Group) {
						msgType = ChatMessage.MessageType.GroupMessage;
					}
				}

				//发送目标
				let target = 0;
				if (this.state.chatIndex != null) {
					target = this.state.chatIndex.id;
				}
				if (this.state.searchUser != null) {
					target = this.state.searchUser.id;
				}

				if (target == chat.getUserUid()) {
					Alert.alert('不能给自己发送消息');
					this.setState({ sending: false, sendBtnStr: '确定' }); //更改状态
					return;
				}

				//消息内容类型
				let contentType = ChatMessage.ContentType.Chat_Audio; //音频类型
				let time = this.state.currentTime == 0 ? 1 : this.state.currentTime;
				let content = time + ',' + uploadres;
				//发送消息
				let result = await chat.sendMessage(msgType, target, content, contentType);
				if (result != MessageResultCode.Success) {
					if (msgType == ChatMessage.MessageType.GroupMessage && result == MessageResultCode.UserRemoved) {
						Alert.alert('', '您被踢出' + this.data.chatName + '圈子,如有疑问请联系管理员', [
							{
								text: '确定',
								onPress: () => {
									this.nav.goBack();
								}
							}
						]);
					} else {
						let toastStr = chat.sendResultToString(result);
						Toast.show(toastStr, {
							duration: Toast.durations.SHORT,
							position: Toast.positions.BOTTOM
						});
					}
				}
			}
		} catch (error) {
			Toast.show('发送失败，请重试', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			if (__DEV__) {
				console.log(error);
			}
		}
		this.setState({
			recording: false,
			recordinged: false,
			recordBtnStr: '按住 说话'
		});
	};

	/**
   * 初始化音频文件相关配置
   *
   * @param {string} audioPath
   * @memberof ChatView
   */
	prepareRecordingPath(audioPath) {
		//以AAC格式录制，在22050 KHz低质量单声道
		AudioRecorder.prepareRecordingAtPath(audioPath, {
			SampleRate: 22050, //采样率
			Channels: 1, //声道
			AudioQuality: 'Low', //录音质量
			AudioEncoding: 'aac', //录音格式
			AudioEncodingBitRate: 32000 //比特率
		});
		this.data.audioPath = audioPath;
	}

	/**
   * 检查音频录制权限
   *
   * @memberof ChatView
   */
	async checkPermission() {
		if (Platform.OS !== 'android') {
			return await Promise.resolve(true);
		}
		return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then((result) => {
			return result;
		});
	}

	/**
   * 音频消息发送按钮背景色
   *
   * @returns
   * @memberof ChatView
   */
	getButtonBackgroundColor() {
		if (this.state.recording) {
			//录音中
			return skin.msgUserNameColor;
		}
		if (this.state.recordinged) {
			//完成录音
			return skin.activeTint;
		}
		return skin.tint; //默认
	}

	/**
   * 文本输入框或者录音按钮显示视图
   *
   * @returns
   * @memberof ChatView
   */
	inputOrRecordingView() {
		if (this.state.recordingshow) {
			return (
				<TouchableHighlight
					onLongPress={() => this.recordingLongPress()}
					onPressOut={() => this.recordingPressOut()}
					activeOpacity={1}
					underlayColor={skin.tint}
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: this.getButtonBackgroundColor(),
						borderRadius: 5
					}}
				>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							height: 38,
							backgroundColor: this.getButtonBackgroundColor(),
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.title, fontSize: 14 }}>{this.state.recordBtnStr}</Text>
					</View>
				</TouchableHighlight>
			);
		} else {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						borderWidth: 1,
						borderColor: skin.tint
					}}
				>
					<TextInput
						ref="textInput"
						onChangeText={(text) => {
							this.data.msgContent = text;
							this.setState({ textValue: this.data.msgContent });
						}}
						defaultValue={this.state.textValue}
						onBlur={() => this.textInputBlur()}
						onFocus={() => this.textInputFocus()}
						clearButtonMode="while-editing"
						underlineColorAndroid="transparent"
						style={{
							backgroundColor: skin.tint,
							color: skin.messageTextColor,
							fontSize: 16,
							flex: 1,
							height: 38,
							padding: 0
						}}
					/>
				</View>
			);
		}
	}
}

/**
 * 聊天对话页面消息展示列表
 *
 * @export
 * @class ChatMessageList
 * @extends {Component}
 */
export class ChatMessageList extends Component {
	//构造方法
	constructor(props) {
		super(props);
		this.state = {
			//loading,标示当前的加载状态
			//0标示没有开始加载,可以显示提示用户滑动加载的相关提示
			//1标示正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1标示禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			list: [] //列表数据
		};
		this.data = {
			list: [], //列表数据
			searchUser: null, //搜索到的用户信息
			chatIndex: null, //ChatIndex对象
			index: 0, //指定的滚动位置
			imageArr: [], //图片消息数组
			userOrGroupId: 0
		};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.data.chatIndex = this.props.navigation.state.params.chatIndex
			? this.props.navigation.state.params.chatIndex
			: null;
		this.data.searchUser = this.props.navigation.state.params.searchUser
			? this.props.navigation.state.params.searchUser
			: null;

		if (this.data.chatIndex != null || this.data.searchUser != null) {
			this.initChatMessage();
		}
		//订阅聊天消息发送成功
		event.Sub(this, event.Events.chat.sendMessageSuccess, this.addChatMessageData);
	}

	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
	}
	/**
   * 添加数据到数据列表
   *
   * @param {ChatMessage} chatMessage
   * @memberof ChatMessageList
   */
	addChatMessageData = (chatMessage) => {
		if (__DEV__) {
			console.log('消息：' + JSON.stringify(chatMessage));
		}
		if (
			chatMessage &&
			this.data.userOrGroupId != 0 &&
			(chatMessage.Target == this.data.userOrGroupId || chatMessage.Source == this.data.userOrGroupId)
		) {
			let message = {
				id: chatMessage.Id,
				source: chatMessage.Source ? chatMessage.Source : 0,
				target: chatMessage.Target ? chatMessage.Target : 0,
				messageType: chatMessage.MessageType,
				content: chatMessage.Content,
				contentType: chatMessage.ContentType,
				sendTime: chatMessage.SendTime,
				userInfo: chatMessage.UserInfo,
				groupInfo: chatMessage.GroupInfo
			};

			//撤销消息处理
			if (message && message.contentType == ChatMessage.ContentType.Chat_Revoke) {
				message.id = Number(message.content);
				message.content = config.RevokeMsgContent;
				message.key = message.id + '_key_' + new Date().getTime();

				let index = -1;
				for (let i = 0; i < this.data.list.length; i++) {
					if (this.data.list[i].id == message.id) {
						index = i;
						break;
					}
				}

				if (index != -1) {
					this.data.list.splice(index, 1, message); //从指定位置开始删除一个元素，并插入一个元素
				}

				//删除原图片数据
				let i = this.data.imageArr.findIndex((n) => (n.id = message.id));
				if (i != -1) {
					this.data.imageArr.splice(i, 1); //从指定位置开始删除一个元素
				}
			} else {
				message.key = message.id;
				if (message.contentType == ChatMessage.ContentType.Chat_Image) {
					this.data.imageArr.push(message); //添加到末尾
				}
				this.data.list.unshift(message); //添加到首位
			}
			this.setImageArr();
			this.setState({ list: this.data.list });
		}
	};

	/**
   * 图片查看数据处理
   *
   * @memberof ChatMessageList
   */
	setImageArr() {
		if (this.data.imageArr && this.data.imageArr.length > 0) {
			let sImages = [];
			let bImages = [];
			for (let index = 0; index < this.data.imageArr.length; index++) {
				let imageMsg = this.data.imageArr[index];
				//数据格式：{index:0,url:"xxx"}
				let sImageUrl = image.GetSmallImageSource(imageMsg.content);
				let s = { index: index, url: sImageUrl.uri };
				sImages.push(s);

				let bImageUrl = image.GetBigImageSource(imageMsg.content);
				let b = { index: index, url: bImageUrl.uri };
				bImages.push(b);
			}
			if (sImages.length > 0 && bImages.length > 0 && sImages.length == bImages.length) {
				sChatImages = sImages;
				bChatImages = bImages;
			}
		}
	}

	//列表底部控件
	listFooter = () => {
		if (this.state.list.length > 0) {
			if (this.state.loading == 1) {
				return (
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 30
						}}
					>
						<Text style={{ fontSize: 16, color: skin.title }}>加载中...</Text>
					</View>
				);
			}
			if (this.state.loading == -1) {
				return null;
			} else {
				return (
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 30
						}}
					>
						<Text style={{ fontSize: 16, color: skin.title }}>下拉加载更多</Text>
					</View>
				);
			}
		}
		return null;
	};

	/**
   * 首次加载数据
   *
   * @memberof ChatMessageList
   */
	initChatMessage = async () => {
		//首次加载数据将图片数据清空，防止出现数据异常
		sChatImages = null;
		bChatImages = null;
		//清空聊天首页未读消息数
		if (this.data.chatIndex != null && this.data.chatIndex.number > 0) {
			await chat.clearChatIndexNumber(this.data.chatIndex);
			//通知聊天首页数据刷新
			let chatIndexData = await chat.getChatIndexData();
			event.Send(event.Events.chat.chatIndexChanged, chatIndexData);
		}
		await this.LoadMore();
	};

	//加载更多
	LoadMore = async () => {
		if (this.state.loading != 0) {
			return;
		}
		let loadingState = 0;
		this.setState({ loading: 1 });

		let lastid = 0;
		if (this.state.list != null && this.state.list.length > 0) {
			lastid = this.state.list[this.state.list.length - 1].id;
		}
		let userOrGroupId = 0;
		let messageType = 0;
		if (this.data.chatIndex != null && this.data.searchUser == null) {
			userOrGroupId = this.data.chatIndex.id;
			messageType = this.data.chatIndex.type;
		} else if (this.data.searchUser != null && this.data.chatIndex == null) {
			userOrGroupId = this.data.searchUser.id;
			messageType = ChatMessage.MessageType.UserMessage;
		}
		this.data.userOrGroupId = userOrGroupId;

		//加载数据,每次只加载20条数据
		let result = await chat.getChatMessage(userOrGroupId, messageType, lastid, 20);

		if (result != null && result.length > 0) {
			for (let i = result.length - 1; i > -1; i--) {
				let element = result[i];
				element.key = element.id + '_key_' + new Date().getTime();
				this.data.list.push(element);
				//图片消息处理
				if (element.contentType == ChatMessage.ContentType.Chat_Image) {
					this.data.imageArr.unshift(element); //添加到首位
				}
			}
			this.setImageArr();
			this.setState({ list: this.data.list });
			this.data.index = this.state.list.length - 1;
			if (result.length < 20) {
				loadingState = -1; //小于20条表示所有聊天数据已加载完成
			} else {
				loadingState = 0;
			}
		} else {
			loadingState = -1; //设置为-1,不再显示加载更多
		}

		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//创建list item,根据数据不同创建不同的item模板
	createListItem = ({ item }) => {
		if (chat.getUserUid() > 0 && item.source == chat.getUserUid()) {
			//自己发送消息
			switch (item.contentType) {
				case ChatMessage.ContentType.Chat_Revoke: //撤回消息
					return <ChatRevokeItem data={item} />;
				default:
					return (
						<RightChatItem
							data={item}
							navigation={this.props.navigation}
							dismissEmoji={this.props.dismissEmoji}
						/>
					);
			}
		} else {
			//其他用户发送消息
			switch (item.contentType) {
				case ChatMessage.ContentType.Chat_Revoke: //撤回消息
					return <ChatRevokeItem data={item} />;
				default:
					return (
						<LeftChatItem
							data={item}
							navigation={this.props.navigation}
							dismissEmoji={this.props.dismissEmoji}
						/>
					);
			}
		}
	};

	render() {
		return (
			<FlatList
				ref={(chatMessageList) => {
					this.chatMessageList = chatMessageList;
				}}
				data={this.state.list}
				extraData={this.state}
				onPressItem={this._onPressItem}
				renderItem={this.createListItem}
				ListFooterComponent={this.listFooter}
				onEndReached={this.LoadMore}
				onEndReachedThreshold={0.5}
				inverted
			/>
		);
	}
}

/**
 * 聊天对话列表撤回消息视图
 *
 * @export
 * @class ChatRevokeItem
 * @extends {PureComponent}
 */
export class ChatRevokeItem extends PureComponent {
	constructor(props) {
		super(props);
		this.data = {
			chatMessage: this.props.data, //需要展示的聊天消息
			UserInfo: null //用户信息
		};
		this.state = {
			userName: '' //消息发送人昵称或者名字
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.getUserInfo();
	}

	getUserInfo = async () => {
		if (this.data.chatMessage.source == chat.getUserUid()) {
			this.setState({ userName: '你' });
		} else {
			let userInfo = null;
			let userName = '';
			try {
				userInfo = JSON.parse(this.data.chatMessage.userInfo);
				let nickname = await chat.getNickName(userInfo.id);
				userName = nickname ? nickname : userInfo.name;
			} catch (error) {
				if (__DEV__) {
					console.log(error);
				}
			}
			this.setState({ userName: userName });
		}
	};

	render() {
		return (
			<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
				<Text style={{ fontSize: 12, color: skin.msgUserNameColor }}>{this.state.userName + '撤回了一条消息'} </Text>
			</View>
		);
	}
}

/**
 * 聊天对话列表左侧消息视图
 *
 * @export
 * @class LeftChatItem
 * @extends {PureComponent}
 */
export class LeftChatItem extends PureComponent {
	constructor(props) {
		super(props);
		this.data = {
			chatMessage: this.props.data, //需要展示的聊天消息
			UserInfo: null, //用户信息
			userId: 0, //消息发送人id
			imageUrl: '', //图片url
			soundUrl: '' //语音消息音频对象地址
		};
		this.state = {
			userChatView: false, //是否为用户对话视图
			userName: '', //消息发送人昵称或者名字
			userImg: image.DefaultAvatar.man, //用户头像
			msgTime: '', //语音消息时长
			userSex: 1, //用户性别（默认为男性）
			audioTime: 0, //语音消息时长（默认为1秒）
			audioTips: '', //语音消息解析异常提示
			detailedUserInfo: null, //消息发送人详细信息
			visibility: false,
			songImage: image.chat.songLeft,
			isPlaying: false
		};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.getUserInfo();
		if (this.data.chatMessage.contentType == ChatMessage.ContentType.Chat_Audio) {
			//语音消息解析
			this.getAudioTime();
		}
	}

	//在组件销毁的时候
	componentWillUnmount() {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
	}

	getUserInfo = async () => {
		let userInfo = null;
		try {
			userInfo = JSON.parse(this.data.chatMessage.userInfo);
			if (userInfo != undefined && userInfo != null) {
				await this.setUserInfo(userInfo);
			}
		} catch (error) {
			if (__DEV__) {
				console.log(error);
			}
		}
	};

	/**
   * 设置显示的用户信息
   *
   * @memberof LeftChatItem
   */
	setUserInfo = async (userInfo) => {
		this.data.userId = userInfo.id;
		let detailedInfo = await chat.GetFullUserInfo(userInfo.id, false);
		let nickname = await chat.getNickName(userInfo.id);
		if (detailedInfo != undefined && detailedInfo != null) {
			this.setState({
				userName: nickname ? nickname : detailedInfo.name,
				userSex: detailedInfo.sex,
				detailedUserInfo: detailedInfo
			});
			this.getUserImage(detailedInfo.img);
		}
	};

	onPressItemOut = () => {
		if (this.props.dismissEmoji) {
			this.props.dismissEmoji();
		}
	};

	render() {
		return (
			<View>
				<TouchableHighlight
					onPress={() => this.onPressItemOut()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'flex-start',
							padding: 10
						}}
					>
						<TouchableHighlight
							onPress={() => this.goDetailsnfo()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 5
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: 40,
									borderRadius: 20
								}}
							>
								<Image
									style={{
										height: 40,
										width: 40,
										borderRadius: 20
									}}
									source={this.state.userImg}
								/>
							</View>
						</TouchableHighlight>

						<View
							style={{
								justifyContent: 'flex-start',
								alignItems: 'flex-start',
								marginLeft: 10,
								marginRight: 50
							}}
						>
							{this.userNameTextView()}
							{this.contentView()}
							<PopupView
								chatMessage={this.data.chatMessage}
								visibility={this.state.visibility}
								requestClose={this.requestClose}
								isTextMsg={true}
								showUndoView={false}
								navigation={this.props.navigation}
							/>
							<Text style={{ fontSize: 10, color: skin.msgSendTimeColor }}>
								{TimeUtil.getTime(this.data.chatMessage.sendTime, 'yyyy-MM-dd hh:mm:ss')}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			</View>
		);
	}
	/**
   * 点击头像进入用户详情页面
   *
   * @memberof LeftChatItem
   */
	goDetailsnfo = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		//进入用户详情页面
		this.nav.navigate('detailsInfo', { userId: this.data.userId });
	};

	/**
   * 用户头像处理
   *
   * @returns
   * @memberof LeftChatItem
   */
	getUserImage(img) {
		let avatarSource = image.GetSmallImageSource(img);
		if (avatarSource == image.ErrorImg.default) {
			switch (this.state.userSex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		this.setState({ userImg: avatarSource });
	}

	/**
   * 用户名显示视图
   *
   * @returns
   * @memberof LeftChatItem
   */
	userNameTextView() {
		if (!this.state.userChatView) {
			return <Text style={{ fontSize: 12, color: skin.msgUserNameColor }}>{this.state.userName}</Text>;
		}
		return null;
	}

	/**
   *音频消息点击事件
   *
   * @memberof LeftChatItem
   */
	audioPress = async () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}

		if (this.state.isPlaying) {
			this.setState({ isPlaying: false, songImage: image.chat.songLeft }); //播放标识重置
			return;
		}

		if (this.data.soundUrl.length > 0) {
			const callback = (error, sound) => {
				if (error) {
					if (__DEV__) {
						console.log(error);
					}
					Toast.show('加载失败', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
					//出错重置
					this.setState({ songImage: image.chat.songLeft, isPlaying: false }); //图标还原、播放标识重置
					sound.timer && clearInterval(sound.timer); //清除定时器
					return;
				}
				sound.play(() => {
					//播放完状态重置
					this.setState({ songImage: image.chat.songLeft, isPlaying: false }); //图标还原、播放标识重置
					sound.timer && clearInterval(sound.timer); //清除定时器
				});
			};
			const sound = new Sound(this.data.soundUrl, '', (error) => callback(error, sound));
			sound.timer = setInterval(() => {
				if (this.state.songImage == image.chat.songLeft) {
					this.setState({ songImage: image.chat.songLeft_01 });
				} else if (this.state.songImage == image.chat.songLeft_01) {
					this.setState({ songImage: image.chat.songLeft_02 });
				} else if (this.state.songImage == image.chat.songLeft_02) {
					this.setState({ songImage: image.chat.songLeft });
				}
			}, 200);
			chat.playingAudioMsg = sound;
			this.setState({ isPlaying: true });
		}
	};

	/**
   *图片消息点击事件
   *
   * @memberof LeftChatItem
   */
	imagePress = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		if (sChatImages) {
			let i = sChatImages.findIndex((n) => n.url == this.data.imageUrl);
			if (i != -1) {
				//进入图片查看
				this.nav.navigate('dynamicImgs', {
					simgsArr: sChatImages,
					bimgsArr: bChatImages,
					index: i
				});
			}
		}
	};

	/**
   * 非文本消息长按
   *
   * @memberof LeftChatItem
   */
	longPress = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		//没有具体操作，仅起到阻止长按非文本消息时触发点击事件
	};

	/**
   *文本消息点击事件
   *
   * @memberof LeftChatItem
   */
	textPress = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		//跳转到纯文本详情页
		this.nav.navigate('textView', {
			navigation: this.props.navigation,
			content: this.data.chatMessage.content
		});
	};

	/**
   *文本长按事件
   *
   * @memberof LeftChatItem
   */
	textLongPress = () => {
		if (this.props.dismissEmoji) {
			this.props.dismissEmoji();
		}
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		this.setState({ visibility: true });
	};

	/**
   * Android物理返回键回调函数
   *
   * @memberof LeftChatItem
   */
	requestClose = () => {
		this.setState({ visibility: false });
	};

	/**
   * 获取图片资源
   *
   * @returns
   * @memberof LeftChatItem
   */
	getImageUrl() {
		let img = image.GetSmallImageSource(this.data.chatMessage.content);
		this.data.imageUrl = img.uri;
		return img;
	}

	/**
   * 消息显示视图
   *
   * @memberof LeftChatItem
   */
	contentView() {
		switch (this.data.chatMessage.contentType) {
			case ChatMessage.ContentType.Chat_Audio: //语音消息
				let audioWidth = this.state.audioTime * 2 + 40;
				return (
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							marginTop: 5,
							marginBottom: 2
						}}
					>
						<TouchableHighlight
							onPress={() => this.audioPress()}
							onLongPress={() => this.longPress()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								borderRadius: 5
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'flex-start',
									alignItems: 'center',
									backgroundColor: skin.tint,
									minHeight: 35,
									padding: 5,
									borderRadius: 5
								}}
							>
								<View style={{ width: audioWidth }}>
									<Image
										style={{
											height: 24,
											width: 24
										}}
										source={this.state.songImage}
									/>
								</View>
							</View>
						</TouchableHighlight>
						<Text
							style={{
								marginLeft: 5,
								fontSize: 10,
								color: skin.msgSendTimeColor
							}}
						>
							{this.state.audioTime + '″'}
						</Text>
					</View>
				);
			case ChatMessage.ContentType.Chat_Image: //图片消息
				return (
					<TouchableHighlight
						onPress={() => this.imagePress()}
						onLongPress={() => this.longPress()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							borderRadius: 5
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center',
								backgroundColor: skin.tint,
								minHeight: 35,
								minWidth: 40,
								padding: 5,
								borderRadius: 5,
								marginTop: 5,
								marginBottom: 2
							}}
						>
							<Image
								style={{
									height: 100,
									width: 100
								}}
								source={this.getImageUrl()}
							/>
						</View>
					</TouchableHighlight>
				);

			case ChatMessage.ContentType.Chat_Text: //文本消息
				return (
					<TouchableHighlight
						onPress={() => this.textPress()}
						onLongPress={() => this.textLongPress()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							borderRadius: 5
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: skin.tint,
								minHeight: 35,
								minWidth: 40,
								padding: 5,
								borderRadius: 5,
								marginTop: 5,
								marginBottom: 2
							}}
						>
							<Text style={{ fontSize: 14 }}>{this.data.chatMessage.content}</Text>
						</View>
					</TouchableHighlight>
				);
			case ChatMessage.ContentType.Chat_Video: //视频消息
				return null; //暂时不做处理
			case ChatMessage.ContentType.Chat_Out: //用户被踢出消息
				return null; //暂时不做处理
			default:
				return null;
		}
	}

	/**
   * 获取语音消息时长
   *
   * @memberof LeftChatItem
   */
	getAudioTime() {
		let audioTime = 0;
		try {
			let timeStr = this.data.chatMessage.content.split(','); //分割为数组
			if (timeStr != null && timeStr.length > 0) {
				audioTime = Number(timeStr[0]);
				this.data.soundUrl = timeStr[1];
			}
		} catch (error) {
			this.setState({ audioTips: '音频解析出错' });
			if (__DEV__) {
				console.log(error);
			}
		}
		this.setState({ audioTime: audioTime });
	}
}

/**
 * 聊天对话列表右侧消息视图
 *
 * @export
 * @class RightChatItem
 * @extends {PureComponent}
 */
export class RightChatItem extends PureComponent {
	constructor(props) {
		super(props);
		this.data = {
			chatMessage: this.props.data, //需要展示的聊天消息
			imageUrl: '', //图片url
			soundUrl: '' //语音消息音频对象地址
		};
		this.state = {
			userId: 0, //用户id
			userImg: image.DefaultAvatar.man, //用户头像
			msgTime: '', //语音消息时长
			userSex: 1, //用户性别（默认为男性）
			audioTime: 0, //语音消息时长（默认为1秒）
			audioTips: '', //语音消息解析异常提示
			visibility: false, //弹窗是否显示（默认为不显示）
			isTextMsg: false, //是否为文本消息（默认为否）
			showUndoView: false, //是否显示撤回按钮（默认为不显示）
			songImage: image.chat.songRight,
			isPlaying: false //当前语音消息是否正在播放
		};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.getUserInfo();
		if (this.data.chatMessage.contentType == ChatMessage.ContentType.Chat_Audio) {
			//语音消息解析
			this.getAudioTime();
		}
	}

	//在组件销毁的时候
	componentWillUnmount() {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
	}

	getUserInfo = async () => {
		let userInfo = null;
		try {
			userInfo = await user.GetUserInfo();
			if (userInfo != undefined && userInfo != null) {
				this.setState({ userId: userInfo.id, userSex: userInfo.sex });
				this.getUserImage(userInfo.img);
			}
		} catch (error) {
			if (__DEV__) {
				console.log(error);
			}
		}
	};
	onPressItemOut = () => {
		if (this.props.dismissEmoji) {
			this.props.dismissEmoji();
		}
	};
	render() {
		return (
			<View>
				<TouchableHighlight
					onPress={() => this.onPressItemOut()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'flex-start',
							padding: 10
						}}
					>
						<View
							style={{
								justifyContent: 'flex-start',
								alignItems: 'flex-end',
								marginLeft: 50,
								marginRight: 10
							}}
						>
							{this.contentView()}
							<Text style={{ fontSize: 10, color: skin.msgSendTimeColor }}>
								{TimeUtil.getTime(this.data.chatMessage.sendTime, 'yyyy-MM-dd hh:mm:ss')}
							</Text>
						</View>
						<TouchableHighlight
							onPress={() => this.goDetailsnfo()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 5
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									width: 40,
									borderRadius: 20
								}}
							>
								<Image
									style={{
										height: 40,
										width: 40,
										borderRadius: 20
									}}
									source={this.state.userImg}
								/>
							</View>
						</TouchableHighlight>
						<PopupView
							chatMessage={this.data.chatMessage}
							visibility={this.state.visibility}
							requestClose={this.requestClose}
							isTextMsg={this.state.isTextMsg}
							showUndoView={this.state.showUndoView}
							navigation={this.props.navigation}
						/>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	/**
   * 点击头像进入用户详情页面
   *
   * @memberof LeftChatItem
   */
	goDetailsnfo = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		//进入用户详情页面
		this.nav.navigate('detailsInfo', { userId: this.state.userId });
	};

	/**
   * 用户头像处理
   *
   * @returns
   * @memberof RightChatItem
   */
	getUserImage(img) {
		let avatarSource = image.GetSmallImageSource(img);
		if (avatarSource == image.ErrorImg.default) {
			switch (this.state.userSex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		this.setState({ userImg: avatarSource });
	}
	/**
   * 音频消息点击
   *
   * @memberof RightChatItem
   */
	audioPress = async () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}

		if (this.state.isPlaying) {
			this.setState({ isPlaying: false, songImage: image.chat.songRight }); //播放标识重置
			return;
		}

		if (this.data.soundUrl.length > 0) {
			const callback = (error, sound) => {
				if (error) {
					if (__DEV__) {
						console.log(error);
					}
					Toast.show('加载失败', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
					//出错时重置
					this.setState({ songImage: image.chat.songRight, isPlaying: false }); //图标还原、播放标识重置
					sound.timer && clearInterval(sound.timer); //清除定时器
					return;
				}
				sound.play(() => {
					//播放完重置
					this.setState({ songImage: image.chat.songRight, isPlaying: false }); //图标还原、播放标识重置
					sound.timer && clearInterval(sound.timer); //清除定时器
				});
			};
			const sound = new Sound(this.data.soundUrl, '', (error) => callback(error, sound));
			sound.timer = setInterval(() => {
				if (this.state.songImage == image.chat.songRight) {
					this.setState({ songImage: image.chat.songRight_01 });
				} else if (this.state.songImage == image.chat.songRight_01) {
					this.setState({ songImage: image.chat.songRight_02 });
				} else if (this.state.songImage == image.chat.songRight_02) {
					this.setState({ songImage: image.chat.songRight });
				}
			}, 200);

			chat.playingAudioMsg = sound;
			this.setState({ isPlaying: true });
		}
	};

	/**
   * 图片消息点击
   *
   * @memberof RightChatItem
   */
	imagePress = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		if (sChatImages) {
			let i = sChatImages.findIndex((n) => n.url == this.data.imageUrl);
			if (i != -1) {
				//进入图片查看
				this.nav.navigate('dynamicImgs', {
					simgsArr: sChatImages,
					bimgsArr: bChatImages,
					index: i
				});
			}
		}
	};

	/**
   * 非文本消息长按
   *
   * @memberof RightChatItem
   */
	nonTextLongPress = () => {
		if (this.props.dismissEmoji) {
			this.props.dismissEmoji();
		}
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		this.setState({
			visibility: true,
			isTextMsg: false,
			showUndoView: this.getUndoView()
		});
	};

	/**
   * 文本消息点击
   *
   * @memberof RightChatItem
   */
	textPress = () => {
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		//跳转到纯文本详情页
		this.nav.navigate('textView', {
			navigation: this.props.navigation,
			content: this.data.chatMessage.content
		});
	};

	/**
   * 文本消息长按
   *
   * @memberof RightChatItem
   */
	textLongPress = () => {
		if (this.props.dismissEmoji) {
			this.props.dismissEmoji();
		}
		if (chat.playingAudioMsg) {
			//停止播放
			chat.playingAudioMsg.stop().release();
			chat.playingAudioMsg.timer && clearInterval(chat.playingAudioMsg.timer); //清除定时器
		}
		this.setState({
			visibility: true,
			isTextMsg: true,
			showUndoView: this.getUndoView()
		});
	};

	/**
   * 是否显示撤回按钮
   *
   * @returns
   * @memberof RightChatItem
   */
	getUndoView() {
		let undoTime = new Date().getTime() - Number(this.data.chatMessage.sendTime) * 1000; //消息发送时间戳差（即毫秒数）
		let isUndo = undoTime < config.RevokeIntervalTime * 1000 ? true : false; //是否可撤销
		return isUndo;
	}

	/**
   * Android物理返回键回调函数
   *
   * @memberof RightChatItem
   */
	requestClose = () => {
		this.setState({ visibility: false });
	};

	/**
   * 获取图片资源
   *
   * @returns
   * @memberof RightChatItem
   */
	getImageUrl() {
		let img = image.GetSmallImageSource(this.data.chatMessage.content);
		this.data.imageUrl = img.uri;
		return img;
	}

	/**
   * 消息显示视图
   *
   * @memberof RightChatItem
   */
	contentView() {
		switch (this.data.chatMessage.contentType) {
			case ChatMessage.ContentType.Chat_Audio: //语音消息
				let audioWidth = this.state.audioTime * 2 + 40;
				return (
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'center'
						}}
					>
						<Text
							style={{
								marginRight: 5,
								fontSize: 10,
								color: skin.msgSendTimeColor
							}}
						>
							{this.state.audioTime + '″'}
						</Text>
						<TouchableHighlight
							onPress={() => this.audioPress()}
							onLongPress={() => this.nonTextLongPress()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								borderRadius: 5
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'flex-end',
									alignItems: 'center',
									backgroundColor: skin.activeTint,
									minHeight: 35,
									padding: 5,
									borderRadius: 5,
									marginBottom: 2
								}}
							>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'flex-end',
										alignItems: 'center',
										width: audioWidth
									}}
								>
									<Image
										style={{
											height: 24,
											width: 24
										}}
										source={this.state.songImage}
									/>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			case ChatMessage.ContentType.Chat_Image: //图片消息
				return (
					<TouchableHighlight
						onPress={() => this.imagePress()}
						onLongPress={() => this.nonTextLongPress()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							borderRadius: 5
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-end',
								alignItems: 'center',
								backgroundColor: skin.activeTint,
								minWidth: 40,
								minHeight: 35,
								padding: 5,
								borderRadius: 5,
								marginBottom: 2
							}}
						>
							<Image
								style={{
									height: 100,
									width: 100
								}}
								source={this.getImageUrl()}
							/>
						</View>
					</TouchableHighlight>
				);

			case ChatMessage.ContentType.Chat_Text: //文本消息
				return (
					<TouchableHighlight
						onPress={() => this.textPress()}
						onLongPress={() => this.textLongPress()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							borderRadius: 5
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: skin.activeTint,
								minWidth: 40,
								minHeight: 35,
								padding: 5,
								borderRadius: 5,
								marginBottom: 2
							}}
						>
							<Text style={{ fontSize: 14 }}>{this.data.chatMessage.content}</Text>
						</View>
					</TouchableHighlight>
				);
			case ChatMessage.ContentType.Chat_Video: //视频消息
				return null; //暂时不做处理
			case ChatMessage.ContentType.Chat_Out: //用户被踢出消息
				return null; //暂时不做处理
			default:
				return null;
		}
	}

	/**
   * 获取语音消息时长
   *
   * @memberof RightChatItem
   */
	getAudioTime() {
		let audioTime = 0;
		try {
			let timeStr = this.data.chatMessage.content.split(','); //分割为数组
			if (timeStr != null && timeStr.length > 0) {
				audioTime = Number(timeStr[0]);
				this.data.soundUrl = timeStr[1];
			}
		} catch (error) {
			this.setState({ audioTips: '音频解析出错' });
			if (__DEV__) {
				console.log(error);
			}
		}
		this.setState({ audioTime: audioTime });
	}
}

/**
 * 聊天首页用户搜索
 * @author wuzhitao
 * @export
 * @class SearchChatUser
 * @extends {Component}
 */
export class SearchChatUser extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			chatUserList: [] //用户已关注圈子id
		};

		this.state = {
			chatUserList: [], //搜索到的圈子数据
			showText: false //是否显示文字提示框
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: (headerProps) => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} backgroundColor={skin.activeTint} />
					<Header />
					<View
						style={{
							flexDirection: 'row',
							height: 60,
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: skin.activeTint
						}}
					>
						<Icon
							name="ios-search"
							style={{
								marginLeft: 15,
								marginRight: 5,
								backgroundColor: skin.activeTint
							}}
							size={25}
							color={skin.tint}
						/>

						<SearchBar
							containerStyle={{
								backgroundColor: skin.activeTint,
								borderBottomColor: skin.activeTint,
								borderTopColor: skin.activeTint,
								height: 60,
								flex: 1
							}}
							inputStyle={{ backgroundColor: skin.tint }}
							lightTheme
							noIcon
							placeholder="输入姓名、公司名、手机号"
							onChangeText={(text) => {
								navigation.state.params.onChangeText(text);
							}}
						/>

						<TouchableHighlight
							onPress={() => navigation.goBack()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								marginRight: 10
							}}
						>
							<View
								style={{
									backgroundColor: skin.main,
									justifyContent: 'center',
									alignItems: 'center',
									height: 44
								}}
							>
								<Text style={{ color: skin.tint, fontSize: 16 }}>取消</Text>
							</View>
						</TouchableHighlight>
					</View>
				</View>
			);
		}
	});

	//组件初始化完毕
	componentDidMount() {
		//传参给页面导航栏
		this.props.navigation.setParams({ onChangeText: this.searchUser });
	}

	/**
   * 列表分割线
   *
   * @memberof ChatIndexView
   */
	itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: skin.darkSeparate }} />;
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'flex-start',
					backgroundColor: skin.lightSeparate
				}}
			>
				{this.textView()}
				<FlatList
					keyboardShouldPersistTaps="always"
					ItemSeparatorComponent={this.itemSeparator}
					data={this.state.chatUserList}
					extraData={this.state}
					renderItem={this.itemView}
				/>
			</View>
		);
	}

	textView() {
		if (this.state.showText) {
			return (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: 60,
						height: 40
					}}
				>
					<TouchableHighlight
						onPress={() => {
							this.goSteelHome();
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center',
								height: 40,
								backgroundColor: skin.lightSeparate
							}}
						>
							<Text>没有相关联系人，进入</Text>
							<Text style={{ color: skin.activeTint }}>钢企名录</Text>
							<Text>找找看？</Text>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
		return null;
	}

	goSteelHome = () => {
		//跳转到钢企名录
		this.nav.navigate('steelHome');
	};

	/**
   * 发送请求进行搜索并填充数据
   *
   * @memberof SearchChatUser
   */
	searchUser = async (key) => {
		let data = [];
		if (key == '') {
			this.setState({ showText: false });
			this.setState({ chatUserList: data });
			return;
		}

		//数据结构
		//{"status":1,"data":[
		//{"id":1045,"name":"好家伙","mobile":"15991907063","companyshort":"钢谷","company":"陕西钢谷",
		//"img":"http://static.test.gangguwang.com/image/user/2016/11/14/201611141701017318_z.png","sex":1,"nick":""}
		// ]}
		let result = await net.ApiPost('user', 'ReadUserInfoSearch', {
			search: key + ''
		});
		if (__DEV__) {
			console.log(JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('查询数据时发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			this.data.chatUserList = result.data;
			if (__DEV__) {
				console.log(JSON.stringify(this.data.chatUserList));
			}
			for (let i = 0; i < this.data.chatUserList.length; i++) {
				let user = this.data.chatUserList[i];
				user.key = user.id;
				data.push(user);
			}
			if (data.length == 0) {
				this.setState({ showText: true });
			} else {
				this.setState({ showText: false });
			}
			this.setState({ chatUserList: data });
			return;
		} else {
			Alert.alert('发生未知错误');
			return;
		}
	};
	/**
   * 圈子数据条目点击事件
   *
   * @memberof SearchChatUser
   */
	itemPress = async (item) => {
		Keyboard.dismiss();
		if (__DEV__) {
			console.log('点击了' + item.name);
		}
		let result = null;
		try {
			result = await chat.GetFullUserInfo(item.id, true);
		} catch (error) {
			if (__DEV__) {
				console.log(error);
			}
		}
		//进入聊天对话页面
		this.nav.navigate('chatView', {
			searchUser: item,
			userOrGroupInfo: result
		});
	};
	/**
   * 聊天首页用户头像处理
   *
   * @returns
   * @memberof SearchChatUser
   */
	getChatIndexImage(item) {
		let avatarSource = image.GetSmallImageSource(item.img);
		if (avatarSource == image.ErrorImg.default) {
			switch (item.sex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		return avatarSource;
	}

	//条目视图
	itemView = ({ item }) => {
		return (
			<TouchableHighlight
				onPress={() => {
					this.itemPress(item);
				}}
				activeOpacity={1}
				underlayColor={skin.transparentColor}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'flex-start',
						alignItems: 'center',
						height: 50,
						flex: 1,
						backgroundColor: skin.tint
					}}
				>
					<Image
						style={{
							height: 40,
							width: 40,
							marginHorizontal: 10,
							borderRadius: 20
						}}
						source={this.getChatIndexImage(item)}
					/>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'flex-start',
							height: 50,
							marginRight: 10,
							backgroundColor: skin.tint
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								color: skin.tujibg,
								fontSize: 16,
								textAlign: 'left',
								marginBottom: 2
							}}
						>
							{item.name}
						</Text>
						<Text numberOfLines={1} style={{ fontSize: 12, textAlign: 'left' }}>
							{item.companyshort}
						</Text>
					</View>
					<View
						style={{
							justifyContent: 'center',
							height: 50,
							paddingVertical: 10,
							marginRight: 10,
							backgroundColor: skin.tint
						}}
					>
						<Text style={{ color: skin.subtitle, fontSize: 14, textAlign: 'right' }}>{item.mobile}</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};
}

/**
 * 圈子设置页面
 *
 * @export
 * @class GroupSetting
 * @extends {Component}
 */
export class GroupSetting extends Component {
	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		title: navigation.state.params.titleName ? navigation.state.params.titleName : ''
	});
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数

		this.state = {
			groupInfo: null, //圈子信息
			isPush: 1 //消息提醒，默认为打开状态（1）
		};
	}

	//组件初始化完毕
	componentDidMount() {
		let groupInfo = this.params.groupInfo ? this.params.groupInfo : null;
		this.setState({ groupInfo: groupInfo });
		if (groupInfo) {
			let titleName = groupInfo.name ? groupInfo.name : '';
			if (titleName != '' && groupInfo.number && groupInfo.number > 0) {
				titleName += '(' + groupInfo.number + ')';
			}
			this.setPushSwitchValue(groupInfo.id);
			this.props.navigation.setParams({
				titleName: titleName
			});
		}
	}

	/**
   * 设置消息提醒开关状态
   *
   * @memberof GroupSetting
   */
	setPushSwitchValue = async (gid) => {
		let group = await chat.GetGroupInfo(gid);
		if (group) {
			this.setState({ isPush: group.ispush });
		}
	};

	/**
   * 消息提醒开关状态更改
   *
   * @memberof GroupSetting
   */
	changSwitchValue = async () => {
		if (this.state.groupInfo) {
			let ispush = 1;
			if (this.state.isPush == 1) {
				ispush = 0;
				this.setState({ isPush: ispush });
			} else {
				this.setState({ isPush: ispush });
			}

			let result = await chat.setGroupRemind(this.state.groupInfo.id, ispush);
			if (result == true) {
				Toast.show('设置成功', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			} else {
				//重置回原来的状态
				if (ispush == 1) {
					this.setState({ isPush: 0 });
				} else {
					this.setState({ isPush: 1 });
				}
				Toast.show('设置失败', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
			return;
		}

		Toast.show('圈子信息获取失败', {
			duration: Toast.durations.SHORT,
			position: Toast.positions.BOTTOM
		});
	};

	/**
   * 查看圈子成员
   *
   * @memberof GroupSetting
   */
	groupMember = () => {
		if (this.state.groupInfo) {
			//跳转圈子设置界面
			this.nav.navigate('groupMember', { groupInfo: this.state.groupInfo });
		}
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: skin.background }}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 45,
						borderBottomColor: skin.lightSeparate,
						borderBottomWidth: 1,
						backgroundColor: skin.tint
					}}
				>
					<Text
						style={{
							flex: 1,
							marginLeft: 20,
							justifyContent: 'flex-start',
							color: skin.subtitle
						}}
					>
						消息提醒
					</Text>

					<Switch
						onValueChange={this.changSwitchValue}
						thumbTintColor={this.state.isPush == 1 ? skin.activeTint : skin.darkSeparate}
						onTintColor={skin.switchOnTintColor}
						style={{ marginRight: 20 }}
						value={this.state.isPush == 1}
					/>
				</View>
				<TouchableHighlight onPress={this.groupMember} activeOpacity={1} underlayColor={skin.transparentColor}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 45,
							backgroundColor: skin.tint
						}}
					>
						<Text
							style={{
								flex: 1,
								marginLeft: 20,
								justifyContent: 'flex-start',
								color: skin.subtitle
							}}
						>
							查看所有成员
						</Text>
						<Icon name="ios-arrow-forward" style={{ marginRight: 20 }} size={25} color={skin.subtitle} />
					</View>
				</TouchableHighlight>
			</View>
		);
	}
}

/**
 * 圈子成员查看页面
 *
 * @export
 * @class GroupMember
 * @extends {Component}
 */
export class GroupMember extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.data = {
			page: 1, //分页页数
			keyWord: '', //搜索框输入的关键字
			groupInfo: null, //圈子信息
			memberList: [] //未处理的列表数据
		};
		this.state = {
			groupInfo: null, //圈子信息
			memberList: [], //处理过的列表数据
			//loading,标示当前的加载状态
			//0标示没有开始加载,可以显示提示用户滑动加载的相关提示
			//1标示正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1标示禁用加载,可以显示没有更多内容的相关提示
			loading: 0
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		title: navigation.state.params.titleName ? navigation.state.params.titleName : ''
	});

	//组件初始化完毕
	componentDidMount() {
		let groupInfo = this.params.groupInfo ? this.params.groupInfo : null;
		this.setState({ groupInfo: groupInfo });
		if (groupInfo) {
			this.data.groupInfo = groupInfo;
			let titleName = '全部成员';
			if (groupInfo.number && groupInfo.number > 0) {
				titleName += '(' + groupInfo.number + ')';
			}
			this.props.navigation.setParams({
				titleName: titleName
			});
			this.loadMember();
		}
	}

	/**
   * 初始数据加载
   *
   * @memberof GroupMember
   */
	loadMember = async () => {
		if (__DEV__) {
			console.log(this.data.groupInfo);
		}
		if (this.state.loading != 0) {
			return;
		}

		if (this.data.groupInfo && this.state.loading != -1) {
			this.setState({ loading: 1 });
			let params = {
				page: this.data.page + '',
				cid: this.data.groupInfo.id + ''
			};
			let result = await this.GetCircleInUsers(params);
			if (result != null && result.length > 0) {
				if (__DEV__) {
					console.log('result:' + result.length);
				}
				for (let i = 0; i < result.length; i++) {
					result[i].key = result[i].id;
					this.data.memberList.push(result[i]);
				}
				if (__DEV__) {
					console.log('this.data.memberList:' + this.data.memberList.length);
				}
				this.setState({ memberList: this.data.memberList });
				this.data.page += 1;
				this.setState({ loading: 0 });
			} else {
				this.setState({ loading: -1 });
			}
		}
	};

	/**
   * 获取圈子用户
   *
   * @param {object} params
   * @memberof GroupMember
   */
	async GetCircleInUsers(params) {
		let result = await net.ApiPost('circle', 'GetCircleInUsers', params);
		if (__DEV__) {
			//{"status":1,"data":{"userscount":4329,"name":"西安-石库","img":"http://newywgoapi-test.gangguwang.com/static/IMG/qun_avar.png",
			//"userlist":[{"id":1045,"name":"好家伙","mobile":"15991907063","img":"http://static.test.gangguwang.com/image/user/2016/11/14/201611141701017318_z.png,http://static.test.gangguwang.com/image/user/2016/11/14/201611141701017318.png","sex":1,"nickname":""},
			//{"id":1048,"name":"李红阿好的好的好多好","mobile":"15829052696","img":"http://static.test.gangguwang.com/image/user/2016/11/22/201611221758175531_z.jpg,http://static.test.gangguwang.com/image/user/2016/11/22/201611221758175531.jpg","sex":2,"nickname":""}]}}
			console.log(JSON.stringify(result));
		}

		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('查询数据时发生错误,请稍后重试');
			return null;
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return null;
		} else if (result.status == 1 && result.data) {
			return result.data.userlist ? result.data.userlist : null;
		} else {
			Alert.alert('发生未知错误');
			return null;
		}
	}

	/**
   *
   *
   * @memberof GroupMember
   */
	searchUserList = async () => {
		if (this.data.groupInfo) {
			this.data.page = 1;
			let params = {
				page: this.data.page + '',
				cid: this.data.groupInfo.id + ''
			};

			if (this.data.keyWord != '') {
				params.search = this.data.keyWord.toString().trim();
			}

			let result = await this.GetCircleInUsers(params);
			if (result != null) {
				this.data.memberList = result;
				for (let i = 0; i < this.data.memberList.length; i++) {
					this.data.memberList[i].key = this.data.memberList[i].id;
				}
				this.setState({ memberList: this.data.memberList });
			}
		}
	};

	/**
   * 数据条目点击事件
   *
   * @memberof GroupMember
   */
	itemPress = (item) => {
		Keyboard.dismiss();
		if (item) {
			//进入用户详情页面
			this.nav.navigate('detailsInfo', { userId: item.id });
		}
	};

	/**
   * 聊天首页用户头像处理
   *
   * @returns
   * @memberof GroupMember
   */
	getChatIndexImage(item) {
		let avatarSource = image.GetSmallImageSource(item.img);
		if (avatarSource == image.ErrorImg.default) {
			switch (item.sex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		return avatarSource;
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: skin.tint }}>
				<SearchBar
					containerStyle={{
						backgroundColor: skin.tint,
						borderTopColor: skin.tint
					}}
					inputStyle={{
						backgroundColor: skin.lightSeparate
					}}
					lightTheme
					noIcon
					placeholder="搜索姓名、公司名"
					onChangeText={(text) => {
						this.data.keyWord = text;
						this.searchUserList();
					}}
				/>
				<FlatList
					keyboardShouldPersistTaps="always"
					ItemSeparatorComponent={this.itemSeparator}
					data={this.state.memberList}
					extraData={this.state}
					renderItem={this.itemView}
					ListFooterComponent={this.listFooter}
					onEndReached={this.loadMember}
					onEndReachedThreshold={0.1}
				/>
			</View>
		);
	}

	//列表底部控件
	listFooter = () => {
		if (this.state.memberList.length > 0) {
			if (this.state.loading == 1) {
				return (
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 30
						}}
					>
						<Text style={{ fontSize: 16, color: skin.title }}>加载中...</Text>
					</View>
				);
			}
			if (this.state.loading == -1) {
				return null;
			} else {
				return (
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 30
						}}
					>
						<Text style={{ fontSize: 16, color: skin.title }}>上拉加载更多</Text>
					</View>
				);
			}
		}
		return null;
	};

	//条目视图
	itemView = ({ item }) => {
		return (
			<TouchableHighlight
				onPress={() => {
					this.itemPress(item);
				}}
				activeOpacity={1}
				underlayColor={skin.transparentColor}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'flex-start',
						alignItems: 'center',
						height: 50,
						flex: 1,
						backgroundColor: skin.tint
					}}
				>
					<Image
						style={{
							height: 40,
							width: 40,
							marginHorizontal: 10,
							borderRadius: 20
						}}
						source={this.getChatIndexImage(item)}
					/>

					<Text
						numberOfLines={1}
						style={{
							flex: 1,
							color: skin.tujibg,
							fontSize: 16,
							textAlign: 'left'
						}}
					>
						{item.name}
					</Text>

					<Text
						style={{
							color: skin.subtitle,
							marginRight: 10,
							fontSize: 14,
							textAlign: 'right'
						}}
					>
						{item.mobile}
					</Text>
				</View>
			</TouchableHighlight>
		);
	};

	/**
   * 列表分割线
   *
   * @memberof GroupMember
   */
	itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: skin.darkSeparate }} />;
	};
}

/**
 * 封装的用于消息长按弹窗组件
 *
 * @export
 * @class PopupView
 * @extends {PureComponent}
 */
export class PopupView extends PureComponent {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
	}

	/**
   * 消息复制
   *
   * @memberof PopupView
   */
	copyPress = () => {
		//弹窗消失
		this.props.requestClose();
		//复制
		Clipboard.setString(this.props.chatMessage.content);
		Toast.show('内容已复制到粘贴板.', {
			duration: Toast.durations.SHORT,
			position: Toast.positions.BOTTOM
		});
	};

	/**
   * 消息转发
   *
   * @memberof PopupView
   */
	forwardPress = () => {
		//弹窗消失
		this.props.requestClose();
		//跳转到多选页面
		this.nav.navigate('multipleChoice', {
			confirmNum: 0,
			chatMessage: this.props.chatMessage
		});
	};

	/**
   * 消息收藏
   *
   * @memberof PopupView
   */
	collectionPress = async () => {
		//弹窗消失
		this.props.requestClose();
		//发送请求
		let str = this.props.chatMessage.content.toString().trim().replace("/'/g", '');
		if (str == null || str == '') {
			Toast.show('收藏内容不能为空', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		let nameStr = str;
		if (str.length > 100) {
			nameStr = str.substring(0, 99);
		}
		let result = await net.ApiPost('collect', 'AddCollect', {
			type: 20,
			linkid: '',
			name: nameStr,
			img: '',
			content: str
		});

		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('网络请求发生错误,请稍后重试');
			return;
		} else if (result.status == 1) {
			Toast.show('收藏成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else {
			Alert.alert(result.error ? result.error : '发生未知错误');
			return;
		}
	};

	/**
   * 消息撤回
   *
   * @memberof PopupView
   */
	revokePress = async () => {
		//弹窗消失
		this.props.requestClose();

		let timeOut = false;
		let undoTime = new Date().getTime() - Number(this.props.chatMessage.sendTime) * 1000; //消息发送时间戳差（即毫秒数）
		if (undoTime >= (config.RevokeIntervalTime + 30) * 1000) {
			timeOut = true;
		}
		//发送请求
		let result = await chat.revokeMessage(this.props.chatMessage);
		if (result == MessageResultCode.Success) {
			Toast.show('消息已成功撤回', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			let toastStr = chat.sendResultToString(result);
			if (result == 0 && timeOut) {
				Alert.alert('撤回时间已经大于' + (config.RevokeIntervalTime + 30) + '秒，无法撤回');
				return;
			}
			Toast.show(toastStr, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	/**
   * 消息撤回按钮视图
   *
   * @returns
   * @memberof PopupView
   */
	revokeView() {
		if (this.props.showUndoView) {
			return (
				<TouchableHighlight
					onPress={() => {
						this.revokePress();
					}}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 45,
							width: width - 140,
							backgroundColor: skin.tint
						}}
					>
						<Text style={{ flex: 1, fontSize: 16, textAlign: 'left' }}>撤回</Text>
					</View>
				</TouchableHighlight>
			);
		}

		return null;
	}

	/**
   * 复制、转发、收藏视图
   *
   * @returns
   * @memberof PopupView
   */
	otherView() {
		if (this.props.isTextMsg) {
			return (
				<View>
					<TouchableHighlight
						onPress={() => {
							this.copyPress();
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center',
								height: 45,
								width: width - 140,
								backgroundColor: skin.tint
							}}
						>
							<Text style={{ flex: 1, fontSize: 16, textAlign: 'left' }}>复制</Text>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => {
							this.forwardPress();
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center',
								height: 45,
								width: width - 140,
								backgroundColor: skin.tint
							}}
						>
							<Text style={{ flex: 1, fontSize: 16, textAlign: 'left' }}>转发</Text>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => {
							this.collectionPress();
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center',
								height: 45,
								width: width - 140,
								backgroundColor: skin.tint
							}}
						>
							<Text style={{ flex: 1, fontSize: 16, textAlign: 'left' }}>收藏</Text>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
		return null;
	}

	render() {
		if (this.props.isTextMsg || this.props.showUndoView) {
			return (
				<Modal
					visible={this.props.visibility}
					transparent={true} //透明背景
					animationType={'none'} //无弹出动画
					onRequestClose={() => this.props.requestClose()} //Android物理返回键相应
				>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<TouchableHighlight
							onPress={() => this.props.requestClose()} //空白处点击消失
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									width: width - 80,
									backgroundColor: skin.tint,
									borderRadius: 2
								}}
							>
								{this.otherView()}
								{this.revokeView()}
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'flex-end',
										alignItems: 'center',
										height: 45,
										width: width - 140,
										backgroundColor: skin.tint
									}}
								>
									<TouchableHighlight
										onPress={() => this.props.requestClose()}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												flexDirection: 'row',
												justifyContent: 'flex-start',
												alignItems: 'center',
												height: 40,
												backgroundColor: skin.tint
											}}
										>
											<Text
												style={{
													color: skin.activeTint,
													fontSize: 14,
													textAlign: 'right'
												}}
											>
												取消
											</Text>
										</View>
									</TouchableHighlight>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				</Modal>
			);
		}
		return null;
	}
}

/**
 * 多选页面，用于转发、分享等
 *
 * @export
 * @class MultipleChoice
 * @extends {Component}
 */
export class MultipleChoice extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;

		this.state = {
			list: [] //显示的列表数据
		};
		this.data = {
			chatMessage: this.props.navigation.state.params.chatMessage
				? this.props.navigation.state.params.chatMessage
				: null, //转发的消息
			list: [], //显示的列表数据
			number: 0, //选中个数
			successes: 0, //转发成功次数
			seachList: [], //搜索到的数据
			// clickTime: null, //点击时间
			click: false
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		title: '多选',
		headerRight: (
			<TouchableHighlight
				onPress={() => navigation.state.params.confirmClick()}
				activeOpacity={1}
				underlayColor={skin.transparentColor}
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					marginHorizontal: 20
				}}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: skin.main,
						justifyContent: 'center',
						alignItems: 'center',
						height: 40
					}}
				>
					<Text style={{ color: skin.tint, fontSize: 16 }}>
						{'确定(' + navigation.state.params.confirmNum + ')'}
					</Text>
				</View>
			</TouchableHighlight>
		)
	});

	/**
   * 导航栏右侧按钮事件
   *
   * @memberof MultipleChoice
   */
	confirmClick = async () => {
		if (this.data.click) {
			return;
		}
		this.data.click = true;

		if (this.data.number > 0) {
			for (let index = 0; index < this.state.list.length; index++) {
				let element = this.state.list[index];
				//转发消息
				if (this.data.chatMessage && element.select) {
					await this.chatMsgSend(element);
				}
			}
			if (this.data.successes > 0) {
				Toast.show('转发成功', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
			//返回上一页
			this.nav.goBack();
		} else {
			this.data.click = false;
			Toast.show('请选择要分享的群或个人!', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	/**
   * 转发消息0
   
   *
   * @memberof MultipleChoice
   */
	chatMsgSend = async (chatIndex) => {
		let chatMsgType = ChatMessage.MessageType.UserMessage;
		if (chatIndex.type == ChatIndex.Type.Group) {
			chatMsgType = ChatMessage.MessageType.GroupMessage;
		}
		let result = await chat.sendMessage(
			chatMsgType, //消息类型
			chatIndex.id, //目标
			this.data.chatMessage.content, //消息内容
			this.data.chatMessage.contentType //消息内容类型
		);

		if (result != MessageResultCode.Success) {
			if (chatMsgType == ChatMessage.MessageType.GroupMessage && result == MessageResultCode.UserRemoved) {
				Alert.alert('', '您被踢出' + chatIndex.name + '圈子,如有疑问请联系管理员', [
					{
						text: '确定'
					}
				]);
			} else {
				let toastStr = chat.sendResultToString(result);
				Toast.show(toastStr, {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			this.data.successes += 1;
		}
	};

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({ confirmClick: this.confirmClick });
		this.getListData(); //加载数据
	}

	/**
   * 添加数据
   *
   * @memberof MultipleChoice
   */
	getListData = async () => {
		//加载首页数据
		let chatIndexData = await chat.getChatIndexData();
		let indexList = [];
		if (chatIndexData != undefined && chatIndexData != null && chatIndexData.length > 0) {
			for (let i = 0; i < chatIndexData.length; i++) {
				chatIndexData[i].key = chatIndexData[i].pk + ':' + new Date().getTime();
				chatIndexData[i].select = false; //默认为非选中
				if (chatIndexData[i].type == ChatIndex.Type.Group) {
					indexList.unshift(chatIndexData[i]); //圈子放在首位
				} else {
					indexList.push(chatIndexData[i]);
				}
			}
			this.data.list = indexList;
			this.setState({ list: this.data.list });
		}
	};

	/**
   * 聊天列表分割线
   *
   * @memberof MultipleChoice
   */
	itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: skin.darkSeparate }} />;
	};

	itemPress = (item) => {
		item.select = !item.select;
		if (item.select) {
			this.data.number += 1; //增加
		} else if (!item.select && this.data.number > 0) {
			this.data.number -= 1; //减少
		}
		//修改导航栏选中数目
		this.props.navigation.setParams({ confirmNum: this.data.number });
		if (this.data.seachList.length > 0) {
			//设置数据
			this.setState({ list: this.data.seachList });
		} else {
			//设置数据
			this.setState({ list: this.data.list });
		}
	};

	//条目视图
	chatItemView = ({ item }) => {
		Keyboard.dismiss();
		if (item != undefined && item != null) {
			return (
				<TouchableHighlight
					onPress={() => {
						this.itemPress(item);
					}}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							height: 60,
							flex: 1,
							backgroundColor: skin.tint
						}}
					>
						<Icon
							style={{ marginLeft: 10 }}
							name={item.select == true ? 'ios-checkmark-circle' : 'ios-radio-button-off'}
							size={25}
							color={item.select == true ? skin.activeTint : skin.inactiveRemind}
						/>

						<Image
							style={{
								height: 40,
								width: 40,
								marginHorizontal: 10,
								borderRadius: 20
							}}
							source={this.getChatIndexImage(item)}
						/>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'flex-start',
								height: 60,
								marginRight: 10,
								backgroundColor: skin.tint
							}}
						>
							<Text numberOfLines={1} style={{ color: skin.tujibg, fontSize: 16, textAlign: 'left' }}>
								{item.name}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			);
		}
	};

	/**
   * 聊天首页用户头像处理
   *
   * @returns
   * @memberof MultipleChoice
   */
	getChatIndexImage(chatIndex) {
		let avatarSource = image.GetSmallImageSource(chatIndex.img);
		if (avatarSource == image.ErrorImg.default) {
			switch (chatIndex.sex) {
				case 1:
					avatarSource = image.DefaultAvatar.man;
					break;
				case 2:
					avatarSource = image.DefaultAvatar.woman;
					break;
				default:
					avatarSource = image.DefaultAvatar.group;
					break;
			}
		}
		return avatarSource;
	}

	/**
   * 搜索
   *
   * @memberof MultipleChoice
   */
	searchList = (text) => {
		if (text.length > 0) {
			this.data.seachList = [];
			for (let index = 0; index < this.data.list.length; index++) {
				let element = this.data.list[index];
				if (element.name.includes(text)) {
					this.data.seachList.push(element);
				}
			}
			//设置数据
			this.setState({ list: this.data.seachList });
		} else {
			this.data.seachList = [];
			//设置数据
			this.setState({ list: this.data.list });
		}
	};

	render() {
		return (
			<View
				style={{
					backgroundColor: skin.background,
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'flex-start'
				}}
			>
				<TouchableHighlight onPress={this.searchUser} activeOpacity={1} underlayColor={skin.transparentColor}>
					<View>
						<SearchBar
							containerStyle={{
								backgroundColor: skin.tint,
								borderTopColor: skin.tint
							}}
							inputStyle={{
								backgroundColor: skin.lightSeparate
							}}
							onChangeText={(text) => {
								this.searchList(text);
							}}
							lightTheme
							placeholder={'搜索'}
						/>
					</View>
				</TouchableHighlight>
				<FlatList
					keyboardShouldPersistTaps="always"
					ItemSeparatorComponent={this.itemSeparator}
					ListFooterComponent={this.itemSeparator}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.chatItemView}
				/>
			</View>
		);
	}
}
