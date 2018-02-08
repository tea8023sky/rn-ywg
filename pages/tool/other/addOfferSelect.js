import React, { Component, PureComponent } from "react";
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	Image,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	ScrollView,
	FlatList,
	Alert,
	Platform,
	Keyboard
} from "react-native";
import Header from "../../header";
import skin from "../../../style";
import image from "../../../logic/image";
import net from "../../../logic/net";
import event from "../../../logic/event";
import { SelectType } from "./addOffer";
//获取屏幕宽高
let { width, height } = Dimensions.get("window");

/**
 * 报价单 钢厂、品名、库房 选择界面
 *
 * @author zhangchao
 * @export
 * @class AddOfferSelect
 * @extends {Component}
 */
export default class AddOfferSelect extends Component {
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: navigation.state.params.title,
			headerTitleStyle: {
				alignSelf: "center",
				textAlign: "center",
				fontSize: 16,
				color: "#FFF"
			}
		};
	};

	constructor(props) {
		super(props);
		this.state = {
			list: [],
			searchKey: "",
			placeholder: "输入中文名称或拼音"
		};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.origindata = []; //原始数据，搜索用
	}

	//组件初始化完毕
	componentDidMount() {
		if (this.params.type == SelectType.Steel) {
			this.SteelLoaded();
		} else if (this.params.type == SelectType.Trade) {
			this.TradeLoaded();
		} else if (this.params.type == SelectType.Stock) {
			this.StockLoaded();
		}
	}

	//搜索框变化处理
	_onChangeSearch = text => {
		let listdata = [];
		if (text.length > 0) {
			if (
				this.params.type == SelectType.Steel ||
				this.params.type == SelectType.Trade ||
				this.params.type == SelectType.Stock
			) {
				//中文 拼音
				for (let i = 0; i < this.state.list.length; i++) {
					if (
						this.state.list[i].name.indexOf(text) >= 0 ||
						this.state.list[i].pinyin.indexOf(text) >= 0
					) {
						listdata.push(this.state.list[i]);
					}
				}
			}
			this.setState({ list: listdata, searchKey: text });
		} else {
			this.setState({ list: this.origindata, searchKey: "" }); //还原原始数据
		}
	};

	//加载钢厂数据
	async SteelLoaded() {
		let listdata = await _getSteel();
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				if (this.params.steel.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}
	//加载品名数据
	async TradeLoaded() {
		let listdata = await _getTrade(this.params.stid);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				if (this.params.trade.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	//加载库存数据
	async StockLoaded() {
		let listdata = await _getStock();
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				if (this.params.stock.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	ItemPress = item => {
		Keyboard.dismiss();
		if (this.params.type == SelectType.Steel) {
			//钢厂选择
			event.Send(event.Events.tool.steelSelect, item);
			this.nav.goBack();
		} else if (this.params.type == SelectType.Trade) {
			//品名选择
			event.Send(event.Events.tool.tradeSelect, item);
			this.nav.goBack();
		} else if (this.params.type == SelectType.Stock) {
			//库存选择
			event.Send(event.Events.tool.stockSelect, item);
			this.nav.goBack();
		}
	};

	//模板选择
	createListItem = ({ item }) => {
		return (
			<ListdatatItem
				ItemPress={this.ItemPress}
				data={item}
				type={this.params.type}
			/>
		);
	};

	render() {
		return (
			<View style={{ backgroundColor: "#f3f3f3" }}>
				<View
					style={{
						flexDirection: "row",
						margin: 5,
						backgroundColor: "#fff"
					}}
				>
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center"
						}}
					>
						<Image
							style={{ width: 16, height: 16 }}
							source={image.newsimages.search}
						/>
					</View>
					<TextInput
						style={{
							flex: 9,
							color: "#5c5c5c",
							fontSize: 12,
							padding: 10,
							paddingBottom: 10
						}}
						placeholder={this.state.placeholder}
						placeholderTextColor="#808080"
						autoFocus={false}
						underlineColorAndroid="transparent"
						onChangeText={this._onChangeSearch}
						value={this.state.searchKey}
					/>
				</View>
				<FlatList
					keyboardShouldPersistTaps="always"
					style={{
						height:
							Platform.OS == "ios" ? height - 105 : height - 140
					}}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={_itemSeparator}
				/>
			</View>
		);
	}
}

//列表分割线控件
let _itemSeparator = () => {
	return <View style={{ height: 1, backgroundColor: "#F2F2F2" }} />;
};

//获取钢厂
let _getSteel = async function() {
	let result = await net.ApiPost("tools", "GetCumulativeSteel", {});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/**
 * 获取品名
 *stid 钢厂id
 */
let _getTrade = async function(stid) {
	let result = await net.ApiPost("tools", "GetCumulativeTrade", {
		stid: stid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//获取库存
let _getStock = async function() {
	let result = await net.ApiPost("storehouse", "GetStoreHouse", {});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//列表模板
class ListdatatItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};
	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress}>
				<View
					style={{
						flexDirection: "row",
						paddingVertical: 10,
						paddingHorizontal: 12,
						height: 40,
						backgroundColor: "#fff"
					}}
				>
					<Text
						style={{
							fontSize: 14,
							color: "#5c5c5c",
							paddingLeft: 10
						}}
					>
						{this.props.data.name}
					</Text>
					{this.props.data.visible ? (
						<View
							style={{
								position: "absolute",
								right: 20,
								top: 8
							}}
						>
							<Image
								style={{ height: 24, width: 24 }}
								source={image.tool.select_check}
							/>
						</View>
					) : (
						<View />
					)}
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
