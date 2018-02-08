import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	Alert,
	Linking,
	TouchableHighlight,
	TextInput,
	Keyboard,
	Platform
} from 'react-native';
import skin from '../../style';
import user from '../../logic/user';
import image from '../../logic/image';
import Icon from 'react-native-vector-icons/Ionicons';
import chat from '../../logic/chat';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Toast from 'react-native-root-toast';

/**
 * 个人详细资料
 *
 * @author zhengyeye
 * @export
 * @class DetailsInfo
 * @extends {Component}
 */
export default class DetailsInfo extends Component {
	static navigationOptions = {
		title: '详细资料'
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.data = {
			user: null, //用户信息
			nickStr: '' //设置用户昵称保存数据使用
		};
		this.state = {
			myuid: '', //我的id
			uid: '', //用户id
			avatar: image.DefaultAvatar.man, //头像（默认为男性头像）
			sex: '男', //性别（默认为男）
			name: '', //姓名
			nickname: '', //昵称
			mobile: '', //手机号
			company: '', //所在公司
			circle: '', //所在圈子
			user: null, //用户信息
			sImageArr: [],
			bImageArr: [],
			isIOSNine: false, //是否为ios9
			newValue: ''
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		title: '详细资料',
		headerRight:
			navigation.state.params.rightViewShow == false ? (
				<TouchableHighlight
					onPress={() => navigation.state.params.callPhone()}
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
							height: 44
						}}
					>
						<Icon name="ios-call-outline" style={{ marginLeft: 20 }} size={25} color={skin.tint} />
					</View>
				</TouchableHighlight>
			) : null
	});

	/**
	 * 导航栏右侧拨打电话事件
	 *
	 * @memberof DetailsInfo
	 */
	callPhone = async () => {
		let name = this.state.nickname ? this.state.nickname : this.state.name;
		Alert.alert('确定给' + name + '拨打电话', '', [
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
	};

	/**
	 * 拨打电话
	 *
	 * @memberof DetailsInfo
	 */
	callPhoneNumber() {
		if (this.state.mobile != '') {
			let url = 'tel: ' + this.state.mobile;
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
	}

	//组件初始化完毕
	componentDidMount() {
		let id = this.params.userId ? this.params.userId : null;
		let myuid = chat.getUserUid();
		this.setState({ myuid: myuid });
		this.props.navigation.setParams({
			rightViewShow: id == myuid
		});

		if (__DEV__) {
			console.log(id);
		}
		if (Platform.OS == 'ios') {
			let iosVersion = Platform.Version.toString();
			if (iosVersion.startsWith('9.')) {
				this.setState({ isIOSNine: true });
			}
		}

		if (id) {
			this.setUserInfo(id);
		}
	}

	/**
	 * 填充用户数据
	 *
	 * @memberof DetailsInfo
	 */
	setUserInfo = async (id) => {
		let userInfo = null;
		if (id == this.state.myuid) {
			userInfo = await user.GetUserInfo();
		} else {
			userInfo = await chat.GetFullUserInfo(id, true);
		}

		if (userInfo) {
			let nickname = await chat.getNickName(id);
			if (nickname != null && nickname != '') {
				this.data.nickStr = nickname;
				this.setState({ nickname: nickname, newValue: nickname });
			}
			let sImages = [];
			let bImages = [];
			let avatarSource = image.GetSmallImageSource(userInfo.img); //用户头像
			if (avatarSource == image.ErrorImg.default) {
				avatarSource = userInfo.sex == 1 ? image.DefaultAvatar.man : image.DefaultAvatar.woman;
			} else {
				sImages.push({ index: 0, url: avatarSource.uri });
				let bigImages = image.GetBigImageSource(userInfo.img); //用户头像
				bImages.push({ index: 0, url: bigImages.uri });
			}

			this.data.user = userInfo;
			this.setState({
				uid: userInfo.id, //用户id
				avatar: avatarSource, //头像（默认为男性头像）
				sex: userInfo.sex == 2 ? '女' : '男', //性别（默认为男）
				name: userInfo.name, //姓名
				mobile: userInfo.mobile ? userInfo.mobile : '', //手机号
				company: userInfo.companyshort ? userInfo.companyshort : '', //所在公司
				circle: userInfo.groupnames ? userInfo.groupnames : '', //所在圈子
				user: userInfo, //用户信息
				sImageArr: sImages,
				bImageArr: bImages
			});

			this.props.navigation.setParams({
				callPhone: this.callPhone
			});
		}
	};

	/**
	 * 查看用户头像大图
	 * 
	 * @memberof DetailsInfo
	 */
	bigAvaterImags = () => {
		if (this.state.user && this.state.sImageArr.length > 0 && this.state.bImageArr.length > 0) {
			//进入图片查看
			this.nav.navigate('dynamicImgs', {
				simgsArr: this.state.sImageArr,
				bimgsArr: this.state.bImageArr,
				index: 0
			});
		} else {
			Toast.show('该用户未设置头像', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View style={{ height: 15, backgroundColor: skin.lightSeparate }} />
				<View style={detailsInfoStyle.container}>
					<View style={detailsInfoStyle.avatarOuter}>
						<TouchableHighlight
							style={detailsInfoStyle.avatar}
							onPress={this.bigAvaterImags}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View style={detailsInfoStyle.avatar}>
								<Image style={detailsInfoStyle.avatar} source={this.state.avatar} />
							</View>
						</TouchableHighlight>

						<View style={detailsInfoStyle.avatarRight}>
							<Text style={{ color: skin.title }}>{this.state.name}</Text>
							<Text style={{ color: skin.title }}>{this.state.sex}</Text>
						</View>
					</View>
				</View>
				{this.nickNameView()}
				<View style={{ height: 8, backgroundColor: skin.lightSeparate }} />
				<View style={detailsInfoStyle.lineView}>
					<Text style={detailsInfoStyle.textStyle}>手机号</Text>
					<Text style={detailsInfoStyle.textValueStyle} numberOfLines={1}>
						{this.state.mobile}
					</Text>
				</View>
				<View style={{ height: 8, backgroundColor: skin.lightSeparate }} />
				<View style={detailsInfoStyle.lineView}>
					<Text style={detailsInfoStyle.textStyle}>所在公司</Text>
					<Text style={detailsInfoStyle.textValueStyle} numberOfLines={1}>
						{this.state.company}
					</Text>
				</View>
				<View style={{ height: 8, backgroundColor: skin.lightSeparate }} />
				<View style={detailsInfoStyle.lineView}>
					<Text style={detailsInfoStyle.textStyle}>所在圈子</Text>
					<Text style={detailsInfoStyle.textValueStyle} numberOfLines={1}>
						{this.state.circle}
					</Text>
				</View>
				<View style={{ height: 8, backgroundColor: skin.lightSeparate }} />
				<TouchableHighlight
					onPress={() => this.dynamic()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View style={detailsInfoStyle.lineView}>
						<Text style={detailsInfoStyle.textStyle}>
							{this.state.uid == this.state.myuid ? '我的动态' : '动态'}
						</Text>
						<Icon name="ios-arrow-forward" style={{ marginRight: 20 }} size={25} color={skin.subtitle} />
					</View>
				</TouchableHighlight>
				{this.sendMessageButtonView()}
				<PopupDialog
					dialogTitle={
						<DialogTitle
							titleStyle={{ backgroundColor: skin.tint, height: 40 }}
							titleTextStyle={{ fontSize: 16 }}
							title="设置昵称"
						/>
					}
					ref={(popupDialog) => {
						this.popupDialog = popupDialog;
					}}
					containerStyle={{ justifyContent: 'flex-start', paddingTop: 100 }}
					dialogStyle={{
						backgroundColor: skin.tint,
						borderRadius: 3,
						width: 241,
						height: 140,
						justifyContent: 'flex-start'
					}}
				>
					<View
						style={{
							backgroundColor: skin.tint,
							height: 50,
							borderRadius: 3
						}}
					>
						{this.inputView()}
					</View>
					<View style={{ backgroundColor: skin.inactiveRemind, height: 1 }} />
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-start',
							alignItems: 'center',
							backgroundColor: skin.tint,
							height: 50,
							borderRadius: 5
						}}
					>
						<TouchableHighlight
							onPress={() => {
								this.popupDialog.dismiss();
								Keyboard.dismiss();
							}}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									width: 80,
									marginHorizontal: 20,
									marginVertical: 10
								}}
							>
								<Text style={{ fontSize: 16, color: skin.activeTint }}>取消</Text>
							</View>
						</TouchableHighlight>
						<View style={{ backgroundColor: skin.inactiveRemind, width: 1, height: 60 }} />
						<TouchableHighlight
							onPress={() => this.nickNameUpdate()}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									width: 80,
									marginHorizontal: 20,
									marginVertical: 10
								}}
							>
								<Text style={{ fontSize: 16, color: skin.activeTint }}>确定</Text>
							</View>
						</TouchableHighlight>
					</View>
				</PopupDialog>
			</View>
		);
	}

	/**
   * 输入值控制
   *
   * @memberof UpdataInfo
   */
	setValue = (text) => {
		let value = text;
		if (this.state.isIOSNine) {
			if (text.length >= 10) {
				value = text.substr(0, 10);
			}
			this.setState({ newValue: value });
		}
		this.data.nickStr = value;
	};

	/**
	 * 文本输入视图
	 * 
	 * @returns 
	 * @memberof DetailsInfo
	 */
	inputView() {
		if (this.state.isIOSNine) {
			return (
				<TextInput
					style={{
						height: 35,
						color: skin.messageTextColor,
						fontSize: 14,
						flex: 1,
						padding: 0,
						margin: 10,
						borderColor: skin.darkSeparate,
						borderWidth: 1
					}}
					defaultValue={this.state.nickname ? this.state.nickname : ''}
					value={this.state.newValue}
					clearButtonMode="while-editing"
					underlineColorAndroid="transparent"
					maxLength={10}
					onChangeText={(text) => {
						this.setValue(text);
					}}
				/>
			);
		}
		return (
			<TextInput
				style={{
					height: 35,
					color: skin.messageTextColor,
					fontSize: 14,
					flex: 1,
					padding: 0,
					margin: 10,
					borderColor: skin.darkSeparate,
					borderWidth: 1
				}}
				defaultValue={this.state.nickname ? this.state.nickname : ''}
				clearButtonMode="while-editing"
				underlineColorAndroid="transparent"
				maxLength={10}
				onChangeText={(text) => {
					this.data.nickStr = text;
				}}
			/>
		);
	}

	/**
	 * 昵称显示视图
	 *
	 * @returns
	 * @memberof DetailsInfo
	 */
	nickNameView() {
		if (this.state.uid != this.state.myuid) {
			return (
				<View>
					<View style={{ height: 8, backgroundColor: skin.lightSeparate }} />
					<TouchableHighlight
						onPress={this.updateNickName}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View style={detailsInfoStyle.lineView}>
							<Text style={detailsInfoStyle.textStyle}>昵称</Text>
							<Text style={detailsInfoStyle.textValueStyle} numberOfLines={1}>
								{this.state.nickname ? this.state.nickname : '未设置'}
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
	 *设置用户昵称
	 *
	 * @memberof DetailsInfo
	 */
	nickNameUpdate = async () => {
		this.popupDialog.dismiss();
		Keyboard.dismiss();
		let nickname = this.data.nickStr.toString().trim();
		// if (nickname == '') {
		// 	Toast.show('昵称不能为空', {
		// 		duration: Toast.durations.SHORT,
		// 		position: Toast.positions.BOTTOM
		// 	});
		// 	return;
		// }
		let result = await chat.setNickName(this.state.uid, nickname);
		if (result == true) {
			this.data.user.nick = nickname;
			this.setState({ nickname: nickname, user: this.data.user });
			Toast.show('昵称设置成功', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			Toast.show('昵称设置失败', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	/**
	 * 发送消息按钮视图
	 *
	 * @returns
	 * @memberof DetailsInfo
	 */
	sendMessageButtonView() {
		if (this.state.uid == this.state.myuid) {
			return null;
		} else {
			return (
				<TouchableHighlight
					onPress={() => this.sendmessage()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={detailsInfoStyle.mesButton}
				>
					<View style={detailsInfoStyle.mesTextOuter}>
						<Text style={detailsInfoStyle.mesText}>发消息</Text>
					</View>
				</TouchableHighlight>
			);
		}
	}

	// 更改昵称
	updateNickName = () => {
		this.popupDialog.show();
	};

	/**
	 * 查看动态
	 *
	 * @memberof DetailsInfo
	 */
	dynamic = async () => {
		let nickname = await chat.getNickName(this.state.user.id);
		//跳转到'我的-动态'页面
		this.nav.navigate('userdynamic', { user: this.state.user });
	};

	/**
	 * 发送消息按钮事件
	 *
	 * @memberof DetailsInfo
	 */
	sendmessage = async () => {
		let user = this.state.user;
		let nickname = await chat.getNickName(this.state.user.id);
		if (nickname) {
			user.name = nickname;
		}
		//跳转到聊天对话页面
		this.nav.navigate('chatView', { searchUser: user, userOrGroupInfo: user });
	};
}

//详细资料页面样式
const detailsInfoStyle = StyleSheet.create({
	container: {
		//最外层容器
		paddingVertical: 10,
		paddingHorizontal: 12,
		flexDirection: 'row',
		height: 90,
		backgroundColor: '#fff'
	},
	avatarOuter: {
		//头像外面的容器
		marginBottom: 12,
		paddingVertical: 10,
		paddingHorizontal: 12,
		flexDirection: 'row'
	},
	avatar: {
		//头像
		height: 60,
		width: 60,
		borderRadius: 30
	},
	avatarRight: {
		//头像右侧：姓名%性别
		paddingLeft: 8,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		paddingTop: 10
	},
	lineView: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 45,
		borderBottomColor: skin.lightSeparate,
		borderBottomWidth: 1,
		backgroundColor: '#fff'
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
	},
	mesButton: {
		//发消息按钮
		flexDirection: 'row',
		marginHorizontal: 20,
		marginTop: 25,
		borderRadius: 5
	},
	mesTextOuter: {
		//发消息按钮的外层容器
		flex: 1,
		backgroundColor: skin.main,
		justifyContent: 'center',
		alignItems: 'center',
		height: 44,
		borderRadius: 5
	},
	mesText: { color: skin.tint, fontSize: 16 }
});
