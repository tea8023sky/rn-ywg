import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	StatusBar,
	Image,
	TouchableHighlight,
	Alert,
	ScrollView,
	WebView,
	TextInput,
	PureComponent,
	FlatList,
	Keyboard,
	Linking,
	Switch,
	Platform,
	NativeModules,
	BackHandler,
	Modal
} from 'react-native';
import Header from '../header';
import event from '../../logic/event';
import image from '../../logic/image';
import device from '../../logic/device';
import user from '../../logic/user';
import cache from '../../logic/cache';
import Icon from 'react-native-vector-icons/Ionicons';
import skin from '../../style';
import config from '../../config';
import net from '../../logic/net';
import TimeUtil from '../../logic/TimeUtil';
import Upload from '../../logic/imgUtil';
import CollectHome from './steelCollect';
import { SearchBar, CheckBox } from 'react-native-elements';
import ImagePicker from 'react-native-syan-image-picker';
import Dimensions from 'Dimensions';
let { width, height } = Dimensions.get('window');
import Toast from 'react-native-root-toast';
import SharePlatform from '../../logic/SharePlatform';
import { ChatMessage } from '../../logic/chat';
import chat from '../../logic/chat';

/**
 * “我的”首页
 *
 * @export
 * @class MyIndex
 * @extends {Component}
 */
export default class MyIndex extends Component {
	static navigationOptions = {
		header: headerProps => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} backgroundColor={skin.activeTint} />
					<Header />
				</View>
			);
		}
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			login: false,
			name: '登录/注册',
			img: image.DefaultAvatar.man, //require('../../img/avatar/defalut_man.png')
			sexIcon: 'ios-cloud-outline', //md-female,md-male
			companyshort: '',
			user: null //用户数据
		};
	}

	//组件初始化完毕
	componentDidMount() {
		//订阅用户登录事件,以便刷新界面数据
		event.Sub(this, event.Events.user.login, this.setInfo);
		event.Sub(this, event.Events.user.logout, this.setInfo);
		//加载已登录用户数据
		this.getLoginUserInfo();
	}
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	/**
	 * 加载用户数据
	 *
	 * @memberof MyIndex
	 */
	getLoginUserInfo = async () => {
		if (user.IsLogin()) {
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData != null) {
				this.setInfo(userData);
			}
		}
	};

	/**
	 * 设置用户信息
	 *
	 * @memberof MyIndex
	 */
	setInfo = user => {
		if (user == null || user == '') {
			this.setState({
				login: false,
				name: '登录/注册',
				img: image.DefaultAvatar.man,
				sexIcon: 'ios-cloud-outline',
				companyshort: ''
			});
			return;
		}
		let avatarSource = image.GetSmallImageSource(user.img);
		if (avatarSource == image.ErrorImg.default) {
			avatarSource = user.sex == 1 ? image.DefaultAvatar.man : image.DefaultAvatar.woman;
		}
		this.setState({
			login: true,
			name: user.name,
			sexIcon: user.sex == 1 ? 'md-male' : 'md-female',
			img: avatarSource,
			companyshort: user.companyshort,
			user: user
		});
		//this.forceUpdate();
		console.log(user);
	};

	descView() {
		if (this.state.login) {
			return (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'flex-start'
					}}
				>
					<Text numberOfLines={1} style={{ fontSize: 12, color: skin.tint, marginTop: 5 }}>
						{this.state.companyshort}
					</Text>
				</View>
			);
		}
		return null;
	}

	mySetting() {
		if (this.state.login) {
			return <Text style={{ marginRight: 20, fontSize: 12, color: skin.tint }}>个人资料 ></Text>;
		}
		return null;
	}

	/**
	 * 圈子图标点击操作
	 *
	 * @memberof MyIndex
	 */
	myCircle = () => {
		//跳转到选择圈子页面(isUpdataInfo为是否为修改圈子)
		this.nav.navigate('updataCoterie', { isUpdataInfo: true });
	};

	/**
	 * 动态图标点击操作
	 *
	 * @memberof MyIndex
	 */
	myDynamic = () => {
		//我的-动态
		this.nav.navigate('userdynamic', { user: this.state.user });
	};

	/**
	 * 收藏图标点击操作
	 *
	 * @memberof MyIndex
	 */
	myCollection = () => {
		//跳转到我的-收藏
		this.nav.navigate('myCollection', { showAddBtn: true });
	};

	/**
	 * 合同图标点击操作
	 *
	 * @memberof MyIndex
	 */
	myContract = async () => {
		//跳转到电子合同页面
		this.nav.navigate('eContractMain');
	};

	logindCell() {
		if (this.state.login) {
			return (
				<View>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 100,
							flex: 1,
							borderBottomColor: skin.lightSeparate,
							borderBottomWidth: 1
						}}
					>
						<TouchableHighlight
							style={{
								flex: 1
							}}
							onPress={this.myCircle}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									flex: 1,
									height: 100
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.my.circle} />

								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 5,
										color: skin.title
									}}
								>
									圈子
								</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							style={{
								flex: 1
							}}
							onPress={this.myDynamic}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									flex: 1,
									height: 100
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.my.dynamin} />

								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 5,
										color: skin.title
									}}
								>
									动态
								</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							style={{
								flex: 1
							}}
							onPress={this.myCollection}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									flex: 1,
									height: 100
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.my.collection} />

								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 5,
										color: skin.title
									}}
								>
									收藏
								</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							style={{
								flex: 1
							}}
							onPress={this.myContract}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									flex: 1,
									height: 100
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.my.contract} />

								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 5,
										color: skin.title
									}}
								>
									合同
								</Text>
							</View>
						</TouchableHighlight>
					</View>
					<View
						style={{
							height: 10,
							backgroundColor: skin.lightSeparate
						}}
					/>
					<TouchableHighlight
						onPress={this.chengepassOnPress}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40
							}}
						>
							<Icon name="ios-key-outline" style={{ marginLeft: 20 }} size={25} color={skin.subtitle} />

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								修改密码
							</Text>
							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>
					<View
						style={{
							height: 10,
							backgroundColor: skin.lightSeparate
						}}
					/>
					<TouchableHighlight
						onPress={this.mycodeOnPress}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderBottomColor: skin.lightSeparate,
								borderBottomWidth: 1
							}}
						>
							<Icon name="ios-code" style={{ marginLeft: 20 }} size={25} color={skin.subtitle} />

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								我的邀约码
							</Text>

							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
		return null;
	}

	/**
	 * 顶部区域点击事件
	 *
	 * @memberof MyIndex
	 */
	bottomOnPress = () => {
		if (this.state.login) {
			this.nav.navigate('userInfoUpdata');
		} else {
			this.nav.navigate('login');
		}
	};

	/**
	 * 修改密码点击事件
	 *
	 * @memberof MyIndex
	 */
	chengepassOnPress = () => {
		if (this.state.login) {
			//跳转到修改密码页面
			this.nav.navigate('updataPassWord', { isUpdataPWD: true });
		} else {
			this.nav.navigate('login');
		}
	};

	/**
	 * 我的邀请码点击事件
	 *
	 * @memberof MyIndex
	 */
	mycodeOnPress = () => {
		if (this.state.login) {
			this.nav.navigate('myOfferCode');
		} else {
			this.nav.navigate('login');
		}
	};

	/**
	 * 意见反馈点击事件
	 *
	 * @memberof MyIndex
	 */
	feedbackOnPress = () => {
		if (this.state.login) {
			this.nav.navigate('feedback');
		} else {
			this.nav.navigate('login');
		}
	};

	/**
	 * 帮助中心点击事件
	 *
	 * @memberof MyIndex
	 */
	helpOnPress = () => {
		if (this.state.login) {
			this.nav.navigate('commonProblem');
		} else {
			this.nav.navigate('login');
		}
	};

	/**
	 * 设置点击事件
	 *
	 * @memberof MyIndex
	 */
	settingOnPress = () => {
		if (this.state.login) {
			//跳转到软件设置页面
			this.nav.navigate('setting');
		} else {
			this.nav.navigate('login');
		}
	};
	//调用系统拨打电话
	_callPhone = () => {
		Alert.alert(
			'',
			'点击确定拨打客服电话.',
			[
				{ text: '取消', onPress: () => {}, style: 'cancel' },
				{
					text: '确定',
					onPress: () => {
						let mobile = '4000869166';
						return Linking.openURL('tel:' + mobile);
					}
				}
			],
			{ cancelable: true }
		);
	};

	render() {
		return (
			<View style={{ backgroundColor: skin.tint, flex: 1 }}>
				<TouchableHighlight onPress={this.bottomOnPress} activeOpacity={1}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: skin.main
						}}
					>
						<View style={{ marginHorizontal: 20, marginVertical: 20 }}>
							<Image
								style={{
									width: 60,
									height: 60,
									borderRadius: 30
								}}
								source={this.state.img}
							/>
						</View>
						<View
							style={{
								flex: 1,
								justifyContent: 'flex-start',
								alignItems: 'flex-start'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'flex-start',
									alignItems: 'center',
									marginTop: 5
								}}
							>
								<Text numberOfLines={1} style={{ fontSize: 16, color: skin.tint }}>
									{this.state.name}
								</Text>
								<Icon
									name={this.state.sexIcon}
									style={{ marginLeft: 15 }}
									size={12}
									color={skin.tint}
								/>
							</View>
							{this.descView()}
						</View>
						<View style={{}}>{this.mySetting()}</View>
					</View>
				</TouchableHighlight>
				<ScrollView style={{}}>
					{this.logindCell()}
					<TouchableHighlight
						onPress={this.feedbackOnPress}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderBottomColor: skin.lightSeparate,
								borderBottomWidth: 1
							}}
						>
							<Icon name="ios-mail-outline" style={{ marginLeft: 20 }} size={25} color={skin.subtitle} />

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								意见反馈
							</Text>

							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={this.helpOnPress}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderBottomColor: skin.lightSeparate,
								borderBottomWidth: 1
							}}
						>
							<Icon
								name="ios-help-circle-outline"
								style={{ marginLeft: 20 }}
								size={25}
								color={skin.subtitle}
							/>

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								常见问题
							</Text>

							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={this.settingOnPress}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderBottomColor: skin.lightSeparate,
								borderBottomWidth: 1
							}}
						>
							<Icon
								name="ios-settings-outline"
								style={{ marginLeft: 20 }}
								size={25}
								color={skin.subtitle}
							/>

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								软件设置
							</Text>

							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>

					<TouchableHighlight
						onPress={this._callPhone}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderBottomColor: skin.lightSeparate,
								borderBottomWidth: 1
							}}
						>
							<Icon
								name="ios-headset-outline"
								style={{ marginLeft: 20 }}
								size={25}
								color={skin.subtitle}
							/>

							<Text
								style={{
									marginLeft: 20,
									flex: 1,
									justifyContent: 'flex-start',
									color: skin.title
								}}
							>
								客服电话
							</Text>
							<Icon name="ios-call-outline" style={{ marginRight: 5 }} size={25} color={skin.subtitle} />
							<Text style={{ marginRight: 10, color: skin.title }}>400-086-9166</Text>
						</View>
					</TouchableHighlight>
					{/* <View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							height: 40,
							borderBottomColor: skin.lightSeparate,
							borderBottomWidth: 1
						}}
					>
						<Icon
							name="ios-cloud-download-outline"
							style={{ marginLeft: 20 }}
							size={25}
							color={skin.subtitle}
						/>

						<Text
							style={{
								marginLeft: 20,
								flex: 1,
								justifyContent: "flex-start",
								color: skin.title
							}}
						>
							软件版本:{device.GetVersion()}{" "}
							{device.GetBuildNumber()}
						</Text>
					</View> */}
				</ScrollView>
			</View>
		);
	}
}

/**
 * 软件设置页面
 *
 * @author wuzhitao
 * @export
 * @class Setting
 * @extends {Component}
 */
export class Setting extends Component {
	//软件设置页面导航栏设置
	// static navigationOptions = ({ navigation, screenProps }) => {
	// 	return {
	// 		headerTitle: '设置',
	// 		headerTitleStyle: {
	// 			alignSelf: 'center',
	// 			textAlign: 'center',
	// 			fontSize: 16,
	// 			color: skin.tint
	// 		},
	// 		headerRight: <View />
	// 	};
	// };

	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '设置',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: <View />
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			isVoice: false, //声音提示（默认关闭）
			isShock: true //震动提示（默认打开）
		};
	}

	//组件初始化完毕
	componentDidMount() {
		//获取用户自定义的消息提醒方式
		this.getVoiceAndShock();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}
	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	/**
	 * 获取用户自定义的消息提醒方式
	 *
	 * @memberof Setting
	 */
	getVoiceAndShock = async () => {
		let voice = await cache.LoadFromFile(config.UserVoiceState);
		let shock = await cache.LoadFromFile(config.UserShockState);
		if (voice != null) {
			this.setState({ isVoice: voice == true ? true : false });
		}
		if (shock != null) {
			this.setState({ isShock: shock == false ? false : true });
		}
	};

	//点击声音开关事件
	_onPressVoice = async value => {
		//保存至缓存
		await cache.SaveToFile(config.UserVoiceState, value);
		this.setState({ isVoice: value });
	};

	//点击震动开关事件
	_onPressShock = async value => {
		//保存至缓存
		await cache.SaveToFile(config.UserShockState, value);
		this.setState({ isShock: value });
	};

	render() {
		return (
			<View style={{ backgroundColor: skin.lightSeparate, flex: 1 }}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 45,
						backgroundColor: skin.tint,
						borderBottomColor: skin.lightSeparate,
						borderBottomWidth: 1
					}}
				>
					<Text
						style={{
							marginLeft: 20,
							flex: 1,
							justifyContent: 'flex-start',
							color: skin.title
						}}
					>
						声音
					</Text>
					<Switch
						onValueChange={this._onPressVoice}
						// thumbTintColor：开关上圆形按钮的背景颜色
						thumbTintColor={this.state.isVoice ? skin.activeTint : skin.darkSeparate}
						// onTintColor：开启状态时的背景颜色
						onTintColor={skin.switchOnTintColor}
						//tintColor：关闭状态时的边框颜色(iOS)或背景颜色(Android)
						style={{ marginRight: 10 }}
						value={this.state.isVoice}
					/>
				</View>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 45,
						backgroundColor: skin.tint,
						borderBottomColor: skin.lightSeparate,
						borderBottomWidth: 1
					}}
				>
					<Text
						style={{
							marginLeft: 20,
							flex: 1,
							justifyContent: 'flex-start',
							color: skin.title
						}}
					>
						震动
					</Text>
					<Switch
						onValueChange={this._onPressShock}
						thumbTintColor={this.state.isShock ? skin.activeTint : skin.darkSeparate}
						onTintColor={skin.switchOnTintColor}
						style={{ marginRight: 10 }}
						value={this.state.isShock}
					/>
				</View>
				<TouchableHighlight
					onPress={() => this.clearCacheBtn()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						marginTop: 15
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 45,
							borderBottomColor: skin.lightSeparate,
							backgroundColor: skin.tint,
							borderBottomWidth: 1
						}}
					>
						<Text
							style={{
								marginLeft: 20,
								flex: 1,
								justifyContent: 'flex-start',
								color: skin.title
							}}
						>
							清除缓存
						</Text>

						<Icon name="ios-arrow-forward" style={{ marginRight: 20 }} size={25} color={skin.subtitle} />
					</View>
				</TouchableHighlight>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 45,
						borderBottomColor: skin.lightSeparate,
						backgroundColor: skin.tint,
						borderBottomWidth: 1
					}}
				>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center'
						}}
					>
						<Text
							style={{
								marginLeft: 20,
								textAlign: 'left',
								color: skin.title
							}}
						>
							软件版本
						</Text>
					</View>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'center'
						}}
					>
						<Text
							style={{
								marginRight: 20,
								flex: 1,
								textAlign: 'right',
								color: skin.title
							}}
						>
							V{device.GetVersion()} Build {device.GetBuildNumber()}
						</Text>
					</View>
				</View>

				<TouchableHighlight
					onPress={this.loginOut}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						flexDirection: 'row',
						marginHorizontal: 20,
						marginTop: 25,
						borderRadius: 5
					}}
				>
					<View
						style={{
							flex: 1,
							backgroundColor: skin.main,
							justifyContent: 'center',
							alignItems: 'center',
							height: 45,
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.tint, fontSize: 16 }}>退出</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	/**
	 * 清楚缓存按钮事件
	 *
	 * @memberof Setting
	 */
	clearCacheBtn() {
		//此处第一个参数为Title，默认为''
		Alert.alert('', '清除缓存', [{ text: '取消' }, { text: '确定', onPress: () => this.clearCache() }]);
	}

	/**
	 * 清楚缓存操作
	 *
	 * @memberof Setting
	 */
	async clearCache() {
		//清除缓存操作

		//清除新闻搜索历史纪录
		await cache.RemoveCache(config.SearchHistory);
		//清除语言播报列表
		await cache.RemoveCache(config.AudioListKey);
		//清楚报价单
		await cache.RemoveCache(config.ToolOfferInfoKey);
		await cache.RemoveCache(config.NewsDetailCache); //删除文章详情页缓存
		await cache.RemoveCache(config.PublishDynamicKey); //删除动态缓存

		Toast.show('清除完成', {
			duration: Toast.durations.SHORT,
			position: Toast.positions.BOTTOM
		});
	}

	/**
	 * 退出按钮事件
	 *
	 * @memberof Setting
	 */
	loginOut = async () => {
		//退出登录状态
		let result = await user.LoginOut();
		if (!result.ok) {
			Alert.alert(result.msg);
			return;
		}
		//停止聊天服务
		await chat.stopChatWebSocket();
		// 退出成功后删除本地缓存
		await cache.RemoveCache(config.UserInfoSaveKey); //删除用户信息缓存
		await cache.RemoveCache(config.UserCirclesInfoSaveKey); //删除用户圈子缓存
		await cache.RemoveCache(config.ToolOfferInfoKey); //删除报价单缓存

		await cache.RemoveCache(config.NewsDetailCache); //删除文章详情页缓存
		await cache.RemoveCache(config.PublishDynamicKey); //删除动态缓存
		//TODO:是否有别的缓存数据需要清除
		event.Send(event.Events.user.logout, '');
		event.Send(event.Events.main.chatIconNum, ''); //未读消息数清空
		this.nav.goBack();
	};
}

/**
 * 常见问题页面
 *
 * @author wuzhitao
 * @export
 * @class CommonProblem
 * @extends {Component}
 */
export class CommonProblem extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '常见问题',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: '#FFF' }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: <View style={{ paddingRight: 20 }} />
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		// 添加返回键监听
		this.addBackAndroidListener(this.nav);
	}
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	_goBackPage = () => {
		if (this.state.backButtonEnabled) {
			this.refs['webView'].goBack();
		} else {
			this.nav.goBack();
		}
	};
	//获取链接
	getSource() {
		if (!config.Release) {
			return config.HelpProblemUrlTest;
		}
		return config.HelpProblemUrl;
	}

	//自定义返回事件
	// _goBackPage = () => {};

	onNavigationStateChange = navState => {
		this.setState({
			backButtonEnabled: navState.canGoBack
		});
	};

	// 监听原生返回键事件
	addBackAndroidListener(navigator) {
		if (Platform.OS === 'android') {
			BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		}
	}

	onBackAndroid = () => {
		if (this.state.backButtonEnabled) {
			this.refs['webView'].goBack();
			return true;
		} else {
			return false;
		}
	};
	render() {
		let Dimensions = require('Dimensions');
		let { width, height } = Dimensions.get('window');
		return (
			<View style={{ backgroundColor: skin.lightSeparate, flex: 1 }}>
				<WebView
					source={{ uri: this.getSource() }}
					style={{
						flex: 10,
						justifyContent: 'center',
						alignItems: 'center',
						width: width
					}}
					ref="webView"
					onNavigationStateChange={this.onNavigationStateChange}
				/>
			</View>
		);
	}
}

/**
 * 我的邀约码页面
 *
 * @author wuzhitao
 * @export
 * @class MyOfferCode
 * @extends {Component}
 */
export class MyOfferCode extends Component {
	// 我的邀约码页面导航栏设置
	// static navigationOptions = {
	// 	title: ' 我的邀约码'
	// };

	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '我的邀约码',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: <View />
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			number: 0, //已邀请人数
			offerCode: '', //我的邀约码
			isShareMenuShow: false //分享面板
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.setData();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	/**
	 * 填充数据
	 *
	 * @memberof MyOfferCode
	 */
	setData = async () => {
		let user = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (user != null) {
			this.setState({ offerCode: user.id });
		}

		let result = await net.ApiPost('user', 'GetInviteCount', {});
		if (__DEV__) {
			console.log('用户邀请人数网络请求接口:' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('网络请求发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			this.setState({ number: result.data });
			return;
		} else {
			Alert.alert('发生未知错误');
			return;
		}
	};

	/**
	 * 分享按钮事件
	 *
	 * @memberof MyOfferCode
	 */
	shareButton = () => {
		this.setState({ isShareMenuShow: true });
	};

	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'业务GO',
			'我正在使用业务GO，拥有自己的专属id-' + this.state.offerCode + '.快来下载使用钢贸圈神器业务GO吧。集工具+资讯+圈子为一体的钢贸全生态服务。',
			'http://yw.gangguwang.com/sharemobile',
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHAT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					return;
				} else if (code == '取消分享') {
					this.setState({ isShareMenuShow: false });
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	sharePyq = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'业务GO',
			'我正在使用业务GO，拥有自己的专属id-' + this.state.offerCode + '.快来下载使用钢贸圈神器业务GO吧。集工具+资讯+圈子为一体的钢贸全生态服务。',
			'http://yw.gangguwang.com/sharemobile',
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHATMOMENT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	shareQQ = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'业务GO',
			'我正在使用业务GO，拥有自己的专属id-' + this.state.offerCode + '.快来下载使用钢贸圈神器业务GO吧。集工具+资讯+圈子为一体的钢贸全生态服务。',
			'http://yw.gangguwang.com/sharemobile',
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQ,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常

					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};

	shareQQZONE = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'业务GO',
			'我正在使用业务GO，拥有自己的专属id-' + this.state.offerCode + '.快来下载使用钢贸圈神器业务GO吧。集工具+资讯+圈子为一体的钢贸全生态服务。',
			'http://yw.gangguwang.com/sharemobile',
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQZONE,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常

					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	render() {
		return (
			<View
				style={{
					backgroundColor: skin.tint,
					justifyContent: 'flex-start',
					flex: 1
				}}
			>
				<View
					style={{
						justifyContent: 'flex-start',
						backgroundColor: skin.tint,
						height: 190,
						alignItems: 'center'
					}}
				>
					<Image
						style={{
							position: 'absolute',
							marginTop: 30,
							width: 160,
							height: 160,
							backgroundColor: skin.tint,
							borderRadius: 80
						}}
						source={image.my.offercode}
					/>
					<View
						style={{
							marginTop: 90,
							width: 160,
							height: 160,
							justifyContent: 'flex-start',
							alignItems: 'center'
						}}
					>
						<Text
							style={{
								fontSize: 26,
								color: skin.main
							}}
						>
							{this.state.number}
						</Text>
						<Text>已邀请人数</Text>
					</View>
				</View>

				<View
					style={{
						justifyContent: 'flex-start',
						marginTop: 5,
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							color: '#000000'
						}}
					>
						您的专属邀约码
					</Text>
					<Text
						style={{
							color: skin.highlightedRed,
							fontSize: 26,
							marginTop: 5
						}}
					>
						{this.state.offerCode}
					</Text>
				</View>

				<TouchableHighlight
					onPress={this.shareButton}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						flexDirection: 'row',
						marginHorizontal: 40,
						marginTop: 25,
						borderRadius: 5
					}}
				>
					<View
						style={{
							flex: 1,
							backgroundColor: skin.main,
							justifyContent: 'center',
							alignItems: 'center',
							height: 40,
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.tint, fontSize: 16 }}>分享</Text>
					</View>
				</TouchableHighlight>
				<Modal
					style={{
						backgroundColor: '#00000011',
						width: width,
						height: height
					}}
					animationType={'fade'}
					transparent={true}
					visible={this.state.isShareMenuShow}
					onRequestClose={() => {
						this.setState({ isShareMenuShow: false });
					}}
				>
					<TouchableHighlight
						onPress={() => {
							this.setState({ isShareMenuShow: false });
						}}
					>
						<View
							style={{
								backgroundColor: '#00000055',
								width: width,
								height: height
							}}
						/>
					</TouchableHighlight>
					<View
						style={{
							backgroundColor: '#fff',
							flexDirection: 'row',
							position: 'absolute',
							bottom: 0,
							right: 0,
							borderTopColor: '#f3f3f3',
							width: width,
							justifyContent: 'space-around',
							alignItems: 'center',
							height: width / 5
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareWeixin()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.newsimages.weixin} />
								<Text>微信好友</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.sharePyq()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.newsimages.pengyouq} />
								<Text>微信朋友圈</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareQQ()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.newsimages.qq} />
								<Text>QQ</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareQQZONE()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image style={{ width: 30, height: 30 }} source={image.newsimages.qqzone} />
								<Text>QQ空间</Text>
							</View>
						</TouchableHighlight>
					</View>
				</Modal>
			</View>
		);
	}
}

/**
 * 我的-意见反馈页面
 *
 * @author wuzhitao
 * @export
 * @class Feedback
 * @extends {Component}
 */
export class Feedback extends Component {
	// 我的邀约码页面导航栏设置
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '意见反馈',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.clickSave();
					}}
				>
					<View>
						<Text style={{ color: '#FFF', paddingRight: 10 }}>提交</Text>
					</View>
				</TouchableHighlight>
			)
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			feedText: '', //反馈文字信息
			feedImage: '', //反馈图片信息
			simgsArr: '', //小图图片地址 [{index:0,url:"xxx"},{index:1,url:"xxx"},...{index:5,url:"xxx"}]
			bimgsArr: '', //大图图片地址[{url:"xxx"},{url:"xxx"},...{url:"xxx"}]
			canClickAdd: false, //避免点击上传图片按钮
			isIOSNine: false, //是否位ios 9
			newValue: ''
		};
	}

	//组件初始化完毕
	componentDidMount() {
		// 订阅消息列表更新事件
		event.Sub(this, event.Events.dynamic.delImg, this.updateImgList);
		this.props.navigation.setParams({
			clickSave: this.cliclSubmit, //顶部意见反馈提交事件
			goBackPage: this._goBackPage
		});

		if (Platform.OS == 'ios') {
			let iosVersion = Platform.Version.toString();
			if (iosVersion.startsWith('9.')) {
				this.setState({ isIOSNine: true });
			}
		}
	}
	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	updateImgList = item => {
		//成功订阅后，需要将此id从旧数据中删掉
		this.setState({
			simgsArr: item.simgsArr,
			bimgsArr: item.bimgsArr
		});
	};
	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
	}
	//调用系统拨打电话
	_callPhone = () => {
		Alert.alert(
			'',
			'点击确定拨打客服电话.',
			[
				{ text: '取消', onPress: () => {}, style: 'cancel' },
				{
					text: '确定',
					onPress: () => {
						let mobile = '4000869166';
						return Linking.openURL('tel:' + mobile);
					}
				}
			],
			{ cancelable: true }
		);
	};
	/**
	 * 提交按钮事件
	 *
	 * @memberof MyOfferCode
	 */
	cliclSubmit = async () => {
		let text = this.state.feedText.toString().trim();
		if (text == null || text == '') {
			Toast.show('请输入反馈内容.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (text.length > 140) {
			Toast.show('反馈内容不超过140个字符.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}

		//处理保存在数据库中的图片地址
		let sImgs = this.state.simgsArr; //小图地址
		let bImg = this.state.bimgsArr; //大图地址
		let saveImg = '';
		for (let j = 0, len = sImgs.length; j < len; j++) {
			if (sImgs.length == 1) {
				saveImg += sImgs[j].url + ',' + bImg[j].url;
			} else if (j == len - 1) {
				saveImg += sImgs[j].url + ',' + bImg[j].url;
			} else {
				saveImg += sImgs[j].url + ',' + bImg[j].url + '|';
			}
		}

		let userData = await cache.LoadFromFile(config.UserInfoSaveKey); //获取缓存中的用户信息
		if (userData == null) {
			return;
		}
		let result = await net.ApiPost('feedback', 'AddFeedBack', {
			uid: userData.id,
			name: userData.name,
			mobile: userData.mobile,
			content: text,
			img: saveImg
		});

		if (result == null || typeof result.status == 'undefined') {
			Toast.show('反馈意见时发生错误,请稍后重试.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else if (result.status == 0) {
			Toast.show(result.error, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else if (result.status == 1) {
			Toast.show('反馈成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			this.nav.goBack();
			return;
		} else {
			Toast.show('发生未知错误', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
	};
	/**
	 * 动态图片(最多九张图)选择显示
	 *
	 * @author zhengyeye
	 * @returns
	 * @memberof publish
	 */
	createImageItem() {
		let defaultImgView;
		if (this.state.simgsArr != null && this.state.simgsArr.length >= 9) {
			defaultImgView = null;
		} else {
			defaultImgView = (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					disabled={this.state.canClickAdd}
					onPress={() => {
						this.onPress();
					}}
				>
					<Image source={image.chat.addimg} style={{ width: 70, height: 70 }} />
				</TouchableHighlight>
			);
		}

		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap'
				}}
			>
				{this.state.simgsArr
					? this.state.simgsArr.map(i => (
							<View
								key={i.url}
								style={{
									width: 70,
									height: 70,
									marginTop: 5,
									marginLeft: (width - 4 * 70) / 5
								}}
							>
								<TouchableHighlight
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									onPress={() => this.ItemPress(i.index)}
								>
									<Image style={{ width: 70, height: 70 }} source={{ uri: i.url }} />
								</TouchableHighlight>
							</View>
						))
					: null}
				<View
					style={{
						width: 70,
						height: 70,
						marginLeft: (width - 4 * 70) / 5,
						marginTop: 5
					}}
				>
					{defaultImgView}
				</View>
			</View>
		);
	}

	ItemPress = index => {
		//点击小图查看大图
		this.nav.navigate('imgsCanDel', {
			simgsArr: this.state.simgsArr,
			bimgsArr: this.state.bimgsArr,
			index: index
		});
	};

	onPress = async () => {
		this.setState({ canClickAdd: true });
		let uriArray = []; //图片上传组件的本地路径数组集合
		let simgsArr = this.state.simgsArr == '' ? [] : this.state.simgsArr; //小图路径
		let bimgsArr = this.state.bimgsArr == '' ? [] : this.state.bimgsArr; //大图路径
		let imgLength = 9;
		let nowImgsLen = this.state.simgsArr.length;
		let len = imgLength - nowImgsLen;

		//上传图片
		ImagePicker.showImagePicker(image.ImagePickerMultiOptions(len), async (err, selectedPhotos) => {
			//selectedPhotos为选中的图片数组
			if (err) {
				// 取消选择
				this.setState({
					canClickAdd: false
				});
				return;
			}
			let index = 0;
			let result = selectedPhotos;
			let len = result.length;
			//处理上传的图片
			for (let i = 0, len = result.length; i < len; i++) {
				simgsArr.length == 0 ? 0 : simgsArr.length + 1;
				let uploadres = await Upload.UploadImg(result[i], 'ywg_feedback');
				simgsArr.push({
					index: simgsArr.length,
					url: uploadres.split(',')[0]
				});
				bimgsArr.push({ url: uploadres.split(',')[1] });
			}
			this.setState({
				simgsArr: simgsArr,
				bimgsArr: bimgsArr,
				canClickAdd: false
			});
			this.createImageItem();
			//上传图片完成后的提示
			Toast.show('成功上传' + len + '张图片', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		});
	};
	//反馈意见文本改变事件
	_feedText = async text => {
		if (text.length == 0) {
			//文本框被清空后
			Keyboard.dismiss(); //隐藏键盘
		}
		this.setState({ feedText: text });
	};

	/**
	 * 输入值控制
	 *
	 * @memberof UpdataInfo
	 */
	setValue = text => {
		let value = text;
		if (this.state.isIOSNine) {
			if (text.length >= 140) {
				value = text.substr(0, 140);
			}
			this.setState({ newValue: value });
		}
		this._feedText(value);
	};

	/**
	 * 文本输入视图
	 *
	 * @returns
	 * @memberof Feedback
	 */
	inputView() {
		if (this.state.isIOSNine) {
			return (
				<TextInput
					style={{
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						textAlignVertical: 'top',
						color: skin.subtitle,
						height: 130,
						padding: 0
					}}
					clearButtonMode="while-editing"
					returnKeyType="done"
					underlineColorAndroid="transparent"
					placeholderTextColor={skin.subtitle}
					multiline={true}
					maxLength={140}
					placeholderTextColor={skin.subtitle}
					placeholder="您的建议是我们前进的动力！(140个字符以内)"
					value={this.state.newValue}
					onChangeText={text => {
						this.setValue(text);
					}}
				/>
			);
		}
		return (
			<TextInput
				style={{
					justifyContent: 'flex-start',
					alignItems: 'flex-start',
					textAlignVertical: 'top',
					color: skin.subtitle,
					height: 130,
					padding: 0
				}}
				clearButtonMode="while-editing"
				returnKeyType="done"
				underlineColorAndroid="transparent"
				placeholderTextColor={skin.subtitle}
				multiline={true}
				maxLength={140}
				placeholderTextColor={skin.subtitle}
				placeholder="您的建议是我们前进的动力！(140个字符以内)"
				onChangeText={this._feedText}
			/>
		);
	}
	render() {
		return (
			<ScrollView
				style={{
					backgroundColor: skin.tint
				}}
			>
				<View
					style={{
						backgroundColor: skin.tint,
						justifyContent: 'flex-start',
						flex: 1
					}}
				>
					<View
						style={{
							borderBottomWidth: 1,
							height: 150,
							marginLeft: 20,
							marginRight: 20,
							marginTop: 10,
							borderColor: skin.tint
						}}
					>
						{this.inputView()}
					</View>
					<View style={{ height: 5, backgroundColor: '#F2F2F2' }} />
					<View
						style={{
							marginTop: 10
						}}
					>
						{this.createImageItem()}
					</View>

					<View
						style={{
							justifyContent: 'center',
							marginTop: 30,
							alignItems: 'center',
							flex: 1
						}}
					>
						<Text
							style={{
								color: skin.subtitle
							}}
						>
							如果您有好的建议，请致电：
						</Text>
						<TouchableHighlight
							onPress={this._callPhone}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<Text
								style={{
									color: skin.highlightedRed,
									fontWeight: 'bold'
								}}
							>
								400-086-9166
							</Text>
						</TouchableHighlight>
					</View>
				</View>
			</ScrollView>
		);
	}
}

/**
 * 我的-收藏
 *
 * @author wuzhitao
 * @export
 * @class MyCollection
 * @extends {Component}
 */
export class MyCollection extends Component {
	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '收藏',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: (
				<TouchableHighlight
					onPress={() => navigation.state.params.addCollection()}
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
						<Text style={{ color: skin.tint, fontSize: 14 }}>
							{navigation.state.params.showAddBtn ? '添加' : ''}
						</Text>
					</View>
				</TouchableHighlight>
			)
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			selected: true //默认我的收藏未选中状态
		};
	}

	//组件初始化完毕
	componentDidMount() {
		//传参给页面导航栏
		this.props.navigation.setParams({
			showAddBtn: true, //默认我的收藏未选中状态
			addCollection: this.addCollection, //添加我的收藏方法
			goBackPage: this._goBackPage
		});
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	/**
	 * 用户手动添加我的收藏
	 *
	 * @memberof MyCollection
	 */
	addCollection = () => {
		if (this.state.selected) {
			this.nav.navigate('addCollection');
		}
	};

	/**
	 * 修改选中状态
	 *@param type 选中标志1：我的收藏、2：钢企名录
	 */
	updataSelect = type => {
		if (type == 1 && this.state.selected == false) {
			this.setState({ selected: true });
			//顶部导航栏显示"添加"按钮
			this.props.navigation.setParams({
				showAddBtn: true
			});
			return;
		}
		if (type == 2 && this.state.selected == true) {
			this.setState({ selected: false });
			//顶部导航栏不显示"添加"按钮
			this.props.navigation.setParams({
				showAddBtn: false
			});
		}
	};

	//数据展示视图
	dataView() {
		if (this.state.selected == true) {
			return <CollectionList navigation={this.props.navigation} />;
		}
		return <CollectHome navigation={this.props.navigation} />;
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'flex-start',
					backgroundColor: skin.tint
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 40
					}}
				>
					<TouchableHighlight
						style={{
							flex: 1,
							height: 40
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						onPress={() => this.updataSelect(1)}
					>
						<View
							style={{
								flexDirection: 'row',
								flex: 1,
								justifyContent: 'center',
								alignItems: 'flex-start',
								backgroundColor: this.state.selected == true ? skin.activeTint : skin.lightSeparate,
								height: 40
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									height: 39,
									backgroundColor: this.state.selected == true ? skin.tint : skin.lightSeparate
								}}
							>
								<Text
									style={{
										textAlign: 'center',
										textAlignVertical: 'center',
										color: this.state.selected == true ? skin.activeTint : skin.subtitle
									}}
								>
									我的收藏
								</Text>
							</View>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						style={{
							flex: 1,
							height: 40
						}}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						onPress={() => this.updataSelect(2)}
					>
						<View
							style={{
								flexDirection: 'row',
								flex: 1,
								justifyContent: 'center',
								alignItems: 'flex-start',
								backgroundColor: this.state.selected == false ? skin.activeTint : skin.lightSeparate,
								height: 40
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									height: 39,
									backgroundColor: this.state.selected == false ? skin.tint : skin.lightSeparate
								}}
							>
								<Text
									style={{
										textAlign: 'center',
										textAlignVertical: 'center',
										color: this.state.selected == false ? skin.activeTint : skin.subtitle
									}}
								>
									钢企名录
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>

				{this.dataView()}
			</View>
		);
	}
}

/**
 * 我的收藏展示列表
 *
 * @export
 * @class CollectionList
 * @extends {Component}
 */
export class CollectionList extends Component {
	//构造方法
	constructor(props) {
		super(props);
		this.state = {
			//loading,标示当前的加载状态
			//0标示没有开始加载,可以显示提示用户滑动加载的相关提示
			//1标示正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1标示禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			list: []
		};
		this.data = {
			list: []
		};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		//发送事件，通知我的收藏刷新页面（查看文章详情后，可能会点击取消收藏文章，因此返回后需要刷新页面）
		event.Sub(this, event.Events.collect.mycollectsearch, this._goBackCallback);
		//获取所有数据
		this.getAllData();
	}
	_goBackCallback = () => {
		this.getAllData();
	};
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	/**
	 * 网络请求获取所有数据
	 *
	 * @memberof MyCollection
	 */
	getAllData = async () => {
		let listdata = await this.getCollectionData('', '0');

		if (listdata != null && listdata.length > 0) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ':' + new Date().getTime();
			}
			this.setState({
				list: listdata
			});
		} else {
			this.setState({
				list: []
			});
		}
	};

	//加载更多
	loadMore = async () => {
		if (this.state.list == null || this.state.list.length == 0 || this.state.loading != 0) {
			return;
		}

		let loadingState = 0;

		this.setState({ loading: 1 });
		let lastid = this.state.list[this.state.list.length - 1].id;

		let listdata = await this.getCollectionData('', lastid);

		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ':' + new Date().getTime();
		}

		if (listdata != null && listdata.length > 0) {
			this.setState({ list: this.state.list.concat(listdata) });
		} else {
			loadingState = -1; //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	/**
	 * 获取我的收藏数据网络请求方法
	 *
	 * @param {string} search 搜索关键字
	 * @param {string} maxid 最后一条数据id
	 * @memberof MyCollection
	 */
	async getCollectionData(search, maxid) {
		let result = await net.ApiPost('collect', 'GetCollectList', {
			search: search,
			maxid: maxid
		});

		if (result != null && result.status == 1) {
			return result.data;
		}
		return null;
	}

	//列表分割线控件
	itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: skin.lightSeparate }} />;
	};

	//列表底部控件
	listFooter = () => {
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
					<Text style={{ fontSize: 16, color: skin.title }} />
				</View>
			);
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
					<Text style={{ fontSize: 16, color: skin.title }} />
				</View>
			);
		}
	};

	/**
	 * 删除收藏按钮事件
	 *
	 * @param {string} id 可被删除收藏id
	 * @memberof CollectionList
	 */
	moveCollectionItem(item) {
		Alert.alert('', '是否删除收藏', [{ text: '取消' }, { text: '删除', onPress: () => this.deleteRequest(item) }]);
	}

	/**
	 * 收藏删除网络请求
	 *
	 * @param {string} id 被删除收藏id
	 * @memberof CollectionList
	 */
	async deleteRequest(item) {
		let result = await net.ApiPost('collect', 'DelCollect', {
			id: item.id
		});
		if (result != null && result.status == 1) {
			this.getAllData();
			if (item.linkid > 0) {
				//删除文章缓存
				this.DelArticleCache(item.linkid);
			}
		}
	}

	//删除新闻详情缓存
	//id   取消收藏文章id
	DelArticleCache = async function(id) {
		try {
			let articleList = await cache.LoadFromFile(config.NewsDetailCache);
			if (articleList) {
				for (let i = 0; i < articleList.length; i++) {
					if (id == articleList[i].id) {
						articleList.splice(i, 1);
						break;
					}
				}
			}
			cache.SaveToFile(config.NewsDetailCache, articleList);
		} catch (error) {
			//console.log('保存缓存失败:' + JSON.stringify(error));
		}
		return null;
	};

	//创建list item,根据数据不同创建不同的item模板
	createListItem = ({ item }) => {
		if (item.type == 20) {
			return (
				<View
					style={{
						flex: 1,
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: 'column'
					}}
				>
					<TouchableHighlight
						onPress={() => this.ItemPress(item)}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View>
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<Text
									style={{
										fontSize: 12,
										color: skin.inactiveTint,
										width: 100
									}}
								>
									纯文本
								</Text>
								<Text
									style={{
										flex: 1,
										fontSize: 12,
										color: skin.inactiveTint
									}}
								>
									{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
								</Text>
								<TouchableHighlight
									onPress={() => this.moveCollectionItem(item)}
									activeOpacity={1}
									underlayColor={skin.transparentColor}
								>
									<View
										style={{
											width: 40,
											alignItems: 'flex-end'
										}}
									>
										<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
									</View>
								</TouchableHighlight>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginTop: 5
								}}
							>
								<Text
									style={{
										flex: 1,
										fontSize: 16,
										color: skin.inactiveTint
									}}
								>
									{item.name}
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
		if (item.type == 1) {
			if (item.showtype == 1) {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'column'
						}}
					>
						<TouchableHighlight
							onPress={() => this.ItemPress(item)}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											width: 100,
											flexDirection: 'row'
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height: Platform.OS == 'ios' ? 14 : 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor: skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											文章
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
									</Text>
									<TouchableHighlight
										onPress={() => this.moveCollectionItem(item)}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: 'flex-end'
											}}
										>
											<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 75,
											width: 100,
											borderRadius: 5
										}}
										source={{
											uri: item.img,
											cache: 'force-cache'
										}}
									/>
									<View style={{ paddingLeft: 10, flex: 1 }}>
										<Text
											style={{
												flex: 1,
												fontSize: 16,
												color: skin.title
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			} else {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'column'
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.ItemPress(item)}
						>
							<View>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											width: 100,
											flexDirection: 'row'
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height: Platform.OS == 'ios' ? 14 : 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor: skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											文章
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
									</Text>
									<TouchableHighlight
										onPress={() => this.moveCollectionItem(item)}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: 'flex-end'
											}}
										>
											<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 160,
											width: width - 20,
											borderRadius: 5
										}}
										resizeMode="stretch"
										source={{
											uri: item.img,
											cache: 'force-cache'
										}}
									/>
									<View
										style={{
											height: 20,
											marginTop: -20,
											backgroundColor: '#00000088',
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Text
											numberOfLines={1}
											style={{
												color: '#FFF',
												fontSize: 14
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			}
		}
		if (item.type == 2) {
			if (item.showtype == 1) {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'column'
						}}
					>
						<TouchableHighlight
							onPress={() => this.ItemPress(item)}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											width: 100,
											flexDirection: 'row'
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height: Platform.OS == 'ios' ? 14 : 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor: skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											图集
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
									</Text>
									<TouchableHighlight
										onPress={() => this.moveCollectionItem(item)}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: 'flex-end'
											}}
										>
											<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 75,
											width: 100,
											borderRadius: 5
										}}
										source={{
											uri: item.img,
											cache: 'force-cache'
										}}
									/>
									<View style={{ paddingLeft: 10, flex: 1 }}>
										<Text
											style={{
												flex: 1,
												fontSize: 16,
												color: skin.title
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			} else {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'column'
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.ItemPress(item)}
						>
							<View>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											width: 100,
											flexDirection: 'row'
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height: Platform.OS == 'ios' ? 14 : 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor: skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											图集
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
									</Text>
									<TouchableHighlight
										onPress={() => this.moveCollectionItem(item)}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: 'flex-end'
											}}
										>
											<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 160,
											width: width - 20,
											borderRadius: 5
										}}
										resizeMode="stretch"
										source={{
											uri: item.img,
											cache: 'force-cache'
										}}
									/>
									<View
										style={{
											height: 20,
											marginTop: -20,
											backgroundColor: '#00000088',
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Text
											numberOfLines={1}
											style={{
												color: '#FFF',
												fontSize: 14
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			}
		}
		if (item.type == 3) {
			return (
				<View
					style={{
						flex: 1,
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: 'column'
					}}
				>
					<TouchableHighlight
						onPress={() => this.ItemPress(item)}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View>
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<View style={{ width: 100, flexDirection: 'row' }}>
									<Text
										style={{
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										布谷资讯
									</Text>
									<Text
										style={{
											height: Platform.OS == 'ios' ? 14 : 18,
											fontSize: 10,
											color: skin.tint,
											backgroundColor: skin.highlightedRed,
											marginLeft: 5,
											padding: 2,
											borderRadius: 2
										}}
									>
										语音
									</Text>
								</View>

								<Text
									style={{
										flex: 1,
										fontSize: 12,
										color: skin.inactiveTint
									}}
								>
									{TimeUtil.getTime(item.ctime, 'yyyy-MM-dd')}
								</Text>
								<TouchableHighlight
									onPress={() => this.moveCollectionItem(item)}
									activeOpacity={1}
									underlayColor={skin.transparentColor}
								>
									<View
										style={{
											width: 40,
											alignItems: 'flex-end'
										}}
									>
										<Icon name="ios-trash-outline" size={20} color={'#ccc'} />
									</View>
								</TouchableHighlight>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginTop: 5
								}}
							>
								<Image
									style={{
										height: 75,
										width: 100,
										borderRadius: 5
									}}
									source={{
										uri: item.type == 3 ? item.img.split(',')[0] : item.img,
										cache: 'force-cache'
									}}
								/>
								<View style={{ paddingLeft: 10, flex: 1 }}>
									<Text
										style={{
											flex: 1,
											fontSize: 16,
											color: skin.title
										}}
									>
										{item.name}
									</Text>
								</View>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
	};

	ItemPress = async item => {
		if (item.type == 20) {
			//跳转到纯文本详情页与文字消息处理方式一样
			this.nav.navigate('textView', {
				navigation: this.props.navigation,
				content: item.content
			});
		} else {
			let result = await this.queryNewsInfo(item.linkid);
			if (result != null) {
				this.nav.navigate('newsView', {
					id: item.linkid,
					type: result.isimg,
					tid: result.cid,
					item: result,
					collectflag: true
				});
			}
		}
	};

	/**
	 * 根据文章ID查询文章
	 *
	 * @param {any} aid 文章ID
	 * @returns
	 */
	queryNewsInfo = async aid => {
		let result = await net.ApiPost('article', 'GetArticleByID', {
			aid: aid
		});
		if (result != null && result.status == 1) {
			return result.data;
		}
		return null;
	};

	/**
	 * 搜索框点击事件
	 */
	searchaData = () => {
		this.nav.navigate('myCollectSearch');
	};

	// 列表滑动到什么位置加载下一页数据,参数设置FlatList的onEndReachedThreshold
	// 此参数为一个比例值,详见官方文档
	// TODO: 后期android和ios可以区别对待,ios为负数,android为正数
	onEndReachedThreshold = 0.1;

	render() {
		return (
			<View>
				<TouchableHighlight onPress={this.searchaData} activeOpacity={1} underlayColor={skin.transparentColor}>
					<View
						style={{
							flexDirection: 'row',
							margin: 5,
							backgroundColor: '#f3f3f3'
						}}
					>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Image style={{ width: 16, height: 16 }} source={image.newsimages.search} />
						</View>
						<Text
							style={{
								flex: 9,
								color: '#5c5c5c',
								fontSize: 12,
								padding: 10,
								paddingBottom: 10
							}}
						>
							请输入您要搜索的内容
						</Text>
					</View>
				</TouchableHighlight>
				<FlatList
					style={{
						height: Platform.OS == 'ios' ? height - 140 : height - 170
					}}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={this.itemSeparator}
					// ListFooterComponent={this.listFooter}
					onEndReachedThreshold={this.onEndReachedThreshold}
					onEndReached={this.loadMore}
				/>
			</View>
		);
	}
}

/**
 * 纯文本详情页面（适用于我的收藏纯文本、聊天文本消息）
 *
 * @export
 * @class TextView
 * @extends {Component}
 */
export class TextView extends Component {
	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			content: this.props.navigation.state.params.content //要显示的内容
		};
	}

	//顶部导航
	static navigationOptions = {
		header: headerProps => {
			return (
				<View>
					<Header />
				</View>
			);
		}
	};

	/**
	 * 点击文字或文字外部空白区域事件
	 *
	 * @memberof TextView
	 */
	goBackClick() {
		//直接返回上个页面
		this.nav.goBack();
	}

	/**
	 * 长按文字事件
	 *
	 * @memberof TextView
	 */
	_onLongPress() {
		const chatMsg = {
			content: this.data.content,
			contentType: ChatMessage.ContentType.Chat_Text
		};
		//跳转到多选页面
		this.nav.navigate('multipleChoice', {
			confirmNum: 0,
			chatMessage: chatMsg
		});
	}

	render() {
		let Dimensions = require('Dimensions');
		let { width, height } = Dimensions.get('window');

		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: skin.background
				}}
			>
				<TouchableHighlight
					onPress={() => this.goBackClick()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
							width: width
						}}
					>
						<ScrollView style={{}}>
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text
									style={{
										fontSize: 18,
										color: skin.inactiveTint,
										backgroundColor: skin.tint
									}}
									onLongPress={() => this._onLongPress()}
									onPress={() => this.goBackClick()}
								>
									{this.data.content}
								</Text>
							</View>
						</ScrollView>
					</View>
				</TouchableHighlight>
			</View>
		);
	}
}

/**
 * 我的-收藏-添加，添加我的收藏页面
 *
 * @export
 * @class AddCollection
 * @extends {Component}
 */
export class AddCollection extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			collectionStr: '' //修改值
		};
	}
	//页面导航栏设置
	// static navigationOptions = {
	// 	title: ' 添加'
	// };
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '添加',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerLeft: (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
					</View>
				</TouchableHighlight>
			),
			headerRight: <View />
		};
	};

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	/**
	 * 提交按钮事件
	 *
	 * @memberof UpdataInfo
	 */
	addCollectionClick = async () => {
		Keyboard.dismiss(); //隐藏键盘
		let str = this.data.collectionStr
			.toString()
			.trim()
			.replace("/'/g", '');
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
		if (__DEV__) {
			console.log('用户邀请人数网络请求接口:' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('网络请求发生错误,请稍后重试');
			return;
		} else if (result.status == 1) {
			Toast.show('收藏成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			//发送事件，通知我的收藏刷新页面
			event.Send(event.Events.collect.mycollectsearch);
			this.nav.goBack();
			return;
		} else {
			Alert.alert(result.error ? result.error : '发生未知错误');
			return;
		}
	};

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					flex: 1,
					justifyContent: 'flex-start',
					backgroundColor: skin.tint
				}}
			>
				<TextInput
					onChangeText={text => {
						this.data.collectionStr = text;
					}}
					clearButtonMode="while-editing"
					underlineColorAndroid="transparent"
					placeholder="填写您要收藏的内容！"
					multiline={true}
					blurOnSubmit={false}
					style={{
						backgroundColor: skin.tint,
						color: skin.messageTextColor,
						fontSize: 14,
						height: 120,
						padding: 0,
						borderColor: skin.darkSeparate,
						borderWidth: 1,
						margin: 5,
						textAlignVertical: 'top'
					}}
				/>

				<TouchableHighlight
					onPress={() => this.addCollectionClick()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						flexDirection: 'row',
						marginHorizontal: 20,
						marginTop: 22,
						borderRadius: 5
					}}
				>
					<View
						style={{
							flex: 1,
							backgroundColor: skin.activeTint,
							justifyContent: 'center',
							alignItems: 'center',
							height: 44,
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.tint, fontSize: 16 }}>提交</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}
}
