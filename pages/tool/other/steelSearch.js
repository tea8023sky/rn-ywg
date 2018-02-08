//钢企名录
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
	ScrollView
} from "react-native";
import Dimensions from "Dimensions";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-root-toast";
import net from "../../../logic/net";
import image from "../../../logic/image";
import user from "../../../logic/user";
import device from "../../../logic/device";
import Header from "../../header";
import skin from "../../../style";
import PopupDialog, { DialogTitle } from "react-native-popup-dialog";

let { width, height } = Dimensions.get("window"); //屏幕宽高
/**
 * 钢企名录搜索
 *
 * @author zhangchao
 * @export
 * @class SteelSearchHome
 * @extends {Component}
 */
export class SteelSearchHome extends Component {
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
			searchKey: "",
			photos: []
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.Refresh();
	}

	//刷新数据
	Refresh = async () => {
		//搜索内容为空时，不刷新数据
		if (!this.state.searchKey) {
			return;
		}
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await _getSearchSteelDatas(
			this.page++,
			this.state.searchKey
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
			this.state.loading != 0 ||
			!this.state.searchKey
		) {
			return;
		}
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1];
		let listdata = await _getSearchSteelDatas(
			this.page++,
			this.state.searchKey
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
			Keyboard.dismiss(); //隐藏键盘
		} else {
			this.setState({ searchKey: text });
		}
	};
	//点击查询
	_onSearch = () => {
		if (this.state.searchKey.length == 0) {
			Toast.show("请输入关键字!", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			this.Refresh();
		}
		Keyboard.dismiss(); //隐藏键盘
	};
	//返回上一页面
	_onClosePage = () => {
		this.props.navigation.goBack();
	};

	//调用系统拨打电话
	_callPhone = item => {
		Keyboard.dismiss();
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
	 * 钢企名录搜索item
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
						<TouchableHighlight onPress={this._onClosePage}>
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
							placeholder="输入公司名、钢厂、品名"
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
 * @param {String} searchval 内容
 */
let _getSearchSteelDatas = async function(page, searchval) {
	let result = await net.ApiPost("card", "GetCardList", {
		page: page,
		search: searchval
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

	//调用系统拨打电话
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
