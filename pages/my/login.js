import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	StatusBar,
	Image,
	TextInput,
	TouchableHighlight,
	Alert,
	Keyboard
} from 'react-native';
import Header from '../header';
import user from '../../logic/user';
import cache from '../../logic/cache';
import Regular from '../../logic/regular';
import skin from '../../style';
import config from '../../config';
import net from '../../logic/net';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');
/**
 * 登录界面
 *
 * @author jyk
 * @export
 * @class Login
 * @extends {Component}
 */
export default class Login extends Component {
	static navigationOptions = {
		headerStyle: {
			backgroundColor: skin.background, //导航条背景色
			height: 60, //导航条高度,40导航条高度+20沉侵高度
			borderBottomWidth: 1,
			borderColor: skin.darkSeparate,
			elevation: 0, //Android去掉header的阴影
			shadowOpacity: 0 //ios去掉header的阴影
		},
		//headerBackTitle: '返回2',//返回按钮文字
		headerTintColor: skin.inactiveTint //导航条内容颜色
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			mobile: '', //存储手机号
			pwd: '' //存储密码
		};
	}

	clickLogin = async () => {
		Keyboard.dismiss();
		//对手机号进行正确性判断
		if (this.data.mobile == null || this.data.mobile == '') {
			Alert.alert('请输入手机号码.');
			return;
		}
		let isPhoneNum = Regular.isPhoneNumber(this.data.mobile);
		if (!isPhoneNum) {
			Alert.alert('请输入正确的手机号码.');
			return;
		}

		if (this.data.pwd == null || this.data.pwd.length == 0) {
			Alert.alert('请输入密码.');
			return;
		}

		if (this.data.pwd.length < 6 || this.data.pwd.length > 16) {
			Alert.alert('请输入6到16位密码.');
			return;
		}
		let result = await user.Login(this.data.mobile, this.data.pwd);
		if (!result.ok) {
			Alert.alert(result.msg);
			return;
		}

		console.log('登录成功');
		await cache.RemoveCache(config.NewsDetailCache); //删除文章详情页缓存
		//登陆后如果用户未完善资料需要打开资料完善页面
		let isJoinCircle = await user.IsJoinCircle();
		if (isJoinCircle) {
			this.nav.goBack();
		} else {
			console.log('完善资料');
			this.nav.goBack();
			this.nav.navigate('perfectUserInfo');
		}
	};

	//跳转到用户注册页面
	clickReg = () => {
		this.nav.navigate('reg', { back_my_key: this.nav.state.key });
	};

	//跳转到忘记密码页面
	forgetPWD = () => {
		this.nav.navigate('forgetPassWord');
	};

	_onPressInput1 = () => {
		this.refs.inputfalg2.blur();
		this.refs.inputfalg1.focus();
	};
	_onPressInput2 = () => {
		this.refs.inputfalg1.blur();
		this.refs.inputfalg2.focus();
	};

	render() {
		return (
			<View
				style={{
					backgroundColor: skin.background,
					flex: 1,
					justifyContent: 'flex-start'
				}}
			>
				{/* 状态栏样式 default - 默认的样式（IOS为白底黑字、Android为黑底白字）
                              light-content - 黑底白字
                              dark-content - 白底黑字 */}
				<StatusBar animated={true} barStyle={'default'} />
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Image style={{ width: 70, height: 70 }} source={require('../../img/icon.png')} />
				</View>
				<View
					style={{
						flex: 2,
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
				>
					<TouchableHighlight onPress={this._onPressInput1} underlayColor={'#fff'} style={{ width: width }}>
						<View
							style={{
								padding: 10,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								marginHorizontal: 20,
								marginVertical: 10,
								borderBottomWidth: 1,
								borderColor: '#EEE'
							}}
						>
							<Text
								style={{
									color: skin.subtitle,
									fontSize: 16,
									width: 50
								}}
							>
								手机号
							</Text>
							<TextInput
								ref="inputfalg1"
								onChangeText={(text) => {
									this.data.mobile = text;
								}}
								clearButtonMode="while-editing"
								maxLength={11}
								keyboardType="numeric"
								underlineColorAndroid="transparent"
								style={{
									color: skin.subtitle,
									fontSize: 16,
									marginLeft: 20,
									flex: 1,
									padding: 0
								}}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight onPress={this._onPressInput2} underlayColor={'#fff'} style={{ width: width }}>
						<View
							style={{
								padding: 10,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								marginHorizontal: 20,
								marginVertical: 10,
								borderBottomWidth: 1,
								borderColor: '#EEE'
							}}
						>
							<Text
								style={{
									color: skin.subtitle,
									fontSize: 16,
									width: 50
								}}
							>
								密码
							</Text>
							<TextInput
								ref="inputfalg2"
								onChangeText={(text) => {
									this.data.pwd = text;
								}}
								clearButtonMode="while-editing"
								returnKeyType="done"
								maxLength={16}
								underlineColorAndroid="transparent"
								secureTextEntry={true}
								style={{
									color: skin.subtitle,
									fontSize: 16,
									marginLeft: 20,
									flex: 1,
									padding: 0
								}}
							/>

							<TouchableHighlight
								onPress={this.forgetPWD}
								activeOpacity={1}
								underlayColor={skin.transparentColor}
							>
								<View
									style={{
										backgroundColor: skin.tint,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text
										style={{
											color: skin.subtitle,
											fontSize: 16
										}}
									>
										忘记密码?
									</Text>
								</View>
							</TouchableHighlight>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={this.clickLogin}
						activeOpacity={0.5}
						style={{
							flexDirection: 'row',
							marginHorizontal: 20,
							marginTop: 20,
							borderRadius: 5
						}}
					>
						<View
							style={{
								flex: 1,
								backgroundColor: skin.main,
								justifyContent: 'center',
								alignItems: 'center',
								height: 44,
								borderRadius: 5
							}}
						>
							<Text style={{ color: skin.background, fontSize: 16 }}>登录</Text>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={this.clickReg}
						activeOpacity={0.5}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							marginHorizontal: 20,
							marginTop: 20,
							borderRadius: 5
						}}
					>
						<View
							style={{
								flex: 1,
								backgroundColor: skin.tint,
								justifyContent: 'center',
								alignItems: 'center',
								height: 44,
								borderRadius: 5,
								borderWidth: 1,
								borderColor: skin.main
							}}
						>
							<Text style={{ color: skin.main, fontSize: 16 }}>注册</Text>
						</View>
					</TouchableHighlight>
				</View>
			</View>
		);
	}
}

/**
 * 忘记密码页面
 *
 * @export
 * @class ForgetPassWord
 * @extends {Component}
 */
export class ForgetPassWord extends Component {
	//软件设置页面导航栏设置
	static navigationOptions = {
		title: '忘记密码'
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			mobile: '', //存储手机号
			verCode: '', //短信验证码
			imageCode: '' //图形验证码
		};
		this.state = {
			imageCodeUrl: '', //图形验证码url
			hasImage: false, //是否可获取到图形验证码（手机号正确）
			showBtn: true, //是否显示获取短信验证码按钮
			countDownValue: config.CountDownTime, //获取短信验证码按钮倒计时显示
			phoneChanged: false //手机号是否进行了修改
		};
	}

	/**
	 * 获取图形验证码操作
	 *
	 * @memberof ForgetPassWord
	 */
	clickGetVerCode = () => {
		//对手机号进行正确性判断
		let phoneNum = this.data.mobile.trim();
		if (phoneNum.length == 11) {
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (isPhone) {
				//获取图形验证码
				this.GetImageCode(phoneNum);
				if (this.data.imageCode != '') {
					this.refs.imageCode.clear();
				}
			}
		} else {
			return;
		}
	};

	/**
	 * 网络请求获取图形验证码图片数据,并显示图片
	 *
	 * @param {string} mobile 手机号
	 * @memberof ForgetPassWord
	 */
	GetImageCode(mobile) {
		var url = '';
		if (!config.Release) {
			url =
				config.ApiBaseUrlTest +
				'/verification' +
				'/GetImgCode' +
				'/?mobile=' +
				mobile.toString().trim() +
				'&t=' +
				new Date().getTime();
		} else {
			url =
				config.ApiBaseUrl +
				'/verification' +
				'/GetImgCode' +
				'/?mobile=' +
				mobile.toString().trim() +
				'&t=' +
				new Date().getTime();
		}

		if (__DEV__) {
			console.log('获取图形验证码url:' + url);
		}
		this.setState({ imageCodeUrl: url, hasImage: true });
	}

	/**
	 * 获取短信验证码按钮与倒计时显示视图
	 *
	 * @returns
	 * @memberof ForgetPassWord
	 */
	msgCodeButtonView() {
		if (!this.state.showBtn) {
			return <Text style={{ color: skin.tint, fontSize: 14 }}>{this.state.countDownValue}s后重新获取</Text>;
		}
		return <Text style={{ color: skin.tint, fontSize: 14 }}>获取短信验证码</Text>;
	}

	/**
	 * 通过网络请求验证图形验证码并获取短信验证码
	 *
	 * @param {string} mobile 注册绑定手机号
	 * @param {string} imgcode  图形验证码
	 * @returns
	 * @memberof ForgetPassWord
	 */
	async getMessageCode(mobile, imgcode) {
		let result = await net.ApiPost('verification', 'GetCode', {
			mobile: mobile,
			imgcode: imgcode,
			include: 1 //1(手机号必须有,修改时),0或空(手机号必须没有,注册时)
		});
		console.log(result);
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '获取短信验证码时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true, msg: result.data };
		} else if (result.status == -100) {
			return { ok: false, msg: '获取太过频繁，请重新再试' };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	/**
	 * 获取短信验证码按钮操作
	 *
	 * @memberof ForgetPassWord
	 */
	clickGetMsgCode = async () => {
		if (this.state.showBtn) {
			let phoneNum = this.data.mobile.trim();
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (isPhone) {
				if (this.data.imageCode == null || this.data.imageCode.trim().length == 0) {
					Alert.alert('请输入图形验证码');
					return;
				}
				//定时器倒计时
				this.countDownTimer();
				//发送获取短信验证码请求
				let result = await this.getMessageCode(this.data.mobile.trim(), this.data.imageCode.trim());
				if (result.ok) {
					Toast.show('短信验证码获取成功', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					this.clickGetImageAgain();
					Toast.show(result.msg, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		}
		return;
	};

	/**
	 * 手机号文本输入框内容检验
	 *
	 * @param {String} phoneNum
	 * @returns
	 * @memberof ForgetPassWord
	 */
	isEmptyPhone(phoneNum) {
		if (phoneNum == null || phoneNum == '') {
			Alert.alert('请输入手机号');
			return false;
		}
		let isPhoneNum = Regular.isPhoneNumber(phoneNum);
		if (!isPhoneNum) {
			Alert.alert('请输入正确的手机号');
			return false;
		}
		return true;
	}

	/**
	 * 获取短信验证码倒计时
	 *
	 * @memberof ForgetPassWord
	 */
	countDownTimer() {
		//修改状态，显示倒计时
		this.setState({ showBtn: false });
		this.interval = setInterval(() => {
			let timeNum = this.state.countDownValue - 1;
			if (timeNum === 0) {
				this.interval && clearInterval(this.interval);
				//修改状态，显示获取短信验证码按钮，并重置倒计时时间
				this.setState({
					showBtn: true,
					countDownValue: config.CountDownTime
				});
			} else {
				if (__DEV__) {
					console.log('获取短信验证码倒计时:' + timeNum);
				}
				this.setState({
					countDownValue: timeNum
				});
			}
		}, 1000);
	}

	/**
	 * 图形验证码刷新
	 *
	 * @memberof ForgetPassWord
	 */
	clickGetImageAgain = () => {
		this.clickGetVerCode();
	};

	componentWillUnmount() {
		//清除定时器
		this.interval && clearInterval(this.interval);
	}

	/**
	 * 下一步按钮操作
	 *
	 * @memberof ForgetPassWord
	 */
	forgetPassWordNext = async () => {
		Keyboard.dismiss();
		//手机号校验
		let mobile = this.data.mobile.trim();
		let isPhone = this.isEmptyPhone(mobile);
		if (isPhone) {
			if (this.data.imageCode == null || this.data.imageCode.trim().length == 0) {
				Alert.alert('请输入图形验证码');
				return;
			}
			//短信验证码校验
			let verCode = this.data.verCode.trim();
			if (verCode == null || verCode == '') {
				Alert.alert('请输入短信验证码');
				return;
			}
			//发送获取短信验证码请求
			let result = await this.checkUserMobile(mobile, verCode);
			if (!result.ok) {
				Alert.alert(result.msg);
				this.refs.msgCode.clear();
				this.clickGetImageAgain();
				return;
			}
			//清除定时器
			this.interval && clearInterval(this.interval);
			//成功后跳转到修改密码页面
			this.nav.navigate('updataPassWord', {
				isUpdataPWD: false,
				mobile: mobile
			});
		}
	};

	/**
	 * 通过网络请求验证用户手机号
	 *
	 * @param {string} mobile 用户账号
	 * @param {string} verCode  短信验证码
	 * @returns
	 * @memberof ForgetPassWord
	 */
	async checkUserMobile(mobile, verCode) {
		let result = await net.ApiPost('verification', 'CheckMobileCode', {
			mobile: mobile,
			code: verCode
		});
		console.log(result);
		if (result == null || typeof result.status == 'undefined') {
			return { ok: false, msg: '找回密码时发生错误,请稍后重试' };
		} else if (result.status == 0) {
			return { ok: false, msg: result.error };
		} else if (result.status == 1) {
			return { ok: true, msg: result.data };
		} else if (result.status == -100) {
			return { ok: false, msg: '获取太过频繁，请重新再试' };
		} else {
			return { ok: false, msg: '发生未知错误' };
		}
	}

	//图形验证码展示视图
	imageCodeView() {
		if (this.state.hasImage) {
			if (__DEV__) {
				console.log('获取图形验证码成功');
			}
			return (
				<View style={styles.inputView}>
					<View
						style={{
							backgroundColor: skin.tint,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1
						}}
					>
						<Text style={styles.text}>图形校验码</Text>
						<TouchableHighlight
							onPress={this.clickGetImageAgain}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={{
								flexDirection: 'row',
								marginLeft: 10,
								marginRight: 10,
								marginVertical: 5
							}}
						>
							<View
								style={{
									backgroundColor: skin.tint,
									justifyContent: 'center',
									alignItems: 'center',
									width: 75,
									height: 40
								}}
							>
								<Image
									style={{ width: 75, height: 40 }}
									source={{ uri: this.state.imageCodeUrl }}
									resizeMode="contain"
								/>
							</View>
						</TouchableHighlight>
						<TextInput
							ref="imageCode"
							style={styles.textinput}
							clearButtonMode="while-editing"
							returnKeyType="done"
							keyboardType="numeric"
							underlineColorAndroid="transparent"
							placeholder="输入图形验证码"
							onChangeText={(text) => {
								this.data.imageCode = text;
							}}
						/>
					</View>
				</View>
			);
		}
		return null;
	}

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					flex: 1,
					justifyContent: 'flex-start',
					backgroundColor: skin.background
				}}
			>
				<View style={styles.inputView}>
					<Text style={styles.text}>手机号</Text>
					<TextInput
						style={styles.textinput}
						maxLength={11}
						keyboardType="numeric"
						clearButtonMode="while-editing"
						returnKeyType="done"
						underlineColorAndroid="transparent"
						placeholderTextColor={skin.subtitle}
						placeholder="输入手机号"
						onChangeText={(text) => {
							this.data.mobile = text;
							this.clickGetVerCode();
						}}
					/>
				</View>
				{this.imageCodeView()}
				<View style={styles.inputView}>
					<Text style={styles.text}>短信验证码</Text>
					<TextInput
						ref="msgCode"
						style={styles.textinput}
						clearButtonMode="while-editing"
						returnKeyType="done"
						keyboardType="numeric"
						underlineColorAndroid="transparent"
						placeholderTextColor={skin.subtitle}
						placeholder="输入短信验证码"
						onChangeText={(text) => {
							this.data.verCode = text;
						}}
					/>
					<TouchableHighlight
						onPress={this.clickGetMsgCode}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							marginRight: 10,
							borderRadius: 5
						}}
					>
						<View
							style={{
								backgroundColor: this.state.showBtn == true ? skin.activeRemind : skin.inactiveRemind,
								justifyContent: 'center',
								alignItems: 'center',
								width: 110,
								height: 40,
								borderRadius: 5
							}}
						>
							<View>{this.msgCodeButtonView()}</View>
						</View>
					</TouchableHighlight>
				</View>

				<TouchableHighlight
					onPress={this.forgetPassWordNext}
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
							height: 44,
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.tint, fontSize: 16 }}>下一步</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}
}

/**
 * 修改密码页面
 *
 * @export
 * @class UpdataPassWord
 * @extends {Component}
 */
export class UpdataPassWord extends Component {
	//软件设置页面导航栏设置
	// static navigationOptions = ({ navigation, screenProps }) => {
	// 	return {
	// 		headerTitle: '修改密码',
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
			headerTitle: '修改密码',
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
		this.data = {
			oldpwd: '', //存储旧密码
			newpwd: '', //存储新密码
			checkpwd: '', //存储确认密码
			moblie: '', //手机号
			pwMaxLength: 16, //密码最大长度
			click: false
		};
		this.state = {
			isUpdataPWD: true //true为修改密码;false为忘记密码找回密码操作
		};
	}

	//组件初始化完毕
	componentDidMount() {
		let isupdata = this.props.navigation.state.params.isUpdataPWD;
		this.setState({ isUpdataPWD: isupdata });
		if (!isupdata) {
			let mobileStr = this.props.navigation.state.params.mobile;
			this.data.moblie = mobileStr.toString().trim();
		}
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	/**
	 * 输入密码到达最大值提示
	 *
	 * @memberof UpdataPassWord
	 */
	maxLengthTip = (text) => {
		let length = text.toString().trim().length;
		if (length == this.data.pwMaxLength) {
			Toast.show('您输入的密码位数已达最大值', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	/**
	 * 用户修改密码旧密码输入框视图
	 *
	 * @returns
	 * @memberof UpdataPassWord
	 * */
	oldPwdView() {
		if (this.state.isUpdataPWD) {
			return (
				<View style={styles.inputView}>
					<TextInput
						style={styles.textinput}
						maxLength={this.data.pwMaxLength}
						clearButtonMode="while-editing"
						returnKeyType="done"
						underlineColorAndroid="transparent"
						secureTextEntry={true}
						placeholderTextColor={skin.subtitle}
						placeholder="输入旧密码"
						onChangeText={(text) => {
							this.data.oldpwd = text;
							this.maxLengthTip(text);
						}}
					/>
				</View>
			);
		}
		return null;
	}

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					flex: 1,
					justifyContent: 'flex-start',
					backgroundColor: skin.background
				}}
			>
				{this.oldPwdView()}
				<View style={styles.inputView}>
					<TextInput
						style={styles.textinput}
						maxLength={this.data.pwMaxLength}
						clearButtonMode="while-editing"
						returnKeyType="done"
						underlineColorAndroid="transparent"
						secureTextEntry={true}
						placeholderTextColor={skin.subtitle}
						placeholder="输入新密码"
						onChangeText={(text) => {
							this.data.newpwd = text;
							this.maxLengthTip(text);
						}}
					/>
				</View>
				<View style={styles.inputView}>
					<TextInput
						style={styles.textinput}
						maxLength={this.data.pwMaxLength}
						clearButtonMode="while-editing"
						returnKeyType="done"
						underlineColorAndroid="transparent"
						secureTextEntry={true}
						placeholderTextColor={skin.subtitle}
						placeholder="输入确认密码"
						onChangeText={(text) => {
							this.data.checkpwd = text;
							this.maxLengthTip(text);
						}}
					/>
				</View>

				<TouchableHighlight
					onPress={this.updataPassWord}
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
							height: 44,
							borderRadius: 5
						}}
					>
						<Text style={{ color: skin.tint, fontSize: 16 }}>确定</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	/**
	 * 密码重置、修改确认按钮操作
	 *
	 * @memberof UpdataPassWord
	 */
	updataPassWord = async () => {
		Keyboard.dismiss(); //隐藏键盘

		if (this.data.click) {
			return;
		}
		this.data.click = true;

		let oldPassWord = this.data.oldpwd.trim();
		let newPassWord = this.data.newpwd.trim();
		let checkPassword = this.data.checkpwd.trim();
		//密码合法校验
		if (this.state.isUpdataPWD) {
			if (oldPassWord == null || oldPassWord == '') {
				Alert.alert('请输入旧密码');
				return;
			}
			if (oldPassWord.length < 6 || oldPassWord.length > 16) {
				Alert.alert('请输入6到16位旧密码');
				return;
			}
		}

		if (newPassWord == null || newPassWord == '') {
			Alert.alert('请输入新密码');
			return;
		}
		if (newPassWord.length < 6 || newPassWord.length > 16) {
			Alert.alert('请输入6到16位新密码');
			return;
		}
		if (checkPassword == null || checkPassword == '') {
			Alert.alert('请输入确认密码');
			return;
		}
		if (checkPassword.length < 6 || checkPassword.length > 16) {
			Alert.alert('请输入6到16位确认密码');
			return;
		}
		if (newPassWord != checkPassword) {
			Alert.alert('输入的新密码与确认密码不一致');
			return;
		}

		//修改密码
		if (this.state.isUpdataPWD) {
			//检查用户状态
			let userState = await user.CheckUserState();
			if (!userState.ok) {
				Alert.alert(userState.msg);
				return;
			}
			//用户修改密码请求
			let updatapwd = await user.UpdataPassWord(this.data.moblie, oldPassWord, checkPassword);

			if (!updatapwd.ok) {
				this.data.click = false;
				Alert.alert(updatapwd.msg);
				return;
			}

			Toast.show('密码修改成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			//返回“我的”首页
			this.nav.goBack();
			return;
		}

		//忘记密码后重置密码请求
		let forgetpwd = await user.ForgetPassWord(this.data.moblie, checkPassword);

		if (!forgetpwd.ok) {
			this.data.click = false;
			Alert.alert(forgetpwd.msg);
			return;
		}
		Toast.show('密码重置成功', {
			duration: Toast.durations.SHORT,
			position: Toast.positions.BOTTOM
		});
		//返回到登录页面
		this.nav.navigate('login');
	};
}

//相关复用样式
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: skin.background
	},
	inputView: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		marginLeft: 15,
		marginRight: 15,
		borderColor: skin.chatBackground
	},
	text: {
		color: skin.subtitle,
		fontSize: 14,
		width: 85
	},
	textinput: {
		color: skin.subtitle,
		marginHorizontal: 10,
		flex: 3,
		height: 50,
		fontSize: 13,
		padding: 0
	}
});
