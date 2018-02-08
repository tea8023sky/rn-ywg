//新闻首页

import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	StatusBar,
	Platform,
	NativeAppEventEmitter,
	Alert,
	BackHandler,
	Modal,
	Linking
} from 'react-native';
import { StandardList, HomeList } from './newsList';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Dimensions from 'Dimensions';
import net from '../../logic/net';
import cache from '../../logic/cache';
import device from '../../logic/device';
import config from '../../config';
import Header from '../header';
import event from '../../logic/event';
import user from '../../logic/user';
import image from '../../logic/image';
import pageHelper from '../../logic/pageHelper';
import skin from '../../style';
import Toast from 'react-native-root-toast';
import chat from '../../logic/chat';
//极光
import JPushModule from 'jpush-react-native';
const receiveCustomMsgEvent = 'receivePushMsg';
const receiveNotificationEvent = 'receiveNotification';
const openNotificationEvent = 'openNotification';
const getRegistrationIdEvent = 'getRegistrationId';
//位置对象
export class Location {
	static latitude = 34.265806;
	static longitude = 108.953389;
	static registrationid = '';
}
let { width, height } = Dimensions.get('window');
export default class NewsIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabs: [],
			upgrade: null, //版本升级信息
			upgradeViewShow: false, //版本更新视图是否显示（默认不显示）
			guideViewShow: false, //引导页面是否显示（默认不显示）
			guideImage: Platform.OS == 'ios' ? image.version.guideFirst_ios : image.version.guideFirst_ad
		};
		this.nav = this.props.navigation;
		this.tabView = {};
		//this.allClass = [];
		this.backtime = 0; //点击返回
		this.notificationClickEnable = true;
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: (headerProps) => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} backgroundColor={skin.activeTint} />
					<Header />
					<View
						style={{
							flexDirection: 'row',
							height: 40,
							justifyContent: 'center',
							backgroundColor: '#4bc1d2'
						}}
					>
						<View
							style={{
								flex: 2,
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center'
							}}
						>
							<Image
								style={{ width: 20, height: 20, margin: 10 }}
								source={require('../../img/icon_white.png')}
							/>
							<Text style={{ fontSize: 16, color: '#ffffff' }}>业务GO</Text>
						</View>

						<View
							style={{
								flex: 3,
								flexDirection: 'row',
								justifyContent: 'flex-start',
								alignItems: 'center'
							}}
						>
							<TouchableWithoutFeedback
								onPress={() => {
									if (pageHelper.OpenPageVerification('newssearch')) {
										navigation.navigate('newssearch');
									}
								}}
							>
								<View
									style={{
										flex: 10,
										flexDirection: 'row',
										borderRadius: 5,
										borderColor: '#ffffff',
										borderWidth: 1,
										height: 24,
										backgroundColor: '#ffffff',
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Image
										style={{ width: 12, height: 12 }}
										source={require('../../img/news/search.png')}
									/>
									<Text style={{ fontSize: 14, color: '#878787' }}>输入关键词查询文章</Text>
								</View>
							</TouchableWithoutFeedback>
							<View style={{ flex: 1 }} />
						</View>
					</View>
				</View>
			);
		}
	});

	componentWillMount() {
		//android物理返回重置事件，防止返回到广告页面
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		this.jpushInit();
	}

	onBackAndroid = () => {
		if (this.props.screenProps.exitApp) {
			//直接退出App
			let t = new Date().getTime();
			if (t - this.backtime < 1000) {
				BackHandler.exitApp();
				return false;
			} else {
				this.backtime = t;
				Toast.show('退出APP请双击返回键', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return true;
			}
		}
	};

	//组件初始化完毕
	componentDidMount() {
		this.init();
		//订阅用户修改圈子事件,以便刷新界面数据
		event.Sub(this, event.Events.news.ChangeTabs, this.ChangeTabsed);
		event.Sub(this, event.Events.news.RebindTabs, this.RebindTabs);
		event.Sub(this, event.Events.user.login, this.logined);
		event.Sub(this, event.Events.user.logout, this.logouted);
		this.GetLocation();
	}

	/**
   * 初始化
   *
   * @memberof NewsIndex
   */
	async init() {
		//保存下次广告
		this.SaveAdToNext();
		this.GetAllClass();
	}

	/**
   * 保存下一次广告
   *
   * @memberof NewsIndex
   */
	async SaveAdToNext() {
		let result = await net.ApiPost('appinfo', 'GetAdverts');
		if (__DEV__) {
			console.log('保存广告：' + JSON.stringify(result));
		}

		if (result && result.status == 1 && result.data) {
			// {"status":1,"data":[{"id":21,"img":"http://static.test.gangguwang.com/image/2017/12/13/16/49/5a30e98f10f4e80009009cce.jpg","aid":1,
			// "createtime":1513154997,"ctime":2,"etime":1514303999,"name":"公祭日","ptime":5,"stime":1514105340,"uptime":1514181294,"url":""}]}
			// ptime===播放时长
			// ctime===可关闭时长
			// stime===开始时间
			// etime===结束时间
			//删除旧广告
			chat.removeAdvertising();
			//保存新广告
			chat.saveAdvertising(result.data);
		}
		//升级检测
		await this.upgradeTest();
	}

	/**
   * 升级检测
   *
   * @memberof NewsIndex
   */
	async upgradeTest() {
		let upgrade = await this.getUpInfop();
		if (upgrade) {
			//版本升级提示框
			this.setState({ upgrade: upgrade, upgradeViewShow: true });
		} else {
			//首次引导页检测
			let isFrist = await cache.LoadFromFile(config.YWGoFirst);
			if (!isFrist) {
				this.setState({ guideViewShow: true });
				await cache.SaveToFile(config.YWGoFirst, 'first overed.');
			}
		}
	}

	/**
   * 获取信息
   *
   * @returns
   * @memberof NewsIndex
   */
	async getUpInfop() {
		let os = Platform.OS == 'ios' ? 1 : 2;
		let result = await net.ApiPost('appinfo', 'GetInfo', {
			os: os + '',
			version: device.GetVersion(),
			devid: Location.registrationid //推送id
		});

		if (result && result.status == 1 && result.data) {
			//{"status":1,"data":{"Id":59,"Lastversion":"3.0.10","Platform":2,"Minver":"3.0.10","Minallow":"2.3.0",
			//"Installurl":"http://d.steelv.net/ywgo_3.0.10-20171222.apk","Fileurl":"http://d.steelv.net/ywgo_3.0.10-20171222.apk",
			//"Title":"3.0.10","Content":"1.使用最新技术；\r\n2.牛逼的app","Released":1,"Action":2}}
			if (__DEV__) {
				console.log(JSON.stringify(result));
			}

			let minRes = this.versionContrast(device.GetVersion(), result.data.Minver ? result.data.Minver : ''); //当前版本和最小版本比较
			let cancelRes = this.versionContrast(device.GetVersion(), result.data.Minallow ? result.data.Minallow : ''); //当前版本和强制升级版本比较
			let upgrade = {
				Title: result.data.Title, //标题
				Content: result.data.Content, //升级信息
				Lastversion: result.data.result, //最新版本
				IsHotUpdate: minRes == 1 ? false : true, //是否热更新
				IsCancel: cancelRes == 3 ? true : false, //升级页面是否可以取消 true=可取消的|false=不可取消
				Action: result.data.Action //升级完动作1=关闭|2=重启
			};
			if (upgrade.IsHotUpdate) {
				upgrade.Url = result.data.Fileurl; //应用升级的地址（热更新url）
			} else {
				upgrade.Url = result.data.Installurl; //应用升级的地址（安装包url）
			}

			return upgrade;
		}

		return null;
	}

	/**
   * 版本比较1= A小于B | 2=等于 | 3=大于
   *
   * @param {string} versionA
   * @param {string} versionB
   * @memberof NewsIndex
   */
	versionContrast(versionA, versionB) {
		let result = 0;
		let listA = versionA.split('.');
		let listB = versionB.split('.');
		let forCount = listA.length >= listB.length ? listB.length : listA.length;
		for (let i = 0; i < forCount; i++) {
			let vA = listA[i];
			let vB = listB[i];
			if (Number(vA) > Number(vB)) {
				result = 3;
				break;
			} else if (Number(vA) < Number(vB)) {
				result = 1;
				break;
			}
		}

		if (result == 0 && forCount > 0) {
			result = 2;
		}
		return result;
	}

	/**
   * 极光初始化
   *
   * @author NongHuaQiang
   * @memberof NewsIndex
   */
	jpushInit() {
		if (Platform.OS === 'ios') {
			this.subscription = NativeAppEventEmitter.addListener('ReceiveNotification', (notification) => {
				console.log('-------------------收到推送----------------');
				console.log(notification);
			});
			JPushModule.setupPush(); // if you add register notification in Appdelegate.m 有 don't need call this function
			JPushModule.addnetworkDidLoginListener(() => {
				//推送服务其已连接
				this.setTags();
			});

			JPushModule.addOpenNotificationLaunchAppListener((result) => {
				//ios设置角标
			});

			JPushModule.addReceiveOpenNotificationListener((result) => {
				//点击通知事件
				let obj = result;
				if (obj) {
					if (obj.type == 'msg') {
						//聊天消息
					} else if (obj.type == 'news' && this.notificationClickEnable) {
						this.notificationClickEnable = false;
						//新闻
						let isimg = parseInt(obj.isimg);
						let aid = obj.aid;
						this.nav.navigate('newsView', {
							id: aid,
							type: isimg,
							tid: 0,
							item: { id: aid, uptime: 0 }
						});
						this.timer = setTimeout(() => {
							this.notificationClickEnable = true;
						}, 1000);
					}
				}
			});

			JPushModule.addReceiveNotificationListener((result) => {
				//收到推送消息
			});

			JPushModule.addConnectionChangeListener((result) => {
				//连接状态更改
				// 如果连接状态变更为已连接返回 true，如果连接状态变更为断开连接连接返回 false
				if (result) {
					//Alert.alert('网络已连接');
				} else {
					//Alert.alert('网络已断开');
				}
			});

			JPushModule.getRegistrationID((registrationid) => {
				console.log(registrationid);
				//Alert.alert("id= " + registrationid);
				//this.setState({ regid: registrationid });
			});
		} else {
			//andoid
			JPushModule.getInfo((map) => {
				// this.setState({
				// 	appkey: map.myAppKey,
				// 	imei: map.myImei,
				// 	package: map.myPackageName,
				// 	deviceId: map.myDeviceId,
				// 	version: map.myVersion
				// });
				console.log('jpushinfo: ' + JSON.stringify(map));
			});
			JPushModule.notifyJSDidLoad((resultCode) => {
				if (resultCode === 0) {
				}
			});

			JPushModule.addReceiveCustomMsgListener((map) => {
				//接收自定义消息
				this.setState({
					pushMsg: map.message
				});
				console.log('extras: ' + map.extras);
			});
			//监听通知
			JPushModule.addReceiveNotificationListener((map) => {
				//收到推送消息
			});

			JPushModule.addReceiveOpenNotificationListener((map) => {
				//点击通知事件
				let obj = JSON.parse(map.extras);
				if (obj) {
					if (obj.type == 'msg') {
						//聊天消息
					} else if (obj.type == 'news' && this.notificationClickEnable) {
						this.notificationClickEnable = false;
						//新闻
						let isimg = parseInt(obj.isimg);
						let aid = obj.aid;
						this.nav.navigate('newsView', {
							id: aid,
							type: isimg,
							tid: 0,
							item: { id: aid, uptime: 0 }
						});
						this.timer = setTimeout(() => {
							this.notificationClickEnable = true;
						}, 1000);
					}
				}
			});

			JPushModule.addGetRegistrationIdListener((registrationId) => {
				//注册id监听registrationId
				console.log('Device register succeed, registrationId ' + registrationId);
			});

			this.setTags();
		}
		JPushModule.getRegistrationID((registrationId) => {
			console.log('Device register succeed, registrationId ' + registrationId);
			Location.registrationid = registrationId;
		});
	}

	//设置标签
	setTags = async () => {
		let array = new Array();
		if (user.IsLogin() && user.IsJoinCircle()) {
			let arr = await user.GetUserTag();
			if (arr && arr.length > 0) {
				array = arr;
			}
		}

		array.push('语音');
		if (!config.Release) {
			array.push('测试');
		}

		JPushModule.setTags(array, (success) => {
			console.log(array);
			//Alert.alert(JSON.stringify(array));
		});
	};

	logined = () => {
		//Alert.alert('登录成功');
		this.setTags();
	};
	logouted = () => {
		//Alert.alert('登出成功');
		this.setTags();
	};
	//获取当前位置 并存到Location中，给newsList获取新闻列表调用
	GetLocation = async () => {
		let position = await device.GetCurrentPosition(false);
		if (position) {
			try {
				let coords = position.coords;
				Location.latitude = coords.latitude;
				Location.longitude = coords.longitude;
			} catch (e) {
				if (__DEV__) {
					console.log(e);
				}
			}
		}
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//移除用户修改圈子事件订阅
		event.UnSub(this);
		//移除极光监听
		if (Platform.OS === 'android') {
			JPushModule.removeReceiveCustomMsgListener(receiveCustomMsgEvent);
			JPushModule.removeGetRegistrationIdListener(getRegistrationIdEvent);
			JPushModule.clearAllNotifications();
			//移除android物理返回键事件
			BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		}
		JPushModule.removeReceiveNotificationListener(receiveNotificationEvent);
		JPushModule.removeReceiveOpenNotificationListener(openNotificationEvent);
		this.timer && clearTimeout(this.timer);
	}

	//加载所有分类
	async GetAllClass() {
		let self = await cache.LoadFromFile(config.NewsSelfClassCachekey);
		if (self) {
			//设置过个人分类优先显示
			this.setState({ tabs: self });
		} else {
			//获取服务器所有分类
			let result = await net.ApiPost('article', 'GetAllClass');
			if (result != null && result.status == 1) {
				let data = result.data.sort(function(a, b) {
					//升序排序
					return a.ordernum - b.ordernum;
				});
				this.setState({ tabs: data });
				cache.SaveToFile(config.NewsAllClassCachekey, data);
				//console.log('请求的分类结果:' + JSON.stringify(result.data));
			} else {
				//网络异常则加载缓存分类
				let all = await cache.LoadFromFile(config.NewsAllClassCachekey);
				if (all) {
					this.setState({ tabs: all });
				} else {
					Alert.alert('网络异常!');
				}
			}
		}
	}

	//点击编辑标签
	_onPressEditLabel = () => {
		this.nav.navigate('editLabel', { tabs: this.state.tabs });
	};

	//切换标签
	ChangeTabsed = (index) => {
		if (this.tabView) this.tabView.goToPage(index);
	};
	//重新绑定
	RebindTabs = (tabs) => {
		this.setState({ tabs: tabs });
	};
	_Content() {
		if (this.state.tabs.length == 0) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text>正在加载分类数据...</Text>
				</View>
			);
		} else {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'flex-start'
					}}
				>
					<ScrollableTabView
						ref={(tabView) => {
							this.tabView = tabView;
						}}
						//style={{}}
						onChangeTab={(arg) => {
							if (arg.i == arg.from) {
								//如果点击当列表对应的当前标签，则刷新该列表
								event.Send(event.Events.news.ClickTabsForRefresh, arg.ref.props.id);
							}
						}}
						onScroll={(position) => {
							//console.log('position===' + position);
						}}
						tabBarBackgroundColor="#FFF"
						tabBarActiveTextColor="#4BC1D2"
						tabBarInactiveTextColor="#5C5C5C"
						//tabBarTextStyle={{}}
						tabBarUnderlineStyle={{ height: 0, backgroundColor: '#4BC1D2' }}
						scrollWithoutAnimation={false}
						prerenderingSiblingsNumber={1}
						initialPage={0}
						renderTabBar={() => (
							<ScrollableTabBar
								tabStyle={{ height: 32, paddingLeft: 10, paddingRight: 10 }}
								style={{
									height: 32,
									width: width - 35,
									//paddingRight: 35,
									borderWidth: 1,
									borderColor: '#f3f3f3',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							/>
						)}
					>
						{this.state.tabs.map((c, i) => {
							return (
								<StandardList
									navigation={this.props.navigation}
									tabLabel={c.name}
									key={c.id}
									id={c.id}
								/>
							);
						})}
					</ScrollableTabView>
					<View
						style={{
							position: 'absolute',
							right: 5,
							top: 0,
							backgroundColor: '#ffffff00'
						}}
					>
						<TouchableWithoutFeedback onPress={this._onPressEditLabel}>
							<View style={{ height: 44, width: 44, paddingLeft: 10, backgroundColor: '#ffffff00' }}>
								<Image
									style={{ height: 32, width: 32 }}
									source={require('../../img/news/addimg.png')}
								/>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</View>
			);
		}
	}

	/**
   * 引导图点击事件
   *
   * @memberof NewsIndex
   */
	guideImageClick = () => {
		if (
			this.state.guideImage == image.version.guideFirst_ios ||
			this.state.guideImage == image.version.guideFirst_ad
		) {
			this.setState({
				guideImage: Platform.OS == 'ios' ? image.version.guideSecond_ios : image.version.guideSecond_ad
			});
		} else {
			this.setState({ guideViewShow: false });
		}
	};

	/**
   * '立即升级'按钮点击事件
   *
   * @memberof NewsIndex
   */
	appUpdate = () => {
		if (this.state.upgrade && this.state.upgrade.Url) {
			Linking.canOpenURL(this.state.upgrade.Url)
				.then((supported) => {
					if (!supported) {
						Alert.alert('您的设备不支持该操作');
					} else {
						return Linking.openURL(this.state.upgrade.Url);
					}
				})
				.catch((err) => console.log(err));
		}
	};

	/**
   * 关闭升级提示
   *
   * @memberof NewsIndex
   */
	closeUpdateTip = () => {
		if (this.state.upgrade) {
			if (this.state.upgrade.IsCancel) {
				this.setState({ upgradeViewShow: false });
			} else {
				BackHandler.exitApp(); //在强制升级时Android按物理返回键直接退出
			}
		}
	};

	/**
   * 版本更新界面
   *
   * @memberof NewsIndex
   */
	modalView() {
		if (this.state.upgradeViewShow) {
			//版本升级提示框
			return (
				<Modal
					visible={this.state.upgradeViewShow}
					transparent={true} //透明背景
					animationType={'none'} //无弹出动画
					onRequestClose={() => this.closeUpdateTip()} //Android物理返回键相应
				>
					<View
						style={{
							flex: 1,
							backgroundColor: skin.translucentColor,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								width: 290,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Image source={image.version.upgradeTop} style={{ width: 290 }} />

							<View
								style={{
									top: 60,
									height: 40,
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: skin.transparentColor,
									position: 'absolute'
								}}
							>
								<Text style={{ fontSize: 16, color: skin.tint }}>
									{this.state.upgrade ? this.state.upgrade.Title : '版本升级'}{' '}
								</Text>
							</View>

							<View
								style={{
									top: 45,
									width: 40,
									height: 40,
									right: 10,
									backgroundColor: skin.transparentColor,
									justifyContent: 'center',
									alignItems: 'flex-end',
									position: 'absolute'
								}}
							>
								<TouchableHighlight
									onPress={() => this.closeUpdateTip()} //关闭升级提示
									activeOpacity={1}
									underlayColor={skin.transparentColor}
								>
									<View>
										<Image
											source={
												this.state.upgrade ? this.state.upgrade.IsCancel == true ? (
													image.version.close
												) : null : null
											}
											resizeMode="center"
											style={{ width: 24, height: 24 }}
										/>
									</View>
								</TouchableHighlight>
							</View>

							<View style={{ width: 290, backgroundColor: skin.tint }}>
								<Text
									style={{
										marginLeft: 30,
										marginRight: 20,
										marginTop: 20,
										fontSize: 12,
										minHeight: 60
									}}
								>
									{this.state.upgrade ? this.state.upgrade.Content : ''}
								</Text>
								<TouchableHighlight
									onPress={() => this.appUpdate()}
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									style={{
										marginTop: 10,
										marginLeft: 50,
										marginRight: 50,
										marginBottom: 10,
										height: 40,
										width: 190,
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
											width: 190,
											borderRadius: 5,
											backgroundColor: skin.activeTint
										}}
									>
										<Text style={{ fontSize: 16, color: skin.tint }}>立即升级</Text>
									</View>
								</TouchableHighlight>
							</View>
							<Image source={image.version.upgradeBottom} style={{ width: 290 }} />
						</View>
					</View>
				</Modal>
			);
		} else if (this.state.guideViewShow) {
			//引导页面
			return (
				<Modal
					style={Platform.OS == 'ios' ? { width: width, height: height } : { flex: 1 }}
					visible={this.state.guideViewShow}
					transparent={true} //透明背景
					animationType={'none'} //无弹出动画
					onRequestClose={() => this.setState({ guideViewShow: false })} //Android物理返回键相应
				>
					<TouchableHighlight
						onPress={() => this.guideImageClick()}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
						style={Platform.OS == 'ios' ? { width: width, height: height } : { flex: 1 }}
					>
						<View style={Platform.OS == 'ios' ? { width: width, height: height } : { flex: 1 }}>
							<Image
								source={this.state.guideImage}
								style={Platform.OS == 'ios' ? { width: width, height: height } : { flex: 1 }}
								resizeMode={'stretch'}
							/>
						</View>
					</TouchableHighlight>
				</Modal>
			);
		} else {
			return null;
		}
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: '#FFF' }}>
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'flex-start'
					}}
				>
					<View style={{ flex: 1 }}>{this._Content()}</View>
				</View>
				{this.modalView()}
			</View>
		);
	}
}
