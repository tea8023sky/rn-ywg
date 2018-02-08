import React, { Component, PureComponent } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	FlatList,
	Alert,
	TouchableHighlight,
	Platform,
	Linking,
	Modal,
	Clipboard
} from 'react-native';
import user from '../../logic/user';
import image from '../../logic/image';
import skin from '../../style';
import net from '../../logic/net';
import TimeUtil from '../../logic/TimeUtil';
import cache from '../../logic/cache';
import config from '../../config';
import Regular from '../../logic/regular';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';
import Dimensions from 'Dimensions';
let { width, height } = Dimensions.get('window');
import event from '../../logic/event';
import chat, { ChatMessage } from '../../logic/chat';

/**
 * 我的-动态列表页面
 *
 * @author zhengyeye
 * @export
 * @class userdynamic
 * @extends {Component}
 */
export default class userdynamic extends Component {
	//我的动态页面导航栏设置
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '动态',
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
		this.state = {
			uid: '', //用户id
			avatar: image.DefaultAvatar.man, //头像（默认为男性头像）
			mobile: '', //手机号
			name: '', //姓名
			refreshing: false,
			//loading：表示当前的加载状态
			//0：没有开始加载,可以显示提示用户滑动加载的相关提示
			//1：正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1：禁用加载,可以显示没有更多内容的相关提示
			//-99：动态中没有数据
			loading: 0,
			List: [], //列表数据
			cuid: '' //当前登录用户id
		};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
	}
	//组件初始化完毕
	componentDidMount() {
		//加载已登录用户数据(动态列表上部的个人信息展示)&刷新页面
		this.getUserInfo();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
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
		let userData = this.params.user ? this.params.user : null;
		let cuser = await cache.LoadFromFile(config.UserInfoSaveKey); //获取缓存中的用户信息
		if (userData == null || cuser == null) {
			return;
		}
		this.setState({ cuid: cuser.id });
		await this.setUserInfo(userData);
		this.Refresh(); //获取完用户信息后再刷新页面
	};

	setUserInfo = async user => {
		let avatarSource = image.GetSmallImageSource(user.img);
		if (avatarSource == image.ErrorImg.default) {
			avatarSource = user.sex == 1 ? image.DefaultAvatar.man : image.DefaultAvatar.woman;
		}
		let nickName = await chat.getNickName(user.id);
		this.setState({
			uid: user.id, //用户id
			avatar: avatarSource, //头像
			mobile: user.mobile, //手机号
			name: nickName ? nickName : user.name //姓名
		});
	};

	//刷新数据
	Refresh = async () => {
		this.setState({ refreshing: true, loading: 1 });
		let listdata = await _getData(this.state.uid, this.state.cuid, 0);
		let loadingState = 0; //设置为0,可以
		if (listdata != null && listdata.length > 0) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index]; //动态列表中每一条的全部信息
				listdata[index].key = element.id + ':' + new Date().getTime();
			}
			this.setState({
				list: listdata,
				refreshing: false
			});
			if (listdata.length < 6) {
				//一屏数据为六条   当加载的数据存在并且小于六条的时候
				loadingState = -1; //设置为-1，底部控件显示没有更多数据,同时不再进行加载.
			}
		} else {
			loadingState = -99; //设置为-99(动态中没有数据),禁用加载.
			this.setState({
				refreshing: false
			});
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	/**
	 * 删除动态
	 *
	 * @memberof userdynamic
	 */
	ItemPress = item => {
		Alert.alert('是否删除动态？', '', [
			{ text: '取消' },
			{
				text: '删除',
				onPress: async () => {
					let listdata = await deldata(item.id);
					if (listdata) {
						let newlist = new Array();
						let list = this.state.list;
						for (let i = 0; i < list.length; i++) {
							if (item.id === list[i].id) {
								list.splice(i, 1);
								break;
							}
						}
						this.setState({ list: list });
					}
				}
			}
		]);
	};
	createListItem = ({ item }) => {
		return <DynamicTextImgsItem ItemPress={this.ItemPress} data={item} navigation={this.props.navigation} />;
	};

	//加载更多
	loadMore = async info => {
		if (
			this.state.list == null ||
			this.state.list.length == 0 ||
			this.state.refreshing ||
			this.state.loading != 0
		) {
			return;
		}
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1];
		let listdata = await _getData(this.state.uid, this.state.cuid, lastNews.id);
		let loadingState = 0;
		if (listdata != null && listdata.length > 0) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ':' + new Date().getTime();
			}
			this.setState({ list: this.state.list.concat(listdata) });
		} else {
			loadingState = -1; //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
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
					<Text style={{ fontSize: 16, color: '#555555' }}>加载中...</Text>
				</View>
			);
		}
		if (this.state.loading == -99) {
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
					<Text style={{ fontSize: 16, color: '#555555' }}>
						{this.state.uid == this.state.cuid ? '您还没有发表过动态！' : '该朋友很懒，还没发表过动态！'}
					</Text>
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
					<Text style={{ fontSize: 16, color: '#555555' }}>没有更多内容了...</Text>
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
					{/* <Text style={{ fontSize: 16, color: '#555555' }}>上拉加载更多...</Text> */}
				</View>
			);
		}
	};

	//列表顶部控件
	listHeader = () => {
		if (this.state.refreshing) {
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
					<Text style={{ fontSize: 16, color: '#555555' }}>下拉刷新内容</Text>
				</View>
			);
		} else {
			return null;
		}
	};

	render() {
		if (this.state == null) {
			return null;
		} else {
			return (
				<View
					style={{
						flexDirection: 'column',
						backgroundColor: '#fff',
						flex: 1
					}}
				>
					<View
						style={{
							marginBottom: 20,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: 'row',
							flex: 1
						}}
					>
						<Image style={userdystyles.userImg} source={this.state.avatar} />
						<View style={userdystyles.usernameOuter}>
							<Text style={userdystyles.userName}>{this.state.name}</Text>
							<Text style={userdystyles.userMob}>{this.state.mobile}</Text>
						</View>
					</View>
					<View style={{ height: 10, backgroundColor: skin.lightSeparate }} />
					<View
						style={{
							flexDirection: 'row',
							flex: 11
						}}
					>
						<FlatList
							refreshing={this.state.refreshing}
							data={this.state.list}
							extraData={this.state}
							renderItem={this.createListItem}
							ItemSeparatorComponent={_itemSeparator}
							ListFooterComponent={this.listFooter}
							onRefresh={this.Refresh}
							onEndReachedThreshold={_onEndReachedThreshold}
							onEndReached={this.loadMore}
						/>
					</View>
				</View>
			);
		}
	}
}

//列表分割线控件
let _itemSeparator = () => {
	return <View style={{ height: 15, backgroundColor: '#F2F2F2' }} />;
};

//列表空时显示控件
let _listEmpty = () => {
	return (
		<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30 }}>
			<Text style={{ fontSize: 16, color: '#555555' }}>加载数据中...</Text>
		</View>
	);
};
let _onEndReachedThreshold = 0.1;

/**
 * 获取动态列表数据
 * @param {*int} ruid  查询用户ID
 * @param {*int} cuid  当前用户ID
 * @param {*int} did  动态id (初始化传0，随后为最后一条动态的id)
 */
let _getData = async function(ruid, cuid, did) {
	let result = await net.ApiPost('circledynamic', 'GetDunamicUserNew3', {
		ruid: ruid,
		cuid: cuid,
		did: did
	});
	if (result != null && result.status == 1) {
		return result.data.data;
	}
	return null;
};

/**
 * 动态列表的item
 *
 * @author zhengyeye
 * @export
 * @class DynamicTextImgsItem
 * @extends {PureComponent}
 */
export class DynamicTextImgsItem extends PureComponent {
	constructor(props) {
		super(props);
		if (this._isMounted) {
			this.setState({
				zanText: '',
				iszan: false,
				myzanlist: this.props.data.zanlist,
				userid: '', //当前登录用户id
				isMenuShow: false
			});
		}
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this._isMounted = true;
		//给列表赋值
		this.getzanlist();
	}
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		this._isMounted = false;
	}
	//删除
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};
	getzanlist = async () => {
		let zanlist = this.props.data.zanlist;
		let zanText = '';
		let iszan = false;
		let userData = await cache.LoadFromFile(config.UserInfoSaveKey); //获取缓存中的用户信息
		if (userData == null) {
			return;
		}
		let userId = userData.id; //当前登录用户id
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

		if (this._isMounted) {
			this.setState({
				zanText: zanText,
				iszan: iszan,
				myzanlist: zanlist,
				userid: userData.id,
				isMenuShow: false
			});
		}
	};
	//复制
	_setClipboardContent = async () => {
		Clipboard.setString(this.props.data.content); //复制内容到粘贴板
		try {
			var content = await Clipboard.getString();
			Toast.show('内容已复制到粘贴板.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} catch (e) {
			Toast.show(e.message, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};
	//点击收藏
	_onPress_collection = async () => {
		let uid = this.state.userId; //当前登录用户id
		let content = this.props.data.content;
		let result = await _collectText(uid, content, content, '', 20, 0);
		if (result.status == 1) {
			Toast.show('收藏成功.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else if (result.status == 0) {
			Toast.show(result.error, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			Toast.show('收藏失败，请稍后重试.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};
	//发送给联系人
	_sendFriend = async () => {
		if (this.props.data && this.props.data.content) {
			const chatMsg = {
				content: this.props.data.content,
				contentType: ChatMessage.ContentType.Chat_Text
			};
			//跳转到多选页面
			this.nav.navigate('multipleChoice', { confirmNum: 0, chatMessage: chatMsg });
		} else {
			Toast.show('发送给联系人失败，请稍后重试.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	render() {
		if (this.state == null) {
			return null;
		} else {
			return (
				<View
					style={{
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: 'row'
					}}
				>
					<View
						style={{
							flex: 1,
							flexDirection: 'column'
						}}
					>
						<Text
							style={{
								fontSize: 16,
								color: '#247A86'
							}}
						>
							{this.props.data.name}
						</Text>

						<Text
							style={{
								color: '#777'
							}}
						>
							{TimeUtil.getTime(this.props.data.createtime, 'MM-dd hh:mm')}
						</Text>

						{this.props.data.content ? (
							<Text
								onLongPress={() => {
									this.setState({ isMenuShow: true });
								}}
								style={{
									flex: 1,
									fontSize: 14,
									color: '#5c5c5c',
									marginTop: 5,
									marginBottom: 5
								}}
							>
								{this.props.data.content}
							</Text>
						) : null}

						{this.props.data.link ? (
							<Text
								onPress={this._openUrl}
								style={{
									flex: 1,
									color: '#5c5c5c'
								}}
							>
								{this.props.data.link}
							</Text>
						) : null}

						<ImageContent imgs={this.props.data.imgs} navigation={this.props.navigation} />
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
							) : (
								<View>
									<Text />
								</View>
							)}
							<Text style={{ color: '#5c5c5c' }}>
								{this.state.myzanlist.length != 0 ? this.state.myzanlist.length : ''}
							</Text>
							{this.props.data.uid == this.state.userid ? (
								<Text
									style={{
										color: '#247A86',
										marginLeft: 5
									}}
									onPress={this._onPress}
								>
									删除
								</Text>
							) : null}
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
									flex: 1,
									flexDirection: 'row',
									marginTop: 11,
									marginRight: 20
								}}
							>
								<Image
									style={{ height: 16, width: 16, marginLeft: 5, marginRight: 5 }}
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
					<Modal
						style={{ backgroundColor: '#00000011', width: width, height: height }}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isMenuShow}
						onRequestClose={() => {
							this.setState({ isMenuShow: false });
						}}
					>
						<TouchableHighlight
							onPress={() => {
								this.setState({ isMenuShow: false });
							}}
						>
							<View style={{ backgroundColor: '#00000055', width: width, height: height }} />
						</TouchableHighlight>
						<View style={userdystyles.modalContainer}>
							<View style={{ flexDirection: 'column' }}>
								<TouchableHighlight
									onPress={() => {
										this.setState({ isMenuShow: false });
										this._setClipboardContent();
									}}
								>
									<View style={userdystyles.modalTextOuter}>
										<Text style={userdystyles.modalText}>复制</Text>
									</View>
								</TouchableHighlight>

								<TouchableHighlight
									onPress={() => {
										this.setState({ isMenuShow: false });
										this._onPress_collection();
									}}
								>
									<View style={userdystyles.modalTextOuter}>
										<Text style={userdystyles.modalText}>收藏</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									onPress={() => {
										this.setState({ isMenuShow: false });
										this._sendFriend();
									}}
								>
									<View style={userdystyles.modalTextOuter}>
										<Text style={userdystyles.modalText}>发送给联系人</Text>
									</View>
								</TouchableHighlight>
							</View>
							<View style={{ width: width, height: 5, backgroundColor: '#e0e0e0' }} />
							<TouchableHighlight
								onPress={() => {
									this.setState({ isMenuShow: false });
								}}
							>
								<View
									style={{
										width: width,
										height: 48,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text style={{ fontSize: 16, color: skin.main }}>取消</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			);
		}
	}
	_openUrl = () => {
		let isUrl = Regular.hasHttp(this.props.data.link);
		if (isUrl) {
			return Linking.openURL(this.props.data.link);
		} else {
			return Linking.openURL('http://' + this.props.data.link);
		}
		//调用系统打开外部链接
		// Linking.canOpenURL(this.props.data.link)
		// 	.then(supported => {
		// 		if (!supported) {
		// 			Toast.show('暂不支持打开该链接: ' + this.props.data.link, {
		// 				duration: Toast.durations.SHORT,
		// 				position: Toast.positions.BOTTOM
		// 			});
		// 			return;
		// 		} else {
		// 			return Linking.openURL(this.props.data.link);
		// 		}
		// 	})
		// 	.catch(err => console.error('An error occurred', err));
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
		if (this.state.iszan) {
			let afterdzdata = await _delzandata(this.state.userid, this.props.data.id);
			iszan = false;
			if (afterdzdata != null && afterdzdata.status == 1) {
				//取消点赞成功,如果为true，则从zanarr中移除这一项
				let temp = {
					uid: this.state.userid
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
			let afterdzdata = await _addzandata(this.state.userid, this.props.data.id);
			iszan = true;
			if (afterdzdata != null && afterdzdata.status == 1) {
				//点赞成功 如果为false，则从zanarr中增加这一项
				let userInfo = await user.GetUserInfo(); //获取个人信息
				let temp = {
					uid: this.state.userid,
					rzname: userInfo.name,
					time: parseInt(new Date().getTime() / 1000)
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
		if (this._isMounted) {
			this.setState({
				zanText: zanText,
				iszan: iszan,
				myzanlist: newZanArr
			});
		}
		event.Send(event.Events.dynamic.giveZan);
	};
}
/**
 * 收藏
 * @param {int} uid 所属用户
 * @param {string} content 收藏内容
 * @param {string} name 收藏名称
 * @param {string} img 收藏缩略图
 * @param {smallint} type  收藏类型 1：普通文章；2：图集文章；3：音频文章；20:纯文本；
 * @param {int} linkid 关联表id
 */
let _collectText = async function(uid, content, name, img, type, linkid) {
	try {
		let result = await net.ApiPost('collect', 'AddCollect', {
			uid: uid,
			content: content,
			name: name,
			img: img,
			type: type,
			linkid: linkid
		});
		if (result != null) {
			return result;
		}
	} catch (error) {
		console.log('收藏请求失败:' + JSON.stringify(error));
	}
	return null;
};

/**
 * 删除个人动态
 * @param {*} uid 用户id
 * @param {*} did 动态id
 */
let deldata = async function(did) {
	let result = await net.ApiPost('circledynamic', 'DelDynamic', {
		did: did
	});
	if (__DEV__) {
		console.log('删除动态后返回数据：' + JSON.stringify(result));
	}
	if (result != null && result.status == 1) {
		return result.status;
	}
	return null;
};
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
 * 动态列表中的九宫格图片
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
	componentDidMount() {
		let imgsArr = this.state.imgs.split('|'); //图片组成的数组
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
	}

	ItemPress = index => {
		//点击小图查看大图
		this.props.navigation.navigate('dynamicImgs', {
			simgsArr: this.state.simgsArr,
			bimgsArr: this.state.bimgsArr,
			index: index
		});
	};

	render() {
		if (this.props.imgs) {
			return <View style={userdystyles.container}>{this.renderAllImgs()}</View>;
		} else {
			return (
				<View>
					<Text />
				</View>
			);
		}
	}

	//九宫格图片展示
	renderAllImgs() {
		var allImgs = [];
		let imgsdata = this.state.simgsArr; //小图图片地址 [{index:0,url:"xxx"},{index:1,url:"xxx"},...{index:5,url:"xxx"}]
		//大图图片地址[{url:"xxx"},{url:"xxx"},...{url:"xxx"}]
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
							<Image style={userdystyles.iconStyle} source={{ uri: badge.url }} />
						</TouchableHighlight>
					</View>
				);
			});
			return allImgs;
		}
	}
}
//设置样式
const userdystyles = StyleSheet.create({
	//九宫格图片的样式开始
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: width - 16,
		marginRight: 16
	},
	iconStyle: {
		width: (width - 16 - 5 * 4) / 3,
		height: (width - 16 - 5 * 4) / 3,
		marginRight: 5,
		marginBottom: 5
	},
	//九宫格图片的样式结束
	//动态列表个人信息开始
	userImg: {
		height: 60,
		width: 60,
		borderRadius: Platform.OS == 'ios' ? 30 : 40,
		borderWidth: 1,
		borderColor: '#EAE8E8'
	},
	usernameOuter: {
		paddingLeft: 10,
		marginTop: 8,
		marginBottom: 20
	},
	userName: {
		fontSize: 18,
		color: '#000'
	},
	userMob: {
		fontSize: 14,
		color: '#666'
	},
	//动态列表个人信息结束

	modalContainer: {
		backgroundColor: '#fff',
		flexDirection: 'column',
		position: 'absolute',
		bottom: 0,
		right: 0,
		borderTopWidth: 1,
		borderTopColor: '#f3f3f3'
	},

	modalTextOuter: {
		//弹框最外层
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#f3f3f3'
	},
	modalText: {
		fontSize: 14,
		color: '#666666',
		height: 40,
		textAlignVertical: 'center'
	}
});
