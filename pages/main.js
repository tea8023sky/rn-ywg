/**
 * 业务GO React Native实现版本
 */
import Storage from 'react-native-storage'; //存储组件
import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	View,
	Image,
	AsyncStorage,
	NativeModules,
	Easing,
	Animated,
	PermissionsAndroid,
	Platform,
	Text
} from 'react-native';
import News from './news/newsIndex';
import NewsSearch from './news/newsSearch';
import EditLabel from './news/editLabel';
import FastDetail from './news/fastDetail';
import Chat, { ChatView, SearchChatUser, GroupSetting, GroupMember, MultipleChoice } from './chat/chatIndexView';
import Tool from './tool/toolIndex';
import JCMain from './tool/calculate/jcMain';
import OtherMain from './tool/calculate/otherMain';
import JCSelect from './tool/calculate/jcSelect';
import TotalListView from './tool/calculate/totalListView';
import ResultImage from './tool/calculate/resultImage';
import Statement from './tool/material/statement';
import MaterialSelect from './tool/material/materialSelect';
import MaterialMain from './tool/material/materialMain';

import { SteelHome } from './tool/other/steelList';
import { CollectHome } from './tool/other/collectList';
import { SteelSearchHome } from './tool/other/steelSearch';
import { ProvinceHome } from './tool/other/selectProvince';

import { ECHome } from './tool/other/eContractMain';
import ECStatement from './tool/other/eCStatement';
import { AddContract } from './tool/other/addContract';
import AddContractPrompt from './tool/other/addContractPrompt';
import { ContractDetail } from './tool/other/eContractDetail';
import { EContractImage } from './tool/other/eContractImage';
import EContractBigImg from './tool/other/eContractBigImg';

import OfferMain from './tool/other/offerMain';
import AddOffer from './tool/other/addOffer';
import AddOfferSelect from './tool/other/addOfferSelect';
import CreateOfferImg from './tool/other/createOfferImg';
import OfferPreviewImg from './tool/other/offerPreviewImg';
import PreviewBigImg from './tool/other/previewBigImg';

import My, { Setting, CommonProblem, MyOfferCode, Feedback, MyCollection, TextView, AddCollection } from './my/myIndex';
import {
	UserInfoUpdata,
	UpdataMobileOldCheck,
	UpdataMobileNewCheck,
	UpdataInfo,
	UpdataSteelMills,
	UpdataSteelName
} from './my/userInfoUpdata';

import MyCollectSearch from './my/myCollectSearch';
import SteelCollectSearch from './my/steelCollectSearch';
import Header from './header';
import { NewsView } from './news/newsView';
import { StackNavigator, TabNavigator } from 'react-navigation';
import Login, { ForgetPassWord, UpdataPassWord } from './my/login';
import Reg, { UserAgreement } from './my/reg';
import PerfectUserInfo, { UpdataCoterie, SearchCircle } from './my/perfectUserInfo';
import Icon from 'react-native-vector-icons/Ionicons';
import tc from '../logic/transitionConfigs';
import skin from '../style';
import Userdynamic from './my/userdynamic';
import DynamicImgs from './my/dynamicImgs';
import ImgsCanDel from './my/imgsCanDel';
import Dynamic from './chat/dynamic';
import Dynews, { DetailNew } from './chat/dynews';
import DetailsInfo from './chat/detailsInfo';
import Publish from './chat/publish';
import user from '../logic/user';
import Device from '../logic/device';
import event from '../logic/event';
import Advertising from '../pages/advertising';
import chatService from '../logic/chat';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-root-toast';

//存储对象
var storage = new Storage({
	// 最大容量，默认值1000条数据循环存储
	size: 1000,

	// 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
	// 如果不指定则数据只会保存在内存中，重启后即丢失
	storageBackend: AsyncStorage,

	// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
	defaultExpires: null,

	// 读写时在内存中缓存数据。默认启用。
	enableCache: true

	// 如果storage中没有相应数据，或数据已过期，
	// 则会调用相应的sync方法，无缝返回最新数据。
	// sync方法的具体说明会在后文提到
	// 你可以在构造函数这里就写好sync的方法
	// 或是在任何时候，直接对storage.sync进行赋值修改
	// 或是写到另一个文件里，这里require引入
	//sync: require('你可以另外写一个文件专门处理sync')
});
//存储对象放到全局对象中
global.storage = storage;
//注册友盟统计到全局变量中
global.umeng = NativeModules.UmengNativeModule;
//给string附加replaceAll方法
String.prototype.replaceAll = function(FindText, RepText) {
	let regExp = new RegExp(FindText, 'g');
	return this.replace(regExp, RepText);
};

class Route {
	static getRouteName() {
		let ADData = chatService.getAdvertising();
		let ADList = [];
		if (ADData && ADData.length > 0) {
			if (__DEV__) {
				console.log('Route加载广告成功');
			}
			let nowTime = new Date().getTime(); //当前时间戳（毫秒）
			for (let i = 0; i < ADData.length; i++) {
				//过滤出有效广告
				if (ADData[i].stime * 1000 < nowTime && ADData[i].etime * 1000 > nowTime) {
					return 'advertising';
					break;
				}
			}
		} else {
			return 'home';
		}
	}

	static getIOSModel() {
		let isSmallScreen = false;
		if (
			DeviceInfo.getModel() == 'iPhone 5s' ||
			DeviceInfo.getModel() == 'iPhone SE' ||
			DeviceInfo.getModel() == 'iPhone 6' ||
			DeviceInfo.getModel() == 'iPhone 6s' ||
			DeviceInfo.getModel() == 'iPhone 7' ||
			DeviceInfo.getModel() == 'iPhone 8'
		) {
			isSmallScreen = true;
		}
		return isSmallScreen;
	}
}

let routeName = Route.getRouteName();
let isIOSSmallScreen = Route.getIOSModel();

const TabNav = TabNavigator(
	{
		news: {
			screen: News,
			navigationOptions: {
				tabBarLabel: '热点',
				tabBarIcon: ({ tintColor, focused }) => <Icon name="md-flame" size={26} color={tintColor} />
			}
		},
		chat: {
			screen: Chat,
			navigationOptions: {
				tabBarLabel: '圈子',
				tabBarIcon: ({ tintColor, focused }) => <ChatIcon color={tintColor} />,
				tabBarOnPress: async (Route, jumpToIndex) => {
					//Route.previousScene  正在显示的页面 previousScene:Object {key: "news", routeName: "news"}
					//Route.scene  将要跳转的页面  scene:Object {route: Object, focused: false, index: 1}    route：Object {key: "chat", routeName: "chat", params: Object}
					//进行登录及完善资料判断
					let logined = await user.IsLogin(); //获取当前用户登录状态
					let joinCircle = await user.IsJoinCircle();
					if (__DEV__) {
						console.log('next scene:' + JSON.stringify(Route.scene.route));
					}
					if (logined && joinCircle) {
						// 只有调用jumpToIndex方法之后才会真正的跳转页面。
						Route.jumpToIndex(Route.scene.index);
					} else if (logined && !joinCircle) {
						//跳转完善资料页面
						Route.scene.route.params.myNavigation.navigate('perfectUserInfo');
					} else {
						//跳转登录页面
						Route.scene.route.params.myNavigation.navigate('login');
					}
				}
				// tabBarOnPress: async ({ route, index }, jumpToIndex) => {
				// 	//进行登录及完善资料判断
				// 	let logined = await user.IsLogin(); //获取当前用户登录状态
				// 	let joinCircle = await user.IsJoinCircle();
				// 	if (__DEV__) {
				// 		console.log('route:' + JSON.stringify(route));
				// 	}
				// 	if (logined && joinCircle) {
				// 		// 只有调用jumpToIndex方法之后才会真正的跳转页面。
				// 		jumpToIndex(index);
				// 	} else if (logined && !joinCircle) {
				// 		//跳转完善资料页面
				// 		route.params.myNavigation.navigate('perfectUserInfo');
				// 	} else {
				// 		//跳转登录页面
				// 		route.params.myNavigation.navigate('login');
				// 	}
				// }
			}
		},
		tool: {
			screen: Tool,
			navigationOptions: {
				tabBarLabel: '工具',
				tabBarIcon: ({ tintColor, focused }) => <Icon name="ios-briefcase" size={26} color={tintColor} />
			}
		},
		my: {
			screen: My,
			navigationOptions: {
				tabBarLabel: '我的',
				tabBarIcon: ({ tintColor, focused }) => <Icon name="ios-contact" size={26} color={tintColor} />
			}
		}
	},
	{
		tabBarPosition: 'bottom', //tab的位置
		initialRouteName: 'news', //初始加载
		animationEnabled: false, //禁用切换的动画
		swipeEnabled: false, //禁止滑动切换
		tabBarOptions: {
			activeTintColor: skin.activeTint, //激活选项卡的tintcolor
			inactiveTintColor: skin.inactiveTint, //非激活选项卡的tintcolor
			showIcon: true, //显示图标,安卓下默认是false
			indicatorStyle: { height: 0 }, //禁用安卓的选中选项卡的下划线
			style: {
				height: 49,
				backgroundColor: skin.background,
				borderTopWidth: 1,
				borderTopColor: skin.darkSeparate
			},
			labelStyle: {
				fontSize: 10,
				marginTop: Platform.OS == 'ios' ? (isIOSSmallScreen == true ? -3 : 12) : 0,
				marginBottom: 5
			},
			iconStyle: {},
			tabStyle: {
				marginTop: Platform.OS == 'ios' ? (isIOSSmallScreen == false ? 15 : 0) : 0,
				flexDirection: 'column',
				justifyContent: 'center'
			}
		}
	}
);

/**
 * 圈子Icon
 *
 * @export
 * @class ChatIcon
 * @extends {Component}
 */
export class ChatIcon extends Component {
	constructor(props) {
		super(props);
		this.data = {
			color: this.props.color
		};
		this.state = {
			numStr: ''
		};
	}

	//组件初始化完毕
	componentDidMount() {
		//订阅
		event.Sub(this, event.Events.main.chatIconNum, this.setNumStr);
	}

	//设置未读消息数
	setNumStr = (numStr) => {
		this.setState({ numStr: numStr });
	};

	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	/**
   * 根据未读消息数设置字体大小
   *
   */
	getNumberFontSize(number) {
		if (number != '' && number != '99+') {
			if (Number(number) > 99) {
				return 8;
			} else {
				return 9;
			}
		}
		return 6;
	}

	render() {
		if (this.state.numStr == '') {
			return <Icon name="md-aperture" size={26} color={this.data.color} />;
		} else {
			return (
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Icon name="md-aperture" size={26} color={this.data.color} />
					<View
						style={{
							position: 'absolute',
							flexDirection: 'column',
							justifyContent: 'flex-start',
							alignItems: 'flex-end',
							paddingBottom: Platform.OS == 'ios' ? 15 : 10,
							flex: 1
						}}
					>
						<View
							style={{
								backgroundColor: skin.red,
								justifyContent: 'center',
								alignItems: 'center',
								width: Platform.OS == 'ios' ? 16 : 12,
								height: Platform.OS == 'ios' ? 16 : 12,
								marginLeft: Platform.OS == 'ios' ? 16 : 10,
								marginTop: Platform.OS == 'ios' ? 2 : 0,
								borderRadius: 8
							}}
						>
							<Text
								style={{
									fontSize: this.getNumberFontSize(this.state.numStr),
									color: skin.tint,
									textAlign: 'center',
									textAlignVertical: 'center'
								}}
							>
								{this.state.numStr}
							</Text>
						</View>
					</View>
				</View>
			);
		}
	}
}

// 注册导航
const Navs = StackNavigator(
	{
		home: {
			screen: TabNav
		},
		newsView: {
			screen: NewsView
		},
		login: {
			screen: Login
		},
		reg: {
			//注册
			screen: Reg
		},
		userAgreement: {
			//注册-用户协议
			screen: UserAgreement
		},
		perfectUserInfo: {
			//注册-完善资料
			screen: PerfectUserInfo
		},
		updataCoterie: {
			//我的-圈子
			screen: UpdataCoterie
		},
		newssearch: {
			//新闻搜索
			screen: NewsSearch
		},
		editLabel: {
			//标签编辑
			screen: EditLabel
		},
		fastDetail: {
			//标签编辑
			screen: FastDetail
		},
		setting: {
			//我的-设置
			screen: Setting
		},
		forgetPassWord: {
			//登录-忘记密码
			screen: ForgetPassWord
		},
		updataPassWord: {
			//我的-修改密码
			screen: UpdataPassWord
		},
		searchCircle: {
			//我的-圈子-搜索圈子
			screen: SearchCircle
		},
		commonProblem: {
			//我的-常见问题
			screen: CommonProblem
		},
		userInfoUpdata: {
			//我的-修改资料（个人资料）
			screen: UserInfoUpdata
		},
		myOfferCode: {
			//我的-我的邀约码
			screen: MyOfferCode
		},
		updataMobileOldCheck: {
			//我的-修改资料-更改手机号-旧号验证
			screen: UpdataMobileOldCheck
		},
		updataMobileNewCheck: {
			//我的-修改资料-更改手机号-新号验证绑定
			screen: UpdataMobileNewCheck
		},
		updataInfo: {
			//我的-修改资料（姓名、公司简称、公司全称、办公地点、固定电话）
			screen: UpdataInfo
		},
		updataSteelMills: {
			//我的-修改资料-选择钢厂
			screen: UpdataSteelMills
		},
		updataSteelName: {
			//我的-修改资料-选择品名
			screen: UpdataSteelName
		},
		feedback: {
			//我的-意见反馈
			screen: Feedback
		},
		myCollection: {
			//我的-收藏
			screen: MyCollection
		},
		//我的-收藏-我的收藏查询
		myCollectSearch: {
			screen: MyCollectSearch
		},
		jcMain: {
			//工具--建材计算器
			screen: JCMain
		},
		otherMain: {
			//工具--板材 型材 管材 计算器 主页
			screen: OtherMain
		},
		jcSelect: {
			//工具--建材计算器--钢厂品名规格 选择
			screen: JCSelect
		},
		totalListView: {
			//工具--建材计算器-查看累计详情
			screen: TotalListView
		},
		resultImage: {
			//工具--查看累计详情--查看图片
			screen: ResultImage
		},
		statement: {
			//工具--材质书--免责声明
			screen: Statement
		},
		materialSelect: {
			//工具--材质书--选择钢厂 品名 规格
			screen: MaterialSelect
		},
		materialMain: {
			//工具--材质书--材质书
			screen: MaterialMain
		},
		textView: {
			//我的-收藏-纯文本 或者 聊天纯文本消息
			screen: TextView
		},
		userdynamic: {
			//我的-动态
			screen: Userdynamic
		},
		dynamicImgs: {
			//我的-动态-大图轮播图片(只有查看功能)
			screen: DynamicImgs
		},
		imgsCanDel: {
			//我的-动态-上传图片后的大图轮播(可以删除)
			screen: ImgsCanDel
		},
		dynamic: {
			//圈子-动态
			screen: Dynamic
		},
		publish: {
			//圈子-发表动态
			screen: Publish
		},
		detailsInfo: {
			//圈子-动态-点击头像
			screen: DetailsInfo
		},
		dynews: {
			//圈子-动态--->顶部消息列表
			screen: Dynews
		},
		detailNew: {
			//消息详情
			screen: DetailNew
		},
		steelHome: {
			//工具-钢企名录
			screen: SteelHome
		},
		collectHome: {
			//工具-钢企名录-收藏页面
			screen: CollectHome
		},
		steelCollectSearch: {
			//工具-钢企名录-收藏页面-钢企名录查询
			screen: SteelCollectSearch
		},
		steelSearch: {
			//工具-钢企名录-搜索
			screen: SteelSearchHome
		},
		selectProvince: {
			//工具-钢企名录-选择省份
			screen: ProvinceHome
		},
		//工具-电子合同
		eContractMain: {
			screen: ECHome
		},
		//工具-电子合同-电子合同声明
		eCStatement: {
			screen: ECStatement
		},
		//工具-电子合同-添加合同
		addContract: {
			screen: AddContract
		},
		//工具-电子合同-添加合同-完成
		addContractPrompt: {
			screen: AddContractPrompt
		},
		//工具-电子合同-电子合同详情页
		eContractDetail: {
			screen: ContractDetail
		},
		//工具-电子合同-图片展示（生成的电子合同）
		eContractImage: {
			screen: EContractImage
		},
		//工具-电子合同-图片展示（生成的电子合同）-点击小图查看大图
		eContractBigImg: {
			screen: EContractBigImg
		},
		//工具-报价单页面
		offerMain: {
			screen: OfferMain
		},
		//工具-报价单-添加
		addOffer: {
			screen: AddOffer
		},
		//工具-报价单-添加-选择钢厂、品名、库存
		addOfferSelect: {
			screen: AddOfferSelect
		},
		//工具-报价单-生成图片
		createOfferImg: {
			screen: CreateOfferImg
		},
		//工具-报价单-生成图片-图片预览
		offerPreviewImg: {
			screen: OfferPreviewImg
		},
		//工具-报价单-生成图片-图片预览-查看大图
		previewBigImg: {
			screen: PreviewBigImg
		},
		chatView: {
			//聊天对话页面
			screen: ChatView
		},
		searchChatUser: {
			//用户搜索页面
			screen: SearchChatUser
		},
		groupSetting: {
			//圈子设置页面
			screen: GroupSetting
		},
		groupMember: {
			//圈子成员查看
			screen: GroupMember
		},
		addCollection: {
			//我的-收藏-添加收藏
			screen: AddCollection
		},
		multipleChoice: {
			//多选页面
			screen: MultipleChoice
		},
		advertising: {
			//广告页面
			screen: Advertising
		}
	},
	{
		// initialRouteName: 'home', //默认
		initialRouteName: routeName,
		headerMode: 'screen', //导航条模式,每个界面独自导航条
		navigationOptions: {
			headerStyle: {
				backgroundColor: skin.main, //导航条背景色
				height: 60 //导航条高度,40导航条高度+20沉侵高度
			},
			headerBackTitle: '返回', //返回按钮文字
			headerTintColor: skin.tint, //当好条内容颜色
			gesturesEnabled: false //是否开启手势关闭
		}
		// transitionConfig: tc.SlideFromRight//页面加载动画
	}
);

class App extends Component {
	getRouteName(state) {
		if (state == null) {
			return null;
		}
		let index = state.index;
		let route = state.routes[index];
		if (route.hasOwnProperty('routes')) {
			return route.routeName + '/' + this.getRouteName(route);
		}
		return route.routeName;
	}

	constructor(props) {
		super(props);
		this.state = {
			exitApp: false //是否退出App
		};
	}

	_onNavigationStateChange = (prevState, newState) => {
		let prevRouteName = this.getRouteName(prevState);
		let newRouteName = this.getRouteName(newState);
		console.log('prevRouteName:' + prevRouteName + ',newRouteName:' + newRouteName);
		if (prevRouteName != null) {
			umeng.onPageEnd(prevRouteName);
		}
		if (newRouteName != null) {
			umeng.onPageBegin(newRouteName);
		}

		if (newRouteName != null && newRouteName == 'home/news') {
			this.setState({ exitApp: true });
		} else {
			this.setState({ exitApp: false });
		}
	};
	render() {
		return (
			<Navs id={View.NO_ID} onNavigationStateChange={this._onNavigationStateChange} screenProps={this.state} />
		);
	}
}
umeng.onPageBegin(routeName == 'advertising' ? 'advertising' : 'home/news');
// umeng.onPageBegin('home/news');
AppRegistry.registerComponent('yewugo', () => App);
