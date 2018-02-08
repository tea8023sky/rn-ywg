import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	TextInput,
	TouchableHighlight,
	Alert,
	Platform,
	WebView
} from 'react-native';
import Header from '../header';
import Regular from '../../logic/regular';
import event from '../../logic/event';
import skin from '../../style';
import config from '../../config';
import net from '../../logic/net';
import user from '../../logic/user';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-root-toast';
/**
 *
 * 用户注册页面
 *
 * @author wuzhitao
 * @export
 * @class Reg
 * @extends {Component}
 */
export default class Reg extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			mobile: '', //存储手机号
			verCode: '', //短信验证码
			pwd: '', //密码
			invitCode: '', //邀请码
			imageCode: '', //图形验证码
			isSubmiting: false
		};
		this.state = {
			imageCodeUrl: '', //图形验证码url
			hasImage: false, //是否可获取到图形验证码（手机号正确）
			showBtn: true, //是否显示获取短信验证码按钮
			countDownValue: config.CountDownTime, //获取短信验证码按钮倒计时显示
			phoneChanged: false, //手机号是否进行了修改
			checked: true //是否选中同意用户协议
		};
	}

	//注册页面导航栏设置
	static navigationOptions = {
		title: '注册'
	};

	/**
   * 手机号文本输入框内容检验
   *
   * @param {string} phoneNum
   * @memberof Reg
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
   * 获取图形验证码操作
   *
   * @memberof Reg
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
				if (this.state.hasImage) {
					//清空图形验证码输入框
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
   * @memberof Reg
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
   * 图形验证码刷新
   *
   * @memberof Reg
   */
	clickGetImageAgain = () => {
		// this.GetImageCode(this.data.mobile.trim());
		this.clickGetVerCode();
	};

	/**
   * 查看用户协议
   *
   * @memberof Reg
   */
	readUserAgreement = () => {
		this.nav.navigate('userAgreement');
	};

	/**
   *选择是否同意用户协议按钮
   *
   * @memberof Reg
   */
	checkAgreement = () => {
		this.setState({ checked: !this.state.checked });
	};

	/**
   * 下一步按钮操作
   *
   * @memberof Reg
   */
	clickNext = async () => {
		if (this.data.isSubmiting) {
			return;
		}
		this.data.isSubmiting = true;
		//手机号校验
		let mobile = this.data.mobile.trim();
		let isPhone = this.isEmptyPhone(mobile);
		if (isPhone) {
			//图形验证码校验
			let imageCode = this.data.imageCode.trim();
			if (imageCode == null || imageCode == '') {
				Alert.alert('请输入图形验证码');
				this.data.isSubmiting = false;
				return;
			}
			//短信验证码校验
			let verCode = this.data.verCode.trim();
			if (verCode == null || verCode == '') {
				Alert.alert('请输入短信验证码');
				this.data.isSubmiting = false;
				return;
			}
			//密码校验
			let pwd = this.data.pwd.trim();
			if (pwd == null || pwd == '') {
				Alert.alert('请设置登录密码');
				this.data.isSubmiting = false;
				return;
			}
			if (pwd.length < 6) {
				Alert.alert('密码长度不能小于6位');
				this.data.isSubmiting = false;
				return;
			}

			if (this.state.checked == false) {
				Alert.alert('未同意服务条款');
				this.data.isSubmiting = false;
				return;
			}
			let result = await user.Register(mobile, verCode, pwd, this.data.invitCode);
			if (!result.ok) {
				Alert.alert(result.msg);
				this.refs.msgCode.clear();
				this.clickGetVerCode();
				this.data.isSubmiting = false;
				return;
			}
			//清除定时器
			this.interval && clearInterval(this.interval);
			//注册成功进行信息完善操作
			// this.nav.goBack();
			this.nav.navigate('perfectUserInfo', {
				back_my_key: this.nav.state.params
					? this.nav.state.params.back_my_key ? this.nav.state.params.back_my_key : ''
					: ''
			});
		}
	};

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

	/**
   * 获取短信验证码按钮与倒计时显示视图
   *
   * @returns
   * @memberof Reg
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
   * @memberof Reg
   */
	async getMessageCode(mobile, imgcode) {
		let result = await net.ApiPost('verification', 'GetCode', {
			mobile: mobile,
			imgcode: imgcode
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
   * @memberof Reg
   */
	clickGetMsgCode = async () => {
		if (this.state.showBtn) {
			let phoneNum = this.data.mobile.trim();
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (!isPhone) {
				return;
			}
			if (this.data.imageCode == null || this.data.imageCode.trim().length == 0) {
				Alert.alert('请输入图片上的验证码');
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
				Toast.show(result.msg, {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				//重新获取图形验证码
				this.clickGetVerCode();
			}
		}
		return;
	};

	/**
   * 获取短信验证码倒计时
   *
   * @memberof Reg
   */
	countDownTimer() {
		//修改状态，显示倒计时
		this.setState({ showBtn: false });
		this.interval = setInterval(() => {
			let timeNum = this.state.countDownValue - 1;
			if (timeNum === 0) {
				this.interval && clearInterval(this.interval);
				//修改状态，显示获取短信验证码按钮，并重置倒计时时间
				this.setState({ showBtn: true, countDownValue: config.CountDownTime });
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

	componentWillUnmount() {
		//清除定时器
		this.interval && clearInterval(this.interval);
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

				<View style={styles.inputView}>
					<Text style={styles.text}>密码</Text>
					<TextInput
						style={styles.textinput}
						clearButtonMode="while-editing"
						returnKeyType="done"
						maxLength={16}
						underlineColorAndroid="transparent"
						secureTextEntry={true}
						placeholderTextColor={skin.subtitle}
						placeholder="设置登录密码（6-16位）"
						onChangeText={(text) => {
							this.data.pwd = text;
						}}
					/>
				</View>

				<View style={styles.inputView}>
					<Text style={styles.text}>邀请码</Text>
					<TextInput
						style={styles.textinput}
						clearButtonMode="while-editing"
						returnKeyType="done"
						keyboardType="numeric"
						underlineColorAndroid="transparent"
						placeholderTextColor={skin.subtitle}
						placeholder="邀请码（选填）"
						onChangeText={(text) => {
							this.data.invitCode = text;
						}}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<TouchableHighlight
						onPress={this.checkAgreement}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							marginLeft: 25,
							marginTop: 5
						}}
					>
						<Icon
							name={this.state.checked == true ? 'ios-checkmark-circle' : 'ios-radio-button-off'}
							size={20}
							color={this.state.checked == true ? skin.activeRemind : skin.inactiveRemind}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						onPress={this.readUserAgreement}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={{
							flexDirection: 'row',
							marginLeft: 5,
							marginTop: 5
						}}
					>
						<Text style={{ flex: 1, marginTop: 5, height: 20, fontSize: 12 }}>同意业务GO《用户协议》</Text>
					</TouchableHighlight>
				</View>

				<TouchableHighlight
					onPress={this.clickNext}
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
							backgroundColor: this.state.checked == true ? skin.main : skin.inactiveTint,
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
 * 查看用户协议页面
 *
 * @author wuzhitao
 * @export
 * @class UserAgreement
 * @extends {Component}
 */
export class UserAgreement extends Component {
	//注册页面导航栏设置
	static navigationOptions = {
		title: '用户协议'
	};

	render() {
		let Dimensions = require('Dimensions');
		let { width, height } = Dimensions.get('window');
		let sourceUrl = { uri: 'file:///android_asset/userAgreement.html' };
		if (Platform.OS == 'ios') {
			sourceUrl = require('../../static/userAgreement.html');
		}
		return (
			<View style={styles.container}>
				<WebView
					source={sourceUrl}
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						width: width
					}}
					ref="webView"
				/>
			</View>
		);
	}
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
