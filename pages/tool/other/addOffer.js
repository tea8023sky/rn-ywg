import React, { Component } from "react";
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
	Alert,
	Keyboard
} from "react-native";
import image from "../../../logic/image";
import event from "../../../logic/event";
import net from "../../../logic/net";
import cache from "../../../logic/cache";
import config from "../../../config";
import Toast from "react-native-root-toast";
import skin from "../../../style";
import Icon from 'react-native-vector-icons/Ionicons';

//选择类型 钢厂 品名 规格
export class SelectType {
	static Steel = "Steel"; //钢厂
	static Trade = "Trade"; //品名
	static Stock = "stock"; // 库房
}

//获取屏幕宽高
let { width, height } = Dimensions.get("window");
/**
 * 添加报价单
 * @author zhangchao
 * @export
 * @class AddOffer
 * @extends {Component}
 */
export default class AddOffer extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "报价单",
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
						navigation.state.params.savaAddOffer();
					}}
				>
					<View>
						<Text style={{ color: "#FFF", paddingRight: 10 }}>
							完成
						</Text>
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};

	constructor(props) {
		super(props);
		this.state = {
			steel: {}, //钢厂
			trade: {}, //品名
			stock: {}, //库房
			standard: "", //规格
			price: "", //单价
			inportprice: "" //输入单价
		};
		this.data = {
			time: null
		};
		this.nav = this.props.navigation;
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
		//订阅选择钢厂事件
		event.Sub(this, event.Events.tool.steelSelect, this.steelSelected);
		//订阅选择品名事件
		event.Sub(this, event.Events.tool.tradeSelect, this.tradeSelected);
		//订阅选择库房事件
		event.Sub(this, event.Events.tool.stockSelect, this.stockSelected);
		this.props.navigation.setParams({ savaAddOffer: this._savaAddOffer });
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}

	_savaAddOffer = () => {
		//防止多次点击“完成”按钮重复提交
		let nowTime = new Date().getTime();
		if (!this.data.time) {
			this.data.time = nowTime;
		} else {
			let time = nowTime - this.data.time;
			this.data.time = nowTime;
			if (time < 2000) {
				return;
			}
		}
		if (Object.keys(this.state.steel).length == 0) {
			Toast.show("请选择钢厂", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (Object.keys(this.state.trade).length == 0) {
			Toast.show("请选择品名", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (Object.keys(this.state.stock).length == 0) {
			Toast.show("请选择库房", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (this.state.standard.length == 0) {
			Toast.show("请输入规格", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (this.state.price.length > 0) {
			if (isNaN(this.state.price)) {
				Toast.show("请输入正确的单价", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return;
			}
		}
		event.Send(event.Events.tool.saveOffer, this.state);
		this.nav.goBack();
	};
	//选择钢厂
	_onPressSteel = () => {
		Keyboard.dismiss();
		this.nav.navigate("addOfferSelect", {
			title: "选择钢厂",
			type: SelectType.Steel,
			steel: this.state.steel
		});
	};

	//选择品名
	_onPressTrade = () => {
		Keyboard.dismiss();
		if (this.state.steel.id) {
			this.nav.navigate("addOfferSelect", {
				title: "选择品名",
				type: SelectType.Trade,
				stid: this.state.steel.id,
				trade: this.state.trade
			});
		} else {
			Toast.show("请选择钢厂", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};
	//选择库房
	_onPressStandard = () => {
		Keyboard.dismiss();
		if (this.state.steel.id) {
			if (this.state.trade.id) {
				this.nav.navigate("addOfferSelect", {
					title: "选择库房",
					type: SelectType.Stock,
					stid: this.state.steel.id,
					tid: this.state.trade.id,
					stock: this.state.stock
				});
			} else {
				Toast.show("请选择品名", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			Toast.show("请选择钢厂", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//选择钢厂后返回的数据
	steelSelected = steel => {
		this.setState({
			steel: steel,
			trade: {},
			stock: {}
		});
	};
	//选择品名后返回的数据
	tradeSelected = trade => {
		this.setState({ trade: trade, stock: {} });
	};

	//选择库存后返回的数据
	stockSelected = stock => {
		this.setState({ stock: stock });
	};

	render() {
		return (
			<ScrollView
				style={{ backgroundColor: "#fff" }}
				keyboardShouldPersistTaps={"handled"}
			>
				<View style={{ backgroundColor: "#fff", flex: 1 }}>
					<TouchableWithoutFeedback onPress={this._onPressSteel}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "center",
								height: 40,
								padding: 10
							}}
						>
							<Text
								style={{
									color: "#999999",
									fontSize: 14,
									flex: 2
								}}
							>
								钢厂
							</Text>
							<Text
								style={{
									color: "#5c5c5c",
									fontSize: 14,
									flex: 8,
									textAlign: "right",
									paddingRight: 10
								}}
							>
								{this.state.steel.name}
							</Text>
							<Image
								style={{
									width: 16,
									height: 16,
									paddingRight: 10
								}}
								source={image.tool.next}
							/>
						</View>
					</TouchableWithoutFeedback>
					<View style={{ height: 1, backgroundColor: "#f3f3f3" }} />
					<TouchableWithoutFeedback onPress={this._onPressTrade}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "center",
								height: 40,
								padding: 10
							}}
						>
							<Text
								style={{
									color: "#999999",
									fontSize: 14,
									flex: 2
								}}
							>
								品名
							</Text>
							<Text
								style={{
									color: "#5c5c5c",
									fontSize: 14,
									flex: 8,
									textAlign: "right",
									paddingRight: 10
								}}
							>
								{this.state.trade.name}
							</Text>
							<Image
								style={{
									width: 16,
									height: 16,
									paddingRight: 10
								}}
								source={image.tool.next}
							/>
						</View>
					</TouchableWithoutFeedback>
					<View style={{ height: 1, backgroundColor: "#f3f3f3" }} />
					<TouchableWithoutFeedback onPress={this._onPressStandard}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "center",
								height: 40,
								padding: 10
							}}
						>
							<Text
								style={{
									color: "#999999",
									fontSize: 14,
									flex: 2
								}}
							>
								库房
							</Text>
							<Text
								style={{
									color: "#5c5c5c",
									fontSize: 14,
									flex: 8,
									textAlign: "right",
									paddingRight: 10
								}}
							>
								{this.state.stock.name}
							</Text>
							<Image
								style={{
									width: 16,
									height: 16,
									paddingRight: 10
								}}
								source={image.tool.next}
							/>
						</View>
					</TouchableWithoutFeedback>
					<View style={{ height: 1, backgroundColor: "#f3f3f3" }} />
					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							padding: 10,
							height: 40
						}}
					>
						<Text
							style={{ flex: 1, fontSize: 14, color: "#999999" }}
						>
							规格
						</Text>

						<TextInput
							style={{ flex: 8, fontSize: 14, padding: 0 }}
							onChangeText={text => {
								if (text.length > 15) {
									this.setState({
										standard: text.substring(0, 15)
									});
								} else {
									this.setState({ standard: text });
								}
							}}
							value={this.state.standard}
							placeholder="输入规格"
							placeholderTextColor="#808080"
							autoFocus={false}
							underlineColorAndroid="transparent"
						/>
					</View>
					<View style={{ height: 1, backgroundColor: "#f3f3f3" }} />
					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							padding: 10,
							height: 40
						}}
					>
						<Text
							style={{ flex: 1, fontSize: 14, color: "#999999" }}
						>
							单价
						</Text>

						<TextInput
							style={{ flex: 8, fontSize: 14, padding: 0 }}
							onChangeText={text => {
								//最多保留2位小数，长度不能超过10位
								if (
									/^\d{0,10}(\.\d{1,2})?$/.test(
										Number(text)
									) &&
									text.length <= 10
								) {
									this.setState({ price: text });
								}
							}}
							keyboardType="numeric"
							value={this.state.price}
							placeholder="输入单价"
							placeholderTextColor="#808080"
							autoFocus={false}
							underlineColorAndroid="transparent"
						/>
					</View>
					<View style={{ height: 1, backgroundColor: "#f3f3f3" }} />
				</View>
			</ScrollView>
		);
	}
}
