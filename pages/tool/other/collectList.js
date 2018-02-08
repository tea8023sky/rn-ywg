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
	ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import net from "../../../logic/net";
import image from "../../../logic/image";
import user from "../../../logic/user";
import event from "../../../logic/event";
import config from "../../../config";
import skin from "../../../style";
import PopupDialog, { DialogTitle } from "react-native-popup-dialog";
/**
 *收藏列表页面（钢企名录）
 *
 * @author zhangchao
 * @export
 * @class CollectHome
 * @extends {Component}
 */
export class CollectHome extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "收藏",
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
			headerRight: <View />
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
			List: [],
			photos: []
		};
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	}

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
		this.Refresh();
	}

	//刷新数据
	Refresh = async () => {
		//从缓存中获取当前用户信息
		let userInfo = await user.GetUserInfo();
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await _getSteelDatas(this.page++, userInfo.id);
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
		if (
			this.state.list == null ||
			this.state.list.length == 0 ||
			this.state.refreshing ||
			this.state.loading != 0
		) {
			return;
		}
		//从缓存中获取当前用户信息
		let userInfo = await user.GetUserInfo();
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1];
		let listdata = await _getSteelDatas(this.page++, userInfo.id);
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
	//删除收藏中的钢企名录
	_DelCard = async item => {
		let result = await net.ApiPost("card", "DelCard", { eid: item.id });
		if (result != null && result.status == 1) {
			let list = this.state.list;
			for (let i = 0; i < list.length; i++) {
				if (item.id === list[i].id) {
					list.splice(i, 1);
					break;
				}
			}
			this.setState({ list: list });
			//收藏页删除钢企名录后更新钢企名录页面
			event.Send(event.Events.tool.steelCollectGoBack);
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
	 * 钢企名录收藏item
	 * @param {int,Object} { index, item }
	 */
	createCollectItem = ({ index, item }) => {
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
							{++index}
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
							{item.cname}
						</Text>
						<TouchableWithoutFeedback
							onPress={() => {
								Alert.alert(
									"",
									"是否删除收藏",
									[
										{
											text: "取消",
											onPress: () => {},
											style: "cancel"
										},
										{
											text: "删除",
											onPress: () => this._DelCard(item)
										}
									],
									{ cancelable: true }
								);
							}}
						>
							<View style={{ flex: 1, alignItems: "flex-end" }}>
								<Icon
									name="ios-trash-outline"
									size={22}
									color={"#ccc"}
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
									{item.prod}
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
									{item.steel}
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
										{item.linkman}
									</Text>
									<Text>电话:</Text>
									<Text style={{ paddingLeft: 10 }}>
										{item.mobile.indexOf("/") == -1
											? item.mobile
											: item.mobile.split("/")[0]}
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
								onPress={() => this._callPhone(item)}
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
				<FlatList
					refreshing={this.state.refreshing}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createCollectItem}
					ItemSeparatorComponent={_itemSteelSeparator}
					ListFooterComponent={this.listFooter}
					onRefresh={this.Refresh}
					onEndReached={this.loadMore}
				/>
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
 * 获取当前用户收藏的钢企名录
 * @param {int} page 页码
 * @param {int} uid 用户ID
 */
let _getSteelDatas = async function(page, uid) {
	let result = await net.ApiPost("card", "GetCollCardList", {
		page: page,
		uid: uid
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
