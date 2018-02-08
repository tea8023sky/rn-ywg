import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ScrollView, Image, Linking, TouchableOpacity } from 'react-native';
import skin from '../../style';
import image from '../../logic/image';
import TimeUtil from '../../logic/TimeUtil';
import user from '../../logic/user';
import net from '../../logic/net';
import event from '../../logic/event';
import Regular from '../../logic/regular';
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/Ionicons';
let { width, height } = Dimensions.get('window');

/**
 * 圈子-动态--->动态(未读)消息列表
 *
 * @author zhengyeye
 * @export
 * @class dynews
 * @extends {Component}
 */
export default class Dynews extends Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: '消息',
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
				underlayColor={skin.activeTint}
				onPress={() => navigation.state.params.clickClear()}
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					paddingRight: 10
				}}
			>
				<View>
					<Text style={{ color: skin.tint, fontSize: 14 }}>清空</Text>
				</View>
			</TouchableHighlight>
		)
	});

	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.state = {
			list: [] //未读消息列表数据
		};
	}

	//组件初始化完毕
	componentDidMount() {
		let list = this.params.list;
		this.setState({
			list: list
		});
		// 订阅消息列表更新事件
		event.Sub(this, event.Events.dynamic.newsList, this.updateList);
		this.props.navigation.setParams({
			clickClear: this._clear, //清空按钮点击事件
			goBackPage: this._goBackPage
		});
	}

	//清空按钮触发的点击事件
	_clear = () => {
		this.setState({
			list: []
		});
	};

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//订阅事件后触发的function
	updateList = item => {
		//成功订阅后，需要将此id从旧数据中删掉
		index = item.index; //动态消息列表的下标
		let listdata = this.state.list; //之前的旧数据
		for (let i = 0, len = listdata.length; i < len; i++) {
			if (i === index) {
				listdata.splice(i, 1);
				break;
			}
		}
		this.setState({
			//给消息列表重新赋值
			list: listdata
		});
	};

	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	//点击消息进入消息详情页面并订阅消息详情页更新事件  item.id---->是动态消息的id
	_detail = async (item, index) => {
		//dynewCount: 未读消息列表消息条数
		this.nav.navigate('detailNew', { data: item, dynewCount: this.state.list.length - 1 });
		event.Send(event.Events.dynamic.newsList, { index: index });
	};

	render() {
		if (this.state.list.length == 0) {
			//刚加载，没有数据的时候
			return <View style={{ backgroundColor: '#fff' }} />;
		} else {
			//数据加载完毕后
			return (
				<ScrollView style={{ backgroundColor: '#fff' }}>
					{this.state.list.map((item, i) => {
						//item:每一项的具体内容  i:是下标
						return (
							<TouchableOpacity
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								key={i}
								onPress={() => this._detail(item, i)}
							>
								<View key={i} style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											flex: 1,
											paddingVertical: 10,
											paddingHorizontal: 12
										}}
									>
										<Image
											style={{
												height: 40,
												width: 40,
												borderRadius: 20,
												borderWidth: 1,
												borderColor: '#EAE8E8'
											}}
											source={{
												uri: item.img.split(',')[0]
											}}
										/>
									</View>
									<View
										style={{
											flex: 2,
											flexDirection: 'column',
											alignItems: 'flex-start',
											marginTop: 10
										}}
									>
										<Text
											style={{
												fontSize: 16,
												color: '#247A86'
											}}
										>
											{item.name}
										</Text>

										<Text
											style={{
												color: '#777'
											}}
										>
											{item.createtime}
										</Text>
									</View>
									<View
										style={{
											flex: 3,
											alignItems: 'flex-end',
											marginTop: 10,
											marginRight: 10,
											marginBottom: 10
										}}
									>
										{item.dynamic.imgs ? (
											<Image
												style={{
													height: 80,
													width: 80,
													borderWidth: 1,
													borderColor: '#EAE8E8'
												}}
												source={{
													uri: item.dynamic.imgs.split(',')[0]
												}}
											/>
										) : (
											<Text>{item.dynamic.content.slice(0, 10)}</Text>
										)}
									</View>
								</View>
								<View
									style={{
										height: 1,
										backgroundColor: skin.lightSeparate
									}}
								/>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			);
		}
	}
}

/**
 * 消息详情
 *
 * @author zhengyeye
 * @export
 * @class DetailNew
 * @extends {Component}
 */
export class DetailNew extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '详细',
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

	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.state = {
			list: [], //详情数据信息
			zanText: '',
			iszan: false,
			myzanlist: [],
			dynewCount: this.params.dynewCount //未读消息列表消息条数
		};
	}
	//组件初始化完毕
	componentDidMount() {
		this.getData(); //给列表赋值
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//自定义返回事件
	_goBackPage = () => {
		if (this.state.dynewCount == 0) {
			//消息列表条数为0
			this.nav.navigate('chat', {
				chatSelected: false,
				dySelected: true
			});
		} else {
			//消息列表条数不为0，则返回上一页
			this.nav.goBack();
		}
	};

	//根据圈子id获取消息详细列表信息
	getData = async () => {
		let result = await _GetDynamicbyId(this.params.data.cid);
		if (result != null && result.status == 1) {
			let zanlist = result.data.zanlist; //点赞列表
			let zanText = '';
			let iszan = false;
			let userInfo = await user.GetUserInfo(); //获取个人信息
			let userId = userInfo.id; //当前登录用户id
			for (let i = 0, len = zanlist.length; i < len; i++) {
				if (i == zanlist.length - 1) {
					zanText += zanlist[i].rzname;
				} else {
					zanText += zanlist[i].rzname + ',';
				}
				if (zanlist[i].uid == userId) {
					iszan = true;
				}
			}
			this.setState({
				zanText: zanText,
				iszan: iszan,
				myzanlist: zanlist,
				userId: userId, //当前用户id
				list: result.data
			});
		} else {
			Toast.show('获取详细信息失败,请稍后重试.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
	};

	_openUrl = () => {
		let isUrl = Regular.hasHttp(this.state.list.link);
		if (isUrl) {
			return Linking.openURL(this.state.list.link);
		} else {
			return Linking.openURL('http://' + this.state.list.link);
		}
	};

	/**
	 * 点赞 OR 取消点赞
	 *
	 * @memberof DynamicTextImgsItem
	 */
	_onPresslike = async () => {
		let zanarr = this.state.myzanlist; //点赞集合list
		let iszan = false; //默认未点赞
		let zanText = ''; //点赞列表上显示的名称
		let newZanArr = []; //最终的新数组(增加/减少后的)
		let userInfo = await user.GetUserInfo(); //获取个人信息
		let userId = userInfo.id; //当前登录用户id

		if (this.state.iszan) {
			let afterdzdata = await _delzandata(userId, this.state.list.id);
			iszan = false;
			if (afterdzdata != null && afterdzdata.status == 1) {
				//取消点赞成功,如果为true，则从zanarr中移除这一项
				let temp = {
					uid: userId
				};
				for (let i = 0, len = zanarr.length; i < len; i++) {
					if (zanarr[i].uid != temp.uid) {
						newZanArr.push({
							uid: zanarr[i].uid,
							rzname: zanarr[i].rzname,
							time: zanarr[i].time,
							cid: zanarr[i].cid
						});
					}
				}
			}
		} else {
			let afterdzdata = await _addzandata(userId, this.state.list.id);
			iszan = true;
			if (afterdzdata != null && afterdzdata.status == 1) {
				//点赞成功 如果为false，则从zanarr中增加这一项
				let userInfo = await user.GetUserInfo(); //获取个人信息
				let temp = {
					uid: userId,
					rzname: userInfo.name,
					time: parseInt(new Date().getTime() / 1000),
					cid: this.state.list.id
				};
				newZanArr = zanarr.concat(temp);
			}
		}
		let zanlength = newZanArr.length;
		for (let i = 0, len = newZanArr.length; i < len; i++) {
			if (i == newZanArr.length - 1) {
				zanText += newZanArr[i].rzname;
			} else {
				zanText += newZanArr[i].rzname + ',';
			}
		}
		this.setState({
			zanText: zanText,
			iszan: iszan,
			myzanlist: newZanArr
		});
		event.Send(event.Events.dynamic.giveZan); //点赞过后，通知动态列表页
	};
	render() {
		if (this.state.list.length == 0) {
			return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
		} else {
			return (
				<View
					style={{
						flex: 1,
						backgroundColor: '#fff'
					}}
				>
					<View
						style={{
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'row'
						}}
					>
						<View
							style={{
								flex: 1
							}}
						>
							<Image
								style={{
									height: 40,
									width: 40,
									borderRadius: 20,
									borderWidth: 1,
									borderColor: '#EAE8E8'
								}}
								source={{
									uri: this.state.list.img.split(',')[0]
								}}
							/>
						</View>

						<View style={{ flexDirection: 'column', flex: 6 }}>
							<Text
								style={{
									fontSize: 16,
									color: '#247A86'
								}}
							>
								{this.state.list.name}
							</Text>

							<Text
								style={{
									color: '#777'
								}}
							>
								{TimeUtil.getTime(this.state.list.createtime, 'hh:mm')}
							</Text>

							{this.state.list.content ? (
								<Text
									style={{
										fontSize: 14,
										color: '#5c5c5c',
										marginBottom: 5,
										marginBottom: 5
									}}
								>
									{this.state.list.content}
								</Text>
							) : null}
							{this.state.list.link ? (
								<Text
									onPress={this._openUrl}
									style={{
										fontSize: 14,
										color: '#5c5c5c'
									}}
								>
									{this.state.list.link}
								</Text>
							) : null}

							<ImageContent imgs={this.state.list.imgs} navigation={this.props.navigation} />
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'flex-end',
									marginTop: 7,
									marginRight: 10,
									marginBottom: 5
								}}
							>
								{this.state.myzanlist.length != 0 ? (
									<View style={{ flexDirection: 'column' }}>
										<TouchableHighlight
											activeOpacity={1}
											underlayColor={skin.transparentColor}
											onPress={this._onPresslike}
										>
											<Image
												style={{
													height: 16,
													width: 16
												}}
												source={
													this.state.iszan == true
														? image.userdynamic.xins
														: image.userdynamic.xink
												}
											/>
										</TouchableHighlight>
									</View>
								) : null}
								<Text
									style={{
										color: '#5c5c5c'
									}}
								>
									{this.state.myzanlist.length != 0 ? this.state.myzanlist.length : ''}
								</Text>
							</View>
							<View
								style={{
									width: width,
									height: 1,
									backgroundColor: '#e0e0e0',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							/>
							{this.state.myzanlist.length != 0 ? (
								<View
									style={{
										flexDirection: 'row',
										marginTop: 11,
										marginRight: 16
									}}
								>
									<Image
										style={{
											height: 16,
											width: 16
										}}
										source={image.userdynamic.xingray}
									/>
									<Text
										style={{
											fontSize: 15,
											color: '#838383'
										}}
									>
										{this.state.zanText}
									</Text>
								</View>
							) : null}
						</View>
					</View>
					<View
						style={{
							height: 15,
							backgroundColor: skin.lightSeparate
						}}
					/>
				</View>
			);
		}
	}
}
/**
 * 九宫格图片展示
 *
 * @author zhengyeye
 * @class ImageContent
 * @extends {Component}
 */
class ImageContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imgs: this.props.imgs,
			simgsArr: [],
			bigimgsArr: []
		};
		this.nav = this.props.navigation;
	}
	//组件加载完毕后
	componentDidMount() {
		if (this.props.imgs != null) {
			let imgsArr = this.props.imgs.split('|'); //图片组成的数组
			let simgsArr = new Array(); //存放小图片
			let bigimgsArr = new Array(); //存放大图片
			for (var i = 0, len = imgsArr.length; i < len; i++) {
				let im = imgsArr[i].split(',');
				simgsArr.push({ index: i, url: imgsArr[i].split(',')[0] });
				bigimgsArr.push({ url: imgsArr[i].split(',')[1] });
			}
			this.setState({
				//大图、小图赋值
				simgsArr: simgsArr,
				bimgsArr: bigimgsArr
			});
		} else {
		}
	}

	ItemPress = index => {
		//点击小图查看大图方法
		this.props.navigation.navigate('dynamicImgs', {
			simgsArr: this.state.simgsArr,
			bimgsArr: this.state.bimgsArr,
			index: index
		});
	};
	render() {
		if (this.props.imgs) {
			return (
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						width: width / 7 * 6 - 16,
						marginRight: 16
					}}
				>
					{this.renderAllImgs()}
				</View>
			);
		} else {
			return null;
		}
	}
	//九宫格图片展示
	renderAllImgs() {
		let allImgs = [];
		let imgsdata = this.state.simgsArr;
		if (imgsdata.length != 0) {
			imgsdata.map((info, i) => {
				var badge = imgsdata[i];
				allImgs.push(
					<View key={i}>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.ItemPress(badge.index)}
						>
							<Image
								style={{
									width: (width / 7 * 6 - 16 - 5 * 4) / 3,
									height: (width / 7 * 6 - 16 - 5 * 4) / 3,
									marginRight: 5,
									marginBottom: 5
								}}
								source={{ uri: badge.url }}
							/>
						</TouchableHighlight>
					</View>
				);
			});
			return allImgs;
		}
	}
}

/**
 * 圈子点赞
 * @param {*int} uid //用户id
 * @param {*int} cid //圈子id
 *
 */
let _addzandata = async function(uid, cid) {
	let result = await net.ApiPost('circledynamic', 'AddDunamicPraise', {
		uid: uid,
		cid: cid
	});
	if (result != null && result.status == 1) {
		return result; //点赞成功status为1
	}
	return null;
};
/**
 * 取消点赞
 * @param {*int} uid 用户id
 * @param {*int} cid 圈子id
 */
let _delzandata = async function(uid, cid) {
	let result = await net.ApiPost('circledynamic', 'DelDunamicPraise', {
		uid: uid,
		cid: cid
	});
	if (result != null && result.status == 1) {
		return result; //取消成功status为1
	}
	return null;
};
/**
 * 根据圈子id获取动态详情
 * @param {*int} did 圈子id
 */
let _GetDynamicbyId = async function(did) {
	let result = await net.ApiPost('circledynamic', 'GetDynamicbyId', {
		did: did
	});
	if (result != null && result.status == 1) {
		return result;
	}
	return null;
};

//设置样式
const dynewsStyle = StyleSheet.create({});
