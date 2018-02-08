//钢企名录
import React, { Component } from "react";
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	Image,
	View,
	FlatList,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Linking,
	ScrollView
} from "react-native";
import net from "../../../logic/net";
import image from "../../../logic/image";
import user from "../../../logic/user";
import device from "../../../logic/device";
import event from "../../../logic/event";
import cache from "../../../logic/cache";
import skin from "../../../style";
import config from "../../../config";
import Toast from "react-native-root-toast";
import PopupDialog, { DialogTitle } from "react-native-popup-dialog";
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * 钢企名录
 *
 * @author zhangchao
 * @export
 * @class SteelHome
 * @extends {Component}
 */
export class SteelHome extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "钢企名录",
			headerTitleStyle: {
				alignSelf: "center",
				textAlign: "center",
				fontSize: 16,
				color: "#FFF"
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
				<TouchableWithoutFeedback
					onPress={() => {
						//钢企名录收藏页面
						navigation.navigate("collectHome");
					}}
				>
					<View>
						<Text style={{ color: "#FFF", paddingRight: 10 }}>
							收藏
						</Text>
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			refreshing: false,
			//loading：表示当前的加载状态
			//0：没有开始加载,可以显示提示用户滑动加载的相关提示
			//1：正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1：禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			cid: "", //城市ID
			cname: "", //城市名
			List: [],
			longitude: "",
			latitude: "",
			photos: []
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
		this.Refresh();
		//订阅选择城市事件,以便刷新界面数据
		event.Sub(this, event.Events.tool.citySelect, this.citySelectFun);
		//订阅钢企名录收藏返回事件,以便刷新界面数据
		event.Sub(
			this,
			event.Events.tool.steelCollectGoBack,
			this._collectGoBack
		);
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//移除选择城市事件订阅
		event.UnSub(this);
	}
	//选择城市回调事件
	citySelectFun = item => {
		this.Refresh();
	};

	//企名录收藏返回回调事件
	_collectGoBack = async item => {
		this.Refresh();
	};

	Refresh = async () => {
		//从缓存中获取定位信息，默认城市是陕西-西安
		let citycache = await cache.LoadFromFile(config.ToolLocationInfoKey);
		if (citycache) {
			this.setState({
				cid: citycache.cid,
				cname: citycache.pname + "-" + citycache.cname,
				longitude: citycache.longitude,
				latitude: citycache.latitude
			});
		} else {
			this.setState({ cid: 326, cname: "陕西-西安" });
		}
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await _getSteelDatas(
			this.page++,
			this.state.cid,
			this.state.longitude,
			this.state.latitude
		);

		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ":" + new Date().getTime();
		}
		let loadingState = 0; //设置为0,可以
		if (listdata != null && listdata.length > 0) {
			this.setState({
				list: listdata,
				refreshing: false
			});
		} else {
			loadingState = -1; //设置为-1,禁用加载.
			this.setState({
				refreshing: false
			});
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
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
		let listdata = await _getSteelDatas(
			this.page++,
			this.state.cid,
			this.state.longitude,
			this.state.latitude
		);
		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ":" + new Date().getTime();
		}
		let loadingState = 0;
		if (listdata != null && listdata.length > 0) {
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
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: "#555555" }}>
						加载中...
					</Text>
				</View>
			);
		}
		if (this.state.loading == -1) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: "#555555" }}>
						没有更多内容了
					</Text>
				</View>
			);
		} else {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: "#555555" }}>
						上拉加载更多
					</Text>
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
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: "#555555" }}>
						下拉刷新内容
					</Text>
				</View>
			);
		} else {
			return null;
		}
	};

	//跳转到钢企名录搜索页面
	goSteelSearch = () => {
		this.nav.navigate("steelSearch");
	};

	//选择省份
	goSelectProvince = () => {
		this.nav.navigate("selectProvince");
	};

	//修改用户状态（我要出现在这里）
	_upUserStatus = async () => {
		let userInfo = await user.GetUserInfo();
		if (!userInfo.sname || !userInfo.stname) {
			Alert.alert(
				"提示",
				'必须填写"钢厂"和"品名"，才能在钢企名录页面中展示!',
				[
					{
						text: "确定",
						onPress: () => this.nav.navigate("userInfoUpdata")
					}
				]
			);
		} else {
			let result = await upUserShow();
			if (result.status === 1) {
				Toast.show("已经提交审核!", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			} else {
				Toast.show(result.error, {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		}
	};

	//调用系统拨打电话
	_callPhone = item => {
		this.setState({ photos: item.mobile.split("/") });
		if (item.mobile.indexOf("/") == -1) {
			let mobile = item.mobile;
			return Linking.openURL("tel:" + mobile);
		} else {
			this.popupDialog.show();
		}
	};
	//调用系统拨打电话
	_onCallPhone = mobile => {
		if (mobile) {
			this.popupDialog.dismiss();
			return Linking.openURL("tel:" + mobile);
		}
	};

	//关闭popupDialog
	_onCloseDialog = () => {
		this.popupDialog.dismiss();
	};

	/**
	 * 钢企名录item
	 * @param {int,Object} { index, item }
	 */
	createListItem = ({ index, item }) => {
		return (
			<SteelListItem
				ItemPress={this._callPhone}
				index={index}
				data={item}
				navigation={this.props.navigation}
			/>
		);
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: "#FFF",
					flexDirection: "column"
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "flex-start",
						paddingTop: 5,
						paddingBottom: 5,
						paddingRight: 5,
						paddingLeft: 10
					}}
				>
					<TouchableWithoutFeedback onPress={this.goSelectProvince}>
						<View
							style={{
								flex: 1,
								flexDirection: "row",
								alignItems: "center"
							}}
						>
							<Image
								style={{ width: 16, height: 16 }}
								source={image.tool.locateicon}
							/>
							<Text>{this.state.cname}</Text>
						</View>
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback onPress={this.goSteelSearch}>
						<View
							style={{
								flex: 2,
								flexDirection: "row",
								borderRadius: 5,
								borderColor: "#fff",
								borderWidth: 1,
								backgroundColor: "whitesmoke",
								justifyContent: "center",
								alignItems: "center",
								padding: 5
							}}
						>
							<Image
								style={{ width: 16, height: 16 }}
								source={image.newsimages.search}
							/>
							<Text style={{ fontSize: 12 }}>
								公司名、钢厂、品名
							</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<FlatList
					refreshing={this.state.refreshing}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={_itemSteelSeparator}
					ListFooterComponent={this.listFooter}
					onRefresh={this.Refresh}
					onEndReached={this.loadMore}
				/>
				<TouchableHighlight onPress={this._upUserStatus}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							padding: 5,
							backgroundColor: "#ffa858"
						}}
					>
						<Text style={{ color: "#FFF" }}>我要出现在这里</Text>
					</View>
				</TouchableHighlight>

				<PopupDialog
					ref={popupDialog => {
						this.popupDialog = popupDialog;
					}}
					dialogStyle={{
						backgroundColor: skin.tint,
						width: 180,
						height: 170,
						borderRadius: 5
					}}
				>
					<ScrollView style={{ backgroundColor: "#fff" }}>
						{this.state.photos.map((item, index) => {
							return (
								<TouchableHighlight
									key={index + new Date().getTime()}
									activeOpacity={1}
									underlayColor={"#FFF"}
									onPress={() => this._onCallPhone(item)}
								>
									<View
										key={index}
										style={{
											flexDirection: "row",
											justifyContent: "center",
											alignItems: "center",
											backgroundColor: skin.tint,
											height: 40,
											borderBottomWidth: 1,
											borderColor: "#DEDEDE"
										}}
									>
										<Image
											style={{ width: 25, height: 25 }}
											source={image.tool.tell_y}
										/>
										<Text style={{ paddingLeft: 12 }}>
											{item}
										</Text>
									</View>
								</TouchableHighlight>
							);
						})}
					</ScrollView>
					<TouchableHighlight
						activeOpacity={1}
						underlayColor={"#FFF"}
						onPress={this._onCloseDialog}
						style={{
							flexDirection: "row",
							marginHorizontal: 20,
							marginVertical: 10,
							borderRadius: 5
						}}
					>
						<View
							style={{
								flex: 1,
								backgroundColor: "#4BC1D2",
								justifyContent: "center",
								alignItems: "center",
								height: 30,
								borderRadius: 5
							}}
						>
							<Text style={{ color: "#FFF" }}>取消</Text>
						</View>
					</TouchableHighlight>
				</PopupDialog>
			</View>
		);
	}
}

/**
 * 获取钢企名录数据
 * @param {int} page 页码
 * @param {int} cid 城市ID
 * @param {string} longitude 经度
 * @param {string} latitude 纬度
 */

let _getSteelDatas = async function(page, cid, longitude, latitude) {
	let datas = {};
	datas["page"] = page;
	if (cid) {
		datas["city"] = Number(cid);
	}

	if (longitude && latitude) {
		datas["longitude"] = longitude.toString();
		datas["latitude"] = latitude.toString();
	}
	let result = await net.ApiPost("card", "GetCardList", datas);
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};

/**
 * 修改钢企名录状态
 */
let upUserShow = async function() {
	let result = await net.ApiPost("card", "UPUserShow", {});
	if (result != null && result.status == 1) {
		return result;
	} else {
		return result;
	}
};

//列表分割线控件
let _itemSteelSeparator = () => {
	return <View style={{ height: 1, backgroundColor: "#F2F2F2" }} />;
};

//列表空时显示控件
let _listEmpty = () => {
	return (
		<View
			style={{
				flex: 1,
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				height: 30
			}}
		>
			<Text style={{ fontSize: 16, color: "#555555" }}>
				加载数据中...
			</Text>
		</View>
	);
};

export class SteelListItem extends Component {
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			item: this.props.data,
			index: this.props.index,
			pertain: this.props.data.pertain
		};
	}

	//收藏/取消收藏钢企名录
	addOrDelCard = async () => {
		if (this.state.pertain == 1) {
			//取消收藏钢企名录信息
			let result = await net.ApiPost("card", "DelCard", {
				eid: this.state.item.id
			});
			if (result.status == 1) {
				this.props.data.pertain = 0;
				this.setState({ pertain: 0 });
				Toast.show("删除收藏成功!", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			//收藏钢企名录信息
			let result = await net.ApiPost("card", "AddCard", {
				eid: this.state.item.id
			});
			if (result.status == 1) {
				this.props.data.pertain = 1;
				this.setState({ pertain: 1 });
				Toast.show("收藏成功!", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		}
	};

	_onPressCallPhone = () => {
		this.props.ItemPress(this.state.item);
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View style={{ height: 5, backgroundColor: "#EEE" }} />
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						padding: 10,
						backgroundColor: "#FFF"
					}}
				>
					<View style={{ flex: 1, flexDirection: "row" }}>
						<Text style={{ fontSize: 15, color: "black" }}>
							{this.state.index + 1}
						</Text>
						<Text
							style={{
								paddingLeft: 10,
								flex: 8,
								fontSize: 15,
								color: "black"
							}}
							numberOfLines={1}
						>
							{this.state.item.cname}
						</Text>
						<TouchableWithoutFeedback onPress={this.addOrDelCard}>
							<View style={{ flex: 1, alignItems: "flex-end" }}>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.pertain
											? image.tool.pertain
											: image.tool.pertaingray
									}
								/>
							</View>
						</TouchableWithoutFeedback>
					</View>
					<View
						style={{
							height: 1,
							backgroundColor: "#F2F2F2",
							marginVertical: 5
						}}
					/>
					<View style={{ flex: 1, flexDirection: "row" }}>
						<View
							style={{
								flex: 6,
								flexDirection: "column",
								paddingLeft: 10
							}}
						>
							<View style={{ flex: 1, flexDirection: "row" }}>
								<Text style={{ flex: 1, textAlign: "right" }}>
									主营产品:
								</Text>
								<Text
									style={{ flex: 3, paddingLeft: 10 }}
									numberOfLines={1}
								>
									{this.state.item.prod}
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: "row",
									paddingVertical: 5
								}}
							>
								<Text style={{ flex: 1, textAlign: "right" }}>
									钢厂:
								</Text>
								<Text
									style={{ flex: 3, paddingLeft: 10 }}
									numberOfLines={1}
								>
									{this.state.item.steel}
								</Text>
							</View>
							<View style={{ flex: 1, flexDirection: "row" }}>
								<Text style={{ flex: 1, textAlign: "right" }}>
									联系人:
								</Text>
								<View style={{ flex: 3, flexDirection: "row" }}>
									<Text
										style={{
											paddingHorizontal: 10,
											width: 90
										}}
										numberOfLines={1}
									>
										{this.state.item.linkman}
									</Text>
									<Text>电话:</Text>
									<Text style={{ paddingLeft: 10 }}>
										{this.state.item.mobile.indexOf("/") ==
										-1
											? this.state.item.mobile
											: this.state.item.mobile.split(
													"/"
												)[0]}
									</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								flex: 1,
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center"
							}}
						>
							<TouchableWithoutFeedback
								onPress={this._onPressCallPhone}
							>
								<Image
									style={{ width: 40, height: 40 }}
									source={image.tool.tell_y}
								/>
							</TouchableWithoutFeedback>
						</View>
					</View>
				</View>
			</View>
		);
	}
}
