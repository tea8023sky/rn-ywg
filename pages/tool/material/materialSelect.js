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
	Keyboard,
	Alert,
	Platform
} from "react-native";
import Header from "../../header";
import skin from "../../../style";
import image from "../../../logic/image";
import net from "../../../logic/net";
import PageHelper from "../../../logic/pageHelper";
import Icon from 'react-native-vector-icons/Ionicons';
//获取屏幕宽高
let { width, height } = Dimensions.get("window");

//选择类型 钢厂 品名 规格
export class SelectType {
	static Steel = "Steel"; //钢厂
	static Trade = "Trade"; //品名
	static Standard = "Standard"; // 规格
}
/**
 * 材质书 钢厂 品名 规格 选择界面
 *
 * @author NongHuaQiang
 * @export
 * @class MaterialSelect
 * @extends {Component}
 */
export default class MaterialSelect extends Component {
	static navigationOptions = ({ navigation, screenProps }) => {
		// headerTitle: navigation.state.params.title
		return {
			headerTitle: navigation.state.params.title,
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
			list: [],
			searchKey: "",
			placeholder: "输入中文名称或拼音"
		};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.origindata = []; //原始数据，搜索用
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
		if (this.params.selecttype == SelectType.Steel) {
			this.SteelLoaded();
		} else if (this.params.selecttype == SelectType.Trade) {
			this.TradeLoaded();
			PageHelper.pushPageKey("tradeSelect", this.nav.state.key);
		} else if (this.params.selecttype == SelectType.Standard) {
			PageHelper.pushPageKey("standardSelect", this.nav.state.key);
			this.setState({ placeholder: "输入规格" });
			this.Standardoaded();
		}
	}

	//搜索框变化处理
	_onChangeSearch = text => {
		let listdata = [];
		if (text.length > 0) {
			for (let i = 0; i < this.state.list.length; i++) {
				if (this.params.selecttype == SelectType.Standard) {
					//规格搜索content字段
					if (this.state.list[i].content.indexOf(text) >= 0) {
						listdata.push(this.state.list[i]);
					}
				} else {
					//钢厂品名搜索 中文 拼音 name pinyin
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
		let listdata = await _getSteel(this.params.type);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				listdata[i].visible = false;
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}
	//加载品名
	async TradeLoaded() {
		let listdata = await _getTrade(this.params.type, this.params.steel.id);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				listdata[i].visible = false;
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	//加载规格
	async Standardoaded() {
		let listdata = await _getStandard(
			this.params.type,
			this.params.steel.id,
			this.params.trade.id
		);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = "k" + listdata[i].id;
				listdata[i].visible = false;
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	ItemPress = item => {
		let listData=this.state.list;
		for(let i=0;i<listData.length;i++){
			if (this.params.selecttype == SelectType.Standard) {
				if(listData[i].content == item.content){
					listData[i].visible=true;
					listData[i].key = "ktrue" + listData[i].id;
				}else{
					listData[i].visible=false;
					listData[i].key = "k" + listData[i].id;
				}
			}else{
				if(listData[i].name == item.name){
					listData[i].visible=true;
					listData[i].key = "ktrue" + listData[i].id;
				}else{
					listData[i].visible=false;
					listData[i].key = "k" + listData[i].id;
				}
			}
		}
		this.setState({ list: listData});
		Keyboard.dismiss();
		if (this.params.selecttype == SelectType.Steel) {
			//点击钢厂选择
			this.nav.navigate("materialSelect", {
				title: "选择品名",
				selecttype: SelectType.Trade,
				type: this.params.type,
				steel: item
			});
		} else if (this.params.selecttype == SelectType.Trade) {
			//点击品名选择
			if (this.params.type == 2) {
				//型材材质书没有选择规格
				this.nav.navigate("materialMain", {
					title: "材质书",
					type: this.params.type,
					steel: this.params.steel,
					trade: item
				});
			} else {
				this.nav.navigate("materialSelect", {
					title: "选择规格",
					selecttype: SelectType.Standard,
					type: this.params.type,
					steel: this.params.steel,
					trade: item
				});
			}
		} else if (this.params.selecttype == SelectType.Standard) {
			//规格选择
			this.nav.navigate("materialMain", {
				title: "材质书",
				type: this.type,
				steel: this.params.steel,
				trade: this.params.trade,
				standard: item
			});
		}
	};

	//模板选择
	createListItem = ({ item }) => {
		return (
			<ListdatatItem
				ItemPress={this.ItemPress}
				data={item}
				type={this.params.selecttype}
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
						//onFocus={this._onFocuslizhong}
						//onBlur={this._onBlurlizhong}
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
let _getSteel = async function(type) {
	let result = await net.ApiPost("texture", "GetOfferSteelByType", {
		type: type
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/*获取品名
*stid 钢厂id
*/
let _getTrade = async function(type, stid) {
	let result = await net.ApiPost("texture", "GetOfferTradeByType", {
		type: type,
		stid: stid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/*获取规格
*stid 钢厂id
*tid 品名id
*/
let _getStandard = async function(type, stid, tid) {
	let result = await net.ApiPost("texture", "GetTextureStandardByType", {
		type: type,
		stid: stid,
		tid: tid
	});
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

	//选择显示的字段
	_Selectcontent = type => {
		if (type == SelectType.Standard) {
			//规格显示content
			return this.props.data.content;
		} else {
			return this.props.data.name; //钢厂品名显示name
		}
	};
	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress}>
				<View
					style={{
						flexDirection: "row",
						//justifyContent: 'center',
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
						{this._Selectcontent(this.props.type)}
					</Text>
					{this.props.data.visible ? (
						<View
							style={{
								position: 'absolute',
								right: 20,
								top: 8
							}}
						>
							<Image style={{ height: 24, width: 24 }} source={image.tool.select_check} />
						</View>
					) : (
						<View />
					)}
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
