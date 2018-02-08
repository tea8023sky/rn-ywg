import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	StatusBar,
	Image,
	TouchableHighlight,
	TextInput,
	Alert,
	BackHandler,
	FlatList,
	ScrollView,
	Keyboard,
	Platform
} from 'react-native';
import Header from '../header';
import event from '../../logic/event';
import image from '../../logic/image';
import device from '../../logic/device';
import Icon from 'react-native-vector-icons/Ionicons';
import skin from '../../style';
import user from '../../logic/user';
import net from '../../logic/net';
import cache from '../../logic/cache';
import config from '../../config';
import { CheckBox, SearchBar } from 'react-native-elements';
import { Loading } from '../loading';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import chat from '../../logic/chat';

export default class PerfectUserInfo extends Component {
	static navigationOptions = {
		title: '完善资料',
		gesturesEnabled: false, //不允许使用手势关闭该页面
		headerLeft: null //隐藏导航栏返回箭头
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			name: '', //姓名
			companyshort: '', //公司简称
			cidlist: '', //圈子名称
			cidlistid: '', //圈子id
			isSubmiting: false
		};
		this.state = {
			sexChecked: true,
			sex: '男', //性别（默认为男）
			cidlist: '', //圈子数据
			isIOSNine: false, //是否位ios 9
			newValue: '',
			nameValue: ''
		};
	}

	/**
   * 性别选择事件处理
   *
   * @memberof PerfectUserInfo
   */
	sexChoice = (sexStr) => {
		this.popupDialog.dismiss();
		this.setState({ sexChecked: !this.state.sexChecked });
		this.setState({ sex: sexStr });
	};

	/**
   * 圈子数据完善
   *
   * @memberof PerfectUserInfo
   */
	updataCircleData = async () => {
		//跳转到选择圈子页面(isUpdataInfo为是否为修改圈子)
		this.nav.navigate('updataCoterie', { isUpdataInfo: false });
	};

	/**
   * 提交资料
   *
   * @memberof PerfectUserInfo
   */
	submitUserInfo = async () => {
		if (this.data.isSubmiting) {
			return;
		}
		this.data.isSubmiting = true;
		//姓名校验
		let name = this.data.name.trim();
		if (name == null || name == '') {
			Alert.alert('请输入姓名');
			this.data.isSubmiting = false;
			return;
		}

		//性别
		let sex = this.state.sex.trim();

		//公司简称校验
		let companyshort = this.data.companyshort.trim();
		if (companyshort == null || companyshort == '') {
			Alert.alert('请输入公司简称');
			this.data.isSubmiting = false;
			return;
		}

		//圈子数据校验
		let cidlist = this.data.cidlist.trim();
		if (cidlist == null || cidlist == '') {
			Alert.alert('请选择圈子');
			this.data.isSubmiting = false;
			return;
		}

		let result = await user.PerfectUserInfo(name, sex == '男' ? 1 : 2, companyshort, this.data.cidlistid);
		if (!result.ok) {
			Alert.alert(result.msg);
			this.data.isSubmiting = false;
			return;
		}
		//清除临时缓存的用户注册保存数据
		await cache.RemoveCache(config.NewUserInfoSaveKey);

		if (this.nav.state.params && this.nav.state.params.back_my_key != '') {
			this.nav.goBack(this.nav.state.params.back_my_key); //关闭指定页面
		} else {
			this.nav.goBack(); //关闭当前页面
		}
		//跳转到“我的”首页
		// this.nav.navigate('my');
	};

	/**
   * 从缓存文件中获取用户圈子数据
   *
   * @memberof PerfectUserInfo
   */
	getUserCircles = async () => {
		let result = await user.GetUserJoinCircles();
		if (result != null) {
			for (let i = 0; i < result.length; i++) {
				this.data.cidlist = this.data.cidlist.concat(result[i].name + ',');
			}
			let data = this.data.cidlist.toString();
			this.setState({ cidlist: data.substring(0, data.length - 1) });
		}
	};

	//组件初始化完毕
	componentDidMount() {
		//订阅用户修改圈子事件,以便刷新界面数据
		event.Sub(this, event.Events.user.updataCircles, this.setUserCircles);
		if (Platform.OS == 'ios') {
			let iosVersion = Platform.Version.toString();
			if (iosVersion.startsWith('9.')) {
				this.setState({ isIOSNine: true });
			}
		}
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//移除用户修改圈子事件订阅
		event.UnSub(this);
		//移除android物理返回键拦截事件
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		//屏蔽该页面Android物理返回键，返回true表示拦截事件
		return true;
	};

	/**
   * 设置用户圈子数据
   *
   * @memberof PerfectUserInfo
   */
	setUserCircles = (circlesData) => {
		if (circlesData != null) {
			let cidlistName = '';
			let cidlistId = '';
			for (let i = 0; i < circlesData.length; i++) {
				cidlistName = cidlistName.concat(circlesData[i].name + ',');
				cidlistId = cidlistId.concat(circlesData[i].id + ',');
			}
			this.data.cidlist = cidlistName.toString().substring(0, cidlistName.length - 1);
			this.data.cidlistid = cidlistId.toString().substring(0, cidlistId.length - 1);
			this.setState({ cidlist: this.data.cidlist });
		}
	};

	/**
 * 赋值操作
 * 
 * @memberof PerfectUserInfo
 */
	setValue(data, text) {
		let value = text;
		if (this.state.isIOSNine) {
			if (text.length >= 10) {
				value = text.substr(0, 10);
			}
		}
		if (data == 'name') {
			this.setState({ nameValue: value });
			this.data.name = value;
		} else if (data == 'companyshort') {
			this.data.companyshort = value;
			this.setState({ newValue: value });
		}
	}
	/**
	 * 文本输入视图
	 * 
	 * @memberof PerfectUserInfo
	 */
	inputView(data) {
		if (this.state.isIOSNine) {
			return (
				<TextInput
					style={styles.textinput}
					clearButtonMode="while-editing"
					returnKeyType="done"
					underlineColorAndroid="transparent"
					placeholderTextColor={skin.subtitle}
					maxLength={10}
					value={data == 'name' ? this.state.nameValue : data == 'companyshort' ? this.state.newValue : ''}
					placeholder="不超过10个文字"
					onChangeText={(text) => {
						this.setValue(data, text);
					}}
				/>
			);
		}
		return (
			<TextInput
				style={styles.textinput}
				clearButtonMode="while-editing"
				returnKeyType="done"
				underlineColorAndroid="transparent"
				placeholderTextColor={skin.subtitle}
				maxLength={10}
				placeholder="不超过10个文字"
				onChangeText={(text) => {
					if (data == 'name') {
						this.data.name = text;
					} else if (data == 'companyshort') {
						this.data.companyshort = text;
					}
				}}
			/>
		);
	}

	render() {
		return (
			<View style={{ backgroundColor: skin.tint, flex: 1 }}>
				{/* 状态栏样式 default - 默认的样式（IOS为白底黑字、Android为黑底白字）
                              light-content - 黑底白字
                              dark-content - 白底黑字 */}
				<StatusBar animated={true} barStyle={'default'} />
				<View style={styles.inputView}>
					<Text style={styles.text}>姓名</Text>
					{this.inputView('name')}
				</View>
				<View style={styles.inputView}>
					<Text style={styles.text}>公司简称</Text>
					{this.inputView('companyshort')}
				</View>
				<TouchableHighlight
					onPress={() => {
						this.popupDialog.show();
						Keyboard.dismiss();
					}}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View style={styles.inputView}>
						<Text style={styles.text}>性别</Text>

						<View flexDirection="row" flex={1} height={50} justifyContent="flex-end" alignItems="center">
							<Text
								style={{
									color: skin.subtitle,
									marginHorizontal: 10,
									fontSize: 16,
									padding: 0,
									textAlignVertical: 'center',
									includeFontPadding: false,
									textAlign: 'right'
								}}
								numberOfLines={1}
							>
								{this.state.sexChecked == true ? '男' : '女'}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				<TouchableHighlight
					onPress={this.updataCircleData}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View style={styles.inputView}>
						<Text style={styles.text}>选择圈子</Text>
						<View flexDirection="row" flex={1} height={50} justifyContent="flex-end" alignItems="center">
							<Text
								style={{
									color: skin.subtitle,
									marginHorizontal: 10,
									fontSize: 16,
									padding: 0,
									textAlignVertical: 'center',
									includeFontPadding: false
								}}
								numberOfLines={1}
							>
								{this.state.cidlist}
							</Text>
						</View>
						<Icon
							name="ios-arrow-forward"
							style={{ marginLeft: 15, marginRight: 15 }}
							size={25}
							color={skin.subtitle}
						/>
					</View>
				</TouchableHighlight>
				<TouchableHighlight
					onPress={this.submitUserInfo}
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

				<PopupDialog
					dialogTitle={
						<DialogTitle
							titleStyle={{ backgroundColor: skin.inactiveRemind, height: 60 }}
							titleTextStyle={{ fontSize: 18 }}
							title="性别"
						/>
					}
					ref={(popupDialog) => {
						this.popupDialog = popupDialog;
					}}
					width={240}
					height={170}
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
							checked={this.state.sexChecked}
							onPress={() => this.sexChoice('男')}
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
							checked={!this.state.sexChecked}
							onPress={() => this.sexChoice('女')}
						/>
					</View>
				</PopupDialog>
			</View>
		);
	}
}

/**
 * 用户圈子选择修改页面
 * @author wuzhitao
 * @export
 * @class UpdataCoterie
 * @extends {Component}
 */
export class UpdataCoterie extends Component {
	//用户圈子选择修改页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '选择圈子',
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
			myCoterieData: [], //已关注的圈子
			hotCoterieData: [], //热门圈子
			nearCoterieData: [] //附近的圈子
		};

		this.data = {
			isUpdataInfo: true, //是否修改圈子（默认为是）
			myCoterieIds: [], //已关注圈子id
			clickTime: null,
			isSubmiting: false //是否正在提交
		};
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
		this.data.isUpdataInfo = this.props.navigation.state.params.isUpdataInfo;
		this.getCircleData();
		//订阅用户圈子搜索,以便刷新界面数据
		event.Sub(this, event.Events.user.updataCircles, this.setCircle);
	}
	//在组件销毁的时候要将订阅移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	/**
   * 设置用户信息
   *
   * @memberof MyIndex
   */
	setCircle = (circle) => {
		if (circle == null || circle == '') {
			return;
		}
		//添加圈子到已关注
		circle.key = circle.id;
		circle.itemType = ItemType.MyItem;
		circle.iconName = IconName.Close;
		//保存id到关注圈子id
		this.data.myCoterieIds.push(circle.id);
		//保存到关注圈子
		this.state.myCoterieData.push(circle);
		this.setState({ myCoterieData: this.state.myCoterieData });
	};

	/**
   * 点击搜索框操作
   *
   * @memberof UpdataCoterie
   */
	focusSearchBar = () => {
		let nowTime = new Date().getTime();
		if (this.data.clickTime != null) {
			let time = nowTime - this.data.clickTime;
			if (time < 2000) {
				return;
			}
		}
		this.data.clickTime = nowTime;
		//跳转到圈子搜索页面
		this.nav.navigate('searchCircle', { circleIds: this.data.myCoterieIds });
	};

	/**
   * 请求圈子数据
   *
   * @memberof PerfectUserInfo
   */
	getCircleData = async () => {
		this.refs.loading.Isvisible(true);
		let latitude = config.DefaultLatitude;
		let longitude = config.DefaultLongitude;
		//获取定位信息
		try {
			let location = await device.GetCurrentPosition(false);
			if (__DEV__) {
				console.log('获取到的位置信息：' + JSON.stringify(location));
			}
			latitude = location.coords.latitude;
			longitude = location.coords.longitude;
		} catch (error) {
			if (__DEV__) {
				console.log('获取位置信息失败：' + error);
			}
		}

		//发送请求
		let result = await net.ApiPost('circle', 'GetAllCircle', {
			latitude: latitude,
			longitude: longitude
		});

		if (result != null && result.status == 1) {
			//已关注圈子数据填充
			let myCoterieData = this.addKeyForCircleData(result.data[0], ItemType.MyItem);
			this.setState({ myCoterieData: myCoterieData });
			//热门圈子数据填充
			let hotCoterieData = this.addKeyForCircleData(result.data[1], ItemType.HotItem);
			this.setState({ hotCoterieData: hotCoterieData });
			//附近的圈子数据填充
			let nearCoterieData = this.addKeyForCircleData(result.data[2], ItemType.NearItem);
			this.setState({ nearCoterieData: nearCoterieData });
		} else {
			Toast.show('数据加载失败，请重试', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
		this.refs.loading.Isvisible(false);
	};

	//为数据增加key
	addKeyForCircleData(circleData, itemType) {
		let myCoterieIds = this.data.myCoterieIds;
		//已关注圈子数据填充
		for (let i = 0; i < circleData.length; i++) {
			let element = circleData[i];
			circleData[i].key = element.id + '_key_' + new Date().getTime();
			circleData[i].name = element.name;
			circleData[i].itemType = itemType;
			if (itemType == ItemType.MyItem) {
				circleData[i].iconName = IconName.Close;
				//保存已关注圈子id
				myCoterieIds.push(element.id);
			} else {
				let checkid = myCoterieIds.find((n) => n == element.id);
				if (myCoterieIds != null && myCoterieIds.length > 0 && typeof checkid != 'undefined') {
					circleData[i].iconName = IconName.Check;
				} else {
					circleData[i].iconName = IconName.Add;
				}
			}
		}
		return circleData;
	}

	render() {
		return (
			<View style={styles.coterieView}>
				{/* <TouchableHighlight
					onPress={() => this.focusSearchBar()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View>
						<SearchBar
							containerStyle={{
								backgroundColor: skin.lightSeparate
							}}
							inputStyle={{ backgroundColor: skin.tint, fontSize: 12 }}
							lightTheme
							placeholder="输入圈子中文名称或者拼音"
							editable={false}
						/>
					</View>
				</TouchableHighlight> */}
				<TouchableHighlight
					onPress={() => this.focusSearchBar()}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
				>
					<View
						style={{
							flexDirection: 'row',
							margin: 6,
							backgroundColor: skin.tint,
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
								fontSize: 12,
								padding: 10,
								paddingBottom: 10
							}}
						>
							输入圈子中文名称或者拼音
						</Text>
					</View>
				</TouchableHighlight>
				<View
					style={{
						height: 1,
						backgroundColor: skin.darkSeparate
					}}
				/>
				<ScrollView style={{}}>
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>已关注的圈子</Text>
					</View>
					<FlatList data={this.state.myCoterieData} extraData={this.state} renderItem={this.itemView} />
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>热门圈子</Text>
					</View>
					<FlatList data={this.state.hotCoterieData} extraData={this.state} renderItem={this.itemView} />
					<View style={styles.classTextView}>
						<Text style={{ marginLeft: 25 }}>附近的圈子</Text>
					</View>
					<FlatList data={this.state.nearCoterieData} extraData={this.state} renderItem={this.itemView} />
				</ScrollView>

				<TouchableHighlight
					onPress={this.submitCoterieData}
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
						<Text style={{ color: skin.tint, fontSize: 16 }}>
							{this.data.isUpdataInfo == true ? '确定' : '下一步'}
						</Text>
					</View>
				</TouchableHighlight>
				<Loading text="加载中" ref="loading" />
			</View>
		);
	}

	/**
   * 提交修改后的圈子数据
   *
   * @memberof UpdataCoterie
   */
	submitCoterieData = async () => {
		if (this.data.myCoterieIds.length > 0) {
			if (this.data.isSubmiting) {
				return;
			}
			this.data.isSubmiting = true;
			//更新资料
			if (this.data.isUpdataInfo) {
				let cidlistId = '';
				for (let i = 0; i < this.data.myCoterieIds.length; i++) {
					let id = this.data.myCoterieIds[i].toString();
					cidlistId = cidlistId.concat(this.data.myCoterieIds[i] + ',');
				}
				let cid = cidlistId.toString().substring(0, cidlistId.length - 1);

				let result = await net.ApiPost('circle', 'SwitchCircle', {
					cid: cid
				});

				if (result == null || typeof result.status == 'undefined') {
					Alert.alert('修改圈子时发生错误,请稍后重试');
					this.data.isSubmiting = false;
					return;
				} else if (result.status == 0) {
					Alert.alert(result.error);
					this.data.isSubmiting = false;
					return;
				} else if (result.status == 1) {
					if (typeof result.data != 'undefined' && result.data != null && result.data.length > 0) {
						if (__DEV__) {
							console.log('圈子修改接口返回数据：' + JSON.stringify(result.data));
						}
						await cache.SaveToFile(config.UserCirclesInfoSaveKey, result.data);
						//通知消息首页进行数据刷新
						event.Send(event.Events.chat.chatIndexChanged);
						//重连聊天服务
						await chat.resetChatWebSocket();
					}
					this.nav.goBack();
					return;
				} else {
					Alert.alert('发生未知错误');
					this.data.isSubmiting = false;
					return;
				}
			}
			//完善资料,无需发送服务器，修改本地缓存即可
			await cache.SaveToFile(config.UserCirclesInfoSaveKey, this.state.myCoterieData);
			event.Send(event.Events.user.updataCircles, this.state.myCoterieData);
			this.nav.goBack();
			return;
		}
		Alert.alert('请先添加圈子');
	};
	/**
   * 圈子条目点击事件
   *
   * @memberof UpdataCoterie
   */
	itemPress = (item) => {
		//添加关注圈子
		if (item.itemType != ItemType.MyItem && item.iconName != IconName.Check) {
			if (this.data.myCoterieIds.length < 3) {
				//已关注圈子数据处理
				let newItem = Object.create(item);
				newItem.key = newItem.id + '_key_' + new Date().getTime();
				newItem.itemType = ItemType.MyItem;
				newItem.iconName = IconName.Close;
				this.state.myCoterieData.push(newItem);
				this.setState({ myCoterieData: this.state.myCoterieData });
				this.data.myCoterieIds.push(newItem.id);

				//热门圈子数据处理
				let hotItem = this.state.hotCoterieData.find((n) => n.id == item.id);
				if (typeof hotItem != 'undefined') {
					hotItem.iconName = IconName.Check;
					this.setState({ hotCoterieData: this.state.hotCoterieData });
				}
				//附近圈子数据处理
				let nearItem = this.state.nearCoterieData.find((n) => n.id == item.id);
				if (typeof nearItem != 'undefined') {
					nearItem.iconName = IconName.Check;
					this.setState({ nearCoterieData: this.state.nearCoterieData });
				}
				return;
			}
			Alert.alert('只能关注3个圈子');
			return;
		}
		//取消关注圈子
		if (item.iconName != IconName.Add && this.data.myCoterieIds.length > 0) {
			//已关注圈子数据处理
			for (let i = 0; i < this.data.myCoterieIds.length; i++) {
				let id = this.data.myCoterieIds[i];
				if (id == item.id) {
					this.data.myCoterieIds.splice(i, 1);
					break;
				}
			}

			for (let i = 0; i < this.state.myCoterieData.length; i++) {
				let id = this.state.myCoterieData[i].id;
				if (id == item.id) {
					this.state.myCoterieData.splice(i, 1);
					this.setState({ myCoterieData: this.state.myCoterieData });
					break;
				}
			}

			//热门圈子数据处理
			let hotItem = this.state.hotCoterieData.find((n) => n.id == item.id);
			if (typeof hotItem != 'undefined') {
				hotItem.iconName = IconName.Add;
				this.setState({ hotCoterieData: this.state.hotCoterieData });
			}
			//附近圈子数据处理
			let nearItem = this.state.nearCoterieData.find((n) => n.id == item.id);
			if (typeof nearItem != 'undefined') {
				nearItem.iconName = IconName.Add;
				this.setState({ nearCoterieData: this.state.nearCoterieData });
			}
			return;
		}
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
						height: 40,
						backgroundColor: skin.tint
					}}
				>
					<Text style={{ marginLeft: 15, flex: 1 }}>{item.name}</Text>
					<Icon
						name={item.iconName}
						color={this.getIconColor(item.iconName)}
						style={{ fontSize: 18, marginRight: 20 }}
					/>
				</View>
			</TouchableHighlight>
		);
	};

	/**
   * 根据图标名称返回相应的颜色
   *
   * @param {string} iconName 图标名称
   * @returns
   * @memberof UpdataCoterie
   */
	getIconColor(iconName) {
		switch (iconName) {
			case IconName.Close:
				return skin.subtitle;
			case IconName.Add:
				return skin.activeRemind;
			case IconName.Check:
				return skin.activeTint;
			default:
				return skin.subtitle;
		}
	}
}

/**
 * 用户圈子搜索
 * @author wuzhitao
 * @export
 * @class SearchCircle
 * @extends {Component}
 */
export class SearchCircle extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.data = {
			allCircleData: [], //所有圈子数据
			circleIds: [] //用户已关注圈子id
		};

		this.state = {
			searchCircleData: [], //搜索到的圈子数据
			showText: false //是否显示文字提示框
		};
	}

	//页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: (headerProps) => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} />
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
							placeholder="输入圈子中文名称或者拼音"
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
		this.props.navigation.setParams({ onChangeText: this.searchCircleData });
		//获取已关注圈子id
		this.data.circleIds = this.props.navigation.state.params.circleIds;
		//获取所有圈子数据
		this.getAllCircleData();
	}

	/**
   * 通过网络请求获取所有圈子数据
   *
   * @memberof SearchCircle
   */
	getAllCircleData = async () => {
		let result = await net.ApiPost('circle', 'GetCircleList', {});
		if (result == null || typeof result.status == 'undefined') {
			Alert.alert('获取圈子数据时发生错误,请稍后重试');
		} else if (result.status == 0) {
			Alert.alert(result.error + '');
		} else if (result.status == 1) {
			this.data.allCircleData = result.data;
			if (__DEV__) {
				console.log(JSON.stringify(this.data.allCircleData));
			}
		} else {
			Alert.alert('发生未知错误');
		}
	};

	render() {
		return (
			<View style={styles.coterieView}>
				{this.textView()}
				<FlatList
					keyboardShouldPersistTaps="always"
					data={this.state.searchCircleData}
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
						marginTop: 20,
						height: 40
					}}
				>
					<Text>没有找到您要搜索的内容</Text>
				</View>
			);
		}
		return null;
	}

	/**
   * 发送请求进行搜索并填充数据
   *
   * @memberof SearchCircle
   */
	searchCircleData = (key) => {
		let data = [];
		if (key == '') {
			this.setState({ showText: false });
			this.setState({ searchCircleData: data });
			return;
		}
		for (let i = 0; i < this.data.allCircleData.length; i++) {
			let circle = this.data.allCircleData[i];
			if (circle.name.includes(key) || circle.pinyin.includes(key) || circle.zimu.includes(key)) {
				circle.key = circle.id;
				data.push(circle);
			}
		}
		if (data.length == 0) {
			this.setState({ showText: true });
		} else {
			this.setState({ showText: false });
		}
		this.setState({ searchCircleData: data });
	};
	/**
   * 圈子数据条目点击事件
   *
   * @memberof SearchCircle
   */
	itemPress = (item) => {
		Keyboard.dismiss();
		if (this.data.circleIds.length < 3) {
			//排除是否已关注
			for (let i = 0; i < this.data.circleIds.length; i++) {
				if (item.id == this.data.circleIds[i]) {
					Alert.alert('不能重复关注同一个圈子');
					this.nav.goBack();
					return;
				}
			}
			//添加关注
			event.Send(event.Events.user.updataCircles, item);
			this.nav.goBack();
			return;
		}
		Alert.alert('只能关注3个圈子');
		this.nav.goBack();
		return;
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
						height: 40,
						backgroundColor: skin.tint
					}}
				>
					<Text style={{ marginLeft: 15, flex: 1 }}>{item.name}</Text>
					<Icon name={IconName.Add} color={skin.activeRemind} style={{ fontSize: 18, marginRight: 20 }} />
				</View>
			</TouchableHighlight>
		);
	};
}

//图标名称
class IconName {
	static Close = 'ios-close-circle'; //取消关注
	static Check = 'ios-checkmark-circle'; //已关注
	static Add = 'ios-add-circle'; //添加关注
}

//圈子选择列表分类
class ItemType {
	static MyItem = 'MyItem'; //已关注
	static HotItem = 'HotItem'; //热门
	static NearItem = 'NearItem'; //附近
}
//相关复用样式
const styles = StyleSheet.create({
	coterieView: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		backgroundColor: skin.lightSeparate
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
		marginLeft: 20,
		marginRight: 20,
		height: 50,
		borderColor: '#EEE'
	},
	text: {
		color: skin.subtitle,
		fontSize: 16,
		width: 75
	},
	textinput: {
		color: skin.subtitle,
		marginHorizontal: 10,
		flex: 1,
		height: 50,
		fontSize: 16,
		padding: 0
	}
});
