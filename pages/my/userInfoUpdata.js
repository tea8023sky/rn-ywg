import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	Image,
	TouchableHighlight,
	Alert,
	ScrollView,
	TextInput,
	FlatList,
	Platform,
	Button,
	Keyboard,
	Linking
} from 'react-native';
import event from '../../logic/event';
import image from '../../logic/image';
import user from '../../logic/user';
import cache from '../../logic/cache';
import Icon from 'react-native-vector-icons/Ionicons';
import skin from '../../style';
import config from '../../config';
import net from '../../logic/net';
import Regular from '../../logic/regular';
import { CheckBox, SearchBar } from 'react-native-elements';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import ImagePicker from 'react-native-syan-image-picker';
import Toast from 'react-native-root-toast';
import Upload from '../../logic/imgUtil';
import PageHelper from '../../logic/pageHelper';
/**
 * 个人资料页面
 *
 * @author wuzhitao
 * @export
 * @class UserInfoUpdata
 * @extends {Component}
 */
export class UserInfoUpdata extends Component {
	//个人资料页面导航栏设置
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '修改资料',
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
			headerRight: <View style={{ paddingRight: 20 }} />
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			avatar: image.DefaultAvatar.man, //头像（默认为男性默认头像）
			mobile: '', //手机号
			name: '', //姓名
			sex: 1, //性别（默认为男）
			companyShort: '', //公司简称
			companyName: '', //公司全称
			steelMills: '', //钢厂
			steelName: '', //品名
			officeLocation: '', //办公地点
			telephone: '' //固定电话
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
		//订阅用户资料修改事件,以便刷新界面数据
		event.Sub(this, event.Events.user.upDataInfo, this.setUserInfo);
		//加载已登录用户数据
		this.getUserInfo();
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	/**
   * 读取本地用户数据
   *
   * @memberof UserInfoUpdata
   */
	getUserInfo = async () => {
		let userInfo = await user.GetUserInfo();
		if (userInfo == null) {
			return;
		}
		this.setUserInfo(userInfo);
	};

	/**
   * 填充用户数据据
   *
   * @memberof UserInfoUpdata
   */
	setUserInfo = (user) => {
		let avatarSource = image.GetSmallImageSource(user.img);
		if (avatarSource == image.ErrorImg.default) {
			avatarSource = user.sex == 1 ? image.DefaultAvatar.man : image.DefaultAvatar.woman;
		}
		this.setState({
			avatar: avatarSource, //头像
			mobile: user.mobile, //手机号
			name: user.name, //姓名
			sex: user.sex, //性别
			companyShort: user.companyshort, //公司简称
			companyName: user.company, //公司全称
			steelMills: user.stname, //钢厂
			steelName: user.sname, //品名
			officeLocation: user.site, //办公地点
			telephone: user.phone //固定电话
		});
	};

	/**
   * 更改头像
   *
   * @memberof UserInfoUpdata
   */
	updataAvatar = () => {
		//上传图片
		ImagePicker.showImagePicker(image.ImagePickerSingleOptions(true, true), async (err, selectedPhoto) => {
			if (err) {
				// 取消选择
				return;
			}
			//处理上传的图片
			let uploadres = await Upload.UploadImg(selectedPhoto[0], 'ywg_user');
			await this.updataUserCacheImg(uploadres);
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey); //获取缓存中的用户信息
			let avatarSource = image.GetSmallImageSource(uploadres);
			if (avatarSource == image.ErrorImg.default) {
				avatarSource = userData.sex == 1 ? image.DefaultAvatar.man : image.DefaultAvatar.woman;
			}
			this.setState({
				avatar: avatarSource
			});
		});
	};

	/**
   * 更改手机号
   *
   * @memberof UserInfoUpdata
   */
	updataMobile = () => {
		//跳转到旧手机号验证页面
		this.nav.navigate('updataMobileOldCheck');
	};

	/**
   * 更改姓名
   *
   * @memberof UserInfoUpdata
   */
	updataName = () => {
		//跳转到修改页面
		this.nav.navigate('updataInfo', {
			updataKind: UpdataType.Name,
			oldValue: this.state.name
		});
	};

	/**
   * 更改性别弹出框
   *
   * @memberof UserInfoUpdata
   */
	updataSex = () => {
		this.popupDialog.show();
	};

	/**
   * 性别选择事件处理
   *
   * @param {int} sexInt  性别（男：1；女：2）
   * @memberof UserInfoUpdata
   */
	async sexChoice(sexInt) {
		this.popupDialog.dismiss();
		//网络请求
		let result = await this.updataSexNetPost(sexInt);
		if (result.ok) {
			await this.updataUserCacheSex(sexInt, result.data);
			this.setState({ sex: sexInt });
			Toast.show('修改性别成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			Toast.show('修改性别失败', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	}

	/**
   * 修改本地缓存，并刷新相关数据
   *
   * @param {int} sexInt  性别（男：1；女：2）
   * @param {string} img  用户默认头像
   * @returns
   * @memberof UserInfoUpdata
   */
	async updataUserCacheSex(sexInt, img) {
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData == null) {
			return;
		}
		userData.sex = sexInt;
		if (userData.img.includes('default_man') && userData.sex == 2) {
			userData.img = userData.img.replace('default_man', 'default_woman');
		} else if (userData.img.includes('default_woman') && userData.sex == 1) {
			userData.img = userData.img.replace('default_woman', 'default_man');
		}
		if (__DEV__) {
			console.log('修改性别后资料：' + JSON.stringify(userData));
		}
		//存储用户信息数据
		await cache.SaveToFile(config.UserInfoSaveKey, userData);
		//通知“我的”首页进行数据刷新
		event.Send(event.Events.user.login, userData);
		//通知“我的”首页进行数据刷新
		event.Send(event.Events.user.upDataInfo, userData);
	}
	/**
   * 修改用户头像后需要刷新本地缓存
   *
   * @author zhengyeye
   * @param {string} img 以逗号隔开的小图大图字符串
   * @returns
   * @memberof UserInfoUpdata
   */
	async updataUserCacheImg(img) {
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData == null) {
			return;
		}
		userData.img = img; //缓存中的img
		if (__DEV__) {
			console.log('修改头像后用户资料：' + JSON.stringify(userData));
		}
		//存储用户信息数据
		await cache.SaveToFile(config.UserInfoSaveKey, userData);
		//通知“我的”首页进行数据刷新
		event.Send(event.Events.user.login, userData);
		//通知“我的”首页进行数据刷新
		event.Send(event.Events.user.upDataInfo, userData);
	}

	/**
   * 修改资料网络请求
   *
   * @memberof PerfectUserInfo
   */
	async updataSexNetPost(sexInt) {
		let result = await net.ApiPost('user', 'UpdateUsers', {
			sex: sexInt
		});

		if (__DEV__) {
			console.log('修改性别网络请求接口:' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('修改性别时发生错误,请稍后重试');
			return { ok: false };
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return { ok: false };
		} else if (result.status == 1) {
			return { ok: true, data: result.data };
		} else {
			Alert.alert('发生未知错误');
			return { ok: false };
		}
	}

	/**
   * 更改公司简称
   *
   * @memberof UserInfoUpdata
   */
	updataCompanyShort = () => {
		//跳转到修改页面
		this.nav.navigate('updataInfo', {
			updataKind: UpdataType.CompanyShort,
			oldValue: this.state.companyShort
		});
	};

	/**
   * 更改公司全称
   *
   * @memberof UserInfoUpdata
   */
	updataCompanyName = () => {
		//跳转到修改页面
		this.nav.navigate('updataInfo', {
			updataKind: UpdataType.CompanyName,
			oldValue: this.state.companyName
		});
	};

	/**
   * 更改钢厂
   *
   * @memberof UserInfoUpdata
   */
	updataSteelMills = () => {
		//跳转到选择钢厂页面
		this.nav.navigate('updataSteelMills');
	};

	/**
   * 更改品名
   *
   * @memberof UserInfoUpdata
   */
	updataSteelName = () => {
		//跳转到选择品名页面
		this.nav.navigate('updataSteelName');
	};

	/**
   * 更改办公地点
   *
   * @memberof UserInfoUpdata
   */
	updataOfficeLocation = () => {
		//跳转到修改页面
		this.nav.navigate('updataInfo', {
			updataKind: UpdataType.OfficeLocation,
			oldValue: this.state.officeLocation
		});
	};

	/**
   * 更改固定电话
   *
   * @memberof UserInfoUpdata
   */
	updataTelephone = () => {
		//跳转到修改页面
		this.nav.navigate('updataInfo', {
			updataKind: UpdataType.Telephone,
			oldValue: this.state.telephone
		});
	};

	render() {
		return (
			<View style={{ backgroundColor: skin.tint, flex: 1 }}>
				<ScrollView style={{}}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: skin.tint,
							borderBottomColor: skin.lightSeparate,
							borderBottomWidth: 1
						}}
					>
						<TouchableHighlight
							onPress={this.updataAvatar}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View style={{ marginHorizontal: 20, marginVertical: 15 }}>
								<Image
									style={{
										width: 60,
										height: 60,
										backgroundColor: skin.tint,
										borderRadius: 30
									}}
									source={this.state.avatar}
								/>
								<Text style={{ marginTop: 10, color: skin.subtitle }}>更改头像</Text>
							</View>
						</TouchableHighlight>
					</View>

					<TouchableHighlight
						onPress={this.updataMobile}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>手机号</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.mobile}
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
						onPress={this.updataName}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>姓名</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.name}
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
						onPress={this.updataSex}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>性别</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.sex == 1 ? '男' : '女'}
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
						onPress={this.updataCompanyShort}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>公司简称</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.companyShort}
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
						onPress={this.updataCompanyName}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>公司全称</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.companyName}
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
						onPress={this.updataSteelMills}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>钢厂</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.steelMills}
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
						onPress={this.updataSteelName}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>品名</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.steelName}
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
						onPress={this.updataOfficeLocation}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>办公地点</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.officeLocation}
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
						onPress={this.updataTelephone}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={userInfoStyles.lineView}>
							<Text style={userInfoStyles.textStyle}>固定电话</Text>
							<Text style={userInfoStyles.textValueStyle} numberOfLines={1}>
								{this.state.telephone}
							</Text>
							<Icon
								name="ios-arrow-forward"
								style={{ marginRight: 20 }}
								size={25}
								color={skin.subtitle}
							/>
						</View>
					</TouchableHighlight>
				</ScrollView>
				<PopupDialog
					dialogTitle={
						<DialogTitle
							titleStyle={{ backgroundColor: skin.inactiveRemind, height: 40 }}
							titleTextStyle={{ fontSize: 16 }}
							title="性别"
						/>
					}
					ref={(popupDialog) => {
						this.popupDialog = popupDialog;
					}}
					containerStyle={{ justifyContent: 'flex-start', paddingTop: 120 }}
					dialogStyle={{
						backgroundColor: skin.tint,
						width: 241,
						height: 150,
						justifyContent: 'flex-start'
					}}
				>
					<View style={{ backgroundColor: skin.tint, height: 50 }}>
						<CheckBox
							center
							title="男"
							textStyle={{
								color: skin.subtitle,
								fontSize: 14,
								paddingLeft: 100
							}}
							containerStyle={{
								backgroundColor: skin.tint,
								borderColor: skin.tint
							}}
							checkedIcon="dot-circle-o"
							uncheckedIcon="circle-o"
							checkedColor={skin.activeRemind}
							uncheckedColor={skin.inactiveRemind}
							checked={this.state.sex == 1}
							onPress={() => this.sexChoice(1)}
						/>
					</View>
					<View
						style={{
							backgroundColor: skin.inactiveRemind,
							height: 1,
							marginHorizontal: 5
						}}
					/>
					<View style={{ backgroundColor: skin.tint, height: 50 }}>
						<CheckBox
							center
							title="女"
							textStyle={{
								color: skin.subtitle,
								fontSize: 14,
								paddingLeft: 100
							}}
							containerStyle={{
								backgroundColor: skin.tint,
								borderColor: skin.tint
							}}
							checkedIcon="dot-circle-o"
							uncheckedIcon="circle-o"
							checkedColor={skin.activeRemind}
							uncheckedColor={skin.inactiveRemind}
							checked={this.state.sex == 2}
							onPress={() => this.sexChoice(2)}
						/>
					</View>
				</PopupDialog>
			</View>
		);
	}
}

//修改资料页面相关服用样式
const userInfoStyles = StyleSheet.create({
	lineView: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 45,
		borderBottomColor: skin.lightSeparate,
		borderBottomWidth: 1
	},
	textStyle: {
		flex: 1,
		marginLeft: 20,
		justifyContent: 'flex-start',
		color: skin.subtitle
	},
	textValueStyle: {
		marginLeft: 10,
		marginRight: 15,
		flex: 4,
		justifyContent: 'flex-start',
		textAlign: 'right',
		color: skin.subtitle
	}
});

/**
 * 个人资料手机号更改页面
 *
 * @author wuzhitao
 * @export
 * @class UpdataMobileOldCheck
 * @extends {Component}
 */
export class UpdataMobileOldCheck extends Component {
	//个人资料页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '更改手机号',
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
			verCode: '', //短信验证码
			imageCode: '' //图形验证码
		};
		this.state = {
			mobile: '', //存储手机号
			imageCodeUrl: '', //图形验证码url
			hasImage: false, //是否可获取到图形验证码（手机号正确）
			showBtn: true, //是否显示获取短信验证码按钮
			countDownValue: config.CountDownTime, //获取短信验证码按钮倒计时显示
			phoneChanged: false //手机号是否进行了修改
		};
	}

	/**
   * 手机号文本输入框内容检验
   *
   * @param {string} phoneNum
   * @memberof UpdataMobileOldCheck
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
   * @memberof UpdataMobileOldCheck
   */
	clickGetVerCode = () => {
		//对手机号进行正确性判断
		let phoneNum = this.state.mobile.trim();
		if (phoneNum.length == 11) {
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (isPhone) {
				//获取图形验证码
				this.GetImageCode(phoneNum);
				this.refs.imageCode.clear();
			}
		} else {
			return;
		}
	};

	/**
   * 网络请求获取图形验证码图片数据,并显示图片
   *
   * @param {string} mobile 手机号
   * @memberof UpdataMobileOldCheck
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
   * @memberof UpdataMobileOldCheck
   */
	clickGetImageAgain = () => {
		this.clickGetVerCode();
	};

	/**
   * 下一步按钮操作
   *
   * @memberof   UpdataMobileOldCheck
   */
	clickNextBtn = async () => {
		//手机号校验
		let mobile = this.state.mobile.trim();
		this.isEmptyPhone(mobile);

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
		let result = await net.ApiPost('verification', 'CheckMobileCode', {
			mobile: mobile,
			code: verCode
		});
		if (__DEV__) {
			console.log('用户验证旧手机号网络请求接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert('验证手机号时发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			//跳转到新手机号验证页面
			this.nav.navigate('updataMobileNewCheck');
			return;
		} else {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert('发生未知错误');
			return;
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
   * @memberof UpdataMobileOldCheck
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
   * @memberof UpdataMobileOldCheck
   */
	async getMessageCodeCheck(mobile, imgcode) {
		let result = await net.ApiPost('verification', 'GetCode', {
			mobile: mobile,
			imgcode: imgcode,
			include: 1
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
   * @memberof UpdataMobileOldCheck
   */
	clickGetMsgCode = async () => {
		if (this.state.showBtn) {
			let phoneNum = this.state.mobile.trim();
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (isPhone) {
				if (this.data.imageCode == null || this.data.imageCode.trim().length == 0) {
					Alert.alert('请输入图片上的验证码');
					return;
				}
				//定时器倒计时
				this.countDownTimer();
				//发送获取短信验证码请求
				let result = await this.getMessageCodeCheck(this.state.mobile.trim(), this.data.imageCode.trim());
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
   * 获取短信验证码倒计时
   *
   * @memberof UpdataMobileOldCheck
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

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
		//加载用户数据,并填充手机号，获取图形验证码
		this.getUserMobile();
	}

	/**
   * 加载用户数据,并填充手机号，获取图形验证码
   *
   * @memberof UpdataMobileOldCheck
   */
	getUserMobile = async () => {
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (__DEV__) {
			console.log('获取用户手机号码操作:' + JSON.stringify(userData));
		}
		if (userData == null) {
			Alert.alert('手机号获取失败，请重试。');
			return;
		}
		this.setState({ mobile: userData.mobile });
		this.clickGetVerCode();
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//清除定时器
		this.interval && clearInterval(this.interval);
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
						defaultValue={this.state.mobile}
						editable={false}
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
					onPress={this.clickNextBtn}
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
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							color: '#5c5c5c',
							fontSize: 15,
							marginTop: 15
						}}
					>
						若旧卡已丢失，无法验证，可致电客服热线!
					</Text>
					<TouchableHighlight
						onPress={this._callPhone}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<Text
							style={{
								color: skin.highlightedRed,
								fontSize: 15,
								marginTop: 5
							}}
						>
							400-086-9166
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		);
	}
}

/**
 * 个人资料手机号更改新号码验证页面
 *
 * @author wuzhitao
 * @export
 * @class UpdataMobileNewCheck
 * @extends {Component}
 */
export class UpdataMobileNewCheck extends Component {
	//个人资料页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '更改手机号',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerRight: <View />
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			oldMobile: '', //存储旧手机号
			mobile: '', //存储新手机号
			verCode: '', //短信验证码
			imageCode: '' //图形验证码
		};
		this.state = {
			imageCodeUrl: '', //图形验证码url
			hasImage: false, //是否可获取到图形验证码（手机号正确）
			showBtn: true, //是否显示获取短信验证码按钮
			countDownValue: config.CountDownTime //获取短信验证码按钮倒计时显示
		};
	}

	/**
   * 手机号文本输入框内容检验
   *
   * @param {string} phoneNum
   * @memberof UpdataMobileNewCheck
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
   * @memberof UpdataMobileNewCheck
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
   * @memberof UpdataMobileNewCheck
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
   * @memberof UpdataMobileNewCheck
   */
	clickGetImageAgain = () => {
		this.clickGetVerCode();
	};

	/**
   * 确认按钮操作
   *
   * @memberof UpdataMobileNewCheck
   */
	clickSure = async () => {
		Keyboard.dismiss();
		//手机号校验
		let mobile = this.data.mobile.trim();
		this.isEmptyPhone(mobile);
		//短信验证码校验
		let verCode = this.data.verCode.trim();
		if (verCode == null || verCode == '') {
			Alert.alert('请输入短信验证码');
			return;
		}

		let result = await net.ApiPost('user', 'UpdateMobile', {
			mobile: this.data.oldMobile,
			code: verCode,
			newmobile: mobile
		});
		if (__DEV__) {
			console.log('用户更改手机号网络请求接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert('更改手机号时发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData == null) {
				return;
			}
			userData.mobile = mobile;
			//存储用户信息数据
			await cache.SaveToFile(config.UserInfoSaveKey, userData);

			//存储报价单用户手机号
			let queryOfferInfo = await cache.LoadFromFile(config.ToolOfferInfoKey);
			if (queryOfferInfo != null) {
				queryOfferInfo.mobile = mobile;
				await cache.SaveToFile(config.ToolOfferInfoKey, queryOfferInfo);
			}
			/****end*****/

			//通知“我的”首页进行数据刷新
			event.Send(event.Events.user.login, userData);
			//通知“修改资料”页面进行数据刷新
			event.Send(event.Events.user.upDataInfo, userData);
			//返回资料修改页
			this.nav.navigate('userInfoUpdata');
			return;
		} else {
			this.refs.msgCode.clear();
			this.clickGetImageAgain();
			Alert.alert('发生未知错误');
			return;
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
   * @memberof UpdataMobileNewCheck
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
   * @param {string} mobile 新手机号
   * @param {string} imgcode  图形验证码
   * @returns
   * @memberof UpdataMobileNewCheck
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
   * @memberof UpdataMobileNewCheck
   */
	clickGetMsgCode = async () => {
		if (this.state.showBtn) {
			let phoneNum = this.data.mobile.trim();
			//手机号校验
			let isPhone = this.isEmptyPhone(phoneNum);
			if (isPhone) {
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
   * 获取短信验证码倒计时
   *
   * @memberof UpdataMobileNewCheck
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

	//组件初始化完毕
	componentDidMount() {
		//加载用户数据,并保存旧手机号
		this.getUserMobile();
	}

	/**
   * 加载用户数据,并填充手机号，获取图形验证码
   *
   * @memberof UpdataMobileNewCheck
   */
	getUserMobile = async () => {
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (__DEV__) {
			console.log('获取用户手机号操作:' + JSON.stringify(userData));
		}
		if (userData == null) {
			Alert.alert('手机号获取失败，请重试。');
			return;
		}
		this.data.oldMobile = userData.mobile;
	};

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
				<TouchableHighlight
					onPress={this.clickSure}
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
}

/**
 * 个人资料修改页面（姓名、公司简称、公司全称、办公地点、固定电话）
 *
 * @author wuzhitao
 * @export
 * @class UpdataInfo
 * @extends {Component}
 */
export class UpdataInfo extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			newValue: '', //修改值
			valueKind: '姓名' //修改资料名称
		};
		this.state = {
			maxLength: 10, //最多可输入字符数量
			multiline: false, //是否可输入多行
			oldValue: '', //初始值
			updataKind: 'name', //修改类型（默认为姓名）
			keyboardType: 'default', //默认输入键盘
			isIOSNine: false, //是否为ios9
			height:50  //文本框的高度
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '修改',
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
					onPress={() => navigation.state.params.click()}
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
						<Text style={{ color: skin.tint, fontSize: 16 }}>提交</Text>
					</View>
				</TouchableHighlight>
			)
		};
	};

	//组件初始化完毕
	componentDidMount() {
		//数据处理
		let updataKindStr = this.props.navigation.state.params.updataKind;
		let oldValueStr = this.props.navigation.state.params.oldValue;
		this.setState({
			updataKind: updataKindStr,
			oldValue: oldValueStr,
			newValue: oldValueStr
		});
		this.data.newValue = oldValueStr;
		switch (updataKindStr) {
			case UpdataType.Name:
				this.setState({ maxLength: 10, multiline: false });
				this.data.valueKind = '姓名';
				break;
			case UpdataType.CompanyShort:
				this.setState({ maxLength: 10, multiline: false });
				this.data.valueKind = '公司简称';
				break;
			case UpdataType.CompanyName:
				this.setState({ maxLength: 20, multiline: true });
				this.data.valueKind = '公司全称';
				break;
			case UpdataType.OfficeLocation:
				this.setState({ maxLength: 40, multiline: true });
				this.data.valueKind = '办公地址';
				break;
			case UpdataType.Telephone:
				this.setState({
					maxLength: 20,
					multiline: false,
					keyboardType: 'numeric'
				});
				this.data.valueKind = '固定电话';
				break;
			default:
				break;
		}

		//传参给页面导航栏
		this.props.navigation.setParams({ click: this.clickOK, goBackPage: this._goBackPage });
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
	/**
   * 提交按钮事件
   *
   * @memberof UpdataInfo
   */
	clickOK = async () => {
		Keyboard.dismiss();
		let str = this.data.newValue.toString().trim().replace("/'/g", '');
		if (str == null || str == '') {
			Alert.alert(this.data.valueKind + '不能为空');
			return;
		}
		//网络请求
		let result = await this.updataNetPost(this.state.updataKind.toString().trim(), str);
		if (result.ok) {
			await this.updataUserCache(this.state.updataKind.toString().trim(), str);
		}
	};

	/**
   * 修改本地缓存，并刷新相关数据
   *
   * @param {string} valueKind 修改项名称
   * @param {string} str 修改值
   * @memberof UpdataInfo
   */
	async updataUserCache(updataKindStr, str) {
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
		if (userData == null) {
			return;
		}
		switch (updataKindStr) {
			case UpdataType.Name:
				userData.name = str;
				break;
			case UpdataType.CompanyShort:
				userData.companyshort = str;
				break;
			case UpdataType.CompanyName:
				userData.company = str;
				break;
			case UpdataType.OfficeLocation:
				userData.site = str;
				break;
			case UpdataType.Telephone:
				userData.phone = str;
				break;
			default:
				break;
		}
		if (__DEV__) {
			console.log('修改后资料：' + JSON.stringify(userData));
		}
		//存储用户信息数据
		await cache.SaveToFile(config.UserInfoSaveKey, userData);
		//存储报价单公司名（公司简称）
		if (updataKindStr === 'companyShort') {
			let queryOfferInfo = await cache.LoadFromFile(config.ToolOfferInfoKey);
			if (queryOfferInfo != null) {
				queryOfferInfo.companyshort = str;
				await cache.SaveToFile(config.ToolOfferInfoKey, queryOfferInfo);
			}
		}

		//通知“我的”首页进行数据刷新
		event.Send(event.Events.user.login, userData);
		//通知“修改资料”页面进行数据刷新
		event.Send(event.Events.user.upDataInfo, userData);
		//返回资料修改页面
		this.nav.goBack();
	}

	/**
   * 修改资料网络请求
   *
   * @param {string} updataKindStr 修改项
   * @param {string} str 修改值
   * @memberof UpdataInfo
   */
	async updataNetPost(updataKindStr, str) {
		let result = null;
		switch (updataKindStr) {
			case UpdataType.Name:
				result = await net.ApiPost('user', 'UpdateUsers', {
					name: str
				});
				break;
			case UpdataType.CompanyShort:
				result = await net.ApiPost('user', 'UpdateUsers', {
					companyshort: str
				});
				break;
			case UpdataType.CompanyName:
				result = await net.ApiPost('user', 'UpdateUsers', {
					company: str
				});
				break;
			case UpdataType.OfficeLocation:
				result = await net.ApiPost('user', 'UpdateUsers', {
					site: str
				});
				break;
			case UpdataType.Telephone:
				result = await net.ApiPost('user', 'UpdateUsers', {
					phone: str
				});
				break;
			default:
				break;
		}
		if (__DEV__) {
			console.log('用户资料网络请求接口' + JSON.stringify(result));
		}
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('修改' + this.data.valueKind + '时发生错误,请稍后重试');
			return { ok: false };
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return { ok: false };
		} else if (result.status == 1) {
			return { ok: true };
		} else {
			Alert.alert('发生未知错误');
			return { ok: false };
		}
	}

	/**
   * 输入值控制
   *
   * @memberof UpdataInfo
   */
	setValue = (text) => {
		let value = text;
		if (this.state.isIOSNine) {
			if (text.length >= this.state.maxLength) {
				value = text.substr(0, this.state.maxLength);
			}
			this.setState({ newValue: value });
		}
		this.data.newValue = value;
	};

	/**
   * 文本框高度控制（文本框高度随着输入值而变化）
   *
   * @memberof UpdataInfo
   */

	changeContent(event) {
		this.setState({
			height: event.nativeEvent.contentSize.height
		});
	}

	/**
   * 文本输入视图
   *
   * @memberof UpdataInfo
   */
	inputView() {
		if (this.state.isIOSNine) {
			return (
				<TextInput
					{...this.props} //将自定义组件的所有属性交给TextInput
					style={{
						color: skin.subtitle,
						marginHorizontal: 10,
						flex: 3,
						// minHeight: 50,
						height: Math.max(50, this.state.height),
						fontSize: 16,
						padding: 0
					}}
					clearButtonMode="while-editing"
					returnKeyType="done"
					underlineColorAndroid="transparent"
					maxLength={this.state.maxLength}
					placeholderTextColor={skin.subtitle}
					multiline={this.state.multiline}
					defaultValue={this.state.oldValue}
					value={this.state.newValue}
					onContentSizeChange={this.changeContent.bind(this)}
					onChangeText={(text) => {
						this.setValue(text);
					}}
					keyboardType={this.state.keyboardType}
				/>
			);
		}
		return (
			<TextInput
				{...this.props} //将自定义组件的所有属性交给TextInput
				style={{
					color: skin.subtitle,
					marginHorizontal: 10,
					flex: 3,
					// minHeight: 50,
					height: Math.max(50, this.state.height),
					fontSize: 16,
					padding: 0
				}}
				clearButtonMode="while-editing"
				returnKeyType="done"
				underlineColorAndroid="transparent"
				maxLength={this.state.maxLength}
				placeholderTextColor={skin.subtitle}
				multiline={this.state.multiline}
				defaultValue={this.state.oldValue}
				onContentSizeChange={this.changeContent.bind(this)}
				onChangeText={(text) => {
					this.setValue(text);
				}}
				keyboardType={this.state.keyboardType}
			/>
		);
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
				<View style={styles.inputView}>{this.inputView()}</View>
			</View>
		);
	}
}

//修改类型
class UpdataType {
	static Name = 'name'; //姓名
	static CompanyShort = 'companyShort'; //公司简称
	static CompanyName = 'companyName'; //公司全称
	static OfficeLocation = 'officeLocation'; //办公地点
	static Telephone = 'telephone'; //固定电话
}

//相关复用样式
const styles = StyleSheet.create({
	coterieView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		backgroundColor: skin.lightSeparate
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: skin.background
	},
	classTextView: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		height: 40,
		borderBottomWidth: 0.5,
		borderColor: skin.activeTint,
		backgroundColor: skin.lightSeparate
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

/**
 * 用户钢厂修改页面
 * @author wuzhitao
 * @export
 * @class UpdataSteelMills
 * @extends {Component}
 */
export class UpdataSteelMills extends Component {
	//用户钢厂选择修改页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '选择钢厂',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerRight: <View />
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			keyword: '', //搜索关键字
			mySteelMills: [], //已选择钢厂
			otherSteelMills: [] //未选择钢厂
		};
		this.state = {
			mySteelMills: [], //已选择钢厂
			otherSteelMills: [] //未选择钢厂
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.getAllSteelMills();
	}

	/**
   * 请求钢厂数据
   *
   * @memberof UpdataSteelMills
   */
	getAllSteelMills = async () => {
		//发送请求
		let result = await net.ApiPost('texture', 'GetOfferSteel', {});
		if (__DEV__) {
			console.log('请求钢厂数据结果：' + JSON.stringify(result));
		}

		if (result != null && result.status == 1) {
			if (typeof result.data == 'undefined' || result.data == null || result.data.length == 0) {
				return;
			}
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData == null) {
				return;
			}
			let smIds = userData.stids.toString().split(',');
			if (typeof smIds != 'undefined' && smIds != null && smIds.length > 0) {
				for (var i = 0; i < result.data.length; i++) {
					let element = smIds.find((n) => n == result.data[i].id);
					if (typeof element != 'undefined') {
						this.data.mySteelMills.push(result.data[i]);
					} else {
						this.data.otherSteelMills.push(result.data[i]);
					}
				}
				//已选择钢厂
				this.setState({
					mySteelMills: this.addKeyForSteelMills(this.data.mySteelMills, 'Selected')
				});
				//未选择钢厂
				this.setState({
					otherSteelMills: this.addKeyForSteelMills(this.data.otherSteelMills, 'unSelected')
				});
				return;
			}
			//未选择钢厂
			this.setState({
				otherSteelMills: this.addKeyForSteelMills(result.data, 'unSelected')
			});
		}
	};

	//为数据增加key
	addKeyForSteelMills(steelMillsData, select) {
		for (let i = 0; i < steelMillsData.length; i++) {
			let element = steelMillsData[i];
			steelMillsData[i].key = element.id;
			steelMillsData[i].select = select;
		}
		return steelMillsData;
	}

	/**
   * 发送请求进行搜索并填充数据
   *
   * @memberof UpdataSteelMills
   */
	searchSteelMills = async () => {
		let data = [];
		let key = this.data.keyword;
		if (key == null || key == '') {
			this.setState({ otherSteelMills: data });
			return;
		}
		for (let i = 0; i < this.data.otherSteelMills.length; i++) {
			let steelMills = this.data.otherSteelMills[i];
			if (steelMills.name.includes(key) || steelMills.pinyin.includes(key) || steelMills.zimu.includes(key)) {
				data.push(steelMills);
			}
		}
		if (data.length == 0) {
			this.setState({ otherSteelMills: data });
		} else {
			//未选择钢厂
			this.setState({
				otherSteelMills: this.addKeyForSteelMills(data, 'unSelected')
			});
		}
	};

	//列表分割线控件
	_itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
	};

	render() {
		return (
			<View style={styles.coterieView}>
				<SearchBar
					containerStyle={{
						backgroundColor: skin.lightSeparate
					}}
					inputStyle={{ backgroundColor: skin.tint }}
					lightTheme
					placeholder="请输入钢厂"
					onChangeText={(text) => {
						this.data.keyword = text;
						this.searchSteelMills();
					}}
				/>

				<ScrollView style={{}} keyboardShouldPersistTaps="always">
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>已选择</Text>
					</View>
					<FlatList
						keyboardShouldPersistTaps="always"
						data={this.state.mySteelMills}
						ItemSeparatorComponent={this._itemSeparator}
						extraData={this.state}
						renderItem={this.itemView}
					/>
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>未选择</Text>
					</View>
					<FlatList
						keyboardShouldPersistTaps="always"
						data={this.state.otherSteelMills}
						ItemSeparatorComponent={this._itemSeparator}
						extraData={this.state}
						renderItem={this.itemView}
					/>
				</ScrollView>
				<TouchableHighlight
					onPress={this.submitSteelMills}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						flexDirection: 'row',
						marginHorizontal: 20,
						marginTop: 5,
						marginBottom: 20,
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
						<Text style={{ color: skin.tint, fontSize: 16 }}>提交</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	/**
   * 提交修改后的钢厂数据
   *
   * @memberof UpdataSteelMills
   */
	submitSteelMills = async () => {
		let idList = '';
		let nameList = '';
		for (let i = 0; i < this.state.mySteelMills.length; i++) {
			let steelMills = this.state.mySteelMills[i];
			idList = idList.concat(this.state.mySteelMills[i].id + ',');
			nameList = nameList.concat(this.state.mySteelMills[i].name + ',');
		}
		let ids = idList.toString().substring(0, idList.length - 1);
		let names = nameList.toString().substring(0, nameList.length - 1);

		let result = await net.ApiPost('user', 'UpdateUsers', {
			stids: ids,
			stname: names
		});

		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('修改钢厂时发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData == null) {
				return;
			}
			//修改读取的缓存
			userData.stids = ids;
			userData.stname = names;
			//存储用户信息数据
			await cache.SaveToFile(config.UserInfoSaveKey, userData);
			//通知“修改资料”页面进行数据刷新
			event.Send(event.Events.user.upDataInfo, userData);
			//返回资料修改页面
			this.nav.goBack();
			return;
		} else {
			Alert.alert('发生未知错误');
			return;
		}
	};
	/**
   * 钢厂条目点击事件
   *
   * @memberof UpdataSteelMills
   */
	itemPress = (item) => {
		Keyboard.dismiss();
		//已选中钢厂点击
		if (item.select == 'Selected') {
			for (let i = 0; i < this.data.mySteelMills.length; i++) {
				let newItem = this.data.mySteelMills[i];
				if (item == newItem) {
					this.data.mySteelMills.splice(i, 1);
					this.data.otherSteelMills.push(newItem);
					//已选择钢厂
					this.setState({
						mySteelMills: this.addKeyForSteelMills(this.data.mySteelMills, 'Selected')
					});
					//未选择钢厂
					this.setState({
						otherSteelMills: this.addKeyForSteelMills(this.data.otherSteelMills, 'unSelected')
					});
					break;
				}
			}
		} else {
			for (let i = 0; i < this.data.otherSteelMills.length; i++) {
				let newItem = this.data.otherSteelMills[i];
				if (item == newItem) {
					this.data.otherSteelMills.splice(i, 1);
					this.data.mySteelMills.push(newItem);
					//已选择钢厂
					this.setState({
						mySteelMills: this.addKeyForSteelMills(this.data.mySteelMills, 'Selected')
					});
					//未选择钢厂
					this.setState({
						otherSteelMills: this.addKeyForSteelMills(this.data.otherSteelMills, 'unSelected')
					});
					break;
				}
			}
		}
	};

	/**
   * 右侧图标
   *
   * @returns
   * @memberof UpdataSteelMills
   */
	iconView(select) {
		if (select == 'Selected') {
			return <Icon name="ios-close-circle" color={skin.subtitle} style={{ fontSize: 18, marginRight: 20 }} />;
		}
		return null;
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
						height: 40,
						backgroundColor: skin.tint
					}}
				>
					<Text style={{ marginLeft: 15, flex: 1 }}>{item.name}</Text>
					{this.iconView(item.select)}
				</View>
			</TouchableHighlight>
		);
	};
}

/**
 * 用户品名修改页面
 * @author wuzhitao
 * @export
 * @class UpdataSteelName
 * @extends {Component}
 */
export class UpdataSteelName extends Component {
	//用户品名选择修改页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '选择品名',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: skin.tint
			},
			headerRight: <View />
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			keyword: '', //搜索关键字
			mySteelName: [], //已选择品名
			otherSteelName: [] //未选择品名
		};
		this.state = {
			mySteelName: [], //已选择品名
			otherSteelName: [] //未选择品名
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.getAllSteelName();
	}

	/**
   * 请求品名数据
   *
   * @memberof UpdataSteelName
   */
	getAllSteelName = async () => {
		//发送请求
		let result = await net.ApiPost('tools', 'GetAllTrade', {});
		if (__DEV__) {
			console.log('请求钢厂数据结果：' + JSON.stringify(result));
		}

		if (result != null && result.status == 1) {
			if (typeof result.data == 'undefined' || result.data == null || result.data.length == 0) {
				return;
			}
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData == null) {
				return;
			}
			let smIds = userData.sids.toString().split(',');
			if (typeof smIds != 'undefined' && smIds != null && smIds.length > 0) {
				for (var i = 0; i < result.data.length; i++) {
					let element = smIds.find((n) => n == result.data[i].id);
					if (typeof element != 'undefined') {
						this.data.mySteelName.push(result.data[i]);
					} else {
						this.data.otherSteelName.push(result.data[i]);
					}
				}
				//已选择品名
				this.setState({
					mySteelName: this.addKeyForSteelName(this.data.mySteelName, 'Selected')
				});
				//未选择品名
				this.setState({
					otherSteelName: this.addKeyForSteelName(this.data.otherSteelName, 'unSelected')
				});
				return;
			}
			//未选择品名
			this.setState({
				otherSteelName: this.addKeyForSteelName(result.data, 'unSelected')
			});
		}
	};

	//为数据增加key
	addKeyForSteelName(steelMillsData, select) {
		for (let i = 0; i < steelMillsData.length; i++) {
			let element = steelMillsData[i];
			steelMillsData[i].key = element.id;
			steelMillsData[i].select = select;
		}
		return steelMillsData;
	}

	/**
   * 发送请求进行搜索并填充数据
   *
   * @memberof UpdataSteelName
   */
	searchSteelName = async () => {
		let data = [];
		let key = this.data.keyword;
		if (key == null || key == '') {
			this.setState({ otherSteelName: data });
			return;
		}
		for (let i = 0; i < this.data.otherSteelName.length; i++) {
			let steelName = this.data.otherSteelName[i];
			if (steelName.name.includes(key) || steelName.pinyin.includes(key) || steelName.zimu.includes(key)) {
				data.push(steelName);
			}
		}
		if (data.length == 0) {
			this.setState({ otherSteelName: data });
		} else {
			//未选择品名
			this.setState({
				otherSteelName: this.addKeyForSteelName(data, 'unSelected')
			});
		}
	};

	//列表分割线控件
	_itemSeparator = () => {
		return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
	};

	render() {
		return (
			<View style={styles.coterieView}>
				<SearchBar
					containerStyle={{
						backgroundColor: skin.lightSeparate
					}}
					inputStyle={{ backgroundColor: skin.tint }}
					lightTheme
					placeholder="请输入品名"
					onChangeText={(text) => {
						this.data.keyword = text;
						this.searchSteelName();
					}}
				/>

				<ScrollView style={{}} keyboardShouldPersistTaps="always">
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>已选择</Text>
					</View>
					<FlatList
						keyboardShouldPersistTaps="always"
						data={this.state.mySteelName}
						ItemSeparatorComponent={this._itemSeparator}
						extraData={this.state}
						renderItem={this.itemView}
					/>
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>未选择</Text>
					</View>
					<FlatList
						keyboardShouldPersistTaps="always"
						data={this.state.otherSteelName}
						ItemSeparatorComponent={this._itemSeparator}
						extraData={this.state}
						renderItem={this.itemView}
					/>
				</ScrollView>
				<TouchableHighlight
					onPress={this.submitSteelName}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{
						flexDirection: 'row',
						marginHorizontal: 20,
						marginTop: 5,
						marginBottom: 20,
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
						<Text style={{ color: skin.tint, fontSize: 16 }}>提交</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	/**
   * 提交修改后的品名数据
   *
   * @memberof UpdataSteelName
   */
	submitSteelName = async () => {
		let idList = '';
		let nameList = '';
		for (let i = 0; i < this.state.mySteelName.length; i++) {
			let steelName = this.state.mySteelName[i];
			idList = idList.concat(steelName.id + ',');
			nameList = nameList.concat(steelName.name + ',');
		}
		let ids = idList.toString().substring(0, idList.length - 1);
		let names = nameList.toString().substring(0, nameList.length - 1);

		let result = await net.ApiPost('user', 'UpdateUsers', {
			sids: ids,
			sname: names
		});

		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('修改品名时发生错误,请稍后重试');
			return;
		} else if (result.status == 0) {
			Alert.alert(result.error);
			return;
		} else if (result.status == 1) {
			let userData = await cache.LoadFromFile(config.UserInfoSaveKey);
			if (userData == null) {
				return;
			}
			//修改读取的缓存
			userData.sids = ids;
			userData.sname = names;
			//存储用户信息数据
			await cache.SaveToFile(config.UserInfoSaveKey, userData);
			//通知“修改资料”页面进行数据刷新
			event.Send(event.Events.user.upDataInfo, userData);
			//返回资料修改页面
			this.nav.goBack();
			return;
		} else {
			Alert.alert('发生未知错误');
			return;
		}
	};
	/**
   * 品名条目点击事件
   *
   * @memberof UpdataSteelMills
   */
	itemPress = (item) => {
		Keyboard.dismiss();
		//已选中品名点击
		if (item.select == 'Selected') {
			for (let i = 0; i < this.data.mySteelName.length; i++) {
				let newItem = this.data.mySteelName[i];
				if (item == newItem) {
					this.data.mySteelName.splice(i, 1);
					this.data.otherSteelName.push(newItem);
					//已选择品名
					this.setState({
						mySteelName: this.addKeyForSteelName(this.data.mySteelName, 'Selected')
					});
					//未选择品名
					this.setState({
						otherSteelName: this.addKeyForSteelName(this.data.otherSteelName, 'unSelected')
					});
					break;
				}
			}
		} else {
			for (let i = 0; i < this.data.otherSteelName.length; i++) {
				let newItem = this.data.otherSteelName[i];
				if (item == newItem) {
					this.data.otherSteelName.splice(i, 1);
					this.data.mySteelName.push(newItem);
					//已选择品名
					this.setState({
						mySteelName: this.addKeyForSteelName(this.data.mySteelName, 'Selected')
					});
					//未选择品名
					this.setState({
						otherSteelName: this.addKeyForSteelName(this.data.otherSteelName, 'unSelected')
					});
					break;
				}
			}
		}
	};

	/**
   * 右侧图标
   *
   * @returns
   * @memberof UpdataSteelName
   */
	iconView(select) {
		if (select == 'Selected') {
			return <Icon name="ios-close-circle" color={skin.subtitle} style={{ fontSize: 18, marginRight: 20 }} />;
		}
		return null;
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
						height: 40,
						backgroundColor: skin.tint
					}}
				>
					<Text style={{ marginLeft: 15, flex: 1 }}>{item.name}</Text>
					{this.iconView(item.select)}
				</View>
			</TouchableHighlight>
		);
	};
}
