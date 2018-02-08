import React, { Component } from "react";
import {
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
	Keyboard,
	Platform
} from "react-native";
import Dimensions from "Dimensions";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-root-toast";
import net from "../../logic/net";
import image from "../../logic/image";
import user from "../../logic/user";
import device from "../../logic/device";
import Header from "../header";
import skin from "../../style";
import TimeUtil from "../../logic/TimeUtil";
import event from "../../logic/event";

let { width, height } = Dimensions.get("window"); //屏幕宽高
/**
 * 我的-收藏-我的收藏
 *
 * @author zhangchao
 * @export
 * @class MyCollectSearch
 * @extends {Component}
 */
export default class MyCollectSearch extends Component {
	static navigationOptions = {
		header: headerProps => {
			return (
				<View>
					<Header />
				</View>
			);
		}
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
			List: [],
			//搜索内容
			searchKey: ""
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.Refresh();
	}

	//刷新数据
	Refresh = async () => {
		//从缓存中获取当前用户信息
		let userInfo = await user.GetUserInfo();
		//搜索内容为空时，不刷新数据
		if (!this.state.searchKey) {
			return;
		}
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await getCollectionData(this.state.searchKey, 0);

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
				list: [],
				refreshing: false
			});
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//加载更多
	loadMore = async info => {
		//从缓存中获取当前用户信息
		let userInfo = await user.GetUserInfo();
		if (
			this.state.list == null ||
			this.state.list.length == 0 ||
			this.state.refreshing ||
			this.state.loading != 0 ||
			!this.state.searchKey
		) {
			return;
		}
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1].id;
		let listdata = await getCollectionData(this.state.searchKey, lastNews);
		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ":" + new Date().getTime();
		}
		let loadingState = 0;
		if (listdata != null && listdata.length > 0) {
			this.setState({ list: this.state.list.concat(listdata) });
		} else {
			loadingState = -1; //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
			// this.setState({ list: [] });
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
					<Text style={{ fontSize: 16, color: "#555555" }} />
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

	//监听搜索内容
	_onChangeText = text => {
		if (text.length == 0) {
			//文本框被清空后
			this.setState({ searchKey: text, list: [] }); //清空列表
		} else {
			this.setState({ searchKey: text });
		}
	};
	//点击查询
	_onSearch = () => {
		Keyboard.dismiss(); //隐藏键盘
		if (this.state.searchKey.length == 0) {
			Toast.show("请输入关键字!", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			this.Refresh();
		}
	};
	//返回上一页面
	_onClosePage = () => {
		Keyboard.dismiss(); //隐藏键盘
		//发送事件，通知我的收藏刷新页面
		event.Send(event.Events.collect.mycollectsearch);
		this.nav.goBack();
	};

	//创建list item,根据数据不同创建不同的item模板
	createListItem = ({ item }) => {
		if (item.type == 20) {
			return (
				<View
					style={{
						flex: 1,
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: "column"
					}}
				>
					<TouchableHighlight
						onPress={() => this.ItemPress(item)}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View>
							<View style={{ flex: 1, flexDirection: "row" }}>
								<Text
									style={{
										fontSize: 12,
										color: skin.inactiveTint,
										width: 100
									}}
								>
									纯文本
								</Text>
								<Text
									style={{
										flex: 1,
										fontSize: 12,
										color: skin.inactiveTint
									}}
								>
									{TimeUtil.getTime(item.ctime, "yyyy-MM-dd")}
								</Text>
								<TouchableHighlight
									onPress={() =>
										this.moveCollectionItem(item.id)
									}
									activeOpacity={1}
									underlayColor={skin.transparentColor}
								>
									<View
										style={{
											width: 40,
											alignItems: "flex-end"
										}}
									>
										<Icon
											name="ios-trash-outline"
											size={20}
											color={"#ccc"}
										/>
									</View>
								</TouchableHighlight>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: "row",
									marginTop: 5
								}}
							>
								<Text
									style={{
										flex: 1,
										fontSize: 16,
										color: skin.inactiveTint
									}}
								>
									{item.name}
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
		if (item.type == 1) {
			if (item.showtype == 1) {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: "column"
						}}
					>
						<TouchableHighlight
							onPress={() => this.ItemPress(item)}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View>
								<View style={{ flex: 1, flexDirection: "row" }}>
									<View
										style={{
											width: 100,
											flexDirection: "row"
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height:
													Platform.OS == "ios"
														? 14
														: 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor:
													skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											文章
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(
											item.ctime,
											"yyyy-MM-dd"
										)}
									</Text>
									<TouchableHighlight
										onPress={() =>
											this.moveCollectionItem(item.id)
										}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: "flex-end"
											}}
										>
											<Icon
												name="ios-trash-outline"
												size={20}
												color={"#ccc"}
											/>
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: "row",
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 75,
											width: 100,
											borderRadius: 5
										}}
										source={{
											uri: item.img,
											cache: "force-cache"
										}}
									/>
									<View style={{ paddingLeft: 10, flex: 1 }}>
										<Text
											style={{
												flex: 1,
												fontSize: 16,
												color: skin.title
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			} else {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: "column"
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.ItemPress(item)}
						>
							<View>
								<View style={{ flex: 1, flexDirection: "row" }}>
									<View
										style={{
											width: 100,
											flexDirection: "row"
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height:
													Platform.OS == "ios"
														? 14
														: 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor:
													skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											文章
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(
											item.ctime,
											"yyyy-MM-dd"
										)}
									</Text>
									<TouchableHighlight
										onPress={() =>
											this.moveCollectionItem(item.id)
										}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: "flex-end"
											}}
										>
											<Icon
												name="ios-trash-outline"
												size={20}
												color={"#ccc"}
											/>
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 160,
											width: width - 20,
											borderRadius: 5
										}}
										resizeMode="stretch"
										source={{
											uri: item.img,
											cache: "force-cache"
										}}
									/>
									<View
										style={{
											height: 20,
											marginTop: -20,
											backgroundColor: "#00000088",
											justifyContent: "center",
											alignItems: "center"
										}}
									>
										<Text
											numberOfLines={1}
											style={{
												color: "#FFF",
												fontSize: 14
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			}
		}
		if (item.type == 2) {
			if (item.showtype == 1) {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: "column"
						}}
					>
						<TouchableHighlight
							onPress={() => this.ItemPress(item)}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
						>
							<View>
								<View style={{ flex: 1, flexDirection: "row" }}>
									<View
										style={{
											width: 100,
											flexDirection: "row"
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height:
													Platform.OS == "ios"
														? 14
														: 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor:
													skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											图集
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(
											item.ctime,
											"yyyy-MM-dd"
										)}
									</Text>
									<TouchableHighlight
										onPress={() =>
											this.moveCollectionItem(item.id)
										}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: "flex-end"
											}}
										>
											<Icon
												name="ios-trash-outline"
												size={20}
												color={"#ccc"}
											/>
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: "row",
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 75,
											width: 100,
											borderRadius: 5
										}}
										source={{
											uri: item.img,
											cache: "force-cache"
										}}
									/>
									<View style={{ paddingLeft: 10, flex: 1 }}>
										<Text
											style={{
												flex: 1,
												fontSize: 16,
												color: skin.title
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			} else {
				return (
					<View
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 12,
							flexDirection: "column"
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.ItemPress(item)}
						>
							<View>
								<View style={{ flex: 1, flexDirection: "row" }}>
									<View
										style={{
											width: 100,
											flexDirection: "row"
										}}
									>
										<Text
											style={{
												fontSize: 12,
												color: skin.inactiveTint
											}}
										>
											布谷资讯
										</Text>
										<Text
											style={{
												height:
													Platform.OS == "ios"
														? 14
														: 18,
												fontSize: 10,
												color: skin.tint,
												backgroundColor:
													skin.highlightedRed,
												marginLeft: 5,
												padding: 2,
												borderRadius: 2
											}}
										>
											图集
										</Text>
									</View>

									<Text
										style={{
											flex: 1,
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										{TimeUtil.getTime(
											item.ctime,
											"yyyy-MM-dd"
										)}
									</Text>
									<TouchableHighlight
										onPress={() =>
											this.moveCollectionItem(item.id)
										}
										activeOpacity={1}
										underlayColor={skin.transparentColor}
									>
										<View
											style={{
												width: 40,
												alignItems: "flex-end"
											}}
										>
											<Icon
												name="ios-trash-outline"
												size={20}
												color={"#ccc"}
											/>
										</View>
									</TouchableHighlight>
								</View>
								<View
									style={{
										marginTop: 5
									}}
								>
									<Image
										style={{
											height: 160,
											width: width - 20,
											borderRadius: 5
										}}
										resizeMode="stretch"
										source={{
											uri: item.img,
											cache: "force-cache"
										}}
									/>
									<View
										style={{
											height: 20,
											marginTop: -20,
											backgroundColor: "#00000088",
											justifyContent: "center",
											alignItems: "center"
										}}
									>
										<Text
											numberOfLines={1}
											style={{
												color: "#FFF",
												fontSize: 14
											}}
										>
											{item.name}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					</View>
				);
			}
		}
		if (item.type == 3) {
			return (
				<View
					style={{
						flex: 1,
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: "column"
					}}
				>
					<TouchableHighlight
						onPress={() => this.ItemPress(item)}
						activeOpacity={1}
						underlayColor={skin.transparentColor}
					>
						<View>
							<View style={{ flex: 1, flexDirection: "row" }}>
								<View
									style={{ width: 100, flexDirection: "row" }}
								>
									<Text
										style={{
											fontSize: 12,
											color: skin.inactiveTint
										}}
									>
										布谷资讯
									</Text>
									<Text
										style={{
											height:
												Platform.OS == "ios" ? 14 : 18,
											fontSize: 10,
											color: skin.tint,
											backgroundColor:
												skin.highlightedRed,
											marginLeft: 5,
											padding: 2,
											borderRadius: 2
										}}
									>
										语音
									</Text>
								</View>

								<Text
									style={{
										flex: 1,
										fontSize: 12,
										color: skin.inactiveTint
									}}
								>
									{TimeUtil.getTime(item.ctime, "yyyy-MM-dd")}
								</Text>
								<TouchableHighlight
									onPress={() =>
										this.moveCollectionItem(item.id)
									}
									activeOpacity={1}
									underlayColor={skin.transparentColor}
								>
									<View
										style={{
											width: 40,
											alignItems: "flex-end"
										}}
									>
										<Icon
											name="ios-trash-outline"
											size={20}
											color={"#ccc"}
										/>
									</View>
								</TouchableHighlight>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: "row",
									marginTop: 5
								}}
							>
								<Image
									style={{
										height: 75,
										width: 100,
										borderRadius: 5
									}}
									source={{
										uri:
											item.type == 3
												? item.img.split(",")[0]
												: item.img,
										cache: "force-cache"
									}}
								/>
								<View style={{ paddingLeft: 10, flex: 1 }}>
									<Text
										style={{
											flex: 1,
											fontSize: 16,
											color: skin.title
										}}
									>
										{item.name}
									</Text>
								</View>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}
	};

	ItemPress = async item => {
		Keyboard.dismiss();
		if (item.type == 20) {
			//跳转到纯文本详情页与文字消息处理方式一样
			this.nav.navigate("textView", {
				navigation: this.props.navigation,
				content: item.content
			});
		} else {
			let result = await this.queryNewsInfo(item.linkid);
			if (result != null) {
				this.nav.navigate("newsView", {
					id: item.linkid,
					type: result.isimg,
					tid: result.cid,
					item: result
				});
			}
		}
	};

	/**
	 * 根据文章ID查询文章
	 *
	 * @param {any} aid 文章ID
	 * @returns
	 */
	queryNewsInfo = async aid => {
		let result = await net.ApiPost("article", "GetArticleByID", {
			aid: aid
		});
		if (result != null && result.status == 1) {
			return result.data;
		}
		return null;
	};

	/**
	 * 删除收藏按钮事件
	 *
	 * @param {string} id 可被删除收藏id
	 */
	moveCollectionItem(id) {
		Alert.alert("", "是否删除收藏", [
			{ text: "取消" },
			{ text: "删除", onPress: () => this.deleteRequest(id) }
		]);
	}

	/**
	 * 收藏删除网络请求
	 *
	 * @param {string} id 被删除收藏id
	 */
	async deleteRequest(id) {
		let result = await net.ApiPost("collect", "DelCollect", {
			id: id
		});
		if (result == null || typeof result.status == "undefined") {
			Toast.show("删除收藏时发生错误,请稍后重试", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else if (result.status == 0) {
			Toast.show(result.error, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else if (result.status == 1) {
			Toast.show("删除收藏成功", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			this.Refresh();
			return;
		} else {
			Toast.show("发生未知错误", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: "column",
					justifyContent: "flex-start",
					alignItems: "center",
					backgroundColor: "#f3f3f3"
				}}
			>
				<View
					style={{
						flexDirection: "row",
						height: 40,
						justifyContent: "center",
						backgroundColor: "#FFF"
					}}
				>
					<View
						style={{
							flex: 1,
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center"
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={this._onClosePage}
						>
							<View
								style={{
									flex: 1,
									height: 40,
									width: 40,
									paddingLeft: 10,
									justifyContent: "center",
									alignItems: "center"
								}}
							>
								<Icon name="ios-arrow-back" size={24} />
							</View>
						</TouchableHighlight>
						<TextInput
							style={{
								flex: 9,
								height: 40,
								borderColor: "#5c5c5c",
								padding: 10,
								fontSize: 12
							}}
							onChangeText={this._onChangeText}
							value={this.state.searchKey}
							placeholder="请输入您要搜索的内容"
							placeholderTextColor="#808080"
							autoFocus={true}
							underlineColorAndroid="transparent"
						/>
						<TouchableWithoutFeedback onPress={this._onSearch}>
							<View
								style={{
									flex: 1,
									height: 40,
									justifyContent: "center"
								}}
							>
								<Icon name="ios-search-outline" size={24} />
							</View>
						</TouchableWithoutFeedback>
					</View>
				</View>
				<View
					style={{
						width: width,
						height: 5,
						backgroundColor: "#F3f3f3"
					}}
				/>
				<View
					style={{
						width: width,
						height: height - 70,
						backgroundColor: "#fff"
					}}
				>
					<FlatList
						keyboardShouldPersistTaps="always"
						style={{
							height:
								Platform.OS == "ios"
									? height - 160
									: height - 180
						}}
						refreshing={this.state.refreshing}
						data={this.state.list}
						extraData={this.state}
						renderItem={this.createListItem}
						ItemSeparatorComponent={_itemSteelSeparator}
						ListFooterComponent={this.listFooter}
						onRefresh={this.Refresh}
						onEndReached={this.loadMore}
					/>
				</View>
			</View>
		);
	}
}

/**
 * 我的收藏查询
 * @param {string} search 搜索关键字
 * @param {string} maxid 最后一条数据id
 */
let getCollectionData = async function(search, maxid) {
	let result = await net.ApiPost("collect", "GetCollectList", {
		search: search,
		maxid: maxid
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
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
